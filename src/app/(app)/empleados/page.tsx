export const dynamic = "force-dynamic"
import { prisma } from '@/lib/prisma'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

const localBadge: Record<string, string> = {
  'RYGO': 'badge-blue', 'Insucom 2': 'badge-green', 'Insucom': 'badge-amber',
  'La Oveja Negra': 'badge-red', 'Depósito': 'badge-gray',
}

export default async function EmpleadosPage() {
  const empleados = await prisma.empleado.findMany({
    where: { activo: true },
    include: { local: true },
    orderBy: [{ local: { nombre: 'asc' } }, { apellido: 'asc' }],
  })
  const hoy = new Date()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Todos los empleados</h1>
          <p className="text-sm text-gray-400 mt-0.5">{empleados.length} en todos los locales</p>
        </div>
        <Link href="/empleados/nuevo" className="btn btn-primary">+ Nuevo empleado</Link>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Nombre</th><th className="th">DNI</th><th className="th">CUIL</th>
              <th className="th">Teléfono</th><th className="th">Email</th>
              <th className="th">Local</th><th className="th">Ingreso</th><th className="th">Doc.</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map(e => {
              const diasVenc = e.vencimientoDni ? differenceInDays(e.vencimientoDni, hoy) : null
              const docStatus = diasVenc === null ? null : diasVenc < 0 ? 'vencido' : diasVenc < 15 ? 'por-vencer' : 'ok'
              return (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="td font-medium">{e.apellido}, {e.nombre}</td>
                  <td className="td text-gray-500 text-xs">{e.dni}</td>
                  <td className="td text-gray-500 text-xs">{e.cuil}</td>
                  <td className="td text-gray-500">{e.telefono ?? '—'}</td>
                  <td className="td text-gray-500 text-xs">{e.email ?? '—'}</td>
                  <td className="td"><span className={`badge ${localBadge[e.local.nombre] ?? 'badge-gray'}`}>{e.local.nombre}</span></td>
                  <td className="td text-gray-500 text-xs">{format(e.fechaIngreso, 'MMM yyyy', { locale: es })}</td>
                  <td className="td">
                    {docStatus === 'vencido' && <span className="badge badge-red">Vencido</span>}
                    {docStatus === 'por-vencer' && <span className="badge badge-amber">{diasVenc}d</span>}
                    {docStatus === 'ok' && <span className="badge badge-green">OK</span>}
                    {docStatus === null && <span className="text-gray-300 text-xs">—</span>}
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
