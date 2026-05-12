// import {apiClient} from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PermissionTranslation {
  tk: string
  ru: string
  en: string
}

export interface AuditLog {
  id: number
  action: string
  by: string
  target: string
  status: string
  date: string
}

export interface Permission {
  id: number
  code: string
  name: PermissionTranslation
  guard_name: string
  audit_logs?: AuditLog[]
}

export interface PermissionPayload {
  code: string
  name: PermissionTranslation
  guard_name: string
}

export interface PermissionsListParams {
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

const MOCK_PERMISSIONS: Permission[] = [
  { id: 1, code: 'users.view',        guard_name: 'web', name: { tk: 'Ulanyjylary görmek',        ru: 'Просмотр пользователей',    en: 'View users' } },
  { id: 2, code: 'users.create',      guard_name: 'web', name: { tk: 'Ulanyjy döretmek',        ru: 'Создание пользователя',     en: 'Create user' } },
  { id: 3, code: 'users.edit',        guard_name: 'web', name: { tk: 'Ulanyjyny üýtgetmek',     ru: 'Редактирование пользователя', en: 'Edit user' } },
  { id: 4, code: 'users.delete',      guard_name: 'web', name: { tk: 'Ulanyjyny pozmak',       ru: 'Удаление пользователя',     en: 'Delete user' } },
  { id: 5, code: 'roles.view',        guard_name: 'web', name: { tk: 'Rollary görmek',           ru: 'Просмотр ролей',           en: 'View roles' } },
  { id: 6, code: 'roles.create',      guard_name: 'web', name: { tk: 'Rol döretmek',           ru: 'Создание роли',            en: 'Create role' } },
  { id: 7, code: 'roles.edit',        guard_name: 'web', name: { tk: 'Roly üýtgetmek',          ru: 'Редактирование роли',      en: 'Edit role' } },
  { id: 8, code: 'roles.delete',      guard_name: 'web', name: { tk: 'Roly pozmak',            ru: 'Удаление роли',            en: 'Delete role' } },
  { id: 9, code: 'permissions.view',  guard_name: 'web', name: { tk: 'Rugsatlary görmek',       ru: 'Просмотр разрешений',      en: 'View permissions' } },
  { id: 10, code: 'permissions.edit', guard_name: 'web', name: { tk: 'Rugsady üýtgetmek',      ru: 'Редактирование разрешения', en: 'Edit permission' } },
]

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms))

// ─── API functions ────────────────────────────────────────────────────────────

export const permissionsApi = {
  getAll: async (params?: PermissionsListParams): Promise<{ data: PaginatedResponse<Permission> }> => {
    await delay()
    const { search = '', page = 1, per_page = 25 } = params ?? {}

    let filtered = [...MOCK_PERMISSIONS]
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.code.toLowerCase().includes(s) ||
          p.name.tk.toLowerCase().includes(s) ||
          p.name.ru.toLowerCase().includes(s) ||
          p.name.en.toLowerCase().includes(s)
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

  getById: async (id: number): Promise<{ data: Permission }> => {
    await delay()
    const item = MOCK_PERMISSIONS.find((p) => p.id === id)
    if (!item) throw new Error('Not found')
    return { data: item }
  },

  create: async (payload: PermissionPayload): Promise<{ data: Permission }> => {
    await delay()
    const newItem: Permission = {
      ...payload,
      id: Math.floor(Math.random() * 10000),
    }
    MOCK_PERMISSIONS.push(newItem)
    return { data: newItem }
  },

  update: async (id: number, payload: PermissionPayload): Promise<{ data: Permission }> => {
    await delay()
    const index = MOCK_PERMISSIONS.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Not found')
    MOCK_PERMISSIONS[index] = { ...MOCK_PERMISSIONS[index], ...payload }
    return { data: MOCK_PERMISSIONS[index] }
  },

  delete: async (id: number): Promise<void> => {
    await delay()
    const index = MOCK_PERMISSIONS.findIndex((p) => p.id === id)
    if (index !== -1) MOCK_PERMISSIONS.splice(index, 1)
  },
}