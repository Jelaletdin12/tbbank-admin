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
  },
  {
    id: 'L-1003',
    loanType: 'Biznes karzy',
    createdAt: '2024-03-18 09:00',
    region: 'Lebap',
    branch: 'Türkmenabat şahamçasy',
    firstName: 'Myrat',
    lastName: 'Hallyýew',
    phone: '+993 64 778899',
    status: 'KANAGATLANDYRYLAN',
  },
  {
    id: 'L-1004',
    loanType: 'Talyp karzy',
    createdAt: '2024-03-17 16:45',
    region: 'Balkan',
    branch: 'Türkmenbaşy şahamçasy',
    firstName: 'Jeren',
    lastName: 'Saparowa',
    phone: '+993 62 001122',
    status: 'RED_EDILDI',
  },
  {
    id: 'L-1005',
    loanType: 'Awtoulag karzy',
    createdAt: '2024-03-16 11:20',
    region: 'Daşoguz',
    branch: 'Daşoguz-2 şahamçasy',
    firstName: 'Döwlet',
    lastName: 'Meredow',
    phone: '+993 63 334455',
    status: 'GARAŞYLÝAR',
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

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchLoanOrders(
  params: LoanOrdersParams
): Promise<LoanOrdersResponse> {
  // Hakyky API ýok wagty simulator (800ms garaşdyrýar)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Gözleg (search) logic-ni simulirlemek (optional)
  const filtered = MOCK_DATA.filter(item => 
    !params.search || 
    item.firstName.toLowerCase().includes(params.search.toLowerCase()) ||
    item.id.toLowerCase().includes(params.search.toLowerCase())
  );

  return {
    data: filtered,
    total: filtered.length,
    page: params.page || 1,
    perPage: params.perPage || 25,
  };}

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