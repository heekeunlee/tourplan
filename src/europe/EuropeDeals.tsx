import { useMemo, useState } from 'react'
import { DEALS, FAMILY, SEARCHED_AT, SOURCES, WINDOW, type Deal } from './deals'

const people = FAMILY.adults + FAMILY.children
const man = (n: number) => `${(n / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만원`
const md = (s: string) => `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}`
const WD = ['일', '월', '화', '수', '목', '금', '토']
const dayLabel = (s: string) => `${md(s)}(${WD[new Date(s + 'T00:00:00Z').getUTCDay()]})`
const daysOver = (d: Deal) => Math.round((Date.parse(d.ret) - Date.parse(WINDOW.to)) / 86400000)

type Sort = 'total' | 'cities'

export default function EuropeDeals() {
  const [sort, setSort] = useState<Sort>('total')
  const [onlyWindow, setOnlyWindow] = useState(false)
  const [rate, setRate] = useState(1700)

  const list = useMemo(() => {
    const items = DEALS.filter((d) => !onlyWindow || daysOver(d) <= 0)
    return [...items].sort((a, b) => (sort === 'total' ? Number(daysOver(a) > 0) - Number(daysOver(b) > 0) || a.price - b.price : b.cities.length - a.cities.length || a.price - b.price))
  }, [sort, onlyWindow])

  return (
    <main className="eu">
      <section className="panel">
        <h2>조건</h2>
        <p>
          성인 {FAMILY.adults} · {FAMILY.childAges} · 인천 출발 · <b>{dayLabel(WINDOW.from)} ~ {dayLabel(WINDOW.to)}</b> 안에서 귀국 · 겨울이라 해가 짧아 <b>관광지가 많은 일정</b> 우선
        </p>
        <p className="muted small">
          {SEARCHED_AT}에 크롬으로 여행사 사이트를 직접 조회한 결과입니다. 가격은 1인 기준이며 아동(만 12세 미만) 요금이 성인과 같다고 가정했습니다(하나투어 이탈리아 상품은 상세에서 확인). 가격·잔여석은 바뀌므로 링크에서 다시 확인하세요.
        </p>
        <div className="eu-controls">
          <div className="seg two">
            <button className={sort === 'total' ? 'on' : ''} onClick={() => setSort('total')}>기간 안 우선 · 낮은가격순</button>
            <button className={sort === 'cities' ? 'on' : ''} onClick={() => setSort('cities')}>관광지 많은순</button>
          </div>
          <label className="check"><input type="checkbox" checked={onlyWindow} onChange={(e) => setOnlyWindow(e.target.checked)} />{md(WINDOW.to)} 이내 귀국만</label>
          <label className="rate">€1 = <input type="number" value={rate} min={1000} max={3000} step={10} onChange={(e) => setRate(Number(e.target.value) || 1700)} />원 <small className="muted">(가정값, 수정 가능)</small></label>
        </div>
      </section>

      <section className="deals">
        {list.map((d, i) => {
          const over = daysOver(d)
          const total = d.price * people
          const guide = (d.guideEur ?? (d.id === 'hana-it-tw' ? 90 : 0)) * people * rate
          return (
            <article key={d.id} className={`deal ${over <= 0 ? 'in' : 'out'}${d.added ? ' added' : ''}`}>
              <header>
                <span className="rank">{i + 1}</span>
                <div className="deal-title">
                  <a href={d.url} target="_blank" rel="noreferrer">{d.title} ↗</a>
                  <div className="chips">
                    {d.added && <span className="chip new-tag">추가</span>}
                    <span className="chip">{d.agency}</span>
                    <span className={`chip ${d.national ? 'w-ok' : ''}`}>{d.airline}</span>
                    {d.urgent && <span className="chip w-bad">긴급모객</span>}
                    {d.status.includes('출발확정') && !d.urgent && <span className="chip w-good">출발확정</span>}
                    <span className={`chip ${over <= 0 ? 'w-good' : 'w-bad'}`}>{over <= 0 ? '기간 안' : `${over}일 초과`}</span>
                    {!d.verified && <span className="chip">일부 미확인</span>}
                  </div>
                </div>
              </header>
              <div className="deal-grid">
                <div>
                  <small className="muted">일정</small>
                  <b>{dayLabel(d.depart)} → {dayLabel(d.ret)}{d.retEstimated ? ' (추정)' : ''}</b>
                  <span className="muted small">{d.nights}박 · {d.hotel} · {d.shopping}</span>
                </div>
                <div>
                  <small className="muted">1인</small>
                  <b>{man(d.price)}</b>
                  {d.listPrice && <span className="muted small"><s>{man(d.listPrice)}</s></span>}
                </div>
                <div className="total">
                  <small className="muted">4인 합계</small>
                  <b>{man(total)}</b>
                  {guide > 0 && <span className="muted small">+가이드경비 약 {man(guide)}</span>}
                </div>
              </div>
              <p className="small"><b>방문</b> {d.cities.join(' · ')} <span className="muted">({d.cities.length}곳)</span></p>
              <p className="small muted">{d.highlights}</p>
              <p className="small muted">{d.status}{d.seats ? ` · ${d.seats}` : ''} · {d.fees}</p>
              {d.note && <p className="small note">{d.note}</p>}
              <a className="book-btn" href={d.url} target="_blank" rel="noreferrer">예약 페이지 바로가기 ↗</a>
            </article>
          )
        })}
        {list.length === 0 && <p className="panel">조건에 맞는 상품이 없습니다.</p>}
      </section>

      <section className="panel">
        <h2>어디를 검색했나</h2>
        <ul className="tips">
          {SOURCES.map((s) => <li key={s.name}><b>{s.name}</b> — {s.how}. <span className="muted">{s.found}</span></li>)}
        </ul>
      </section>
    </main>
  )
}
