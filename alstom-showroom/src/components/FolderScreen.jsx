import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import '../styles/folder.css'

// === PDF GENERATION ===
async function generatePDF({ folderData, aiFeedback, deepDiveAnswers, pitchText, recordingData }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentW = pw - margin * 2
  let y = margin

  // Helper: add text with word wrap
  const addText = (text, size, color, opts = {}) => {
    doc.setFontSize(size)
    doc.setTextColor(...color)
    if (opts.bold) doc.setFont('helvetica', 'bold')
    else doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(text, contentW - (opts.indent || 0))
    const lineH = size * 0.45
    // Check page break
    if (y + lines.length * lineH > ph - margin) {
      doc.addPage()
      y = margin
    }
    doc.text(lines, margin + (opts.indent || 0), y)
    y += lines.length * lineH + (opts.spacing || 2)
  }

  // Helper: section header
  const addSection = (title) => {
    if (y + 20 > ph - margin) { doc.addPage(); y = margin }
    y += 6
    doc.setDrawColor(47, 123, 246)
    doc.setLineWidth(0.5)
    doc.line(margin, y, margin + contentW, y)
    y += 6
    addText(title, 16, [47, 123, 246], { bold: true, spacing: 4 })
  }

  // Helper: Q&A block
  const addQA = (question, answer) => {
    addText(question, 9, [120, 120, 130], { bold: true, spacing: 1 })
    addText(answer || '—', 11, [40, 40, 50], { indent: 0, spacing: 4 })
  }

  // ========== PAGE 1: COVER ==========
  // Blue header band
  doc.setFillColor(7, 12, 20)
  doc.rect(0, 0, pw, 80, 'F')
  doc.setFillColor(47, 123, 246)
  doc.rect(0, 78, pw, 3, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('ALSTOM SHOWROOM', margin, 25)

  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('AI Pitch Folder', margin, 45)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 200, 255)
  const date = new Date(folderData?.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  doc.text(date, margin, 58)

  if (folderData?.prompt) {
    doc.setFontSize(11)
    doc.setTextColor(200, 210, 240)
    const promptLines = doc.splitTextToSize(`"${folderData.prompt}"`, contentW)
    doc.text(promptLines, margin, 68)
  }

  y = 95

  // ========== CONCEPT IMAGE ==========
  if (folderData?.imageUrl) {
    addSection('Concept Image')
    try {
      const imgData = folderData.imageUrl
      // Calculate image dimensions to fit width
      const imgW = contentW
      const imgH = imgW * 0.6 // approximate 5:3 ratio
      if (y + imgH > ph - margin) { doc.addPage(); y = margin }
      doc.addImage(imgData, 'PNG', margin, y, imgW, imgH)
      y += imgH + 4
      if (folderData.prompt) {
        addText(`Prompt: ${folderData.prompt}`, 9, [120, 120, 130], { spacing: 6 })
      }
    } catch (e) {
      addText('[Image could not be embedded]', 10, [200, 100, 100])
    }
  }

  // ========== AI SCORE ==========
  if (aiFeedback) {
    addSection('AI Advisor Feedback')
    const score = aiFeedback.overallScore || '—'
    addText(`Overall Score: ${score} / 10`, 14, [0, 180, 170], { bold: true, spacing: 3 })
    if (aiFeedback.summary) {
      addText(aiFeedback.summary, 11, [60, 60, 70], { spacing: 6 })
    }

    if (aiFeedback.strengths?.length) {
      addText('Strengths:', 11, [0, 180, 170], { bold: true, spacing: 2 })
      aiFeedback.strengths.forEach(s => addText(`• ${s}`, 10, [60, 60, 70], { indent: 4, spacing: 1 }))
      y += 3
    }
    if (aiFeedback.concerns?.length) {
      addText('Concerns:', 11, [220, 170, 80], { bold: true, spacing: 2 })
      aiFeedback.concerns.forEach(c => addText(`• ${c}`, 10, [60, 60, 70], { indent: 4, spacing: 1 }))
      y += 3
    }
    if (aiFeedback.questions?.length) {
      addText('Questions to Consider:', 11, [108, 92, 231], { bold: true, spacing: 2 })
      aiFeedback.questions.forEach(q => addText(`• ${q}`, 10, [60, 60, 70], { indent: 4, spacing: 1 }))
      y += 3
    }
    if (aiFeedback.suggestion) {
      addText('Key Recommendation:', 11, [47, 123, 246], { bold: true, spacing: 2 })
      addText(aiFeedback.suggestion, 10, [60, 60, 70], { indent: 4, spacing: 4 })
    }
  }

  // ========== YOUR ANSWERS ==========
  const answers = folderData?.answers || {}
  addSection('Your Answers')
  addQA('What problem are you solving?', answers.problem)
  addQA('Who suffers from this problem?', answers.audience)
  addQA('What is your solution?', answers.solution)
  addQA('Why is it better than existing options?', answers.advantage)
  addQA('What is the impact if it works?', answers.impact)

  // ========== DEEP DIVE ==========
  if (deepDiveAnswers && Object.keys(deepDiveAnswers).length > 0) {
    addSection('Mega-Trend Deep Dive')
    Object.entries(deepDiveAnswers).forEach(([key, val]) => {
      const label = key.replace(/_/g, ' ').replace(/deep /i, 'Question ')
      addQA(label, val)
    })
  }

  // ========== PITCH SCRIPT ==========
  if (pitchText) {
    addSection('Pitch Script')
    addText(pitchText, 11, [40, 40, 50], { spacing: 4 })
  }

  // ========== VIDEO NOTE ==========
  if (recordingData?.duration) {
    addSection('Pitch Recording')
    addText(
      `A video recording of ${Math.floor(recordingData.duration / 60)}:${(recordingData.duration % 60).toString().padStart(2, '0')} was captured during this session. The video file can be downloaded separately from the Alstom Showroom application.`,
      10, [100, 100, 110], { spacing: 4 }
    )
  }

  // ========== FOOTER ON EVERY PAGE ==========
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 170)
    doc.setFont('helvetica', 'normal')
    doc.text('Alstom Showroom — AI Pitch Folder', margin, ph - 10)
    doc.text(`Page ${i} of ${totalPages}`, pw - margin - 20, ph - 10)
    // Footer line
    doc.setDrawColor(200, 200, 210)
    doc.setLineWidth(0.2)
    doc.line(margin, ph - 14, pw - margin, ph - 14)
  }

  doc.save('Alstom-Pitch-Folder-' + Date.now() + '.pdf')
}

// === COMPONENT ===
export default function FolderScreen({
  folderData,
  aiFeedback,
  deepDiveAnswers,
  pitchText,
  recordingData,
  onBackHome,
}) {
  const [exporting, setExporting] = useState(false)
  const answers = folderData?.answers || {}
  const feedbackScore = aiFeedback?.overallScore || '—'

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await generatePDF({ folderData, aiFeedback, deepDiveAnswers, pitchText, recordingData })
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setExporting(false)
    }
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
      <div className="folder-export-bar fade-up">
        <button className="folder-export-btn" onClick={handleExportPDF} disabled={exporting}>
          {exporting ? <><span className="folder-export-spinner" /> Generating PDF…</> : <>📄 Download PDF</>}
        </button>
      </div>

      <div className="folder-inner">
        {/* Header */}
        <div className="folder-header fade-up">
          <div className="folder-badge-wrap">
            <div className="folder-badge"><span className="folder-badge-dot" />Pitch Folder Complete</div>
          </div>
          <h1 className="folder-h1">Your AI Pitch Folder</h1>
          <p className="folder-sub">Everything you need to present your idea — concept, strategy, feedback, and recording — all in one place.</p>
          <div className="folder-date">
            {new Date(folderData?.createdAt || Date.now()).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* Concept Image */}
        {folderData?.imageUrl && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="folder-section-head">
              <span>🖼️</span><h2>Concept Image</h2>
              <button className="folder-dl-btn" onClick={handleDownloadImage}>Download PNG</button>
            </div>
            <div className="folder-image-wrap">
              <img className="folder-image" src={folderData.imageUrl} alt="Concept" />
            </div>
            {folderData?.prompt && (
              <div className="folder-prompt-label"><strong>Prompt:</strong> {folderData.prompt}</div>
            )}
          </div>
        )}

        {/* AI Score */}
        <div className="folder-score-row fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="folder-score-card">
            <div className="folder-score-number">{feedbackScore}</div>
            <div className="folder-score-label">AI Score /10</div>
          </div>
          <div className="folder-score-summary">{aiFeedback?.summary || 'No AI feedback available.'}</div>
        </div>

        {/* Answers */}
        <div className="folder-section fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="folder-section-head"><span>📋</span><h2>Your Answers</h2></div>
          <div className="folder-qa-list">
            {[
              { q: 'What problem are you solving?', a: answers.problem },
              { q: 'Who suffers from this problem?', a: answers.audience },
              { q: 'What is your solution?', a: answers.solution },
              { q: 'Why is it better than existing options?', a: answers.advantage },
              { q: 'What is the impact if it works?', a: answers.impact },
            ].map((item, i) => (
              <div key={i} className="folder-qa">
                <div className="folder-qa-q">{item.q}</div>
                <div className="folder-qa-a">{item.a || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Feedback */}
        {aiFeedback && !aiFeedback.raw && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.25s' }}>
            <div className="folder-section-head"><span>🤖</span><h2>AI Advisor Feedback</h2></div>
            <div className="folder-feedback-grid">
              <div className="folder-fb-col folder-fb-strengths">
                <h4>💪 Strengths</h4>
                {aiFeedback.strengths?.map((s, i) => <p key={i}>{s}</p>)}
              </div>
              <div className="folder-fb-col folder-fb-concerns">
                <h4>⚠️ Concerns</h4>
                {aiFeedback.concerns?.map((c, i) => <p key={i}>{c}</p>)}
              </div>
              <div className="folder-fb-col folder-fb-questions">
                <h4>❓ Questions</h4>
                {aiFeedback.questions?.map((q, i) => <p key={i}>{q}</p>)}
              </div>
            </div>
            {aiFeedback.suggestion && (
              <div className="folder-suggestion">💡 <strong>Key Recommendation:</strong> {aiFeedback.suggestion}</div>
            )}
          </div>
        )}

        {/* Deep Dive */}
        {deepDiveAnswers && Object.keys(deepDiveAnswers).length > 0 && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="folder-section-head"><span>🌏</span><h2>Mega-Trend Deep Dive</h2></div>
            <div className="folder-qa-list">
              {Object.entries(deepDiveAnswers).map(([key, val], i) => (
                <div key={i} className="folder-qa">
                  <div className="folder-qa-q">{key.replace(/_/g, ' ').replace(/deep /i, 'Question ')}</div>
                  <div className="folder-qa-a">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pitch */}
        {pitchText && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.35s' }}>
            <div className="folder-section-head"><span>🎤</span><h2>Pitch Script</h2></div>
            <div className="folder-pitch-text">{pitchText}</div>
          </div>
        )}

        {/* Video */}
        {recordingData?.url && (
          <div className="folder-section fade-up" style={{ animationDelay: '0.4s' }}>
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
          </div>
        )}
      </div>

      {/* Footer */}
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