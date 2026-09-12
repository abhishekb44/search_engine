import { useEffect, useState } from 'react'

const PLACEHOLDERS = [
  'Ask a question, invite disappointment...',
  'Why do bugs only appear in demo?',
  'What is the meaning of life?',
  'Why is my coffee always cold?',
  'How to get rich by tomorrow morning?',
  'Should I send that 2 AM text?',
  'Search the unknowable...'
]

export default function SearchBar({ onSearch, isLoading, currentQuery = '' }) {
  const [value, setValue] = useState(currentQuery)
  const [prevPropQuery, setPrevPropQuery] = useState(currentQuery)
  const [placeholder, setPlaceholder] = useState(() => PLACEHOLDERS[0])

  if (currentQuery !== prevPropQuery) {
    setPrevPropQuery(currentQuery)
    setValue(currentQuery)
  }

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % PLACEHOLDERS.length
      setPlaceholder(PLACEHOLDERS[index])
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  function submit(event) {
    event.preventDefault()
    const query = value.trim()
    if (query && !isLoading) {
      onSearch(query)
    }
  }

  function handleClear() {
    setValue('')
  }

  return (
    <form className="search-form" onSubmit={submit}>
      <div className="search-icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="search-icon">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="22" y2="22" />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search query"
        autoComplete="off"
        autoFocus
      />

      {value && !isLoading && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={handleClear}
          aria-label="Clear query"
        >
          ✕
        </button>
      )}

      <button type="submit" className="search-submit-btn" disabled={isLoading || !value.trim()}>
        {isLoading ? (
          <span className="btn-spinner" />
        ) : (
          <>
            <span className="btn-text">Roast Me</span>
            <span className="btn-arrow">→</span>
          </>
        )}
      </button>
    </form>
  )
}

