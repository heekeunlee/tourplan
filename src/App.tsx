import { useState } from 'react'
import AsiaPlanner from './AsiaPlanner'
import EuropeDeals from './europe/EuropeDeals'
import { KIDS_DEALS } from './europe/deals'

type View = 'europe' | 'kids' | 'asia'
const initialView = (): View => (location.hash === '#kids' ? 'kids' : 'europe')

export default function App() {
  const [view, setView] = useState<View>(initialView)
  return (
    <>
      {view !== 'asia' ? (
        <div className="app">
          <header className="hero">
            <div>
              <p className="eyebrow">성인 2 · 소아 2 · 11/22~11/30 · 유럽 패키지{view === 'kids' ? ' · 아이 동반' : ''}</p>
              <h1>{view === 'kids' ? '이동이 적은 아이 동반 상품' : '유럽 가족여행 가성비 상품'}</h1>
              <p className="muted">{view === 'kids' ? '숙박 도시가 적고 이동이 짧으면서 관광지는 충분히 보는 상품만 골랐습니다.' : '여행사 사이트를 직접 조회해 최저가·긴급모객 상품을 모았습니다.'}</p>
            </div>
          </header>
          {view === 'kids' ? <EuropeDeals deals={KIDS_DEALS} kids /> : <EuropeDeals />}
        </div>
      ) : (
        <AsiaPlanner />
      )}
      <nav className="view-switch">
        <button className={view === 'europe' ? 'on' : ''} onClick={() => { location.hash = ''; setView('europe') }}>유럽 패키지</button>
        <button className={view === 'kids' ? 'on' : ''} onClick={() => { location.hash = 'kids'; setView('kids') }}>이동 적은 상품</button>
        <button className={view === 'asia' ? 'on' : ''} onClick={() => setView('asia')}>아시아 플래너(이전)</button>
      </nav>
    </>
  )
}
