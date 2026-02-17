import { useState, useCallback } from 'react'
import Background from './components/Background'
import TopBar from './components/TopBar'
import HomeScreen from './components/HomeScreen'
import ViewerScreen from './components/ViewerScreen'
import QuestionsScreen from './components/QuestionsScreen'
import FeedbackScreen from './components/FeedbackScreen'
import TrendsScreen from './components/TrendsScreen'
import TrendDetailScreen from './components/TrendDetailScreen'
import DeepDiveScreen from './components/DeepDiveScreen'
import PitchScreen from './components/PitchScreen'
import RecordScreen from './components/RecordScreen'
import FolderScreen from './components/FolderScreen'

const PROXY_URL = 'https://alstom-proxy.onrender.com'

function generateSessionId() {
  return 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [prompt, setPrompt] = useState('')
  const [homeStatus, setHomeStatus] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [rawBase64, setRawBase64] = useState(null)
  const [viewerStatus, setViewerStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(generateSessionId)
  const [folderData, setFolderData] = useState(null)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [activeTrend, setActiveTrend] = useState(null)
  const [deepDiveAnswers, setDeepDiveAnswers] = useState(null)
  const [pitchText, setPitchText] = useState('')
  const [recordingData, setRecordingData] = useState(null)

  // Nav handler - allows jumping to any screen
  const handleNavigate = useCallback((targetScreen) => {
    // Initialize folderData if jumping ahead without it
    if (!folderData && ['feedback','trends','deepdive','pitch','record','folder'].includes(targetScreen)) {
      setFolderData({
        prompt: prompt || 'Demo project',
        imageUrl: imageUrl,
        answers: { problem: '', audience: '', solution: '', advantage: '', impact: '' },
        sessionId,
        createdAt: new Date().toISOString(),
      })
    }
    setScreen(targetScreen)
  }, [folderData, prompt, imageUrl, sessionId])

  const handleGenerate = useCallback(async () => {
    const text = prompt.trim()
    if (!text) return
    setScreen('viewer')
    setLoading(true)
    setError(null)
    setImageUrl(null)
    setRawBase64(null)
    setViewerStatus('⏳ Generating image…')
    const newSession = generateSessionId()
    setSessionId(newSession)
    try {
      const response = await fetch(PROXY_URL + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: text }),
      })
      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Proxy error (${response.status}): ${errText}`)
      }
      const data = await response.json()
      if (data.status !== 'ok' || !data.image_base64) throw new Error(data.error || 'No image returned.')
      setRawBase64(data.image_base64)
      setImageUrl('data:image/png;base64,' + data.image_base64)
      setViewerStatus('Image ready.')
    } catch (err) {
      console.error(err)
      setError(err.message)
      setViewerStatus('Error.')
    } finally {
      setLoading(false)
    }
  }, [prompt])

  const handleIterate = useCallback(async (instruction) => {
    if (!rawBase64) { setError('No base image.'); return }
    setLoading(true)
    setError(null)
    setViewerStatus('⏳ Iterating…')
    try {
      const clean = rawBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, '')
      const response = await fetch(PROXY_URL + '/api/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: clean, instruction }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Proxy error')
      if (!data.image_base64) throw new Error('No image returned.')
      setRawBase64(data.image_base64)
      setImageUrl('data:image/png;base64,' + data.image_base64)
      setViewerStatus('Iteration complete.')
    } catch (err) {
      console.error(err)
      setError(err.message)
      setViewerStatus('Iteration failed.')
    } finally {
      setLoading(false)
    }
  }, [rawBase64])

  const handleDownload = useCallback(() => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.download = 'alstom-concept-' + Date.now() + '.png'
    a.href = imageUrl
    a.click()
  }, [imageUrl])

  const handleBackHome = useCallback(() => {
    setScreen('home')
    setPrompt('')
    setImageUrl(null)
    setRawBase64(null)
    setError(null)
    setViewerStatus('')
    setFolderData(null)
    setAiFeedback(null)
    setDeepDiveAnswers(null)
    setPitchText('')
    setRecordingData(null)
    setActiveTrend(null)
  }, [])

  const handleQuestionsComplete = useCallback((answers) => {
    setFolderData({ prompt, imageUrl, answers, sessionId, createdAt: new Date().toISOString() })
    setScreen('feedback')
  }, [prompt, imageUrl, sessionId])

  const handleFeedbackContinue = useCallback((feedback) => {
    setAiFeedback(feedback)
    setScreen('trends')
  }, [])

  const handleReadTrend = useCallback((trendId) => {
    setActiveTrend(trendId)
    setScreen('trendDetail')
  }, [])

  const handleDeepDiveComplete = useCallback((answers) => {
    setDeepDiveAnswers(answers)
    setScreen('pitch')
  }, [])

  const handleRecordComplete = useCallback((data) => {
    setRecordingData(data)
    setScreen('folder')
  }, [])

  return (
    <>
      <Background />
      <TopBar
        downloadEnabled={!!imageUrl && !loading}
        onDownload={handleDownload}
        currentScreen={screen}
        onNavigate={handleNavigate}
      />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: 64 }}>
        {screen === 'home' && (
          <HomeScreen prompt={prompt} setPrompt={setPrompt} onGenerate={handleGenerate} status={homeStatus} loading={loading} />
        )}
        {screen === 'viewer' && (
          <ViewerScreen imageUrl={imageUrl} loading={loading} status={viewerStatus} error={error} onIterate={handleIterate} onDownload={handleDownload} onBack={handleBackHome} onCreateFolder={() => setScreen('questions')} />
        )}
        {screen === 'questions' && (
          <QuestionsScreen onComplete={handleQuestionsComplete} onBack={() => setScreen('viewer')} />
        )}
        {screen === 'feedback' && folderData && (
          <FeedbackScreen folderData={folderData} onContinue={handleFeedbackContinue} onBack={() => setScreen('questions')} />
        )}
        {screen === 'trends' && (
          <TrendsScreen onReadTrend={handleReadTrend} onBack={() => setScreen('feedback')} onContinue={() => setScreen('deepdive')} />
        )}
        {screen === 'trendDetail' && activeTrend && (
          <TrendDetailScreen trendId={activeTrend} onBack={() => setScreen('trends')} />
        )}
        {screen === 'deepdive' && folderData && (
          <DeepDiveScreen folderData={folderData} aiFeedback={aiFeedback} onComplete={handleDeepDiveComplete} onBack={() => setScreen('trends')} />
        )}
        {screen === 'pitch' && (
          <PitchScreen folderData={folderData} onBack={() => setScreen('deepdive')} onRecord={() => setScreen('record')} pitchText={pitchText} setPitchText={setPitchText} />
        )}
        {screen === 'record' && (
          <RecordScreen pitchText={pitchText} folderData={folderData} aiFeedback={aiFeedback} deepDiveAnswers={deepDiveAnswers} onComplete={handleRecordComplete} onBack={() => setScreen('pitch')} />
        )}
        {screen === 'folder' && (
          <FolderScreen folderData={folderData} aiFeedback={aiFeedback} deepDiveAnswers={deepDiveAnswers} pitchText={pitchText} recordingData={recordingData} onBackHome={handleBackHome} />
        )}
      </main>
    </>
  )
}