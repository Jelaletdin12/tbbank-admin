import { apiClient } from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoanOrderStatus =
  | 'GARAŞYLÝAR'
  | 'KANAGATLANDYRYLAN'
  | 'RED_EDILDI'
  | 'IŞLENÝÄR'

export interface LoanOrder {
  // ── List fields ──────────────────────────────────────────────────────────
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

  // ── Detail fields ─────────────────────────────────────────────────────────
  loanAmount?: number | null
  loanHistory?: string | null
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

  // ── Restored fields from previous version ───────────────────────────────
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
  },
]

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchLoanOrders(
  params: LoanOrdersParams
): Promise<LoanOrdersResponse> {
  // Mock — real API hazır bolanda aşakdaky commentden çykar
  await new Promise((resolve) => setTimeout(resolve, 800))
  const page = params.page || 1
  const perPage = params.perPage || 25
  const filtered = MOCK_DATA.filter(
    (item) =>
      !params.search ||
      item.firstName.toLowerCase().includes(params.search.toLowerCase()) ||
      item.id.toLowerCase().includes(params.search.toLowerCase())
  )
  const start = (page - 1) * perPage
  return {
    data: filtered.slice(start, start + perPage),
    total: filtered.length,
    page,
    perPage,
  }

  // const { data } = await apiClient.get<LoanOrdersResponse>('/loan-orders', { params })
  // return data
}

export async function getLoanOrderById(id: string): Promise<LoanOrder> {
  const { data } = await apiClient.get<LoanOrder>(`/loan-orders/${id}`)
  return data
}

export async function createLoanOrder(
  payload: LoanOrderPayload
): Promise<LoanOrder> {
  const { data } = await apiClient.post<LoanOrder>('/loan-orders', payload)
  return data
}

export async function updateLoanOrder(
  id: string,
  payload: Partial<LoanOrderPayload>
): Promise<LoanOrder> {
  const { data } = await apiClient.put<LoanOrder>(`/loan-orders/${id}`, payload)
  return data
}

export async function deleteLoanOrder(id: string): Promise<void> {
  await apiClient.delete(`/loan-orders/${id}`)
}