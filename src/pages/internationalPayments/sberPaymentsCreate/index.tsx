'use client'

import { SberPaymentForm } from '@/features/sberPayments/components/sberPaymentsForm'

export default function SberPaymentCreatePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6">
        Sber toleg (talyplar ucin) doredih
      </h1>
      <SberPaymentForm mode="create" />
    </div>
  )
}
