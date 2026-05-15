// ─── Enums / Unions ───────────────────────────────────────────────────────────

export type CardOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type CardOrderSortField =
  | 'id'
  | 'createdAt'
  | 'status'
  | 'welayat'
  | 'sahamca'

// ─── Lookup entities ──────────────────────────────────────────────────────────

export interface CardIssuanceReason {
  id: number
  name: string
}

export interface CardType {
  id: number
  name: string
}

export interface Province {
  id: number
  name: string
}

export interface Branch {
  id: number
  name: string
  provinceId: number
}

// ─── Passport ────────────────────────────────────────────────────────────────

export interface PassportFiles {
  page1: string | null   // URL
  page23: string | null
  page89: string | null
  page32: string | null
}

// ─── Card Order ───────────────────────────────────────────────────────────────

export interface CardOrder {
  id: string
  createdAt: string              // ISO datetime string
  isPaid: boolean
  status: CardOrderStatus
  note: string | null
  createdBy: string              // user display name

  // Card
  issuanceReasonId: number
  issuanceReasonName: string
  cardTypeId: number
  cardTypeName: string

  // Location
  provinceId: number
  provinceName: string
  branchId: number
  branchName: string

  // Personal info
  firstName: string
  lastName: string
  middleName: string | null
  formerLastName: string | null
  birthDate: string              // yyyy-MM-dd
  phone: string
  phoneExtra: string | null
  citizenship: string
  registeredAddress: string
  currentAddress: string
  workplace: string

  // Passport
  passportSeriesId: number
  passportSeriesName: string
  passportNumber: string
  passportIssueDate: string      // yyyy-MM-dd
  passportIssuedBy: string
  passportBirthPlace: string

  passportFiles: PassportFiles
}

// ─── List item (lighter shape for table rows) ─────────────────────────────────

export interface CardOrderListItem {
  id: string
  createdAt: string
  issuanceReasonName: string
  cardTypeName: string
  provinceName: string
  branchName: string
  firstName: string
  lastName: string
  status: CardOrderStatus
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  page: number
  perPage: number
  totalPages: number
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CardOrderFilters {
  search?: string
  status?: CardOrderStatus | ''
  provinceId?: number | ''
  branchId?: number | ''
  page?: number
  perPage?: number
}

export interface CreateCardOrderPayload {
  isPaid: boolean
  status: CardOrderStatus
  note: string | null

  issuanceReasonId: number
  cardTypeId: number
  provinceId: number
  branchId: number

  firstName: string
  lastName: string
  middleName: string | null
  formerLastName: string | null
  birthDate: string
  phone: string
  phoneExtra: string | null
  citizenship: string
  registeredAddress: string
  currentAddress: string
  workplace: string

  passportSeriesId: number
  passportNumber: string
  passportIssueDate: string
  passportIssuedBy: string
  passportBirthPlace: string

  passportPage1: File
  passportPage23: File
  passportPage89: File
  passportPage32: File
}

export interface UpdateCardOrderPayload extends Partial<CreateCardOrderPayload> {}

import apiClient from '@/lib/api/client'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const USE_MOCK = true

const MOCK_REASONS: CardIssuanceReason[] = [
  { id: 1, name: 'Möhleti gutardy' },
  { id: 2, name: 'Täze kart açmak' },
  { id: 3, name: 'Kartyň ýitmegi' },
  { id: 4, name: 'Adyň üýtgemegi' },
]

const MOCK_TYPES: CardType[] = [
  { id: 1, name: 'Altyn Asyr' },
  { id: 2, name: 'Maşgala' },
  { id: 3, name: 'Goýum' },
  { id: 4, name: 'Milli' },
]

const MOCK_PROVINCES: Province[] = [
  { id: 1, name: 'Aşgabat ş.' },
  { id: 2, name: 'Ahal' },
  { id: 3, name: 'Balkan' },
  { id: 4, name: 'Daşoguz' },
  { id: 5, name: 'Lebap' },
  { id: 6, name: 'Mary' },
]

const MOCK_BRANCHES: Branch[] = [
  { id: 1, name: 'Aşgabat Baş şahamça', provinceId: 1 },
  { id: 2, name: 'Köpetdag şahamçasy', provinceId: 1 },
  { id: 3, name: 'Abadan şahamçasy', provinceId: 2 },
  { id: 4, name: 'Balkanabat şahamçasy', provinceId: 3 },
  { id: 5, name: 'Mary şahamçasy', provinceId: 6 },
]

const MOCK_ORDERS: CardOrder[] = [
  {
    id: 'CRD-10254',
    createdAt: '2026-05-01T10:00:00Z',
    isPaid: true,
    status: 'APPROVED',
    note: 'Hemme zat ýerinde',
    createdBy: 'Jumaýew Aman',
    issuanceReasonId: 2,
    issuanceReasonName: 'Täze kart açmak',
    cardTypeId: 1,
    cardTypeName: 'Altyn Asyr',
    provinceId: 1,
    provinceName: 'Aşgabat ş.',
    branchId: 1,
    branchName: 'Aşgabat Baş şahamça',
    firstName: 'Berdi',
    lastName: 'Myradow',
    middleName: 'Gurbanowiç',
    formerLastName: null,
    birthDate: '1995-04-12',
    phone: '+99365123456',
    phoneExtra: null,
    citizenship: 'Türkmenistan',
    registeredAddress: 'Aşgabat, Magtymguly şaýoly 12',
    currentAddress: 'Aşgabat, Magtymguly şaýoly 12',
    workplace: 'TDB, IT hünärmen',
    passportSeriesId: 1,
    passportSeriesName: 'I-AS',
    passportNumber: '123456',
    passportIssueDate: '2015-05-20',
    passportIssuedBy: 'Aşgabat ş. Polisiýa müdirligi',
    passportBirthPlace: 'Aşgabat',
    passportFiles: {
      page1: 'https://placehold.co/600x400?text=Passport+P1',
      page23: 'https://placehold.co/600x400?text=Passport+P23',
      page89: 'https://placehold.co/600x400?text=Passport+P89',
      page32: 'https://placehold.co/600x400?text=Passport+P32',
    },
  },
  {
    id: 'CRD-10255',
    createdAt: '2026-05-02T14:30:00Z',
    isPaid: false,
    status: 'PENDING',
    note: null,
    createdBy: 'Saparow Batyr',
    issuanceReasonId: 1,
    issuanceReasonName: 'Möhleti gutardy',
    cardTypeId: 2,
    cardTypeName: 'Maşgala',
    provinceId: 6,
    provinceName: 'Mary',
    branchId: 5,
    branchName: 'Mary şahamçasy',
    firstName: 'Gyzylgül',
    lastName: 'Annageldiýewa',
    middleName: 'Begliýewna',
    formerLastName: 'Saparowa',
    birthDate: '1998-08-25',
    phone: '+99361987654',
    phoneExtra: '+99312444234',
    citizenship: 'Türkmenistan',
    registeredAddress: 'Mary ş., Gurbansoltan eje köç. 45',
    currentAddress: 'Mary ş., Gurbansoltan eje köç. 45',
    workplace: 'Mekdep müdiri',
    passportSeriesId: 2,
    passportSeriesName: 'I-MR',
    passportNumber: '654321',
    passportIssueDate: '2018-10-10',
    passportIssuedBy: 'Mary w. Polisiýa müdirligi',
    passportBirthPlace: 'Mary',
    passportFiles: {
      page1: 'https://placehold.co/600x400?text=Passport+P1',
      page23: 'https://placehold.co/600x400?text=Passport+P23',
      page89: 'https://placehold.co/600x400?text=Passport+P89',
      page32: 'https://placehold.co/600x400?text=Passport+P32',
    },
  },
]

// ─── Card Orders CRUD ─────────────────────────────────────────────────────────

export async function fetchCardOrders(
  filters: CardOrderFilters,
): Promise<PaginatedResponse<CardOrderListItem>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    const list: CardOrderListItem[] = MOCK_ORDERS.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      issuanceReasonName: o.issuanceReasonName,
      cardTypeName: o.cardTypeName,
      provinceName: o.provinceName,
      branchName: o.branchName,
      firstName: o.firstName,
      lastName: o.lastName,
      status: o.status,
    }))
    return {
      data: list,
      totalCount: list.length,
      page: filters.page ?? 1,
      perPage: filters.perPage ?? 25,
      totalPages: 1,
    }
  }

  const params = new URLSearchParams()

  if (filters.search)     params.set('search',     filters.search)
  if (filters.status)     params.set('status',     filters.status)
  if (filters.provinceId) params.set('provinceId', String(filters.provinceId))
  if (filters.branchId)   params.set('branchId',   String(filters.branchId))

  params.set('page',    String(filters.page    ?? 1))
  params.set('perPage', String(filters.perPage ?? 25))

  const { data } = await apiClient.get<PaginatedResponse<CardOrderListItem>>(
    `/card-orders?${params.toString()}`,
  )
  return data
}

export async function fetchCardOrderById(id: string): Promise<CardOrder> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    const order = MOCK_ORDERS.find((o) => o.id === id) || MOCK_ORDERS[0]
    return { ...order, id }
  }
  const { data } = await apiClient.get<CardOrder>(`/card-orders/${id}`)
  return data
}

export async function createCardOrder(
  payload: CreateCardOrderPayload,
): Promise<CardOrder> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000))
    return { ...MOCK_ORDERS[0], id: `CRD-${Math.floor(Math.random() * 10000)}` }
  }
  const formData = buildFormData(payload)
  const { data } = await apiClient.post<CardOrder>('/card-orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updateCardOrder(
  id: string,
  payload: UpdateCardOrderPayload,
): Promise<CardOrder> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000))
    return { ...MOCK_ORDERS[0], id }
  }
  const formData = buildFormData(payload)
  const { data } = await apiClient.put<CardOrder>(`/card-orders/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteCardOrder(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    return
  }
  await apiClient.delete(`/card-orders/${id}`)
}

// ─── Lookup lists ─────────────────────────────────────────────────────────────

export async function fetchCardIssuanceReasons(): Promise<CardIssuanceReason[]> {
  if (USE_MOCK) return MOCK_REASONS
  const { data } = await apiClient.get<CardIssuanceReason[]>('/settings/card/reasons')
  return data
}

export async function fetchCardTypes(): Promise<CardType[]> {
  if (USE_MOCK) return MOCK_TYPES
  const { data } = await apiClient.get<CardType[]>('/settings/card/types')
  return data
}

export async function fetchProvinces(): Promise<Province[]> {
  if (USE_MOCK) return MOCK_PROVINCES
  const { data } = await apiClient.get<Province[]>('/settings/location/districts')
  return data
}

export async function fetchBranches(provinceId?: number): Promise<Branch[]> {
  if (USE_MOCK) {
    if (!provinceId) return MOCK_BRANCHES
    return MOCK_BRANCHES.filter((b) => b.provinceId === provinceId)
  }
  const params = provinceId ? `?provinceId=${provinceId}` : ''
  const { data } = await apiClient.get<Branch[]>(`/settings/location/branches${params}`)
  return data
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildFormData(
  payload: CreateCardOrderPayload | UpdateCardOrderPayload,
): FormData {
  const fd = new FormData()

  const fileKeys = new Set([
    'passportPage1',
    'passportPage23',
    'passportPage89',
    'passportPage32',
  ])

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue

    if (fileKeys.has(key) && value instanceof File) {
      fd.append(key, value)
    } else if (value === null) {
      fd.append(key, '')
    } else {
      fd.append(key, String(value))
    }
  }

  return fd
}