export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const MovimientoSchema = z.object({
  concepto: z.string().min(1),
  tipo: z.enum(['INGRESO', 'GASTO']),
  monto: z.number().positive(),
  fecha: z.string(),
  comprobante: z.string().optional(),
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
    take: 100,
  })

  const ingresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((a, m) => a + Number(m.monto), 0)
  const gastos = movimientos.filter(m => m.tipo === 'GASTO').reduce((a, m) => a + Number(m.monto), 0)

  return NextResponse.json({ movimientos, resumen: { ingresos, gastos, resultado: ingresos - gastos } })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = MovimientoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const { fecha, ...rest } = parsed.data
  const mov = await prisma.movimiento.create({ data: { ...rest, fecha: new Date(fecha) } })
  return NextResponse.json(mov, { status: 201 })
}
