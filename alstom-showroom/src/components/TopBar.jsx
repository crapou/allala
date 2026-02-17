import '../styles/topbar.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'viewer', label: 'Image' },
  { id: 'questions', label: 'Questions' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'trends', label: 'Trends' },
  { id: 'deepdive', label: 'Deep Dive' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'record', label: 'Record' },
  { id: 'folder', label: 'Folder' },
]

export default function TopBar({ downloadEnabled, onDownload, currentScreen, onNavigate }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-dot" />
        <div className="topbar-titles">
          <span className="topbar-name">Alstom Showroom</span>
          <span className="topbar-tag">AI PITCH FOLDER</span>
        </div>
      </div>

      <nav className="topbar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`topbar-nav-item ${currentScreen === item.id ? 'topbar-nav-active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="topbar-right">
        {downloadEnabled && (
          <button className="topbar-dl" onClick={onDownload}>↓</button>
        )}
      </div>
    </header>
  )
}