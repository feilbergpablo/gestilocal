import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'

interface Props { params: { id: string }; searchParams: { tab?: string } }

export default async function LocalDetailPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const user = session!.user as any
  if (user.rol === 'GERENTE' && user.localId !== params.id) redirect('/locales')

  const local = await prisma.local.findUnique({ where: { id: params.id } })
  if (!local) notFound()

  const tab = searchParams.tab ?? 'empleados'

  const [empleados, productos, proveedores, movimientos] = await Promise.all([
    prisma.empleado.findMany({ where: { localId: params.id, activo: true }, orderBy: { apellido: 'asc' } }),
    prisma.producto.findMany({ where: { localId: params.id, activo: true }, orderBy: { nombre: 'asc' } }),
    prisma.localProveedor.findMany({ where: { localId: params.id }, include: { proveedor: true } }),
    prisma.movimiento.findMany({ where: { localId: params.id }, orderBy: { fecha: 'desc' }, take: 50 }),
  ])

  const ingresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((a, m) => a + Number(m.monto), 0)
  const gastos = movimientos.filter(m => m.tipo === 'GASTO').reduce((a, m) => a + Number(m.monto), 0)
  const hoy = new Date()

  const tabs = ['empleados', 'productos', 'proveedores', 'contabilidad']

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/locales" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4">
        <ArrowLeft size={14} /> Volver a locales
      </Link>

      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">{local.nombre}</h1>
        <p className="text-sm text-gray-400">{local.tipo} — {local.direccion}</p>
      </div>

      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {tabs.map(t => (
          <Link key={t} href={`/locales/${params.id}?tab=${t}`} className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors ${tab === t ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
            {t}
          </Link>
        ))}
      </div>

      {tab === 'empleados' && (
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-700">{empleados.length} empleados</span>
            <Link href={`/empleados/nuevo?localId=${params.id}`} className="btn text-xs">+ Agregar</Link>
          </div>
          <table className="w-full">
            <thead><tr><th className="th">Nombre</th><th className="th">DNI / CUIL</th><th className="th">Teléfono</th><th className="th">Ingreso</th><th className="th">Sueldo</th><th className="th">Doc.</th></tr></thead>
            <tbody>
              {empleados.map(e => {
                const diasVenc = e.vencimientoDni ? differenceInDays(e.vencimientoDni, hoy) : null
                const docStatus = diasVenc === null ? null : diasVenc < 0 ? 'vencido' : diasVenc < 15 ? 'por-vencer' : 'ok'
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="td font-medium">{e.apellido}, {e.nombre}</td>
                    <td className="td text-gray-500"><div>{e.dni}</div><div className="text-xs">{e.cuil}</div></td>
                    <td className="td text-gray-500">{e.telefono}</td>
                    <td className="td text-gray-500">{format(e.fechaIngreso, 'MMM yyyy', { locale: es })}</td>
                    <td className="td text-gray-500">{e.sueldo ? `$${Number(e.sueldo).toLocaleString('es-AR')}` : '—'}</td>
                    <td className="td">
                      {docStatus === 'vencido' && <span className="badge badge-red">Vencido</span>}
                      {docStatus === 'por-vencer' && <span className="badge badge-amber">Vence en {diasVenc}d</span>}
                      {docStatus === 'ok' && <span className="badge badge-green">OK</span>}
                      {docStatus === null && <span className="text-gray-300 text-xs">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'productos' && (
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-700">{productos.length} productos</span>
            <Link href={`/productos/nuevo?localId=${params.id}`} className="btn text-xs">+ Agregar</Link>
          </div>
          <table className="w-full">
            <thead><tr><th className="th">Producto</th><th className="th">SKU</th><th className="th">Categoría</th><th className="th">Stock</th><th className="th">Precio venta</th><th className="th">Estado</th></tr></thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="td font-medium">{p.nombre}</td>
                  <td className="td text-gray-400 text-xs">{p.sku ?? '—'}</td>
                  <td className="td text-gray-500">{p.categoria ?? '—'}</td>
                  <td className="td"><span className={p.stock <= p.stockMinimo ? 'text-red-600 font-medium' : 'text-gray-700'}>{p.stock}</span><span className="text-gray-300 text-xs"> / mín {p.stockMinimo}</span></td>
                  <td className="td text-gray-700">{p.precioVenta ? `$${Number(p.precioVenta).toLocaleString('es-AR')}` : '—'}</td>
                  <td className="td">{p.stock <= p.stockMinimo ? <span className="badge badge-red">Stock bajo</span> : <span className="badge badge-green">OK</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'proveedores' && (
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-700">{proveedores.length} proveedores</span>
            <Link href={`/proveedores/nuevo?localId=${params.id}`} className="btn text-xs">+ Agregar</Link>
          </div>
          <table className="w-full">
            <thead><tr><th className="th">Proveedor</th><th className="th">CUIT</th><th className="th">Teléfono</th><th className="th">Próximo pago</th><th className="th">Pendiente</th><th className="th">Estado</th></tr></thead>
            <tbody>
              {proveedores.map(lp => {
                const diasPago = lp.proximoPago ? differenceInDays(lp.proximoPago, hoy) : null
                const pagoStatus = !lp.montoPendiente || Number(lp.montoPendiente) === 0 ? 'ok' : diasPago === null ? 'pendiente' : diasPago < 0 ? 'vencido' : diasPago <= 7 ? 'urgente' : 'pendiente'
                return (
                  <tr key={lp.id} className="hover:bg-gray-50">
                    <td className="td font-medium">{lp.proveedor.razonSocial}</td>
                    <td className="td text-gray-400 text-xs">{lp.proveedor.cuit}</td>
                    <td className="td text-gray-500">{lp.proveedor.telefono ?? '—'}</td>
                    <td className="td text-gray-500">{lp.proximoPago ? format(lp.proximoPago, 'dd/MM/yyyy') : '—'}</td>
                    <td className="td font-medium">{Number(lp.montoPendiente ?? 0) > 0 ? `$${Number(lp.montoPendiente).toLocaleString('es-AR')}` : '—'}</td>
                    <td className="td">
                      {pagoStatus === 'ok' && <span className="badge badge-green">Al día</span>}
                      {pagoStatus === 'vencido' && <span className="badge badge-red">Vencido</span>}
                      {pagoStatus === 'urgente' && <span className="badge badge-amber">Vence en {diasPago}d</span>}
                      {pagoStatus === 'pendiente' && <span className="badge badge-amber">Pendiente</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'contabilidad' && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Ingresos', value: ingresos, color: 'text-green-700' },
              { label: 'Gastos', value: gastos, color: 'text-red-600' },
              { label: 'Resultado', value: ingresos - gastos, color: ingresos - gastos >= 0 ? 'text-gray-900' : 'text-red-600' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                <div className={`text-xl font-semibold ${m.color}`}>${m.value.toLocaleString('es-AR')}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <span className="text-sm font-medium text-gray-700">Movimientos recientes</span>
              <Link href={`/contabilidad/nuevo?localId=${params.id}`} className="btn text-xs">+ Registrar</Link>
            </div>
            <table className="w-full">
              <thead><tr><th className="th">Fecha</th><th className="th">Concepto</th><th className="th">Tipo</th><th className="th">Monto</th></tr></thead>
              <tbody>
                {movimientos.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="td text-gray-500 text-xs">{format(m.fecha, 'dd/MM/yyyy')}</td>
                    <td className="td font-medium">{m.concepto}</td>
                    <td className="td">{m.tipo === 'INGRESO' ? <span className="badge badge-green">Ingreso</span> : <span className="badge badge-red">Gasto</span>}</td>
                    <td className={`td font-medium ${m.tipo === 'INGRESO' ? 'text-green-700' : 'text-red-600'}`}>{m.tipo === 'INGRESO' ? '+' : '-'}${Number(m.monto).toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
