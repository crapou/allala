import { useState } from 'react'
import '../styles/trenddetail.css'
import { TREND_CONTENT } from '../data/trendContent'

export default function TrendDetailScreen({ trendId, onBack, reactions = {}, onSaveReaction }) {
  const trend = TREND_CONTENT[trendId]
  if (!trend) return null

  const [openKey, setOpenKey] = useState(null)
  const [draftValue, setDraftValue] = useState('')

  const openPanel = (key) => {
    setOpenKey(key)
    setDraftValue(reactions[key] || '')
  }

  const closePanel = () => {
    setOpenKey(null)
    setDraftValue('')
  }

  const saveReaction = (key) => {
    if (onSaveReaction) onSaveReaction(key, draftValue.trim())
    closePanel()
  }

  return (
    <section className="td">
      <div className="td-inner">
        {/* Hero */}
        <div className="td-hero fade-up" style={{ background: trend.gradient }}>
          <button className="td-back" onClick={onBack}>← All Trends</button>
          <span className="td-hero-icon">{trend.icon}</span>
          <div className="td-hero-number">{trend.number}</div>
          <h1 className="td-hero-title">{trend.title}</h1>
          <p className="td-hero-subtitle">{trend.subtitle}</p>
        </div>

        {/* Key Stats */}
        <div className="td-stats fade-up" style={{ animationDelay: '0.15s' }}>
          {trend.stats.map((stat, i) => (
            <div key={i} className="td-stat">
              <div className="td-stat-value">{stat.value}</div>
              <div className="td-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Sections */}
        {trend.sections.map((section, i) => {
          const key = `section-${i}`
          const isOpen = openKey === key
          const savedReaction = reactions[key]

          return (
            <div
              key={i}
              className="td-section fade-up"
              style={{ animationDelay: `${0.25 + i * 0.1}s` }}
            >
              <div className="td-section-header">
                <span className="td-section-icon">{section.icon}</span>
                <h2 className="td-section-title">{section.title}</h2>
              </div>
              <p className="td-section-text">{section.text}</p>

              {/* Optional chart bars */}
              {section.chart && (
                <div className="td-chart">
                  {section.chart.map((bar, j) => (
                    <div key={j} className="td-chart-row">
                      <div className="td-chart-label">{bar.label}</div>
                      <div className="td-chart-track">
                        <div
                          className="td-chart-fill"
                          style={{
                            width: `${bar.value}%`,
                            background: trend.gradient,
                            animationDelay: `${0.5 + j * 0.1}s`,
                          }}
                        />
                      </div>
                      <div className="td-chart-value">{bar.display}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Optional highlight box */}
              {section.highlight && (
                <div className="td-highlight" style={{ borderLeftColor: trend.accentColor }}>
                  {section.highlight}
                </div>
              )}

              {/* Saved reaction preview */}
              {savedReaction && !isOpen && (
                <div className="td-reaction-saved">
                  <span className="td-reaction-dot" />
                  <span className="td-reaction-text">{savedReaction}</span>
                </div>
              )}

              {/* Comment bar */}
              <div className="td-comment-bar">
                <button
                  className={`td-comment-btn${savedReaction ? ' td-comment-btn--saved' : ''}`}
                  onClick={() => isOpen ? closePanel() : openPanel(key)}
                >
                  {isOpen
                    ? '✕ Close'
                    : savedReaction
                      ? '✏️ Edit reaction'
                      : '💬 Comment'}
                </button>
              </div>

              {/* Slide-down comment panel */}
              {isOpen && (
                <div className="td-comment-panel fade-up">
                  <p className="td-comment-question">
                    How is this trend relevant for your project?
                  </p>
                  <textarea
                    className="td-comment-textarea"
                    placeholder="Share your thoughts, connections, or ideas…"
                    value={draftValue}
                    onChange={e => setDraftValue(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="td-comment-actions">
                    <button className="td-comment-cancel" onClick={closePanel}>
                      Cancel
                    </button>
                    <button
                      className="td-comment-save"
                      onClick={() => saveReaction(key)}
                      disabled={!draftValue.trim()}
                    >
                      Save reaction →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Back button */}
        <div className="td-footer fade-up">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to all Mega-Trends
          </button>
        </div>
      </div>
    </section>
  )
}
