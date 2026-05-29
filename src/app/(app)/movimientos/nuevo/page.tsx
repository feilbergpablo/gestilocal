import { prisma } from '@/lib/prisma'
import { MovimientoForm } from '@/components/forms/MovimientoForm'

export default async function NuevoMovimientoPage() {
  const locales = await prisma.local.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Nuevo movimiento</h1>
        <p className="text-sm text-gray-400 mt-0.5">Registrá un ingreso o gasto</p>
      </div>
      <MovimientoForm locales={locales} />
    </div>
  )
}
