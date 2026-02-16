import { useEffect, useState } from 'react'
import '../styles/feedback.css'

const PROXY_URL = 'https://alstom-proxy.onrender.com'

export default function FeedbackScreen({ folderData, onContinue, onBack }) {
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(PROXY_URL + '/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: folderData.prompt,
            answers: folderData.answers,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Analysis failed')
        }

        if (data.feedback) {
          setFeedback(data.feedback)
        } else if (data.rawText) {
          setFeedback({ raw: data.rawText })
        } else {
          throw new Error('No feedback received')
        }
      } catch (err) {
        console.error('Feedback error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [folderData])

  // Score color
  const getScoreColor = (score) => {
    if (score >= 8) return '#00cec9'
    if (score >= 6) return '#2f7bf6'
    if (score >= 4) return '#fdcb6e'
    return '#e17055'
  }

  return (
    <section className="feedback">
      <div className="feedback-inner">
        {/* Loading state */}
        {loading && (
          <div className="fb-loading">
            <div className="fb-loading-orb" />
            <h2 className="fb-loading-title">Analyzing your pitch…</h2>
            <p className="fb-loading-sub">Our AI advisor is reviewing your answers</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="fb-error">
            <div className="error-box">❌ {error}</div>
            <button className="btn btn-secondary" onClick={onBack}>← Go back</button>
          </div>
        )}

        {/* Feedback results */}
        {feedback && !feedback.raw && (
          <div className="fb-results fade-up">
            {/* Score header */}
            <div className="fb-score-card">
              <div className="fb-score-ring" style={{ borderColor: getScoreColor(feedback.overallScore) }}>
                <span className="fb-score-number" style={{ color: getScoreColor(feedback.overallScore) }}>
                  {feedback.overallScore}
                </span>
                <span className="fb-score-max">/10</span>
              </div>
              <div className="fb-score-info">
                <h2 className="fb-score-title">AI Advisor Feedback</h2>
                <p className="fb-summary">{feedback.summary}</p>
              </div>
            </div>

            {/* Strengths */}
            <div className="fb-section fb-strengths">
              <div className="fb-section-header">
                <span className="fb-section-icon">💪</span>
                <h3 className="fb-section-title">Strengths</h3>
              </div>
              <ul className="fb-list">
                {feedback.strengths?.map((s, i) => (
                  <li key={i} className="fb-list-item fb-list-strength fade-up" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            <div className="fb-section fb-concerns">
              <div className="fb-section-header">
                <span className="fb-section-icon">⚠️</span>
                <h3 className="fb-section-title">Points to Address</h3>
              </div>
              <ul className="fb-list">
                {feedback.concerns?.map((c, i) => (
                  <li key={i} className="fb-list-item fb-list-concern fade-up" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Clarifying Questions */}
            <div className="fb-section fb-questions">
              <div className="fb-section-header">
                <span className="fb-section-icon">❓</span>
                <h3 className="fb-section-title">Questions to Consider</h3>
              </div>
              <ul className="fb-list">
                {feedback.questions?.map((q, i) => (
                  <li key={i} className="fb-list-item fb-list-question fade-up" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Suggestion */}
            <div className="fb-suggestion fade-up" style={{ animationDelay: '1s' }}>
              <div className="fb-suggestion-label">💡 Key Recommendation</div>
              <p className="fb-suggestion-text">{feedback.suggestion}</p>
            </div>

            {/* Actions */}
            <div className="fb-actions fade-up" style={{ animationDelay: '1.1s' }}>
              <button className="btn btn-secondary" onClick={onBack}>
                ← Revise Answers
              </button>
              <button className="folder-btn-continue" onClick={() => onContinue(feedback)}>
                <span>Continue to Pitch Folder</span>
                <span className="folder-btn-continue-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Raw text fallback */}
        {feedback && feedback.raw && (
          <div className="fb-results fade-up">
            <div className="fb-section">
              <h3 className="fb-section-title">AI Feedback</h3>
              <p className="fb-raw-text">{feedback.raw}</p>
            </div>
            <div className="fb-actions">
              <button className="btn btn-secondary" onClick={onBack}>← Back</button>
              <button className="folder-btn-continue" onClick={() => onContinue(feedback)}>
                Continue →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}