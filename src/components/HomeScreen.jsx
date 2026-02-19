import { useState, useRef } from 'react'
import PromptBar from './PromptBar'
import alstomLogo from '../assets/alstom-logo.png'
import '../styles/home.css'

export default function HomeScreen({ prompt, setPrompt, onGenerate, status, loading, userImage, setUserImage }) {
  const fileRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file) => {
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
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e) => {
    handleFile(e.target.files[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const removeImage = () => {
    setUserImage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section className="home">
      <div className="home-inner">
        <img className="home-logo fade-up fade-up-delay-1" src={alstomLogo} alt="Alstom" />

        <div className="home-badge fade-up fade-up-delay-2">
          <span className="badge-dot" />
          AI-Powered Concept Generator
        </div>

        <h1 className="home-h1 fade-up fade-up-delay-3">
          Bring your vision<br />to life
        </h1>

        <p className="home-p fade-up fade-up-delay-4">
          Describe your idea and optionally upload a reference image.
          The AI generates a photorealistic concept you can iterate on, pitch, and share.
        </p>

        {/* Upload zone */}
        <div className="fade-up fade-up-delay-4">
          {!userImage ? (
            <div
              className={`home-upload ${dragOver ? 'home-upload-drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <span className="home-upload-icon">📎</span>
              <span className="home-upload-text">
                <strong>Upload a reference image</strong> (optional)
              </span>
              <span className="home-upload-hint">
                Drop an image here or click to browse — your product, sketch, or inspiration
              </span>
            </div>
          ) : (
            <div className="home-upload-preview">
              <img className="home-upload-thumb" src={userImage.preview} alt="Upload" />
              <div className="home-upload-info">
                <span className="home-upload-name">{userImage.name}</span>
                <span className="home-upload-size">{userImage.size}</span>
              </div>
              <button className="home-upload-remove" onClick={removeImage}>✕</button>
            </div>
          )}
        </div>

        {/* Prompt bar */}
        <div className="fade-up fade-up-delay-4">
          <PromptBar
            value={prompt}
            onChange={setPrompt}
            onSubmit={onGenerate}
            placeholder={userImage ? 'Describe how to integrate your image into the concept…' : 'Describe your concept idea…'}
            buttonText={loading ? 'Generating…' : 'Generate'}
            disabled={loading}
          />
        </div>

        {status && (
          <div className="home-status">{status}</div>
        )}
      </div>
    </section>
  )
}