import { useRef, useEffect } from 'react'
import '../styles/promptbar.css'

export default function PromptBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type your idea…',
  buttonText = 'Generate',
  disabled = false,
  onAttach,
  attachment,
  onRemoveAttachment,
}) {
  const textareaRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSubmit()
    }
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      onAttach({
        base64: reader.result.split(',')[1],
        preview: reader.result,
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="promptbar">
      {/* Attachment preview */}
      {attachment && (
        <div className="prompt-attachment">
          <img className="prompt-attachment-thumb" src={attachment.preview} alt="ref" />
          <button className="prompt-attachment-remove" onClick={onRemoveAttachment}>✕</button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="prompt-input"
        rows={1}
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      {/* Clip button */}
      {onAttach && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <button
            className="prompt-clip-btn"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            title="Attach reference image"
          >
            📎
          </button>
        </>
      )}

      <button
        className="btn btn-primary"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        {buttonText}
      </button>
    </div>
  )
}