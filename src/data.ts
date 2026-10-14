// 목적지·비용 기준 데이터 (2026년 11~12월 비수기 기준 추정치, 단위: 만원)
// 실제 가격은 앱의 실시간 검색 링크로 확인한다.

export type Region = 'JP' | 'SEA' | 'TW'
export type Weather = 'good' | 'ok' | 'bad'

export interface Destination {
  id: string
  name: string
  country: string
  flag: string
  region: Region
  hotelCity: string // 숙소 검색어
  tags: string[]
  nights: number
  redEye: boolean // 야간 출발·새벽 귀국 (3박5일형)
  flightPP: [number, number] // 인천 출발 왕복 1인 (세금 포함)
  hotelNight: [number, number] // 4인 1실 1박
  specialNight?: { label: string; price: [number, number] } // 료칸 등 1박 대체
  foodPPDay: [number, number] // 성인 1인 1일
  transport: [number, number] // 현지 교통 총액
  activities: [number, number] // 입장료 등 총액
  weather: { nov: Weather; dec: Weather; note: string }
  itinerary: string[]
  tips: string[]
  routes: Record<string, Route> // 출발 공항별 직항 노선
  japanHolidaySensitive?: boolean
}

export interface Route {
  airport: string // 도착 공항 IATA
  factor?: number // 인천 출발 대비 항공료 배율
  transferSave?: number // 공항↔시내 교통비 절감액 (4인, 만원)
  note?: string
}

export const ORIGINS: Record<string, string> = {
  ICN: '인천',
  GMP: '김포',
  PUS: '부산(김해)',
  TAE: '대구',
  CJJ: '청주',
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'fuk',
    name: '후쿠오카·유후인·벳푸',
    country: '일본 규슈',
    flag: '🇯🇵',
    region: 'JP',
    hotelCity: 'Fukuoka',
    tags: ['온천', '맛집', '관광', '단거리'],
    nights: 3,
    redEye: false,
    flightPP: [18, 25],
    hotelNight: [10, 15],
    specialNight: { label: '유후인/벳푸 온천 료칸 (석·조식)', price: [40, 60] },
    foodPPDay: [3, 3.8],
    transport: [15, 20],
    activities: [8, 12],
    weather: { nov: 'good', dec: 'ok', note: '11월 단풍·선선(10~18℃), 12월 쌀쌀(5~12℃) — 온천엔 최적' },
    itinerary: [
      '하카타 도착 → 캐널시티, 나카스 포장마차(야타이)',
      '고속버스로 유후인 → 유노츠보 거리·긴린코 호수 → 료칸 온천',
      '벳푸 지옥온천 순례(가마도·우미지옥) → 하카타 복귀',
      '다자이후 텐만구 또는 쇼핑 → 귀국',
    ],
    tips: ['료칸은 1인 요금제 — 초등 아동요금(보통 성인의 70%) 확인', '벳푸 뷔페 포함 온천호텔이 료칸보다 저렴한 경우 많음', '부산·대구 출발이 인천보다 저렴 (김포 직항은 없음)'],
    routes: { ICN: { airport: 'FUK' }, PUS: { airport: 'FUK', factor: 0.75 }, TAE: { airport: 'FUK', factor: 0.85 }, CJJ: { airport: 'FUK', factor: 0.95 } },
    japanHolidaySensitive: true,
  },
  {
    id: 'osa',
    name: '오사카·교토·아리마온천',
    country: '일본 간사이',
    flag: '🇯🇵',
    region: 'JP',
    hotelCity: 'Osaka',
    tags: ['온천', '맛집', '관광', '테마파크'],
    nights: 3,
    redEye: false,
    flightPP: [22, 32],
    hotelNight: [13, 18],
    specialNight: { label: '아리마 온천 료칸 (석·조식)', price: [50, 80] },
    foodPPDay: [3, 3.8],
    transport: [20, 25],
    activities: [12, 18],
    weather: { nov: 'good', dec: 'ok', note: '11월 하순 교토 단풍 절정(혼잡), 12월 쌀쌀' },
    itinerary: [
      '간사이공항 → 도톤보리·구로몬시장 먹방',
      '교토 후시미이나리·기요미즈데라',
      '아리마 온천 마을 → 료칸 1박',
      '오사카성 또는 가이유칸 수족관 → 귀국',
    ],
    tips: ['USJ는 4인 약 45만원 추가 — 선택', '간사이 레일패스보다 구간권이 저렴한 경우 많음'],
    routes: { ICN: { airport: 'KIX' }, GMP: { airport: 'KIX', factor: 1.12, note: '김포→간사이 (도심 공항 접근 편리)' }, PUS: { airport: 'KIX', factor: 0.9 }, TAE: { airport: 'KIX', factor: 0.95 }, CJJ: { airport: 'KIX' } },
    japanHolidaySensitive: true,
  },
  {
    id: 'tyo',
    name: '도쿄·하코네 온천',
    country: '일본 간토',
    flag: '🇯🇵',
    region: 'JP',
    hotelCity: 'Tokyo',
    tags: ['온천', '맛집', '관광', '김포 출발'],
    nights: 3,
    redEye: false,
    flightPP: [24, 34],
    hotelNight: [16, 22],
    specialNight: { label: '하코네 온천 료칸 (석·조식)', price: [55, 85] },
    foodPPDay: [3.2, 4],
    transport: [25, 32],
    activities: [10, 15],
    weather: { nov: 'good', dec: 'ok', note: '11월 하코네 단풍, 12월 맑고 건조(5~13℃)' },
    itinerary: [
      '도착 → 아사쿠사 센소지·스카이트리',
      '로망스카로 하코네 → 오와쿠다니·아시노코 해적선 → 료칸 온천',
      '도쿄 복귀 → 시부야·오다이바',
      '쓰키지 장외시장 아침 → 귀국',
    ],
    tips: ['김포→하네다는 도심까지 30분 — 나리타 대비 4인 교통비 약 6만원·1시간 절약', '하코네 프리패스 아동 반값', '나리타 도착 시 스카이라이너 사전 구매 할인'],
    routes: { ICN: { airport: 'NRT' }, GMP: { airport: 'HND', factor: 1.12, transferSave: 6, note: '김포→하네다 (도심 30분)' }, PUS: { airport: 'NRT' } },
    japanHolidaySensitive: true,
  },
  {
    id: 'myj',
    name: '마쓰야마 도고온천',
    country: '일본 시코쿠',
    flag: '🇯🇵',
    region: 'JP',
    hotelCity: 'Matsuyama',
    tags: ['온천', '한적', '소도시'],
    nights: 3,
    redEye: false,
    flightPP: [20, 30],
    hotelNight: [9, 13],
    specialNight: { label: '도고온천 료칸 (석·조식)', price: [35, 55] },
    foodPPDay: [2.5, 3.2],
    transport: [6, 9],
    activities: [4, 7],
    weather: { nov: 'good', dec: 'ok', note: '온화한 편, 관광객 적어 숙박 저렴' },
    itinerary: [
      '마쓰야마 도착 → 노면전차로 도고온천 본관',
      '마쓰야마성 로프웨이 → 오카이도 상점가',
      '우치코 또는 시모나다역 드라이브(선택)',
      '도고 하이카라 거리 쇼핑 → 귀국',
    ],
    tips: ['인천 직항이 주 몇 회뿐 — 운항 요일 먼저 확인', '노면전차 1일권으로 교통비 절약'],
    routes: { ICN: { airport: 'MYJ' } },
    japanHolidaySensitive: true,
  },
  {
    id: 'pqc',
    name: '푸꾸옥',
    country: '베트남',
    flag: '🇻🇳',
    region: 'SEA',
    hotelCity: 'Phu Quoc',
    tags: ['휴양', '물놀이', '테마파크', '따뜻함'],
    nights: 3,
    redEye: true,
    flightPP: [30, 40],
    hotelNight: [10, 15],
    foodPPDay: [1.6, 2.2],
    transport: [8, 12],
    activities: [25, 30],
    weather: { nov: 'good', dec: 'good', note: '11월부터 건기, 27~31℃ 해수욕 가능' },
    itinerary: [
      '저녁 출발 → 새벽 도착, 리조트 체크인',
      '빈원더스 + 사파리 (아동 키 140cm 미만 할인)',
      '혼텀 케이블카·남부 해변',
      '야시장 → 심야편 귀국(아침 도착)',
    ],
    tips: ['리조트 얼리체크인/레이트체크아웃 포함 상품 비교', '빈펄 패키지(숙박+입장권) 묶음이 더 싼 경우 있음'],
    routes: { ICN: { airport: 'PQC' }, PUS: { airport: 'PQC' } },
  },
  {
    id: 'tpe',
    name: '타이베이',
    country: '대만',
    flag: '🇹🇼',
    region: 'TW',
    hotelCity: 'Taipei',
    tags: ['맛집', '관광', '야시장', '단거리'],
    nights: 3,
    redEye: false,
    flightPP: [20, 30],
    hotelNight: [15, 20],
    foodPPDay: [1.8, 2.4],
    transport: [6, 9],
    activities: [8, 12],
    weather: { nov: 'ok', dec: 'ok', note: '15~22℃ 선선, 비 잦음 — 우산 필수' },
    itinerary: [
      '도착 → 시먼딩·용산사, 화시제 야시장',
      '예스진지 투어(예류·스펀 천등·지우펀)',
      '타이베이 동물원 + 마오쿵 곤돌라',
      '중정기념당·딘타이펑 → 귀국',
    ],
    tips: ['이지카드로 지하철·버스 할인', '예스진지는 4인이면 택시투어가 버스투어와 비슷'],
    routes: { ICN: { airport: 'TPE' }, GMP: { airport: 'TSA', factor: 1.1, transferSave: 3, note: '김포→쑹산 (타이베이 시내 공항)' }, PUS: { airport: 'TPE', factor: 0.95 }, TAE: { airport: 'TPE' }, CJJ: { airport: 'TPE' } },
  },
  {
    id: 'bkk',
    name: '방콕·파타야',
    country: '태국',
    flag: '🇹🇭',
    region: 'SEA',
    hotelCity: 'Bangkok',
    tags: ['맛집', '관광', '수영장호텔', '따뜻함'],
    nights: 3,
    redEye: true,
    flightPP: [35, 45],
    hotelNight: [8, 12],
    foodPPDay: [1.5, 2],
    transport: [8, 12],
    activities: [15, 20],
    weather: { nov: 'good', dec: 'good', note: '건기·연중 가장 쾌적(25~32℃)' },
    itinerary: [
      '저녁 출발 → 심야 도착, 호텔',
      '왕궁·왓포 → 아이콘시암',
      '파타야 산호섬 또는 사파리월드',
      '짜뚜짝/쇼핑 → 심야편 귀국',
    ],
    tips: ['수영장 좋은 호텔이 1박 10만원 안팎', '그랩으로 이동, 툭툭은 흥정 필요'],
    routes: { ICN: { airport: 'BKK' }, PUS: { airport: 'BKK' }, TAE: { airport: 'BKK', factor: 1.05 } },
  },
  {
    id: 'dad',
    name: '다낭·호이안',
    country: '베트남',
    flag: '🇻🇳',
    region: 'SEA',
    hotelCity: 'Da Nang',
    tags: ['휴양', '관광', '저렴'],
    nights: 3,
    redEye: true,
    flightPP: [25, 35],
    hotelNight: [8, 12],
    foodPPDay: [1.5, 2],
    transport: [8, 10],
    activities: [15, 20],
    weather: { nov: 'bad', dec: 'bad', note: '⚠️ 10~12월 우기·태풍 영향 — 비추천 시기' },
    itinerary: ['저녁 출발 → 심야 도착', '바나힐', '호이안 올드타운', '미케비치 → 심야편 귀국'],
    tips: ['이 시기엔 일정 변경 가능 요금 권장'],
    routes: { ICN: { airport: 'DAD' }, PUS: { airport: 'DAD' }, TAE: { airport: 'DAD', factor: 1.05 }, CJJ: { airport: 'DAD', factor: 1.05 } },
  },
]

export const PEAK_START = '2026-12-19' // 크리스마스·연말 성수기
export const JP_HOLIDAYS = ['2026-11-03', '2026-11-21', '2026-11-22', '2026-11-23'] // 문화의 날, 근로감사의 날 3연휴
export const KR_HOLIDAYS = ['2026-12-25']
