'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Local { id: string; nombre: string }
interface Props {
  locales: Local[]
  empleado?: any // si viene, es edición
}

export function EmpleadoForm({ locales, empleado }: Props) {
  const router = useRouter()
  const esEdicion = !!empleado

  const fmt = (d: any) => d ? new Date(d).toISOString().split('T')[0] : ''

  const [form, setForm] = useState({
    nombre: empleado?.nombre ?? '',
    apellido: empleado?.apellido ?? '',
    dni: empleado?.dni ?? '',
    cuil: empleado?.cuil ?? '',
    telefono: empleado?.telefono ?? '',
    email: empleado?.email ?? '',
    fechaNacimiento: fmt(empleado?.fechaNacimiento),
    fechaIngreso: fmt(empleado?.fechaIngreso) || new Date().toISOString().split('T')[0],
    cargo: empleado?.cargo ?? '',
    sueldo: empleado?.sueldo ?? '',
    vencimientoDni: fmt(empleado?.vencimientoDni),
    vencimientoCarnet: fmt(empleado?.vencimientoCarnet),
    observaciones: empleado?.observaciones ?? '',
    localId: empleado?.localId ?? locales[0]?.id ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/empleados', {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(esEdicion ? { id: empleado.id, ...form } : form),
    })

    if (res.ok) {
      router.push('/empleados')
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
        <select
          value={form.localId}
          onChange={e => set('localId', e.target.value)}
          className="input w-full"
          required
        >
          {locales.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
      </div>

      {/* Datos personales */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Datos personales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Apellido *</label>
            <input className="input w-full" value={form.apellido} onChange={e => set('apellido', e.target.value)} required />
          </div>
          <div>
            <label className="label">Nombre *</label>
            <input className="input w-full" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
          </div>
          <div>
            <label className="label">DNI *</label>
            <input className="input w-full" value={form.dni} onChange={e => set('dni', e.target.value)} required />
          </div>
          <div>
            <label className="label">CUIL *</label>
            <input className="input w-full" placeholder="20-12345678-9" value={form.cuil} onChange={e => set('cuil', e.target.value)} required />
          </div>
          <div>
            <label className="label">Fecha de nacimiento</label>
            <input type="date" className="input w-full" value={form.fechaNacimiento} onChange={e => set('fechaNacimiento', e.target.value)} />
          </div>
          <div>
            <label className="label">Vencimiento DNI</label>
            <input type="date" className="input w-full" value={form.vencimientoDni} onChange={e => set('vencimientoDni', e.target.value)} />
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
        </div>
      </div>

      {/* Datos laborales */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Datos laborales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Cargo</label>
            <input className="input w-full" placeholder="ej: Vendedor, Encargado..." value={form.cargo} onChange={e => set('cargo', e.target.value)} />
          </div>
          <div>
            <label className="label">Sueldo</label>
            <input type="number" step="0.01" className="input w-full" value={form.sueldo} onChange={e => set('sueldo', e.target.value)} />
          </div>
          <div>
            <label className="label">Fecha de ingreso *</label>
            <input type="date" className="input w-full" value={form.fechaIngreso} onChange={e => set('fechaIngreso', e.target.value)} required />
          </div>
          <div>
            <label className="label">Vencimiento carnet</label>
            <input type="date" className="input w-full" value={form.vencimientoCarnet} onChange={e => set('vencimientoCarnet', e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Observaciones</label>
          <textarea className="input w-full h-20 resize-none" value={form.observaciones} onChange={e => set('observaciones', e.target.value)} />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear empleado'}
        </button>
      </div>
    </form>
  )
}
