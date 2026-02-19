import { useState, useRef, useEffect, useCallback } from 'react'
import '../styles/record.css'

const PROXY_URL = 'https://alstom-proxy.onrender.com'

const MASKS = [
  { id: 'none', label: 'No Mask', icon: '👤' },
  { id: 'robot', label: 'Robot', icon: '🤖' },
  { id: 'cat', label: 'Cat', icon: '🐱' },
  { id: 'dog', label: 'Dog', icon: '🐕' },
  { id: 'fox', label: 'Fox', icon: '🦊' },
  { id: 'alien', label: 'Alien', icon: '👽' },
  { id: 'skull', label: 'Skull', icon: '💀' },
  { id: 'clown', label: 'Clown', icon: '🤡' },
]

// ===== MASK DRAWING =====
function drawRobotMask(ctx, lm, w, h) {
  const nose = lm[1], le = lm[33], re = lm[263], chin = lm[152], fh = lm[10], lc = lm[234], rc = lm[454]
  const mT = lm[13], mB = lm[14], mL = lm[61], mR = lm[291]
  const fw = Math.abs(rc.x - lc.x) * w
  const cx = nose.x * w, cy = nose.y * h

  ctx.save()
  ctx.strokeStyle = '#00cec9'; ctx.lineWidth = 2; ctx.shadowColor = '#00cec9'; ctx.shadowBlur = 15
  const fx = cx - fw*0.55, fy = fh.y*h - (Math.abs(chin.y-fh.y)*h)*0.1
  const fW = fw*1.1, fH = (Math.abs(chin.y-fh.y)*h)*1.15
  ctx.beginPath(); ctx.roundRect(fx, fy, fW, fH, 12); ctx.stroke()
  ctx.fillStyle = 'rgba(0,206,201,0.06)'; ctx.fill()

  const es = fw*0.12
  ctx.strokeStyle = '#6c5ce7'; ctx.shadowColor = '#6c5ce7'; ctx.shadowBlur = 20; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.arc(le.x*w, le.y*h, es, 0, Math.PI*2); ctx.stroke()
  ctx.fillStyle = 'rgba(108,92,231,0.15)'; ctx.fill()
  ctx.beginPath(); ctx.arc(re.x*w, re.y*h, es, 0, Math.PI*2); ctx.stroke(); ctx.fill()

  ctx.fillStyle = '#6c5ce7'; ctx.shadowBlur = 10
  ctx.beginPath(); ctx.arc(le.x*w, le.y*h, es*0.35, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(re.x*w, re.y*h, es*0.35, 0, Math.PI*2); ctx.fill()

  const mw = Math.abs(mR.x-mL.x)*w, mh = Math.abs(mB.y-mT.y)*h
  const mx = mL.x*w, my = mT.y*h
  ctx.strokeStyle = '#00cec9'; ctx.shadowColor = '#00cec9'; ctx.shadowBlur = 12; ctx.lineWidth = 2
  for(let i=0;i<5;i++){
    const intensity = Math.sin(Date.now()/200+i)*0.5+0.5
    ctx.fillStyle=`rgba(0,206,201,${0.3+intensity*0.5})`
    ctx.beginPath(); ctx.roundRect(mx+i*(mw/5)+2, my, mw/5-4, mh+4, 2); ctx.fill(); ctx.stroke()
  }

  ctx.strokeStyle='#00cec9'; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(cx,fy); ctx.lineTo(cx,fy-fH*0.15); ctx.stroke()
  ctx.beginPath(); ctx.arc(cx,fy-fH*0.15-4,4,0,Math.PI*2)
  ctx.fillStyle='#e056fd'; ctx.shadowColor='#e056fd'; ctx.shadowBlur=15; ctx.fill()
  ctx.restore()
}

function drawCatMask(ctx, lm, w, h) {
  const nose=lm[1],le=lm[33],re=lm[263],fh=lm[10],lc=lm[234],rc=lm[454],mL=lm[61],mR=lm[291],mT=lm[13]
  const fw=Math.abs(rc.x-lc.x)*w, es=fw*0.10

  ctx.save()
  const earS=fw*0.3
  // Left ear
  ctx.fillStyle='rgba(255,180,200,0.7)'
  ctx.beginPath()
  ctx.moveTo(le.x*w-earS*0.4,fh.y*h-earS*0.2)
  ctx.lineTo(le.x*w,fh.y*h-earS*1.0)
  ctx.lineTo(le.x*w+earS*0.4,fh.y*h-earS*0.2)
  ctx.closePath(); ctx.fill()
  // Right ear
  ctx.beginPath()
  ctx.moveTo(re.x*w-earS*0.4,fh.y*h-earS*0.2)
  ctx.lineTo(re.x*w,fh.y*h-earS*1.0)
  ctx.lineTo(re.x*w+earS*0.4,fh.y*h-earS*0.2)
  ctx.closePath(); ctx.fill()

  // Eyes
  ctx.strokeStyle='#2ecc71'; ctx.lineWidth=3; ctx.shadowColor='#2ecc71'; ctx.shadowBlur=15
  ctx.beginPath(); ctx.ellipse(le.x*w,le.y*h,es*1.2,es*0.7,0,0,Math.PI*2); ctx.stroke()
  ctx.fillStyle='rgba(46,204,113,0.2)'; ctx.fill()
  ctx.beginPath(); ctx.ellipse(re.x*w,re.y*h,es*1.2,es*0.7,0,0,Math.PI*2); ctx.stroke(); ctx.fill()
  ctx.fillStyle='#2ecc71'; ctx.shadowBlur=0
  ctx.beginPath(); ctx.ellipse(le.x*w,le.y*h,es*0.15,es*0.55,0,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(re.x*w,re.y*h,es*0.15,es*0.55,0,0,Math.PI*2); ctx.fill()

  // Nose
  ctx.fillStyle='rgba(255,120,160,0.8)'; const ns=fw*0.06
  ctx.beginPath()
  ctx.moveTo(nose.x*w,nose.y*h-ns*0.3)
  ctx.lineTo(nose.x*w-ns,nose.y*h+ns*0.6)
  ctx.lineTo(nose.x*w+ns,nose.y*h+ns*0.6)
  ctx.closePath(); ctx.fill()

  // Whiskers
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1.5
  const wL=fw*0.35, ny=mT.y*h
  ctx.beginPath(); ctx.moveTo(mL.x*w,ny-4); ctx.lineTo(mL.x*w-wL,ny-15); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(mL.x*w,ny); ctx.lineTo(mL.x*w-wL,ny); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(mL.x*w,ny+4); ctx.lineTo(mL.x*w-wL,ny+15); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(mR.x*w,ny-4); ctx.lineTo(mR.x*w+wL,ny-15); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(mR.x*w,ny); ctx.lineTo(mR.x*w+wL,ny); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(mR.x*w,ny+4); ctx.lineTo(mR.x*w+wL,ny+15); ctx.stroke()
  ctx.restore()
}

function drawDogMask(ctx, lm, w, h) {
  const nose=lm[1],le=lm[33],re=lm[263],fh=lm[10],chin=lm[152],lc=lm[234],rc=lm[454]
  const fw=Math.abs(rc.x-lc.x)*w
  ctx.save()
  const earW=fw*0.3, earH=fw*0.55
  ctx.fillStyle='rgba(139,90,43,0.75)'
  ctx.beginPath(); ctx.ellipse(le.x*w-earW*0.3,fh.y*h+earH*0.3,earW*0.45,earH,-0.2,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(re.x*w+earW*0.3,fh.y*h+earH*0.3,earW*0.45,earH,0.2,0,Math.PI*2); ctx.fill()

  const ns=fw*0.1
  ctx.fillStyle='rgba(30,30,30,0.85)'
  ctx.beginPath(); ctx.ellipse(nose.x*w,nose.y*h,ns*1.2,ns*0.9,0,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='rgba(255,255,255,0.3)'
  ctx.beginPath(); ctx.ellipse(nose.x*w-ns*0.3,nose.y*h-ns*0.2,ns*0.25,ns*0.2,-0.3,0,Math.PI*2); ctx.fill()

  ctx.fillStyle='rgba(255,100,120,0.8)'
  ctx.beginPath(); ctx.ellipse(nose.x*w,chin.y*h-fw*0.05,fw*0.08,fw*0.12,0,0,Math.PI); ctx.fill()

  const eyeS=fw*0.11
  ctx.fillStyle='rgba(60,40,20,0.85)'
  ctx.beginPath(); ctx.arc(le.x*w,le.y*h,eyeS,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(re.x*w,re.y*h,eyeS,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='rgba(255,255,255,0.7)'
  ctx.beginPath(); ctx.arc(le.x*w-eyeS*0.25,le.y*h-eyeS*0.25,eyeS*0.3,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(re.x*w-eyeS*0.25,re.y*h-eyeS*0.25,eyeS*0.3,0,Math.PI*2); ctx.fill()
  ctx.restore()
}

function drawGenericMask(ctx, lm, w, h, color, emoji) {
  const nose=lm[1],le=lm[33],re=lm[263],lc=lm[234],rc=lm[454]
  const fw=Math.abs(rc.x-lc.x)*w
  ctx.save()
  ctx.font=`${fw*0.8}px serif`
  ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.globalAlpha=0.7
  ctx.fillText(emoji, nose.x*w, nose.y*h)
  ctx.globalAlpha=1
  ctx.restore()
}

const MASK_DRAW = {
  robot: drawRobotMask,
  cat: drawCatMask,
  dog: drawDogMask,
  fox: (ctx,lm,w,h) => drawGenericMask(ctx,lm,w,h,'#e67e22','🦊'),
  alien: (ctx,lm,w,h) => drawGenericMask(ctx,lm,w,h,'#00cec9','👽'),
  skull: (ctx,lm,w,h) => drawGenericMask(ctx,lm,w,h,'#fff','💀'),
  clown: (ctx,lm,w,h) => drawGenericMask(ctx,lm,w,h,'#e74c3c','🤡'),
}

export default function RecordScreen({ pitchText, folderData, aiFeedback, deepDiveAnswers, onComplete, onBack }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const animRef = useRef(null)
  const faceMeshRef = useRef(null)
  const landmarksRef = useRef(null)
  const selectedMaskRef = useRef('none')

  const [stream, setStream] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [faceTracking, setFaceTracking] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef(null)

  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordedUrl, setRecordedUrl] = useState(null)

  const [currentPitch, setCurrentPitch] = useState(pitchText || '')
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2)
  const teleRef = useRef(null)
  const scrollRef = useRef(null)

  const [generatingPitch, setGeneratingPitch] = useState(false)
  const [selectedMask, setSelectedMask] = useState('none')

  useEffect(() => { selectedMaskRef.current = selectedMask }, [selectedMask])

  // === INIT CAMERA + FACE MESH ===
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        // Start camera
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        })
        if (cancelled) { mediaStream.getTracks().forEach(t => t.stop()); return }
        setStream(mediaStream)

        const video = videoRef.current
        if (!video) return
        video.srcObject = mediaStream
        await video.play()
        setCameraReady(true)

        // Try to load FaceMesh
        try {
          const { FaceMesh } = await import('@mediapipe/face_mesh')
          const { Camera } = await import('@mediapipe/camera_utils')

          const fm = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
          })
          fm.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })

          fm.onResults((results) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              const raw = results.multiFaceLandmarks[0]
              landmarksRef.current = raw.map(l => ({ x: 1 - l.x, y: l.y, z: l.z }))
              if (!faceTracking) setFaceTracking(true)
            } else {
              landmarksRef.current = null
            }
          })

          faceMeshRef.current = fm

          const cam = new Camera(video, {
            onFrame: async () => { if (faceMeshRef.current) await faceMeshRef.current.send({ image: video }) },
            width: 1280, height: 720,
          })
          await cam.start()

        } catch (fmErr) {
          console.warn('FaceMesh failed to load, running without face tracking:', fmErr)
          // Camera still works, just no face tracking
        }

        // Start canvas render loop
        const renderLoop = () => {
          const canvas = canvasRef.current
          const vid = videoRef.current
          if (!canvas || !vid || vid.readyState < 2) {
            animRef.current = requestAnimationFrame(renderLoop)
            return
          }
          const ctx = canvas.getContext('2d')
          canvas.width = vid.videoWidth
          canvas.height = vid.videoHeight

          // Draw mirrored video
          ctx.save()
          ctx.scale(-1, 1)
          ctx.drawImage(vid, -canvas.width, 0, canvas.width, canvas.height)
          ctx.restore()

          // Draw mask if face detected
          if (landmarksRef.current && selectedMaskRef.current !== 'none') {
            const drawFn = MASK_DRAW[selectedMaskRef.current]
            if (drawFn) drawFn(ctx, landmarksRef.current, canvas.width, canvas.height)
          }

          animRef.current = requestAnimationFrame(renderLoop)
        }
        animRef.current = requestAnimationFrame(renderLoop)

      } catch (err) {
        console.error('Init error:', err)
        if (!cancelled) setCameraError('Could not access camera. Please allow permissions.')
      }
    }

    init()

    return () => {
      cancelled = true
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (faceMeshRef.current) { try { faceMeshRef.current.close() } catch(e){} }
    }
  }, [])

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [stream])

  // === RECORDING ===
  const startRecording = useCallback(() => {
    if (!canvasRef.current || !stream) return
    chunksRef.current = []
    const cs = canvasRef.current.captureStream(30)
    const audio = stream.getAudioTracks()[0]
    if (audio) cs.addTrack(audio)

    const rec = new MediaRecorder(cs, { mimeType: 'video/webm;codecs=vp9,opus' })
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setRecordedBlob(blob)
      setRecordedUrl(URL.createObjectURL(blob))
    }
    mediaRecorderRef.current = rec
    rec.start()
    setIsRecording(true)
    setRecordingTime(0)
    timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)

    if (teleRef.current) {
      teleRef.current.scrollTop = 0
      scrollRef.current = setInterval(() => {
        if (teleRef.current) teleRef.current.scrollTop += teleprompterSpeed
      }, 50)
    }
  }, [stream, teleprompterSpeed])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      if (scrollRef.current) clearInterval(scrollRef.current)
    }
  }, [isRecording])

  // === AI PITCH ===
  const generateAIPitch = async () => {
    setGeneratingPitch(true)
    try {
      const res = await fetch(PROXY_URL + '/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: folderData?.prompt, answers: folderData?.answers, feedback: aiFeedback, deepDiveAnswers }),
      })
      const data = await res.json()
      if (data.pitch) setCurrentPitch(data.pitch)
    } catch (err) { console.error(err) }
    finally { setGeneratingPitch(false) }
  }

  const fmt = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  // === RESULT ===
  if (recordedUrl) {
    return (
      <section className="record">
        <div className="record-inner">
          <div className="record-header fade-up">
            <h2 className="record-title">🎬 Your Pitch Recording</h2>
            <div className="record-duration">{fmt(recordingTime)}</div>
          </div>
          <div className="record-preview fade-up" style={{animationDelay:'0.1s'}}>
            <video className="record-playback" src={recordedUrl} controls playsInline />
          </div>
          <div className="record-result-actions fade-up" style={{animationDelay:'0.2s'}}>
            <button className="btn btn-secondary" onClick={() => { setRecordedBlob(null); setRecordedUrl(null) }}>🔄 Re-record</button>
            <button className="record-save-btn" onClick={() => onComplete({ blob: recordedBlob, url: recordedUrl, duration: recordingTime })}>
              ✅ Save & Create Folder
            </button>
          </div>
        </div>
      </section>
    )
  }

  // === RECORDING VIEW ===
  return (
    <section className="record">
      <div className="record-inner">
        <div className="record-header fade-up">
          <button className="record-back" onClick={onBack}>← Back to Pitch</button>
          <h2 className="record-title">{isRecording ? '🔴 Recording…' : '📹 Record your pitch'}</h2>
        </div>

        <div className="record-layout">
          <div className="record-camera-wrap fade-up" style={{animationDelay:'0.1s'}}>
            {cameraError ? (
              <div className="record-camera-error">{cameraError}</div>
            ) : (
              <>
                <video ref={videoRef} style={{display:'none'}} autoPlay muted playsInline />
                <canvas ref={canvasRef} className="record-camera" />
                {isRecording && (
                  <div className="record-live-badge">
                    <span className="record-live-dot" />{fmt(recordingTime)}
                  </div>
                )}
                {cameraReady && !isRecording && (
                  <div className={`record-face-hint ${faceTracking ? 'record-face-ok' : ''}`}>
                    {faceTracking ? '✓ Face tracking active' : 'Loading face detection…'}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="record-tele-wrap fade-up" style={{animationDelay:'0.2s'}}>
            <div className="record-tele-header">
              <h3 className="record-tele-title">📜 Teleprompter</h3>
              <div className="record-tele-controls">
                <label className="record-tele-speed-label">Speed</label>
                <input type="range" min="1" max="5" value={teleprompterSpeed}
                  onChange={(e) => setTeleprompterSpeed(Number(e.target.value))}
                  className="record-tele-speed" />
              </div>
            </div>
            <div className="record-tele-scroll" ref={teleRef}>
              <div className="record-tele-text">{currentPitch || 'No pitch yet. Generate one with AI below.'}</div>
              <div className="record-tele-spacer" />
            </div>
            {!isRecording && (
              <button className="record-ai-btn" onClick={generateAIPitch} disabled={generatingPitch}>
                {generatingPitch ? <><span className="record-ai-spinner"/>Generating…</> : <>✨ Generate AI Pitch</>}
              </button>
            )}
          </div>
        </div>

        {/* Mask selector */}
        {!isRecording && (
          <div className="record-avatars fade-up" style={{animationDelay:'0.3s'}}>
            <h3 className="record-avatars-title">
              🎭 Face Masks
              {faceTracking && <span className="record-face-status"> — tracking active</span>}
              {!faceTracking && cameraReady && <span className="record-face-status record-face-loading"> — loading…</span>}
            </h3>
            <div className="record-avatars-grid">
              {MASKS.map(m => (
                <button key={m.id}
                  className={`record-avatar-btn ${selectedMask === m.id ? 'record-avatar-active' : ''}`}
                  onClick={() => setSelectedMask(m.id)}>
                  <span className="record-avatar-icon">{m.icon}</span>
                  <span className="record-avatar-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="record-controls fade-up" style={{animationDelay:'0.4s'}}>
          {!isRecording ? (
            <button className="record-start-btn" onClick={startRecording} disabled={!cameraReady}>
              <span className="record-start-circle"/>Start Recording
            </button>
          ) : (
            <button className="record-stop-btn" onClick={stopRecording}>
              <span className="record-stop-square"/>End Recording
            </button>
          )}
        </div>
      </div>
    </section>
  )
}