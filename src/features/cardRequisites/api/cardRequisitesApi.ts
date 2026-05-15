import apiClient from '@/lib/api/client'

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
  middle_name?: string
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
  note?: string
  card_type: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
  province_id: string
  branch_id: string
  first_name: string
  last_name: string
  middle_name?: string
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

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_CARD_REQUISITES: CardRequisite[] = [
  {
    id: '1',
    status: 'pending',
    note: '',
    card_type: 'UZCARD',
    card_number: '8600123456789012',
    card_expiry_month: '12',
    card_expiry_year: '28',
    province_id: '1',
    branch_id: '1',
    province_name: 'Toshkent',
    branch_name: 'Filial 1',
    first_name: 'Ali',
    last_name: 'Valiyev',
    middle_name: 'Akbarovich',
    birth_date: '1990-05-15',
    phone: '+998901234567',
    passport_series: 'AA',
    passport_number: '1234567',
    created_at: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    status: 'approved',
    note: 'Approved',
    card_type: 'HUMO',
    card_number: '9860123456789012',
    card_expiry_month: '05',
    card_expiry_year: '27',
    province_id: '2',
    branch_id: '3',
    province_name: 'Samarqand',
    branch_name: 'Filial 3',
    first_name: 'Bobur',
    last_name: 'Karimov',
    middle_name: 'Rustamovich',
    birth_date: '1985-08-22',
    phone: '+998907654321',
    passport_series: 'AB',
    passport_number: '7654321',
    created_at: '2025-02-20T14:00:00Z',
  },
  {
    id: '3',
    status: 'rejected',
    note: 'Hujjatlar not\'g\'ri',
    card_type: 'VISA',
    card_number: '4400123456789012',
    card_expiry_month: '08',
    card_expiry_year: '26',
    province_id: '3',
    branch_id: '5',
    province_name: 'Buxoro',
    branch_name: 'Filial 5',
    first_name: 'Dilorom',
    last_name: 'Rahimova',
    middle_name: 'Shavkatovna',
    birth_date: '1995-11-02',
    phone: '+998903334455',
    passport_series: 'AC',
    passport_number: '1122334',
    created_at: '2025-03-10T09:15:00Z',
  },
  {
    id: '4',
    status: 'pending',
    note: '',
    card_type: 'UZCARD',
    card_number: '5300123456789012',
    card_expiry_month: '01',
    card_expiry_year: '30',
    province_id: '4',
    branch_id: '7',
    province_name: 'Farg\'ona',
    branch_name: 'Filial 7',
    first_name: 'Elyor',
    last_name: 'Toshmatov',
    middle_name: 'Olimovich',
    birth_date: '2000-03-18',
    phone: '+998905556677',
    passport_series: 'KA',
    passport_number: '9988776',
    created_at: '2025-04-05T16:45:00Z',
  },
  {
    id: '5',
    status: 'approved',
    note: 'Tasdiqlangan',
    card_type: 'HUMO',
    card_number: '6200123456789012',
    card_expiry_month: '03',
    card_expiry_year: '29',
    province_id: '5',
    branch_id: '9',
    province_name: 'Namangan',
    branch_name: 'Filial 9',
    first_name: 'Gulnora',
    last_name: 'Abdullayeva',
    middle_name: 'Anvarovna',
    birth_date: '1992-07-30',
    phone: '+998908889900',
    passport_series: 'KB',
    passport_number: '5566778',
    created_at: '2025-05-12T11:30:00Z',
  },
]

// ─── API functions ────────────────────────────────────────────────────────────

export const cardRequisitesApi = {
  getAll: async (params?: CardRequisiteListParams): Promise<CardRequisiteListResponse> => {
    // Mock data kullanmak için aşağıdaki satırı yorumdan çıkarabilirsiniz:
    return { data: MOCK_CARD_REQUISITES, total: MOCK_CARD_REQUISITES.length, page: params?.page || 1, per_page: params?.per_page || 10 }

    const { data } = await apiClient.get('/card-requisites', { params })
    return data
  },

  getById: async (id: string): Promise<CardRequisite> => {
    // Mock data kullanmak için aşağıdaki satırı yorumdan çıkarabilirsiniz:
    const mock = MOCK_CARD_REQUISITES.find(r => r.id === id)
    if (mock) return mock

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
