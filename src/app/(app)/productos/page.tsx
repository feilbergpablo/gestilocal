export const dynamic = "force-dynamic"
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const localBadge: Record<string, string> = {
  'RYGO': 'badge-blue', 'Insucom 2': 'badge-green', 'Insucom': 'badge-amber',
  'La Oveja Negra': 'badge-red', 'Depósito': 'badge-gray',
}

export default async function ProductosPage() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: { local: true },
    orderBy: [{ local: { nombre: 'asc' } }, { nombre: 'asc' }],
  })
  const stockBajo = productos.filter(p => p.stock <= p.stockMinimo).length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Todos los productos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{productos.length} productos · {stockBajo > 0 && <span className="text-red-500">{stockBajo} con stock bajo</span>}</p>
        </div>
        <Link href="/productos/nuevo" className="btn btn-primary">+ Nuevo producto</Link>
      </div>
      <div className="card">
        <table className="w-full">
          <thead>
            <tr><th className="th">Producto</th><th className="th">SKU</th><th className="th">Categoría</th><th className="th">Stock</th><th className="th">Precio venta</th><th className="th">Local</th><th className="th">Estado</th></tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="td font-medium">{p.nombre}</td>
                <td className="td text-gray-400 text-xs">{p.sku ?? '—'}</td>
                <td className="td text-gray-500">{p.categoria ?? '—'}</td>
                <td className="td"><span className={p.stock <= p.stockMinimo ? 'text-red-600 font-medium' : 'text-gray-700'}>{p.stock}</span><span className="text-gray-300 text-xs"> / mín {p.stockMinimo}</span></td>
                <td className="td text-gray-700">{p.precioVenta ? `$${Number(p.precioVenta).toLocaleString('es-AR')}` : '—'}</td>
                <td className="td"><span className={`badge ${localBadge[p.local.nombre] ?? 'badge-gray'}`}>{p.local.nombre}</span></td>
                <td className="td">{p.stock <= p.stockMinimo ? <span className="badge badge-red">Stock bajo</span> : <span className="badge badge-green">OK</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
