import { useEffect, useMemo, useState } from 'react'
import { AGENCIES, AGENCY_KINDS, agencyQuery, googleSite, naverSearch, type AgencyKind } from './agencies'
import { Calendar, CostBar, TripDetail, WEATHER_LABEL, won, wonRange } from './components'
import { DESTINATIONS, ORIGINS } from './data'
import { bestCombos, bestDatesFor, DEFAULT_CONDITIONS, fmtDate, type Conditions } from './planner'

const STORE_KEY = 'tourplan.conditions.v1'

function loadConditions(): Conditions {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? { ...DEFAULT_CONDITIONS, ...JSON.parse(raw) } : DEFAULT_CONDITIONS
  } catch {
    return DEFAULT_CONDITIONS
  }
}

type Tab = 'plan' | 'search'

export default function App() {
  const [tab, setTab] = useState<Tab>('plan')
  const [c, setC] = useState<Conditions>(loadConditions)
  const [agesText, setAgesText] = useState(c.childAges.join(', '))
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(c)) } catch { /* 저장 불가 환경 무시 */ }
  }, [c])

  const combos = useMemo(() => bestCombos(c), [c])
  const combo = combos[Math.min(selected, combos.length - 1)]
  const set = <K extends keyof Conditions>(k: K, v: Conditions[K]) => { setC({ ...c, [k]: v }); setSelected(0) }

  const updateAges = (text: string) => {
    setAgesText(text)
    const ages = text.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0 && n < 18 && text.trim() !== '')
    set('childAges', ages)
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">성인 {c.adults} · 아이 {c.childAges.length}명 · 11~12월 · 해외 2회</p>
          <h1>가족여행 최저가 플래너</h1>
          <p className="muted">한 번은 일본(관광·온천·맛집), 항공+숙박+체류비 합계가 가장 싼 조합을 찾습니다.</p>
        </div>
        <nav className="tabs">
          <button className={tab === 'plan' ? 'on' : ''} onClick={() => setTab('plan')}>최저가 플랜</button>
          <button className={tab === 'search' ? 'on' : ''} onClick={() => setTab('search')}>여행사·특가 통합검색</button>
        </nav>
      </header>

      {tab === 'plan' ? (
        <div className="layout">
          <aside className="panel conditions">
            <h2>조건</h2>
            <label>출발 공항
              <select value={c.origin} onChange={(e) => set('origin', e.target.value)}>
                {Object.entries(ORIGINS).map(([k, o]) => <option key={k} value={k}>{o.name} ({k})</option>)}
              </select>
            </label>
            <div className="row2">
              <label>성인<input type="number" min={1} max={6} value={c.adults} onChange={(e) => set('adults', Math.max(1, Number(e.target.value)))} /></label>
              <label>아이 나이<input value={agesText} onChange={(e) => updateAges(e.target.value)} placeholder="8, 10" /></label>
            </div>
            <div className="row2">
              <label>시작일<input type="date" value={c.startDate} min="2026-11-01" max="2026-12-31" onChange={(e) => set('startDate', e.target.value)} /></label>
              <label>종료일<input type="date" value={c.endDate} min="2026-11-01" max="2026-12-31" onChange={(e) => set('endDate', e.target.value)} /></label>
            </div>
            <label>여행 1회당 체험학습 최대 <b>{c.maxSchoolDays}일</b>
              <input type="range" min={0} max={5} value={c.maxSchoolDays} onChange={(e) => set('maxSchoolDays', Number(e.target.value))} />
            </label>
            <label>체험학습 1일의 부담 <b>{c.schoolPenalty}만원</b> <small>(높을수록 결석 적은 날짜 우선)</small>
              <input type="range" min={0} max={30} value={c.schoolPenalty} onChange={(e) => set('schoolPenalty', Number(e.target.value))} />
            </label>
            <label>두 여행 사이 최소 간격 <b>{c.minGapDays}일</b>
              <input type="range" min={3} max={35} value={c.minGapDays} onChange={(e) => set('minGapDays', Number(e.target.value))} />
            </label>
            <label>2회 합계 예산 <b>{won(c.budget)}</b>
              <input type="range" min={200} max={1000} step={10} value={c.budget} onChange={(e) => set('budget', Number(e.target.value))} />
            </label>
            <label className="check"><input type="checkbox" checked={c.requireJapan} onChange={(e) => set('requireJapan', e.target.checked)} />한 번은 일본 필수</label>
            <label className="check"><input type="checkbox" checked={c.avoidPeak} onChange={(e) => set('avoidPeak', e.target.checked)} />연말 성수기(12/19~) 제외</label>
            <label className="check"><input type="checkbox" checked={c.excludeBadWeather} onChange={(e) => set('excludeBadWeather', e.target.checked)} />우기 지역 제외</label>
            <button className="ghost" onClick={() => { setC(DEFAULT_CONDITIONS); setAgesText(DEFAULT_CONDITIONS.childAges.join(', ')) }}>기본값으로</button>
          </aside>

          <main className="results">
            <section>
              <h2>추천 조합 TOP {combos.length}</h2>
              {combos.length === 0 && <p className="panel">조건에 맞는 조합이 없습니다. 체험학습 일수나 기간을 늘려 보세요.</p>}
              <div className="combos">
                {combos.map((cb, i) => (
                  <button key={cb.a.dest.id + cb.b.dest.id} className={`combo ${i === selected ? 'on' : ''}`} onClick={() => setSelected(i)}>
                    <div className="combo-head">
                      <span className="rank">{i + 1}</span>
                      <strong>{wonRange(cb.total)}</strong>
                      <span className={cb.total.mid <= c.budget ? 'badge good' : 'badge warn'}>{cb.total.mid <= c.budget ? '예산 내' : '예산 초과'}</span>
                    </div>
                    {[cb.a, cb.b].map((t) => (
                      <div key={t.dest.id} className="combo-trip">
                        <span>{t.dest.flag} {t.dest.name}</span>
                        <span className="muted">{fmtDate(t.depart)}~{fmtDate(t.ret)}</span>
                      </div>
                    ))}
                    <span className="muted small">체험학습 총 {cb.schoolDays}일</span>
                  </button>
                ))}
              </div>
            </section>

            {combo && (
              <>
                <section className="panel">
                  <h2>{selected + 1}순위 일정</h2>
                  <Calendar trips={[combo.a, combo.b]} c={c} />
                </section>
                <section className="trips">
                  <TripDetail trip={combo.a} c={c} label="1차" />
                  <TripDetail trip={combo.b} c={c} label="2차" />
                </section>
              </>
            )}

            <section className="panel">
              <h2>목적지별 최저 날짜</h2>
              <div className="table-wrap">
                <table className="dest-table">
                  <thead><tr><th>목적지</th><th>날씨(11/12월)</th><th>최저 날짜</th><th>예상 4인 총액</th><th>구성</th></tr></thead>
                  <tbody>
                    {DESTINATIONS.map((d) => {
                      const best = bestDatesFor(d, c, 1)[0]
                      return (
                        <tr key={d.id} className={best ? '' : 'dim'}>
                          <td>{d.flag} {d.name}<br /><small className="muted">{d.tags.join(' · ')}</small></td>
                          <td><span className={`chip w-${d.weather.nov}`}>{WEATHER_LABEL[d.weather.nov]}</span> <span className={`chip w-${d.weather.dec}`}>{WEATHER_LABEL[d.weather.dec]}</span></td>
                          <td>{best ? `${fmtDate(best.depart)}~${fmtDate(best.ret)}` : '조건 불충족'}</td>
                          <td>{best ? wonRange(best.cost.total) : '-'}</td>
                          <td style={{ minWidth: 120 }}>{best && <CostBar trip={best} />}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="muted small">금액은 2026년 비수기 기준 추정치입니다(LCC 왕복·세금 포함, 아동 항공권은 성인과 거의 같다고 가정). 실제 가격은 각 일정의 "실시간 가격 검색" 링크로 확인하세요.</p>
            </section>
          </main>
        </div>
      ) : (
        <AgencySearch c={c} defaultDest={combo?.a.dest.name.split('·')[0] ?? '후쿠오카'} />
      )}

      <footer className="muted small">
        예상 금액은 참고용입니다. 항공권은 출발 1개월 전부터 빠르게 오르니 일찍 예약하세요. · 체험학습은 학교별 신청 기한을 확인하세요.
      </footer>
    </div>
  )
}

function AgencySearch({ c, defaultDest }: { c: Conditions; defaultDest: string }) {
  const [keyword, setKeyword] = useState(defaultDest)
  const [month, setMonth] = useState('11월')
  const [recentOnly, setRecentOnly] = useState(true)
  const [kinds, setKinds] = useState<AgencyKind[]>(AGENCY_KINDS)
  const toggle = (k: AgencyKind) => setKinds(kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k])

  const quick = [
    `${keyword} ${month} 가족 패키지 특가`,
    `${keyword} ${month} 항공권 특가 ${ORIGINS[c.origin]?.name ?? ''} 출발`,
    `${keyword} 초등 아이 가족여행 추천 숙소`,
    `${keyword} ${month} 땡처리 항공`,
  ]

  return (
    <main className="search">
      <section className="panel">
        <h2>여행사·특가 통합검색</h2>
        <p className="muted">
          패키지 여행사, 저가항공 특가 페이지, 항공·숙소 비교 사이트, 특가 커뮤니티를 한 번에 검색합니다.
          각 사이트 안의 상품을 검색엔진(site: 검색)으로 찾아 주고, 홈 링크로 바로 특가 페이지에 들어갈 수 있습니다.
        </p>
        <div className="search-bar">
          <label>목적지·키워드
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} list="dest-list" placeholder="예: 후쿠오카 유후인" />
            <datalist id="dest-list">
              {DESTINATIONS.map((d) => <option key={d.id} value={d.name.split('·')[0]} />)}
              <option value="유후인 료칸" /><option value="벳푸 온천" /><option value="오키나와" /><option value="삿포로" />
            </datalist>
          </label>
          <label>시기
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option>11월</option><option>12월</option><option value="">전체</option>
            </select>
          </label>
          <label className="check"><input type="checkbox" checked={recentOnly} onChange={(e) => setRecentOnly(e.target.checked)} />최근 1개월 게시물만 (구글)</label>
        </div>
        <div className="chips">
          {AGENCY_KINDS.map((k) => (
            <button key={k} className={`chip toggle ${kinds.includes(k) ? 'on' : ''}`} onClick={() => toggle(k)}>{k}</button>
          ))}
        </div>
        <div className="quick">
          <span className="links-kind">네이버 통합</span>
          {quick.map((q) => <a key={q} href={naverSearch(q)} target="_blank" rel="noreferrer">{q} ↗</a>)}
        </div>
      </section>

      {AGENCY_KINDS.filter((k) => kinds.includes(k)).map((k) => (
        <section key={k}>
          <h3>{k}</h3>
          <div className="agency-grid">
            {AGENCIES.filter((a) => a.kind === k).map((a) => {
              const query = agencyQuery(a, keyword, month)
              return (
                <div key={a.name} className="agency">
                  <strong>{a.name}</strong>
                  <span className="muted small">{a.domain}{a.region && ` · ${a.region === 'JP' ? '일본' : a.region === 'TW' ? '대만' : '동남아'} 노선`}</span>
                  <div className="agency-links">
                    <a href={googleSite(a, query, recentOnly)} target="_blank" rel="noreferrer">상품 검색</a>
                    <a href={naverSearch(`${a.name} ${query}`)} target="_blank" rel="noreferrer">네이버</a>
                    <a href={a.home} target="_blank" rel="noreferrer">홈·특가 ↗</a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <section className="panel">
        <h3>특가 놓치지 않는 법</h3>
        <ol className="steps">
          <li><b>알림</b> 스카이스캐너·구글 항공권 가격 알림을 목적지별로 켜 두기</li>
          <li><b>LCC</b> 제주항공·티웨이·진에어 앱 푸시 허용 — 정기 특가는 앱에서 먼저 공지</li>
          <li><b>패키지</b> 여행사 "땡처리·출발확정" 메뉴는 출발 2~3주 전 가격이 크게 떨어짐</li>
          <li><b>비교</b> 패키지 가격 ≈ 항공+숙소 직접 예약 가격인지 "최저가 플랜" 탭의 예상 금액과 비교</li>
        </ol>
      </section>
    </main>
  )
}
