import { useState } from 'react'
import axios from 'axios'
import './App.css'

interface ChatResponse {
  meaning: string;
  summary: string;
  cached: boolean;
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [userId, setUserId] = useState('user123')
  const [backendType, setBackendType] = useState<'langchain' | 'langgraph'>('langchain')
  const [response, setResponse] = useState<ChatResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)

    // Port 8000 for LangChain API, Port 8001 for LangGraph API
    const port = backendType === 'langchain' ? 8000 : 8001
    const apiUrl = `http://localhost:${port}/api/chat`

    try {
      const res = await axios.post<ChatResponse>(apiUrl, {
        user_id: userId,
        prompt: prompt
      })
      setResponse(res.data)
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>AI Chatbot Orchestrator UI</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <label>
          <strong>User ID:</strong>
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>

        <label>
          <strong>Backend Orchestrator:</strong>
          <select
            value={backendType}
            onChange={(e) => setBackendType(e.target.value as 'langchain' | 'langgraph')}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="langchain">LangChain (FastAPI)</option>
            <option value="langgraph">LangGraph (FastAPI)</option>
          </select>
        </label>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask me anything..."
          style={{ flexGrow: 1, padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', fontSize: '16px' }}>
          {loading ? 'Processing...' : 'Send'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red' }}>
          <strong>Error:</strong> {error}
          <br/>
          <em>Note: Make sure to start the {backendType} FastAPI server before submitting.</em>
        </div>
      )}

      {response && (
        <div style={{ textAlign: 'left', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
          <h3 style={{ marginTop: 0 }}>Response</h3>
          {response.cached && (
            <span style={{ backgroundColor: '#e0ffe0', color: 'darkgreen', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              ⚡ Served from TTL Cache
            </span>
          )}
          <p><strong>Extracted Meaning/Intent:</strong></p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{response.meaning}</p>

          <hr style={{ margin: '20px 0' }}/>

          <p><strong>Generated User Profile Summary:</strong></p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{response.summary}</p>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
            * This summary has been queued in the background to update your persistent profile in the SQLite database.
          </p>
        </div>
      )}
    </div>
  )
}

export default App
