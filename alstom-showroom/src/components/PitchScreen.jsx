import { useState } from 'react'
import '../styles/pitch.css'

const PITCH_STEPS = [
  {
    id: 'hook',
    time: '0:00 – 0:15',
    duration: '15 sec',
    title: 'The Hook',
    icon: '🎣',
    color: '#e17055',
    instruction: 'Start with a shocking stat, a bold question, or a provocative statement that makes your audience stop and listen.',
    examples: [
      '"Every 6 hours, a train sits idle — costing $12,000 in lost revenue. What if AI could cut that to zero?"',
      '"By 2040, 41% of Japan will be over 65. Who\'s building the mobility they\'ll need?"',
      '"$7.6 billion. That\'s what drought cost China last year alone. We have a fix."',
    ],
    tip: 'Use a number, a timeframe, or a "what if" question. Never start with "Hi, my name is…"',
  },
  {
    id: 'problem',
    time: '0:15 – 0:35',
    duration: '20 sec',
    title: 'The Problem',
    icon: '🔥',
    color: '#fdcb6e',
    instruction: 'Paint the pain. Who suffers? How much does it cost? Why hasn\'t anyone solved it yet? Make the audience feel the urgency.',
    examples: [
      '"Maintenance engineers spend 6 hours per inspection — a process that hasn\'t changed in 30 years."',
      '"Fleet managers lose €2.4M annually to unplanned downtime, with zero predictive visibility."',
    ],
    tip: 'Personify the problem: give it a face, a cost, and a consequence. Use "today" to create urgency.',
  },
  {
    id: 'solution',
    time: '0:35 – 1:05',
    duration: '30 sec',
    title: 'The Solution',
    icon: '💡',
    color: '#00cec9',
    instruction: 'Explain your solution in 3 simple steps maximum. Show the "before → after" transformation. Keep it concrete, not abstract.',
    examples: [
      '"Step 1: Our AI camera scans the train exterior in 90 seconds. Step 2: It detects 47 types of defects with 95% accuracy. Step 3: A maintenance report is auto-generated and sent to the fleet manager."',
    ],
    tip: 'Use the framework: "We do [X] so that [Y] can [Z] without [old pain]."',
  },
  {
    id: 'proof',
    time: '1:05 – 1:25',
    duration: '20 sec',
    title: 'The Proof',
    icon: '📊',
    color: '#6c5ce7',
    instruction: 'Why should they believe you? Show traction, data, a pilot result, a mega-trend alignment, or a competitive edge that\'s hard to replicate.',
    examples: [
      '"We\'ve piloted with 3 depots across Southeast Asia. Inspection time dropped 85%. Zero missed defects."',
      '"This aligns with APAC\'s $1.1 trillion annual climate investment need — we\'re positioned at the intersection of AI and infrastructure resilience."',
    ],
    tip: 'One strong proof point beats five weak ones. Pick your best metric and own it.',
  },
  {
    id: 'impact',
    time: '1:25 – 1:45',
    duration: '20 sec',
    title: 'The Impact',
    icon: '🚀',
    color: '#e056fd',
    instruction: 'Paint the future. If this works at scale, what changes? Use concrete metrics: money saved, CO₂ reduced, lives improved, time recovered.',
    examples: [
      '"At scale across APAC\'s 45,000 trains, this saves €540M annually and reduces unplanned downtime by 40%."',
      '"That\'s 12,000 fewer diesel inspection trips per year — equivalent to removing 3,200 cars from the road."',
    ],
    tip: 'Think 10×. Don\'t just show incremental improvement — show transformational potential.',
  },
  {
    id: 'close',
    time: '1:45 – 2:00',
    duration: '15 sec',
    title: 'The Close',
    icon: '🎯',
    color: '#0984e3',
    instruction: 'End with a clear ask and a memorable callback to your hook. What do you need? What\'s the next step? Leave them wanting to act.',
    examples: [
      '"We need one pilot partner with 500+ rolling stock to prove this at scale. Is that you?"',
      '"Remember those 6 idle hours? Let\'s make them zero. I\'d love 15 minutes to show you how."',
    ],
    tip: 'Always loop back to your hook. It creates a narrative circle that feels complete and memorable.',
  },
]

export default function PitchScreen({ folderData, onBack, onRecord, pitchText, setPitchText }) {
  const [activeStep, setActiveStep] = useState(null)

  return (
    <section className="pitch">
      <div className="pitch-inner">
        {/* Header */}
        <div className="pitch-header fade-up">
          <button className="pitch-back" onClick={onBack}>← Back</button>
          <div className="pitch-badge">
            <span className="pitch-badge-dot" />
            Pitch Builder
          </div>
          <h1 className="pitch-h1">Craft your 2-minute pitch</h1>
          <p className="pitch-p">
            Follow the 6-step methodology below. Each step has a specific timing,
            purpose, and technique. Master this structure and you'll command any room.
          </p>
        </div>

        {/* Timeline */}
        <div className="pitch-timeline">
          <div className="pitch-timeline-bar" />
          {PITCH_STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`pitch-step fade-up ${activeStep === step.id ? 'pitch-step-active' : ''}`}
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
            >
              {/* Step header */}
              <div className="pitch-step-header">
                <div className="pitch-step-dot" style={{ background: step.color, boxShadow: `0 0 12px ${step.color}40` }} />
                <div className="pitch-step-meta">
                  <div className="pitch-step-time">{step.time}</div>
                  <h3 className="pitch-step-title">
                    <span className="pitch-step-icon">{step.icon}</span>
                    {step.title}
                    <span className="pitch-step-duration">{step.duration}</span>
                  </h3>
                </div>
                <div className="pitch-step-toggle">{activeStep === step.id ? '−' : '+'}</div>
              </div>

              {/* Step detail (expandable) */}
              {activeStep === step.id && (
                <div className="pitch-step-detail fade-up">
                  <p className="pitch-step-instruction">{step.instruction}</p>

                  <div className="pitch-step-examples">
                    <div className="pitch-step-examples-label">Examples:</div>
                    {step.examples.map((ex, j) => (
                      <div key={j} className="pitch-step-example">{ex}</div>
                    ))}
                  </div>

                  <div className="pitch-step-tip">
                    <span className="pitch-tip-icon">💡</span>
                    <span>{step.tip}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pitch writing area */}
        <div className="pitch-write fade-up" style={{ animationDelay: '0.8s' }}>
          <div className="pitch-write-header">
            <h3 className="pitch-write-title">✍️ Write your pitch</h3>
            <div className="pitch-write-counter">
              {pitchText.length > 0 ? `~${Math.ceil(pitchText.split(/\s+/).filter(Boolean).length / 150 * 60)}s reading time` : ''}
            </div>
          </div>
          <textarea
            className="pitch-textarea"
            rows={8}
            placeholder="Write your 2-minute pitch here. Follow the 6 steps above: Hook → Problem → Solution → Proof → Impact → Close. Aim for ~300 words (about 2 minutes spoken)."
            value={pitchText}
            onChange={(e) => setPitchText(e.target.value)}
          />
          <div className="pitch-write-actions">
            <button
              className="pitch-record-btn"
              onClick={onRecord}
            >
              <span className="pitch-record-dot" />
              Record Pitch
            </button>
            <div className="pitch-record-note">Video recording — coming soon</div>
          </div>
        </div>
      </div>
    </section>
  )
}