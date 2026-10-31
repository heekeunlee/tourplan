import { useState } from 'react'
import AsiaPlanner from './AsiaPlanner'
import EuropeDeals from './europe/EuropeDeals'

type View = 'europe' | 'asia'

export default function App() {
  const [view, setView] = useState<View>('europe')
  return (
    <>
      {view === 'europe' ? (
        <div className="app">
          <header className="hero">
            <div>
              <p className="eyebrow">성인 2 · 소아 2 · 11/22~11/30 · 유럽 패키지</p>
              <h1>유럽 가족여행 가성비 상품</h1>
              <p className="muted">여행사 사이트를 직접 조회해 최저가·긴급모객 상품을 모았습니다.</p>
            </div>
          </header>
          <EuropeDeals />
        </div>
      ) : (
        <AsiaPlanner />
      )}
      <nav className="view-switch">
        <button className={view === 'europe' ? 'on' : ''} onClick={() => setView('europe')}>유럽 패키지</button>
        <button className={view === 'asia' ? 'on' : ''} onClick={() => setView('asia')}>아시아 플래너(이전)</button>
      </nav>
    </>
  )
}
