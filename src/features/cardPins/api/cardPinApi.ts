import { apiClient } from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardPinStatus = 'pending' | 'approved' | 'rejected'

export interface CardPinItem {
  id: string
  card_type: string
  card_type_label: string
  card_number: string
  created_at: string
  province: string
  province_label: string
  branch: string
  branch_label: string
  first_name: string
  last_name: string
  father_name: string
  birth_date: string
  phone: string
  status: CardPinStatus
  note: string | null
  passport_series: string
  passport_number: string
  passport_file_1: string | null
  passport_file_2: string | null
  passport_file_3: string | null
  passport_file_4: string | null
  created_by: string
  created_by_label: string
}

export interface CardPinListParams {
  page?: number
  per_page?: number
  search?: string
  status?: CardPinStatus | ''
  province?: string
}

export interface CardPinListResponse {
  data: CardPinItem[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface CardPinCreatePayload {
  status: CardPinStatus
  note: string
  card_type: string
  card_number: string
  province: string
  branch: string
  first_name: string
  last_name: string
  father_name: string
  birth_date: string
  phone: string
  passport_series: string
  passport_number: string
  passport_file_1: File | null
  passport_file_2: File | null
  passport_file_3: File | null
  passport_file_4: File | null
}

export type CardPinUpdatePayload = CardPinCreatePayload

// ─── API Functions ────────────────────────────────────────────────────────────

const MOCK_CARD_PINS: CardPinItem[] = [
  {
    id: '1',
    card_type: 'altyn_asyr',
    card_type_label: 'Altyn Asyr',
    card_number: '8600123456789012',
    created_at: '2024-05-07 10:00',
    province: 'ashgabat',
    province_label: 'Aşgabat',
    branch: '1',
    branch_label: 'Merkezi şahamça',
    first_name: 'Aman',
    last_name: 'Amanow',
    father_name: 'Amanowiç',
    birth_date: '1990-01-01',
    phone: '99365123456',
    status: 'pending',
    note: 'Test bellik',
    passport_series: 'I-MR',
    passport_number: '123456',
    passport_file_1: null,
    passport_file_2: null,
    passport_file_3: null,
    passport_file_4: null,
    created_by: '1',
    created_by_label: 'Admin',
  },
  {
    id: '2',
    card_type: 'visa',
    card_type_label: 'Visa',
    card_number: '4400123456789012',
    created_at: '2024-05-07 11:30',
    province: 'mary',
    province_label: 'Mary',
    branch: '2',
    branch_label: 'Mary şahamçasy',
    first_name: 'Berdi',
    last_name: 'Berdiyew',
    father_name: 'Berdiyewiç',
    birth_date: '1995-05-05',
    phone: '99361112233',
    status: 'approved',
    note: null,
    passport_series: 'I-LB',
    passport_number: '654321',
    passport_file_1: null,
    passport_file_2: null,
    passport_file_3: null,
    passport_file_4: null,
    created_by: '1',
    created_by_label: 'Admin',
  },
]

export const cardPinApi = {
  list: async (params: CardPinListParams): Promise<CardPinListResponse> => {
    // Mock data return
    return {
      data: MOCK_CARD_PINS,
      meta: {
        current_page: params.page || 1,
        last_page: 1,
        per_page: params.per_page || 25,
        total: MOCK_CARD_PINS.length,
      }
    }

    const { data } = await apiClient.get('/card-pins', { params })
    return data
  },

  getById: async (id: string): Promise<CardPinItem> => {
    const mock = MOCK_CARD_PINS.find(p => p.id === id)
    if (mock) return mock

    const { data } = await apiClient.get(`/card-pins/${id}`)
    return data
  },

  create: (payload: CardPinCreatePayload): Promise<CardPinItem> => {
    const form = buildFormData(payload)
    return apiClient.post('/card-pins', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  update: (id: string, payload: CardPinUpdatePayload): Promise<CardPinItem> => {
    const form = buildFormData(payload)
    form.append('_method', 'PUT')
    return apiClient.post(`/card-pins/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/card-pins/${id}`).then((r) => r.data),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFormData(payload: CardPinCreatePayload): FormData {
  const form = new FormData()

  const textFields: (keyof CardPinCreatePayload)[] = [
    'status', 'note', 'card_type', 'card_number',
    'province', 'branch',
    'first_name', 'last_name', 'father_name',
    'birth_date', 'phone',
    'passport_series', 'passport_number',
  ]

  for (const key of textFields) {
    const val = payload[key]
    if (val !== null && val !== undefined) {
      form.append(key, String(val))
    }
  }

  const fileFields: (keyof CardPinCreatePayload)[] = [
    'passport_file_1', 'passport_file_2', 'passport_file_3', 'passport_file_4',
  ]

  for (const key of fileFields) {
    const file = payload[key]
    if (file instanceof File) form.append(key, file)
  }

  return form
}