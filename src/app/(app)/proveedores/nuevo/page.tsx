import { prisma } from '@/lib/prisma'
import { ProveedorForm } from '@/components/forms/ProveedorForm'

export default async function NuevoProveedorPage() {
  const locales = await prisma.local.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Nuevo proveedor</h1>
        <p className="text-sm text-gray-400 mt-0.5">Completá los datos del proveedor</p>
      </div>
      <ProveedorForm locales={locales} />
    </div>
  )
}
