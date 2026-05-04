import { apiClient } from '@/lib/api/client'

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
  }
];

// ─── Types ───────────────────────────────────────────────────────────────────

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

export interface CreateLoanOrderPayload {
  loanType: string
  region: string
  branch: string
  firstName: string
  lastName: string
  phone: string
}

// Add this to your existing loanOrdersApi.ts

export interface LoanOrderCreatePayload {
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
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchLoanOrders(
  params: LoanOrdersParams
): Promise<LoanOrdersResponse> {
  // Hakyky API ýok wagty simulator (800ms garaşdyrýar)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const page = params.page || 1;
  const perPage = params.perPage || 25;

  // Gözleg (search) logic-ni simulirlemek (optional)
  const filtered = MOCK_DATA.filter(item => 
    !params.search || 
    item.firstName.toLowerCase().includes(params.search.toLowerCase()) ||
    item.id.toLowerCase().includes(params.search.toLowerCase())
  );

  // Sayfalama mantığı (slice)
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    total: filtered.length,
    page,
    perPage,
  };
}

// export async function fetchLoanOrders(
//   params: LoanOrdersParams
// ): Promise<LoanOrdersResponse> {
//   const { data } = await apiClient.get<LoanOrdersResponse>(
//     '/resources/loan-orders',
//     { params }
//   )
//   return data
// }

export async function createLoanOrder(
  payload: CreateLoanOrderPayload
): Promise<LoanOrder> {
  const { data } = await apiClient.post<LoanOrder>(
    '/resources/loan-orders',
    payload
  )
  return data
}

export async function updateLoanOrder(
  id: string,
  payload: Partial<CreateLoanOrderPayload>
): Promise<LoanOrder> {
  const { data } = await apiClient.put<LoanOrder>(
    `/resources/loan-orders/${id}`,
    payload
  )
  return data
}

export async function deleteLoanOrder(id: string): Promise<void> {
  await apiClient.delete(`/resources/loan-orders/${id}`)
}

// ─── Extend this into your existing loanOrdersApi.ts ─────────────────────────
// Add the fields below to your existing LoanOrder interface.
// The list page already uses: id, loanType, createdAt, region, branch,
// firstName, lastName, phone, status.

export interface LoanOrder {
  // ── List fields (already exist) ──────────────────────────────────────────
  id: string
  loanType: string
  createdAt: string
  region: string
  branch: string
  firstName: string
  lastName: string
  phone: string
  status: LoanOrderStatus

  // ── Detail-only fields ────────────────────────────────────────────────────
  amount?: string | null
  loanAmount?: string | null
  createdBy?: string | null

  // Personal
  fullName?: string | null
  education?: string | null
  maritalStatus?: string | null
  birthDate?: string | null
  registeredAddress?: string | null
  currentAddress?: string | null

  // Contacts
  email?: string | null
  phoneAlt?: string | null
  homePhone?: string | null

  // Employment
  employer?: string | null
  deptPhone?: string | null
  workRegion?: string | null
  workCity?: string | null
  position?: string | null
  salary?: string | null
  employedSince?: string | null

  // Passport
  passportNumber?: string | null
  passportIssuedBy?: string | null
  passportBirthPlace?: string | null
  passportPage1Url?: string | null
  passportPage23Url?: string | null
  passportPage89Url?: string | null
  passportPage32Url?: string | null
}




// ─── Add this function to your existing loanOrdersApi.ts ──────────────────────
// import { apiClient } from '@/lib/api/client'

export async function getLoanOrderById(id: string): Promise<LoanOrder> {
  const { data } = await apiClient.get<LoanOrder>(`/loan-orders/${id}`)
  return data
}