// ─── Types ────────────────────────────────────────────────────────────────────

export interface Client {
  id: number
  username: string
  name: string
  phone: string | null
  email: string | null
  isActive: boolean
}

export interface ClientDetail extends Client {
  roles: ClientRole[]
  permissions: ClientPermission[]
  branches: ClientBranch[]
  loanOrders: ClientLoanOrder[]
  cardOrders: ClientCardOrder[]
  auditLogs: ClientAuditLog[]
}

export interface ClientRole {
  id: number
  code: string
  name: string
  guardName: string
}

export interface ClientPermission {
  id: number
  name: string
  guardName: string
}

export interface ClientBranch {
  id: number
  name: string
  region: string
  district: string
  uniqueCode: string
  isActive: boolean
  billingUsernameIbr: string
  billingUsernameSber: string
  billingUsernameVisa: string
}

export interface ClientLoanOrder {
  id: number
  name: string
  amount: number
  status: string
  createdAt: string
}

export interface ClientCardOrder {
  id: number
  name: string
  amount: number
  status: string
  createdAt: string
}

export interface ClientAuditLog {
  id: number
  actionName: string
  performedBy: string
  target: string
  status: string
  createdAt: string
}

export interface ClientsListResponse {
  data: Client[]
  meta: {
    currentPage: number
    totalPages: number
    totalCount: number
    perPage: number
  }
}

export interface CreateClientPayload {
  username: string
  name: string
  phone: string
  email?: string
  password: string
  isActive: boolean
}

export interface UpdateClientPayload {
  username?: string
  name?: string
  phone?: string
  email?: string
  password?: string
  isActive?: boolean
}

export interface ClientsListParams {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}

// ─── Mock Data & API ────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let mockClients: ClientDetail[] = [
  {
    id: 1,
    username: 'client_01',
    name: 'Merdan Merdanow',
    phone: '+99361234567',
    email: 'merdan@example.com',
    isActive: true,
    roles: [{ id: 1, code: 'CLIENT_STANDARD', name: 'Standard Client', guardName: 'web' }],
    permissions: [],
    branches: [
      {
        id: 1,
        name: 'Aşgabat Baş Şahamça',
        region: 'Aşgabat',
        district: 'Kopetdag',
        uniqueCode: '01',
        isActive: true,
        billingUsernameIbr: 'ibr_c1',
        billingUsernameSber: 'sber_c1',
        billingUsernameVisa: 'visa_c1',
      },
    ],
    loanOrders: [
      { id: 101, name: 'Sarp ediş karzy', amount: 20000, status: 'Active', createdAt: '2023-11-01T10:00:00Z' }
    ],
    cardOrders: [
      { id: 201, name: 'Visa Gold', amount: 500, status: 'Pending', createdAt: '2023-11-05T14:30:00Z' }
    ],
    auditLogs: [
      {
        id: 1,
        actionName: 'Profile Update',
        performedBy: 'System',
        target: 'client_01',
        status: 'Success',
        createdAt: '2023-10-27T10:00:00Z',
      },
    ],
  },
  {
    id: 2,
    username: 'client_02',
    name: 'Aýnabat Aýmyradowa',
    phone: '+99365765432',
    email: 'aynabat@example.com',
    isActive: false,
    roles: [{ id: 2, code: 'CLIENT_PREMIUM', name: 'Premium Client', guardName: 'web' }],
    permissions: [],
    branches: [],
    loanOrders: [],
    cardOrders: [],
    auditLogs: [],
  },
]

export const clientsApi = {
  getAll: async (params: ClientsListParams): Promise<ClientsListResponse> => {
    await delay(500)
    let filtered = [...mockClients]
    if (params.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      )
    }
    if (params.isActive !== undefined && params.isActive !== '') {
      const isActive = params.isActive === 'true'
      filtered = filtered.filter((c) => c.isActive === isActive)
    }
    
    return {
      data: filtered,
      meta: {
        currentPage: params.page || 1,
        totalPages: Math.ceil(filtered.length / (params.perPage || 25)) || 1,
        totalCount: filtered.length,
        perPage: params.perPage || 25,
      },
    }
  },

  getById: async (id: number): Promise<ClientDetail> => {
    await delay(500)
    const client = mockClients.find((c) => c.id === Number(id))
    if (!client) throw new Error('Not found')
    return client
  },

  create: async (payload: CreateClientPayload): Promise<Client> => {
    await delay(500)
    const newClient: ClientDetail = {
      id: mockClients.length > 0 ? Math.max(...mockClients.map((c) => c.id)) + 1 : 1,
      username: payload.username,
      name: payload.name,
      phone: payload.phone,
      email: payload.email || null,
      isActive: payload.isActive,
      roles: [],
      permissions: [],
      branches: [],
      loanOrders: [],
      cardOrders: [],
      auditLogs: [],
    }
    mockClients.unshift(newClient)
    return newClient
  },

  update: async (id: number, payload: UpdateClientPayload): Promise<Client> => {
    await delay(500)
    const index = mockClients.findIndex((c) => c.id === Number(id))
    if (index === -1) throw new Error('Not found')
    
    mockClients[index] = { 
      ...mockClients[index], 
      ...payload,
      username: payload.username ?? mockClients[index].username,
      name: payload.name ?? mockClients[index].name,
      phone: payload.phone ?? mockClients[index].phone,
      email: payload.email !== undefined ? payload.email : mockClients[index].email,
      isActive: payload.isActive ?? mockClients[index].isActive,
    }
    return mockClients[index]
  },

  delete: async (id: number): Promise<void> => {
    await delay(500)
    mockClients = mockClients.filter((c) => c.id !== Number(id))
  },

  assignRole: async (_clientId: number, _roleId: number): Promise<void> => {
    await delay(500)
  },

  removeRole: async (_clientId: number, _roleId: number): Promise<void> => {
    await delay(500)
  },

  assignPermission: async (_clientId: number, _permissionId: number): Promise<void> => {
    await delay(500)
  },

  removePermission: async (_clientId: number, _permissionId: number): Promise<void> => {
    await delay(500)
  },

  assignBranch: async (_clientId: number, _branchId: number): Promise<void> => {
    await delay(500)
  },

  removeBranch: async (_clientId: number, _branchId: number): Promise<void> => {
    await delay(500)
  },
}