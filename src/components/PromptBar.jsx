import { useRef, useEffect } from 'react'
import '../styles/promptbar.css'

export default function PromptBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type your idea…',
  buttonText = 'Generate',
  disabled = false,
}) {
  const textareaRef = useRef(null)

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

  return (
    <div className="promptbar">
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