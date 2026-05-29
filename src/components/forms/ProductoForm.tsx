'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Local { id: string; nombre: string }
interface Props { locales: Local[]; producto?: any }

export function ProductoForm({ locales, producto }: Props) {
  const router = useRouter()
  const esEdicion = !!producto

  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    sku: producto?.sku ?? '',
    categoria: producto?.categoria ?? '',
    precioCompra: producto?.precioCompra ?? '',
    precioVenta: producto?.precioVenta ?? '',
    stock: producto?.stock ?? '0',
    stockMinimo: producto?.stockMinimo ?? '5',
    unidad: producto?.unidad ?? '',
    localId: producto?.localId ?? locales[0]?.id ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/productos', {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(esEdicion ? { id: producto.id, ...form } : form),
    })

    if (res.ok) {
      router.push('/productos')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al guardar')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Local */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Local</h2>
        <select value={form.localId} onChange={e => set('localId', e.target.value)} className="input w-full" required>
          {locales.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
      </div>

      {/* Identificación */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Identificación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Nombre del producto *</label>
            <input className="input w-full" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
          </div>
          <div>
            <label className="label">SKU / Código</label>
            <input className="input w-full" placeholder="ej: PROD-001" value={form.sku} onChange={e => set('sku', e.target.value)} />
          </div>
          <div>
            <label className="label">Categoría</label>
            <input className="input w-full" placeholder="ej: Papelería, Electrónica..." value={form.categoria} onChange={e => set('categoria', e.target.value)} />
          </div>
          <div>
            <label className="label">Unidad</label>
            <input className="input w-full" placeholder="ej: unidad, kg, litro..." value={form.unidad} onChange={e => set('unidad', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Precios */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Precios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Precio de compra</label>
            <input type="number" step="0.01" className="input w-full" value={form.precioCompra} onChange={e => set('precioCompra', e.target.value)} />
          </div>
          <div>
            <label className="label">Precio de venta</label>
            <input type="number" step="0.01" className="input w-full" value={form.precioVenta} onChange={e => set('precioVenta', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Stock</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Stock actual</label>
            <input type="number" className="input w-full" value={form.stock} onChange={e => set('stock', e.target.value)} />
          </div>
          <div>
            <label className="label">Stock mínimo</label>
            <input type="number" className="input w-full" value={form.stockMinimo} onChange={e => set('stockMinimo', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
