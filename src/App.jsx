import { useState, useCallback } from 'react'
import Background from './components/Background'
import TopBar from './components/TopBar'
import HomeScreen from './components/HomeScreen'
import ViewerScreen from './components/ViewerScreen'
import QuestionsScreen from './components/QuestionsScreen'
import FeedbackScreen from './components/FeedbackScreen'
import ElaborationScreen from './components/ElaborationScreen'
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
  // Screen navigation
  const [screen, setScreen] = useState('home')

  // Home / Generation
  const [prompt, setPrompt] = useState('')
  const [homeStatus, setHomeStatus] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [rawBase64, setRawBase64] = useState(null)
  const [viewerStatus, setViewerStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(generateSessionId)
  const [promptHistory, setPromptHistory] = useState([])

  // User uploaded reference image
  const [userImage, setUserImage] = useState(null)

  // Data collected through the flow
  const [folderData, setFolderData] = useState(null)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [elaborationAnswers, setElaborationAnswers] = useState(null)
  const [trendReactions, setTrendReactions] = useState({})
  const [activeTrend, setActiveTrend] = useState(null)
  const [deepDiveAnswers, setDeepDiveAnswers] = useState(null)
  const [pitchText, setPitchText] = useState('')
  const [recordingData, setRecordingData] = useState(null)

  // ========== NAV (skip to any screen) ==========
  const handleNavigate = useCallback((targetScreen) => {
    if (!folderData && ['feedback','elaboration','trends','deepdive','pitch','record','folder'].includes(targetScreen)) {
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

  // ========== GENERATE ==========
  const handleGenerate = useCallback(async () => {
    const text = prompt.trim()
    if (!text) return
    setScreen('viewer')
    setLoading(true)
    setError(null)
    setImageUrl(null)
    setRawBase64(null)
    setViewerStatus('⏳ Generating image…')
    setPromptHistory([{ text, type: 'generate' }])
    const newSession = generateSessionId()
    setSessionId(newSession)
    try {
      const response = await fetch(PROXY_URL + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: text,
          userImage: userImage?.base64 || null,
        }),
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
  }, [prompt, userImage])

  // ========== ITERATE ==========
  const handleIterate = useCallback(async (instruction) => {
    if (!rawBase64) { setError('No base image.'); return }
    setLoading(true)
    setError(null)
    setViewerStatus('⏳ Iterating…')
    setPromptHistory(prev => [...prev, { text: instruction, type: 'iterate' }])
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

  // ========== REGENERATE (with new user image) ==========
  const handleRegenerate = useCallback(() => {
    if (!prompt.trim()) return
    handleGenerate()
  }, [prompt, handleGenerate])

  // ========== DOWNLOAD ==========
  const handleDownload = useCallback(() => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.download = 'alstom-concept-' + Date.now() + '.png'
    a.href = imageUrl
    a.click()
  }, [imageUrl])

  // ========== BACK HOME (reset all) ==========
  const handleBackHome = useCallback(() => {
    setScreen('home')
    setPrompt('')
    setPromptHistory([])
    setImageUrl(null)
    setRawBase64(null)
    setError(null)
    setViewerStatus('')
    setUserImage(null)
    setFolderData(null)
    setAiFeedback(null)
    setElaborationAnswers(null)
    setTrendReactions({})
    setDeepDiveAnswers(null)
    setPitchText('')
    setRecordingData(null)
    setActiveTrend(null)
  }, [])

  // ========== FLOW HANDLERS ==========

  // Questions → Feedback
  const handleQuestionsComplete = useCallback((answers) => {
    setFolderData({
      prompt,
      imageUrl,
      answers,
      sessionId,
      createdAt: new Date().toISOString(),
    })
    setScreen('feedback')
  }, [prompt, imageUrl, sessionId])

  // Feedback → Elaboration
  const handleFeedbackContinue = useCallback((feedback) => {
    setAiFeedback(feedback)
    setScreen('elaboration')
  }, [])

  // Elaboration → Trends
  const handleElaborationContinue = useCallback((elaborations) => {
    setElaborationAnswers(elaborations)
    setScreen('trends')
  }, [])

  // Trend detail: save a comment
  const handleSaveTrendReaction = useCallback((trendId, itemKey, comment) => {
    setTrendReactions(prev => ({
      ...prev,
      [trendId]: { ...prev[trendId], [itemKey]: comment },
    }))
  }, [])

  // Trends → read one trend
  const handleReadTrend = useCallback((trendId) => {
    setActiveTrend(trendId)
    setScreen('trendDetail')
  }, [])

  // Deep Dive → Pitch
  const handleDeepDiveComplete = useCallback((answers) => {
    setDeepDiveAnswers(answers)
    setScreen('pitch')
  }, [])

  // Record → Folder
  const handleRecordComplete = useCallback((data) => {
    setRecordingData(data)
    setScreen('folder')
  }, [])

  // ========== BUILD ENRICHED FOLDER DATA FOR DEEP DIVE ==========
  const enrichedFolderData = folderData ? {
    ...folderData,
    elaboration: elaborationAnswers
      ? elaborationAnswers.map(e => `[${e.type}] "${e.item}" → ${e.answer}`).join(' | ')
      : '',
    trendComments: trendReactions,
  } : null

  // ========== RENDER ==========
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
          <HomeScreen
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            status={homeStatus}
            loading={loading}
            userImage={userImage}
            setUserImage={setUserImage}
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
            onBack={handleBackHome}
            onCreateFolder={() => setScreen('questions')}
            promptHistory={promptHistory}
            userImage={userImage}
            setUserImage={setUserImage}
            onRegenerate={handleRegenerate}
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

        {screen === 'elaboration' && aiFeedback && (
          <ElaborationScreen
            feedback={aiFeedback}
            onContinue={handleElaborationContinue}
            onBack={() => setScreen('feedback')}
          />
        )}

        {screen === 'trends' && (
          <TrendsScreen
            onReadTrend={handleReadTrend}
            onBack={() => setScreen('elaboration')}
            onContinue={() => setScreen('deepdive')}
          />
        )}

        {screen === 'trendDetail' && activeTrend && (
          <TrendDetailScreen
            trendId={activeTrend}
            onBack={() => setScreen('trends')}
            reactions={trendReactions[activeTrend] || {}}
            onSaveReaction={(itemKey, comment) => handleSaveTrendReaction(activeTrend, itemKey, comment)}
          />
        )}

        {screen === 'deepdive' && enrichedFolderData && (
          <DeepDiveScreen
            folderData={enrichedFolderData}
            aiFeedback={aiFeedback}
            onComplete={handleDeepDiveComplete}
            onBack={() => setScreen('trends')}
          />
        )}

        {screen === 'pitch' && (
          <PitchScreen
            folderData={folderData}
            onBack={() => setScreen('deepdive')}
            onRecord={() => setScreen('record')}
            pitchText={pitchText}
            setPitchText={setPitchText}
          />
        )}

        {screen === 'record' && (
          <RecordScreen
            pitchText={pitchText}
            folderData={folderData}
            aiFeedback={aiFeedback}
            deepDiveAnswers={deepDiveAnswers}
            onComplete={handleRecordComplete}
            onBack={() => setScreen('pitch')}
          />
        )}

        {screen === 'folder' && (
          <FolderScreen
            folderData={folderData}
            aiFeedback={aiFeedback}
            elaborationAnswers={elaborationAnswers}
            trendReactions={trendReactions}
            deepDiveAnswers={deepDiveAnswers}
            pitchText={pitchText}
            recordingData={recordingData}
            promptHistory={promptHistory}
            onBackHome={handleBackHome}
          />
        )}

      </main>
    </>
  )
}