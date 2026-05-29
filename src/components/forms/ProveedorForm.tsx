'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Local { id: string; nombre: string }
interface Props { locales: Local[]; proveedor?: any }

export function ProveedorForm({ locales, proveedor }: Props) {
  const router = useRouter()
  const esEdicion = !!proveedor

  const [form, setForm] = useState({
    razonSocial: proveedor?.razonSocial ?? '',
    cuit: proveedor?.cuit ?? '',
    telefono: proveedor?.telefono ?? '',
    email: proveedor?.email ?? '',
    direccion: proveedor?.direccion ?? '',
    condicionIva: proveedor?.condicionIva ?? '',
    banco: proveedor?.banco ?? '',
    cbu: proveedor?.cbu ?? '',
    observaciones: proveedor?.observaciones ?? '',
  })

  const [localesSeleccionados, setLocalesSeleccionados] = useState<string[]>(
    proveedor?.locales?.map((lp: any) => lp.localId) ?? []
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function toggleLocal(id: string) {
    setLocalesSeleccionados(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = { ...form, locales: localesSeleccionados }

    const res = await fetch('/api/proveedores', {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(esEdicion ? { id: proveedor.id, ...payload } : payload),
    })

    if (res.ok) {
      router.push('/proveedores')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al guardar')
      setLoading(false)
    }
  }

  const condicionesIva = ['Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final']

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Datos principales */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Datos del proveedor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Razón social *</label>
            <input className="input w-full" value={form.razonSocial} onChange={e => set('razonSocial', e.target.value)} required />
          </div>
          <div>
            <label className="label">CUIT *</label>
            <input className="input w-full" placeholder="20-12345678-9" value={form.cuit} onChange={e => set('cuit', e.target.value)} required />
          </div>
          <div>
            <label className="label">Condición IVA</label>
            <select className="input w-full" value={form.condicionIva} onChange={e => set('condicionIva', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {condicionesIva.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Teléfono</label>
            <input className="input w-full" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input w-full" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Dirección</label>
            <input className="input w-full" value={form.direccion} onChange={e => set('direccion', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Datos bancarios */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Datos bancarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Banco</label>
            <input className="input w-full" placeholder="ej: Banco Nación" value={form.banco} onChange={e => set('banco', e.target.value)} />
          </div>
          <div>
            <label className="label">CBU</label>
            <input className="input w-full" value={form.cbu} onChange={e => set('cbu', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Locales asociados */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Locales asociados</h2>
        <div className="flex flex-wrap gap-2">
          {locales.map(l => (
            <button
              key={l.id}
              type="button"
              onClick={() => toggleLocal(l.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                localesSeleccionados.includes(l.id)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {l.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Observaciones */}
      <div className="card p-4">
        <label className="label">Observaciones</label>
        <textarea className="input w-full h-20 resize-none" value={form.observaciones} onChange={e => set('observaciones', e.target.value)} />
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear proveedor'}
        </button>
      </div>
    </form>
  )
}
