import '../styles/trends.css'

const TRENDS = [
  {
    id: 'population',
    number: '01',
    title: 'Population',
    subtitle: 'Demographic, Social & Behavioral Transformations',
    description: 'Asia-Pacific faces two opposing forces: explosive youth-driven growth in South Asia and rapid aging in East Asia. These shifts reshape mobility, labor, and urban life.',
    gradient: 'linear-gradient(135deg, #0984e3, #6c5ce7)',
    shadow: 'rgba(108, 92, 231, 0.4)',
    icon: '🌏',
  },
  {
    id: 'environment',
    number: '02',
    title: 'Environment',
    subtitle: 'Climate, Energy Transition & Circularity',
    description: 'APAC is warming at 2× the global average. Extreme weather, decarbonization urgency, and renewable acceleration are redefining infrastructure and investment.',
    gradient: 'linear-gradient(135deg, #00b894, #00cec9)',
    shadow: 'rgba(0, 206, 201, 0.4)',
    icon: '🌱',
  },
  {
    id: 'geopolitics',
    number: '03',
    title: 'Geopolitics & Finance',
    subtitle: 'Strategic Rivalries & Financial Transformation',
    description: 'Trade wars, supply-chain reshoring, and digital finance are reshaping alliances. APAC needs $1.1T/year for climate alone — new financing models are emerging.',
    gradient: 'linear-gradient(135deg, #e17055, #fdcb6e)',
    shadow: 'rgba(253, 203, 110, 0.4)',
    icon: '⚡',
  },
  {
    id: 'technology',
    number: '04',
    title: 'Technology',
    subtitle: 'Platforms, Electrification & Critical Minerals',
    description: 'EVs, robotics, AI platforms, and critical minerals are the new operating system of APAC\'s economy. China leads EV manufacturing with 70% of global capacity.',
    gradient: 'linear-gradient(135deg, #e056fd, #a29bfe)',
    shadow: 'rgba(162, 155, 254, 0.4)',
    icon: '🔮',
  },
]

export default function TrendsScreen({ onReadTrend, onBack, onContinue }) {
  return (
    <section className="trends">
      <div className="trends-inner">
        <div className="trends-header fade-up">
          <button className="btn-back-trends" onClick={onBack}>← Back to Feedback</button>
          <div className="trends-badge">
            <span className="trends-badge-dot" />
            Strategic Intelligence
          </div>
          <h1 className="trends-h1">Mega-Trends Shaping APAC</h1>
          <p className="trends-p">
            Explore the 4 structural forces transforming Asia-Pacific.
            Each trend includes data, analysis, and strategic implications.
          </p>
        </div>

        <div className="trends-grid">
          {TRENDS.map((trend, i) => (
            <div
              key={trend.id}
              className="trend-book fade-up"
              style={{ animationDelay: `${0.2 + i * 0.12}s` }}
              onClick={() => onReadTrend(trend.id)}
            >
              <div className="trend-book-spine" style={{ background: trend.gradient }} />
              <div className="trend-book-cover">
                <div className="trend-book-glow" style={{ background: trend.gradient, boxShadow: `0 20px 60px ${trend.shadow}` }} />
                <div className="trend-book-content">
                  <span className="trend-icon">{trend.icon}</span>
                  <span className="trend-number">{trend.number}</span>
                  <h3 className="trend-title">{trend.title}</h3>
                  <p className="trend-subtitle">{trend.subtitle}</p>
                  <p className="trend-desc">{trend.description}</p>
                  <div className="trend-read-btn">Read →</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue CTA */}
        <div className="trends-continue fade-up" style={{ animationDelay: '0.7s' }}>
          <button className="trends-continue-btn" onClick={onContinue}>
            <span className="trends-continue-text">
              <span className="trends-continue-title">Ready to go deeper?</span>
              <span className="trends-continue-sub">AI will generate questions connecting your project to the most relevant trends</span>
            </span>
            <span className="trends-continue-arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}