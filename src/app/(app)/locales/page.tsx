import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const localColors: Record<string, string> = {
  'RYGO': 'bg-blue-50 text-blue-600',
  'Insucom 2': 'bg-green-50 text-green-600',
  'Insucom': 'bg-amber-50 text-amber-600',
  'La Oveja Negra': 'bg-red-50 text-red-600',
  'Depósito': 'bg-gray-100 text-gray-500',
}

export default async function LocalesPage() {
  const session = await getServerSession(authOptions)
  const user = session!.user as any
  const locales = await prisma.local.findMany({
    where: user.rol === 'ADMIN' ? { activo: true } : { id: user.localId, activo: true },
    include: { _count: { select: { empleados: true, productos: true, proveedores: true } } },
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Mis locales</h1>
      <div className="grid grid-cols-2 gap-4">
        {locales.map(local => (
          <Link key={local.id} href={`/locales/${local.id}`} className="card p-5 hover:border-gray-200 transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold mb-3 ${localColors[local.nombre] ?? 'bg-gray-100 text-gray-500'}`}>
              {local.nombre.charAt(0)}
            </div>
            <div className="font-semibold text-gray-900 mb-0.5">{local.nombre}</div>
            <div className="text-xs text-gray-400 mb-1">{local.tipo}</div>
            <div className="text-xs text-gray-400 mb-3">{local.direccion}</div>
            <div className="flex gap-4 pt-3 border-t border-gray-50">
              <div className="text-xs text-gray-400"><span className="font-semibold text-gray-800 text-sm">{local._count.empleados}</span> empleados</div>
              <div className="text-xs text-gray-400"><span className="font-semibold text-gray-800 text-sm">{local._count.productos}</span> productos</div>
              <div className="text-xs text-gray-400"><span className="font-semibold text-gray-800 text-sm">{local._count.proveedores}</span> proveedores</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
