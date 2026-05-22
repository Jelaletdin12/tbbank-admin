import { useTranslation } from 'react-i18next'

interface CreditCardVisualProps {
  cardNumber?: string | null
  cardName?: string | null
  expMonth?: string | null
  expYear?: string | null
  variant?: 'primary' | 'secondary'
}

export function CreditCardVisual({
  cardNumber,
  cardName,
  expMonth,
  expYear,
  variant = 'primary',
}: CreditCardVisualProps) {
  const { t } = useTranslation()

  // Format the card number to add spaces (e.g., 9934 0019 1234 5678)
  const formatCardNumber = (num?: string | null) => {
    if (!num) return '**** **** **** ****'
    const cleaned = num.replace(/\D/g, '')
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(' ') : cleaned
  }

  const bgGradient =
    variant === 'primary'
      ? 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700'
      : 'bg-gradient-to-tr from-blue-950 via-indigo-900 to-slate-900'

  return (
    <div
      className={`${bgGradient} w-full max-w-[360px] h-[210px] rounded-2xl p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden`}
    >
      {/* Glow effects */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top row: Chip and Logo/Bank Name */}
      <div className="flex justify-between items-center z-10">
        <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 flex items-center justify-center opacity-90 overflow-hidden relative">
          {/* Chip lines */}
          <div className="absolute w-full h-full border border-yellow-700/30 rounded"></div>
          <div className="w-[1px] h-full bg-yellow-700/20 absolute left-3"></div>
          <div className="w-[1px] h-full bg-yellow-700/20 absolute right-3"></div>
          <div className="w-full h-[1px] bg-yellow-700/20 absolute top-4"></div>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold tracking-wider opacity-80">
            {t('Altyn Asyr') || 'ALTYN ASYR'}
          </span>
        </div>
      </div>

      {/* Middle row: Card Number */}
      <div className="z-10 mt-6">
        <div className="font-mono text-2xl tracking-widest text-slate-100 drop-shadow-md">
          {formatCardNumber(cardNumber)}
        </div>
      </div>

      {/* Bottom row: Name and Expiry */}
      <div className="flex justify-between items-end z-10 mt-4">
        <div className="flex flex-col uppercase">
          <span className="text-[10px] text-slate-400 tracking-widest mb-1">
            {t('Card Holder') || 'KARTDAKY ADY'}
          </span>
          <span className="font-medium tracking-wider truncate max-w-[180px]">
            {cardName || 'MÄHRIBAN TÖLEGLI'}
          </span>
        </div>
        <div className="flex flex-col uppercase items-end">
          <span className="text-[10px] text-slate-400 tracking-widest mb-1">
            {t('Valid Thru') || 'MÖHLETI'}
          </span>
          <span className="font-medium tracking-wider">
            {expMonth || '00'}/{expYear ? expYear.slice(-2) : '00'}
          </span>
        </div>
      </div>
    </div>
  )
}
