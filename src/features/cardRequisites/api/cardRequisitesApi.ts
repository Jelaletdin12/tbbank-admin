import {apiClient} from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardRequisiteStatus = 'pending' | 'approved' | 'rejected'

export interface CardRequisite {
  id: string
  status: CardRequisiteStatus
  note: string
  created_at: string

  // Card
  card_type: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string

  // Location
  province_id: string
  branch_id: string
  province_name?: string
  branch_name?: string

  // Personal
  first_name: string
  last_name: string
  middle_name: string
  birth_date: string
  phone: string

  // Passport
  passport_series: string
  passport_number: string
  passport_page1_url?: string
  passport_page2_3_url?: string
  passport_page8_9_url?: string
  passport_page32_url?: string
}

export interface CardRequisiteListResponse {
  data: CardRequisite[]
  total: number
  page: number
  per_page: number
}

export interface CreateCardRequisitePayload {
  status: CardRequisiteStatus
  note: string
  card_type: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
  province_id: string
  branch_id: string
  first_name: string
  last_name: string
  middle_name: string
  birth_date: string
  phone: string
  passport_series: string
  passport_number: string
  passport_page1?: File
  passport_page2_3?: File
  passport_page8_9?: File
  passport_page32?: File
}

export type UpdateCardRequisitePayload = CreateCardRequisitePayload

export interface CardRequisiteListParams {
  page?: number
  per_page?: number
  search?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFormData(payload: CreateCardRequisitePayload): FormData {
  const fd = new FormData()

  const textFields: (keyof Omit<
    CreateCardRequisitePayload,
    'passport_page1' | 'passport_page2_3' | 'passport_page8_9' | 'passport_page32'
  >)[] = [
    'status', 'note', 'card_type', 'card_number', 'card_expiry_month',
    'card_expiry_year', 'province_id', 'branch_id', 'first_name', 'last_name',
    'middle_name', 'birth_date', 'phone', 'passport_series', 'passport_number',
  ]

  textFields.forEach((key) => {
    const val = payload[key]
    if (val !== undefined && val !== null) fd.append(key, val)
  })

  if (payload.passport_page1)   fd.append('passport_page1',   payload.passport_page1)
  if (payload.passport_page2_3) fd.append('passport_page2_3', payload.passport_page2_3)
  if (payload.passport_page8_9) fd.append('passport_page8_9', payload.passport_page8_9)
  if (payload.passport_page32)  fd.append('passport_page32',  payload.passport_page32)

  return fd
}

// ─── API functions ────────────────────────────────────────────────────────────

export const cardRequisitesApi = {
  getAll: async (params?: CardRequisiteListParams): Promise<CardRequisiteListResponse> => {
    const { data } = await apiClient.get('/card-requisites', { params })
    return data
  },

  getById: async (id: string): Promise<CardRequisite> => {
    const { data } = await apiClient.get(`/card-requisites/${id}`)
    return data
  },

  create: async (payload: CreateCardRequisitePayload): Promise<CardRequisite> => {
    const { data } = await apiClient.post('/card-requisites', buildFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  update: async (id: string, payload: UpdateCardRequisitePayload): Promise<CardRequisite> => {
    const { data } = await apiClient.post(`/card-requisites/${id}`, buildFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/card-requisites/${id}`)
  },

  download: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/card-requisites/${id}/download`, {
      responseType: 'blob',
    })
    return data
  },
}
