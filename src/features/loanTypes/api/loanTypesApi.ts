// features/loanTypes/api/loanTypesApi.ts

export interface LoanTypeTranslation {
  tk: string
  ru: string
  en: string
}

export interface LoanType {
  id: number
  name: LoanTypeTranslation
  tax: number
  loanTerm: number
  notes: LoanTypeTranslation | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoanTypeListParams {
  page?: number
  perPage?: number
  search?: string
}

export interface LoanTypeListResponse {
  data: LoanType[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface CreateLoanTypePayload {
  name: LoanTypeTranslation
  tax: number
  loanTerm: number
  notes: LoanTypeTranslation | null
  isActive: boolean
}

export type UpdateLoanTypePayload = CreateLoanTypePayload

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LOAN_TYPES: LoanType[] = [
  {
    id: 5,
    name: { tk: 'Talyp karzy', ru: 'Студенческий кредит', en: 'Student Loan' },
    tax: 1,
    loanTerm: 30,
    notes: { tk: 'Bellik', ru: 'Примечание', en: 'Note' },
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-03-15T10:30:00Z',
  },
  {
    id: 4,
    name: {
      tk: 'Üpjünçiligine girew emlägi bolan sarp ediş karzy',
      ru: 'Потребительский кредит под залог имущества',
      en: 'Consumer Loan Secured by Property',
    },
    tax: 1,
    loanTerm: 30,
    notes: null,
    isActive: true,
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 3,
    name: { tk: 'Kiçi göwrümli karzlar', ru: 'Микрокредиты', en: 'Micro Loans' },
    tax: 1,
    loanTerm: 30,
    notes: null,
    isActive: true,
    createdAt: '2026-01-05T07:00:00Z',
    updatedAt: '2026-01-05T07:00:00Z',
  },
  {
    id: 2,
    name: {
      tk: 'Üpjünçiligine zamunlyk bolan sarp ediş karzy',
      ru: 'Потребительский кредит под поручительство',
      en: 'Consumer Loan with Guarantor',
    },
    tax: 1,
    loanTerm: 30,
    notes: null,
    isActive: true,
    createdAt: '2026-01-03T06:00:00Z',
    updatedAt: '2026-01-03T06:00:00Z',
  },
  {
    id: 1,
    name: { tk: 'Ýaş çatynjalara', ru: 'Молодожёнам', en: 'Newlyweds Loan' },
    tax: 1,
    loanTerm: 30,
    notes: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

let _mockStore: LoanType[] = [...MOCK_LOAN_TYPES]
let _nextId = 6

const delay = (ms = 400) => new Promise<void>((res) => setTimeout(res, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchLoanTypes(params: LoanTypeListParams = {}): Promise<LoanTypeListResponse> {
  await delay()
  const { page = 1, perPage = 25, search = '' } = params

  const filtered = search.trim()
    ? _mockStore.filter((lt) =>
        lt.name.tk.toLowerCase().includes(search.toLowerCase()) ||
        lt.name.ru.toLowerCase().includes(search.toLowerCase()) ||
        lt.name.en.toLowerCase().includes(search.toLowerCase())
      )
    : _mockStore

  const sorted = [...filtered].sort((a, b) => b.id - a.id)
  const start = (page - 1) * perPage
  const data = sorted.slice(start, start + perPage)

  return {
    data,
    total: filtered.length,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
  }
}

export async function fetchLoanTypeById(id: number): Promise<LoanType> {
  await delay()
  const found = _mockStore.find((lt) => lt.id === id)
  if (!found) throw new Error(`LoanType with id=${id} not found`)
  return { ...found }
}

export async function createLoanType(payload: CreateLoanTypePayload): Promise<LoanType> {
  await delay()
  const newItem: LoanType = {
    id: _nextId++,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  _mockStore = [newItem, ..._mockStore]
  return { ...newItem }
}

export async function updateLoanType(id: number, payload: UpdateLoanTypePayload): Promise<LoanType> {
  await delay()
  const idx = _mockStore.findIndex((lt) => lt.id === id)
  if (idx === -1) throw new Error(`LoanType with id=${id} not found`)
  _mockStore[idx] = { ..._mockStore[idx], ...payload, updatedAt: new Date().toISOString() }
  return { ..._mockStore[idx] }
}

export async function deleteLoanType(id: number): Promise<void> {
  await delay()
  _mockStore = _mockStore.filter((lt) => lt.id !== id)
}