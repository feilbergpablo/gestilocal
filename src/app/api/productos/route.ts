export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ProductoSchema = z.object({
  nombre: z.string().min(1),
  sku: z.string().optional(),
  categoria: z.string().optional(),
  precioCompra: z.number().optional(),
  precioVenta: z.number().optional(),
  stock: z.number().int().default(0),
  stockMinimo: z.number().int().default(5),
  unidad: z.string().optional(),
  localId: z.string(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const user = session.user as any
  const { searchParams } = new URL(req.url)
  const localId = searchParams.get('localId')
  const bajosDeStock = searchParams.get('bajosDeStock') === '1'

  const where: any = { activo: true }
  if (user.rol !== 'ADMIN') where.localId = user.localId
  else if (localId) where.localId = localId

  const productos = await prisma.producto.findMany({
    where,
    include: { local: { select: { nombre: true } } },
    orderBy: { nombre: 'asc' },
  })

  const result = bajosDeStock ? productos.filter(p => p.stock <= p.stockMinimo) : productos
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = ProductoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const producto = await prisma.producto.create({ data: parsed.data })
  return NextResponse.json(producto, { status: 201 })
}
