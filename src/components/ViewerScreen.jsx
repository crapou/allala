
import { useState, useRef } from 'react'
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
  initialPrompt,
  userImage,
  setUserImage,
  onRegenerate,
}) {
  const [iterationPrompt, setIterationPrompt] = useState('')
  const [showIteration, setShowIteration] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const fileRef = useRef(null)

  const handleIterate = () => {
    if (!iterationPrompt.trim()) return
    onIterate(iterationPrompt.trim())
    setIterationPrompt('')
  }

  const handleNewImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      setUserImage({
        base64,
        preview: reader.result,
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
      })
      setShowUpload(false)
    }
    reader.readAsDataURL(file)
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
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowUpload(!showUpload)}
                  >
                    📎 Add Image
                  </button>
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

          {/* User image preview (if uploaded) */}
          {userImage && (
            <div className="viewer-user-image">
              <img className="viewer-user-thumb" src={userImage.preview} alt="Reference" />
              <div className="viewer-user-info">
                <span className="viewer-user-label">📎 Reference image</span>
                <span className="viewer-user-name">{userImage.name}</span>
              </div>
              <button className="viewer-user-remove" onClick={() => setUserImage(null)}>✕</button>
            </div>
          )}

          {/* Upload zone in viewer */}
          {showUpload && (
            <div className="viewer-upload-zone fade-up">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleNewImage(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div
                className="viewer-upload-drop"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleNewImage(e.dataTransfer.files[0]) }}
              >
                <span className="viewer-upload-icon">📎</span>
                <span>Drop a reference image or click to browse</span>
              </div>
              {userImage && onRegenerate && (
                <button className="viewer-regen-btn" onClick={onRegenerate}>
                  🔄 Regenerate with this image
                </button>
              )}
            </div>
          )}

          {/* Image frame */}
          <div className="frame">
            {loading && <div className="skeleton" />}
            {imageUrl && !loading && (
              <img className="viewer-img viewer-img-reveal" src={imageUrl} alt="Generated concept" />
            )}
            {imageUrl && loading && (
              <img className="viewer-img viewer-img-loading" src={imageUrl} alt="Previous concept" />
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
          {error && <div className="error-box fade-in">❌ {error}</div>}
        </div>
      </div>
    </section>
  )
}