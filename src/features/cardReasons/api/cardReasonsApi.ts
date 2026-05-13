// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardReason {
  id: number
  name: Record<'tk' | 'ru' | 'en', string>
  value: number
  description: string | null
  isActive: boolean
}

export interface CardReasonListResponse {
  data: CardReason[]
  total: number
  page: number
  perPage: number
}

export interface CreateCardReasonPayload {
  name: Record<'tk' | 'ru' | 'en', string>
  value: number
  description: string | null
  isActive: boolean
}

export interface UpdateCardReasonPayload extends CreateCardReasonPayload {
  id: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CARD_STATES: CardReason[] = [
  { id: 1, name: { tk: 'Täze', ru: 'Новый', en: 'New' }, value: 32, description: null, isActive: true },
  { id: 2, name: { tk: 'Döwülen/Zaýalanan', ru: 'Сломанный/Поврежденный', en: 'Broken/Damaged' }, value: 32, description: null, isActive: true },
  { id: 3, name: { tk: 'Ulanylyş möhleti geçen', ru: 'Срок истёк', en: 'Expired' }, value: 32, description: null, isActive: true },
  { id: 4, name: { tk: 'Maşgalasy üýtgeýär', ru: 'Смена фамилии', en: 'Name change' }, value: 32, description: null, isActive: true },
  { id: 5, name: { tk: 'Ýiten', ru: 'Потерян', en: 'Lost' }, value: 37.75, description: null, isActive: true },
  { id: 6, name: { tk: 'Pin bukja (bloklanan)', ru: 'Пин конверт (заблокирован)', en: 'Pin envelope (blocked)' }, value: 3.02, description: null, isActive: false },
  { id: 7, name: { tk: 'Rekwizit', ru: 'Реквизит', en: 'Requisite' }, value: 2.30, description: null, isActive: false },
]

let mockStore = [...MOCK_CARD_STATES]
let nextId = 8

// Simulated async delay
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchCardReasons(params: {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}): Promise<CardReasonListResponse> {
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

export async function fetchCardReasonById(id: number): Promise<CardReason> {
  await delay()
  const item = mockStore.find((c) => c.id === id)
  if (!item) throw new Error('Not found')
  return { ...item }
}

export async function createCardReason(payload: CreateCardReasonPayload): Promise<CardReason> {
  await delay(400)
  const newItem: CardReason = { id: nextId++, ...payload }
  mockStore = [newItem, ...mockStore]
  return newItem
}

export async function updateCardReason(payload: UpdateCardReasonPayload): Promise<CardReason> {
  await delay(400)
  const idx = mockStore.findIndex((c) => c.id === payload.id)
  if (idx === -1) throw new Error('Not found')
  const updated = { ...mockStore[idx], ...payload }
  mockStore = mockStore.map((c) => (c.id === payload.id ? updated : c))
  return updated
}

export async function deleteCardReason(id: number): Promise<void> {
  await delay(300)
  mockStore = mockStore.filter((c) => c.id !== id)
}