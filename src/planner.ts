import { DESTINATIONS, JP_HOLIDAYS, KR_HOLIDAYS, ORIGINS, PEAK_START, type Destination } from './data'

export interface Conditions {
  origin: string
  adults: number
  childAges: number[]
  startDate: string
  endDate: string
  maxSchoolDays: number // 1회 여행당 체험학습 최대 일수
  schoolPenalty: number // 체험학습 1일을 비용 몇 만원으로 볼지 (정렬용)
  minGapDays: number
  requireJapan: boolean
  avoidPeak: boolean
  excludeBadWeather: boolean
  budget: number // 2회 합계 예산 (만원)
}

export const DEFAULT_CONDITIONS: Conditions = {
  origin: 'ICN',
  adults: 2,
  childAges: [8, 10],
  startDate: '2026-11-02',
  endDate: '2026-12-31',
  maxSchoolDays: 3,
  schoolPenalty: 5,
  minGapDays: 14,
  requireJapan: true,
  avoidPeak: true,
  excludeBadWeather: true,
  budget: 500,
}

export type Range = { low: number; high: number; mid: number }

export interface TripCandidate {
  dest: Destination
  depart: string
  ret: string
  checkIn: string
  checkOut: string
  schoolDays: number
  cost: { flight: Range; hotel: Range; food: Range; local: Range; total: Range }
  notes: string[]
  score: number
}

export interface Combo {
  a: TripCandidate
  b: TripCandidate
  total: Range
  schoolDays: number
  score: number
}

const DAY = 86400000
const toTime = (s: string) => Date.parse(s + 'T00:00:00Z')
export const toISO = (t: number) => new Date(t).toISOString().slice(0, 10)
export const addDays = (s: string, n: number) => toISO(toTime(s) + n * DAY)
export const diffDays = (a: string, b: string) => Math.round((toTime(b) - toTime(a)) / DAY)
export const weekday = (s: string) => new Date(toTime(s)).getUTCDay()
const WD = ['일', '월', '화', '수', '목', '금', '토']
export const fmtDate = (s: string) => `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}(${WD[weekday(s)]})`

const DEPART_FACTOR = [1.05, 1.0, 0.92, 0.92, 0.97, 1.12, 1.08]
const range = (low: number, high: number): Range => ({ low, high, mid: (low + high) / 2 })
const scale = ([lo, hi]: [number, number], f: number) => range(lo * f, hi * f)
const sum = (...rs: Range[]) => range(
  rs.reduce((s, r) => s + r.low, 0),
  rs.reduce((s, r) => s + r.high, 0),
)

function datesBetween(from: string, to: string) {
  const out: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d)
  return out
}

export function buildTrip(dest: Destination, depart: string, c: Conditions): TripCandidate | null {
  const ret = addDays(depart, dest.nights + (dest.redEye ? 1 : 0))
  if (depart < c.startDate || ret > c.endDate) return null
  if (!dest.origins.includes(c.origin)) return null
  const peak = ret >= PEAK_START
  if (c.avoidPeak && peak) return null

  const month = Number(depart.slice(5, 7))
  const weather = month === 12 ? dest.weather.dec : dest.weather.nov
  if (c.excludeBadWeather && weather === 'bad') return null

  const days = datesBetween(depart, ret)
  // 야간 출발은 하교 후 출발로 보고 출발일은 결석에서 제외
  const schoolDays = days.filter((d, i) => {
    if (dest.redEye && i === 0) return false
    const w = weekday(d)
    return w >= 1 && w <= 5 && !KR_HOLIDAYS.includes(d)
  }).length
  if (schoolDays > c.maxSchoolDays) return null

  const notes: string[] = []
  let flightF = DEPART_FACTOR[weekday(depart)]
  if (weekday(ret) === 0) flightF += 0.06
  if (weekday(ret) === 6) flightF += 0.03
  let hotelF = 1

  if (peak) { flightF *= 1.5; hotelF *= 1.5; notes.push('연말 성수기 요금') }
  if (depart >= '2026-12-01' && depart <= '2026-12-12') { flightF *= 0.95; hotelF *= 0.95; notes.push('12월 초 최저 비수기') }
  if (dest.japanHolidaySensitive) {
    if (days.some((d) => JP_HOLIDAYS.includes(d))) { flightF *= 1.1; hotelF *= 1.25; notes.push('일본 연휴와 겹침 — 숙박 비쌈') }
    if (depart >= '2026-11-14' && depart <= '2026-11-29') { hotelF *= 1.08; notes.push('단풍 시즌') }
  }
  if (weather === 'bad') notes.push('우기 — 날씨 위험')
  if (weekday(depart) === 2 || weekday(depart) === 3) notes.push('화·수 출발 할인')

  const kids = c.childAges.filter((a) => a >= 2).length
  const infants = c.childAges.length - kids
  const seats = c.adults + kids + infants * 0.1
  const eaters = c.adults + kids * 0.7
  const people = c.adults + c.childAges.length
  const roomF = people > 4 ? 1.5 : 1
  const originF = ORIGINS[c.origin]?.factor[dest.region] ?? 1

  const flight = scale(dest.flightPP, seats * flightF * originF)
  const normalNights = dest.specialNight ? dest.nights - 1 : dest.nights
  let hotel = scale(dest.hotelNight, normalNights * hotelF * roomF)
  if (dest.specialNight) hotel = sum(hotel, scale(dest.specialNight.price, hotelF * (eaters / 3.4)))
  const food = scale(dest.foodPPDay, eaters * (dest.nights + 1))
  const local = sum(scale(dest.transport, people / 4), scale(dest.activities, people / 4))
  const total = sum(flight, hotel, food, local)

  return {
    dest,
    depart,
    ret,
    checkIn: depart,
    checkOut: addDays(depart, dest.nights),
    schoolDays,
    cost: { flight, hotel, food, local, total },
    notes,
    score: total.mid + schoolDays * c.schoolPenalty,
  }
}

export function allCandidates(c: Conditions, dests = DESTINATIONS) {
  const out: TripCandidate[] = []
  for (const dest of dests) {
    for (let d = c.startDate; d <= c.endDate; d = addDays(d, 1)) {
      const t = buildTrip(dest, d, c)
      if (t) out.push(t)
    }
  }
  return out
}

/** 목적지 쌍마다 최적 날짜 조합 1개씩, 점수 순 */
export function bestCombos(c: Conditions, limit = 8): Combo[] {
  const cands = allCandidates(c).sort((x, y) => x.score - y.score)
  const best = new Map<string, Combo>()
  for (const a of cands) {
    for (const b of cands) {
      if (b.depart <= a.depart || a.dest.id === b.dest.id) continue
      if (diffDays(a.ret, b.depart) < c.minGapDays) continue
      if (c.requireJapan && a.dest.region !== 'JP' && b.dest.region !== 'JP') continue
      const key = [a.dest.id, b.dest.id].sort().join('+')
      const score = a.score + b.score
      const prev = best.get(key)
      if (!prev || score < prev.score) {
        best.set(key, {
          a, b, score,
          total: sum(a.cost.total, b.cost.total),
          schoolDays: a.schoolDays + b.schoolDays,
        })
      }
    }
  }
  return [...best.values()].sort((x, y) => x.score - y.score).slice(0, limit)
}

export function bestDatesFor(dest: Destination, c: Conditions, limit = 5) {
  return allCandidates(c, [dest]).sort((x, y) => x.score - y.score).slice(0, limit)
}
