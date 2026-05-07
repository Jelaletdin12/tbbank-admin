import {apiClient} from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardBalance {
  id: number
  passport_series: string
  passport_number: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
}

export interface CardBalanceListResponse {
  data: CardBalance[]
  total: number
  page: number
  per_page: number
}

export interface CreateCardBalancePayload {
  passport_series: string
  passport_number: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
}

export type UpdateCardBalancePayload = CreateCardBalancePayload

export interface CardBalanceListParams {
  page?: number
  per_page?: number
  search?: string
}

// ─── API ─────────────────────────────────────────────────────────────────────

const MOCK_CARD_BALANCES: CardBalance[] = [
  {
    id: 1,
    passport_series: 'AA',
    passport_number: '1112223',
    card_number: '8600123412341234',
    card_expiry_month: '10',
    card_expiry_year: '2028',
  },
  {
    id: 2,
    passport_series: 'I-MR',
    passport_number: '9988776',
    card_number: '9860123456789012',
    card_expiry_month: '05',
    card_expiry_year: '2027',
  },
  {
    id: 3,
    passport_series: 'II-LB',
    passport_number: '4455667',
    card_number: '4400556677889900',
    card_expiry_month: '12',
    card_expiry_year: '2026',
  },
]

export const cardBalancesApi = {
  getAll: async (params?: CardBalanceListParams): Promise<CardBalanceListResponse> => {
    // Mock data kullanmak için:
    return { data: MOCK_CARD_BALANCES, total: MOCK_CARD_BALANCES.length, page: params?.page || 1, per_page: params?.per_page || 25 }

    const { data } = await apiClient.get('/card-balances', { params })
    return data
  },

  getById: async (id: number): Promise<CardBalance> => {
    // Mock data kullanmak için:
    const mock = MOCK_CARD_BALANCES.find(b => b.id === id)
    if (mock) return mock

    const { data } = await apiClient.get(`/card-balances/${id}`)
    return data
  },

  create: async (payload: CreateCardBalancePayload): Promise<CardBalance> => {
    const { data } = await apiClient.post('/card-balances', payload)
    return data
  },

  update: async (id: number, payload: UpdateCardBalancePayload): Promise<CardBalance> => {
    const { data } = await apiClient.put(`/card-balances/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/card-balances/${id}`)
  },

  download: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get(`/card-balances/${id}/download`, {
      responseType: 'blob',
    })
    return data
  },
}