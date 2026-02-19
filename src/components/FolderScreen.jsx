import { useState } from 'react'
import jsPDF from 'jspdf'
import '../styles/folder.css'
import { TREND_CONTENT } from '../data/trendContent'

const TREND_META = {
  population:  { icon: '🌏', name: 'Population' },
  environment: { icon: '🌱', name: 'Environment' },
  geopolitics: { icon: '⚡', name: 'Geopolitics & Finance' },
  technology:  { icon: '🔮', name: 'Technology' },
}

// ─────────────────────────────────────────────────────────────
// PDF GENERATION
// ─────────────────────────────────────────────────────────────
async function generatePDF({
  folderData, aiFeedback, elaborationAnswers, trendReactions,
  deepDiveAnswers, pitchText, recordingData, promptHistory,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw  = doc.internal.pageSize.getWidth()
  const ph  = doc.internal.pageSize.getHeight()
  const margin   = 20
  const contentW = pw - margin * 2
  let y = margin

  // ── helpers ──────────────────────────────────────────────────

  const addText = (text, size, color, opts = {}) => {
    doc.setFontSize(size)
    doc.setTextColor(...color)
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(String(text || '—'), contentW - (opts.indent || 0))
    const lh = size * 0.45
    for (const line of lines) {
      if (y + lh > ph - margin) { doc.addPage(); y = margin }
      doc.text(line, margin + (opts.indent || 0), y)
      y += lh
    }
    y += (opts.spacing ?? 2)
  }

  const addSection = (title) => {
    if (y + 24 > ph - margin) { doc.addPage(); y = margin }
    y += 10
    doc.setDrawColor(47, 123, 246)
    doc.setLineWidth(0.5)
    doc.line(margin, y, margin + contentW, y)
    y += 7
    addText(title, 15, [47, 123, 246], { bold: true, spacing: 5 })
  }

  const addQA = (question, answer) => {
    addText(question, 9, [130, 130, 150], { bold: true, spacing: 1 })
    addText(answer || '—', 11, [50, 50, 65], { spacing: 5 })
  }

  const addBullet = (text, color = [60, 60, 75]) => {
    addText('•  ' + text, 10, color, { indent: 5, spacing: 1 })
  }

  // ── Cover ─────────────────────────────────────────────────────
  doc.setFillColor(7, 12, 20)
  doc.rect(0, 0, pw, 80, 'F')
  doc.setFillColor(47, 123, 246)
  doc.rect(0, 78, pw, 3, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text('ALSTOM SHOWROOM', margin, 25)
  doc.setFontSize(28); doc.setFont('helvetica', 'bold')
  doc.text('AI Pitch Folder', margin, 45)
  doc.setFontSize(12); doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 200, 255)
  doc.text(new Date(folderData?.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }), margin, 58)
  if (folderData?.prompt) {
    doc.setFontSize(11); doc.setTextColor(200, 210, 240)
    doc.text(doc.splitTextToSize(`"${folderData.prompt}"`, contentW), margin, 68)
  }
  y = 95

  // ── 1. Concept image ─────────────────────────────────────────
  if (folderData?.imageUrl) {
    addSection('1. Concept Image')
    try {
      const imgW = contentW
      const imgH = imgW * 0.6
      if (y + imgH > ph - margin) { doc.addPage(); y = margin }
      doc.addImage(folderData.imageUrl, 'PNG', margin, y, imgW, imgH)
      y += imgH + 4
    } catch { addText('[Image could not be embedded]', 10, [200, 100, 100]) }

    if (folderData.prompt)
      addText(`Initial prompt: "${folderData.prompt}"`, 9, [120, 120, 130], { spacing: 2 })

    if (promptHistory?.length > 1) {
      y += 2
      addText('Iteration log:', 9, [120, 120, 130], { bold: true, spacing: 2 })
      promptHistory.slice(1).forEach((p, i) => {
        addText(`Iteration ${i + 1}: "${p.text}"`, 9, [100, 100, 120], { indent: 6, spacing: 1 })
      })
      y += 3
    }
  }

  // ── 2. Your 5 Answers ────────────────────────────────────────
  addSection('2. Your Answers')
  const ans = folderData?.answers || {}
  addQA('What problem are you solving?', ans.problem)
  addQA('Who suffers from this problem?', ans.audience)
  addQA('What is your solution?', ans.solution)
  addQA('Why is it better than existing options?', ans.advantage)
  addQA('What is the impact if it works?', ans.impact)

  // ── 3. AI Feedback ────────────────────────────────────────────
  if (aiFeedback) {
    addSection('3. AI Advisor Feedback')
    addText(`Overall Score: ${aiFeedback.overallScore ?? '—'} / 10`, 14, [0, 180, 170], { bold: true, spacing: 3 })
    if (aiFeedback.summary) addText(aiFeedback.summary, 11, [60, 60, 75], { spacing: 5 })

    if (aiFeedback.strengths?.length) {
      addText('Strengths:', 11, [0, 180, 170], { bold: true, spacing: 2 })
      aiFeedback.strengths.forEach(s => addBullet(s, [0, 160, 150]))
      y += 3
    }
    if (aiFeedback.concerns?.length) {
      addText('Points to Address:', 11, [210, 160, 60], { bold: true, spacing: 2 })
      aiFeedback.concerns.forEach(c => addBullet(c, [150, 110, 40]))
      y += 3
    }
    if (aiFeedback.questions?.length) {
      addText('Questions to Consider:', 11, [108, 92, 231], { bold: true, spacing: 2 })
      aiFeedback.questions.forEach(q => addBullet(q, [90, 75, 200]))
      y += 3
    }
    if (aiFeedback.suggestion) {
      addText('Key Recommendation:', 11, [47, 123, 246], { bold: true, spacing: 2 })
      addText(aiFeedback.suggestion, 11, [50, 50, 65], { indent: 5, spacing: 5 })
    }
  }

  // ── 4. Your reactions to feedback ────────────────────────────
  if (elaborationAnswers?.length > 0) {
    addSection('4. Your Reactions to the Feedback')
    elaborationAnswers.forEach(({ type, item, answer }) => {
      addText((type === 'concern' ? '⚠️ In response to: ' : '❓ In response to: ') + item,
        9, [130, 130, 150], { bold: true, spacing: 1 })
      addText(answer, 11, [50, 50, 65], { indent: 5, spacing: 5 })
    })
  }

  // ── 5. Mega-Trend reactions ───────────────────────────────────
  const hasTR = trendReactions && Object.keys(trendReactions).some(
    t => Object.keys(trendReactions[t] || {}).length > 0
  )
  if (hasTR) {
    addSection('5. Mega-Trend Reactions')
    Object.entries(trendReactions).forEach(([trendId, sections]) => {
      const entries = Object.entries(sections || {}).filter(([, v]) => v)
      if (!entries.length) return
      const meta = TREND_META[trendId] || { icon: '', name: trendId }
      addText(`${meta.icon}  ${meta.name}`, 12, [100, 100, 210], { bold: true, spacing: 2 })
      entries.forEach(([key, comment]) => {
        const idx    = parseInt(key.split('-')[1])
        const sTitle = TREND_CONTENT[trendId]?.sections[idx]?.title || `Section ${idx + 1}`
        addText(sTitle, 9, [130, 130, 150], { bold: true, indent: 5, spacing: 1 })
        addText(comment, 10, [50, 50, 65], { indent: 10, spacing: 4 })
      })
      y += 2
    })
  }

  // ── 6. Deep Dive ─────────────────────────────────────────────
  if (deepDiveAnswers && Object.keys(deepDiveAnswers).length > 0) {
    addSection('6. Deep Dive Answers')
    Object.entries(deepDiveAnswers).forEach(([key, val]) => {
      addQA(key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), val)
    })
  }

  // ── 7. Pitch Script ───────────────────────────────────────────
  if (pitchText) {
    addSection('7. Pitch Script')
    addText(pitchText, 11, [50, 50, 65], { spacing: 4 })
  }

  // ── 8. Recording note + transcript ───────────────────────────
  if (recordingData?.duration) {
    addSection('8. Pitch Recording')
    const dur = `${Math.floor(recordingData.duration / 60)}:${(recordingData.duration % 60).toString().padStart(2, '0')}`
    addText(`Duration: ${dur} — The video file can be downloaded separately from the application.`,
      10, [100, 100, 115], { spacing: 4 })
    if (pitchText) {
      y += 2
      addText('Pitch Transcript:', 11, [100, 100, 150], { bold: true, spacing: 3 })
      addText(pitchText, 10, [50, 50, 65], { spacing: 4 })
    }
  }

  // ── Footer on every page ──────────────────────────────────────
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(8); doc.setTextColor(160, 160, 170); doc.setFont('helvetica', 'normal')
    doc.text('Alstom Showroom — AI Pitch Folder', margin, ph - 10)
    doc.text(`Page ${i} of ${total}`, pw - margin - 20, ph - 10)
    doc.setDrawColor(200, 200, 210); doc.setLineWidth(0.2)
    doc.line(margin, ph - 14, pw - margin, ph - 14)
  }

  doc.save('Alstom-Pitch-Folder-' + Date.now() + '.pdf')
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function FolderScreen({
  folderData,
  aiFeedback,
  elaborationAnswers = [],
  trendReactions = {},
  deepDiveAnswers,
  pitchText,
  recordingData,
  onBackHome,
  promptHistory = [],
}) {
  const [exporting, setExporting] = useState(false)
  const answers = folderData?.answers || {}
  const feedbackScore = aiFeedback?.overallScore ?? '—'
  const hasTrendReactions = Object.keys(trendReactions).some(
    t => Object.keys(trendReactions[t] || {}).length > 0
  )

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await generatePDF({ folderData, aiFeedback, elaborationAnswers, trendReactions, deepDiveAnswers, pitchText, recordingData, promptHistory })
    } catch (err) { console.error('PDF error:', err) }
    finally { setExporting(false) }
  }

  const handleDownloadVideo = () => {
    if (!recordingData?.url) return
    const a = document.createElement('a')
    a.href = recordingData.url
    a.download = 'pitch-recording-' + Date.now() + '.webm'
    a.click()
  }

  const handleDownloadImage = () => {
    if (!folderData?.imageUrl) return
    const a = document.createElement('a')
    a.href = folderData.imageUrl
    a.download = 'concept-image-' + Date.now() + '.png'
    a.click()
  }

  return (
    <section className="folder">

      {/* Sticky PDF button */}
      <div className="folder-export-bar fade-up">
        <button className="folder-export-btn" onClick={handleExportPDF} disabled={exporting}>
          {exporting ? <><span className="folder-export-spinner" /> Generating PDF…</> : <>📄 Download PDF</>}
        </button>
      </div>

      <div className="folder-inner">

        {/* ── Header ── */}
        <div className="folder-header fade-up">
          <div className="folder-badge-wrap">
            <div className="folder-badge"><span className="folder-badge-dot" />Pitch Folder Complete</div>
          </div>
          <h1 className="folder-h1">Your AI Pitch Folder</h1>
          <p className="folder-sub">Concept, strategy, feedback, reactions, and recording — all in one place.</p>
          <div className="folder-date">
            {new Date(folderData?.createdAt || Date.now()).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        </div>

        {/* ── 1. Concept Image ── */}
        {folderData?.imageUrl && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="folder-section-head">
              <span>🖼️</span><h2>Concept Image</h2>
              <button className="folder-dl-btn" onClick={handleDownloadImage}>Download PNG</button>
            </div>
            <div className="folder-image-wrap">
              <img className="folder-image" src={folderData.imageUrl} alt="Concept" />
            </div>
            {folderData.prompt && (
              <div className="folder-prompt-label"><strong>Prompt:</strong> {folderData.prompt}</div>
            )}
            {promptHistory.length > 1 && (
              <div className="folder-iterations">
                <div className="folder-iterations-title">Iteration log</div>
                {promptHistory.map((p, i) => (
                  <div key={i} className="folder-iteration-row">
                    <span className="folder-iteration-tag">
                      {p.type === 'generate' ? 'Initial' : `Iteration ${i}`}
                    </span>
                    <span className="folder-iteration-text">{p.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 2. Your 5 Answers ── */}
        <div className="folder-section fade-up" style={{ animationDelay: '0.10s' }}>
          <div className="folder-section-head"><span>📋</span><h2>Your Answers</h2></div>
          <div className="folder-qa-list">
            {[
              { q: 'What problem are you solving?',         a: answers.problem   },
              { q: 'Who suffers from this problem?',        a: answers.audience  },
              { q: 'What is your solution?',                a: answers.solution  },
              { q: 'Why is it better than existing options?', a: answers.advantage },
              { q: 'What is the impact if it works?',       a: answers.impact    },
            ].map((item, i) => (
              <div key={i} className="folder-qa">
                <div className="folder-qa-q">{item.q}</div>
                <div className="folder-qa-a">{item.a || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. AI Score ── */}
        <div className="folder-score-row fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="folder-score-card">
            <div className="folder-score-number">{feedbackScore}</div>
            <div className="folder-score-label">AI Score /10</div>
          </div>
          <div className="folder-score-summary">{aiFeedback?.summary || 'No AI feedback available.'}</div>
        </div>

        {/* ── 4. AI Feedback detail ── */}
        {aiFeedback && !aiFeedback.raw && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.20s' }}>
            <div className="folder-section-head"><span>🤖</span><h2>AI Advisor Feedback</h2></div>
            <div className="folder-feedback-grid">
              <div className="folder-fb-col folder-fb-strengths">
                <h4>💪 Strengths</h4>
                {aiFeedback.strengths?.map((s, i) => <p key={i}>{s}</p>)}
              </div>
              <div className="folder-fb-col folder-fb-concerns">
                <h4>⚠️ Points to Address</h4>
                {aiFeedback.concerns?.map((c, i) => <p key={i}>{c}</p>)}
              </div>
              <div className="folder-fb-col folder-fb-questions">
                <h4>❓ Questions</h4>
                {aiFeedback.questions?.map((q, i) => <p key={i}>{q}</p>)}
              </div>
            </div>
            {aiFeedback.suggestion && (
              <div className="folder-suggestion">
                💡 <strong>Key Recommendation:</strong> {aiFeedback.suggestion}
              </div>
            )}
          </div>
        )}

        {/* ── 5. Elaboration (reactions to feedback) ── */}
        {elaborationAnswers?.length > 0 && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.25s' }}>
            <div className="folder-section-head"><span>💬</span><h2>Your Reactions to the Feedback</h2></div>
            <div className="folder-qa-list">
              {elaborationAnswers.map(({ type, item, answer }, i) => (
                <div
                  key={i}
                  className={`folder-qa folder-qa-elab ${type === 'concern' ? 'folder-qa-elab-concern' : 'folder-qa-elab-question'}`}
                >
                  <div className="folder-qa-elab-tag">
                    {type === 'concern' ? '⚠️ In response to:' : '❓ In response to:'}
                  </div>
                  <div className="folder-qa-q">{item}</div>
                  <div className="folder-qa-a">{answer}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. Mega-Trend Reactions ── */}
        {hasTrendReactions && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.30s' }}>
            <div className="folder-section-head"><span>🌏</span><h2>Mega-Trend Reactions</h2></div>
            <div className="folder-trends-list">
              {Object.entries(trendReactions).map(([trendId, sections]) => {
                const entries = Object.entries(sections || {}).filter(([, v]) => v)
                if (!entries.length) return null
                const meta = TREND_META[trendId] || { icon: '', name: trendId }
                return (
                  <div key={trendId} className="folder-trend-block">
                    <div className="folder-trend-name">{meta.icon} {meta.name}</div>
                    {entries.map(([key, comment]) => {
                      const idx    = parseInt(key.split('-')[1])
                      const sTitle = TREND_CONTENT[trendId]?.sections[idx]?.title || `Section ${idx + 1}`
                      return (
                        <div key={key} className="folder-qa">
                          <div className="folder-qa-q">{sTitle}</div>
                          <div className="folder-qa-a">{comment}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 7. Deep Dive ── */}
        {deepDiveAnswers && Object.keys(deepDiveAnswers).length > 0 && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.35s' }}>
            <div className="folder-section-head"><span>🔬</span><h2>Deep Dive Answers</h2></div>
            <div className="folder-qa-list">
              {Object.entries(deepDiveAnswers).map(([key, val], i) => (
                <div key={i} className="folder-qa">
                  <div className="folder-qa-q">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                  <div className="folder-qa-a">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 8. Pitch Script ── */}
        {pitchText && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.40s' }}>
            <div className="folder-section-head"><span>🎤</span><h2>Pitch Script</h2></div>
            <div className="folder-pitch-text">{pitchText}</div>
          </div>
        )}

        {/* ── 9. Video + transcript ── */}
        {recordingData?.url && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.45s' }}>
            <div className="folder-section-head">
              <span>🎬</span><h2>Pitch Recording</h2>
              <button className="folder-dl-btn" onClick={handleDownloadVideo}>Download Video</button>
            </div>
            <div className="folder-video-wrap">
              <video className="folder-video" src={recordingData.url} controls playsInline />
            </div>
            <div className="folder-video-meta">
              Duration: {Math.floor(recordingData.duration / 60)}:{(recordingData.duration % 60).toString().padStart(2, '0')}
            </div>
            {pitchText && (
              <div className="folder-transcript">
                <div className="folder-transcript-title">📄 Pitch Transcript</div>
                <div className="folder-transcript-text">{pitchText}</div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <div className="folder-footer fade-up" style={{ animationDelay: '0.5s' }}>
        <div className="folder-footer-msg">🎉 Your pitch folder is complete!</div>
        <div className="folder-footer-actions">
          <button className="folder-export-btn-lg" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? '⏳ Generating…' : '📄 Download Full PDF'}
          </button>
          {recordingData?.url && (
            <button className="folder-export-btn-lg folder-video-dl-btn" onClick={handleDownloadVideo}>
              🎬 Download Video
            </button>
          )}
          <button className="folder-home-btn" onClick={onBackHome}>Start a new project →</button>
        </div>
      </div>

    </section>
  )
}
