// import {apiClient} from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleTranslation {
  tk: string
  ru: string
  en: string
}

export interface Role {
  id: number
  code: string
  name: RoleTranslation
  guard_name: string
}

export interface RolePayload {
  code: string
  name: RoleTranslation
  guard_name: string
}

export interface RolesListParams {
  search?: string
  page?: number
  per_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ROLES: Role[] = [
  { id: 1, code: 'admin',     guard_name: 'web', name: { tk: 'Administrator', ru: 'Администратор', en: 'Administrator' } },
  { id: 2, code: 'operator',  guard_name: 'web', name: { tk: 'Operator',      ru: 'Оператор',      en: 'Operator' } },
  { id: 3, code: 'manager',   guard_name: 'web', name: { tk: 'Menijer',       ru: 'Менеджер',      en: 'Manager' } },
  { id: 4, code: 'editor',    guard_name: 'web', name: { tk: 'Redaktor',      ru: 'Редактор',      en: 'Editor' } },
]

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms))

// ─── API functions ────────────────────────────────────────────────────────────

export const rolesApi = {
  getAll: async (params?: RolesListParams): Promise<{ data: PaginatedResponse<Role> }> => {
    await delay()
    const { search = '', page = 1, per_page = 25 } = params ?? {}

    let filtered = [...MOCK_ROLES]
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.code.toLowerCase().includes(s) ||
          r.name.tk.toLowerCase().includes(s) ||
          r.name.ru.toLowerCase().includes(s) ||
          r.name.en.toLowerCase().includes(s)
      )
    }

    const total      = filtered.length
    const last_page  = Math.ceil(total / per_page)
    const start      = (page - 1) * per_page
    const data       = filtered.slice(start, start + per_page)

    return {
      data: {
        data,
        meta: {
          current_page: page,
          last_page,
          per_page,
          total,
        },
      },
    }
  },

  getById: async (id: number): Promise<{ data: Role }> => {
    await delay()
    const item = MOCK_ROLES.find((r) => r.id === id)
    if (!item) throw new Error('Not found')
    return { data: item }
  },

  create: async (payload: RolePayload): Promise<{ data: Role }> => {
    await delay()
    const newItem: Role = {
      ...payload,
      id: Math.floor(Math.random() * 10000),
    }
    MOCK_ROLES.push(newItem)
    return { data: newItem }
  },

  update: async (id: number, payload: RolePayload): Promise<{ data: Role }> => {
    await delay()
    const index = MOCK_ROLES.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('Not found')
    MOCK_ROLES[index] = { ...MOCK_ROLES[index], ...payload }
    return { data: MOCK_ROLES[index] }
  },

  delete: async (id: number): Promise<void> => {
    await delay()
    const index = MOCK_ROLES.findIndex((r) => r.id === id)
    if (index !== -1) MOCK_ROLES.splice(index, 1)
  },
}