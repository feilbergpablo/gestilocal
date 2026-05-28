import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar alertCount={0} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
