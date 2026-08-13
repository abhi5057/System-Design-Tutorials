from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from cachetools import TTLCache
import asyncio
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.db import init_db, get_user_profile, update_user_profile
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="LangChain Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TTL Cache: max 1000 items, expires in 5 minutes (300 seconds)
prompt_cache = TTLCache(maxsize=1000, ttl=300)

# In-memory queue for batch processing of profile updates
profile_update_queue = []

class ChatRequest(BaseModel):
    user_id: str
    prompt: str

class ChatResponse(BaseModel):
    meaning: str
    summary: str
    cached: bool

@app.on_event("startup")
async def startup_event():
    init_db()
    # Dummy API key for local execution without failing to initialize ChatOpenAI
    if not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = "sk-dummy-key"

def process_batch_profile_updates():
    """Background task to process queued profile updates"""
    global profile_update_queue
    if not profile_update_queue:
        return

    # Take current queue and clear it
    updates_to_process = list(profile_update_queue)
    profile_update_queue.clear()

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    merge_prompt = PromptTemplate.from_template(
        "Current Profile Summary: {current_summary}\n"
        "New Interactions: {new_interactions}\n"
        "Please provide an updated, unified summary of the user's profile and interests based on both the old summary and the new interactions."
    )

    # Group by user_id
    user_updates = {}
    for update in updates_to_process:
        uid = update["user_id"]
        if uid not in user_updates:
            user_updates[uid] = []
        user_updates[uid].append(update["summary"])

    for user_id, summaries in user_updates.items():
        current_summary = get_user_profile(user_id)
        new_interactions = "\n".join(summaries)

        # Merge using LLM
        chain = merge_prompt | llm
        try:
            result = chain.invoke({"current_summary": current_summary, "new_interactions": new_interactions})
            updated_summary = result.content
            update_user_profile(user_id, updated_summary)
        except Exception as e:
            print(f"Error merging profile for {user_id}: {e}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    cache_key = f"{request.user_id}:{request.prompt}"

    # 1. Check TTL Cache
    if cache_key in prompt_cache:
        cached_result = prompt_cache[cache_key]
        return ChatResponse(meaning=cached_result["meaning"], summary=cached_result["summary"], cached=True)

    # 2. Extract Meaning and Summarize using LangChain
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    extraction_prompt = PromptTemplate.from_template(
        "Analyze the following user prompt. What is the core meaning or intent?\n"
        "User Prompt: {prompt}\n"
        "Meaning:"
    )

    summary_prompt = PromptTemplate.from_template(
        "Summarize the following prompt in a short phrase suitable for a user profile tag:\n"
        "User Prompt: {prompt}\n"
        "Summary:"
    )

    try:
        meaning_chain = extraction_prompt | llm
        summary_chain = summary_prompt | llm

        # Use asyncio.gather and ainvoke to prevent blocking the event loop
        meaning_res, summary_res = await asyncio.gather(
            meaning_chain.ainvoke({"prompt": request.prompt}),
            summary_chain.ainvoke({"prompt": request.prompt})
        )

        meaning_text = meaning_res.content
        summary_text = summary_res.content

    except Exception as e:
        # Mock responses if no valid OpenAI key is provided (for demo purposes)
        print(f"LLM Error (using fallback): {e}")
        meaning_text = f"Mock Meaning for: {request.prompt}"
        summary_text = f"Mock Summary for: {request.prompt}"

    # 3. Cache the response
    prompt_cache[cache_key] = {"meaning": meaning_text, "summary": summary_text}

    # 4. Queue profile update and schedule background batch processing
    profile_update_queue.append({"user_id": request.user_id, "summary": summary_text})

    # For demo purposes, we process the batch immediately in the background
    # if the queue reaches a threshold, or just schedule it on every request.
    # A real production system might use a Celery/Redis periodic task.
    if len(profile_update_queue) >= 1: # Trigger immediately for the sake of demo
        background_tasks.add_task(process_batch_profile_updates)

    return ChatResponse(meaning=meaning_text, summary=summary_text, cached=False)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
