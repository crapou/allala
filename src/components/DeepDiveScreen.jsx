import { useState, useEffect } from 'react'
import '../styles/deepdive.css'

const PROXY_URL = 'https://alstom-proxy.onrender.com'

const CATEGORY_META = {
  competitive_intelligence: { icon: '🔍', color: '#e17055', label: 'Competitive Intelligence' },
  market_opportunity: { icon: '🤝', color: '#00cec9', label: 'Market & Partnerships' },
  strategic_depth: { icon: '🧠', color: '#6c5ce7', label: 'Strategic Depth' },
}

export default function DeepDiveScreen({ folderData, aiFeedback, onComplete, onBack }) {
  const [questions, setQuestions] = useState(null)
  const [researchSummary, setResearchSummary] = useState(null)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [inputValue, setInputValue] = useState('')
  const [animating, setAnimating] = useState(false)

  // Fetch dynamic questions with web research
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
            elaboration: folderData.elaboration || '',
            trendComments: folderData.trendComments || {},
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to generate questions')

        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions)
          if (data.research) setResearchSummary(data.research)
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

  // === LOADING STATE ===
  if (loadingQuestions) {
    return (
      <section className="deepdive">
        <div className="dd-loading">
          <div className="dd-loading-orbs">
            <div className="dd-orb dd-orb-1" />
            <div className="dd-orb dd-orb-2" />
            <div className="dd-orb dd-orb-3" />
          </div>
          <h2 className="dd-loading-title">Researching your market…</h2>
          <p className="dd-loading-sub">
            AI is searching the web for competitors, partners, and market data related to your project
          </p>
          <div className="dd-loading-steps">
            <div className="dd-loading-step dd-step-active">
              <span className="dd-step-dot" />
              Searching competitors & similar solutions
            </div>
            <div className="dd-loading-step dd-step-pending">
              <span className="dd-step-dot" />
              Analyzing partnerships & market opportunities
            </div>
            <div className="dd-loading-step dd-step-pending">
              <span className="dd-step-dot" />
              Generating tailored questions
            </div>
          </div>
        </div>
      </section>
    )
  }

  // === ERROR STATE ===
  if (loadError || !questions) {
    return (
      <section className="deepdive">
        <div className="dd-error">
          <div className="dd-error-icon">⚠️</div>
          <h3 className="dd-error-title">Could not generate questions</h3>
          <p className="dd-error-msg">{loadError || 'An unexpected error occurred'}</p>
          <div className="dd-error-actions">
            <button className="dd-retry-btn" onClick={() => window.location.reload()}>
              🔄 Retry
            </button>
            <button className="dd-back-btn" onClick={onBack}>
              ← Go back
            </button>
          </div>
        </div>
      </section>
    )
  }

  // === MAIN VIEW ===
  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const progress = ((currentIndex + 1) / questions.length) * 100
  const meta = CATEGORY_META[current.category] || { icon: '💡', color: '#2f7bf6', label: 'Deep Dive' }

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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevQ = questions[currentIndex - 1]
      setInputValue(answers[prevQ.id] || '')
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <section className="deepdive">
      <div className="dd-inner">
        {/* Header */}
        <div className="dd-header fade-up">
          <div className="dd-badge">
            <span className="dd-badge-dot" />
            Market Research & Deep Dive
          </div>
        </div>

        {/* Progress */}
        <div className="dd-progress-wrap fade-up">
          <div className="dd-progress-track">
            <div className="dd-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="dd-progress-info">
            <span className="dd-progress-label">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="dd-progress-dots">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`dd-dot ${i < currentIndex ? 'dd-dot-done' : ''} ${i === currentIndex ? 'dd-dot-current' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className={`dd-card ${animating ? 'dd-card-exit' : 'dd-card-enter'}`}>
          {/* Category tag */}
          <div className="dd-tag" style={{ borderColor: meta.color, color: meta.color }}>
            <span className="dd-tag-icon">{meta.icon}</span>
            <span className="dd-tag-label">{meta.label}</span>
          </div>

          <h2 className="dd-title">{current.title}</h2>
          <p className="dd-subtitle">{current.subtitle}</p>

          <div className="dd-input-wrap">
            <textarea
              className="dd-input"
              rows={5}
              placeholder={current.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="dd-input-footer">
              <span className="dd-char-count">
                {inputValue.length > 0 ? `${inputValue.trim().split(/\s+/).length} words` : ''}
              </span>
              <button
                className="dd-send-btn"
                onClick={handleSend}
                disabled={!inputValue.trim()}
              >
                {isLast ? '✨ Complete Deep Dive' : 'Next →'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="dd-footer">
          <div className="dd-footer-left">
            {currentIndex > 0 && (
              <button className="dd-nav-link" onClick={handlePrevious}>
                ← Previous
              </button>
            )}
          </div>
          <button className="dd-nav-link" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </section>
  )
}