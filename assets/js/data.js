/* =========================================================
   Aurora Femme — catálogo
   Fuente única de los productos de la tienda.
   Para agregar un producto: copia un bloque, cambia los datos
   y pon la foto en assets/img/productos/ con el mismo nombre.
   ========================================================= */

const TIENDA = {
  nombre: "Aurora Femme",
  whatsapp: "573127527565",          // sin + ni espacios
  whatsappVisible: "+57 312 752 7565",
  correo: "aurorafemmecol@gmail.com",
  instagram: "aurorafemme.co",
  tiktok: "aurorafemme.co",
  envioGratisDesde: 200000,
  costoEnvio: 12000,                 // ajústalo a tu tarifa real
  horario: ["Lun – Vie: 8:00 a.m. – 6:00 p.m.", "Sáb: 9:00 a.m. – 2:00 p.m."],
  entrega: "2 a 8 días hábiles según destino",
};

const CDN = "https://cdn.shopify.com/s/files/1/0710/6838/5514/files/";

const COLECCIONES = [
  {
    id: "hilos-graduables",
    nombre: "Hilos graduables",
    texto: "Encaje floral y de pestaña con tirantes que ajustas a tu cadera.",
    img: "assets/img/colecciones/hilos-graduables.jpg",
    cdn: "https://cdn.shopify.com/s/files/1/0710/6838/5514/collections/Hilos_Graduables.jpg?v=1784514470&width=1500",
  },
  {
    id: "panties-invisibles",
    nombre: "Panties invisibles",
    texto: "Sin costuras y con corte láser: no se marcan ni bajo el vestido más ajustado.",
    img: "assets/img/colecciones/panties-invisibles.jpg",
    cdn: "https://cdn.shopify.com/s/files/1/0710/6838/5514/collections/PANTIESINVISIBLES.jpg?v=1784514501&width=1500",
  },
];

/* Colores de producto. Hex aproximados: validar contra la tela física. */
const COLORES = {
  "arena":           { nombre: "Arena",           hex: "#D8C3A5" },
  "mauve":           { nombre: "Mauve",           hex: "#A97A86" },
  "frambuesa":       { nombre: "Frambuesa",       hex: "#D9576F" },
  "oceano-profundo": { nombre: "Océano profundo", hex: "#2F4A5A" },
  "gris-tormenta":   { nombre: "Gris tormenta",   hex: "#6B6870" },
  "negro":           { nombre: "Negro",           hex: "#171214" },
  "palo-de-rosa":    { nombre: "Palo de rosa",    hex: "#E4B7B2" },
  "uva":             { nombre: "Uva",             hex: "#5E1F2E" },
  "champagne":       { nombre: "Champagne",       hex: "#EAD7C3" },
  "duna":            { nombre: "Duna",            hex: "#D9B99B" },
  "avellana":        { nombre: "Avellana",        hex: "#C69C7E" },
  "chocolate":       { nombre: "Chocolate",       hex: "#5A3A2C" },
};

const DESC_HILO_FLORAL =
  "Encaje floral suave al tacto, con tirantes graduables para que el ajuste sea tuyo y no al revés. Talla única que se adapta de XS a L.";
const DESC_HILO_PESTANA =
  "Encaje de pestaña con borde ondulado y argollas metálicas en la cadera. Tirantes graduables, talla única de XS a L.";
const DESC_PANTY =
  "Panty sin costuras con corte láser: no marca bajo leggings, vestidos ni pantalones claros. Tela elástica que se siente como no llevar nada. Talla única.";

const PRODUCTOS = [
  // ---------- Hilos graduables ----------
  { sku: "HG008", handle: "tanga-encaje-pestana-uva", nombre: "Tanga de encaje de pestaña Uva", detalle: "con argollas plateadas",
    coleccion: "hilos-graduables", color: "uva", precio: 12000, destacado: true,
    img: "assets/img/productos/hg008-uva.jpg", cdn: CDN + "hg008-uva-2048.jpg?v=1784586063", desc: DESC_HILO_PESTANA },
  { sku: "HG007", handle: "tanga-encaje-pestana-palo-de-rosa", nombre: "Tanga de encaje de pestaña Palo de rosa", detalle: "con argollas doradas",
    coleccion: "hilos-graduables", color: "palo-de-rosa", precio: 12000, destacado: true,
    img: "assets/img/productos/hg007-palo-de-rosa.jpg", cdn: CDN + "hg007-palo-de-rosa-2048.jpg?v=1784586063", desc: DESC_HILO_PESTANA },
  { sku: "HG006", handle: "tanga-encaje-floral-negro", nombre: "Tanga de encaje floral Negro", detalle: "con tirantes graduables",
    coleccion: "hilos-graduables", color: "negro", precio: 12000, destacado: true,
    img: "assets/img/productos/hg006-negro.jpg", cdn: CDN + "hg006-negro-2048.jpg?v=1784586063", desc: DESC_HILO_FLORAL },
  { sku: "HG005", handle: "tanga-encaje-floral-gris-tormenta", nombre: "Tanga de encaje floral Gris tormenta", detalle: "con tirantes graduables",
    coleccion: "hilos-graduables", color: "gris-tormenta", precio: 12000, destacado: true,
    img: "assets/img/productos/hg005-gris-tormenta.jpg", cdn: CDN + "hg005-gris-tormenta-2048.jpg?v=1784586062", desc: DESC_HILO_FLORAL },
  { sku: "HG004", handle: "tanga-encaje-floral-oceano-profundo", nombre: "Tanga de encaje floral Océano profundo", detalle: "con tirantes graduables",
    coleccion: "hilos-graduables", color: "oceano-profundo", precio: 12000,
    img: "assets/img/productos/hg004-oceano-profundo.jpg", cdn: CDN + "hg004-oceano-profundo-01.jpg?v=1784424685", desc: DESC_HILO_FLORAL },
  { sku: "HG003", handle: "tanga-encaje-floral-frambuesa", nombre: "Tanga de encaje floral Frambuesa", detalle: "con tirantes graduables",
    coleccion: "hilos-graduables", color: "frambuesa", precio: 12000,
    img: "assets/img/productos/hg003-frambuesa.png", cdn: CDN + "hg003-frambuesa-01.png?v=1784424678", desc: DESC_HILO_FLORAL },
  { sku: "HG002", handle: "tanga-encaje-floral-mauve", nombre: "Tanga de encaje floral Mauve", detalle: "con tirantes graduables",
    coleccion: "hilos-graduables", color: "mauve", precio: 12000,
    img: "assets/img/productos/hg002-mauve.jpg", cdn: CDN + "hg002-mauve-2048.jpg?v=1784586695", desc: DESC_HILO_FLORAL },
  { sku: "HG001", handle: "tanga-encaje-floral-arena", nombre: "Tanga de encaje floral Arena", detalle: "con mariposa dorada",
    coleccion: "hilos-graduables", color: "arena", precio: 12000,
    img: "assets/img/productos/hg001-arena.jpg", cdn: CDN + "hg001-arena-2048.jpg?v=1784586062", desc: DESC_HILO_FLORAL },

  // ---------- Panties invisibles ----------
  { sku: "PI001", handle: "panty-invisible-champagne", nombre: "Panty invisible Champagne", detalle: "sin costuras, corte láser",
    coleccion: "panties-invisibles", color: "champagne", precio: 15000,
    img: "assets/img/productos/pi001-champagne.jpg", cdn: CDN + "pi001-champagne-01.jpg?v=1784515311", desc: DESC_PANTY },
  { sku: "PI002", handle: "panty-invisible-duna", nombre: "Panty invisible Duna", detalle: "sin costuras, corte láser",
    coleccion: "panties-invisibles", color: "duna", precio: 15000,
    img: "assets/img/productos/pi002-duna.jpg", cdn: CDN + "pi002-duna-01.jpg?v=1784515320", desc: DESC_PANTY },
  { sku: "PI003", handle: "panty-invisible-avellana", nombre: "Panty invisible Avellana", detalle: "sin costuras, corte láser",
    coleccion: "panties-invisibles", color: "avellana", precio: 15000,
    img: "assets/img/productos/pi003-avellana.jpg", cdn: CDN + "pi003-avellana-01.jpg?v=1784583819", desc: DESC_PANTY },
  { sku: "PI004", handle: "panty-invisible-chocolate", nombre: "Panty invisible Chocolate", detalle: "sin costuras, corte láser",
    coleccion: "panties-invisibles", color: "chocolate", precio: 15000,
    img: "assets/img/productos/pi004-chocolate.jpg", cdn: CDN + "pi004-chocolate-01.jpg?v=1784515337", desc: DESC_PANTY },
  { sku: "PI005", handle: "panty-invisible-negro", nombre: "Panty invisible Negro", detalle: "sin costuras, corte láser",
    coleccion: "panties-invisibles", color: "negro", precio: 15000,
    img: "assets/img/productos/pi005-negro.jpg", cdn: CDN + "pi005-negro-01.jpg?v=1784515344", desc: DESC_PANTY },
];

const LOGO = {
  img: "assets/img/logo-aurora-femme.png",
  cdn: "https://cdn.shopify.com/s/files/1/0710/6838/5514/files/2aa5262b-2887-42d2-a589-e285c5002880-removebg-preview.png?v=1778723989&width=560",
};

/* =========================================================
   Reseñas de clientas
   Solo reseñas reales, con permiso de la clienta.
   Mientras esta lista esté vacía, la sección no se muestra.
   Ejemplo:
   { nombre: "Nombre A.", ciudad: "Ibagué", estrellas: 5,
     producto: "tanga-encaje-floral-negro", texto: "..." },
   ========================================================= */
const RESENAS = [];

/* =========================================================
   Diario Aurora (blog)
   Para publicar una entrada: agrega un bloque al inicio de la lista.
   cuerpo: párrafos en HTML sencillo (<p>, <h2>, <ul><li>).
   ========================================================= */
const DIARIO = [
  {
    slug: "como-cuidar-tu-lenceria",
    titulo: "Cómo cuidar tu lencería para que te dure",
    resumen: "El encaje es delicado, pero no complicado. Cinco hábitos que hacen la diferencia.",
    fecha: "2026-10-01",
    lectura: "3 min",
    imagen: "hg006",
    cuerpo: `
      <p>Una pieza de encaje bien cuidada dura años. La mayoría se dañan por tres cosas: agua caliente, la lavadora y la secadora. Con estos hábitos, tus favoritas siguen como el primer día.</p>
      <h2>1. Lava a mano, con agua fría</h2>
      <p>Llena un recipiente con agua fría y unas gotas de jabón suave o champú de bebé. Deja la prenda cinco minutos y muévela con la mano, sin frotar el encaje contra sí mismo.</p>
      <h2>2. Nunca la retuerzas</h2>
      <p>Retorcer deforma los elásticos y abre el tejido del encaje. Mejor presiónala entre dos toallas para sacar el agua.</p>
      <h2>3. Sécala a la sombra, extendida</h2>
      <p>El sol directo apaga los colores y el calor de la secadora vence los elásticos. Extiéndela sobre una toalla o cuélgala de la costura central.</p>
      <h2>4. Si usas lavadora, usa una bolsa de malla</h2>
      <p>Ciclo delicado, agua fría y una bolsa de lavado. Así los tirantes no se enredan con otras prendas.</p>
      <h2>5. Guárdala sin doblar el encaje</h2>
      <p>Un cajón solo para lencería, con las piezas extendidas o enrolladas, evita marcas y enganches.</p>`,
  },
  {
    slug: "como-tomar-tus-medidas",
    titulo: "Cómo tomar tus medidas en dos minutos",
    resumen: "Solo necesitas una cinta métrica y dos medidas: busto y cadera. Así encuentras tu talla sin adivinar.",
    fecha: "2026-09-20",
    lectura: "2 min",
    imagen: "hg002",
    cuerpo: `
      <p>Medirte en casa es más fácil de lo que parece. Hazlo con ropa interior delgada o sin ropa, de pie y relajada.</p>
      <h2>Contorno de busto</h2>
      <p>Pasa la cinta por la parte más llena del pecho, paralela al piso. Que quede pegada, sin apretar.</p>
      <h2>Contorno de cadera</h2>
      <p>Junta los pies y pasa la cinta por la parte más ancha de la cadera y los glúteos.</p>
      <p>Con esas dos medidas, usa la <a class="enlace" href="index.html#tallas">calculadora de tallas</a>. Si quedas entre dos tallas, elige la más grande. Y si tienes dudas, escríbenos por WhatsApp: te asesoramos con gusto.</p>`,
  },
  {
    slug: "hilo-o-panty-invisible",
    titulo: "¿Hilo de encaje o panty invisible? Cuándo usar cada uno",
    resumen: "Una guía rápida según lo que te vas a poner hoy.",
    fecha: "2026-09-05",
    lectura: "3 min",
    imagen: "pi003",
    cuerpo: `
      <p>No hay una pieza para todo. Lo que llevas encima decide qué te queda mejor por debajo.</p>
      <h2>Panty invisible: para ropa ajustada o clara</h2>
      <p>Leggings, vestidos de punto, pantalones blancos o de lino. Al no tener costuras y tener corte láser, no marca líneas. Elige el tono más cercano a tu piel (Champagne, Duna, Avellana o Chocolate) para que tampoco se transparente.</p>
      <h2>Hilo de encaje: para cuando quieres sentirte linda</h2>
      <p>Jeans, faldas con caída, el día a día. Los tirantes graduables te dejan subirlos o bajarlos en la cadera según el pantalón.</p>
      <h2>¿Y para hacer ejercicio?</h2>
      <p>El panty invisible: es elástico, no se mueve y no roza.</p>`,
  },
];
