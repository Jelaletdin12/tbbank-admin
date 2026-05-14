// ─── Types ────────────────────────────────────────────────────────────────────

export type LoanOrderStatus =
  | 'GARAŞYLÝAR'
  | 'KANAGATLANDYRYLAN'
  | 'RED_EDILDI'
  | 'IŞLENÝÄR'

export interface LoanOrder {
  id: string
  loanType: string
  createdAt: string
  region: string
  branch: string
  firstName: string
  lastName: string
  phone: string
  status: LoanOrderStatus
  note?: string | null

  loanAmount?: number | null
  loanHistory?: string | null
  patronicName?: string | null
  education?: string | null
  marriageStatus?: string | null
  dateOfBirth?: string | null
  residence?: string | null
  currentResidence?: string | null

  passportSerie?: string | null
  passportNumber?: string | null
  passportDateOfIssue?: string | null
  passportGivenBy?: string | null
  bornPlace?: string | null
  passportPage1Url?: string | null
  passportPage23Url?: string | null
  passportPage89Url?: string | null
  passportPage32Url?: string | null

  email?: string | null
  phoneAdditional?: string | null
  homePhone?: string | null

  workCompany?: string | null
  workHrPhone?: string | null
  workRegion?: string | null
  workProvince?: string | null
  position?: string | null
  salary?: number | null
  workStartedAt?: string | null

  cardNumber?: string | null
  cardName?: string | null
  cardExpMonth?: string | null
  cardExpYear?: string | null

  guarantor1Name?: string | null
  guarantor1Surname?: string | null
  guarantor1Patronic?: string | null
  guarantor1PassportSerie?: string | null
  guarantor1PassportNumber?: string | null
  guarantor1CardNumber?: string | null
  guarantor1CardName?: string | null
  guarantor1CardExpMonth?: string | null
  guarantor1CardExpYear?: string | null
  guarantor1Salary?: number | null

  amount?: number | null
  createdBy?: string | null
  fullName?: string | null
  maritalStatus?: string | null
  birthDate?: string | null
  registeredAddress?: string | null
  currentAddress?: string | null
  phoneAlt?: string | null
  employer?: string | null
  deptPhone?: string | null
  workCity?: string | null
  employedSince?: string | null
  passportIssuedBy?: string | null
  passportBirthPlace?: string | null
}

export interface LoanOrdersParams {
  search?: string
  region?: string
  status?: LoanOrderStatus | ''
  branch?: string
  archived?: string
  page?: number
  perPage?: number
}

export interface LoanOrdersResponse {
  data: LoanOrder[]
  total: number
  page: number
  perPage: number
}

export interface LoanOrderPayload {
  status: string
  loanType: string
  region: string
  branch: string
  firstName: string
  lastName: string
  patronicName?: string
  education: string
  marriageStatus: string
  dateOfBirth: string
  residence: string
  currentResidence?: string
  passportSerie: string
  passportNumber: string
  passportDateOfIssue: string
  passportGivenBy: string
  bornPlace?: string
  email?: string
  phone: string
  phoneAdditional?: string
  homePhone?: string
  workCompany: string
  workHrPhone?: string
  workRegion?: string
  workProvince?: string
  position: string
  salary: number
  workStartedAt: string

  note?: string
  loanAmount?: number
  loanHistory?: string

  cardNumber?: string
  cardName?: string
  cardExpMonth?: string
  cardExpYear?: string

  guarantor1Name?: string
  guarantor1Surname?: string
  guarantor1Patronic?: string
  guarantor1PassportSerie?: string
  guarantor1PassportNumber?: string
  guarantor1CardNumber?: string
  guarantor1CardName?: string
  guarantor1CardExpMonth?: string
  guarantor1CardExpYear?: string
  guarantor1Salary?: number
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_DATA: LoanOrder[] = [
  {
    id: 'L-1001',
    loanType: 'Ipoteka karzy',
    createdAt: '2024-03-20 10:30',
    region: 'Aşgabat',
    branch: 'Merkezi şahamça',
    firstName: 'Aman',
    lastName: 'Amanow',
    phone: '+993 65 112233',
    status: 'GARAŞYLÝAR',
    note: 'Müşderi dokumentleri tassyklamady',
    loanAmount: 50000,
    loanHistory: 'positive',
    patronicName: 'Myradowiç',
    education: 'high',
    marriageStatus: 'MARRIED',
    dateOfBirth: '1990-05-15',
    residence: 'Aşgabat, Bitarap Türkmenistan şaýoly, 15',
    currentResidence: 'Aşgabat, Garaşsyzlyk köçesi, 5',
    passportSerie: 'I',
    passportNumber: '123456',
    passportDateOfIssue: '2015-03-10',
    passportGivenBy: 'Aşgabat şäheriniň Içeri işler müdirligi',
    bornPlace: 'Aşgabat şäheri',
    email: 'aman.amanow@email.com',
    phoneAdditional: '+993 65 334455',
    homePhone: '+993 12 456789',
    workCompany: 'Türkmennebit',
    workHrPhone: '+993 12 987654',
    workRegion: 'Aşgabat',
    workProvince: 'Büzmeýin etraby',
    position: 'Inžener',
    salary: 2500,
    workStartedAt: '2018-06-01',
    cardNumber: '4111111111111111',
    cardName: 'AMAN AMANOW',
    cardExpMonth: '12',
    cardExpYear: '2027',
    guarantor1Name: 'Berdi',
    guarantor1Surname: 'Berdiýew',
    guarantor1Patronic: 'Annagulyýewiç',
    guarantor1PassportSerie: 'II',
    guarantor1PassportNumber: '654321',
    guarantor1CardNumber: '4222222222222222',
    guarantor1CardName: 'BERDI BERDIÝEW',
    guarantor1CardExpMonth: '06',
    guarantor1CardExpYear: '2026',
    guarantor1Salary: 3000,
  },
  {
    id: 'L-1002',
    loanType: 'Sarp ediş karzy',
    createdAt: '2024-03-19 14:15',
    region: 'Mary',
    branch: 'Mary-1 şahamçasy',
    firstName: 'Oguljan',
    lastName: 'Berdiýewa',
    phone: '+993 61 445566',
    status: 'IŞLENÝÄR',
    note: null,
    loanAmount: 10000,
    loanHistory: 'new',
    patronicName: 'Myratowna',
    education: 'masters',
    marriageStatus: 'SINGLE',
    dateOfBirth: '1995-11-20',
    residence: 'Mary şäher, Gurbansoltan eje köçesi, 10',
    currentResidence: 'Mary şäher, Gurbansoltan eje köçesi, 10',
    passportSerie: 'I',
    passportNumber: '789012',
    passportDateOfIssue: '2018-07-22',
    passportGivenBy: 'Mary şäheriniň Içeri işler müdirligi',
    bornPlace: 'Mary şäheri',
    email: 'oguljan.berdiýewa@email.com',
    phoneAdditional: null,
    homePhone: null,
    workCompany: 'Mary ýangyn söndüriş bölümi',
    workHrPhone: '+993 55 112233',
    workRegion: 'Mary',
    workProvince: 'Mary şäher',
    position: 'Hasapçy',
    salary: 1800,
    workStartedAt: '2019-03-15',
    cardNumber: '4333333333333333',
    cardName: 'OGULJAN BERDIÝEWA',
    cardExpMonth: '09',
    cardExpYear: '2028',
    guarantor1Name: 'Merdan',
    guarantor1Surname: 'Merdanow',
    guarantor1Patronic: 'Amanowiç',
    guarantor1PassportSerie: 'I',
    guarantor1PassportNumber: '345678',
    guarantor1CardNumber: '4444444444444444',
    guarantor1CardName: 'MERDAN MERDANOW',
    guarantor1CardExpMonth: '03',
    guarantor1CardExpYear: '2025',
    guarantor1Salary: 2200,
  },
]

let mockStore = [...MOCK_DATA]
let nextId = 1003

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchLoanOrders(
  params: LoanOrdersParams
): Promise<LoanOrdersResponse> {
  await delay(600)
  const page = params.page || 1
  const perPage = params.perPage || 25

  let filtered = mockStore.filter((item) => {
    const matchSearch =
      !params.search ||
      `${item.firstName} ${item.lastName}`.toLowerCase().includes(params.search.toLowerCase()) ||
      item.id.toLowerCase().includes(params.search.toLowerCase()) ||
      item.phone.includes(params.search)
    const matchStatus =
      !params.status
        ? true
        : item.status === params.status
    const matchRegion =
      !params.region ? true : item.region === params.region
    const matchBranch =
      !params.branch ? true : item.branch === params.branch
    return matchSearch && matchStatus && matchRegion && matchBranch
  })

  filtered = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const total = filtered.length
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return { data, total, page, perPage }
}

export async function getLoanOrderById(id: string): Promise<LoanOrder> {
  await delay(300)
  const item = mockStore.find((o) => o.id === id)
  if (!item) throw new Error('Not found')
  return { ...item }
}

export async function createLoanOrder(
  payload: LoanOrderPayload
): Promise<LoanOrder> {
  await delay(500)
  const newItem = {
    id: `L-${nextId++}`,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ...payload,
  } as LoanOrder
  mockStore = [newItem, ...mockStore]
  return newItem
}

export async function updateLoanOrder(
  id: string,
  payload: Partial<LoanOrderPayload>
): Promise<LoanOrder> {
  await delay(500)
  const idx = mockStore.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error('Not found')
  const updated = { ...mockStore[idx], ...payload } as LoanOrder
  mockStore = mockStore.map((o) => (o.id === id ? updated : o))
  return updated
}

export async function deleteLoanOrder(id: string): Promise<void> {
  await delay(300)
  mockStore = mockStore.filter((o) => o.id !== id)
}

// ─── Branch options by region ─────────────────────────────────────────────────

export const BRANCHES_BY_REGION: Record<string, { value: string; label: string }[]> = {
  'Aşgabat': [
    { value: 'Merkezi şahamça', label: 'Merkezi şahamça' },
    { value: 'Garaşsyzlyk şahamçasy', label: 'Garaşsyzlyk şahamçasy' },
    { value: 'Bitarap şahamça', label: 'Bitarap şahamça' },
    { value: 'Aşgabat-1 şahamçasy', label: 'Aşgabat-1 şahamçasy' },
    { value: 'Aşgabat-2 şahamçasy', label: 'Aşgabat-2 şahamçasy' },
  ],
  'Ahal': [
    { value: 'Änew şahamçasy', label: 'Änew şahamçasy' },
    { value: 'Gökdepe şahamçasy', label: 'Gökdepe şahamçasy' },
    { value: 'Tejen şahamçasy', label: 'Tejen şahamçasy' },
  ],
  'Balkan': [
    { value: 'Balkanabat şahamçasy', label: 'Balkanabat şahamçasy' },
    { value: 'Türkmenbaşy şahamçasy', label: 'Türkmenbaşy şahamçasy' },
    { value: 'Bereket şahamçasy', label: 'Bereket şahamçasy' },
  ],
  'Daşoguz': [
    { value: 'Daşoguz şahamçasy', label: 'Daşoguz şahamçasy' },
    { value: 'Akdepe şahamçasy', label: 'Akdepe şahamçasy' },
    { value: 'Boldumsaz şahamçasy', label: 'Boldumsaz şahamçasy' },
  ],
  'Lebap': [
    { value: 'Türkmenabat şahamçasy', label: 'Türkmenabat şahamçasy' },
    { value: 'Seýdi şahamçasy', label: 'Seýdi şahamçasy' },
    { value: 'Kerki şahamçasy', label: 'Kerki şahamçasy' },
  ],
  'Mary': [
    { value: 'Mary-1 şahamçasy', label: 'Mary-1 şahamçasy' },
    { value: 'Mary-2 şahamçasy', label: 'Mary-2 şahamçasy' },
    { value: 'Baýramaly şahamçasy', label: 'Baýramaly şahamçasy' },
  ],
  'Arkadag': [
    { value: 'Arkadag şahamçasy', label: 'Arkadag şahamçasy' },
  ],
}
