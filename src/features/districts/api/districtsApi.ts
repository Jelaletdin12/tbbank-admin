export interface District {
  id: number
  name: Record<'tk' | 'ru' | 'en', string>
  description: string | null
  isActive: boolean
}

export interface DistrictListResponse {
  data: District[]
  total: number
  page: number
  perPage: number
}

export interface CreateDistrictPayload {
  name: Record<'tk' | 'ru' | 'en', string>
  description: string | null
  isActive: boolean
}

export interface UpdateDistrictPayload extends CreateDistrictPayload {
  id: number
}

const MOCK_DISTRICTS: District[] = [
  { id: 1, name: { tk: 'Aşgabat', ru: 'Ашхабад', en: 'Ashgabat' }, description: null, isActive: true },
  { id: 2, name: { tk: 'Änew', ru: 'Анев', en: 'Anew' }, description: null, isActive: true },
  { id: 3, name: { tk: 'Baýramaly', ru: 'Байрамалы', en: 'Bayramaly' }, description: null, isActive: true },
  { id: 4, name: { tk: 'Daşoguz', ru: 'Дашогуз', en: 'Dashoguz' }, description: null, isActive: true },
  { id: 5, name: { tk: 'Mary', ru: 'Мары', en: 'Mary' }, description: null, isActive: true },
  { id: 6, name: { tk: 'Türkmenabat', ru: 'Туркменабат', en: 'Turkmenabat' }, description: null, isActive: false },
  { id: 7, name: { tk: 'Balkanabat', ru: 'Балканабат', en: 'Balkanabat' }, description: null, isActive: true },
]

let mockStore = [...MOCK_DISTRICTS]
let nextId = 8

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function fetchDistricts(params: {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}): Promise<DistrictListResponse> {
  await delay()
  const { page = 1, perPage = 25, search = '', isActive } = params

  let filtered = mockStore.filter((item) => {
    const matchSearch =
      !search ||
      Object.values(item.name).some((n) =>
        n.toLowerCase().includes(search.toLowerCase())
      )
    const matchActive =
      isActive === '' || isActive === undefined
        ? true
        : isActive === 'true'
        ? item.isActive
        : !item.isActive
    return matchSearch && matchActive
  })

  filtered = [...filtered].sort((a, b) => b.id - a.id)

  const total = filtered.length
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return { data, total, page, perPage }
}

export async function fetchDistrictById(id: number): Promise<District> {
  await delay()
  const item = mockStore.find((c) => c.id === id)
  if (!item) throw new Error('Not found')
  return { ...item }
}

export async function createDistrict(payload: CreateDistrictPayload): Promise<District> {
  await delay(400)
  const newItem: District = { id: nextId++, ...payload }
  mockStore = [newItem, ...mockStore]
  return newItem
}

export async function updateDistrict(payload: UpdateDistrictPayload): Promise<District> {
  await delay(400)
  const idx = mockStore.findIndex((c) => c.id === payload.id)
  if (idx === -1) throw new Error('Not found')
  const updated = { ...mockStore[idx], ...payload }
  mockStore = mockStore.map((c) => (c.id === payload.id ? updated : c))
  return updated
}

export async function deleteDistrict(id: number): Promise<void> {
  await delay(300)
  mockStore = mockStore.filter((c) => c.id !== id)
}
