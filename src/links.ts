import type { Conditions, TripCandidate } from './planner'

const yymmdd = (s: string) => s.slice(2).replaceAll('-', '')
const q = encodeURIComponent

export interface SearchLink {
  label: string
  kind: '항공' | '숙소' | '패키지' | '투어'
  url: string
}

export function searchLinks(t: TripCandidate, c: Conditions): SearchLink[] {
  const { dest } = t
  const kids = c.childAges.length
  const ages = c.childAges.join('|')
  const from = c.origin
  const nights = dest.nights
  const ageParams = c.childAges.map((a) => `&age=${a}`).join('')
  const pkgQuery = `${dest.name.split('·')[0]} 가족 패키지 ${Number(t.depart.slice(5, 7))}월 ${fmtShort(t.depart)} 출발`

  return [
    {
      kind: '항공',
      label: '스카이스캐너',
      url: `https://www.skyscanner.co.kr/transport/flights/${from.toLowerCase()}/${dest.airport.toLowerCase()}/${yymmdd(t.depart)}/${yymmdd(t.ret)}/?adultsv2=${c.adults}&childrenv2=${q(ages)}&cabinclass=economy&preferdirects=true`,
    },
    {
      kind: '항공',
      label: '구글 항공권',
      url: `https://www.google.com/travel/flights?hl=ko&q=${q(`Flights from ${from} to ${dest.airport} on ${t.depart} through ${t.ret} for ${c.adults} adults and ${kids} children`)}`,
    },
    {
      kind: '항공',
      label: '네이버 항공권',
      url: `https://flight.naver.com/flights/international/${from}-${dest.airport}-${t.depart.replaceAll('-', '')}/${dest.airport}-${from}-${t.ret.replaceAll('-', '')}?adult=${c.adults}&child=${kids}&isDirect=true&fareType=Y`,
    },
    {
      kind: '숙소',
      label: '부킹닷컴',
      url: `https://www.booking.com/searchresults.ko.html?ss=${q(dest.hotelCity)}&checkin=${t.checkIn}&checkout=${t.checkOut}&group_adults=${c.adults}&group_children=${kids}${ageParams}&no_rooms=1&order=price`,
    },
    {
      kind: '숙소',
      label: '아고다',
      url: `https://www.agoda.com/ko-kr/search?textToSearch=${q(dest.hotelCity)}&checkIn=${t.checkIn}&los=${nights}&rooms=1&adults=${c.adults}&children=${kids}&childAges=${c.childAges.join(',')}&sort=priceLowToHigh`,
    },
    {
      kind: '패키지',
      label: '네이버 패키지 검색',
      url: `https://search.naver.com/search.naver?query=${q(pkgQuery)}`,
    },
    {
      kind: '투어',
      label: '마이리얼트립',
      url: `https://www.myrealtrip.com/search?q=${q(dest.name.split('·')[0])}`,
    },
    {
      kind: '투어',
      label: '클룩',
      url: `https://www.klook.com/ko/search/result/?query=${q(dest.hotelCity)}`,
    },
  ]
}

function fmtShort(s: string) {
  return `${Number(s.slice(5, 7))}월${Number(s.slice(8, 10))}일`
}
