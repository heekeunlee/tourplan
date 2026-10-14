import type { Conditions, TripCandidate } from './planner'

// level: direct = 날짜·인원이 채워진 결과 / search = 목적지 검색결과 / start = 예약 시작 페이지
export type Level = 'direct' | 'search' | 'start'
export type Group = '패키지' | '항공' | '숙소' | '투어'
export interface BookLink { group: Group; name: string; url: string; level: Level; hint?: string }

export const LEVEL_LABEL: Record<Level, string> = { direct: '날짜·인원 입력됨', search: '상품 목록', start: '예약 시작' }

interface Meta {
  country: 'JP' | 'VN' | 'TH' | 'TW'
  hanaCity: string
  hanaVerified: boolean
  modeAkn?: string
  agoda?: number
  tripcom?: number
  ryokan?: { label: string; sjis: string }[] // Shift_JIS 인코딩된 일본 온천지 키워드
}

const META: Record<string, Meta> = {
  fuk: { country: 'JP', hanaCity: 'FUK', hanaVerified: true, modeAkn: '597545', agoda: 16527,
    ryokan: [{ label: '유후인', sjis: '%93%92%95z%89%40' }, { label: '벳푸', sjis: '%95%CA%95%7B' }] },
  osa: { country: 'JP', hanaCity: 'OSA', hanaVerified: false, agoda: 9590, tripcom: 219 },
  tyo: { country: 'JP', hanaCity: 'TYO', hanaVerified: false, agoda: 5085, tripcom: 228,
    ryokan: [{ label: '하코네', sjis: '%94%A0%8D%AA' }] },
  myj: { country: 'JP', hanaCity: 'MYJ', hanaVerified: true,
    ryokan: [{ label: '도고온천', sjis: '%93%B9%8C%E3%89%B7%90%F2' }] },
  pqc: { country: 'VN', hanaCity: 'PQC', hanaVerified: true },
  tpe: { country: 'TW', hanaCity: 'TPE', hanaVerified: false, agoda: 4951, tripcom: 617 },
  bkk: { country: 'TH', hanaCity: 'BKK', hanaVerified: false, agoda: 9395, tripcom: 359 },
  dad: { country: 'VN', hanaCity: 'DAD', hanaVerified: false, agoda: 16440, tripcom: 1356 },
}

// 노선별 운항 항공사: 제주항공(7C)·에어부산(BX)은 노선 확인, 나머지는 취항 추정 → 예약 시작 페이지만 연결
const AIRLINE_SITES: Record<string, { name: string; url: string }> = {
  LJ: { name: '진에어', url: 'https://www.jinair.com/booking/index' },
  TW: { name: '트리니티항공(구 티웨이)', url: 'https://www.trinityairways.com/app/booking/searchItinerary' },
  ZE: { name: '이스타항공', url: 'https://main.eastarjet.com/search' },
  RS: { name: '에어서울', url: 'https://flyairseoul.com/I/ko/viewBooking.do' },
  KE: { name: '대한항공', url: 'https://www.koreanair.com/booking/search' },
  OZ: { name: '아시아나', url: 'https://flyasiana.com/C/KR/KO/index' },
}
const ROUTE_CARRIERS: Record<string, { jeju?: boolean; busan?: boolean; others: string[] }> = {
  'ICN-FUK': { jeju: true, busan: true, others: ['LJ', 'TW', 'ZE', 'KE', 'OZ'] },
  'GMP-FUK': { jeju: true, others: [] },
  'ICN-KIX': { jeju: true, busan: true, others: ['LJ', 'TW', 'ZE', 'KE', 'OZ'] },
  'GMP-KIX': { jeju: true, others: ['KE', 'OZ'] },
  'ICN-MYJ': { jeju: true, others: [] },
  'ICN-NRT': { jeju: true, busan: true, others: ['LJ', 'TW', 'ZE', 'KE', 'OZ'] },
  'GMP-HND': { others: ['KE', 'OZ'] },
  'ICN-TPE': { jeju: true, others: ['LJ', 'TW', 'KE', 'OZ'] },
  'GMP-TSA': { others: ['TW', 'OZ'] },
  'ICN-PQC': { jeju: true, others: ['ZE', 'LJ', 'TW', 'KE'] },
  'ICN-BKK': { jeju: true, busan: true, others: ['LJ', 'TW', 'ZE', 'KE', 'OZ'] },
  'ICN-DAD': { jeju: true, others: ['LJ', 'TW', 'ZE', 'RS', 'KE', 'OZ'] },
}

const q = encodeURIComponent
export const mainKeyword = (t: TripCandidate) => t.dest.name.split('·')[0].split(' ')[0]

export function bookingLinks(t: TripCandidate, c: Conditions): BookLink[] {
  const { dest } = t
  const m = META[dest.id]
  const kw = mainKeyword(t)
  const from = t.origin
  const to = t.route.airport
  const kids = c.childAges.length
  const ageList = c.childAges.join(',')
  const compact = (s: string) => s.replaceAll('-', '')
  const out: BookLink[] = []

  // 패키지 (상품 목록)
  out.push({
    group: '패키지', name: '하나투어', level: 'search',
    url: `https://www.hanatour.com/package/major-products?cntryCd=${m.country}&cityCd=${m.hanaCity}&depCityCd=JCN&cityNm=${q(kw)}`,
    hint: m.hanaVerified ? '인천·김포 출발 상품 목록' : '도시 코드 추정 — 안 열리면 하나투어 홈에서 검색',
  })
  out.push(m.modeAkn
    ? { group: '패키지', name: '모두투어', level: 'direct', url: `https://www.modetour.com/package/search-result?ty=o&dm=p&an=${q(kw)}&akn=${m.modeAkn}&sf=${t.depart}&st=${t.ret}`, hint: '출발·귀국일 입력됨' }
    : { group: '패키지', name: '모두투어', level: 'start', url: 'https://www.modetour.com/', hint: '홈에서 목적지 검색' })
  out.push({ group: '패키지', name: '노랑풍선', level: 'search', url: `https://pkg.ybtour.co.kr/search/searchPdt.yb?query=${q(kw)}` })
  out.push({ group: '패키지', name: '참좋은여행', level: 'search', url: `https://www.verygoodtour.com/Search/SearchList?Keyword=${q(kw)}&SearchTitle=${q(kw)}`, hint: '목록이 늦게 뜰 수 있음' })
  out.push({ group: '패키지', name: '교원투어', level: 'search', url: `https://www.kyowontour.com/display/search?text=${q(kw)}`, hint: '로딩 약 8초' })
  out.push({ group: '패키지', name: '롯데관광', level: 'search', url: `https://www.lottetour.com/search?kwd=${q(kw)}` })
  out.push({ group: '패키지', name: '한진관광', level: 'search', url: `https://www.hanjintravel.com/dp/search/searchList?keyword=${q(kw)}` })
  out.push({ group: '패키지', name: '온라인투어', level: 'search', url: `https://www.onlinetour.co.kr/search/w/main?keyword=${q(kw)}`, hint: '항공 탭 위주, 패키지는 적을 수 있음' })
  out.push({ group: '패키지', name: 'NOL(인터파크) 해외패키지', level: 'start', url: 'https://content.yanolja.com/event/2185' })

  // 항공
  const rc = ROUTE_CARRIERS[`${from}-${to}`]
  const flightQ = `${from}-${to}`
  out.push({ group: '항공', name: '스카이스캐너', level: 'direct', hint: '전 항공사 비교',
    url: `https://www.skyscanner.co.kr/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${compact(t.depart).slice(2)}/${compact(t.ret).slice(2)}/?adultsv2=${c.adults}&childrenv2=${q(c.childAges.join('|'))}&cabinclass=economy&preferdirects=true` })
  out.push({ group: '항공', name: '네이버 항공권', level: 'direct', hint: `${flightQ} 직항`,
    url: `https://flight.naver.com/flights/international/${from}-${to}-${compact(t.depart)}/${to}-${from}-${compact(t.ret)}?adult=${c.adults}&child=${kids}&isDirect=true&fareType=Y` })
  if (rc?.busan) {
    out.push({ group: '항공', name: '에어부산', level: 'direct', hint: '성인·소아 입력됨',
      url: `https://www.airbusan.com/web/individual/booking/flightsAvail/RT/${from}/${to}/${t.depart}/${to}/${from}/${t.ret}/0/${c.adults}/${kids}/0/N` })
  }
  if (rc?.jeju) {
    out.push({ group: '항공', name: '제주항공', level: 'direct', hint: '노선·날짜 입력됨, 인원은 직접 선택',
      url: `https://www.jejuair.net/ko/ibe/booking/Availability.do?tripType=RT&depStn=${from}&arrStn=${to}&depDate=${t.depart}&arrDate=${t.ret}` })
  }
  for (const code of rc?.others ?? []) {
    const a = AIRLINE_SITES[code]
    out.push({ group: '항공', name: a.name, level: 'start', url: a.url, hint: '취항 추정 — 예약 화면에서 노선 선택' })
  }

  // 숙소
  const ageParams = c.childAges.map((a) => `&age=${a}`).join('')
  out.push({ group: '숙소', name: '부킹닷컴', level: 'direct', hint: '가격 낮은 순 정렬',
    url: `https://www.booking.com/searchresults.ko.html?ss=${q(kw)}&checkin=${t.checkIn}&checkout=${t.checkOut}&group_adults=${c.adults}&group_children=${kids}${ageParams}&no_rooms=1&order=price&selected_currency=KRW` })
  if (m.agoda) {
    out.push({ group: '숙소', name: '아고다', level: 'direct',
      url: `https://www.agoda.com/ko-kr/search?city=${m.agoda}&checkIn=${t.checkIn}&checkOut=${t.checkOut}&los=${dest.nights}&rooms=1&adults=${c.adults}&children=${kids}&childAges=${ageList}` })
  }
  if (m.tripcom) {
    out.push({ group: '숙소', name: '트립닷컴', level: 'direct',
      url: `https://kr.trip.com/hotels/list?cityId=${m.tripcom}&checkin=${t.checkIn}&checkout=${t.checkOut}&crn=1&adult=${c.adults}&children=${kids}&ages=${ageList}&curr=KRW` })
  }
  for (const r of m.ryokan ?? []) {
    out.push({ group: '숙소', name: `라쿠텐 트래블 · ${r.label} 료칸`, level: 'search', url: `https://kw.travel.rakuten.co.jp/keyword/Search.do?f_query=${r.sjis}`, hint: '일본어 사이트' })
  }
  for (const r of (m.ryokan ?? []).slice(0, 1)) {
    out.push({ group: '숙소', name: `자란 · ${r.label} 온천 숙소`, level: 'search', url: `https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword=${r.sjis}`, hint: '일본어 사이트' })
  }

  // 투어·입장권
  out.push({ group: '투어', name: '마이리얼트립', level: 'search', url: `https://www.myrealtrip.com/search?q=${q(kw)}` })
  out.push({ group: '투어', name: '클룩', level: 'search', url: `https://www.klook.com/ko/search/result/?query=${q(kw)}` })
  return out
}

export const GROUPS: Group[] = ['패키지', '항공', '숙소', '투어']

/** 카드에서 한 번에 이동할 대표 예약 링크 (패키지 목록) */
export function primaryLink(t: TripCandidate, c: Conditions) {
  return bookingLinks(t, c)[0]
}
