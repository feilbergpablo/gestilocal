import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAlertas } from '@/lib/alertas'
import Link from 'next/link'
import { AlertTriangle, Users, Package, Truck, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const user = session!.user as any

  const locales = await prisma.local.findMany({
    where: user.rol === 'ADMIN' ? { activo: true } : { id: user.localId, activo: true },
    include: { _count: { select: { empleados: true, productos: true } } },
    orderBy: { nombre: 'asc' },
  })

  const [totalEmpleados, totalProductos, totalProveedores] = await Promise.all([
    prisma.empleado.count({ where: { activo: true } }),
    prisma.producto.count({ where: { activo: true } }),
    prisma.proveedor.count({ where: { activo: true } }),
  ])

  const movsMes = await prisma.movimiento.findMany({
    where: { fecha: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
  })
  const facturacionMes = movsMes.filter(m => m.tipo === 'INGRESO').reduce((a, m) => a + Number(m.monto), 0)
  const alertas = await getAlertas()

  const localColors: Record<string, string> = {
    'RYGO': 'bg-blue-50 text-blue-600',
    'Insucom 2': 'bg-green-50 text-green-600',
    'Insucom': 'bg-amber-50 text-amber-600',
    'La Oveja Negra': 'bg-red-50 text-red-600',
    'Depósito': 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Buenos días — {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Empleados', value: totalEmpleados, icon: Users, sub: 'en todos los locales' },
          { label: 'Productos', value: totalProductos, icon: Package, sub: 'en stock' },
          { label: 'Proveedores', value: totalProveedores, icon: Truck, sub: 'activos' },
          { label: 'Facturación del mes', value: `$${facturacionMes.toLocaleString('es-AR')}`, icon: TrendingUp, sub: 'ingresos acumulados' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{m.label}</span>
              <m.icon size={14} className="text-gray-300" />
            </div>
            <div className="text-2xl font-semibold text-gray-900">{m.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {alertas.length > 0 && (
        <Link href="/alertas" className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 hover:bg-amber-100 transition-colors">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 font-medium">{alertas.length} alerta{alertas.length !== 1 ? 's' : ''} activa{alertas.length !== 1 ? 's' : ''} requieren atención</span>
          <span className="ml-auto text-xs text-amber-600">Ver todas →</span>
        </Link>
      )}

      <h2 className="text-sm font-medium text-gray-600 mb-3">Locales</h2>
      <div className="grid grid-cols-2 gap-3">
        {locales.map(local => (
          <Link key={local.id} href={`/locales/${local.id}`} className="card p-4 hover:border-gray-200 transition-colors group">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${localColors[local.nombre] ?? 'bg-gray-100 text-gray-500'}`}>
                {local.nombre.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 group-hover:text-gray-700">{local.nombre}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">{local.tipo}</div>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs text-gray-400"><span className="font-medium text-gray-700">{local._count.empleados}</span> empleados</span>
                  <span className="text-xs text-gray-400"><span className="font-medium text-gray-700">{local._count.productos}</span> productos</span>
                </div>
              </div>
              <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
