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