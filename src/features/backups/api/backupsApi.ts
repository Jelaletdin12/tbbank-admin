import apiClient from '@/lib/api/client'

export type BackupStatus = 'completed' | 'failed' | 'in_progress'

export interface Backup {
  id: number
  fileName: string
  fileSize: string
  status: BackupStatus
  createdAt: string
  createdBy: string
}

export interface BackupListResponse {
  data: Backup[]
  total: number
  page: number
  per_page: number
}

export interface BackupListParams {
  page?: number
  per_page?: number
  search?: string
}

const MOCK_BACKUPS: Backup[] = [
  { id: 1, fileName: 'backup_2026_05_22_01.sql', fileSize: '256 MB', status: 'completed',   createdAt: '2026-05-22 03:00', createdBy: 'Admin' },
  { id: 2, fileName: 'backup_2026_05_21_01.sql', fileSize: '251 MB', status: 'completed',   createdAt: '2026-05-21 03:00', createdBy: 'Admin' },
  { id: 3, fileName: 'backup_2026_05_20_01.sql', fileSize: '248 MB', status: 'completed',   createdAt: '2026-05-20 03:00', createdBy: 'Admin' },
  { id: 4, fileName: 'backup_2026_05_19_01.sql', fileSize: '245 MB', status: 'failed',      createdAt: '2026-05-19 03:05', createdBy: 'Admin' },
  { id: 5, fileName: 'backup_2026_05_18_01.sql', fileSize: '242 MB', status: 'completed',   createdAt: '2026-05-18 03:00', createdBy: 'System' },
]

export const backupsApi = {
  getAll: async (params?: BackupListParams): Promise<BackupListResponse> => {
    const { data } = await apiClient.get('/backups', { params }).catch(() => ({ data: null }))
    if (data) return data

    const { search = '', page = 1, per_page = 25 } = params ?? {}
    let filtered = [...MOCK_BACKUPS]
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((b) => b.fileName.toLowerCase().includes(s))
    }
    const total = filtered.length
    const start = (page - 1) * per_page
    return { data: filtered.slice(start, start + per_page), total, page, per_page }
  },

  create: async (): Promise<Backup> => {
    const { data } = await apiClient.post('/backups').catch(() => ({ data: null }))
    if (data) return data

    const newBackup: Backup = {
      id: Math.floor(Math.random() * 10000),
      fileName: `backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_01.sql`,
      fileSize: '0 MB',
      status: 'in_progress',
      createdAt: new Date().toLocaleString('tr-TR'),
      createdBy: 'Admin',
    }
    MOCK_BACKUPS.unshift(newBackup)
    return newBackup
  },

  download: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get(`/backups/${id}/download`, { responseType: 'blob' }).catch(() => ({ data: null }))
    if (data) return data
    return new Blob(['mock backup content'], { type: 'application/sql' })
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/backups/${id}`).catch(() => {})
    const index = MOCK_BACKUPS.findIndex((b) => b.id === id)
    if (index !== -1) MOCK_BACKUPS.splice(index, 1)
  },
}
