

// ─── Sber Payment Order Types ─────────────────────────────────────────────────

export type PaymentStatus = 'GARASYLYYAR' | 'KANAGATLANDYRYLAN' | 'RET_EDILEN'
export type PaymentPaidStatus = 'Tolenmedik' | 'Tolendi'

export interface SberPaymentOrder {
  id: string
  createdAt: string
  welayat: string
  sahamca: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  status: PaymentStatus
  paidStatus: PaymentPaidStatus
  bellik: string
  
  // Payment info
  accountNumber: string
  passportSeries: string
  passportNumber: string
  fullName: string
  
  // Documents
  documents: SberDocument[]
  
  // Payment history
  paymentHistory: PaymentHistoryItem[]
  
  // Activity log
  activityLog: ActivityLogItem[]
}

export interface SberDocument {
  id: string
  name: string
  label: string
  fileUrl: string | null
  fileType: 'image' | 'pdf' | null
}

export interface PaymentHistoryItem {
  id: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
}

export interface ActivityLogItem {
  id: string
  analysisName: string
  createdBy: string
  target: string
  status: 'FINISHED' | 'PENDING' | 'FAILED'
  createdAt: string
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface SberPaymentOrdersResponse {
  data: SberPaymentOrder[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    perPage: number
  }
}

export interface CreateSberPaymentPayload {
  welayat: string
  sahamca: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  status: PaymentStatus
  bellik: string
  accountNumber: string
  passportSeries: string
  passportNumber: string
  fullName: string
}

export interface UpdateSberPaymentPayload extends CreateSberPaymentPayload {
  id: string
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface SberPaymentFormData {
  welayat: string
  sahamca: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  status: PaymentStatus
  bellik: string
  accountNumber: string
  passportSeries: string
  passportNumber: string
  fullName: string
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface SberPaymentFilters {
  search: string
  welayat: string
  sahamca: string
  status: string
  paidStatus: string
}


// ─── Mock Data ────────────────────────────────────────────────────────────────

const turkmenNames = [
  { first: 'Lale', last: 'Agayewa' },
  { first: 'Agamyrat', last: 'Hydyrow' },
  { first: 'Rusdem', last: 'Jorayew' },
  { first: 'Agajan', last: 'Rejepow' },
  { first: 'Cemen', last: 'Mamedowa' },
  { first: 'Ussman', last: 'Saberdiyew' },
  { first: 'Ogultagan', last: 'Amanowa' },
  { first: 'Bahargul', last: 'Dowranowa' },
  { first: 'Muhabet', last: 'Hojakulyyewa' },
  { first: 'Yusupbay', last: 'Orunow' },
  { first: 'Jumagul', last: 'Hasanowa' },
  { first: 'Arazgul', last: 'Akmedowa' },
  { first: 'Samsat', last: 'Mamedowa' },
  { first: 'Anzela', last: 'Metkumyan' },
  { first: 'Durmys', last: 'Bahadurow' },
  { first: 'Serdar', last: 'Nuryyew' },
  { first: 'Kseniya', last: 'Hemrayewa' },
  { first: 'Orazgul', last: 'Dowletowa' },
  { first: 'Salidahan', last: 'Kazyyewa' },
  { first: 'Babamurad', last: 'Abdyraimow' },
  { first: 'Ogulnar', last: 'Babakulyyewa' },
  { first: 'Derman', last: 'Hudaynazarow' },
  { first: 'Hasan', last: 'Tasow' },
  { first: 'Yusupjan', last: 'Tasow' },
  { first: 'Begnazar', last: 'Weliyew' },
]

const welayatlar = ['Mary', 'Lebap', 'Asgabat', 'Dashoguz', 'Balkan']

const sahamcalar: Record<string, string[]> = {
  Mary: ['Bayramaly', 'Mary saheri', 'Sakarçäge'],
  Lebap: ['Turkmenabat', 'Garlyk', 'Seydi', 'Buzmeyin'],
  Asgabat: ['Buzmeyin', 'Berkararlyk', 'Köpetdag'],
  Dashoguz: ['Dashoguz saheri', 'Gubadag', 'Köneurgench'],
  Balkan: ['Balkanabat', 'Turkmenbasy', 'Serdar'],
}

const statuses: Array<'GARASYLYYAR' | 'KANAGATLANDYRYLAN' | 'RET_EDILEN'> = [
  'GARASYLYYAR',
  'KANAGATLANDYRYLAN',
  'RET_EDILEN',
]

const documentLabels = [
  { id: 'rekvezit', name: 'Rekvezit.jpg', label: 'Talyba degisli walýuta "SBERBANK" kartyň rekwizitleri' },
  { id: 'sprawka', name: 'sprawka-2026.jpg', label: 'Talybýň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy baradaky güwanamasy' },
  { id: 'bildirish', name: 'bildirish.jpg', label: 'Talybýň bildirisli göcürmesi' },
  { id: 'passport-copy', name: 'Tkm-pas-Agayewa-Mahllan-(1).jpg', label: 'Talyba degisli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi' },
  { id: 'zagran-1', name: 'Zagran-(1).jpg', label: 'Talybýň Türkmenistandan çykmak we Türkmenistana girmek üçin (zagran) pasportynyň göçürmesi' },
  { id: 'zagran-2', name: 'Zagran-(2).jpg', label: 'Talybýň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportyndaky daşary ýurda çykmak üçin tälynjädägy baradaky beriim miiletti hereket edijan rughsatnamasyniyň (wizasynyň) bellenen sahypasynyň göçürmesi' },
]

function generateMockPaymentOrder(index: number): SberPaymentOrder {
  const name = turkmenNames[index % turkmenNames.length]
  const welayat = welayatlar[index % welayatlar.length]
  const sahamcaList = sahamcalar[welayat]
  const sahamca = sahamcaList[index % sahamcaList.length]
  const status = statuses[index % statuses.length]
  
  const baseDate = new Date(2026, 4, 7) // May 7, 2026
  const orderDate = new Date(baseDate.getTime() - index * 3 * 60 * 1000) // 3 min apart
  
  const idPrefix = ['TB7369', 'TB8319', 'TB8318', 'TB8311', 'TB1308'][index % 5]
  const idNumber = 8137 - index
  
  return {
    id: `${idPrefix}-${idNumber}`,
    createdAt: orderDate.toISOString(),
    welayat,
    sahamca,
    firstName: name.first,
    lastName: name.last,
    phone: `+993-${60 + (index % 5)}${index % 10}-${(42 + index) % 99}-${(28 + index * 2) % 99}-${(13 + index * 3) % 99}`,
    email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@mail.tm`,
    address: `Bayramaly saher 1-nji jay toolumy jay1 oy1`,
    status,
    paidStatus: index % 3 === 0 ? 'Tolendi' : 'Tolenmedik',
    bellik: '',
    accountNumber: `232080100002850`,
    passportSeries: `II-M${String.fromCharCode(65 + (index % 8))}`,
    passportNumber: String(100000 + index * 1234),
    fullName: `${name.first} ${name.last} Sadurdyyewna`,
    documents: documentLabels.map((doc, i) => ({
      id: `doc-${index}-${i}`,
      name: doc.name,
      label: doc.label,
      fileUrl: index % 2 === 0 ? `/uploads/${doc.name}` : null,
      fileType: doc.name.endsWith('.pdf') ? 'pdf' : 'image',
    })),
    paymentHistory: [],
    activityLog: [
      {
        id: `activity-${index}-1`,
        analysisName: 'Gospmak',
        createdBy: `Agayewa ${name.first} Sadurdyyewna`,
        target: `Sber töleg (talyplar üçin): ${idPrefix}-${idNumber}`,
        status: 'FINISHED',
        createdAt: orderDate.toISOString(),
      },
    ],
  }
}

// Generate 100 mock records
const mockPaymentOrders: SberPaymentOrder[] = Array.from({ length: 100 }, (_, i) =>
  generateMockPaymentOrder(i)
)

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getSberPaymentOrders(params: {
  page?: number
  perPage?: number
  search?: string
  welayat?: string
  sahamca?: string
  status?: string
}): Promise<SberPaymentOrdersResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filtered = [...mockPaymentOrders]

  // Apply filters
  if (params.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.firstName.toLowerCase().includes(q) ||
        o.lastName.toLowerCase().includes(q) ||
        o.phone.includes(q)
    )
  }

  if (params.welayat) {
    filtered = filtered.filter((o) => o.welayat === params.welayat)
  }

  if (params.sahamca) {
    filtered = filtered.filter((o) => o.sahamca === params.sahamca)
  }

  if (params.status) {
    filtered = filtered.filter((o) => o.status === params.status)
  }

  const page = params.page ?? 1
  const perPage = params.perPage ?? 25
  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / perPage)
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      perPage,
    },
  }
}

export async function getSberPaymentOrderById(id: string): Promise<SberPaymentOrder | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockPaymentOrders.find((o) => o.id === id) ?? null
}

export async function createSberPaymentOrder(
  payload: CreateSberPaymentPayload
): Promise<SberPaymentOrder> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const newOrder: SberPaymentOrder = {
    id: `TB${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    ...payload,
    paidStatus: 'Tolenmedik',
    documents: [],
    paymentHistory: [],
    activityLog: [],
  }

  mockPaymentOrders.unshift(newOrder)
  return newOrder
}

export async function updateSberPaymentOrder(
  payload: UpdateSberPaymentPayload
): Promise<SberPaymentOrder> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const index = mockPaymentOrders.findIndex((o) => o.id === payload.id)
  if (index === -1) {
    throw new Error('Payment order not found')
  }

  const updated = {
    ...mockPaymentOrders[index],
    ...payload,
  }
  mockPaymentOrders[index] = updated
  return updated
}

export async function deleteSberPaymentOrder(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const index = mockPaymentOrders.findIndex((o) => o.id === id)
  if (index !== -1) {
    mockPaymentOrders.splice(index, 1)
  }
}

// ─── Constants for dropdowns ──────────────────────────────────────────────────

export const WELAYATLAR = welayatlar
export const SAHAMCALAR = sahamcalar
export const STATUSES = [
  { value: 'GARASYLYYAR', label: 'Garasylyyar' },
  { value: 'KANAGATLANDYRYLAN', label: 'Kanagatlandyrylan' },
  { value: 'RET_EDILEN', label: 'Ret edilen' },
]
