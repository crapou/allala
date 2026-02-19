import { useState } from 'react'
import '../styles/questions.css'

const QUESTIONS = [
  {
    id: 'problem',
    number: 1,
    title: 'What problem are you solving?',
    subtitle: 'One clear sentence + why it matters (cost, delays, pain point).',
    placeholder: 'e.g. Train maintenance inspections take 6 hours per unit, causing costly delays…',
  },
  {
    id: 'audience',
    number: 2,
    title: 'Who suffers from this problem?',
    subtitle: 'User + decision maker.',
    placeholder: 'e.g. Maintenance engineers (daily users) and fleet managers (decision makers)…',
  },
  {
    id: 'solution',
    number: 3,
    title: 'What is your solution?',
    subtitle: 'Explain it in max 2–3 steps.',
    placeholder: 'e.g. 1) AI scans train exterior via camera 2) Detects defects in real-time 3) Generates maintenance report…',
  },
  {
    id: 'advantage',
    number: 4,
    title: 'Why is it better than existing options?',
    subtitle: 'Your unique value (speed, accuracy, simplicity, cost, AI magic).',
    placeholder: 'e.g. 10x faster than manual inspection, 95% defect detection accuracy, zero human error…',
  },
  {
    id: 'impact',
    number: 5,
    title: 'What is the impact if it works?',
    subtitle: '1–2 metrics (€/year, CO₂, uptime, reliability).',
    placeholder: 'e.g. Save €2.4M/year per fleet, reduce downtime by 40%, cut CO₂ from unnecessary part replacements…',
  },
]

export default function QuestionsScreen({ onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [inputValue, setInputValue] = useState('')
  const [animating, setAnimating] = useState(false)

  const current = QUESTIONS[currentIndex]
  const isLast = currentIndex === QUESTIONS.length - 1
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newAnswers = { ...answers, [current.id]: inputValue.trim() }
    setAnswers(newAnswers)
    setInputValue('')

    if (isLast) {
      onComplete(newAnswers)
      return
    }

    // Animate transition
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
    <section className="questions">
      <div className="questions-inner">
        {/* Progress bar */}
        <div className="q-progress-track">
          <div
            className="q-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="q-progress-label">
          Question {currentIndex + 1} of {QUESTIONS.length}
        </div>

        {/* Question card */}
        <div className={`q-card ${animating ? 'q-card-exit' : 'q-card-enter'}`}>
          <div className="q-number">0{current.number}</div>
          <h2 className="q-title">{current.title}</h2>
          <p className="q-subtitle">{current.subtitle}</p>

          <div className="q-input-wrap">
            <textarea
              className="q-input"
              rows={3}
              placeholder={current.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              className="q-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              {isLast ? '✨ Generate Folder' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Back button */}
        <div className="q-footer">
          {currentIndex > 0 && (
            <button
              className="q-back-link"
              onClick={() => {
                const prevQ = QUESTIONS[currentIndex - 1]
                setInputValue(answers[prevQ.id] || '')
                setCurrentIndex((prev) => prev - 1)
              }}
            >
              ← Previous question
            </button>
          )}
          <button className="q-back-link" onClick={onBack}>
            Back to image
          </button>
        </div>
      </div>
    </section>
  )
}