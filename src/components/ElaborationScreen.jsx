import { useState } from 'react'
import '../styles/elaboration.css'
import '../styles/feedback.css'

export default function ElaborationScreen({ feedback, onContinue, onBack }) {
  const concerns = feedback?.concerns || []
  const questions = feedback?.questions || []

  // answers keyed by "concern-0", "question-1", etc.
  const [answers, setAnswers] = useState({})

  const setAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleContinue = () => {
    const elaborations = []

    concerns.forEach((item, i) => {
      const answer = answers[`concern-${i}`]?.trim()
      if (answer) elaborations.push({ type: 'concern', item, answer })
    })

    questions.forEach((item, i) => {
      const answer = answers[`question-${i}`]?.trim()
      if (answer) elaborations.push({ type: 'question', item, answer })
    })

    onContinue(elaborations)
  }

  const filledCount = Object.values(answers).filter(v => v?.trim()).length
  const totalCount = concerns.length + questions.length

  return (
    <section className="elab fade-in">
      <div className="elab-inner">

        {/* Header */}
        <div className="elab-header fade-up">
          <div className="elab-badge">💬 Your Turn</div>
          <h2 className="elab-title">React to the Feedback</h2>
          <p className="elab-subtitle">
            Share your perspective on the points raised. This will enrich the next steps of your pitch analysis.
          </p>
          {filledCount > 0 && (
            <div className="elab-progress">
              {filledCount} / {totalCount} answered
            </div>
          )}
        </div>

        {/* Concerns */}
        {concerns.length > 0 && (
          <div className="elab-section fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="elab-section-header">
              <span className="elab-section-icon">⚠️</span>
              <h3 className="elab-section-title">Points to Address</h3>
              <span className="elab-section-hint">How do you plan to address these?</span>
            </div>
            <div className="elab-items">
              {concerns.map((concern, i) => (
                <div key={i} className="elab-item elab-item-concern">
                  <p className="elab-item-text">{concern}</p>
                  <div className="elab-input-wrap">
                    <textarea
                      className="elab-textarea"
                      placeholder="Your reaction or plan to address this…"
                      value={answers[`concern-${i}`] || ''}
                      onChange={e => setAnswer(`concern-${i}`, e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && (
          <div className="elab-section fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="elab-section-header">
              <span className="elab-section-icon">❓</span>
              <h3 className="elab-section-title">Questions to Consider</h3>
              <span className="elab-section-hint">Share your thoughts on these questions</span>
            </div>
            <div className="elab-items">
              {questions.map((question, i) => (
                <div key={i} className="elab-item elab-item-question">
                  <p className="elab-item-text">{question}</p>
                  <div className="elab-input-wrap">
                    <textarea
                      className="elab-textarea"
                      placeholder="Your answer or initial thoughts…"
                      value={answers[`question-${i}`] || ''}
                      onChange={e => setAnswer(`question-${i}`, e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="elab-actions fade-up" style={{ animationDelay: '0.3s' }}>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Feedback
          </button>
          <button className="folder-btn-continue" onClick={handleContinue}>
            <span>{filledCount > 0 ? 'Continue with reactions' : 'Skip & Continue'}</span>
            <span className="folder-btn-continue-arrow">→</span>
          </button>
        </div>

      </div>
    </section>
  )
}
