import { PrismaClient, Rol, TipoMovimiento } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Limpiando base de datos...')
  await prisma.movimiento.deleteMany()
  await prisma.localProveedor.deleteMany()
  await prisma.producto.deleteMany()
  await prisma.empleado.deleteMany()
  await prisma.proveedor.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.local.deleteMany()

  console.log('Creando locales...')
  const locales = await Promise.all([
    prisma.local.create({ data: { nombre: 'RYGO', tipo: 'Librería y arte', direccion: 'Av. de Mayo 825', telefono: '11-4444-1111', web: 'https://rygo.com.ar' } }),
    prisma.local.create({ data: { nombre: 'Insucom 2', tipo: 'Tecnología', direccion: 'Av. de Mayo 831', telefono: '11-4444-2222', web: 'https://insucom2.com.ar' } }),
    prisma.local.create({ data: { nombre: 'Insucom', tipo: 'Librería y artículos de oficina', direccion: 'Av. de Mayo 829', telefono: '11-4444-3333', web: 'https://insucom.com.ar' } }),
    prisma.local.create({ data: { nombre: 'La Oveja Negra', tipo: 'Almacén y fiambrería', direccion: 'Av. de Mayo 819', telefono: '11-4444-4444' } }),
    prisma.local.create({ data: { nombre: 'Depósito', tipo: 'Depósito central', direccion: 'Av. de Mayo 833', telefono: '11-4444-5555' } }),
  ])
  const [rygo, insucom2, insucom, oveja, deposito] = locales

  console.log('Creando usuarios...')
  const passHash = await bcrypt.hash('admin1234', 10)
  const gerenteHash = await bcrypt.hash('gerente1234', 10)
  await prisma.usuario.create({ data: { nombre: 'Dueño Admin', email: 'admin@gestilocal.com', password: passHash, rol: Rol.ADMIN } })
  await prisma.usuario.create({ data: { nombre: 'Gerente RYGO', email: 'gerente.rygo@gestilocal.com', password: gerenteHash, rol: Rol.GERENTE, localId: rygo.id } })
  await prisma.usuario.create({ data: { nombre: 'Gerente La Oveja', email: 'gerente.oveja@gestilocal.com', password: gerenteHash, rol: Rol.GERENTE, localId: oveja.id } })

  console.log('Creando empleados...')
  const hoy = new Date()
  const venc = (dias: number) => new Date(hoy.getTime() + dias * 86400000)
  await Promise.all([
    prisma.empleado.create({ data: { nombre: 'Martina', apellido: 'García', dni: '32445120', cuil: '27-32445120-4', telefono: '11-5544-3321', email: 'mgarcia@rygo.com', fechaIngreso: new Date('2021-03-15'), cargo: 'Vendedora', sueldo: 280000, vencimientoDni: venc(400), localId: rygo.id } }),
    prisma.empleado.create({ data: { nombre: 'Roberto', apellido: 'Paz', dni: '36112004', cuil: '20-36112004-1', telefono: '11-3322-7788', email: 'rpaz@rygo.com', fechaIngreso: new Date('2020-07-01'), cargo: 'Encargado', sueldo: 350000, vencimientoDni: venc(200), localId: rygo.id } }),
    prisma.empleado.create({ data: { nombre: 'Sofía', apellido: 'Luna', dni: '40330221', cuil: '27-40330221-3', telefono: '11-9900-5544', fechaIngreso: new Date('2023-04-10'), cargo: 'Asistente', sueldo: 240000, vencimientoDni: venc(300), localId: rygo.id } }),
    prisma.empleado.create({ data: { nombre: 'Diego', apellido: 'Torres', dni: '28990114', cuil: '20-28990114-7', telefono: '11-4411-6600', fechaIngreso: new Date('2018-01-08'), cargo: 'Repositor', sueldo: 260000, vencimientoDni: venc(500), localId: rygo.id } }),
    prisma.empleado.create({ data: { nombre: 'Nadia', apellido: 'Vega', dni: '43001887', cuil: '27-43001887-9', telefono: '11-7700-3322', fechaIngreso: new Date('2024-11-01'), cargo: 'Cajera', sueldo: 230000, vencimientoDni: venc(600), localId: rygo.id } }),
    prisma.empleado.create({ data: { nombre: 'Lucas', apellido: 'Rodríguez', dni: '38112887', cuil: '20-38112887-1', telefono: '11-4422-9900', email: 'lrodriguez@insucom2.com', fechaIngreso: new Date('2022-06-20'), cargo: 'Técnico', sueldo: 320000, vencimientoDni: venc(350), localId: insucom2.id } }),
    prisma.empleado.create({ data: { nombre: 'Paula', apellido: 'Morales', dni: '36554003', cuil: '27-36554003-5', telefono: '11-5533-2211', fechaIngreso: new Date('2021-03-01'), cargo: 'Vendedora', sueldo: 290000, vencimientoDni: venc(280), localId: insucom2.id } }),
    prisma.empleado.create({ data: { nombre: 'Gonzalo', apellido: 'Testa', dni: '42110556', cuil: '20-42110556-8', telefono: '11-8800-4433', fechaIngreso: new Date('2023-09-15'), cargo: 'Técnico junior', sueldo: 260000, vencimientoDni: venc(400), localId: insucom2.id } }),
    prisma.empleado.create({ data: { nombre: 'Irina', apellido: 'Acosta', dni: '39887220', cuil: '27-39887220-2', telefono: '11-3344-8877', fechaIngreso: new Date('2022-01-10'), cargo: 'Cajera', sueldo: 250000, vencimientoDni: venc(320), localId: insucom2.id } }),
    prisma.empleado.create({ data: { nombre: 'Javier', apellido: 'Pérez', dni: '41003556', cuil: '20-41003556-9', telefono: '11-2233-8870', fechaIngreso: new Date('2023-09-01'), cargo: 'Vendedor', sueldo: 250000, vencimientoDni: venc(420), localId: insucom.id } }),
    prisma.empleado.create({ data: { nombre: 'Valeria', apellido: 'Ríos', dni: '33445667', cuil: '27-33445667-4', telefono: '11-4455-9988', fechaIngreso: new Date('2017-02-14'), cargo: 'Encargada', sueldo: 380000, vencimientoDni: venc(180), localId: insucom.id } }),
    prisma.empleado.create({ data: { nombre: 'Carlos', apellido: 'Bernal', dni: '37009334', cuil: '20-37009334-6', telefono: '11-6611-4422', fechaIngreso: new Date('2021-10-05'), cargo: 'Repositor', sueldo: 240000, vencimientoDni: venc(250), localId: insucom.id } }),
    prisma.empleado.create({ data: { nombre: 'María', apellido: 'Soria', dni: '44223110', cuil: '27-44223110-1', telefono: '11-7733-2200', fechaIngreso: new Date('2024-03-01'), cargo: 'Asistente', sueldo: 230000, vencimientoDni: venc(500), localId: insucom.id } }),
    prisma.empleado.create({ data: { nombre: 'Federico', apellido: 'Herrera', dni: '39556002', cuil: '20-39556002-3', telefono: '11-8844-5511', fechaIngreso: new Date('2020-08-10'), cargo: 'Vendedor', sueldo: 270000, vencimientoDni: venc(300), localId: insucom.id } }),
    prisma.empleado.create({ data: { nombre: 'Tamara', apellido: 'Ortiz', dni: '35880114', cuil: '27-35880114-7', telefono: '11-2299-7733', fechaIngreso: new Date('2019-12-01'), cargo: 'Cajera', sueldo: 280000, vencimientoDni: venc(60), localId: insucom.id } }),
    prisma.empleado.create({ data: { nombre: 'Carla', apellido: 'Méndez', dni: '29887441', cuil: '27-29887441-6', telefono: '11-6677-1234', fechaIngreso: new Date('2019-01-14'), cargo: 'Encargada', sueldo: 370000, vencimientoDni: venc(-20), localId: oveja.id } }),
    prisma.empleado.create({ data: { nombre: 'Bruno', apellido: 'Quiroga', dni: '36220889', cuil: '20-36220889-5', telefono: '11-5500-7766', fechaIngreso: new Date('2020-03-16'), cargo: 'Carnicero', sueldo: 310000, vencimientoDni: venc(390), localId: oveja.id } }),
    prisma.empleado.create({ data: { nombre: 'Laura', apellido: 'Suárez', dni: '40110334', cuil: '27-40110334-8', telefono: '11-3322-6655', fechaIngreso: new Date('2022-06-01'), cargo: 'Cajera', sueldo: 250000, vencimientoDni: venc(280), localId: oveja.id } }),
    prisma.empleado.create({ data: { nombre: 'Eduardo', apellido: 'Acuña', dni: '34556002', cuil: '20-34556002-4', telefono: '11-8811-4400', fechaIngreso: new Date('2017-11-20'), cargo: 'Repositor', sueldo: 270000, vencimientoDni: venc(450), localId: oveja.id } }),
    prisma.empleado.create({ data: { nombre: 'Patricia', apellido: 'Díaz', dni: '38003445', cuil: '27-38003445-2', telefono: '11-9922-3311', fechaIngreso: new Date('2021-05-10'), cargo: 'Asistente', sueldo: 240000, vencimientoDni: venc(310), localId: oveja.id } }),
    prisma.empleado.create({ data: { nombre: 'Ana', apellido: 'Fernández', dni: '35220764', cuil: '27-35220764-3', telefono: '11-7788-5544', fechaIngreso: new Date('2020-02-01'), cargo: 'Responsable depósito', sueldo: 340000, vencimientoDni: venc(420), localId: deposito.id } }),
    prisma.empleado.create({ data: { nombre: 'Hernán', apellido: 'Ruiz', dni: '37445002', cuil: '20-37445002-6', telefono: '11-6644-3311', fechaIngreso: new Date('2021-06-14'), cargo: 'Depósito', sueldo: 260000, vencimientoDni: venc(360), localId: deposito.id } }),
    prisma.empleado.create({ data: { nombre: 'Claudia', apellido: 'Ortega', dni: '42110778', cuil: '27-42110778-5', telefono: '11-5533-9900', fechaIngreso: new Date('2023-03-20'), cargo: 'Depósito', sueldo: 240000, vencimientoDni: venc(500), localId: deposito.id } }),
  ])

  console.log('Creando proveedores...')
  const [papelera, distribNorte, tecnoinsumos, frigorifico, arteycolor, distTech, maxioficina, distBebidas] = await Promise.all([
    prisma.proveedor.create({ data: { razonSocial: 'Papelera del Sur', cuit: '30-55443322-1', telefono: '11-4455-7788', email: 'ventas@papeleradelsur.com', condicionIva: 'Responsable Inscripto' } }),
    prisma.proveedor.create({ data: { razonSocial: 'Distribuidora Norte', cuit: '30-66778899-5', telefono: '11-3344-2211', email: 'admin@distnorte.com', condicionIva: 'Responsable Inscripto' } }),
    prisma.proveedor.create({ data: { razonSocial: 'TecnoInsumos SA', cuit: '30-44332211-8', telefono: '11-5566-3300', email: 'ventas@tecnoinsumos.com', condicionIva: 'Responsable Inscripto' } }),
    prisma.proveedor.create({ data: { razonSocial: 'Frigorífico Central', cuit: '30-77889900-3', telefono: '11-8899-1122', email: 'pedidos@frigorifico.com', condicionIva: 'Responsable Inscripto' } }),
    prisma.proveedor.create({ data: { razonSocial: 'Arte y Color SA', cuit: '30-11223344-7', telefono: '11-5511-2233', email: 'ventas@arteycolor.com', condicionIva: 'Responsable Inscripto' } }),
    prisma.proveedor.create({ data: { razonSocial: 'Distribuidora Tech', cuit: '30-22334455-9', telefono: '11-7722-4411', email: 'pedidos@disttech.com', condicionIva: 'Responsable Inscripto' } }),
    prisma.proveedor.create({ data: { razonSocial: 'Maxioficina SRL', cuit: '30-33445566-2', telefono: '11-2211-5566', email: 'ventas@maxioficina.com', condicionIva: 'Responsable Inscripto' } }),
    prisma.proveedor.create({ data: { razonSocial: 'Distribuidora Bebidas', cuit: '30-44556677-4', telefono: '11-3300-8855', email: 'pedidos@distbebidas.com', condicionIva: 'Responsable Inscripto' } }),
  ])

  const proxPago = (dias: number) => new Date(hoy.getTime() + dias * 86400000)
  await Promise.all([
    prisma.localProveedor.create({ data: { localId: rygo.id, proveedorId: distribNorte.id, proximoPago: proxPago(3), montoPendiente: 45000, diasCredito: 30 } }),
    prisma.localProveedor.create({ data: { localId: rygo.id, proveedorId: arteycolor.id, proximoPago: proxPago(20), montoPendiente: 0, diasCredito: 30 } }),
    prisma.localProveedor.create({ data: { localId: insucom2.id, proveedorId: tecnoinsumos.id, proximoPago: proxPago(7), montoPendiente: 128000, diasCredito: 30 } }),
    prisma.localProveedor.create({ data: { localId: insucom2.id, proveedorId: distTech.id, proximoPago: proxPago(25), montoPendiente: 0, diasCredito: 30 } }),
    prisma.localProveedor.create({ data: { localId: insucom.id, proveedorId: papelera.id, proximoPago: proxPago(30), montoPendiente: 0, diasCredito: 30 } }),
    prisma.localProveedor.create({ data: { localId: insucom.id, proveedorId: maxioficina.id, proximoPago: proxPago(15), montoPendiente: 0, diasCredito: 15 } }),
    prisma.localProveedor.create({ data: { localId: oveja.id, proveedorId: frigorifico.id, proximoPago: proxPago(15), montoPendiente: 0, diasCredito: 15 } }),
    prisma.localProveedor.create({ data: { localId: oveja.id, proveedorId: distBebidas.id, proximoPago: proxPago(10), montoPendiente: 0, diasCredito: 10 } }),
  ])

  console.log('Creando productos...')
  await Promise.all([
    prisma.producto.create({ data: { nombre: 'Óleo Titan 20ml azul', sku: 'OT-001', categoria: 'Pintura', precioCompra: 800, precioVenta: 1850, stock: 24, stockMinimo: 5, localId: rygo.id } }),
    prisma.producto.create({ data: { nombre: 'Lienzo 30x40', sku: 'LZ-001', categoria: 'Soporte', precioCompra: 1500, precioVenta: 3200, stock: 18, stockMinimo: 5, localId: rygo.id } }),
    prisma.producto.create({ data: { nombre: 'Pincel redondo N8', sku: 'PC-001', categoria: 'Pincel', precioCompra: 400, precioVenta: 890, stock: 7, stockMinimo: 5, localId: rygo.id } }),
    prisma.producto.create({ data: { nombre: 'Marco madera natural 30x40', sku: 'MR-001', categoria: 'Marco', precioCompra: 2000, precioVenta: 4500, stock: 3, stockMinimo: 5, localId: rygo.id } }),
    prisma.producto.create({ data: { nombre: 'Cuaderno tapa dura A5', sku: 'CD-001', categoria: 'Librería', precioCompra: 900, precioVenta: 2100, stock: 38, stockMinimo: 10, localId: rygo.id } }),
    prisma.producto.create({ data: { nombre: 'Paleta de plástico oval', sku: 'PP-001', categoria: 'Accesorio', precioCompra: 350, precioVenta: 800, stock: 15, stockMinimo: 5, localId: rygo.id } }),
    prisma.producto.create({ data: { nombre: 'Cartucho HP 664 negro', sku: 'HP-664N', categoria: 'Insumos tech', precioCompra: 4500, precioVenta: 8900, stock: 2, stockMinimo: 5, localId: insucom2.id } }),
    prisma.producto.create({ data: { nombre: 'Mouse inalámbrico Logitech', sku: 'LG-MOU', categoria: 'Periférico', precioCompra: 12000, precioVenta: 24500, stock: 11, stockMinimo: 3, localId: insucom2.id } }),
    prisma.producto.create({ data: { nombre: 'Pendrive 32GB Kingston', sku: 'KG-32G', categoria: 'Almacenamiento', precioCompra: 5000, precioVenta: 9800, stock: 15, stockMinimo: 5, localId: insucom2.id } }),
    prisma.producto.create({ data: { nombre: 'Cable HDMI 1.8m', sku: 'CB-HDM', categoria: 'Cable', precioCompra: 2000, precioVenta: 4200, stock: 8, stockMinimo: 3, localId: insucom2.id } }),
    prisma.producto.create({ data: { nombre: 'Teclado USB genérico', sku: 'TC-USB', categoria: 'Periférico', precioCompra: 3500, precioVenta: 7500, stock: 6, stockMinimo: 3, localId: insucom2.id } }),
    prisma.producto.create({ data: { nombre: 'Resma A4 75g', sku: 'RM-A4', categoria: 'Papelería', precioCompra: 2200, precioVenta: 4200, stock: 3, stockMinimo: 10, localId: insucom.id } }),
    prisma.producto.create({ data: { nombre: 'Resaltador Stabilo x4', sku: 'RS-X4', categoria: 'Librería', precioCompra: 900, precioVenta: 1850, stock: 6, stockMinimo: 8, localId: insucom.id } }),
    prisma.producto.create({ data: { nombre: 'Carpeta 3 anillos', sku: 'CP-3A', categoria: 'Archivado', precioCompra: 1400, precioVenta: 2900, stock: 22, stockMinimo: 5, localId: insucom.id } }),
    prisma.producto.create({ data: { nombre: 'Lapicera Bic x10', sku: 'LB-X10', categoria: 'Librería', precioCompra: 600, precioVenta: 1200, stock: 4, stockMinimo: 10, localId: insucom.id } }),
    prisma.producto.create({ data: { nombre: 'Post-it 75x75mm', sku: 'PT-75', categoria: 'Librería', precioCompra: 450, precioVenta: 980, stock: 19, stockMinimo: 5, localId: insucom.id } }),
    prisma.producto.create({ data: { nombre: 'Mortadela por kg', sku: 'MRT-KG', categoria: 'Fiambrería', precioCompra: 1800, precioVenta: 3200, stock: 12, stockMinimo: 3, localId: oveja.id } }),
    prisma.producto.create({ data: { nombre: 'Queso cremoso kg', sku: 'QC-KG', categoria: 'Lácteo', precioCompra: 3200, precioVenta: 5800, stock: 8, stockMinimo: 3, localId: oveja.id } }),
    prisma.producto.create({ data: { nombre: 'Coca-Cola 2.25L', sku: 'CC-225', categoria: 'Bebida', precioCompra: 1200, precioVenta: 2100, stock: 5, stockMinimo: 10, localId: oveja.id } }),
    prisma.producto.create({ data: { nombre: 'Aceite Natura 900ml', sku: 'AN-900', categoria: 'Almacén', precioCompra: 1700, precioVenta: 2900, stock: 3, stockMinimo: 5, localId: oveja.id } }),
    prisma.producto.create({ data: { nombre: 'Yerba Rosamonte 500g', sku: 'YR-500', categoria: 'Almacén', precioCompra: 1100, precioVenta: 1850, stock: 4, stockMinimo: 8, localId: oveja.id } }),
  ])

  console.log('Creando movimientos contables...')
  const makeDate = (diasAtras: number) => new Date(hoy.getTime() - diasAtras * 86400000)
  await Promise.all([
    prisma.movimiento.create({ data: { localId: rygo.id, concepto: 'Venta tarjeta', tipo: TipoMovimiento.INGRESO, monto: 45200, fecha: makeDate(0) } }),
    prisma.movimiento.create({ data: { localId: rygo.id, concepto: 'Compra marcos', tipo: TipoMovimiento.GASTO, monto: 18000, fecha: makeDate(1) } }),
    prisma.movimiento.create({ data: { localId: rygo.id, concepto: 'Venta efectivo', tipo: TipoMovimiento.INGRESO, monto: 32100, fecha: makeDate(2) } }),
    prisma.movimiento.create({ data: { localId: rygo.id, concepto: 'Sueldos mayo', tipo: TipoMovimiento.GASTO, monto: 180000, fecha: makeDate(4) } }),
    prisma.movimiento.create({ data: { localId: rygo.id, concepto: 'Venta mayorista cuadros', tipo: TipoMovimiento.INGRESO, monto: 89000, fecha: makeDate(6) } }),
    prisma.movimiento.create({ data: { localId: insucom2.id, concepto: 'Venta equipos', tipo: TipoMovimiento.INGRESO, monto: 185000, fecha: makeDate(0) } }),
    prisma.movimiento.create({ data: { localId: insucom2.id, concepto: 'Compra stock cartuchos', tipo: TipoMovimiento.GASTO, monto: 320000, fecha: makeDate(1) } }),
    prisma.movimiento.create({ data: { localId: insucom2.id, concepto: 'Servicio técnico', tipo: TipoMovimiento.INGRESO, monto: 45000, fecha: makeDate(3) } }),
    prisma.movimiento.create({ data: { localId: insucom2.id, concepto: 'Sueldos mayo', tipo: TipoMovimiento.GASTO, monto: 220000, fecha: makeDate(4) } }),
    prisma.movimiento.create({ data: { localId: insucom.id, concepto: 'Venta mostrador', tipo: TipoMovimiento.INGRESO, monto: 28400, fecha: makeDate(0) } }),
    prisma.movimiento.create({ data: { localId: insucom.id, concepto: 'Sueldos mayo', tipo: TipoMovimiento.GASTO, monto: 150000, fecha: makeDate(4) } }),
    prisma.movimiento.create({ data: { localId: insucom.id, concepto: 'Venta mayorista papelería', tipo: TipoMovimiento.INGRESO, monto: 62000, fecha: makeDate(2) } }),
    prisma.movimiento.create({ data: { localId: oveja.id, concepto: 'Ventas del día', tipo: TipoMovimiento.INGRESO, monto: 42300, fecha: makeDate(0) } }),
    prisma.movimiento.create({ data: { localId: oveja.id, concepto: 'Compra fiambres', tipo: TipoMovimiento.GASTO, monto: 95000, fecha: makeDate(1) } }),
    prisma.movimiento.create({ data: { localId: oveja.id, concepto: 'Ventas del día', tipo: TipoMovimiento.INGRESO, monto: 38700, fecha: makeDate(2) } }),
    prisma.movimiento.create({ data: { localId: oveja.id, concepto: 'Sueldos mayo', tipo: TipoMovimiento.GASTO, monto: 190000, fecha: makeDate(4) } }),
  ])

  console.log('✅ Seed completado. Usuarios creados:')
  console.log('  admin@gestilocal.com / admin1234 (Admin general)')
  console.log('  gerente.rygo@gestilocal.com / gerente1234 (Gerente RYGO)')
  console.log('  gerente.oveja@gestilocal.com / gerente1234 (Gerente La Oveja Negra)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
