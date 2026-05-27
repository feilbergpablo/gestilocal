import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const EmpleadoSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  dni: z.string().min(7),
  cuil: z.string().min(1),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  fechaNacimiento: z.string().optional(),
  fechaIngreso: z.string(),
  cargo: z.string().optional(),
  sueldo: z.number().optional(),
  vencimientoDni: z.string().optional(),
  vencimientoCarnet: z.string().optional(),
  observaciones: z.string().optional(),
  localId: z.string(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const user = session.user as any
  const { searchParams } = new URL(req.url)
  const localId = searchParams.get('localId')

  const where: any = { activo: true }
  if (user.rol !== 'ADMIN') where.localId = user.localId
  else if (localId) where.localId = localId

  const empleados = await prisma.empleado.findMany({
    where,
    include: { local: { select: { nombre: true } } },
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
  })
  return NextResponse.json(empleados)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = EmpleadoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data
  const empleado = await prisma.empleado.create({
    data: {
      ...data,
      email: data.email || null,
      fechaIngreso: new Date(data.fechaIngreso),
      fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
      vencimientoDni: data.vencimientoDni ? new Date(data.vencimientoDni) : null,
      vencimientoCarnet: data.vencimientoCarnet ? new Date(data.vencimientoCarnet) : null,
    },
  })
  return NextResponse.json(empleado, { status: 201 })
}
