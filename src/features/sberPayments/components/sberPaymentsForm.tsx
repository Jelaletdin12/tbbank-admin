'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useCreateSberPayment, useUpdateSberPayment } from '@/features/sberPayments/hooks/useSberPayments'
import { WELAYATLAR, SAHAMCALAR, STATUSES, type SberPaymentOrder, type SberPaymentFormData, type PaymentStatus } from '@/features/sberPayments/api/sberPaymentsApi'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SberPaymentFormProps {
  mode: 'create' | 'edit'
  initialData?: SberPaymentOrder | null
  orderId?: string
}

// ─── Document Labels ──────────────────────────────────────────────────────────

const acceptedDocumentLabels = [
  'Talyba degisli walýuta "SBERBANK" kartyň rekwizitleri',
  'Talybýň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy baradaky güwanamasy',
  'Talybýň bildirisli göcürmesi',
  'Talyba degisli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi',
  'Talybýň Türkmenistandan çykmak we Türkmenistana girmek üçin (zagran) pasportynyň göçürmesi',
  'Talybýň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportyndaky daşary ýurda göýberilmegi barada beriim miiletti hereket edijan rughsatnamasyniyň (wizasynyň) bellenen sahypasynyň göçürmesi',
  'Talybýň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportyndaky Türkmenistandan çykanday we daşary ýurt döwletine girenligi baradaky ştamplaryň (belgi ştamply) bellenen sahypasynyň göçürmesi',
  'Talybýň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy baradaky güwanamasynyň doly takyk dili wýagdayýnda talyk dili magumatyň sebäpleri baradaky daşary ýurt döwletiniň ýokary okuw mekdebinden haty',
]

const sentDocumentLabels = [
  'Ugradyjy degisli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi',
  'Ugradyjy degisli Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň asyl görnüşi we göçürmesi',
  'Ugradyjy degisli Türkmenistandan çykmak we Türkmenistana girmek üçin pasportyndaky daşary döwletine girenliği we daşary döwlete baradaky ştamply bellenen sahypasynyň göçürmesi',
  'Ugradyjynýň we kabul edijinin (talybýň) özara garyndaşlyk denjesini tassyklaýjy resminamalarynýň göçürmesi',
  'Ugradyjy we kabul ediji (talyp) 2015-nji ýyldan soňra Türkmenistanyň raýatynýň pasportyny kiriş gerek alan bolsa, onda birnji gerek alan pasportynyň seriyasy baradaky maglumat',
  'Ugradyjy we kabul ediji (talyp) 2015-nji ýyldan soňra Türkmenistanyň raýatynýň pasportyny kiriş gerek alandan soňra birnji gerek alan pasportynyň seriyasy baradaky magumatý bilmeýän, balsa onda polisijyenyň degisli ekedasynýdan birnji alan pasportynyň seriyasy baradaky güwanamasy',
]

// ─── Shared Form Component ────────────────────────────────────────────────────

export function SberPaymentForm({ mode, initialData, orderId }: SberPaymentFormProps) {
  const router = useNavigate()
  const createMutation = useCreateSberPayment()
  const updateMutation = useUpdateSberPayment()
  
  const isLoading = createMutation.isPending || updateMutation.isPending
  
  // Form state
  const [formData, setFormData] = useState<SberPaymentFormData>({
    welayat: '',
    sahamca: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    status: 'GARASYLYYAR',
    bellik: '',
    accountNumber: '',
    passportSeries: '',
    passportNumber: '',
    fullName: '',
  })
  

  
  // Validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof SberPaymentFormData, string>>>({})
  
  // Populate form with initial data in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        welayat: initialData.welayat,
        sahamca: initialData.sahamca,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        phone: initialData.phone,
        email: initialData.email,
        address: initialData.address,
        status: initialData.status,
        bellik: initialData.bellik,
        accountNumber: initialData.accountNumber,
        passportSeries: initialData.passportSeries,
        passportNumber: initialData.passportNumber,
        fullName: initialData.fullName,
      })
    }
  }, [mode, initialData])
  
  // Get available branches based on selected welayat
  const availableBranches = formData.welayat ? SAHAMCALAR[formData.welayat] ?? [] : []
  
  // Update field helper
  const updateField = <K extends keyof SberPaymentFormData>(
    field: K,
    value: SberPaymentFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }
  
  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SberPaymentFormData, string>> = {}
    
    if (!formData.welayat) newErrors.welayat = 'Welayat saylanmaly'
    if (!formData.sahamca) newErrors.sahamca = 'Sahamca saylanmaly'
    if (!formData.firstName) newErrors.firstName = 'Ady girizmeli'
    if (!formData.lastName) newErrors.lastName = 'Familiyasy girizmeli'
    if (!formData.phone) newErrors.phone = 'Telefon girizmeli'
    if (!formData.address) newErrors.address = 'Salgy girizmeli'
    if (!formData.passportSeries) newErrors.passportSeries = 'Pasport seriyasy girizmeli'
    if (!formData.passportNumber) newErrors.passportNumber = 'Pasport nomeri girizmeli'
    if (!formData.fullName) newErrors.fullName = 'Doly ady girizmeli'
    if (!formData.accountNumber) newErrors.accountNumber = 'Goyum hasaby girizmeli'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Meydanlary dolduryň')
      return
    }
    
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(formData)
        toast.success('Toleg ustunlikli doredildi')
        router('/sber-payments')
      } else if (orderId) {
        await updateMutation.mutateAsync({ ...formData, id: orderId })
        toast.success('Toleg ustunlikli tazelendi')
        router(`/sber-payments/${orderId}`)
      }
    } catch {
      toast.error('Yalnyshlyk yuze cykdy')
    }
  }
  
  return (
    <div className="space-y-8  pb-8">
      {/* Status Section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Status</h2>
        <div className="grid gap-4">
          <FormInput
            type="searchable-select"
            label="Ulanyjy"
            required
            placeholder="Saylamak ucin basyn"
            value=""
            onChange={() => {}}
            options={[]}
          />
          <FormInput
            type="select"
            label="Status"
            required
            value={formData.status}
            onChange={(val) => updateField('status', val as PaymentStatus)}
            options={STATUSES}
            error={errors.status}
          />
          <FormInput
            type="text"
            label="Bellik"
            value={formData.bellik}
            onChange={(val) => updateField('bellik', val)}
            placeholder="Bellik"
          />
        </div>
      </section>
      
      {/* Location Section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Lokasiya</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            type="select"
            label="Welayat"
            required
            value={formData.welayat}
            onChange={(val) => {
              updateField('welayat', val)
              updateField('sahamca', '') // Reset branch when region changes
            }}
            options={WELAYATLAR.map((w) => ({ value: w, label: w }))}
            placeholder="Asgabat"
            error={errors.welayat}
          />
          <FormInput
            type="searchable-select"
            label="Sahamca"
            required
            value={formData.sahamca}
            onChange={(val) => updateField('sahamca', val)}
            options={availableBranches.map((b) => ({ value: b, label: b }))}
            placeholder="Saylamak ucin basyn"
            disabled={!formData.welayat}
            error={errors.sahamca}
          />
        </div>
      </section>
      
      {/* Personal Info Section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Sahsy maglumatlar</h2>
        <div className="grid gap-4">
          <FormInput
            type="text"
            label="Pasportdaky ady"
            required
            value={formData.firstName}
            onChange={(val) => updateField('firstName', val)}
            placeholder="Pasportdaky ady"
            error={errors.firstName}
          />
          <FormInput
            type="text"
            label="Pasportdaky familiya"
            required
            value={formData.lastName}
            onChange={(val) => updateField('lastName', val)}
            placeholder="Pasportdaky familiya"
            error={errors.lastName}
          />
          <FormInput
            type="phone"
            label="Telefon"
            required
            value={formData.phone}
            onChange={(val) => updateField('phone', val)}
            placeholder="61 097 651"
            error={errors.phone}
          />
          <FormInput
            type="email"
            label="E-pocta"
            value={formData.email}
            onChange={(val) => updateField('email', val)}
            placeholder="E-pocta"
          />
          <FormInput
            type="text"
            label="Hazirki yasayys yeri"
            required
            value={formData.address}
            onChange={(val) => updateField('address', val)}
            placeholder="Hazirki yasayys yeri"
            error={errors.address}
          />
        </div>
      </section>
      
      {/* Payment Info Section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Tolegi ugradyjynyn maglumatlary</h2>
        <div className="grid gap-4">
          <FormInput
            type="searchable-select"
            label="Pasport seriyasy"
            required
            value={formData.passportSeries}
            onChange={(val) => updateField('passportSeries', val)}
            options={[
              { value: 'II-MA', label: 'II-MA' },
              { value: 'II-MB', label: 'II-MB' },
              { value: 'II-MC', label: 'II-MC' },
              { value: 'II-MD', label: 'II-MD' },
            ]}
            placeholder="Saylamak ucin basyn"
            error={errors.passportSeries}
          />
          <FormInput
            type="text"
            label="Pasport nomeri"
            required
            value={formData.passportNumber}
            onChange={(val) => updateField('passportNumber', val)}
            placeholder="Pasport nomeri"
            error={errors.passportNumber}
          />
          <FormInput
            type="text"
            label="Ady Familiyasy Atasynyn ady"
            required
            value={formData.fullName}
            onChange={(val) => updateField('fullName', val)}
            placeholder="Ady Familiyasy Atasynyn ady"
            error={errors.fullName}
          />
          <FormInput
            type="text"
            label="Goyum hasaby"
            required
            value={formData.accountNumber}
            onChange={(val) => updateField('accountNumber', val)}
            placeholder="Goyum hasaby"
            error={errors.accountNumber}
          />
        </div>
      </section>
      
      {/* Recipient Info Section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Tolegi kabul edijinin maglumatlary</h2>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-4">
            <span className="text-sm text-muted-foreground shrink-0 w-48">
              Tolegi kabul edijinin maglumatlary
            </span>
            <Button variant="default" className="bg-primary text-primary-foreground">
              Setir gos
            </Button>
          </div>
        </div>
      </section>
      
      {/* Accepted Documents Section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Kabul ediji talyp boyunca resminamalary
        </h2>
        <div className="space-y-3">
          {acceptedDocumentLabels.map((label, index) => (
            <div key={index} className="flex items-start gap-4 py-3">
              <span className="w-80 shrink-0 text-sm text-muted-foreground leading-relaxed">
                {label}
              </span>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus size={14} />
                Add New File
              </Button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Sent Documents Section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Ugradyjy boyunca resminamalary
        </h2>
        <div className="space-y-3">
          {sentDocumentLabels.map((label, index) => (
            <div key={index} className="flex items-start gap-4 py-3">
              <span className="w-80 shrink-0 text-sm text-muted-foreground leading-relaxed">
                {label}
              </span>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus size={14} />
                Add New File
              </Button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          disabled={isLoading}
        >
          Yatyr
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="min-w-[180px]"
        >
          {isLoading ? (
            <Spinner className="w-4 h-4" />
          ) : mode === 'create' ? (
            'Sber toleg (talyplar ucin) doredih'
          ) : (
            'Yatda sakla'
          )}
        </Button>
      </div>
    </div>
  )
}
