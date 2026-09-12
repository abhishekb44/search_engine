import { useEffect, useState } from 'react'

const lines = [
  'Consulting the void',
  'Asking a stranger on Reddit',
  'Translating logic into pure chaos',
  'Summoning misplaced confidence',
  'Checking if common sense applies',
  'Preparing a certified bad idea',
  'Synthesizing emotional damage'
]

export default function Loader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % lines.length)
    }, 650)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="loader-glow-wrap">
        <div className="gradient-spinner" />
        <div className="loader-center-orb">✦</div>
      </div>
      <div className="loader-text-box">
        <p className="loader-phrase">{lines[index]}</p>
        <div className="loader-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

