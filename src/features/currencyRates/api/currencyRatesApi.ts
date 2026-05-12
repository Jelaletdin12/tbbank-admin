// features/currencyRates/api/currencyRatesApi.ts

export type CurrencyCode = 'USD' | 'RUB' | 'TMT' | 'EUR' | 'GBP' | 'CNY' | 'TRY'

export interface CurrencyRate {
  id: number
  currencyFrom: CurrencyCode
  currencyTo: CurrencyCode
  value: number
  createdAt: string
  updatedAt: string
}

export interface CurrencyRateListParams {
  page?: number
  perPage?: number
  search?: string
}

export interface CurrencyRateListResponse {
  data: CurrencyRate[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface CreateCurrencyRatePayload {
  currencyFrom: CurrencyCode
  currencyTo: CurrencyCode
  value: number
}

export type UpdateCurrencyRatePayload = CreateCurrencyRatePayload

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RATES: CurrencyRate[] = [
  { id: 6, currencyFrom: 'USD', currencyTo: 'USD', value: 250,      createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-05-01T10:00:00Z' },
  { id: 5, currencyFrom: 'RUB', currencyTo: 'TMT', value: 0.047504, createdAt: '2026-03-15T08:30:00Z', updatedAt: '2026-05-10T08:30:00Z' },
  { id: 4, currencyFrom: 'USD', currencyTo: 'RUB', value: 74.0455,  createdAt: '2026-02-20T14:00:00Z', updatedAt: '2026-05-08T14:00:00Z' },
  { id: 2, currencyFrom: 'USD', currencyTo: 'TMT', value: 3.5175,   createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-05-05T09:00:00Z' },
  { id: 1, currencyFrom: 'EUR', currencyTo: 'TMT', value: 3.8120,   createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-05-03T09:00:00Z' },
  { id: 3, currencyFrom: 'EUR', currencyTo: 'RUB', value: 80.2300,  createdAt: '2026-01-12T11:00:00Z', updatedAt: '2026-04-28T11:00:00Z' },
  { id: 7, currencyFrom: 'GBP', currencyTo: 'TMT', value: 4.4500,   createdAt: '2026-04-10T13:00:00Z', updatedAt: '2026-05-11T13:00:00Z' },
  { id: 8, currencyFrom: 'CNY', currencyTo: 'TMT', value: 0.4850,   createdAt: '2026-04-15T10:00:00Z', updatedAt: '2026-05-09T10:00:00Z' },
]

let mockStore: CurrencyRate[] = [...MOCK_RATES]
let nextId = 9

const delay = (ms = 400) => new Promise<void>((res) => setTimeout(res, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchCurrencyRates(
  params: CurrencyRateListParams = {}
): Promise<CurrencyRateListResponse> {
  await delay()
  const { page = 1, perPage = 25, search = '' } = params

  let filtered = [...mockStore]

  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.currencyFrom.toLowerCase().includes(q) ||
        r.currencyTo.toLowerCase().includes(q) ||
        String(r.value).includes(q) ||
        String(r.id).includes(q)
    )
  }

  // Sort by id desc
  filtered.sort((a, b) => b.id - a.id)

  const total = filtered.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return { data, total, page, perPage, totalPages }
}

export async function fetchCurrencyRateById(id: number): Promise<CurrencyRate> {
  await delay()
  const rate = mockStore.find((r) => r.id === id)
  if (!rate) throw new Error(`Currency rate with id ${id} not found`)
  return { ...rate }
}

export async function createCurrencyRate(
  payload: CreateCurrencyRatePayload
): Promise<CurrencyRate> {
  await delay()
  const now = new Date().toISOString()
  const newRate: CurrencyRate = {
    id: nextId++,
    ...payload,
    createdAt: now,
    updatedAt: now,
  }
  mockStore = [newRate, ...mockStore]
  return newRate
}

export async function updateCurrencyRate(
  id: number,
  payload: UpdateCurrencyRatePayload
): Promise<CurrencyRate> {
  await delay()
  const idx = mockStore.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error(`Currency rate with id ${id} not found`)
  const updated: CurrencyRate = {
    ...mockStore[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  }
  mockStore = mockStore.map((r) => (r.id === id ? updated : r))
  return updated
}

export async function deleteCurrencyRate(id: number): Promise<void> {
  await delay()
  const exists = mockStore.some((r) => r.id === id)
  if (!exists) throw new Error(`Currency rate with id ${id} not found`)
  mockStore = mockStore.filter((r) => r.id !== id)
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'RUB', label: 'RUB — Russian Ruble' },
  { value: 'TMT', label: 'TMT — Turkmen Manat' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CNY', label: 'CNY — Chinese Yuan' },
  { value: 'TRY', label: 'TRY — Turkish Lira' },
]