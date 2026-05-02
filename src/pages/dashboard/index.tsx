import { useAuthStore } from '@/app/store/authStore'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-[var(--bg-base)] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </header>
        
        <main className="grid gap-6">
          <div className="p-6 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border-default)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Welcome, {user?.username || 'Admin'}!</h2>
            <p className="text-[var(--text-secondary)]">This is your TBBank Admin Dashboard.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-[var(--bg-surface)] rounded-[var(--radius-md)] border border-[var(--border-default)]">
                <h3 className="font-medium text-[var(--text-primary)]">Stat {i}</h3>
                <p className="text-2xl font-bold text-[var(--brand-500)]">0</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
