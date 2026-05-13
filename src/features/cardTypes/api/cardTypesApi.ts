// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardType {
  id: number
  name: Record<'tk' | 'ru' | 'en', string>
  value: number
  description: string | null
  isActive: boolean
}

export interface CardTypeListResponse {
  data: CardType[]
  total: number
  page: number
  perPage: number
}

export interface CreateCardTypePayload {
  name: Record<'tk' | 'ru' | 'en', string>
  value: number
  description: string | null
  isActive: boolean
}

export interface UpdateCardTypePayload extends CreateCardTypePayload {
  id: number
}

// ─── Mock Store ───────────────────────────────────────────────────────────────

const MOCK_CARD_TYPES: CardType[] = [
  { id: 1, name: { tk: 'Altyn Asyr', ru: 'Алтын Асыр', en: 'Altyn Asyr' }, value: 32, description: null, isActive: true },
  { id: 2, name: { tk: 'Maşgala', ru: 'Семья', en: 'Family' }, value: 32, description: null, isActive: true },
  { id: 3, name: { tk: 'Goýum', ru: 'Депозит', en: 'Deposit' }, value: 32, description: null, isActive: true },
  { id: 4, name: { tk: 'Pensiýa', ru: 'Пенсия', en: 'Pension' }, value: 32, description: null, isActive: true },
  { id: 5, name: { tk: 'Telekeçi', ru: 'Предприниматель', en: 'Entrepreneur' }, value: 32, description: null, isActive: true },
  { id: 6, name: { tk: 'Karz', ru: 'Кредит', en: 'Credit' }, value: 32, description: null, isActive: false },
  { id: 7, name: { tk: 'Owerdraft', ru: 'Овердрафт', en: 'Overdraft' }, value: 32, description: null, isActive: true },
]

let mockStore = [...MOCK_CARD_TYPES]
let nextId = 8

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchCardTypes(params: {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}): Promise<CardTypeListResponse> {
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

export async function fetchCardTypeById(id: number): Promise<CardType> {
  await delay()
  const item = mockStore.find((c) => c.id === id)
  if (!item) throw new Error('Not found')
  return { ...item }
}

export async function createCardType(payload: CreateCardTypePayload): Promise<CardType> {
  await delay(400)
  const newItem: CardType = { id: nextId++, ...payload }
  mockStore = [newItem, ...mockStore]
  return newItem
}

export async function updateCardType(payload: UpdateCardTypePayload): Promise<CardType> {
  await delay(400)
  const idx = mockStore.findIndex((c) => c.id === payload.id)
  if (idx === -1) throw new Error('Not found')
  const updated = { ...mockStore[idx], ...payload }
  mockStore = mockStore.map((c) => (c.id === payload.id ? updated : c))
  return updated
}

export async function deleteCardType(id: number): Promise<void> {
  await delay(300)
  mockStore = mockStore.filter((c) => c.id !== id)
}