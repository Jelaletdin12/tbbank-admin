import { apiClient } from '@/lib/api/client'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LoanOrderMobileStatus =
  | 'GARAŞYLÝAR'
  | 'KANAGATLANDYRYLAN'
  | 'RED_EDILDI'
  | 'IŞLENÝÄR'

export interface LoanOrderMobile {
  id: string
  loanType: string
  createdAt: string
  region: string
  branch: string
  firstName: string
  lastName: string
  phone: string
  status: LoanOrderMobileStatus
  createdBy?: string

  // ── Detail fields ─────────────────────────────────────────────────────────
  patronicName?: string | null
  education?: string | null
  marriageStatus?: string | null
  dateOfBirth?: string | null
  residence?: string | null
  currentResidence?: string | null

  // Passport
  passportSerie?: string | null
  passportNumber?: string | null
  passportDateOfIssue?: string | null
  passportGivenBy?: string | null
  bornPlace?: string | null
  passportPage1Url?: string | null
  passportPage23Url?: string | null
  passportPage89Url?: string | null
  passportPage32Url?: string | null

  // Contact
  email?: string | null
  phoneAdditional?: string | null
  homePhone?: string | null

  // Employment
  workCompany?: string | null
  workHrPhone?: string | null
  workRegion?: string | null
  workProvince?: string | null
  position?: string | null
  salary?: number | null
  workStartedAt?: string | null

  // New fields
  note?: string | null
  loanAmount?: number | null
  loanHistory?: string | null

  // Card (Zähmet haky)
  cardNumber?: string | null
  cardName?: string | null
  cardExpMonth?: string | null
  cardExpYear?: string | null

  // Guarantor (Zamun)
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
}

export interface LoanOrderMobilePayload {
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

export interface LoanOrderMobileListParams {
  search?: string
  region?: string
  status?: LoanOrderMobileStatus
  branch?: string
  archived?: string
  page?: number
  perPage?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const USE_MOCK = true // gerçek API hazır olunca false yap

const MOCK_DATA: LoanOrderMobile[] = [
  { id: 'LOM-0001', loanType: 'Sarp etmek karzy',    createdAt: '2025-01-15 09:42', region: 'Aşgabat', branch: 'Merkezi',  firstName: 'Oraz',    lastName: 'Annaýew',    phone: '+99361123456', status: 'GARAŞYLÝAR'        },
  { id: 'LOM-0002', loanType: 'Awtoulag karzy',       createdAt: '2025-01-18 11:05', region: 'Ahal',    branch: 'Änew',     firstName: 'Merjen',  lastName: 'Hudaýewa',   phone: '+99362234567', status: 'KANAGATLANDYRYLAN' },
  { id: 'LOM-0003', loanType: 'Ipoteka karzy',        createdAt: '2025-01-20 14:30', region: 'Balkan',  branch: 'Türkmenbaşy', firstName: 'Serdar', lastName: 'Durdyýew', phone: '+99363345678', status: 'IŞLENÝÄR'          },
  { id: 'LOM-0004', loanType: 'Telekeçilik karzy',    createdAt: '2025-01-22 08:15', region: 'Lebap',   branch: 'Türkmenabat', firstName: 'Aýna',  lastName: 'Meredowa',   phone: '+99365456789', status: 'RED_EDILDI'        },
  { id: 'LOM-0005', loanType: 'Sarp etmek karzy',    createdAt: '2025-01-25 16:00', region: 'Mary',    branch: 'Mary',     firstName: 'Begmyrat',lastName: 'Oraz',        phone: '+99366567890', status: 'GARAŞYLÝAR'        },
  { id: 'LOM-0006', loanType: 'Bilim karzy',          createdAt: '2025-01-28 10:20', region: 'Daşoguz', branch: 'Daşoguz',  firstName: 'Gülälek', lastName: 'Saparowa',   phone: '+99361678901', status: 'KANAGATLANDYRYLAN' },
  { id: 'LOM-0007', loanType: 'Awtoulag karzy',       createdAt: '2025-02-01 13:45', region: 'Aşgabat', branch: 'Çoganly',  firstName: 'Myrat',   lastName: 'Ataýew',     phone: '+99362789012', status: 'IŞLENÝÄR'          },
  { id: 'LOM-0008', loanType: 'Ipoteka karzy',        createdAt: '2025-02-03 09:00', region: 'Ahal',    branch: 'Tejen',    firstName: 'Ogulnur', lastName: 'Berdiýewa',  phone: '+99363890123', status: 'GARAŞYLÝAR'        },
  { id: 'LOM-0009', loanType: 'Telekeçilik karzy',    createdAt: '2025-02-05 15:30', region: 'Balkan',  branch: 'Balkanabat', firstName: 'Döwlet', lastName: 'Çaryýew',   phone: '+99364901234', status: 'RED_EDILDI'        },
  { id: 'LOM-0010', loanType: 'Sarp etmek karzy',    createdAt: '2025-02-08 11:15', region: 'Lebap',   branch: 'Farap',    firstName: 'Maral',   lastName: 'Ýollyýewa',  phone: '+99365012345', status: 'KANAGATLANDYRYLAN' },
  { id: 'LOM-0011', loanType: 'Bilim karzy',          createdAt: '2025-02-10 08:45', region: 'Mary',    branch: 'Baýramaly', firstName: 'Nurmuhammet', lastName: 'Garaýew', phone: '+99366123456', status: 'GARAŞYLÝAR'      },
  { id: 'LOM-0012', loanType: 'Awtoulag karzy',       createdAt: '2025-02-12 14:00', region: 'Daşoguz', branch: 'Köneürgenç', firstName: 'Şemşat', lastName: 'Jumaýewa',  phone: '+99361234567', status: 'IŞLENÝÄR'          },
]

function applyMockFilters(
  params: LoanOrderMobileListParams,
): PaginatedResponse<LoanOrderMobile> {
  let result = [...MOCK_DATA]

  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      (r) =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.id.toLowerCase().includes(q),
    )
  }
  if (params.region)   result = result.filter((r) => r.region === params.region)
  if (params.status)   result = result.filter((r) => r.status === params.status)
  if (params.branch)   result = result.filter((r) => r.branch === params.branch)

  const total   = result.length
  const page    = params.page    ?? 1
  const perPage = params.perPage ?? 25
  const start   = (page - 1) * perPage

  return { data: result.slice(start, start + perPage), total }
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function fetchLoanOrderMobiles(
  params: LoanOrderMobileListParams,
): Promise<PaginatedResponse<LoanOrderMobile>> {
  if (USE_MOCK) return applyMockFilters(params)

  const { data } = await apiClient.get<PaginatedResponse<LoanOrderMobile>>(
    '/loan-order-mobiles',
    { params },
  )
  return data
}

export async function deleteLoanOrderMobile(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_DATA.findIndex((r) => r.id === id)
    if (idx !== -1) MOCK_DATA.splice(idx, 1)
    return
  }
  await apiClient.delete(`/loan-order-mobiles/${id}`)
}

export async function getLoanOrderMobileById(id: string): Promise<LoanOrderMobile> {
  if (USE_MOCK) {
    const order = MOCK_DATA.find((r) => r.id === id)
    if (!order) throw new Error('Not found')
    return order
  }
  const { data } = await apiClient.get<LoanOrderMobile>(`/loan-order-mobiles/${id}`)
  return data
}

export async function createLoanOrderMobile(
  payload: LoanOrderMobilePayload
): Promise<LoanOrderMobile> {
  if (USE_MOCK) {
    const newOrder: LoanOrderMobile = {
      ...payload,
      id: `LOM-${String(MOCK_DATA.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: payload.status as LoanOrderMobileStatus,
    }
    MOCK_DATA.unshift(newOrder)
    return newOrder
  }
  const { data } = await apiClient.post<LoanOrderMobile>('/loan-order-mobiles', payload)
  return data
}

export async function updateLoanOrderMobile(
  id: string,
  payload: Partial<LoanOrderMobilePayload>
): Promise<LoanOrderMobile> {
  if (USE_MOCK) {
    const idx = MOCK_DATA.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Not found')
    MOCK_DATA[idx] = { ...MOCK_DATA[idx], ...payload } as LoanOrderMobile
    return MOCK_DATA[idx]
  }
  const { data } = await apiClient.put<LoanOrderMobile>(`/loan-order-mobiles/${id}`, payload)
  return data
}