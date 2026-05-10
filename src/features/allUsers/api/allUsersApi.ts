// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  username: string
  name: string
  phone: string
  email: string | null
  isActive: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UserListItem {
  id: number
  username: string
  name: string
  phone: string
  email: string | null
  isActive: boolean
}

export interface UsersListResponse {
  data: UserListItem[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface UsersListParams {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}

export interface CreateUserPayload {
  username: string
  name: string
  phone: string
  email?: string
  password: string
  phoneVerified: boolean
  isActive: boolean
}

export interface UpdateUserPayload {
  username?: string
  name?: string
  phone?: string
  email?: string
  phoneVerified?: boolean
  isActive?: boolean
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USERS: User[] = Array.from({ length: 50 }, (_, i) => {
  const id = 5970 - i
  const names = [
    'Orazowa Nurtuwak Täşliyewna',
    'Hallyýewa Aýna Gurbanmyradowna',
    'Sopýýewa Maral Agamyradowna',
    'Babamurat Baýnazarow Şanazarowič',
    'Narmet Narmet',
    'Sheker Durdyyewa',
    'kamalowyusup',
    'Mahmudowberdimet',
    'allanazarowasayyara',
    'dadayewjepbar',
  ]
  const usernames = [
    'Nurtuwak_1970', 'Ayna_1989', 'Maral_1974', 'Babamurat_0002', 'Narmet',
    '8319_ShekerDurdyyewa', 'kamalowyusup', 'Mahmudowberdimet',
    'allanazarowasayyara', 'dadayewjepbar',
  ]
  const idx = i % names.length
  return {
    id,
    username: i < usernames.length ? usernames[idx] : `user_${id}`,
    name: names[idx],
    phone: `+(993)-6${Math.floor(Math.random() * 9 + 1)}-${String(Math.floor(Math.random() * 90 + 10))}-${String(Math.floor(Math.random() * 90 + 10))}-${String(Math.floor(Math.random() * 90 + 10))}`,
    email: i % 4 === 0 ? `user${id}@tbbank.gov.tm` : null,
    isActive: Math.random() > 0.1,
    phoneVerified: Math.random() > 0.3,
    createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 1e9).toISOString(),
  }
})

// ─── Mock delay helper ────────────────────────────────────────────────────────

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export const usersApi = {
  /**
   * GET /users
   */
  getUsers: async (params: UsersListParams = {}): Promise<UsersListResponse> => {
    await delay()
    // Uncomment for real API:
    // const res = await apiClient.get<UsersListResponse>('/users', { params })
    // return res.data

    const { page = 1, perPage = 25, search = '', isActive } = params

    let filtered = [...MOCK_USERS]

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.phone.includes(q),
      )
    }

    if (isActive !== undefined && isActive !== '') {
      const active = isActive === 'true'
      filtered = filtered.filter((u) => u.isActive === active)
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    const data = filtered.slice(start, start + perPage).map(({ id, username, name, phone, email, isActive }) => ({
      id, username, name, phone, email, isActive,
    }))

    return { data, total, page, perPage, totalPages }
  },

  /**
   * GET /users/:id
   */
  getUserById: async (id: number): Promise<User> => {
    await delay()
    // const res = await apiClient.get<User>(`/users/${id}`)
    // return res.data

    const user = MOCK_USERS.find((u) => u.id === id)
    if (!user) throw new Error(`User ${id} not found`)
    return user
  },

  /**
   * POST /users
   */
  createUser: async (payload: CreateUserPayload): Promise<User> => {
    await delay(800)
    // const res = await apiClient.post<User>('/users', payload)
    // return res.data

    const newUser: User = {
      id: Math.max(...MOCK_USERS.map((u) => u.id)) + 1,
      username: payload.username,
      name: payload.name,
      phone: payload.phone,
      email: payload.email ?? null,
      isActive: payload.isActive,
      phoneVerified: payload.phoneVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    MOCK_USERS.unshift(newUser)
    return newUser
  },

  /**
   * PUT /users/:id
   */
  updateUser: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    await delay(800)
    // const res = await apiClient.put<User>(`/users/${id}`, payload)
    // return res.data

    const idx = MOCK_USERS.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`User ${id} not found`)
    MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...payload, updatedAt: new Date().toISOString() }
    return MOCK_USERS[idx]
  },

  /**
   * DELETE /users/:id
   */
  deleteUser: async (id: number): Promise<void> => {
    await delay(600)
    // await apiClient.delete(`/users/${id}`)

    const idx = MOCK_USERS.findIndex((u) => u.id === id)
    if (idx !== -1) MOCK_USERS.splice(idx, 1)
  },
}