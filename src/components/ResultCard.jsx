import { useState } from 'react'

export default function ResultCard({
  answer,
  edition,
  personality,
  source,
  provider,
  onReAsk,
  lastQuery
}) {
  const [copied, setCopied] = useState(false)
  const [reactions, setReactions] = useState({
    fire: 14,
    skull: 42,
    cry: 29,
    brain: 9
  })
  const [userReacted, setUserReacted] = useState({})

  function handleCopy() {
    const text = `IDK Answer for: "${lastQuery}"\n\n${answer.title}\n${answer.snippet}\n\n${answer.verdict || ''}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  function handleReaction(type) {
    if (userReacted[type]) return
    setUserReacted(prev => ({ ...prev, [type]: true }))
    setReactions(prev => ({ ...prev, [type]: prev[type] + 1 }))
  }

  const stats = answer.stats || { usefulness: '0.2%', confidence: '100%', brainDrain: '88%' }

  const personalityLabels = {
    simple: '💡 Simple & Clear',
    savage: '🔥 Funny Roast',
    genz: '💀 Gen-Z Vibe',
    professor: '🧐 Funny Teacher',
    corporate: '💼 Tired Office Worker',
    mystic: '🔮 Cosmic Stars'
  }

  const providerLabel = source === 'agent'
    ? provider === 'gemini'
      ? '✨ Google Gemini AI'
      : '🤖 Claude AI'
    : '⚡ Smart Engine'

  return (
    <article className="answer-card" tabIndex="-1">
      {/* Ambient gradient glow backdrop */}
      <div className="card-ambient-glow" />

      <div className="answer-top">
        <div className="badge-row">
          <span className="pill-badge pill-verified">✦ Confidently Useless</span>
          <span className="pill-badge pill-mode">{personalityLabels[personality] || '🔥 Savage'}</span>
          <span className="pill-badge pill-edition">#{String(edition).padStart(2, '0')}</span>
        </div>
        <span className="source-label">
          {providerLabel}
        </span>
      </div>

      <div className="orb-wrap">
        <div className="orb" aria-hidden="true">
          <span>✦</span>
        </div>
      </div>

      <h2 className="answer-title">{answer.title}</h2>

      <p className="answer-copy">{answer.snippet}</p>

      {answer.verdict && (
        <div className="verdict-banner">
          <span className="verdict-icon">⚖️</span>
          <span className="verdict-text">{answer.verdict}</span>
        </div>
      )}

      {/* Comedic Metrics Meters */}
      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-header">
            <span>Usefulness</span>
            <b className="stat-val">{stats.usefulness || '0.1%'}</b>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill fill-low"
              style={{ width: `${Math.min(25, parseFloat(stats.usefulness) * 4 || 3)}%` }}
            />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <span>Confidence</span>
            <b className="stat-val stat-high">{stats.confidence || '100%'}</b>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill fill-high"
              style={{ width: `${parseFloat(stats.confidence) || 100}%` }}
            />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <span>Brain Drain</span>
            <b className="stat-val stat-drain">{stats.brainDrain || '85%'}</b>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill fill-drain"
              style={{ width: `${parseFloat(stats.brainDrain) || 85}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Reactions */}
      <div className="reaction-bar">
        <span className="reaction-label">React to this take:</span>
        <div className="reaction-buttons">
          <button
            className={`reaction-btn ${userReacted.fire ? 'active' : ''}`}
            onClick={() => handleReaction('fire')}
            title="Fire roast"
          >
            <span className="reaction-emoji">🔥</span>
            <span className="reaction-count">{reactions.fire}</span>
          </button>
          <button
            className={`reaction-btn ${userReacted.skull ? 'active' : ''}`}
            onClick={() => handleReaction('skull')}
            title="Cooked"
          >
            <span className="reaction-emoji">💀</span>
            <span className="reaction-count">{reactions.skull}</span>
          </button>
          <button
            className={`reaction-btn ${userReacted.cry ? 'active' : ''}`}
            onClick={() => handleReaction('cry')}
            title="Emotional damage"
          >
            <span className="reaction-emoji">😭</span>
            <span className="reaction-count">{reactions.cry}</span>
          </button>
          <button
            className={`reaction-btn ${userReacted.brain ? 'active' : ''}`}
            onClick={() => handleReaction('brain')}
            title="Negative IQ"
          >
            <span className="reaction-emoji">🧠</span>
            <span className="reaction-count">{reactions.brain}</span>
          </button>
        </div>
      </div>

      <div className="answer-bottom">
        <div className="bottom-left">
          <button
            className={`action-btn copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied Roast!' : '📋 Share / Copy'}
          </button>
        </div>

        <button className="action-btn reask-btn" onClick={onReAsk}>
          <span>Ask again</span>
          <b className="spin-on-hover">↻</b>
        </button>
      </div>
    </article>
  )
}

