// features/visaMasterSettings/api/visaMasterSettingsApi.ts

export interface VisaMasterSetting {
  id:        number
  kod:       string
  ady:       string
  yazgy:     string
  createdAt: string
  updatedAt: string
}

export interface VisaMasterSettingListParams {
  page?:    number
  perPage?: number
  search?:  string
}

export interface VisaMasterSettingListResponse {
  data:       VisaMasterSetting[]
  total:      number
  page:       number
  perPage:    number
  totalPages: number
}

export interface VisaMasterSettingPayload {
  kod:   string
  ady:   string
  yazgy: string
}

// ─── Mock Store ───────────────────────────────────────────────────────────────

let mockStore: VisaMasterSetting[] = [
  {
    id:        2,
    kod:       'sber_payment_warning',
    ady:       'Sber töleg duýduryş',
    yazgy:     'Sber töleg duýduryş',
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z',
  },
  {
    id:        1,
    kod:       'payment_warning_text',
    ady:       'Visa/Master töleg duýduryş',
    yazgy:     'Dogry töleg aýyny saýlamagyňyzy haýyş edýäris!!!!',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-04-20T09:00:00Z',
  },
]

let nextId = 3

const delay = (ms = 400) => new Promise<void>((res) => setTimeout(res, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchVisaMasterSettings(
  params: VisaMasterSettingListParams = {}
): Promise<VisaMasterSettingListResponse> {
  await delay()
  const { page = 1, perPage = 25, search = '' } = params

  let filtered = [...mockStore]

  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.kod.toLowerCase().includes(q)   ||
        r.ady.toLowerCase().includes(q)   ||
        r.yazgy.toLowerCase().includes(q) ||
        String(r.id).includes(q)
    )
  }

  filtered.sort((a, b) => b.id - a.id)

  const total      = filtered.length
  const totalPages = Math.ceil(total / perPage) || 1
  const start      = (page - 1) * perPage
  const data       = filtered.slice(start, start + perPage)

  return { data, total, page, perPage, totalPages }
}

export async function fetchVisaMasterSettingById(id: number): Promise<VisaMasterSetting> {
  await delay()
  const item = mockStore.find((r) => r.id === id)
  if (!item) throw new Error(`VisaMasterSetting with id ${id} not found`)
  return { ...item }
}

export async function createVisaMasterSetting(
  payload: VisaMasterSettingPayload
): Promise<VisaMasterSetting> {
  await delay()
  const now = new Date().toISOString()
  const created: VisaMasterSetting = { id: nextId++, ...payload, createdAt: now, updatedAt: now }
  mockStore = [created, ...mockStore]
  return created
}

export async function updateVisaMasterSetting(
  id: number,
  payload: VisaMasterSettingPayload
): Promise<VisaMasterSetting> {
  await delay()
  const idx = mockStore.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error(`VisaMasterSetting with id ${id} not found`)
  const updated: VisaMasterSetting = {
    ...mockStore[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  }
  mockStore = mockStore.map((r) => (r.id === id ? updated : r))
  return updated
}

export async function deleteVisaMasterSetting(id: number): Promise<void> {
  await delay()
  if (!mockStore.some((r) => r.id === id))
    throw new Error(`VisaMasterSetting with id ${id} not found`)
  mockStore = mockStore.filter((r) => r.id !== id)
}