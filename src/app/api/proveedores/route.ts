export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ProveedorSchema = z.object({
  razonSocial: z.string().min(1),
  cuit: z.string().min(1),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  condicionIva: z.string().optional(),
  banco: z.string().optional(),
  cbu: z.string().optional(),
  observaciones: z.string().optional(),
  localId: z.string(),
  proximoPago: z.string().optional(),
  montoPendiente: z.number().optional(),
  diasCredito: z.number().int().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const user = session.user as any
  const { searchParams } = new URL(req.url)
  const localId = searchParams.get('localId')

  const where: any = { activo: true }
  if (user.rol !== 'ADMIN') {
    where.locales = { some: { localId: user.localId } }
  } else if (localId) {
    where.locales = { some: { localId } }
  }

  const proveedores = await prisma.proveedor.findMany({
    where,
    include: { locales: { include: { local: { select: { nombre: true } } } } },
    orderBy: { razonSocial: 'asc' },
  })
  return NextResponse.json(proveedores)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = ProveedorSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { localId, proximoPago, montoPendiente, diasCredito, email, ...rest } = parsed.data
  const proveedor = await prisma.proveedor.create({
    data: {
      ...rest,
      email: email || null,
      locales: {
        create: { localId, proximoPago: proximoPago ? new Date(proximoPago) : null, montoPendiente: montoPendiente ?? 0, diasCredito },
      },
    },
  })
  return NextResponse.json(proveedor, { status: 201 })
}
