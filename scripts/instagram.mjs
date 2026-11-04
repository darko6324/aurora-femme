// Trae las últimas publicaciones de @aurorafemme.co y las deja dentro del sitio.
// Corre en GitHub Actions (una vez al día y en cada push). El sitio no carga nada de Instagram
// al visitarlo: sin cookies de terceros, sin scripts externos, fotos optimizadas y propias.
//
// Usa la API de Instagram (Instagram Login). El token va en el secreto IG_TOKEN de GitHub, nunca en el repo.
// Si no hay token o la API falla, deja los datos como estaban: el deploy nunca falla por Instagram.
//
//   IG_TOKEN=... node scripts/instagram.mjs
//
// Salida:
//   assets/js/instagram.js       → window.INSTAGRAM = { usuario, actualizado, posts: [...] }
//   assets/img/instagram/*.webp  → una foto por publicación (480 px, comprimida)
import { writeFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const TOKEN = process.env.IG_TOKEN;
const USUARIO = 'aurorafemme.co';
const CUANTAS = 6;
const API = 'https://graph.instagram.com';
const DIR_IMG = fileURLToPath(new URL('../assets/img/instagram/', import.meta.url));
const ARCHIVO = fileURLToPath(new URL('../assets/js/instagram.js', import.meta.url));

// sharp es opcional: el workflow lo instala. Sin él, se guarda la imagen original de Instagram.
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* sin compresión */ }

async function pedir(url, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
    return r;
  } finally {
    clearTimeout(t);
  }
}

async function guardarImagen(buf, base) {
  if (sharp) {
    const nombre = `${base}.webp`;
    await sharp(buf).rotate().resize(480, 480, { fit: 'cover' }).webp({ quality: 78 }).toFile(DIR_IMG + nombre);
    return nombre;
  }
  const nombre = `${base}.jpg`;
  await writeFile(DIR_IMG + nombre, buf);
  return nombre;
}

async function traer() {
  const campos = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const r = await pedir(`${API}/me/media?fields=${campos}&limit=${CUANTAS * 2}&access_token=${TOKEN}`);
  const { data = [] } = await r.json();

  // Baja primero a memoria: solo si hay publicaciones nuevas se reemplazan las fotos guardadas.
  const bajadas = [];
  for (const p of data) {
    if (bajadas.length >= CUANTAS) break;
    const fuente = p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url;
    if (!fuente) continue;
    try {
      const buf = Buffer.from(await (await pedir(fuente, 20000)).arrayBuffer());
      bajadas.push({ p, buf });
    } catch (e) {
      console.warn(`Instagram: no pude bajar la imagen de ${p.id}: ${e.message}`);
    }
  }
  if (!bajadas.length) throw new Error('la API no devolvió publicaciones con imagen');

  await mkdir(DIR_IMG, { recursive: true });
  for (const f of await readdir(DIR_IMG)) if (f !== '.gitkeep') await unlink(DIR_IMG + f);

  const posts = [];
  for (const { p, buf } of bajadas) {
    const imagen = await guardarImagen(buf, p.id);
    posts.push({
      id: p.id,
      tipo: p.media_type, // IMAGE | VIDEO | CAROUSEL_ALBUM
      enlace: p.permalink,
      texto: (p.caption ?? '').trim(),
      fecha: p.timestamp,
      imagen,
    });
  }

  const datos = { usuario: USUARIO, actualizado: new Date().toISOString(), posts };
  await writeFile(
    ARCHIVO,
    '/* Generado por scripts/instagram.mjs. No editar a mano. */\n' +
      `window.INSTAGRAM = ${JSON.stringify(datos, null, 2)};\n`,
  );
  console.log(`Instagram: ${posts.length} publicaciones guardadas${sharp ? ' (webp 480 px)' : ''}.`);
}

// Renueva el token (dura 60 días; se puede renovar si tiene más de 24 h). Nunca lo imprime.
// Meta devuelve un valor nuevo; el del secreto IG_TOKEN se reemplaza a mano antes de los 60 días.
async function mantenerVivo() {
  try {
    const r = await pedir(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${TOKEN}`);
    const j = await r.json();
    console.log(`Instagram: token renovado, vence en ${Math.round(j.expires_in / 86400)} días.`);
  } catch (e) {
    console.log(`Instagram: no se pudo renovar el token todavía (${e.message.slice(0, 80)}).`);
  }
}

if (!TOKEN) {
  console.log('Instagram: sin IG_TOKEN, se usan los datos guardados.');
} else {
  try {
    await traer();
    await mantenerVivo();
  } catch (e) {
    console.warn(`Instagram: ${e.message}. Se usan los datos guardados.`);
  }
}
