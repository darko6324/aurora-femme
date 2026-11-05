# Aurora Femme — tienda propia

Sitio estático de [aurorafemme.co](https://aurorafemme.co). Sin servidor, sin mensualidad: se publica gratis con GitHub Pages.

## Cómo funciona la compra
El catálogo, la bolsa y el pedido por WhatsApp vienen de la plataforma de inventario,
embebida como iframe en `tienda.html` (https://pedidos.laempanadaguerrera.com/c/AURORA).
Productos, fotos, precios y stock se administran allá; este sitio no los duplica.

## Estructura
```
index.html        Inicio
tienda.html       Catálogo: iframe de la plataforma de inventario
producto.html     Redirige a tienda.html (enlaces antiguos)
nosotras.html     Historia de la marca
diario.html       Redirige a /diario/ (dirección anterior)
articulo.html     Redirige a /diario/<tema>/ (dirección anterior)
politicas.html    Envíos, cambios, privacidad y términos
assets/js/data.js Contacto, colecciones y piezas de la portada, diario y reseñas
assets/js/app.js  Cabecera, pie, portada, calculadora de tallas y diario
assets/css/styles.css  Estilos (sistema de marca v1.0)
scripts/catalogo.mjs  Fichas, categorías, diario, 404, sitemap y feed (en cada deploy)
scripts/instagram.mjs Últimas publicaciones de Instagram (en cada deploy)
```

## Tareas frecuentes
- **Productos, precios y stock:** en la plataforma de inventario. Se reflejan solos en el catálogo.
- **Piezas de la portada (hero y destacados):** `PRODUCTOS` en `assets/js/data.js` (la foto sale sola del catálogo por el código).
- **Publicar una nota en el diario:** agrega un bloque al inicio de `DIARIO` en `assets/js/data.js`.
- **Agregar reseñas:** solo reales y con permiso de la clienta, en `RESENAS` dentro de `assets/js/data.js`. La sección aparece sola cuando hay al menos una.
- **Ver el sitio en tu Mac:** `python3 -m http.server 8000` dentro de la carpeta y abre http://localhost:8000

## Publicar con tu dominio
1. GitHub → Settings → Pages → Branch `main`, carpeta `/ (root)`.
2. En Custom domain escribe `aurorafemme.co` (se crea el archivo `CNAME`).
3. En tu proveedor de dominio, apunta los registros A a 185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153, y un CNAME `www` → `darko6324.github.io`.
4. Activa **Enforce HTTPS**.

## Instagram en la portada
`scripts/instagram.mjs` trae las 6 últimas publicaciones de @aurorafemme.co con la API de Instagram
y deja las fotos (webp 480 px) en `assets/img/instagram/` y los textos en `assets/js/instagram.js`.
Corre en GitHub Actions (`.github/workflows/deploy.yml`) en cada push y todos los días a las 6:15 a. m.
El sitio no carga nada de Instagram al visitarlo: sin cookies de terceros ni scripts externos.

- Token: secreto `IG_TOKEN` del repositorio. Es del usuario del sistema «SitioWebInstagram» del portafolio aurora_lenceria_ (Meta Business Suite → Configuración → Usuarios del sistema), app «Aurora Femme Web», permiso instagram_basic, caducidad: nunca. Para cambiarlo: «Generar token» en ese usuario y reemplazar el secreto.
- Sin token o si la API falla, la sección muestra solo los botones «Seguir en Instagram» y «Ver en TikTok».
- GitHub Pages debe publicar desde **GitHub Actions** (Settings → Pages → Source).

## Catálogo para Google (SEO y Merchant Center)

`scripts/catalogo.mjs` corre en cada deploy y a diario. Lee el catálogo público de la plataforma
(JSON-LD de `/t/AURORA` + `/api/tienda/AURORA/disponibilidad`) y genera:

- Una ficha indexable por producto: `/<categoría>/<producto>/` con precio, tallas, schema Product y
  botón «Agregar a la bolsa» → `tienda.html?producto=CÓDIGO` (abre esa pieza en la tienda embebida).
- Cuatro páginas de categoría pensadas para búsquedas reales: `/tangas-de-encaje/` (antes
  `/hilos-de-encaje/`, que ahora redirige),
  `/panties-invisibles/`, `/panties-de-encaje/`, `/conjuntos-de-lenceria/`.
- `sitemap.xml`, `robots.txt` y `merchant.xml` (feed para Google Merchant Center, una fila por talla).
- `/diario/` y `/diario/<tema>/`: el diario como páginas reales (sale de `DIARIO` en data.js).
- `404.html`: lleva las direcciones viejas (Shopify, `/hilos-de-encaje/`) a la página nueva.
- `data/catalogo.json`: copia de respaldo que el workflow guarda en el repo; si la plataforma no
  responde, se publica con esa copia.

Todo lo generado está en `.gitignore`: no se edita a mano. Los nombres y descripciones salen de la
plataforma (las tildes faltantes se corrigen en el script, en `TILDES`).

Google Search Console: propiedad `https://aurorafemme.co/`, verificada con
`googleb5f2bbafad6520b9.html` (no borrar). Sitemap enviado: `sitemap.xml`.
