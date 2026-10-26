/* =========================================================
   Aurora Femme — lógica de la tienda
   Cabecera/pie compartidos. El catálogo, la bolsa y el pedido por
   WhatsApp viven en la plataforma de inventario (iframe en tienda.html).
   Aquí: cabecera, pie, portada, calculadora de tallas y diario.
   ========================================================= */

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pagina = document.body.dataset.pagina || "";

  const pesos = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const porHandle = (h) => PRODUCTOS.find((p) => p.handle === h);

  // Imagen local con respaldo en el CDN mientras no se descarguen las fotos
  const img = (o, alt, extra = "") =>
    `<img src="${o.img}" alt="${alt}" loading="lazy" decoding="async" ${extra}
      onerror="this.onerror=null;this.src='${o.cdn}'">`;

  const ICONOS = {
    bolsa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 8h14l-1 12.5a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.6c-1.4.1-2.6-.3-3.9-1.1v5.6c0 6.9-7.6 9.1-10.6 4.1-2-3.2-.8-8.8 5.6-9v2.7c-.5.1-1 .2-1.4.4-1.4.5-2.2 1.4-2 3 .4 3.1 6.1 4 5.6-2V3h2.8Z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z"/></svg>',
    camion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    candado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    caja: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8 12 3l9 5v8l-9 5-9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
    flecha: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    lupa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
    estrella: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z"/></svg>',
    tarjeta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>',
    encaje: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20c-4-3-7-6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 4-3 7-7 10Z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5h16v11H9l-5 4V5Z"/></svg>',
  };

  /* ---------------- Cabecera y pie ---------------- */
  const navLinks = [
    ["tienda.html", "Catálogo", "tienda"],
    ["diario.html", "Diario", "diario"],
    ["nosotras.html", "Nosotras", "nosotras"],
  ];

  function montarCabecera() {
    const destino = $("#cabecera");
    if (!destino) return;
    const activo = (clave) =>
      (clave === "tienda" && pagina === "tienda") ||
      (clave === "nosotras" && pagina === "nosotras") ||
      (clave === "diario" && (pagina === "diario" || pagina === "articulo"));
    destino.outerHTML = `
      <div class="aviso">Envío gratis desde <strong>${pesos(TIENDA.envioGratisDesde)}</strong> a toda Colombia</div>
      <header class="cabecera">
        <div class="wrap">
          <nav class="nav" aria-label="Principal">
            ${navLinks.slice(0, 2).map(([h, t, k]) => `<a href="${h}" ${activo(k) ? 'aria-current="page"' : ""}>${t}</a>`).join("")}
          </nav>
          <button class="icono-btn menu-btn" id="abrirMenu" aria-label="Abrir menú" aria-expanded="false">${ICONOS.menu}</button>
          <a class="logo" href="index.html" aria-label="Aurora Femme, inicio">${img(LOGO, "Aurora Femme", 'loading="eager"')}</a>
          <div class="acciones">
            <a class="nav-extra" href="nosotras.html" ${activo("nosotras") ? 'aria-current="page"' : ""}>Nosotras</a>
            <a class="icono-btn" id="iconoBolsa" href="tienda.html?bolsa=1" aria-label="Abrir tu bolsa">${ICONOS.bolsa}<span class="contador" data-n="0">0</span></a>
          </div>
        </div>
      </header>
      <div class="menu-movil" id="menuMovil" aria-hidden="true">
        <button class="icono-btn cerrar" id="cerrarMenu" aria-label="Cerrar menú">${ICONOS.cerrar}</button>
        <nav aria-label="Menú móvil">
          <a href="index.html">Inicio</a>
          ${navLinks.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}
          <a href="politicas.html">Envíos y cambios</a>
        </nav>
      </div>`;

    // Contador de la bolsa: lo actualiza la tienda embebida (tienda.html) y se recuerda entre páginas
    window.auroraContador = (n) => {
      n = Math.max(0, parseInt(n, 10) || 0);
      $$(".contador").forEach((c) => { c.textContent = n; c.dataset.n = n; });
      try { localStorage.setItem("aurora-tienda-unidades", String(n)); } catch {}
    };
    try { window.auroraContador(localStorage.getItem("aurora-tienda-unidades")); } catch {}
    $("#iconoBolsa").addEventListener("click", (e) => {
      if (pagina === "tienda" && window.auroraAbrirBolsa) { e.preventDefault(); window.auroraAbrirBolsa(); }
    });

    const menu = $("#menuMovil");
    const abrir = $("#abrirMenu");
    abrir.addEventListener("click", () => {
      menu.classList.add("abierto"); menu.setAttribute("aria-hidden", "false");
      abrir.setAttribute("aria-expanded", "true"); $("#cerrarMenu").focus();
    });
    $("#cerrarMenu").addEventListener("click", () => {
      menu.classList.remove("abierto"); menu.setAttribute("aria-hidden", "true");
      abrir.setAttribute("aria-expanded", "false"); abrir.focus();
    });
  }

  function montarPie() {
    const destino = $("#pie");
    if (!destino) return;
    destino.outerHTML = `
      <footer class="pie">
        <div class="wrap">
          <div class="pie-grid">
            <div class="pie-marca">
              ${img(LOGO, "Aurora Femme")}
              <p>Lencería y ropa interior femenina, escogida pieza por pieza en Colombia y enviada a donde estés.</p>
              <div class="redes">
                <a href="https://instagram.com/${TIENDA.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONOS.ig}</a>
                <a href="https://tiktok.com/@${TIENDA.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ICONOS.tt}</a>
                <a href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONOS.wa}</a>
              </div>
            </div>
            <div>
              <h4>Tienda</h4>
              <ul>
                <li><a href="tienda.html">Catálogo</a></li>
                <li><a href="index.html#tallas">Guía de tallas</a></li>
              </ul>
            </div>
            <div>
              <h4>Ayuda</h4>
              <ul>
                <li><a href="nosotras.html">Nosotras</a></li>
                <li><a href="diario.html">Diario Aurora</a></li>
                <li><a href="politicas.html#envios">Envíos</a></li>
                <li><a href="politicas.html#cambios">Cambios y devoluciones</a></li>
                <li><a href="politicas.html#privacidad">Privacidad</a></li>
                <li><a href="politicas.html#terminos">Términos</a></li>
              </ul>
            </div>
            <div>
              <h4>Hablemos</h4>
              <ul>
                <li><a href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener">WhatsApp ${TIENDA.whatsappVisible}</a></li>
                <li><a href="mailto:${TIENDA.correo}">${TIENDA.correo}</a></li>
                ${TIENDA.horario.map((h) => `<li>${h}</li>`).join("")}
              </ul>
            </div>
          </div>
          <div class="pie-base">
            <span>© ${new Date().getFullYear()} Aurora Femme. Hecho en Colombia.</span>
            <div class="medios" aria-label="Medios de pago"><span>Nequi</span><span>Daviplata</span><span>Bancolombia</span><span>Contraentrega</span></div>
          </div>
        </div>
      </footer>
      <a class="wa-flotante" href="https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent("Hola Aurora Femme, tengo una pregunta 💕")}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${ICONOS.wa}</a>`;
  }

  /* ---------------- Tarjetas de producto ---------------- */
  const tarjeta = (p) => {
    const c = COLORES[p.color];
    return `
      <article class="tarjeta">
        <div class="tarjeta-media">
          <a class="tarjeta-foto" href="tienda.html" tabindex="-1" aria-hidden="true">${img(p, "")}</a>
        </div>
        <div class="tarjeta-info">
          <h3><a href="tienda.html">${p.nombre}</a></h3>
          <span class="tarjeta-color"><i class="punto" style="--c:${c.hex}"></i>${p.detalle}</span>
        </div>
      </article>`;
  };

  /* ---------------- Inicio ---------------- */
  function initInicio() {
    // Hero: el cajón de colores cambia la foto principal
    const hilos = PRODUCTOS.filter((p) => p.coleccion === "hilos-graduables");
    const foto = $("#heroFoto"), ficha = $("#heroFicha"), lista = $("#cajon"), nombreColor = $("#cajonColor");
    if (foto && lista) {
      lista.innerHTML = hilos.map((p, i) => {
        const c = COLORES[p.color];
        return `<li><button class="tela" style="--c:${c.hex}" data-i="${i}" aria-pressed="${i === 0}" aria-label="Ver color ${c.nombre}"></button></li>`;
      }).join("");
      const mostrar = (i) => {
        const p = hilos[i], c = COLORES[p.color];
        $$(".tela", lista).forEach((b) => b.setAttribute("aria-pressed", b.dataset.i == i));
        $(".hero").style.setProperty("--color-activo", c.hex);
        nombreColor.textContent = c.nombre;
        ficha.href = "tienda.html";
        ficha.querySelector("strong").textContent = p.nombre;
        ficha.querySelector("span").textContent = `${p.detalle} · Ver en el catálogo`;
        const vieja = foto.querySelector("img");
        const nueva = document.createElement("img");
        nueva.alt = p.nombre; nueva.src = p.img;
        nueva.onerror = () => { nueva.onerror = null; nueva.src = p.cdn; };
        nueva.classList.add("saliendo");
        foto.appendChild(nueva);
        const entrar = () => requestAnimationFrame(() => {
          nueva.classList.remove("saliendo");
          if (vieja) { vieja.classList.add("saliendo"); setTimeout(() => vieja.remove(), 600); }
        });
        nueva.complete ? entrar() : (nueva.onload = entrar);
      };
      lista.addEventListener("click", (e) => { const b = e.target.closest(".tela"); if (b) mostrar(+b.dataset.i); });
      mostrar(0);
    }

    // Colecciones
    const col = $("#colecciones");
    if (col) col.innerHTML = COLECCIONES.map((c) => `
      <a class="coleccion" href="tienda.html">
        ${img(c, "")}
        <div class="coleccion-texto">
          <div><h3>${c.nombre}</h3><p>${c.texto}</p></div>
          <span class="coleccion-flecha" aria-hidden="true">${ICONOS.flecha}</span>
        </div>
      </a>`).join("");

    const dest = $("#destacados");
    if (dest) dest.innerHTML = PRODUCTOS.filter((p) => p.destacado).map(tarjeta).join("");

    const hist = $("#historiaFoto");
    if (hist) hist.innerHTML = img(PRODUCTOS[1], "Tanga de encaje palo de rosa sobre lino, con perfume y flores");

    // Reseñas: solo si hay reseñas reales cargadas en data.js
    const res = $("#resenas");
    if (res && RESENAS.length) {
      res.hidden = false;
      $("#resenasLista").innerHTML = RESENAS.map((r) => {
        const p = porHandle(r.producto);
        return `
          <figure class="resena">
            <div class="estrellas" aria-label="${r.estrellas} de 5 estrellas">${Array.from({ length: 5 }, (_, i) => `<span class="${i < r.estrellas ? "" : "apagada"}">${ICONOS.estrella}</span>`).join("")}</div>
            <blockquote>${r.texto}</blockquote>
            <figcaption><b>${r.nombre}</b>${r.ciudad ? `, ${r.ciudad}` : ""}${p ? `<a href="tienda.html">${p.nombre}</a>` : ""}</figcaption>
          </figure>`;
      }).join("");
    }

    const dia = $("#diarioInicio");
    if (dia) dia.innerHTML = DIARIO.slice(0, 3).map(tarjetaDiario).join("");

    initCalculadora();
  }

  /* ---------------- Diario ---------------- */
  const fechaLarga = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  const imagenDiario = (a) => PRODUCTOS.find((p) => p.sku.toLowerCase() === a.imagen) || PRODUCTOS[0];
  const tarjetaDiario = (a) => `
    <article class="nota">
      <a class="nota-foto" href="articulo.html?a=${a.slug}" tabindex="-1" aria-hidden="true">${img(imagenDiario(a), "")}</a>
      <p class="nota-meta"><time datetime="${a.fecha}">${fechaLarga(a.fecha)}</time>, ${a.lectura} de lectura</p>
      <h3><a href="articulo.html?a=${a.slug}">${a.titulo}</a></h3>
      <p>${a.resumen}</p>
    </article>`;

  function initDiario() {
    const g = $("#diarioLista");
    if (g) g.innerHTML = DIARIO.map(tarjetaDiario).join("");
  }
  function initArticulo() {
    const cont = $("#articulo"); if (!cont) return;
    const a = DIARIO.find((x) => x.slug === new URLSearchParams(location.search).get("a"));
    if (!a) {
      cont.innerHTML = `<div class="carrito-vacio"><h1 style="font-size:2rem">No encontramos esta entrada</h1><p>Mira las demás notas del diario.</p><a class="btn" href="diario.html">Ir al diario</a></div>`;
      return;
    }
    document.title = `${a.titulo} | Diario Aurora`;
    $('meta[name="description"]')?.setAttribute("content", a.resumen);
    const p = imagenDiario(a);
    cont.innerHTML = `
      <nav class="migas" aria-label="Ruta"><a href="diario.html">Diario Aurora</a></nav>
      <h1>${a.titulo}</h1>
      <p class="nota-meta"><time datetime="${a.fecha}">${fechaLarga(a.fecha)}</time>, ${a.lectura} de lectura</p>
      <div class="articulo-foto">${img(p, p.nombre, 'loading="eager"')}</div>
      <div class="texto-largo articulo-cuerpo">${a.cuerpo}</div>
      <aside class="articulo-cierre">
        <p class="claim">¿Te quedó alguna duda? Pregúntanos lo que sea.</p>
        <div class="hero-cta">
          <a class="btn" href="tienda.html">Ver el catálogo</a>
          <a class="btn btn--claro" href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener">Escribir por WhatsApp</a>
        </div>
      </aside>`;
    const otras = $("#otrasNotas");
    if (otras) otras.innerHTML = DIARIO.filter((x) => x !== a).slice(0, 3).map(tarjetaDiario).join("");
  }

  /* ---------------- Calculadora de tallas ---------------- */
  // Guía oficial de Aurora Femme (cm). Busto: rango; cadera: máximo.
  const TALLAS = [
    { t: "XS", busto: [55, 59], caderaMax: 73 },
    { t: "S",  busto: [60, 62], caderaMax: 73 },
    { t: "M",  busto: [63, 65], caderaMax: 73 },
    { t: "L",  busto: [66, 68], caderaMax: 83 },
  ];
  function initCalculadora() {
    const form = $("#calculadora");
    if (!form) return;
    const salida = $("#calcResultado");
    const filas = $$("#tablaTallas tbody tr");
    const fuera = () => `Tus medidas pasan nuestra guía. <a class="enlace" href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener">Escríbenos</a> y te asesoramos.`;
    const calcular = () => {
      const busto = parseFloat(form.elements.busto.value);
      const cadera = parseFloat(form.elements.cadera.value);
      filas.forEach((f) => f.classList.remove("marcada"));
      if (isNaN(busto) && isNaN(cadera)) { salida.innerHTML = ""; return; }
      let idx = 0;
      if (!isNaN(busto)) {
        // Cada talla cubre hasta justo antes de donde empieza la siguiente (59,5 es XS; 62,5 es S)
        let i = TALLAS.findIndex((t, k) => busto < (TALLAS[k + 1] ? TALLAS[k + 1].busto[0] : t.busto[1] + 1));
        if (i === -1) { salida.innerHTML = fuera(); return; }
        idx = Math.max(idx, i);
      }
      if (!isNaN(cadera)) {
        const i = TALLAS.findIndex((t) => cadera <= t.caderaMax);
        if (i === -1) { salida.innerHTML = fuera(); return; }
        idx = Math.max(idx, i);
      }
      filas[idx]?.classList.add("marcada");
      salida.innerHTML = `<b>${TALLAS[idx].t}</b> es tu talla. Los hilos y panties son talla única y te quedan de XS a L.`;
    };
    form.addEventListener("input", calcular);
    form.addEventListener("submit", (e) => e.preventDefault());
  }

  /* ---------------- Arranque ---------------- */
  montarCabecera();
  montarPie();
  if (pagina === "inicio") initInicio();
  if (pagina === "diario") initDiario();
  if (pagina === "articulo") initArticulo();
})();
