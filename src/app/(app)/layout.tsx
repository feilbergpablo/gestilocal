import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { getAlertas } from '@/lib/alertas'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const alertas = await getAlertas()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar alertCount={alertas.length} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
