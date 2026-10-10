# Aurora Femme — tienda propia

Sitio estático de [aurorafemme.co](https://aurorafemme.co), migrado desde Shopify. Sin servidor, sin mensualidad: se publica gratis con GitHub Pages.

## Cómo funciona la compra
1. La clienta arma su bolsa (se guarda en su navegador).
2. Llena sus datos de envío y toca **Enviar pedido por WhatsApp**.
3. Se abre WhatsApp con el pedido completo, listo para el +57 312 752 7565.
4. Confirmas el pago (Nequi, Daviplata, transferencia o contraentrega) y despachas.

## Estructura
```
index.html        Inicio
tienda.html       Catálogo con filtros (?c=hilos-graduables | panties-invisibles)
producto.html     Ficha de producto (?p=<handle>)
nosotras.html     Historia de la marca
politicas.html    Envíos, cambios, privacidad y términos
assets/js/data.js Catálogo: productos, precios, colores y datos de contacto  ← aquí editas
assets/js/app.js  Carrito, pedido por WhatsApp, calculadora de tallas
assets/css/styles.css  Estilos (sistema de marca v1.0)
scripts/descargar-imagenes.sh  Baja las fotos de Shopify a assets/img
```

## Tareas frecuentes
- **Cambiar un precio o agregar un producto:** edita `assets/js/data.js`. Pon la foto en `assets/img/productos/`.
- **Costo de envío:** `costoEnvio` en `assets/js/data.js`.
- **Ver el sitio en tu Mac:** `python3 -m http.server 8000` dentro de la carpeta y abre http://localhost:8000

## Antes de cancelar Shopify
Ejecuta `bash scripts/descargar-imagenes.sh` para bajar las fotos. Mientras no lo hagas, el sitio las toma del CDN de Shopify, que deja de funcionar cuando cierres la tienda.

## Publicar con tu dominio
1. GitHub → Settings → Pages → Branch `main`, carpeta `/ (root)`.
2. En Custom domain escribe `aurorafemme.co` (se crea el archivo `CNAME`).
3. En tu proveedor de dominio, apunta los registros A a 185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153, y un CNAME `www` → `darko6324.github.io`.
4. Activa **Enforce HTTPS**.
