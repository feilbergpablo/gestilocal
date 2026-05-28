export const dynamic = "force-dynamic"
import { getAlertas } from '@/lib/alertas'
import { AlertTriangle, Package, FileWarning, CreditCard } from 'lucide-react'
import { clsx } from 'clsx'

const iconMap: Record<string, any> = { stock: Package, documento: FileWarning, pago: CreditCard }

export default async function AlertasPage() {
  const alertas = await getAlertas()
  const danger = alertas.filter(a => a.nivel === 'danger')
  const warning = alertas.filter(a => a.nivel === 'warning')

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Alertas</h1>
        <p className="text-sm text-gray-400 mt-0.5">{alertas.length} alerta{alertas.length !== 1 ? 's' : ''} activa{alertas.length !== 1 ? 's' : ''}</p>
      </div>

      {alertas.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">✓</div>
          <div className="font-medium text-gray-700">Todo en orden</div>
          <div className="text-sm text-gray-400 mt-1">No hay alertas activas</div>
        </div>
      )}

      {danger.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Urgentes</h2>
          <div className="card divide-y divide-gray-50">
            {danger.map((a, i) => {
              const Icon = iconMap[a.tipo] ?? AlertTriangle
              return (
                <div key={i} className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{a.titulo}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{a.descripcion}</div>
                    <span className="badge badge-gray mt-1">{a.localNombre}</span>
                  </div>
                  <span className="badge badge-red flex-shrink-0">Urgente</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {warning.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Atención</h2>
          <div className="card divide-y divide-gray-50">
            {warning.map((a, i) => {
              const Icon = iconMap[a.tipo] ?? AlertTriangle
              return (
                <div key={i} className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{a.titulo}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{a.descripcion}</div>
                    <span className="badge badge-gray mt-1">{a.localNombre}</span>
                  </div>
                  <span className="badge badge-amber flex-shrink-0">Atención</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
