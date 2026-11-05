// Catálogo indexable para Google: páginas de producto y de categoría, sitemap.xml y el feed de
// Google Merchant Center. Corre en GitHub Actions en cada push y una vez al día.
//
// Fuente: la tienda de la plataforma de inventario (pedidos.laempanadaguerrera.com/t/AURORA)
// publica todos los productos en un bloque JSON-LD, y /disponibilidad dice qué tallas hay.
// Si la plataforma no responde, se usa la última copia guardada en data/catalogo.json:
// el deploy nunca falla ni se pierden páginas por eso.
//
//   node scripts/catalogo.mjs
//
// Salida (todo se regenera; no editar a mano):
//   <categoria>/index.html y <categoria>/<producto>/index.html
//   assets/img/catalogo/*.webp|jpg   fotos propias, comprimidas
//   assets/js/catalogo.js            enlaces para la portada
//   sitemap.xml, robots.txt, merchant.xml
//   data/catalogo.json               copia de respaldo de los datos
import { writeFile, readFile, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const SITIO = 'https://aurorafemme.co';
const PLATAFORMA = 'https://pedidos.laempanadaguerrera.com';
const TIENDA = 'AURORA';
const V = '10'; // versión de assets (cache-busting), igual que en el resto del sitio
const WHATSAPP = '573127527565';
const ENVIO_GRATIS = 200000;

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* sin fotos propias: se usan las de la plataforma */ }

/* ------------------------------------------------------------------ */
/* Categorías: URL pensada para las búsquedas reales en Colombia        */
/* ------------------------------------------------------------------ */
const CATEGORIAS = [
  {
    id: 'hilos-de-encaje', prefijos: ['HG'],
    nombre: 'Hilos de encaje', tipo: 'Hilo de encaje',
    h1: 'Hilos y tangas de encaje',
    title: 'Hilos y tangas de encaje con tirantes graduables',
    description: 'Hilos y tangas de encaje con tirantes graduables, talla única de XS a L. Ocho colores. Envío a toda Colombia, gratis desde $200.000.',
    intro: [
      'Tangas de encaje floral y de pestaña con tirantes graduables: los ajustas a tu cadera para que no aprieten ni se bajen en todo el día.',
      'Son talla única y se adaptan de XS a L. Escoge tu color: negro, rojo frambuesa, palo de rosa, uva, arena y más.',
    ],
    google: 'Apparel & Accessories > Clothing > Underwear & Socks > Underwear',
  },
  {
    id: 'panties-invisibles', prefijos: ['PI'],
    nombre: 'Panties invisibles', tipo: 'Panty invisible',
    h1: 'Panties invisibles sin costuras',
    title: 'Panties invisibles sin costuras, corte láser',
    description: 'Panties invisibles sin costuras con corte láser: no se marcan bajo vestidos, leggins ni pantalones. Talla única. Envío a toda Colombia.',
    intro: [
      'Panties sin costuras con corte láser: sin elásticos ni bordes gruesos, así que no se marcan bajo un vestido ajustado, unos leggins o un pantalón claro.',
      'Vienen en tonos piel (champagne, duna, avellana, chocolate) y negro, para que escojas el que desaparece con tu ropa.',
    ],
    google: 'Apparel & Accessories > Clothing > Underwear & Socks > Underwear',
  },
  {
    id: 'panties-de-encaje', prefijos: ['PF'],
    nombre: 'Panties de encaje', tipo: 'Panty de encaje',
    h1: 'Panties de encaje con refuerzo en algodón',
    title: 'Panties de encaje con refuerzo en algodón',
    description: 'Panties corte tanga con franja de encaje floral, refuerzo en algodón y moño. Ropa interior femenina para todos los días. Envío a toda Colombia.',
    intro: [
      'Panty corte tanga con franja de encaje floral, refuerzo en algodón donde importa y un moño pequeño de detalle.',
      'Ropa interior femenina para todos los días, en seis colores: palo de rosa, blanco, uva, rojo, azul oscuro y negro.',
    ],
    google: 'Apparel & Accessories > Clothing > Underwear & Socks > Underwear',
  },
  {
    id: 'conjuntos-de-lenceria', prefijos: ['SET', 'BBD'],
    nombre: 'Conjuntos de lencería', tipo: 'Conjunto de lencería',
    h1: 'Conjuntos de lencería y babydolls',
    title: 'Conjuntos de lencería de encaje y babydolls',
    description: 'Sets de lencería de dos piezas en encaje: negro, rojo, blanco, lila, vinotinto y más. También babydolls. Envío a toda Colombia, gratis desde $200.000.',
    intro: [
      'Sets de lencería de dos piezas: brasier y panty que combinan, en encaje y en colores para cada versión tuya, del negro y el rojo al lila, el menta o el blanco.',
      'Revisa las tallas disponibles en cada set; si dudas, escríbenos y te asesoramos con tus medidas.',
    ],
    google: 'Apparel & Accessories > Clothing > Underwear & Socks > Lingerie',
  },
];

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pesos = (n) => '$' + Math.round(n).toLocaleString('es-CO');
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const recortar = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,.;:]$/, '') + '…');

// La plataforma guarda algunos nombres sin tildes. Aquí se corrigen para mostrarlos bien.
const TILDES = { pestana: 'pestaña', oceano: 'océano', laser: 'láser', algodon: 'algodón', cafe: 'café', sofia: 'sofía', veronica: 'verónica', eloisa: 'eloísa' };
const tildes = (s = '') => s.replace(/[A-Za-z]+/g, (w) => {
  const t = TILDES[w.toLowerCase()];
  if (!t) return w;
  return w[0] === w[0].toUpperCase() ? t[0].toUpperCase() + t.slice(1) : t;
});

const COLORES_TEXTO = ['Océano Profundo', 'Gris Tormenta', 'Palo de Rosa', 'Azul Oscuro', 'Azul Celeste', 'Verde Esmeralda', 'Verde Olivia',
  'Frambuesa', 'Champagne', 'Chocolate', 'Avellana', 'Vinotinto', 'Lavanda', 'Magenta', 'Violeta', 'Rosado', 'Dorado', 'Blanco',
  'Negro', 'Arena', 'Mauve', 'Rojo', 'Menta', 'Lila', 'Duna', 'Café', 'Azul', 'Uva'];
const COLOR_SKU = { PALODEROSA: 'Palo de Rosa', AZULOSCURO: 'Azul Oscuro', BLANCO: 'Blanco', UVA: 'Uva', ROJO: 'Rojo', NEGRO: 'Negro' };
const ORDEN_TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];
const nombreTalla = (t) => (/^UNICA$/i.test(t) ? 'Única' : t.toUpperCase());

function colorDe(p, nombre) {
  if (p.sku.startsWith('PF')) return COLOR_SKU[p.sku.replace(/^PF\d+/, '')] ?? '';
  if (/^(Set|Babydoll) /.test(nombre)) return nombre.split(' ').slice(2).join(' ');
  const n = nombre.toLowerCase();
  return COLORES_TEXTO.find((c) => n.includes(c.toLowerCase())) ?? '';
}

async function pedir(url, ms = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'aurorafemme.co sitio (GitHub Actions)' } });
    if (!r.ok) throw new Error(`${r.status} en ${url}`);
    return r;
  } finally { clearTimeout(t); }
}

/* ------------------------------------------------------------------ */
/* 1. Datos                                                            */
/* ------------------------------------------------------------------ */
async function traerDatos() {
  const html = await (await pedir(`${PLATAFORMA}/t/${TIENDA}`)).text();
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const lista = bloques.find((b) => b['@type'] === 'ItemList');
  if (!lista?.itemListElement?.length) throw new Error('la tienda no publicó la lista de productos');
  const productos = lista.itemListElement.map((e) => e.item).map((i) => ({
    sku: i.sku, nombre: i.name, descripcion: i.description ?? '', imagen: i.image ?? '',
    precio: Number(i.offers?.price) || 0, moneda: i.offers?.priceCurrency || 'COP',
    disponible: !/OutOfStock|SoldOut|Discontinued/.test(i.offers?.availability ?? ''),
  })).filter((p) => p.sku && p.nombre && p.precio > 0);
  const disp = await (await pedir(`${PLATAFORMA}/api/tienda/${TIENDA}/disponibilidad`)).json();
  const variantes = (disp.items ?? []).map((v) => ({ codigo: v.codigo, disponible: !!v.disponible }));
  return { actualizado: new Date().toISOString(), productos, variantes };
}

async function datos() {
  const archivo = RAIZ + 'data/catalogo.json';
  try {
    const d = await traerDatos();
    await mkdir(RAIZ + 'data', { recursive: true });
    // Solo se reescribe la copia si cambió algo (así el repo no recibe un commit diario vacío)
    let previo = null;
    try { previo = JSON.parse(await readFile(archivo, 'utf8')); } catch { /* primera vez */ }
    const igual = previo && JSON.stringify([previo.productos, previo.variantes]) === JSON.stringify([d.productos, d.variantes]);
    if (!igual) await writeFile(archivo, JSON.stringify(d, null, 2) + '\n');
    console.log(`Catálogo: ${d.productos.length} productos y ${d.variantes.length} variantes desde la plataforma.`);
    return d;
  } catch (e) {
    console.warn(`Catálogo: no pude leer la plataforma (${e.message}).`);
    if (existsSync(archivo)) {
      const d = JSON.parse(await readFile(archivo, 'utf8'));
      console.log(`Catálogo: uso la copia guardada del ${d.actualizado}.`);
      return d;
    }
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* 2. Normalizar                                                       */
/* ------------------------------------------------------------------ */
function normalizar({ productos, variantes }) {
  const skus = productos.map((p) => p.sku).sort((a, b) => b.length - a.length);
  const porSku = new Map();
  for (const v of variantes) {
    const sku = skus.find((s) => v.codigo.startsWith(s + '-'));
    if (!sku) continue;
    if (!porSku.has(sku)) porSku.set(sku, []);
    porSku.get(sku).push({ codigo: v.codigo, talla: nombreTalla(v.codigo.slice(sku.length + 1)), disponible: !!v.disponible });
  }
  const usados = new Set();
  const lista = [];
  for (const p of productos) {
    const cat = CATEGORIAS.find((c) => c.prefijos.some((x) => p.sku.startsWith(x)));
    if (!cat) { console.warn(`Catálogo: ${p.sku} sin categoría, se omite.`); continue; }
    let nombre = tildes(p.nombre).replace(/\s+/g, ' ').trim();
    const color = colorDe(p, nombre);
    // Nombres repetidos (mismo modelo en varios colores): se agrega el color
    if (productos.filter((o) => o.nombre === p.nombre).length > 1 && color && !nombre.toLowerCase().includes(color.toLowerCase())) nombre += ` ${color}`;
    let s = slug(nombre);
    if (s.length > 70) { // nombres largos: se acorta pero el color queda al final
      const cs = slug(color);
      let b = slug(cs ? nombre.replace(new RegExp(color + '$', 'i'), '') : nombre);
      b = b.slice(0, b.lastIndexOf('-', 56));
      s = cs ? `${b}-${cs}` : b;
    }
    while (usados.has(s)) s += '-' + slug(p.sku);
    usados.add(s);
    let tallas = (porSku.get(p.sku) ?? []).sort((a, b) => ORDEN_TALLAS.indexOf(a.talla) - ORDEN_TALLAS.indexOf(b.talla));
    if (!tallas.length) tallas = [{ codigo: p.sku, talla: 'Única', disponible: p.disponible }];
    lista.push({
      ...p, nombre, color, cat, slug: s,
      descripcion: tildes(p.descripcion).trim() || `${cat.tipo} de Aurora Femme. ${cat.intro[0]}`,
      url: `/${cat.id}/${s}/`, tallas, disponible: tallas.some((t) => t.disponible),
    });
  }
  return lista;
}

/* ------------------------------------------------------------------ */
/* 3. Fotos propias (más rápidas y con nombre que Google entiende)      */
/* ------------------------------------------------------------------ */
const DIR_IMG = 'assets/img/catalogo/';
async function fotos(lista) {
  await mkdir(RAIZ + DIR_IMG, { recursive: true });
  for (const f of await readdir(RAIZ + DIR_IMG)) if (f !== '.gitkeep') await rm(RAIZ + DIR_IMG + f);
  let propias = 0;
  for (const p of lista) {
    p.foto = { webp: p.imagen, jpg: p.imagen, ancho: 1000, alto: 1000, remota: true };
    if (!sharp || !p.imagen) continue;
    try {
      const buf = Buffer.from(await (await pedir(p.imagen, 30000)).arrayBuffer());
      const base = `${DIR_IMG}${p.slug}`;
      const img = sharp(buf).rotate();
      const meta = await img.metadata();
      const ancho = Math.min(1000, meta.width || 1000);
      const alto = Math.round(ancho * ((meta.height || 1) / (meta.width || 1)));
      await sharp(buf).rotate().resize({ width: ancho }).webp({ quality: 80 }).toFile(RAIZ + base + '.webp');
      await sharp(buf).rotate().resize({ width: 480 }).webp({ quality: 76 }).toFile(RAIZ + base + '-480.webp');
      await sharp(buf).rotate().resize({ width: Math.min(1200, meta.width || 1200) }).jpeg({ quality: 84, mozjpeg: true }).toFile(RAIZ + base + '.jpg');
      p.foto = { webp: `/${base}.webp`, webp480: `/${base}-480.webp`, jpg: `/${base}.jpg`, ancho, alto, remota: false };
      propias++;
    } catch (e) {
      console.warn(`Catálogo: foto de ${p.sku} sin descargar (${e.message}); uso la de la plataforma.`);
    }
  }
  console.log(`Catálogo: ${propias} fotos guardadas en el sitio.`);
}
const absoluta = (u) => (u.startsWith('http') ? u : SITIO + u);

/* ------------------------------------------------------------------ */
/* 4. Plantillas                                                       */
/* ------------------------------------------------------------------ */
function pagina({ titulo, descripcion, canonica, ogImagen, ogTipo = 'website', jsonld = [], cuerpo, paginaId }) {
  return `<!doctype html>
<html lang="es-CO">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="/">
  <title>${esc(titulo)}</title>
  <meta name="description" content="${esc(descripcion)}">
  <link rel="canonical" href="${canonica}">
  <meta name="theme-color" content="#FDF7F5">
  <meta property="og:site_name" content="Aurora Femme">
  <meta property="og:locale" content="es_CO">
  <meta property="og:title" content="${esc(titulo)}">
  <meta property="og:description" content="${esc(descripcion)}">
  <meta property="og:type" content="${ogTipo}">
  <meta property="og:url" content="${canonica}">
  ${ogImagen ? `<meta property="og:image" content="${absoluta(ogImagen)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&family=Jost:wght@300;400;500&family=Prata&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/styles.css?v=${V}">
${jsonld.map((j) => `  <script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body data-pagina="${paginaId}">
  <a class="sr-only" href="${canonica.replace(SITIO, '')}#contenido">Saltar al contenido</a>
  <div id="cabecera"></div>
  <main id="contenido">
${cuerpo}
  </main>
  <div id="pie"></div>
  <script src="/assets/js/data.js?v=${V}"></script>
  <script src="/assets/js/catalogo.js?v=${V}"></script>
  <script src="/assets/js/app.js?v=${V}"></script>
</body>
</html>
`;
}

const imagenHtml = (p, { tam = '(max-width: 760px) 50vw, 25vw', carga = 'lazy', alt } = {}) => {
  const a = esc(alt ?? `${p.nombre}, ${p.cat.tipo.toLowerCase()} de Aurora Femme`);
  if (p.foto.remota) return `<img src="${esc(p.foto.jpg)}" alt="${a}" loading="${carga}" decoding="async">`;
  return `<picture><source type="image/webp" srcset="${p.foto.webp480} 480w, ${p.foto.webp} ${p.foto.ancho}w" sizes="${tam}">` +
    `<img src="${p.foto.jpg}" alt="${a}" width="${p.foto.ancho}" height="${p.foto.alto}" loading="${carga}" decoding="async"${carga === 'eager' ? ' fetchpriority="high"' : ''}></picture>`;
};

const textoTallas = (p) => {
  if (!p.disponible) return 'Agotado por ahora';
  const t = p.tallas.filter((x) => x.disponible).map((x) => x.talla);
  if (t.length === 1) return t[0] === 'Única' ? 'Talla única' : `Talla ${t[0]}`;
  return 'Tallas ' + t.join(' · ');
};

const tarjeta = (p) => `
          <article class="tarjeta">
            <div class="tarjeta-media"><a class="tarjeta-foto" href="${p.url}" tabindex="-1" aria-hidden="true">${imagenHtml(p)}</a></div>
            <div class="tarjeta-info">
              <h3><a href="${p.url}">${esc(p.nombre)}</a></h3>
              <span class="tarjeta-precio">${pesos(p.precio)}</span>
              <span class="tarjeta-color">${textoTallas(p)}</span>
            </div>
          </article>`;

const migas = (items) => `<nav class="migas" aria-label="Ruta">${items.map(([t, u], i) => (u && i < items.length - 1 ? `<a href="${u}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`)).join(' <span aria-hidden="true">/</span> ')}</nav>`;
const migasLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([t, u], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: SITIO + u })),
});

const garantias = `
            <ul class="ficha-garantias">
              <li><b>Envío a toda Colombia</b> en 2 a 8 días hábiles. Gratis desde ${pesos(ENVIO_GRATIS)}.</li>
              <li><b>Empaque especial</b> incluido, listo para regalar o regalarte.</li>
              <li><b>Pagas fácil</b> por Nequi, Llave Bre-B o transferencia.</li>
            </ul>`;

function paginaProducto(p, lista) {
  const ruta = [['Inicio', '/'], [p.cat.nombre, `/${p.cat.id}/`], [p.nombre, p.url]];
  const relacionados = lista.filter((o) => o.cat === p.cat && o !== p && o.disponible).slice(0, 4);
  const unica = p.tallas.length === 1 && p.tallas[0].talla === 'Única';
  const textoWa = encodeURIComponent(`Hola Aurora Femme, me interesa: ${p.nombre} (${p.sku}) 💕`);
  const titulo = `${recortar(p.nombre, 58)} | Aurora Femme`;
  const descripcion = recortar(`${p.nombre}: ${p.descripcion}`, 150) + ` ${pesos(p.precio)}. Envío a toda Colombia.`;
  const oferta = (t) => ({
    '@type': 'Offer', url: SITIO + p.url, price: p.precio, priceCurrency: p.moneda,
    availability: `https://schema.org/${t.disponible ? 'InStock' : 'OutOfStock'}`,
    itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'Aurora Femme' },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CO' },
      deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 8, unitCode: 'DAY' } },
      ...(p.precio >= ENVIO_GRATIS ? { shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'COP' } } : {}),
    },
  });
  const base = {
    name: p.nombre, description: p.descripcion, image: [absoluta(p.foto.jpg)], brand: { '@type': 'Brand', name: 'Aurora Femme' },
    category: p.cat.nombre, ...(p.color ? { color: p.color } : {}),
    audience: { '@type': 'PeopleAudience', suggestedGender: 'female', suggestedMinAge: 18 },
  };
  const ld = p.tallas.length > 1
    ? { '@context': 'https://schema.org', '@type': 'ProductGroup', productGroupID: p.sku, variesBy: ['https://schema.org/size'], ...base, url: SITIO + p.url,
        hasVariant: p.tallas.map((t) => ({ '@type': 'Product', sku: t.codigo, name: `${p.nombre} talla ${t.talla}`, size: t.talla, image: absoluta(p.foto.jpg), offers: oferta(t) })) }
    : { '@context': 'https://schema.org', '@type': 'Product', sku: p.tallas[0].codigo, ...base, size: p.tallas[0].talla, offers: oferta(p.tallas[0]) };

  const cuerpo = `
    <div class="wrap ficha-wrap">
      ${migas(ruta)}
      <div class="ficha">
        <figure class="ficha-foto">${imagenHtml(p, { tam: '(max-width: 860px) 100vw, 50vw', carga: 'eager', alt: `${p.nombre}${p.color ? ` en color ${p.color.toLowerCase()}` : ''}, Aurora Femme` })}</figure>
        <div class="ficha-info">
          <p class="ficha-cat"><a href="/${p.cat.id}/">${esc(p.cat.nombre)}</a></p>
          <h1>${esc(p.nombre)}</h1>
          <p class="ficha-precio">${pesos(p.precio)} <small>COP</small></p>
          ${p.color ? `<p class="ficha-dato"><span>Color</span> ${esc(p.color)}</p>` : ''}
          <p class="ficha-dato"><span>Talla</span> ${unica ? 'Única · se adapta de XS a L' : p.tallas.map((t) => (t.disponible ? esc(t.talla) : `<s title="Agotada">${esc(t.talla)}</s>`)).join(' · ')}</p>
          <div class="ficha-cta">
            ${p.disponible
              ? `<a class="btn btn--bloque" href="/tienda.html?producto=${encodeURIComponent(p.sku)}">Agregar a la bolsa</a>`
              : `<p class="ficha-agotado">Agotado por ahora. Escríbenos y te avisamos cuando vuelva.</p>`}
            <a class="btn btn--claro btn--bloque" href="https://wa.me/${WHATSAPP}?text=${textoWa}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>
          </div>
          <div class="ficha-texto"><p>${esc(p.descripcion)}</p></div>
          ${garantias}
          <p class="ficha-enlaces"><a class="enlace" href="/index.html#tallas">Guía de tallas</a> <a class="enlace" href="/politicas.html#envios">Envíos y cambios</a></p>        </div>
      </div>
    </div>
    ${relacionados.length ? `
    <section class="seccion">
      <div class="wrap">
        <div class="seccion-cabeza"><h2>Más ${esc(p.cat.nombre.toLowerCase())}</h2><a class="enlace" href="/${p.cat.id}/">Ver todos</a></div>
        <div class="grilla">${relacionados.map(tarjeta).join('')}
        </div>
      </div>
    </section>` : ''}`;
  return pagina({ titulo, descripcion, canonica: SITIO + p.url, ogImagen: p.foto.jpg, ogTipo: 'product', jsonld: [ld, migasLd(ruta)], cuerpo, paginaId: 'producto' });
}

function paginaCategoria(cat, lista) {
  const prods = lista.filter((p) => p.cat === cat).sort((a, b) => b.disponible - a.disponible);
  const ruta = [['Inicio', '/'], [cat.nombre, `/${cat.id}/`]];
  const otras = CATEGORIAS.filter((c) => c !== cat);
  const desde = Math.min(...prods.map((p) => p.precio));
  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: cat.h1, description: cat.description, url: `${SITIO}/${cat.id}/`,
    mainEntity: { '@type': 'ItemList', numberOfItems: prods.length, itemListElement: prods.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITIO + p.url, name: p.nombre })) },
  };
  const cuerpo = `
    <div class="wrap">
      <header class="cabeza-pagina">
        ${migas(ruta)}
        <h1 style="font-size:clamp(2.2rem,5vw,3.6rem)">${esc(cat.h1)}</h1>
        ${cat.intro.map((t) => `<p>${esc(t)}</p>`).join('\n        ')}
        <p class="cat-resumen">${prods.length} ${prods.length === 1 ? 'pieza' : 'piezas'} · desde ${pesos(desde)} · envío gratis desde ${pesos(ENVIO_GRATIS)}</p>
        <nav class="chips cat-chips" aria-label="Otras categorías">${otras.map((c) => `<a class="chip" href="/${c.id}/">${esc(c.nombre)}</a>`).join('')}<a class="chip" href="/tienda.html">Todo el catálogo</a></nav>
      </header>
      <div class="grilla">${prods.map(tarjeta).join('')}
      </div>
    </div>
    <section class="seccion">
      <div class="wrap cat-ayuda">
        <h2>¿Cómo compro?</h2>
        <p>Abre la pieza que te guste, elige tu talla y agrégala a la bolsa. Envías el pedido por WhatsApp y confirmas el pago con nosotras por Nequi, Llave Bre-B o transferencia. Llega en 2 a 8 días hábiles a cualquier ciudad de Colombia, en nuestro empaque especial.</p>
        <p><a class="btn btn--claro" href="/index.html#tallas">Calcular mi talla</a></p>
      </div>
    </section>`;
  return pagina({
    titulo: `${cat.title} | Aurora Femme`, descripcion: cat.description, canonica: `${SITIO}/${cat.id}/`,
    ogImagen: prods[0]?.foto.jpg, jsonld: [ld, migasLd(ruta)], cuerpo, paginaId: 'categoria',
  });
}

/* ------------------------------------------------------------------ */
/* 5. Feed de Google Merchant Center (RSS 2.0)                         */
/* ------------------------------------------------------------------ */
function feed(lista) {
  const x = (s) => esc(s).replace(/&#39;/g, '&apos;');
  const items = [];
  for (const p of lista) {
    const grupo = p.tallas.length > 1;
    for (const t of p.tallas) {
      const titulo = recortar(`${p.nombre}${grupo ? ` - Talla ${t.talla}` : ''} | Aurora Femme`, 150);
      items.push(`    <item>
      <g:id>${x(t.codigo)}</g:id>
      ${grupo ? `<g:item_group_id>${x(p.sku)}</g:item_group_id>` : ''}
      <g:title>${x(titulo)}</g:title>
      <g:description>${x(recortar(p.descripcion, 4900))}</g:description>
      <g:link>${SITIO}${p.url}</g:link>
      <g:image_link>${x(absoluta(p.foto.jpg))}</g:image_link>
      <g:availability>${t.disponible ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${p.precio} ${p.moneda}</g:price>
      <g:brand>Aurora Femme</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${x(p.cat.google)}</g:google_product_category>
      <g:product_type>${x('Lencería > ' + p.cat.nombre)}</g:product_type>
      <g:gender>female</g:gender>
      <g:age_group>adult</g:age_group>
      ${p.color ? `<g:color>${x(p.color)}</g:color>` : ''}
      <g:size>${x(t.talla === 'Única' ? 'Única' : t.talla)}</g:size>
      <g:size_system>CO</g:size_system>
    </item>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Aurora Femme</title>
    <link>${SITIO}/</link>
    <description>Lencería y ropa interior femenina. Envíos a toda Colombia.</description>
${items.join('\n').replace(/\n\s*\n/g, '\n')}
  </channel>
</rss>
`;
}

/* ------------------------------------------------------------------ */
/* 6. Sitemap y robots                                                 */
/* ------------------------------------------------------------------ */
function sitemap(lista, hoy) {
  const fijas = [['/', '1.0'], ['/tienda.html', '0.9'], ['/nosotras.html', '0.6'], ['/diario.html', '0.6'], ['/politicas.html', '0.3']];
  const urls = [
    ...fijas.map(([u, pr]) => ({ u, pr })),
    ...CATEGORIAS.map((c) => ({ u: `/${c.id}/`, pr: '0.9', img: lista.find((p) => p.cat === c)?.foto })),
    ...lista.map((p) => ({ u: p.url, pr: '0.8', img: p.foto, titulo: p.nombre })),
    ...ARTICULOS.map((a) => ({ u: `/articulo.html?a=${a}`, pr: '0.5' })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(({ u, pr, img }) => `  <url>
    <loc>${esc(SITIO + u)}</loc>
    <lastmod>${hoy}</lastmod>
    <priority>${pr}</priority>${img ? `
    <image:image><image:loc>${esc(absoluta(img.jpg))}</image:loc></image:image>` : ''}
  </url>`).join('\n')}
</urlset>
`;
}
let ARTICULOS = [];

/* ------------------------------------------------------------------ */
/* Principal                                                           */
/* ------------------------------------------------------------------ */
const d = await datos();
if (!d) {
  console.log('Catálogo: sin datos, no se generan páginas de producto.');
  process.exit(0);
}
const lista = normalizar(d);
await fotos(lista);

// Artículos del diario (para el sitemap)
try {
  const data = await readFile(RAIZ + 'assets/js/data.js', 'utf8');
  const bloque = data.slice(data.indexOf('DIARIO'));
  ARTICULOS = [...bloque.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
} catch { /* sin diario */ }

// Limpia carpetas de categoría anteriores y escribe las nuevas
for (const c of CATEGORIAS) {
  await rm(RAIZ + c.id, { recursive: true, force: true });
  await mkdir(RAIZ + c.id, { recursive: true });
  await writeFile(RAIZ + c.id + '/index.html', paginaCategoria(c, lista));
}
for (const p of lista) {
  await mkdir(RAIZ + p.url.slice(1), { recursive: true });
  await writeFile(RAIZ + p.url.slice(1) + 'index.html', paginaProducto(p, lista));
}

// Enlaces para la portada: código corto (HG007) y completo → URL del producto
const enlaces = {};
for (const p of lista) { enlaces[p.sku] = p.url; const corto = p.sku.match(/^[A-Z]+\d+/)?.[0]; if (corto && !enlaces[corto]) enlaces[corto] = p.url; }
const cats = Object.fromEntries(CATEGORIAS.map((c) => [c.id, `/${c.id}/`]));
await writeFile(RAIZ + 'assets/js/catalogo.js', '/* Generado por scripts/catalogo.mjs. No editar a mano. */\n' +
  `window.CATALOGO = ${JSON.stringify({ productos: enlaces, categorias: cats, nombres: Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nombre])) })};\n`);

const hoy = new Date().toISOString().slice(0, 10);
await writeFile(RAIZ + 'sitemap.xml', sitemap(lista, hoy));
await writeFile(RAIZ + 'merchant.xml', feed(lista));
await writeFile(RAIZ + 'robots.txt', `User-agent: *\nAllow: /\nDisallow: /producto.html\n\nSitemap: ${SITIO}/sitemap.xml\n`);
console.log(`Catálogo: ${lista.length} páginas de producto, ${CATEGORIAS.length} categorías, sitemap y feed de Merchant listos.`);
