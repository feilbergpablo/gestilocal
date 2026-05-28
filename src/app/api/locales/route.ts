export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const user = session.user as any

  const where = user.rol === 'ADMIN' ? {} : { id: user.localId }

  const locales = await prisma.local.findMany({
    where: { ...where, activo: true },
    include: {
      _count: { select: { empleados: true, productos: true, proveedores: true } },
    },
    orderBy: { nombre: 'asc' },
  })
  return NextResponse.json(locales)
}
