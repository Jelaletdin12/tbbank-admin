export interface Branch {
  id: number
  name: Record<'tk' | 'ru' | 'en', string>
  code: string
  districtId: number
  districtName: Record<'tk' | 'ru' | 'en', string>
  address: Record<'tk' | 'ru' | 'en', string>
  phone: string
  email: string
  workingHours: string
  description: string | null
  isActive: boolean
}

export interface BranchListResponse {
  data: Branch[]
  total: number
  page: number
  perPage: number
}

export interface CreateBranchPayload {
  name: Record<'tk' | 'ru' | 'en', string>
  code: string
  districtId: number
  address: Record<'tk' | 'ru' | 'en', string>
  phone: string
  email: string
  workingHours: string
  description: string | null
  isActive: boolean
}

export interface UpdateBranchPayload extends CreateBranchPayload {
  id: number
}

const DISTRICTS = [
  { id: 1, name: { tk: 'Aşgabat', ru: 'Ашхабад', en: 'Ashgabat' } },
  { id: 2, name: { tk: 'Änew', ru: 'Анев', en: 'Anew' } },
  { id: 3, name: { tk: 'Baýramaly', ru: 'Байрамалы', en: 'Bayramaly' } },
  { id: 4, name: { tk: 'Daşoguz', ru: 'Дашогуз', en: 'Dashoguz' } },
  { id: 5, name: { tk: 'Mary', ru: 'Мары', en: 'Mary' } },
  { id: 6, name: { tk: 'Türkmenabat', ru: 'Туркменабат', en: 'Turkmenabat' } },
  { id: 7, name: { tk: 'Balkanabat', ru: 'Балканабат', en: 'Balkanabat' } },
]

export function getDistrictOptions() {
  return DISTRICTS
}

function findDistrict(id: number) {
  return DISTRICTS.find((d) => d.id === id) ?? DISTRICTS[0]
}

const MOCK_BRANCHES: Branch[] = [
  {
    id: 1,
    name: { tk: 'Merkezi şahamça', ru: 'Главное отделение', en: 'Main branch' },
    code: 'BR-001',
    districtId: 1,
    districtName: { tk: 'Aşgabat', ru: 'Ашхабад', en: 'Ashgabat' },
    address: { tk: 'Bitarap Türkmenistan şaýoly, 100', ru: 'Проспект Битарap Туркменистан, 100', en: 'Bitarap Turkmenistan avenue, 100' },
    phone: '+993 12 45-67-89',
    email: 'main@tbbank.gov.tm',
    workingHours: '09:00 - 18:00',
    description: null,
    isActive: true,
  },
  {
    id: 2,
    name: { tk: 'Mary şahamçasy', ru: 'Марыйское отделение', en: 'Mary branch' },
    code: 'BR-002',
    districtId: 5,
    districtName: { tk: 'Mary', ru: 'Мары', en: 'Mary' },
    address: { tk: 'Gurbansoltan eje köçesi, 25', ru: 'Улица Гурбансолтан эдже, 25', en: 'Gurbansoltan eje street, 25' },
    phone: '+993 55 12-34-56',
    email: 'mary@tbbank.gov.tm',
    workingHours: '09:00 - 17:00',
    description: null,
    isActive: true,
  },
  {
    id: 3,
    name: { tk: 'Daşoguz şahamçasy', ru: 'Дашогузское отделение', en: 'Dashoguz branch' },
    code: 'BR-003',
    districtId: 4,
    districtName: { tk: 'Daşoguz', ru: 'Дашогуз', en: 'Dashoguz' },
    address: { tk: 'Garaşsyzlyk köçesi, 10', ru: 'Улица Гарашсызлык, 10', en: 'Garashsyzlyk street, 10' },
    phone: '+993 32 98-76-54',
    email: 'dashoguz@tbbank.gov.tm',
    workingHours: '08:30 - 17:30',
    description: 'Şenbe güni 09:00 - 13:00',
    isActive: false,
  },
]

let mockStore = [...MOCK_BRANCHES]
let nextId = 4

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function fetchBranches(params: {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
  districtId?: string
}): Promise<BranchListResponse> {
  await delay()
  const { page = 1, perPage = 25, search = '', isActive, districtId } = params

  let filtered = mockStore.filter((item) => {
    const matchSearch =
      !search ||
      Object.values(item.name).some((n) =>
        n.toLowerCase().includes(search.toLowerCase())
      ) ||
      item.code.toLowerCase().includes(search.toLowerCase())
    const matchActive =
      isActive === '' || isActive === undefined
        ? true
        : isActive === 'true'
          ? item.isActive
          : !item.isActive
    const matchDistrict =
      !districtId || String(item.districtId) === districtId
    return matchSearch && matchActive && matchDistrict
  })

  filtered = [...filtered].sort((a, b) => b.id - a.id)

  const total = filtered.length
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return { data, total, page, perPage }
}

export async function fetchBranchById(id: number): Promise<Branch> {
  await delay()
  const item = mockStore.find((c) => c.id === id)
  if (!item) throw new Error('Not found')
  return { ...item }
}

export async function createBranch(payload: CreateBranchPayload): Promise<Branch> {
  await delay(400)
  const district = findDistrict(payload.districtId)
  const newItem: Branch = {
    id: nextId++,
    ...payload,
    districtName: district.name,
  }
  mockStore = [newItem, ...mockStore]
  return newItem
}

export async function updateBranch(payload: UpdateBranchPayload): Promise<Branch> {
  await delay(400)
  const idx = mockStore.findIndex((c) => c.id === payload.id)
  if (idx === -1) throw new Error('Not found')
  const district = findDistrict(payload.districtId)
  const updated = { ...mockStore[idx], ...payload, districtName: district.name }
  mockStore = mockStore.map((c) => (c.id === payload.id ? updated : c))
  return updated
}

export async function deleteBranch(id: number): Promise<void> {
  await delay(300)
  mockStore = mockStore.filter((c) => c.id !== id)
}
