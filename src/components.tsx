import { useEffect, useState } from 'react'
import { JP_HOLIDAYS, ORIGINS, PEAK_START } from './data'
import { bookingLinks, GROUPS, LEVEL_LABEL } from './booking'
import { addDays, buildTrip, fmtDate, leaveRestricted, originsFor, weekday, type Conditions, type Range, type TripCandidate } from './planner'

export const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}만원`
export const wonRange = (r: Range) => `${Math.round(r.low)}~${Math.round(r.high)}만원`

export const WEATHER_LABEL = { good: '좋음', ok: '보통', bad: '나쁨' } as const

export function CostBar({ trip }: { trip: TripCandidate }) {
  const parts = [
    { k: '항공', v: trip.cost.flight.mid, cls: 'c-flight' },
    { k: '숙박', v: trip.cost.hotel.mid, cls: 'c-hotel' },
    { k: '식비', v: trip.cost.food.mid, cls: 'c-food' },
    { k: '교통·입장', v: trip.cost.local.mid, cls: 'c-local' },
  ]
  const total = trip.cost.total.mid
  return (
    <div className="costbar" aria-label="비용 구성">
      {parts.map((p) => (
        <span key={p.k} className={p.cls} style={{ width: `${(p.v / total) * 100}%` }} title={`${p.k} ${won(p.v)}`} />
      ))}
    </div>
  )
}

interface Quote { flight: string; hotel: string; etc: string }
const emptyQuote: Quote = { flight: '', hotel: '', etc: '' }

function loadQuote(key: string): Quote {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...emptyQuote, ...JSON.parse(raw) } : emptyQuote
  } catch {
    return emptyQuote
  }
}

function QuoteBox({ trip }: { trip: TripCandidate }) {
  const key = `tourplan.quote.${trip.dest.id}.${trip.depart}`
  const [quote, setQuote] = useState<Quote>(() => loadQuote(key))
  useEffect(() => setQuote(loadQuote(key)), [key])
  const update = (field: keyof Quote, value: string) => {
    const next = { ...quote, [field]: value }
    setQuote(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* 저장 불가 환경 무시 */ }
  }
  const actual = (Number(quote.flight) || 0) + (Number(quote.hotel) || 0) + (Number(quote.etc) || 0)
  const est = trip.cost.total.mid
  return (
    <div className="quote">
      <h4>내가 찾은 실제 견적 <small>(만원, 이 브라우저에 저장)</small></h4>
      <div className="quote-grid">
        <label>항공 4인<input inputMode="numeric" value={quote.flight} onChange={(e) => update('flight', e.target.value)} placeholder={String(Math.round(trip.cost.flight.mid))} /></label>
        <label>숙박 전체<input inputMode="numeric" value={quote.hotel} onChange={(e) => update('hotel', e.target.value)} placeholder={String(Math.round(trip.cost.hotel.mid))} /></label>
        <label>기타<input inputMode="numeric" value={quote.etc} onChange={(e) => update('etc', e.target.value)} placeholder={String(Math.round(trip.cost.food.mid + trip.cost.local.mid))} /></label>
      </div>
      {actual > 0 && (
        <p className={actual <= est ? 'good' : 'warn'}>
          실제 {won(actual)} · 예상 대비 {actual <= est ? '▼' : '▲'} {won(Math.abs(actual - est))}
        </p>
      )}
    </div>
  )
}

export function TripDetail({ trip, c, label }: { trip: TripCandidate; c: Conditions; label: string }) {
  const { dest } = trip
  const month = Number(trip.depart.slice(5, 7))
  const weather = month === 12 ? dest.weather.dec : dest.weather.nov
  const links = bookingLinks(trip, c)
  return (
    <article className="trip">
      <header>
        <span className="trip-label">{label}</span>
        <h3>{dest.flag} {dest.name}</h3>
        <p className="muted">
          {dest.country} · {fmtDate(trip.depart)} → {fmtDate(trip.ret)} · {trip.nights}박 {trip.nights + (dest.redEye ? 2 : 1)}일
          {dest.redEye && ' (야간 출발)'}
        </p>
        <p className="route">✈️ {ORIGINS[trip.origin]}({trip.origin}) → {trip.route.airport}</p>
      </header>

      <div className="trip-total">
        <strong>{wonRange(trip.cost.total)}</strong>
        <span>체험학습 {trip.schoolDays}일</span>
      </div>
      <CostBar trip={trip} />
      <OriginCompare trip={trip} c={c} />
      <table className="breakdown">
        <tbody>
          <tr><th><i className="dot c-flight" />항공</th><td>{wonRange(trip.cost.flight)}</td></tr>
          <tr><th><i className="dot c-hotel" />숙박 {dest.specialNight && <small>({dest.specialNight.label} 1박 포함)</small>}</th><td>{wonRange(trip.cost.hotel)}</td></tr>
          <tr><th><i className="dot c-food" />식비</th><td>{wonRange(trip.cost.food)}</td></tr>
          <tr><th><i className="dot c-local" />교통·입장</th><td>{wonRange(trip.cost.local)}</td></tr>
        </tbody>
      </table>

      <div className="chips">
        <span className={`chip w-${weather}`}>날씨 {WEATHER_LABEL[weather]}</span>
        {trip.notes.map((n) => <span key={n} className="chip">{n}</span>)}
      </div>
      <p className="muted small">{dest.weather.note}</p>

      <h4>추천 동선</h4>
      <ol className="steps">
        {[...dest.itinerary.slice(0, trip.nights < dest.nights ? trip.nights : dest.itinerary.length - 1), dest.itinerary[dest.itinerary.length - 1]].map((s, i) => <li key={i}><b>{i + 1}일차</b> {s}</li>)}
      </ol>

      <h4>예약 페이지로 바로 가기 <small>(새 창에서 해당 사이트 예약·상품 페이지가 열립니다)</small></h4>
      {GROUPS.map((g) => (
        <div key={g} className="book-group">
          <span className="links-kind">{g}</span>
          <div className="book-links">
            {links.filter((l) => l.group === g).map((l) => (
              <a key={l.name} className={`book lv-${l.level}`} href={l.url} target="_blank" rel="noreferrer" title={l.hint}>
                <b>{l.name} ↗</b>
                <small>{LEVEL_LABEL[l.level]}{l.hint ? ` · ${l.hint}` : ''}</small>
              </a>
            ))}
          </div>
        </div>
      ))}
      <p className="muted small">항공사 운항 여부는 일부 추정입니다. 사이트 개편으로 주소가 바뀌면 "예약 시작" 단계에서 직접 검색해야 할 수 있습니다.</p>

      <h4>절약 팁</h4>
      <ul className="tips">{dest.tips.map((t) => <li key={t}>{t}</li>)}</ul>

      <QuoteBox trip={trip} />
    </article>
  )
}

export function Calendar({ trips, c }: { trips: TripCandidate[]; c: Conditions }) {
  const months = ['2026-11-01', '2026-12-01']
  const dayClass = (d: string) => {
    const cls: string[] = []
    trips.forEach((t, i) => { if (d >= t.depart && d <= t.ret) cls.push(i === 0 ? 'trip-a' : 'trip-b') })
    const w = weekday(d)
    if (w === 0 || w === 6) cls.push('weekend')
    if (JP_HOLIDAYS.includes(d)) cls.push('jp-holiday')
    if (d >= PEAK_START) cls.push('peak')
    if (d < c.startDate || d > c.endDate) cls.push('out')
    if (leaveRestricted(c) && !c.leaveDays.includes(w)) cls.push('noleave')
    return cls.join(' ')
  }
  return (
    <div className="calendar">
      {months.map((m) => {
        const first = weekday(m)
        const len = m.startsWith('2026-11') ? 30 : 31
        const cells: (string | null)[] = [...Array(first).fill(null)]
        for (let i = 0; i < len; i++) cells.push(addDays(m, i))
        return (
          <div key={m} className="month">
            <h4>{Number(m.slice(5, 7))}월</h4>
            <div className="grid">
              {['일', '월', '화', '수', '목', '금', '토'].map((w) => <span key={w} className="wd">{w}</span>)}
              {cells.map((d, i) => d
                ? <span key={d} className={`day ${dayClass(d)}`}>{Number(d.slice(8))}</span>
                : <span key={`e${i}`} />)}
            </div>
          </div>
        )
      })}
      <div className="legend">
        <span><i className="trip-a" />여행 기간</span>
        <span><i className="jp-holiday" />일본 공휴일</span>
        <span><i className="peak" />연말 성수기</span>
      </div>
    </div>
  )
}

function OriginCompare({ trip, c }: { trip: TripCandidate; c: Conditions }) {
  const alts = originsFor(trip.dest, c)
    .map((o) => (o === trip.origin ? trip : buildTrip(trip.dest, trip.depart, c, o)))
    .filter((t): t is TripCandidate => t !== null)
  if (alts.length < 2) return null
  return (
    <div className="origin-compare">
      {alts.map((t) => (
        <span key={t.origin} className={t.origin === trip.origin ? 'on' : ''}>
          {ORIGINS[t.origin]}→{t.route.airport} <b>{won(t.cost.total.mid)}</b>
        </span>
      ))}
    </div>
  )
}
