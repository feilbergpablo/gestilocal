export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const MovimientoSchema = z.object({
  concepto: z.string().min(1),
  tipo: z.enum(['INGRESO', 'GASTO']),
  monto: z.number().positive(),
  comprobante: z.string().optional(),
  fecha: z.string(),
  localId: z.string(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const user = session.user as any
  const { searchParams } = new URL(req.url)
  const localId = searchParams.get('localId')

  const where: any = {}
  if (user.rol !== 'ADMIN') where.localId = user.localId
  else if (localId) where.localId = localId

  const movimientos = await prisma.movimiento.findMany({
    where,
    include: { local: { select: { nombre: true } } },
    orderBy: { fecha: 'desc' },
  })
  return NextResponse.json(movimientos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = MovimientoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const movimiento = await prisma.movimiento.create({
    data: {
      ...parsed.data,
      fecha: new Date(parsed.data.fecha),
      comprobante: parsed.data.comprobante || null,
    },
  })
  return NextResponse.json(movimiento, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  await prisma.movimiento.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}