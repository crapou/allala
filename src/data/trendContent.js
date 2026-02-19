export const TREND_CONTENT = {
  population: {
    id: 'population',
    number: '01',
    title: 'Population',
    subtitle: 'Demographic, Social & Behavioral Transformations in Asia-Pacific',
    icon: '🌏',
    gradient: 'linear-gradient(135deg, #0984e3, #6c5ce7)',
    accentColor: '#6c5ce7',
    stats: [
      { value: '2/3', label: 'of global middle class will be Asian by 2030' },
      { value: '41%', label: 'of Japan\'s population will be 65+ by 2040' },
      { value: '0.7', label: 'fertility rate in South Korea (2023)' },
      { value: '150%', label: 'car ownership growth projected in India by 2040' },
    ],
    sections: [
      {
        icon: '📈',
        title: 'The Demographic Dividend vs. Decline',
        text: 'Asia-Pacific combines two opposing forces. South Asia (India, Indonesia, Philippines, Vietnam) experiences sustained growth with a young workforce driving economic expansion. Meanwhile East Asia (China, Japan, South Korea) faces rapid decline — fertility rates have dropped far below replacement level at 0.7 in South Korea, 1.0 in China, and 1.2 in Japan. By 2040, populations in these countries could shrink 5-8%.',
        chart: [
          { label: 'India', value: 85, display: '28→38 median age' },
          { label: 'China', value: 60, display: '-5% pop by 2040' },
          { label: 'Japan', value: 90, display: '41% elderly by 2040' },
          { label: 'S. Korea', value: 95, display: '0.7 fertility rate' },
        ],
      },
      {
        icon: '🏙️',
        title: 'Mega-Urbanization',
        text: 'By 2030, over 10 Asian cities will exceed 20 million inhabitants. China\'s urbanization jumped from 50% (2010) to 64% (2025), heading toward 75% by 2035. Traffic congestion alone costs 2-5% of GDP in lost productivity across cities like Bangkok, Manila, and Bengaluru. The tension between car-centered suburban sprawl and transit-oriented development is the defining urban planning challenge.',
        highlight: 'Indonesia became the first country to relocate its capital (to Nusantara) explicitly for climate and urbanization reasons.',
      },
      {
        icon: '🔄',
        title: 'Changing Behaviors & Mobility',
        text: 'COVID-19 permanently shifted work and travel patterns. 25-30% of professionals in major Asian metros now work remotely at least once a week. Health consciousness remains high — mask wearing persists in East Asian transit. The "20-minute city" concept is gaining traction in Seoul and Melbourne. Meanwhile, ride-hailing quadrupled between 2018-2024, driven by smartphone adoption and last-mile connectivity gaps.',
        chart: [
          { label: 'Remote work', value: 30, display: '25-30%' },
          { label: 'Transit access', value: 44, display: '44% coverage' },
          { label: 'Ride-hailing', value: 75, display: '4× growth' },
        ],
      },
      {
        icon: '🌐',
        title: 'Migration, Culture & Social Tensions',
        text: 'East Asian governments are opening unprecedented migration pathways to offset labor shortages. Japan surpassed 3.4M foreign residents in 2024. But cultural shifts run deeper: China\'s "tang ping" (lying flat) and Japan\'s "oya-gacha" reflect youth rejecting traditional career and family expectations. The middle class has stagnated outside India — in Indonesia it contracted by 6 million while population grew by the same amount.',
        highlight: 'Food prices have risen 15% in the past decade, accounting for a third of household consumption — fueling civic unrest across Nepal, Indonesia, and the Philippines.',
      },
    ],
  },

  environment: {
    id: 'environment',
    number: '02',
    title: 'Environment',
    subtitle: 'Climate Acceleration, Energy Transition & Circularity in APAC',
    icon: '🌱',
    gradient: 'linear-gradient(135deg, #00b894, #00cec9)',
    accentColor: '#00cec9',
    stats: [
      { value: '2×', label: 'APAC warming rate vs. global average' },
      { value: '60%', label: 'of global emissions from APAC' },
      { value: '216 GW', label: 'solar capacity added by China in 2023' },
      { value: '-32%', label: 'renewables cheaper than coal by 2030' },
    ],
    sections: [
      {
        icon: '🌡️',
        title: 'Climate Acceleration',
        text: 'The region is warming at nearly twice the global average. South Korea broke monthly temperature records four times in 2024. Australia recorded its highest-ever insured climate losses in 2022 ($7.2B). India suffered $4.2B in flood losses. China faced drought damages of $7.6B — a 200% increase over the 20-year average. Heat deforms rail tracks, floods paralyze cities, droughts undermine hydropower.',
        chart: [
          { label: 'Australia', value: 72, display: '$7.2B losses' },
          { label: 'China', value: 76, display: '$7.6B drought' },
          { label: 'India', value: 42, display: '$4.2B floods' },
        ],
      },
      {
        icon: '⚡',
        title: 'Renewable Energy Surge',
        text: 'China installed 216 GW of solar in 2023 — the largest yearly expansion by any country ever. India targets 500 GW non-fossil capacity by 2030. Australia hit 40.3% renewables in its electricity market. New Zealand maintains 87% renewable share. By 2030, renewables in APAC will be 32% cheaper than coal.',
        chart: [
          { label: 'China solar', value: 95, display: '216 GW' },
          { label: 'India target', value: 80, display: '500 GW' },
          { label: 'Australia', value: 40, display: '40.3%' },
          { label: 'New Zealand', value: 87, display: '87%' },
        ],
      },
      {
        icon: '♻️',
        title: 'Circular Economy & Adaptation',
        text: 'South Korea quadrupled recycling rates since 1997 and cut landfill waste by 70%. India is adopting AI-based sorting. Singapore published a white paper identifying opportunities in the "adaptation economy." Green hydrogen is emerging as a key tool — Australia has $200B+ in pipeline investments. Microgrids market is projected to grow from $5.6B (2024) to $26.9B (2033).',
        highlight: 'APAC countries now recognize that climate adaptation is not just a cost — it is a major emerging economic sector attracting strategic financial investment.',
      },
    ],
  },

  geopolitics: {
    id: 'geopolitics',
    number: '03',
    title: 'Geopolitics & Finance',
    subtitle: 'Strategic Rivalries, Supply-Chain Reordering & Financial Transformation',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #e17055, #fdcb6e)',
    accentColor: '#fdcb6e',
    stats: [
      { value: '$1.1T', label: 'annual climate investment needed in APAC' },
      { value: '$800B', label: 'annual investment gap' },
      { value: '70%', label: 'of global EV capacity in China' },
      { value: 'China+1', label: 'supply chain diversification strategy' },
    ],
    sections: [
      {
        icon: '🗺️',
        title: 'Territorial & Resource Tensions',
        text: 'The India-China Himalayan border remains a persistent flashpoint. Water disputes between India and Bangladesh over the Teesta River create chronic shortages. China\'s Mekong hydropower developments affect 60 million people downstream in Cambodia, Laos, Thailand, and Vietnam. These resource-driven tensions fragment regional integration efforts.',
      },
      {
        icon: '🏭',
        title: 'Supply Chain Reconfiguration',
        text: 'The "China+1" strategy is reshaping industrial geography. Vietnam attracted Samsung, Intel, and Foxconn investments. Indonesia\'s "Making Indonesia 4.0" leverages nickel reserves for EV production. The US imposed comprehensive tariffs on Chinese goods in 2025, demanding "substantial transformation" for exemptions — pushing real local manufacturing, not just transshipment.',
        chart: [
          { label: 'Vietnam', value: 80, display: 'Electronics hub' },
          { label: 'Indonesia', value: 65, display: 'EV minerals' },
          { label: 'India', value: 70, display: 'Manufacturing' },
          { label: 'Australia', value: 55, display: 'Rare earths' },
        ],
      },
      {
        icon: '💰',
        title: 'Financial Innovation',
        text: 'India launched the Unified Markets Interface (UMI) in 2025 for tokenized government securities. Farmers in Punjab can now access micro-investments through tokenized land assets. Australia\'s Project Acacia tests tokenized carbon credits and debt instruments. Green lending is surging — Australia surpassed Singapore in 2024 for total green-loan issuance.',
        highlight: 'APAC requires $1.1 trillion annually for climate mitigation and adaptation, yet faces an investment gap of roughly $800 billion — driving entirely new financing models.',
      },
    ],
  },

  technology: {
    id: 'technology',
    number: '04',
    title: 'Technology',
    subtitle: 'Platforms, Electrification, Automation & Critical Minerals',
    icon: '🔮',
    gradient: 'linear-gradient(135deg, #e056fd, #a29bfe)',
    accentColor: '#a29bfe',
    stats: [
      { value: '70%', label: 'global EV manufacturing capacity in China' },
      { value: '$110B', label: 'projected SE Asia mining market by 2040' },
      { value: '50%', label: 'of China\'s new car sales are EVs (2024)' },
      { value: 'BATHX', label: 'Baidu, Alibaba, Tencent, Huawei, Xiaomi' },
    ],
    sections: [
      {
        icon: '📱',
        title: 'Platform Dominance & Data Power',
        text: 'China\'s BATHX conglomerates (Baidu, Alibaba, Tencent, Huawei, Xiaomi) set the pace in e-commerce, fintech, cloud infrastructure, and network equipment. Their reach extends well beyond China through hardware ecosystems and cross-border cloud services. Beijing\'s regulatory campaign to curb market power has consolidated digital capacity as a strategic state asset while neighboring economies scrutinize their platform dependencies.',
      },
      {
        icon: '🔋',
        title: 'Electrification Revolution',
        text: 'China achieved roughly 50% EV share of new vehicle sales in 2024 with 70% of global manufacturing capacity. In Thailand, Chinese brands dominate EV sales with prices matching or undercutting conventional vehicles. Malaysia\'s Perodua is developing affordable EVs. Two- and three-wheel electrification is spreading fastest across Southeast Asia — falling battery costs are the tipping point.',
        chart: [
          { label: 'China EV share', value: 50, display: '~50%' },
          { label: 'Global mfg', value: 70, display: '70%' },
          { label: 'Thailand', value: 60, display: 'Price parity' },
          { label: 'SE Asia 2W', value: 45, display: 'Rapid growth' },
        ],
      },
      {
        icon: '🤖',
        title: 'Automation & Robotics',
        text: 'Aging demographics and labor costs are pushing robotics beyond factory floors into logistics, inspection, security, and services. Singapore\'s Hyundai EV Innovation Centre uses autonomous platforms and "robot dog" inspection systems. This diffusion from industrial cells into people-dense spaces marks how APAC firms use automation to cope with talent shortages while building predictive maintenance and digital twin capabilities.',
      },
      {
        icon: '⛏️',
        title: 'Critical Minerals Battleground',
        text: 'Indonesia and Philippines dominate nickel. China controls rare earths and graphite processing. Australia leads lithium exports. Export bans and processing mandates are reshaping value chains. Indonesia\'s nickel export ban catalyzed domestic smelting investment. By 2040, Southeast Asia\'s mining market could reach $110B with $70B in refined materials.',
        chart: [
          { label: 'Indonesia', value: 85, display: 'Nickel leader' },
          { label: 'China', value: 90, display: 'Rare earths' },
          { label: 'Australia', value: 75, display: 'Lithium' },
          { label: 'Japan/Korea', value: 50, display: 'Refining' },
        ],
        highlight: 'Critical minerals are no longer just commodities — they are strategic instruments reshaping trade policy, foreign investment, and industrial alliances across the region.',
      },
    ],
  },
}