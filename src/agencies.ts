// 통합 검색 대상 여행사·항공사·OTA 목록
// 사이트별 검색 URL 형식이 자주 바뀌므로, 각 사이트 안의 상품을 찾는 검색엔진(site:) 쿼리와 홈 링크를 함께 제공한다.

export type AgencyKind = '패키지 여행사' | '저가항공 특가' | '항공 비교' | '숙소·OTA' | '특가 커뮤니티'

export interface Agency {
  name: string
  kind: AgencyKind
  domain: string
  home: string
  region?: 'JP' | 'SEA' | 'TW' // 특정 지역에만 취항하는 경우
}

export const AGENCIES: Agency[] = [
  { name: '하나투어', kind: '패키지 여행사', domain: 'hanatour.com', home: 'https://www.hanatour.com' },
  { name: '모두투어', kind: '패키지 여행사', domain: 'modetour.com', home: 'https://www.modetour.com' },
  { name: '노랑풍선', kind: '패키지 여행사', domain: 'ybtour.co.kr', home: 'https://www.ybtour.co.kr' },
  { name: '참좋은여행', kind: '패키지 여행사', domain: 'verygoodtour.com', home: 'https://www.verygoodtour.com' },
  { name: '교원투어 여행이지', kind: '패키지 여행사', domain: 'kyowontour.com', home: 'https://www.kyowontour.com' },
  { name: '롯데관광', kind: '패키지 여행사', domain: 'lottetour.com', home: 'https://www.lottetour.com' },
  { name: '한진관광', kind: '패키지 여행사', domain: 'kaltour.com', home: 'https://www.kaltour.com' },
  { name: '온라인투어', kind: '패키지 여행사', domain: 'onlinetour.co.kr', home: 'https://www.onlinetour.co.kr' },
  { name: '인터파크 투어(NOL)', kind: '패키지 여행사', domain: 'interpark.com', home: 'https://travel.interpark.com' },
  { name: 'KRT', kind: '패키지 여행사', domain: 'krt.co.kr', home: 'https://www.krt.co.kr' },
  { name: '웹투어', kind: '패키지 여행사', domain: 'webtour.com', home: 'https://www.webtour.com' },

  { name: '제주항공', kind: '저가항공 특가', domain: 'jejuair.net', home: 'https://www.jejuair.net' },
  { name: '진에어', kind: '저가항공 특가', domain: 'jinair.com', home: 'https://www.jinair.com' },
  { name: '티웨이항공', kind: '저가항공 특가', domain: 'twayair.com', home: 'https://www.twayair.com' },
  { name: '에어부산', kind: '저가항공 특가', domain: 'airbusan.com', home: 'https://www.airbusan.com' },
  { name: '이스타항공', kind: '저가항공 특가', domain: 'eastarjet.com', home: 'https://www.eastarjet.com' },
  { name: '에어서울', kind: '저가항공 특가', domain: 'flyairseoul.com', home: 'https://flyairseoul.com' },
  { name: '에어프레미아', kind: '저가항공 특가', domain: 'airpremia.com', home: 'https://www.airpremia.com' },
  { name: '피치항공', kind: '저가항공 특가', domain: 'flypeach.com', home: 'https://www.flypeach.com', region: 'JP' },
  { name: '비엣젯', kind: '저가항공 특가', domain: 'vietjetair.com', home: 'https://www.vietjetair.com', region: 'SEA' },
  { name: '타이거에어 타이완', kind: '저가항공 특가', domain: 'tigerairtw.com', home: 'https://www.tigerairtw.com', region: 'TW' },

  { name: '스카이스캐너', kind: '항공 비교', domain: 'skyscanner.co.kr', home: 'https://www.skyscanner.co.kr' },
  { name: '구글 항공권', kind: '항공 비교', domain: 'google.com/travel/flights', home: 'https://www.google.com/travel/flights?hl=ko' },
  { name: '네이버 항공권', kind: '항공 비교', domain: 'flight.naver.com', home: 'https://flight.naver.com' },
  { name: '카약', kind: '항공 비교', domain: 'kayak.co.kr', home: 'https://www.kayak.co.kr' },
  { name: '트립닷컴', kind: '항공 비교', domain: 'trip.com', home: 'https://kr.trip.com' },

  { name: '아고다', kind: '숙소·OTA', domain: 'agoda.com', home: 'https://www.agoda.com/ko-kr' },
  { name: '부킹닷컴', kind: '숙소·OTA', domain: 'booking.com', home: 'https://www.booking.com/index.ko.html' },
  { name: '익스피디아', kind: '숙소·OTA', domain: 'expedia.co.kr', home: 'https://www.expedia.co.kr' },
  { name: '호텔스닷컴', kind: '숙소·OTA', domain: 'hotels.com', home: 'https://kr.hotels.com' },
  { name: '여기어때', kind: '숙소·OTA', domain: 'yeogi.com', home: 'https://www.yeogi.com' },
  { name: '마이리얼트립', kind: '숙소·OTA', domain: 'myrealtrip.com', home: 'https://www.myrealtrip.com' },
  { name: '클룩', kind: '숙소·OTA', domain: 'klook.com', home: 'https://www.klook.com/ko/' },
  { name: '자란(일본 료칸)', kind: '숙소·OTA', domain: 'jalan.net', home: 'https://www.jalan.net/en/', region: 'JP' },
  { name: '라쿠텐 트래블', kind: '숙소·OTA', domain: 'travel.rakuten.com', home: 'https://travel.rakuten.com', region: 'JP' },

  { name: '플레이윙즈', kind: '특가 커뮤니티', domain: 'playwings.co.kr', home: 'https://www.playwings.co.kr' },
  { name: '뽐뿌 여행포럼', kind: '특가 커뮤니티', domain: 'ppomppu.co.kr', home: 'https://www.ppomppu.co.kr' },
  { name: '네이버 카페 (여행 커뮤니티)', kind: '특가 커뮤니티', domain: 'cafe.naver.com', home: 'https://section.cafe.naver.com' },
]

export const AGENCY_KINDS: AgencyKind[] = ['패키지 여행사', '저가항공 특가', '항공 비교', '숙소·OTA', '특가 커뮤니티']
