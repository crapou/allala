import '../styles/topbar.css'

export default function TopBar({ onDownload, downloadEnabled }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="alstom-dot" />
        <div className="topbar-title">
          <div className="topbar-name">Alstom Showroom</div>
          <div className="topbar-sub">AI Pitch Folder</div>
        </div>
      </div>
      <div className="topbar-right">
        <button
          className="btn btn-ghost"
          disabled={!downloadEnabled}
          onClick={onDownload}
        >
          Download
        </button>
      </div>
    </header>
  )
}