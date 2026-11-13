# Publicar MINTLY en Vercel

## GitHub

Repositorio: https://github.com/gabrielp-ut/Mintly

Subir el código fuente con .gitignore y vercel.json. No subir .env.local, node_modules o dist.

## Vercel

1. Importar gabrielp-ut/Mintly en https://vercel.com/new y seleccionar Vite.
2. Configurar las variables de Production con los valores de .env.local:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
3. Build: npm run build. Output: dist. Install: npm ci.
4. Publicar y guardar la URL HTTPS asignada. No hace falta mantener la computadora encendida.
5. Cada actualización enviada a main podrá generar un despliegue nuevo.

Las variables VITE_ son públicas en el navegador. Usar únicamente la publishable key; nunca service_role ni claves secretas del servidor.

## Supabase

1. Aplicar supabase/schema.sql si falta aplicar su versión actual.
2. En Authentication → URL Configuration, poner la URL HTTPS de producción en Site URL y permitir esa dirección en Redirect URLs. Conservar localhost para desarrollo si se necesita.
3. Probar registro y confirmación de correo desde la URL pública.
4. Probar login, crear/editar/eliminar un movimiento y recargar.
5. Abrir la misma cuenta en un teléfono y comprobar los datos.
6. Usar otra cuenta y comprobar que no ve datos de la primera.
7. Abrir /expenses, /savings y /settings directamente y recargar para comprobar las rutas SPA.

La comprobación de build no verifica RLS ni el esquema de la base remota. La disponibilidad y límites dependen de los planes elegidos en Vercel y Supabase.
