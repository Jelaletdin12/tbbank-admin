import { useTranslation } from 'react-i18next'
import { TrendingDown, CreditCard } from 'lucide-react'

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">{t('Dashboard', 'Baş sahypa')}</h1>
      </div>
      
      <main className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 bg-card rounded-lg border border-border shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-muted-foreground">{t('Loan orders (all)', 'Karz sargytlary (ählisi)')}</h3>
              <div className="bg-accent text-xs px-2 py-1 rounded text-muted-foreground">30 gün</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-md">
                <CreditCard className="text-primary size-6" />
              </div>
              <p className="text-4xl font-bold text-foreground">135</p>
            </div>
            <div className="mt-4 flex items-center text-destructive text-sm font-medium">
              <TrendingDown size={16} className="mr-1" />
              12.34% Pese gaçmak
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-muted-foreground">{t('Loan orders (all)', 'Karz sargytlary (ählisi)')}</h3>
              <div className="bg-accent text-xs px-2 py-1 rounded text-muted-foreground">30 gün</div>
            </div>
            <div className="flex items-center">
              <p className="text-4xl font-bold text-foreground">0</p>
            </div>
            <div className="mt-4 h-12 w-full flex items-end">
               {/* Mock chart */}
               <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                 <path d="M0,35 L20,30 L40,32 L60,20 L80,25 L100,10 L120,15 L140,5 L160,25 L180,20 L200,30" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinejoin="round" />
                 <circle cx="100" cy="10" r="3" fill="hsl(var(--primary))" />
                 <circle cx="140" cy="5" r="3" fill="hsl(var(--primary))" />
               </svg>
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-muted-foreground">{t('Loan orders (all)', 'Karz sargytlary (ählisi)')}</h3>
              <div className="text-xs text-muted-foreground">(6,968 jemi)</div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-yellow-500"></span><span className="text-muted-foreground">Bellige alyndy (1 - 0%)</span></div>
                <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-green-500"></span><span className="text-muted-foreground">Kanagatlandyrylan (6,746 - 97%)</span></div>
                <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-red-500"></span><span className="text-muted-foreground">Ýatyrylan (5 - 0%)</span></div>
                <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-orange-500"></span><span className="text-muted-foreground">Garaşylýar (208 - 3%)</span></div>
                <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-blue-500"></span><span className="text-muted-foreground">Işlenilýär (8 - 0%)</span></div>
              </div>
              <div className="size-20 rounded-full border-8 border-green-500 flex-shrink-0"></div>
            </div>
          </div>

        </div>
        
        <div className="text-center text-xs text-muted-foreground mt-8">
          © 2026 TBBANK.GOV.TM.
        </div>
      </main>
    </div>
  )
}
