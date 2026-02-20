import PromptBar from './PromptBar'
import alstomLogo from '../assets/alstom-logo.png'
import '../styles/home.css'

export default function HomeScreen({ prompt, setPrompt, onGenerate, status, loading, userImage, setUserImage }) {
  return (
    <section className="home">
      <div className="home-inner">
        <img className="home-logo fade-up fade-up-delay-1" src={alstomLogo} alt="Alstom" />

        <div className="home-badge fade-up fade-up-delay-2">
          <span className="badge-dot" />
          AI-Powered Concept Generator
        </div>

        <h1 className="home-h1 fade-up fade-up-delay-3">
          Bring your vision<br />to life
        </h1>

        <p className="home-p fade-up fade-up-delay-4">
          Describe your idea. The AI generates a photorealistic concept
          you can iterate on, pitch, and share.
        </p>

        <div className="fade-up fade-up-delay-4">
          <PromptBar
            value={prompt}
            onChange={setPrompt}
            onSubmit={onGenerate}
            placeholder="Describe your concept idea…"
            buttonText={loading ? 'Generating…' : 'Generate'}
            disabled={loading}
            onAttach={setUserImage}
            attachment={userImage}
            onRemoveAttachment={() => setUserImage(null)}
          />
        </div>

        {status && (
          <div className="home-status">{status}</div>
        )}
      </div>
    </section>
  )
}