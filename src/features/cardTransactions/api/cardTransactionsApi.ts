import {apiClient} from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardTransaction {
  id: number
  passport_series: string
  passport_number: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
}

export interface CardTransactionListResponse {
  data: CardTransaction[]
  total: number
  page: number
  per_page: number
}

export interface CreateCardTransactionPayload {
  passport_series: string
  passport_number: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
}

export type UpdateCardTransactionPayload = CreateCardTransactionPayload

export interface CardTransactionListParams {
  page?: number
  per_page?: number
  search?: string
}

// ─── API functions ────────────────────────────────────────────────────────────

const MOCK_CARD_TRANSACTIONS: CardTransaction[] = [
  {
    id: 1,
    passport_series: 'AA',
    passport_number: '1234567',
    card_number: '8600123456789012',
    card_expiry_month: '12',
    card_expiry_year: '28',
  },
  {
    id: 2,
    passport_series: 'AB',
    passport_number: '7654321',
    card_number: '9860123456789012',
    card_expiry_month: '05',
    card_expiry_year: '27',
  },
  {
    id: 3,
    passport_series: 'AC',
    passport_number: '1122334',
    card_number: '4400123456789012',
    card_expiry_month: '08',
    card_expiry_year: '26',
  },
  {
    id: 4,
    passport_series: 'KA',
    passport_number: '9988776',
    card_number: '5300123456789012',
    card_expiry_month: '01',
    card_expiry_year: '30',
  },
  {
    id: 5,
    passport_series: 'KB',
    passport_number: '5566778',
    card_number: '6200123456789012',
    card_expiry_month: '03',
    card_expiry_year: '29',
  },
]

export const cardTransactionsApi = {
  getAll: async (params?: CardTransactionListParams): Promise<CardTransactionListResponse> => {
    // Mock data kullanmak için aşağıdaki satırı yorumdan çıkarabilirsiniz:
    return { data: MOCK_CARD_TRANSACTIONS, total: MOCK_CARD_TRANSACTIONS.length, page: params?.page || 1, per_page: params?.per_page || 10 }

    const { data } = await apiClient.get('/card-transactions', { params })
    return data
  },

  getById: async (id: number): Promise<CardTransaction> => {
    // Mock data kullanmak için aşağıdaki satırı yorumdan çıkarabilirsiniz:
    const mock = MOCK_CARD_TRANSACTIONS.find(t => t.id === id)
    if (mock) return mock

    const { data } = await apiClient.get(`/card-transactions/${id}`)
    return data
  },

  create: async (payload: CreateCardTransactionPayload): Promise<CardTransaction> => {
    const { data } = await apiClient.post('/card-transactions', payload)
    return data
  },

  update: async (id: number, payload: UpdateCardTransactionPayload): Promise<CardTransaction> => {
    const { data } = await apiClient.put(`/card-transactions/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/card-transactions/${id}`)
  },

  download: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get(`/card-transactions/${id}/download`, {
      responseType: 'blob',
    })
    return data
  },
}
