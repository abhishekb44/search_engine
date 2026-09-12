import { useEffect, useRef, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import ResultCard from './components/ResultCard.jsx'
import Loader from './components/Loader.jsx'
import { generateFallbackResults } from './lib/fallbackResults.js'
import './App.css'

const PERSONALITIES = [
  { id: 'simple', label: '💡 Simple & Clear', desc: 'Easy plain English' },
  { id: 'savage', label: '🔥 Funny Roast', desc: 'Blunt & sarcastic' },
  { id: 'genz', label: '💀 Gen-Z Vibe', desc: 'Bro is cooked' },
  { id: 'professor', label: '🧐 Funny Teacher', desc: 'Simple silly lesson' },
  { id: 'corporate', label: '💼 Tired Office Worker', desc: 'Just go home' },
]

const QUICK_PROMPTS = [
  'Why do bugs only appear in demo?',
  'Why is the sky blue?',
  'How to become a billionaire by tomorrow?',
  'Is cereal technically soup?',
  'Why do cats judge us silently?',
  'Should I send that 2 AM text?'
]

const PARTICLE_COLORS = ['#c084fc', '#38bdf8', '#f472b6', '#34d399', '#fbbf24', '#818cf8']

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  top: `${(i * 13 + 5) % 94}%`,
  left: `${(i * 19 + 7) % 96}%`,
  size: `${(i % 3) * 2.5 + 3}px`,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  delay: `${(i * 0.4) % 4.5}s`,
  duration: `${6 + (i % 4) * 2.2}s`
}))

export default function App() {
  const [answer, setAnswer] = useState(null)
  const [lastQuery, setLastQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [source, setSource] = useState(null)
  const [edition, setEdition] = useState(0)
  const [personality, setPersonality] = useState('simple')
  const [searchInputValue, setSearchInputValue] = useState('')
  const [provider, setProvider] = useState(null)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  const answerRef = useRef(null)

  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [answer])

  function handleMouseMove(e) {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  async function handleSearch(query, activePersonality = personality) {
    const trimmed = query.trim()
    if (!trimmed) return

    setIsLoading(true)
    setAnswer(null)
    setLastQuery(trimmed)
    setSearchInputValue(trimmed)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, personality: activePersonality }),
      })

      const data = await response.json()

      if (response.ok && Array.isArray(data.results) && data.results.length) {
        setAnswer(data.results[0])
        setSource('agent')
        setProvider(data.provider || 'gemini')
      } else {
        // Graceful fallback to smart query-aware generator
        const localResults = generateFallbackResults(trimmed, 1, activePersonality)
        setAnswer(localResults[0])
        setSource('fallback')
        setProvider('offline')
      }
    } catch {
      const localResults = generateFallbackResults(trimmed, 1, activePersonality)
      setAnswer(localResults[0])
      setSource('fallback')
      setProvider('offline')
    } finally {
      setEdition((val) => val + 1)
      setIsLoading(false)
    }
  }

  function handlePersonalityChange(newPersonality) {
    setPersonality(newPersonality)
    if (lastQuery) {
      handleSearch(lastQuery, newPersonality)
    }
  }

  function handlePromptClick(promptText) {
    setSearchInputValue(promptText)
    handleSearch(promptText, personality)
  }

  return (
    <main className="app-shell" onMouseMove={handleMouseMove}>
      {/* Moving Ambient Gradient & Aurora Layers */}
      <div className="gradient-background-flow" />
      <div className="light-sweep-beam" />
      <div className="cyber-grid" />
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />
      <div className="aurora aurora-four" />
      <div className="aurora aurora-center" />

      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="mouse-spotlight"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`
        }}
      />

      {/* Floating Sparkles & Particles */}
      <div className="particles-container" aria-hidden="true">
        {PARTICLES.map((pt) => (
          <span
            key={pt.id}
            className="star-particle"
            style={{
              top: pt.top,
              left: pt.left,
              width: pt.size,
              height: pt.size,
              backgroundColor: pt.color,
              boxShadow: `0 0 10px ${pt.color}, 0 0 20px ${pt.color}`,
              animationDelay: pt.delay,
              animationDuration: pt.duration
            }}
          />
        ))}
      </div>

      <div className="shell-container">
        {/* Top Header */}
        <nav className="topbar">
          <a className="brand" href="/">
            <span className="brand-icon">i</span>
            <span className="brand-text">idk<b>.exe</b></span>
          </a>
          <div className="topbar-meta">
            <span className="status-indicator">
              <span className="status-dot" />
              0% Useful • 100% Confident
            </span>
          </div>
        </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="badge-glow">
          <span className="sparkle">✦</span>
          <span>THE UNHELPFUL ANSWER ENGINE</span>
        </div>

        <h1 className="hero-heading">
          Ask anything.<br />
          <em className="gradient-text">Get roasted.</em>
        </h1>

        <p className="intro">
          Meaningful enough to relate. Absurd enough to question your life choices.
        </p>

        {/* Personality Mode Selector */}
        <div className="personality-container" aria-label="Select roast personality">
          <span className="personality-label">Mode:</span>
          <div className="personality-pills">
            {PERSONALITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`personality-pill ${personality === p.id ? 'active' : ''}`}
                onClick={() => handlePersonalityChange(p.id)}
                title={p.desc}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-wrapper">
          <SearchBar
            onSearch={(q) => handleSearch(q, personality)}
            isLoading={isLoading}
            currentQuery={searchInputValue}
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="suggestions-container">
          <span className="suggestions-title">Try asking:</span>
          <div className="suggestions-grid">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => handlePromptClick(prompt)}
              >
                <span>{prompt}</span>
                <b className="chip-arrow">↗</b>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results / Status Section */}
      <section className="content" aria-live="polite" ref={answerRef}>
        {isLoading && <Loader />}

        {!isLoading && answer && (
          <ResultCard
            answer={answer}
            edition={edition}
            personality={personality}
            source={source}
            provider={provider}
            onReAsk={() => handleSearch(lastQuery, personality)}
            lastQuery={lastQuery}
          />
        )}

        {!isLoading && !answer && (
          <div className="empty-state">
            <div className="empty-icon-ring">
              <span className="empty-sparkle">✦</span>
            </div>
            <h3>Your next unnecessary thought awaits</h3>
            <p>
              Type any question above or tap one of the suggested prompts to receive
              an unapologetically confident verdict.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-left">
          <span>© 2026 IDK.exe</span>
          <span className="separator">•</span>
          <span>Crafted with misplaced confidence & vibrant pixels</span>
        </div>
        <div className="footer-right">
          <span>Zero rights reserved. Take with a grain of salt.</span>
        </div>
      </footer>
      </div>
    </main>
  )
}

