import { useState, useEffect } from 'react'
import '../styles/deepdive.css'

const PROXY_URL = 'https://alstom-proxy.onrender.com'

const CATEGORY_META = {
  feedback_followup: { icon: '🎯', color: '#2f7bf6' },
  trend_population: { icon: '🌏', color: '#6c5ce7' },
  trend_environment: { icon: '🌱', color: '#00cec9' },
  trend_geopolitics: { icon: '⚡', color: '#fdcb6e' },
  trend_technology: { icon: '🔮', color: '#e056fd' },
  implementation: { icon: '🔧', color: '#0984e3' },
}

export default function DeepDiveScreen({ folderData, aiFeedback, onComplete, onBack }) {
  const [questions, setQuestions] = useState(null)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [inputValue, setInputValue] = useState('')
  const [animating, setAnimating] = useState(false)

  // Fetch dynamic questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(PROXY_URL + '/api/deep-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: folderData.prompt,
            answers: folderData.answers,
            feedback: aiFeedback,
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to generate questions')
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions)
        } else {
          throw new Error('Invalid questions format')
        }
      } catch (err) {
        console.error('Deep questions error:', err)
        setLoadError(err.message)
      } finally {
        setLoadingQuestions(false)
      }
    }
    fetchQuestions()
  }, [folderData, aiFeedback])

  // Loading state
  if (loadingQuestions) {
    return (
      <section className="deepdive">
        <div className="dd-loading">
          <div className="dd-loading-orbs">
            <div className="dd-orb dd-orb-1" />
            <div className="dd-orb dd-orb-2" />
            <div className="dd-orb dd-orb-3" />
          </div>
          <h2 className="dd-loading-title">Analyzing your project against mega-trends…</h2>
          <p className="dd-loading-sub">The AI is finding the strongest connections between your idea and APAC's structural forces</p>
        </div>
      </section>
    )
  }

  // Error state
  if (loadError || !questions) {
    return (
      <section className="deepdive">
        <div className="dd-error">
          <div className="error-box">❌ {loadError || 'Failed to load questions'}</div>
          <button className="btn btn-secondary" onClick={onBack}>← Go back</button>
        </div>
      </section>
    )
  }

  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const progress = ((currentIndex + 1) / questions.length) * 100
  const meta = CATEGORY_META[current.category] || { icon: '💡', color: '#2f7bf6' }

  const handleSend = () => {
    if (!inputValue.trim()) return
    const newAnswers = { ...answers, [current.id]: inputValue.trim() }
    setAnswers(newAnswers)
    setInputValue('')

    if (isLast) {
      onComplete(newAnswers)
      return
    }

    setAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setAnimating(false)
    }, 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <section className="deepdive">
      <div className="dd-inner">
        {/* Progress */}
        <div className="dd-progress-track">
          <div className="dd-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="dd-progress-label">
          Deep Dive — Question {currentIndex + 1} of {questions.length}
        </div>

        {/* Question card */}
        <div className={`dd-card ${animating ? 'dd-card-exit' : 'dd-card-enter'}`}>
          {/* Category tag */}
          <div className="dd-tag" style={{ borderColor: meta.color, color: meta.color }}>
            <span>{meta.icon}</span>
            <span>{current.trendConnection || current.category}</span>
          </div>

          <h2 className="dd-title">{current.title}</h2>
          <p className="dd-subtitle">{current.subtitle}</p>

          <div className="dd-input-wrap">
            <textarea
              className="dd-input"
              rows={4}
              placeholder={current.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              className="dd-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              {isLast ? '✨ Complete Deep Dive' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="dd-footer">
          {currentIndex > 0 && (
            <button
              className="dd-nav-link"
              onClick={() => {
                const prevQ = questions[currentIndex - 1]
                setInputValue(answers[prevQ.id] || '')
                setCurrentIndex((prev) => prev - 1)
              }}
            >
              ← Previous
            </button>
          )}
          <button className="dd-nav-link" onClick={onBack}>
            Back to Trends
          </button>
        </div>
      </div>
    </section>
  )
}