# Aurora Femme — tienda propia

Sitio estático de [aurorafemme.co](https://aurorafemme.co), migrado desde Shopify. Sin servidor, sin mensualidad: se publica gratis con GitHub Pages.

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
diario.html       Diario Aurora (blog)
articulo.html     Nota del diario (?a=<slug>)
politicas.html    Envíos, cambios, privacidad y términos
assets/js/data.js Fotos de la portada, colores, diario, reseñas y contacto
assets/js/app.js  Cabecera, pie, portada, calculadora de tallas y diario
assets/css/styles.css  Estilos (sistema de marca v1.0)
scripts/descargar-imagenes.sh  Baja las fotos de Shopify a assets/img
```

## Tareas frecuentes
- **Productos, precios y stock:** en la plataforma de inventario. Se reflejan solos en el catálogo.
- **Fotos de la portada (hero y destacados):** `assets/js/data.js`.
- **Publicar una nota en el diario:** agrega un bloque al inicio de `DIARIO` en `assets/js/data.js`.
- **Agregar reseñas:** solo reales y con permiso de la clienta, en `RESENAS` dentro de `assets/js/data.js`. La sección aparece sola cuando hay al menos una.
- **Ver el sitio en tu Mac:** `python3 -m http.server 8000` dentro de la carpeta y abre http://localhost:8000

## Antes de cancelar Shopify
Ejecuta `bash scripts/descargar-imagenes.sh` para bajar las fotos. Mientras no lo hagas, el sitio las toma del CDN de Shopify, que deja de funcionar cuando cierres la tienda.

## Publicar con tu dominio
1. GitHub → Settings → Pages → Branch `main`, carpeta `/ (root)`.
2. En Custom domain escribe `aurorafemme.co` (se crea el archivo `CNAME`).
3. En tu proveedor de dominio, apunta los registros A a 185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153, y un CNAME `www` → `darko6324.github.io`.
4. Activa **Enforce HTTPS**.
