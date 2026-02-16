import { useState, useCallback } from 'react'
import Background from './components/Background'
import TopBar from './components/TopBar'
import HomeScreen from './components/HomeScreen'
import ViewerScreen from './components/ViewerScreen'
import QuestionsScreen from './components/QuestionsScreen'
import FeedbackScreen from './components/FeedbackScreen'

// ========== CONFIG ==========
const PROXY_URL = 'https://alstom-proxy.onrender.com'
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/cyfu356g7x4ahx89k5n4w2nq6hjp8is5'

function generateSessionId() {
  return 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

export default function App() {
  // Screen: 'home' | 'viewer' | 'questions' | 'feedback'
  const [screen, setScreen] = useState('home')

  const [prompt, setPrompt] = useState('')
  const [homeStatus, setHomeStatus] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [rawBase64, setRawBase64] = useState(null)
  const [viewerStatus, setViewerStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(generateSessionId)

  // Folder data
  const [folderData, setFolderData] = useState(null)
  const [aiFeedback, setAiFeedback] = useState(null)

  // ========== GENERATE ==========
  const handleGenerate = useCallback(async () => {
    const text = prompt.trim()
    if (!text) return

    setScreen('viewer')
    setLoading(true)
    setError(null)
    setImageUrl(null)
    setRawBase64(null)
    setViewerStatus('⏳ Generating via Make.com…')

    const newSession = generateSessionId()
    setSessionId(newSession)

    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: text, mode: 'new', session_id: newSession }),
      })
      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Make webhook error (${response.status}): ${errText}`)
      }
      const data = await response.json()
      if (data.status !== 'ok' || !data.image_base64) {
        throw new Error('Make webhook returned no image.')
      }
      setRawBase64(data.image_base64)
      setImageUrl('data:image/png;base64,' + data.image_base64)
      setViewerStatus('Image ready.')
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message)
      setViewerStatus('Error.')
    } finally {
      setLoading(false)
    }
  }, [prompt])

  // ========== ITERATE ==========
  const handleIterate = useCallback(async (instruction) => {
    if (!rawBase64) { setError('No base image.'); return }
    setLoading(true)
    setError(null)
    setViewerStatus('⏳ Iterating via proxy…')
    try {
      const cleanBase64 = rawBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, '')
      const response = await fetch(PROXY_URL + '/api/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: cleanBase64, instruction }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `Proxy error ${response.status}`)
      if (!data.image_base64) throw new Error('Proxy returned no image.')
      setRawBase64(data.image_base64)
      setImageUrl('data:image/png;base64,' + data.image_base64)
      setViewerStatus('Iteration complete.')
    } catch (err) {
      console.error('Iteration error:', err)
      setError(err.message)
      setViewerStatus('Iteration failed.')
    } finally {
      setLoading(false)
    }
  }, [rawBase64])

  // ========== DOWNLOAD ==========
  const handleDownload = useCallback(() => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.download = 'alstom-concept-' + Date.now() + '.png'
    link.href = imageUrl
    link.click()
  }, [imageUrl])

  // ========== NAVIGATION ==========
  const handleBack = useCallback(() => {
    setScreen('home')
    setImageUrl(null)
    setRawBase64(null)
    setError(null)
    setViewerStatus('')
  }, [])

  const handleCreateFolder = useCallback(() => {
    setScreen('questions')
  }, [])

  const handleQuestionsComplete = useCallback((answers) => {
    const data = {
      prompt,
      imageUrl,
      answers,
      sessionId,
      createdAt: new Date().toISOString(),
    }
    setFolderData(data)
    setScreen('feedback')
  }, [prompt, imageUrl, sessionId])

  const handleFeedbackContinue = useCallback((feedback) => {
    setAiFeedback(feedback)
    // Next step: pitch folder screen (coming soon)
    console.log('✅ Folder data:', folderData)
    console.log('✅ AI Feedback:', feedback)
    setScreen('viewer')
  }, [folderData])

  return (
    <>
      <Background />
      <TopBar
        downloadEnabled={!!imageUrl && !loading}
        onDownload={handleDownload}
      />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: 64 }}>
        {screen === 'home' && (
          <HomeScreen
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            status={homeStatus}
            loading={loading}
          />
        )}
        {screen === 'viewer' && (
          <ViewerScreen
            imageUrl={imageUrl}
            loading={loading}
            status={viewerStatus}
            error={error}
            onIterate={handleIterate}
            onDownload={handleDownload}
            onBack={handleBack}
            onCreateFolder={handleCreateFolder}
          />
        )}
        {screen === 'questions' && (
          <QuestionsScreen
            onComplete={handleQuestionsComplete}
            onBack={() => setScreen('viewer')}
          />
        )}
        {screen === 'feedback' && folderData && (
          <FeedbackScreen
            folderData={folderData}
            onContinue={handleFeedbackContinue}
            onBack={() => setScreen('questions')}
          />
        )}
      </main>
    </>
  )
}