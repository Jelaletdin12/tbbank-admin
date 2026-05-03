import type { AuthUser } from '@/app/store/authStore'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

// Mock credentials
const MOCK_USERS: Array<{ email: string; password: string; user: AuthUser; token: string }> = [
  {
    email: 'jelaletdin',
    password: '123',
    token: 'mock-jwt-token-admin-xyz123',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@tbbank.tm',
      role: 'admin',
    },
  },
  {
    email: 'manager@tbbank.tm',
    password: 'Manager123!',
    token: 'mock-jwt-token-manager-abc456',
    user: {
      id: '2',
      name: 'Branch Manager',
      email: 'manager@tbbank.tm',
      role: 'manager',
    },
  },
]

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  // Simulate network latency
  await delay(900)

  const match = MOCK_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password,
  )

  if (!match) {
    throw new Error('INVALID_CREDENTIALS')
  }

  return {
    token: match.token,
    user: match.user,
  }
}

export async function logoutApi(): Promise<void> {
  await delay(300)
}
