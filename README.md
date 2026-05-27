# GestiLocal — Sistema de gestión multi-local

App web de gestión para 5 locales en Av. de Mayo.
**Stack:** Next.js 14 · TypeScript · Prisma · PostgreSQL (Supabase) · NextAuth · Tailwind CSS

---

## Instalación paso a paso

### 1. Instalá Node.js
Descargá Node.js desde https://nodejs.org (versión 18 o superior).

### 2. Creá la base de datos gratuita en Supabase
1. Entrá a https://supabase.com y creá una cuenta gratis
2. Creá un nuevo proyecto (guardá la contraseña)
3. Andá a **Project Settings → Database**
4. Copiá la **Connection string** (URI) — tiene este formato:
   `postgresql://postgres:[TU-PASSWORD]@db.xxxx.supabase.co:5432/postgres`

### 3. Configurá las variables de entorno
Abrí el archivo `.env.local` y reemplazá los valores:

```
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxx.supabase.co:5432/postgres"
NEXTAUTH_SECRET="cualquier-string-largo-y-aleatorio-aca"
NEXTAUTH_URL="http://localhost:3000"
```

Para generar un NEXTAUTH_SECRET aleatorio, podés usar:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Instalá dependencias
Abrí una terminal en la carpeta del proyecto y ejecutá:
```bash
npm install
```

### 5. Creá las tablas en la base de datos
```bash
npm run db:push
```

### 6. Cargá los datos de prueba
```bash
npm run db:seed
```

Esto crea:
- 5 locales (RYGO, Insucom 2, Insucom, La Oveja Negra, Depósito)
- 23 empleados con datos completos
- 18 proveedores
- +340 productos
- Movimientos contables de ejemplo
- Alertas activas para probar

### 7. Levantá la app
```bash
npm run dev
```

Abrí http://localhost:3000 en tu navegador.

---

## Usuarios de prueba

| Email | Contraseña | Acceso |
|-------|-----------|--------|
| admin@gestilocal.com | admin1234 | Todo (admin general) |
| gerente.rygo@gestilocal.com | gerente1234 | Solo RYGO |
| gerente.oveja@gestilocal.com | gerente1234 | Solo La Oveja Negra |

---

## Deploy en producción (Vercel — gratis)

1. Subí el proyecto a GitHub
2. Entrá a https://vercel.com y conectá tu repo
3. Agregá las variables de entorno en el panel de Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → la URL que te da Vercel (ej: https://gestilocal.vercel.app)
4. Vercel despliega automáticamente con cada push

---

## Estructura del proyecto

```
src/
  app/
    (app)/          ← páginas protegidas (requieren login)
      page.tsx      ← dashboard
      alertas/      ← panel de alertas
      locales/      ← lista y detalle por local
      empleados/    ← vista global
      productos/    ← vista global
      proveedores/  ← vista global
    api/            ← endpoints REST
    login/          ← página de login
  components/
    layout/         ← sidebar, topbar
  lib/
    prisma.ts       ← cliente de base de datos
    auth.ts         ← configuración NextAuth
    alertas.ts      ← lógica de alertas automáticas
prisma/
  schema.prisma     ← modelos de base de datos
  seed.ts           ← datos de prueba
```

---

## Próximos pasos (Fase 5)
- Alta de empleados/productos/proveedores desde la UI (formularios)
- Exportar contabilidad a PDF/Excel
- Notificaciones por email
- Módulo de órdenes de compra
```
