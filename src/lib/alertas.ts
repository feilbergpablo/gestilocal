import { prisma } from './prisma'
import { addDays, isBefore } from 'date-fns'

export async function getAlertas() {
  const hoy = new Date()
  const en15dias = addDays(hoy, 15)
  const alertas: { tipo: string; titulo: string; descripcion: string; nivel: 'danger' | 'warning'; localNombre: string }[] = []

  const productosStockBajo = await prisma.producto.findMany({
    where: { activo: true, stock: { lte: prisma.producto.fields.stockMinimo } },
    include: { local: true },
  })
  for (const p of productosStockBajo) {
    if (p.stock <= p.stockMinimo) {
      alertas.push({ tipo: 'stock', titulo: `Stock bajo — ${p.nombre}`, descripcion: `Quedan ${p.stock} unidades. Mínimo: ${p.stockMinimo}.`, nivel: p.stock === 0 ? 'danger' : 'warning', localNombre: p.local.nombre })
    }
  }

  const empleados = await prisma.empleado.findMany({
    where: { activo: true, vencimientoDni: { lte: en15dias } },
    include: { local: true },
  })
  for (const e of empleados) {
    if (e.vencimientoDni) {
      const vencido = isBefore(e.vencimientoDni, hoy)
      alertas.push({ tipo: 'documento', titulo: `DNI ${vencido ? 'vencido' : 'por vencer'} — ${e.nombre} ${e.apellido}`, descripcion: `Vencimiento: ${e.vencimientoDni.toLocaleDateString('es-AR')}`, nivel: vencido ? 'danger' : 'warning', localNombre: e.local.nombre })
    }
  }

  const pagos = await prisma.localProveedor.findMany({
    where: { montoPendiente: { gt: 0 }, proximoPago: { lte: en15dias } },
    include: { proveedor: true, local: true },
  })
  for (const lp of pagos) {
    if (lp.proximoPago && lp.montoPendiente) {
      const vencido = isBefore(lp.proximoPago, hoy)
      const diasRestantes = Math.ceil((lp.proximoPago.getTime() - hoy.getTime()) / 86400000)
      alertas.push({ tipo: 'pago', titulo: `Pago pendiente — ${lp.proveedor.razonSocial}`, descripcion: `${vencido ? 'Venció' : `Vence en ${diasRestantes} días`}. Monto: $${Number(lp.montoPendiente).toLocaleString('es-AR')}.`, nivel: vencido ? 'danger' : 'warning', localNombre: lp.local.nombre })
    }
  }

  return alertas
}
