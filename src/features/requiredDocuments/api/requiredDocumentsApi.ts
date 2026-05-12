// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoanDocumentTranslation {
  tk: string
  ru: string
  en: string
}

export interface LoanDocument {
  id: number
  name: LoanDocumentTranslation
  description: LoanDocumentTranslation
  createdAt: string
  updatedAt: string
}

export interface LoanDocumentPayload {
  name: LoanDocumentTranslation
  description: LoanDocumentTranslation
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ListParams {
  page?: number
  perPage?: number
  search?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LOAN_DOCUMENTS: LoanDocument[] = [
  {
    id: 1,
    name: {
      tk: 'Hormatly müşderi! Siziň ýüztutmaňyz kanagatlandyryldy!',
      ru: 'Уважаемый клиент! Ваше обращение удовлетворено!',
      en: 'Dear customer! Your request has been approved!',
    },
    description: {
      tk: 'Siziň karz sargydyňyz üstünlikli kabul edildi we tassyklandy.',
      ru: 'Ваша заявка на кредит успешно принята и подтверждена.',
      en: 'Your loan application has been successfully received and confirmed.',
    },
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: {
      tk: 'Hormatly müşderi! Siziň ýüztutmaňyz kanagatlandyrylmady!',
      ru: 'Уважаемый клиент! Ваше обращение не удовлетворено!',
      en: 'Dear customer! Your request has been rejected!',
    },
    description: {
      tk: 'Siziň bank kart maglumatlaryňyz tapylmandygy sebäpli Siziň ýüztutmaňyz kanagatlandyrylmady! Bank kartyňyz boýunça hyzmat ediji bankyňyza ýüz tutmagyňyzy Sizden haýyş edýäris.',
      ru: 'Ваше обращение не удовлетворено в связи с тем, что данные вашей банковской карты не найдены! Просим вас обратиться в банк, обслуживающий вашу банковскую карту.',
      en: 'Your request has been rejected because your bank card information was not found! We kindly ask you to contact the bank that services your card.',
    },
    createdAt: '2026-02-20T14:15:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 3,
    name: {
      tk: 'Karz resminama talap edilýär',
      ru: 'Требуется документ для кредита',
      en: 'Loan document required',
    },
    description: {
      tk: 'Karz almak üçin zerur resminamalary tabşyrmagyňyzy haýyş edýäris.',
      ru: 'Просим вас предоставить необходимые документы для получения кредита.',
      en: 'Please submit the required documents to obtain the loan.',
    },
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-05T08:00:00Z',
  },
]

let mockStore = [...MOCK_LOAN_DOCUMENTS]
let nextId = mockStore.length + 1

// ─── Simulated delay ──────────────────────────────────────────────────────────

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchLoanDocuments(
  params: ListParams = {}
): Promise<PaginatedResponse<LoanDocument>> {
  await delay()
  const { page = 1, perPage = 10, search = '' } = params

  let filtered = mockStore
  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = mockStore.filter(
      (d) =>
        d.name.tk.toLowerCase().includes(q) ||
        d.name.ru.toLowerCase().includes(q) ||
        d.name.en.toLowerCase().includes(q)
    )
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return { data, total, page, perPage, totalPages }
}

export async function fetchLoanDocumentById(id: number): Promise<LoanDocument> {
  await delay()
  const doc = mockStore.find((d) => d.id === id)
  if (!doc) throw new Error(`LoanDocument with id ${id} not found`)
  return { ...doc }
}

export async function createLoanDocument(
  payload: LoanDocumentPayload
): Promise<LoanDocument> {
  await delay(600)
  const now = new Date().toISOString()
  const newDoc: LoanDocument = {
    id: nextId++,
    ...payload,
    createdAt: now,
    updatedAt: now,
  }
  mockStore = [newDoc, ...mockStore]
  return { ...newDoc }
}

export async function updateLoanDocument(
  id: number,
  payload: LoanDocumentPayload
): Promise<LoanDocument> {
  await delay(600)
  const index = mockStore.findIndex((d) => d.id === id)
  if (index === -1) throw new Error(`LoanDocument with id ${id} not found`)
  const updated: LoanDocument = {
    ...mockStore[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  }
  mockStore = mockStore.map((d) => (d.id === id ? updated : d))
  return { ...updated }
}

export async function deleteLoanDocument(id: number): Promise<void> {
  await delay(400)
  const exists = mockStore.some((d) => d.id === id)
  if (!exists) throw new Error(`LoanDocument with id ${id} not found`)
  mockStore = mockStore.filter((d) => d.id !== id)
}