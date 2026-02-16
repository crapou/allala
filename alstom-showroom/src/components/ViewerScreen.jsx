import { useState } from 'react'
import PromptBar from './PromptBar'
import '../styles/viewer.css'

export default function ViewerScreen({
  imageUrl,
  loading,
  status,
  error,
  onIterate,
  onDownload,
  onBack,
  onCreateFolder,
}) {
  const [iterationPrompt, setIterationPrompt] = useState('')
  const [showIteration, setShowIteration] = useState(false)

  const handleIterate = () => {
    if (!iterationPrompt.trim()) return
    onIterate(iterationPrompt.trim())
    setIterationPrompt('')
  }

  return (
    <section className="viewer fade-in">
      <div className="viewer-inner">
        <div className="viewer-card">
          {/* Header bar */}
          <div className="viewer-head">
            <div className="viewer-meta">
              <button className="btn-back" onClick={onBack}>← Back</button>
              <div className="viewer-status-wrap">
                <div className="viewer-label">Preview</div>
                <div className="viewer-status">{status || 'Ready.'}</div>
              </div>
            </div>
            <div className="viewer-actions">
              {imageUrl && !loading && (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowIteration(!showIteration)}
                  >
                    ✨ Modify
                  </button>
                  <button className="btn btn-primary" onClick={onDownload}>
                    Download PNG
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Image frame */}
          <div className="frame">
            {loading && (
              <div className="skeleton" />
            )}
            {imageUrl && !loading && (
              <img
                className="viewer-img viewer-img-reveal"
                src={imageUrl}
                alt="Generated concept"
              />
            )}
            {imageUrl && loading && (
              <img
                className="viewer-img viewer-img-loading"
                src={imageUrl}
                alt="Previous concept"
              />
            )}
          </div>

          {/* Create Folder CTA */}
          {imageUrl && !loading && (
            <div className="folder-cta">
              <button className="folder-btn" onClick={onCreateFolder}>
                <span className="folder-btn-icon">📁</span>
                <span className="folder-btn-text">
                  <span className="folder-btn-title">Create a Pitch Folder</span>
                  <span className="folder-btn-sub">Answer 5 questions → get a full AI pitch</span>
                </span>
                <span className="folder-btn-arrow">→</span>
              </button>
            </div>
          )}

          {/* Iteration zone */}
          {showIteration && !loading && (
            <div className="iteration-zone fade-up">
              <PromptBar
                value={iterationPrompt}
                onChange={setIterationPrompt}
                onSubmit={handleIterate}
                placeholder="Describe your modifications…"
                buttonText="Apply"
                disabled={loading}
              />
            </div>
          )}

          {/* Error box */}
          {error && (
            <div className="error-box fade-in">❌ {error}</div>
          )}
        </div>
      </div>
    </section>
  )
}