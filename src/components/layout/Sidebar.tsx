'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LayoutDashboard, Bell, Store, Users, Package, Truck, LogOut, Warehouse } from 'lucide-react'
import { clsx } from 'clsx'

const navGlobal = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alertas', label: 'Alertas', icon: Bell },
]
const navLocales = [
  { href: '/locales', label: 'Mis locales', icon: Store },
]
const navGlobal2 = [
  { href: '/empleados', label: 'Todos los empleados', icon: Users },
  { href: '/productos', label: 'Todos los productos', icon: Package },
  { href: '/proveedores', label: 'Todos los proveedores', icon: Truck },
]

interface Props { alertCount?: number }

export function Sidebar({ alertCount = 0 }: Props) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as any

  function NavItem({ href, label, icon: Icon, badge }: { href: string; label: string; icon: any; badge?: number }) {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
    return (
      <Link href={href} className={clsx('flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-sm transition-colors', active ? 'bg-white text-gray-900 font-medium shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/60')}>
        <Icon size={16} />
        <span className="flex-1">{label}</span>
        {badge ? <span className="text-xs font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{badge}</span> : null}
      </Link>
    )
  }

  return (
    <aside className="w-[220px] bg-gray-50 border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="font-semibold text-gray-900">GestiLocal</div>
        <div className="text-xs text-gray-400 mt-0.5">Av. de Mayo</div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">General</div>
        {navGlobal.map(n => <NavItem key={n.href} {...n} badge={n.href === '/alertas' ? alertCount : undefined} />)}

        <div className="px-4 py-1 mt-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Locales</div>
        {navLocales.map(n => <NavItem key={n.href} {...n} />)}

        {user?.rol === 'ADMIN' && (
          <>
            <div className="px-4 py-1 mt-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Vista global</div>
            {navGlobal2.map(n => <NavItem key={n.href} {...n} />)}
          </>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800 truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-400">{user?.rol === 'ADMIN' ? 'Admin general' : `Gerente — ${user?.localNombre}`}</div>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors w-full">
          <LogOut size={13} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
