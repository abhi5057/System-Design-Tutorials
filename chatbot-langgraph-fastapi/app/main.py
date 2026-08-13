from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from cachetools import TTLCache
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langgraph.graph import StateGraph, START, END
from typing import TypedDict
from app.db import init_db, get_user_profile, update_user_profile
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="LangGraph Chatbot API")

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

# Define LangGraph State
class GraphState(TypedDict):
    prompt: str
    meaning: str
    summary: str

# Node functions
def extract_meaning(state: GraphState):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = PromptTemplate.from_template(
        "Analyze the following user prompt. What is the core meaning or intent?\n"
        "User Prompt: {prompt}\n"
        "Meaning:"
    )
    chain = prompt | llm
    res = chain.invoke({"prompt": state["prompt"]})
    return {"meaning": res.content}

def generate_summary(state: GraphState):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = PromptTemplate.from_template(
        "Summarize the following prompt in a short phrase suitable for a user profile tag:\n"
        "User Prompt: {prompt}\n"
        "Summary:"
    )
    chain = prompt | llm
    res = chain.invoke({"prompt": state["prompt"]})
    return {"summary": res.content}

# Build Graph
builder = StateGraph(GraphState)
builder.add_node("extract_meaning", extract_meaning)
builder.add_node("generate_summary", generate_summary)
builder.add_edge(START, "extract_meaning")
builder.add_edge("extract_meaning", "generate_summary")
builder.add_edge("generate_summary", END)
orchestrator_graph = builder.compile()

@app.on_event("startup")
async def startup_event():
    init_db()
    if not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = "sk-dummy-key"

def process_batch_profile_updates():
    """Background task to process queued profile updates"""
    global profile_update_queue
    if not profile_update_queue:
        return

    updates_to_process = list(profile_update_queue)
    profile_update_queue.clear()

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    merge_prompt = PromptTemplate.from_template(
        "Current Profile Summary: {current_summary}\n"
        "New Interactions: {new_interactions}\n"
        "Please provide an updated, unified summary of the user's profile and interests based on both the old summary and the new interactions."
    )

    user_updates = {}
    for update in updates_to_process:
        uid = update["user_id"]
        if uid not in user_updates:
            user_updates[uid] = []
        user_updates[uid].append(update["summary"])

    for user_id, summaries in user_updates.items():
        current_summary = get_user_profile(user_id)
        new_interactions = "\n".join(summaries)

        try:
            chain = merge_prompt | llm
            result = chain.invoke({"current_summary": current_summary, "new_interactions": new_interactions})
            update_user_profile(user_id, result.content)
        except Exception as e:
            print(f"Error merging profile for {user_id}: {e}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    cache_key = f"{request.user_id}:{request.prompt}"

    # 1. Check TTL Cache
    if cache_key in prompt_cache:
        cached_result = prompt_cache[cache_key]
        return ChatResponse(meaning=cached_result["meaning"], summary=cached_result["summary"], cached=True)

    # 2. Run LangGraph Orchestrator
    try:
        # LangSmith tracing works automatically if LANGCHAIN_TRACING_V2=true is set in the environment
        result_state = await orchestrator_graph.ainvoke({"prompt": request.prompt})
        meaning_text = result_state["meaning"]
        summary_text = result_state["summary"]
    except Exception as e:
        print(f"Graph Error: {e}")
        meaning_text = f"Mock Meaning for: {request.prompt}"
        summary_text = f"Mock Summary for: {request.prompt}"

    # 3. Cache the response
    prompt_cache[cache_key] = {"meaning": meaning_text, "summary": summary_text}

    # 4. Queue profile update and schedule background processing
    profile_update_queue.append({"user_id": request.user_id, "summary": summary_text})

    if len(profile_update_queue) >= 1:
        background_tasks.add_task(process_batch_profile_updates)

    return ChatResponse(meaning=meaning_text, summary=summary_text, cached=False)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
