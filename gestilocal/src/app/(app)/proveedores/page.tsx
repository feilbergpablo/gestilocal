import { prisma } from '@/lib/prisma'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'

export default async function ProveedoresPage() {
  const proveedores = await prisma.proveedor.findMany({
    where: { activo: true },
    include: { locales: { include: { local: { select: { nombre: true } } } } },
    orderBy: { razonSocial: 'asc' },
  })
  const hoy = new Date()
  const localBadge: Record<string, string> = {
    'RYGO': 'badge-blue', 'Insucom 2': 'badge-green', 'Insucom': 'badge-amber',
    'La Oveja Negra': 'badge-red', 'Depósito': 'badge-gray',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Todos los proveedores</h1>
          <p className="text-sm text-gray-400 mt-0.5">{proveedores.length} proveedores activos</p>
        </div>
        <Link href="/proveedores/nuevo" className="btn btn-primary">+ Nuevo proveedor</Link>
      </div>
      <div className="card">
        <table className="w-full">
          <thead>
            <tr><th className="th">Proveedor</th><th className="th">CUIT</th><th className="th">Teléfono</th><th className="th">Email</th><th className="th">Locales</th><th className="th">Pago pendiente</th><th className="th">Estado</th></tr>
          </thead>
          <tbody>
            {proveedores.map(p => {
              const totalPendiente = p.locales.reduce((a, lp) => a + Number(lp.montoPendiente ?? 0), 0)
              const proximoPago = p.locales.reduce((min, lp) => lp.proximoPago && (!min || lp.proximoPago < min) ? lp.proximoPago : min, null as Date | null)
              const diasPago = proximoPago ? differenceInDays(proximoPago, hoy) : null
              const status = totalPendiente === 0 ? 'ok' : diasPago === null ? 'pendiente' : diasPago < 0 ? 'vencido' : diasPago <= 7 ? 'urgente' : 'pendiente'
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="td font-medium">{p.razonSocial}</td>
                  <td className="td text-gray-400 text-xs">{p.cuit}</td>
                  <td className="td text-gray-500">{p.telefono ?? '—'}</td>
                  <td className="td text-gray-400 text-xs">{p.email ?? '—'}</td>
                  <td className="td"><div className="flex flex-wrap gap-1">{p.locales.map(lp => <span key={lp.localId} className={`badge ${localBadge[lp.local.nombre] ?? 'badge-gray'}`}>{lp.local.nombre}</span>)}</div></td>
                  <td className="td font-medium">{totalPendiente > 0 ? <span className="text-red-600">${totalPendiente.toLocaleString('es-AR')}</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="td">
                    {status === 'ok' && <span className="badge badge-green">Al día</span>}
                    {status === 'vencido' && <span className="badge badge-red">Vencido</span>}
                    {status === 'urgente' && <span className="badge badge-amber">Vence en {diasPago}d</span>}
                    {status === 'pendiente' && <span className="badge badge-amber">Pendiente</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
