import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { backupsApi, type BackupListParams } from '../api/backupsApi'

const QUERY_KEY = 'backups'

export function useBackups(params?: BackupListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => backupsApi.getAll(params),
  })
}

export function useCreateBackup() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => backupsApi.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('backups.toast.created', 'Backup üstünlikli döredildi!'))
    },
  })
}

export function useDownloadBackup() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (id: number) => {
      const blob = await backupsApi.download(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${id}.sql`
      a.click()
      URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      toast.success(t('backups.toast.downloaded', 'Backup üstünlikli ýüklenildi'))
    },
  })
}

export function useDeleteBackup() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => backupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('backups.toast.deleted', 'Backup üstünlikli pozuldy!'))
    },
  })
}
