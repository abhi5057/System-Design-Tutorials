import { useState, useReducer, useMemo, useCallback, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPeople, type PersonWithDetails } from './api'
import './App.css'

// Reducer for some local UI state (just to demonstrate useReducer)
type ViewState = { viewMode: 'table' | 'cards' }
type ViewAction = { type: 'TOGGLE_VIEW' }
const viewReducer = (state: ViewState, action: ViewAction): ViewState => {
  switch (action.type) {
    case 'TOGGLE_VIEW':
      return { viewMode: state.viewMode === 'table' ? 'cards' : 'table' }
    default:
      return state
  }
}

function App() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()

  const [{ viewMode }, dispatchView] = useReducer(viewReducer, { viewMode: 'table' })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['people', page],
    queryFn: () => fetchPeople(page),
  })

  // useMemo: Filtering characters based on search term (only re-computes if data or searchTerm changes)
  const filteredCharacters = useMemo(() => {
    if (!data?.results) return []
    return data.results.filter(char =>
      char.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  // useCallback: Handle search input change without re-creating the function on every render
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // useTransition: prioritize typing over heavy re-rendering
    startTransition(() => {
      setSearchTerm(e.target.value)
    })
  }, [])

  if (isLoading) return <div>Loading... (Fetching characters, films, and vehicles...)</div>
  if (isError) return <div>Error: {(error as Error).message}</div>

  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1>Star Wars Characters</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search characters..."
          onChange={handleSearchChange}
          style={{ padding: '5px' }}
        />
        {isPending && <span>Searching...</span>}
        <button onClick={() => dispatchView({ type: 'TOGGLE_VIEW' })}>
          Toggle View (Current: {viewMode})
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous Page
        </button>
        <span style={{ margin: '0 10px' }}>Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.next}
        >
          Next Page
        </button>
      </div>

      {viewMode === 'table' ? (
        <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Films</th>
              <th>Vehicles</th>
            </tr>
          </thead>
          <tbody>
            {filteredCharacters.map((char: PersonWithDetails) => (
              <tr key={char.name}>
                <td>{char.name}</td>
                <td>
                  {char.filmsDetails.length > 0 ? (
                    <ul>
                      {char.filmsDetails.map(film => (
                        <li key={film.url}>{film.title} (Ep {film.episode_id})</li>
                      ))}
                    </ul>
                  ) : 'None'}
                </td>
                <td>
                  {char.vehiclesDetails.length > 0 ? (
                    <ul>
                      {char.vehiclesDetails.map(vehicle => (
                        <li key={vehicle.url}>{vehicle.name} ({vehicle.model})</li>
                      ))}
                    </ul>
                  ) : 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredCharacters.map((char: PersonWithDetails) => (
            <div key={char.name} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
              <h3>{char.name}</h3>
              <p><strong>Films:</strong> {char.filmsDetails.map(f => f.title).join(', ') || 'None'}</p>
              <p><strong>Vehicles:</strong> {char.vehiclesDetails.map(v => v.name).join(', ') || 'None'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
