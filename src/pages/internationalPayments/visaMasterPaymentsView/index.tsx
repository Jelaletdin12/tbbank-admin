import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useIntlPayment, useDeleteIntlPayment } from '@/features/visaMasterPayments/hooks/useVisaMasterPayments'
import type { IntlPaymentStatus } from '@/features/visaMasterPayments/api/visaMasterPaymentsApi'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Download, Search } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useState } from 'react'

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<IntlPaymentStatus, { label: string; className: string }> = {
  pending:  { label: 'Garaşylýar', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  approved: { label: 'Tassyklandy', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
  rejected: { label: 'Ret edildi',  className: 'bg-red-500/20 text-red-500 border-red-500/30' },
}

function StatusBadge({ status }: { status: IntlPaymentStatus }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', cfg.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[240px_1fr] items-start py-3 border-b border-border last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground">{children ?? '—'}</span>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-lg">
      <h2 className="text-base font-semibold text-foreground px-6 pt-5 pb-3">{title}</h2>
      <div className="px-6 pb-4">{children}</div>
    </section>
  )
}

// ─── DocFile row ─────────────────────────────────────────────────────────────

function DocFileRow({ label, url }: { label: string; url: string | null }) {
  if (!url) return (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground flex-1 leading-snug">{label}</span>
      <span className="text-sm text-muted-foreground/50">—</span>
    </div>
  )

  const filename = url.split('/').pop() ?? 'faýl'
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url)

  return (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground flex-1 leading-snug">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {isImage && (
          <a href={url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-xs text-foreground transition-colors"
          >
            <Search size={12} />
            <span className="max-w-[140px] truncate">{filename}</span>
          </a>
        )}
        <a href={url} download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-xs text-primary transition-colors"
        >
          <Download size={12} />
          <span className="max-w-[140px] truncate">{filename}</span>
        </a>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntlPaymentViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, isError } = useIntlPayment(id!)
  const { mutate: deletePayment, isPending: isDeleting } = useDeleteIntlPayment()
  const [historySearch, setHistorySearch] = useState('')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        {t('common.notFound', 'Maglumat tapylmady')}
      </div>
    )
  }

  const KABUL_DOCS = [
    { label: 'Talypyň degişli welaýata "SBERBANK" kartyň rekwizitleri',                    url: data.doc_sberbank_account },
    { label: 'Talypyň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy baradaky güwänamasy', url: data.doc_school_enrollment },
    { label: 'Talypyň bilendiriň göçürmesi',                                                url: data.doc_summons },
    { label: 'Talypyň degişli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi', url: data.doc_passport_tm },
    { label: 'Talypyň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň göçürmesi',         url: data.doc_foreign_passport },
    { label: 'Talypyň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň daşary ýurtda galan döwründe bakýan döwleti baradaky bellenen sahypasynyň göçürmesi', url: data.doc_foreign_passport_copy },
    { label: 'Talypyň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň dowletiniň girmesiz baradaky bellenen sahypasynyň göçürmesi', url: data.doc_exit_permission },
    { label: 'Talypyň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy barada maglumatlary daşary ýurt döwletiniň ýokary okuw mekdebinden haty', url: data.doc_school_foreign_info },
    { label: 'Talypyň daşary ýurt döwletinde okaýandygy baradaky güwänamany daşary ýurt döwletiniň ýokary okuw mekdebinden haty', url: data.doc_school_departure_info },
  ]

  const UPGRAD_DOCS = [
    { label: 'Upgradyý degişli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi', url: data.upd_doc_passport_tm },
    { label: 'Upgradyý degişli Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň göçürmesi', url: data.upd_doc_foreign_passport },
    { label: 'Upgradyý Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň daşary ýurt döwletinde galýandygy baradaky şaýmynyň bellenen sahypasynyň göçürmesi', url: data.upd_doc_visa },
    { label: 'Upgradyýyň we kabul edijiniň resminamalarynyň göçürmesi', url: data.upd_doc_acceptance_letter },
    { label: 'Upgradyý we kabul ediji täze 2015-nji ýyldan soňra pasportynyň seriýasy baradaky maglumatlary', url: data.upd_doc_passport_biometric },
    { label: 'Upgradyý we kabul ediji täze 2015-nji ýyldan soňra pasportynyň seriýasy baradaky göwnamasy', url: data.upd_doc_passport_old },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div /> {/* breadcrumb handled by layout */}
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 size={15} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('intlPayment.deleteTitle', 'Pozmak isleýärsiňizmi?')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('intlPayment.deleteDesc', 'Bu amal yzyna dolanyp bolmaz.')} {data.id}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>{t('common.cancel', 'Ýatyr')}</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => deletePayment(data.id, { onSuccess: () => navigate('/intl-payments/visa-master') })}
                >
                  {t('common.delete', 'Poz')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button size="icon" variant="ghost" className="h-8 w-8"
            onClick={() => navigate(`/intl-payments/visa-master/${id}/edit`)}
          >
            <Pencil size={15} />
          </Button>
        </div>
      </div>

      {/* Status */}
      <Section title={t('intlPayment.statusSection', 'Status')}>
        <div className="divide-y divide-border">
          <FieldRow label={t('intlPayment.client', 'Ulanyjy')}>
            <span className="text-primary font-medium">{data.client_label}</span>
          </FieldRow>
          <FieldRow label="ID">
            <span className="font-mono">{data.id}</span>
          </FieldRow>
          <FieldRow label={t('intlPayment.status', 'Status')}>
            <StatusBadge status={data.status} />
          </FieldRow>
          <FieldRow label={t('intlPayment.tilowanMonth', 'Tölewan (Aý/aý)')}>
            {data.created_at}
          </FieldRow>
          <FieldRow label={t('intlPayment.note', 'Bellik')}>
            {data.note}
          </FieldRow>
        </div>
      </Section>

      {/* Ýüztumanyň görnüşi */}
      <Section title={t('intlPayment.currencySection', 'Ýüztumanyň görnüşi')}>
        <div className="divide-y divide-border">
          <FieldRow label={t('intlPayment.currencyType', 'Ýüztumanyň görnüşi')}>
            {data.currency_type_label}
          </FieldRow>
        </div>
      </Section>

      {/* Lokasiýa */}
      <Section title={t('intlPayment.locationSection', 'Lokasiýa')}>
        <div className="divide-y divide-border">
          <FieldRow label={t('intlPayment.province', 'Welaýat')}>{data.province_label}</FieldRow>
          <FieldRow label={t('intlPayment.branch', 'Şahamça')}>
            <span className="text-primary font-medium">{data.branch_label}</span>
          </FieldRow>
        </div>
      </Section>

      {/* Şahsy maglumatlar */}
      <Section title={t('intlPayment.personalSection', 'Şahsy maglumatlar')}>
        <div className="divide-y divide-border">
          <FieldRow label={t('intlPayment.passportFirstName', 'Pasportdaky ady')}>{data.passport_first_name}</FieldRow>
          <FieldRow label={t('intlPayment.passportLastName', 'Pasportdaky familiýa')}>{data.passport_last_name}</FieldRow>
          <FieldRow label={t('intlPayment.phone', 'Telefon')}>+{data.phone}</FieldRow>
          <FieldRow label={t('intlPayment.email', 'E-poçta')}>{data.email}</FieldRow>
          <FieldRow label={t('intlPayment.homeAddress', 'Häzirki ýaşyş ýeri')}>{data.home_address}</FieldRow>
        </div>
      </Section>

      {/* Töleg */}
      <Section title={t('intlPayment.paymentSection', 'Töleg')}>
        <div className="divide-y divide-border mb-4">
          <FieldRow label={t('intlPayment.payerFullName', 'Töleg upgradyjynyň maglumatlary')}>
            {data.payer_full_name}
          </FieldRow>
          <FieldRow label={t('intlPayment.payerAccount', 'Töleg upgradyjynyň goşun hasaby')}>
            {data.payer_account_number}
          </FieldRow>
        </div>
        {/* Receiver table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  {t('intlPayment.passportSeries', 'Pasport seriýasy')}
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  {t('intlPayment.passportNumber', 'Pasport nomeri')}
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  {t('intlPayment.payerFullName', 'Ady Familiýasy Atasnyň ady')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3">{data.passport_series} – {data.passport_number}</td>
                <td className="px-4 py-3">{data.passport_number}</td>
                <td className="px-4 py-3">{data.payer_full_name}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Kabul ediji talyp boyunca resminamalar */}
      <Section title={t('intlPayment.kabulDocsSection', 'Kabul ediji talyp boyunca resminamalar')}>
        <div>
          {KABUL_DOCS.map((doc, i) => (
            <DocFileRow key={i} label={doc.label} url={doc.url} />
          ))}
        </div>
      </Section>

      {/* Upgradyý boyunca resminamalar */}
      <Section title={t('intlPayment.upgradDocsSection', 'Upgradyý boyunca resminamalar')}>
        <div>
          {UPGRAD_DOCS.map((doc, i) => (
            <DocFileRow key={i} label={doc.label} url={doc.url} />
          ))}
        </div>
      </Section>

      {/* Töleg taryhy */}
      <Section title={t('intlPayment.paymentHistory', 'Töleg taryhy')}>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder={t('intlPayment.search', 'Gözlemek')}
              className="h-9 w-full pl-9 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
          <div className="w-12 h-12 mb-3 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="9" x2="9" y2="21" />
            </svg>
          </div>
          <p className="text-sm">{t('intlPayment.noHistory', 'Beriilen kriteriýalara Töleg gabat gelmedi')}</p>
        </div>
      </Section>
    </div>
  )
}
