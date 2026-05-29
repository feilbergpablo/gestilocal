'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Local { id: string; nombre: string }
interface Props { locales: Local[]; localIdDefault?: string }

export function MovimientoForm({ locales, localIdDefault }: Props) {
  const router = useRouter()

  const [form, setForm] = useState({
    concepto: '',
    tipo: 'INGRESO' as 'INGRESO' | 'GASTO',
    monto: '',
    comprobante: '',
    fecha: new Date().toISOString().split('T')[0],
    localId: localIdDefault ?? locales[0]?.id ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.back()
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

      <div className="card p-4 space-y-4">

        {/* Tipo — toggle visual */}
        <div>
          <label className="label">Tipo de movimiento *</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => set('tipo', 'INGRESO')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                form.tipo === 'INGRESO'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              ↑ Ingreso
            </button>
            <button
              type="button"
              onClick={() => set('tipo', 'GASTO')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                form.tipo === 'GASTO'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              ↓ Gasto
            </button>
          </div>
        </div>

        {/* Local */}
        <div>
          <label className="label">Local *</label>
          <select value={form.localId} onChange={e => set('localId', e.target.value)} className="input w-full" required>
            {locales.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
        </div>

        {/* Concepto */}
        <div>
          <label className="label">Concepto *</label>
          <input
            className="input w-full"
            placeholder="ej: Venta del día, Pago proveedor, Alquiler..."
            value={form.concepto}
            onChange={e => set('concepto', e.target.value)}
            required
          />
        </div>

        {/* Monto */}
        <div>
          <label className="label">Monto *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input w-full pl-7"
              value={form.monto}
              onChange={e => set('monto', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="label">Fecha *</label>
          <input type="date" className="input w-full" value={form.fecha} onChange={e => set('fecha', e.target.value)} required />
        </div>

        {/* Comprobante */}
        <div>
          <label className="label">N° Comprobante</label>
          <input
            className="input w-full"
            placeholder="ej: FAC-0001-00000123"
            value={form.comprobante}
            onChange={e => set('comprobante', e.target.value)}
          />
        </div>

      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Guardando...' : 'Registrar movimiento'}
        </button>
      </div>
    </form>
  )
}
