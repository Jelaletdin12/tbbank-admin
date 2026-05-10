// ─── Types ────────────────────────────────────────────────────────────────────

export interface Operator {
  id: number
  username: string
  name: string
  phone: string | null
  email: string | null
  isActive: boolean
}

export interface OperatorDetail extends Operator {
  roles: OperatorRole[]
  permissions: OperatorPermission[]
  branches: OperatorBranch[]
  loanLimits: OperatorLoanLimit[]
  cardLimits: OperatorCardLimit[]
  auditLogs: OperatorAuditLog[]
}

export interface OperatorRole {
  id: number
  code: string
  name: string
  guardName: string
}

export interface OperatorPermission {
  id: number
  name: string
  guardName: string
}

export interface OperatorBranch {
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

export interface OperatorLoanLimit {
  id: number
  name: string
  amount: number
}

export interface OperatorCardLimit {
  id: number
  name: string
  amount: number
}

export interface OperatorAuditLog {
  id: number
  actionName: string
  performedBy: string
  target: string
  status: string
  createdAt: string
}

export interface OperatorsListResponse {
  data: Operator[]
  meta: {
    currentPage: number
    totalPages: number
    totalCount: number
    perPage: number
  }
}

export interface CreateOperatorPayload {
  username: string
  name: string
  phone?: string
  email?: string
  password: string
  isActive: boolean
}

export interface UpdateOperatorPayload {
  username?: string
  name?: string
  phone?: string
  email?: string
  password?: string
  isActive?: boolean
}

export interface OperatorsListParams {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}

// ─── Mock Data & API ────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let mockOperators: OperatorDetail[] = [
  {
    id: 1,
    username: 'johndoe',
    name: 'John Doe',
    phone: '+99365123456',
    email: 'johndoe@example.com',
    isActive: true,
    roles: [{ id: 1, code: 'ADMIN', name: 'Administrator', guardName: 'web' }],
    permissions: [{ id: 1, name: 'create_user', guardName: 'web' }],
    branches: [
      {
        id: 1,
        name: 'Main Branch',
        region: 'Aşgabat',
        district: 'Kopetdag',
        uniqueCode: '01',
        isActive: true,
        billingUsernameIbr: 'ibr_1',
        billingUsernameSber: 'sber_1',
        billingUsernameVisa: 'visa_1',
      },
    ],
    loanLimits: [{ id: 1, name: 'Consumer Loan', amount: 50000 }],
    cardLimits: [{ id: 1, name: 'Credit Card', amount: 10000 }],
    auditLogs: [
      {
        id: 1,
        actionName: 'Login',
        performedBy: 'System',
        target: 'johndoe',
        status: 'Success',
        createdAt: '2023-10-27T10:00:00Z',
      },
    ],
  },
  {
    id: 2,
    username: 'janedoe',
    name: 'Jane Doe',
    phone: '+99365654321',
    email: 'janedoe@example.com',
    isActive: false,
    roles: [{ id: 2, code: 'OPERATOR', name: 'Operator', guardName: 'web' }],
    permissions: [],
    branches: [],
    loanLimits: [],
    cardLimits: [],
    auditLogs: [],
  },
]

export const operatorsApi = {
  getAll: async (params: OperatorsListParams): Promise<OperatorsListResponse> => {
    await delay(500)
    let filtered = [...mockOperators]
    if (params.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.username.toLowerCase().includes(q)
      )
    }
    return {
      data: filtered,
      meta: {
        currentPage: params.page || 1,
        totalPages: 1,
        totalCount: filtered.length,
        perPage: params.perPage || 10,
      },
    }
  },

  getById: async (id: number): Promise<OperatorDetail> => {
    await delay(500)
    const op = mockOperators.find((o) => o.id === Number(id))
    if (!op) throw new Error('Not found')
    return op
  },

  create: async (payload: CreateOperatorPayload): Promise<Operator> => {
    await delay(500)
    const newOp: OperatorDetail = {
      id: mockOperators.length > 0 ? Math.max(...mockOperators.map((o) => o.id)) + 1 : 1,
      ...payload,
      phone: payload.phone || null,
      email: payload.email || null,
      roles: [],
      permissions: [],
      branches: [],
      loanLimits: [],
      cardLimits: [],
      auditLogs: [],
    }
    mockOperators.push(newOp)
    return newOp
  },

  update: async (id: number, payload: UpdateOperatorPayload): Promise<Operator> => {
    await delay(500)
    const index = mockOperators.findIndex((o) => o.id === Number(id))
    if (index === -1) throw new Error('Not found')
    mockOperators[index] = { ...mockOperators[index], ...payload }
    return mockOperators[index]
  },

  delete: async (id: number): Promise<void> => {
    await delay(500)
    mockOperators = mockOperators.filter((o) => o.id !== Number(id))
  },

  assignRole: async (_operatorId: number, _roleId: number): Promise<void> => {
    await delay(500)
  },

  removeRole: async (_operatorId: number, _roleId: number): Promise<void> => {
    await delay(500)
  },

  assignPermission: async (_operatorId: number, _permissionId: number): Promise<void> => {
    await delay(500)
  },

  removePermission: async (_operatorId: number, _permissionId: number): Promise<void> => {
    await delay(500)
  },
}