/* =========================================================
   Aurora Femme — lógica de la tienda
   Cabecera/pie compartidos, carrito, pedido por WhatsApp,
   catálogo, ficha de producto y calculadora de tallas.
   ========================================================= */

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pagina = document.body.dataset.pagina || "";

  const pesos = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const porHandle = (h) => PRODUCTOS.find((p) => p.handle === h);
  const urlProducto = (p) => `producto.html?p=${encodeURIComponent(p.handle)}`;

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
    ["tienda.html", "Tienda", "tienda"],
    ["tienda.html?c=hilos-graduables", "Hilos graduables", "hilos"],
    ["tienda.html?c=panties-invisibles", "Panties invisibles", "panties"],
    ["diario.html", "Diario", "diario"],
    ["nosotras.html", "Nosotras", "nosotras"],
  ];

  function montarCabecera() {
    const destino = $("#cabecera");
    if (!destino) return;
    const actual = new URLSearchParams(location.search).get("c");
    const activo = (clave) =>
      (clave === "tienda" && pagina === "tienda" && !actual) ||
      (clave === "hilos" && actual === "hilos-graduables") ||
      (clave === "panties" && actual === "panties-invisibles") ||
      (clave === "nosotras" && pagina === "nosotras") ||
      (clave === "diario" && (pagina === "diario" || pagina === "articulo"));
    destino.outerHTML = `
      <div class="aviso">Envío gratis desde <strong>${pesos(TIENDA.envioGratisDesde)}</strong> a toda Colombia</div>
      <header class="cabecera">
        <div class="wrap">
          <nav class="nav" aria-label="Principal">
            ${navLinks.slice(0, 4).map(([h, t, k]) => `<a href="${h}" ${activo(k) ? 'aria-current="page"' : ""}>${t}</a>`).join("")}
          </nav>
          <button class="icono-btn menu-btn" id="abrirMenu" aria-label="Abrir menú" aria-expanded="false">${ICONOS.menu}</button>
          <a class="logo" href="index.html" aria-label="Aurora Femme, inicio">${img(LOGO, "Aurora Femme", 'loading="eager"')}</a>
          <div class="acciones">
            <a class="nav-extra" href="nosotras.html" ${activo("nosotras") ? 'aria-current="page"' : ""}>Nosotras</a>
            <button class="icono-btn" id="abrirBuscar" aria-label="Buscar productos">${ICONOS.lupa}</button>
            <button class="icono-btn" id="abrirCarrito" aria-label="Abrir bolsa de compras">
              ${ICONOS.bolsa}<span class="contador" data-n="0">0</span>
            </button>
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
    $("#abrirCarrito").addEventListener("click", abrirCarrito);
    montarBuscador();
  }

  /* ---------------- Buscador ---------------- */
  const sinTildes = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function montarBuscador() {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="buscador" id="buscador" role="dialog" aria-modal="true" aria-label="Buscar productos" aria-hidden="true">
        <div class="wrap">
          <div class="buscador-barra">
            ${ICONOS.lupa}
            <label class="sr-only" for="buscarInput">Buscar</label>
            <input id="buscarInput" type="search" placeholder="Busca por color, encaje, panty…" autocomplete="off">
            <button class="icono-btn" id="cerrarBuscar" aria-label="Cerrar búsqueda">${ICONOS.cerrar}</button>
          </div>
          <div class="buscador-sugerencias" id="buscarSugerencias">
            ${["Negro", "Encaje", "Sin costuras", "Palo de rosa", "Nude"].map((t) => `<button class="chip" data-sugerencia="${t}">${t}</button>`).join("")}
          </div>
          <div class="buscador-resultados" id="buscarResultados" aria-live="polite"></div>
        </div>
      </div>`);
    const caja = $("#buscador"), input = $("#buscarInput"), salida = $("#buscarResultados");
    const nudes = ["arena", "champagne", "duna", "avellana", "chocolate", "palo-de-rosa"];
    const buscar = () => {
      const q = sinTildes(input.value.trim());
      if (!q) { salida.innerHTML = ""; return; }
      const res = PRODUCTOS.filter((p) => {
        const col = COLECCIONES.find((c) => c.id === p.coleccion);
        const texto = sinTildes([p.nombre, p.detalle, p.desc, p.sku, COLORES[p.color].nombre, col?.nombre, nudes.includes(p.color) ? "nude piel" : ""].join(" "));
        return q.split(/\s+/).every((t) => texto.includes(t));
      });
      salida.innerHTML = res.length
        ? `<p class="conteo">${res.length} ${res.length === 1 ? "resultado" : "resultados"}</p><div class="grilla">${res.map(tarjeta).join("")}</div>`
        : `<p class="buscador-vacio">No encontramos «${input.value.trim()}». Prueba con un color, «encaje» o «sin costuras», o <a class="enlace" href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener">pregúntanos por WhatsApp</a>.</p>`;
    };
    input.addEventListener("input", buscar);
    $$("[data-sugerencia]").forEach((b) => b.addEventListener("click", () => { input.value = b.dataset.sugerencia; buscar(); input.focus(); }));
    const abrir = () => { caja.classList.add("abierto"); caja.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; setTimeout(() => input.focus(), 60); };
    const cerrar = () => { if (!caja.classList.contains("abierto")) return; caja.classList.remove("abierto"); caja.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; $("#abrirBuscar").focus(); };
    $("#abrirBuscar").addEventListener("click", abrir);
    $("#cerrarBuscar").addEventListener("click", cerrar);
    caja.addEventListener("click", (e) => { if (e.target === caja) cerrar(); if (e.target.closest("[data-agregar]")) cerrar(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); abrir(); }
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
                <li><a href="tienda.html?c=hilos-graduables">Hilos graduables</a></li>
                <li><a href="tienda.html?c=panties-invisibles">Panties invisibles</a></li>
                <li><a href="tienda.html">Todo el catálogo</a></li>
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

  /* ---------------- Carrito ---------------- */
  const CLAVE = "aurora-bolsa-v1";
  let bolsa = [];
  try { bolsa = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { bolsa = []; }
  bolsa = bolsa.filter((l) => porHandle(l.h));

  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(bolsa)); } catch {} };
  const unidades = () => bolsa.reduce((s, l) => s + l.q, 0);
  const subtotal = () => bolsa.reduce((s, l) => s + porHandle(l.h).precio * l.q, 0);
  const envio = () => (subtotal() >= TIENDA.envioGratisDesde || !bolsa.length ? 0 : TIENDA.costoEnvio);

  function agregar(handle, q = 1) {
    const linea = bolsa.find((l) => l.h === handle);
    linea ? (linea.q += q) : bolsa.push({ h: handle, q });
    guardar(); pintarCarrito();
    const p = porHandle(handle);
    aviso(`Agregaste ${p.nombre} a tu bolsa`);
  }
  function cambiar(handle, delta) {
    const linea = bolsa.find((l) => l.h === handle);
    if (!linea) return;
    linea.q += delta;
    if (linea.q <= 0) bolsa = bolsa.filter((l) => l.h !== handle);
    guardar(); pintarCarrito();
  }

  function montarCarrito() {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="velo" id="velo"></div>
      <aside class="carrito" id="carrito" role="dialog" aria-modal="true" aria-labelledby="tituloBolsa" aria-hidden="true">
        <div class="carrito-cabeza">
          <h2 id="tituloBolsa">Tu bolsa</h2>
          <button class="icono-btn" id="cerrarCarrito" aria-label="Cerrar bolsa">${ICONOS.cerrar}</button>
        </div>
        <div id="carritoContenido" style="display:flex;flex-direction:column;flex:1;min-height:0"></div>
      </aside>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>`);
    $("#cerrarCarrito").addEventListener("click", cerrarCarrito);
    $("#velo").addEventListener("click", cerrarCarrito);
    document.addEventListener("keydown", (e) => e.key === "Escape" && cerrarCarrito());
    pintarCarrito();
  }

  let vista = "bolsa";
  function abrirCarrito() {
    vista = "bolsa"; pintarCarrito();
    $("#carrito").classList.add("abierto"); $("#carrito").setAttribute("aria-hidden", "false");
    $("#velo").classList.add("visible"); document.body.style.overflow = "hidden";
    setTimeout(() => $("#cerrarCarrito").focus(), 50);
  }
  function cerrarCarrito() {
    const c = $("#carrito");
    if (!c || !c.classList.contains("abierto")) return;
    c.classList.remove("abierto"); c.setAttribute("aria-hidden", "true");
    $("#velo").classList.remove("visible"); document.body.style.overflow = "";
  }

  function pintarCarrito() {
    $$(".contador").forEach((c) => { c.textContent = unidades(); c.dataset.n = unidades(); });
    const cont = $("#carritoContenido");
    if (!cont) return;

    if (!bolsa.length) {
      cont.innerHTML = `
        <div class="carrito-cuerpo"><div class="carrito-vacio">
          <h3>Tu bolsa está vacía</h3>
          <p>Empieza por los hilos de encaje: hay ocho colores.</p>
          <a class="btn" href="tienda.html">Ver la tienda</a>
        </div></div>`;
      return;
    }

    const falta = TIENDA.envioGratisDesde - subtotal();
    const pct = Math.min(100, (subtotal() / TIENDA.envioGratisDesde) * 100);
    const meta = `
      <div class="envio-meta">
        ${falta > 0 ? `Te faltan <b>${pesos(falta)}</b> para el envío gratis.` : "Tu pedido tiene <b>envío gratis</b>."}
        <div class="barra"><i style="width:${pct}%"></i></div>
      </div>`;
    const totales = `
      <div class="totales">
        <div><span>Subtotal</span><span>${pesos(subtotal())}</span></div>
        <div><span>Envío</span><span>${envio() ? pesos(envio()) : "Gratis"}</span></div>
        <div class="total"><span>Total</span><span>${pesos(subtotal() + envio())}</span></div>
      </div>`;

    if (vista === "bolsa") {
      cont.innerHTML = `
        ${meta}
        <div class="carrito-cuerpo">
          ${bolsa.map((l) => {
            const p = porHandle(l.h);
            return `
              <div class="linea-item">
                <a href="${urlProducto(p)}">${img(p, p.nombre)}</a>
                <div>
                  <h3>${p.nombre}</h3>
                  <div class="meta">${p.detalle} · Talla única</div>
                  <div class="cantidad" aria-label="Cantidad">
                    <button data-menos="${p.handle}" aria-label="Quitar una">−</button>
                    <span>${l.q}</span>
                    <button data-mas="${p.handle}" aria-label="Agregar una">+</button>
                  </div>
                  <button class="quitar" data-quitar="${p.handle}">Quitar</button>
                </div>
                <div class="linea-precio">${pesos(p.precio * l.q)}</div>
              </div>`;
          }).join("")}
        </div>
        <div class="carrito-pie">
          ${totales}
          <button class="btn btn--bloque" id="irPedido">Continuar con el pedido</button>
          <p class="nota-pago">Confirmas el pago por WhatsApp: Nequi, Daviplata, transferencia o contraentrega.</p>
        </div>`;
      $$("[data-mas]", cont).forEach((b) => b.addEventListener("click", () => cambiar(b.dataset.mas, 1)));
      $$("[data-menos]", cont).forEach((b) => b.addEventListener("click", () => cambiar(b.dataset.menos, -1)));
      $$("[data-quitar]", cont).forEach((b) => b.addEventListener("click", () => cambiar(b.dataset.quitar, -Infinity)));
      $("#irPedido").addEventListener("click", () => { vista = "datos"; pintarCarrito(); $("#f-nombre").focus(); });
    } else {
      let datos = {};
      try { datos = JSON.parse(localStorage.getItem("aurora-datos-v1")) || {}; } catch {}
      const v = (k) => (datos[k] ? String(datos[k]).replace(/"/g, "&quot;") : "");
      cont.innerHTML = `
        <div class="carrito-cuerpo" style="padding-top:20px">
          <button class="volver" id="volverBolsa">Volver a la bolsa</button>
          <h3 style="font-family:var(--f-texto);font-weight:500;margin-bottom:4px">¿A dónde te lo enviamos?</h3>
          <p style="color:var(--gris-seda);font-size:.9rem;margin-bottom:18px">Con estos datos armamos tu pedido y te lo confirmamos por WhatsApp.</p>
          <form class="checkout-form" id="formPedido" novalidate>
            <div class="campo"><label for="f-nombre">Nombre y apellido</label><input id="f-nombre" name="nombre" autocomplete="name" required value="${v("nombre")}"></div>
            <div class="campo"><label for="f-tel">Celular</label><input id="f-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" required value="${v("tel")}"></div>
            <div class="doble">
              <div class="campo"><label for="f-ciudad">Ciudad</label><input id="f-ciudad" name="ciudad" autocomplete="address-level2" required value="${v("ciudad")}"></div>
              <div class="campo"><label for="f-depto">Departamento</label><input id="f-depto" name="depto" autocomplete="address-level1" required value="${v("depto")}"></div>
            </div>
            <div class="campo"><label for="f-dir">Dirección y barrio</label><input id="f-dir" name="dir" autocomplete="street-address" required value="${v("dir")}"></div>
            <div class="campo"><label for="f-pago">¿Cómo quieres pagar?</label>
              <select id="f-pago" name="pago">
                ${["Nequi", "Daviplata", "Transferencia Bancolombia", "Contraentrega"].map((m) => `<option ${datos.pago === m ? "selected" : ""}>${m}</option>`).join("")}
              </select></div>
            <div class="campo"><label for="f-nota">Nota (opcional)</label><textarea id="f-nota" name="nota" placeholder="Es un regalo, entregar en portería…"></textarea></div>
            <p id="errorPedido" role="alert" style="color:var(--terracota-p);font-size:.9rem;min-height:1em"></p>
          </form>
        </div>
        <div class="carrito-pie">
          ${totales}
          <button class="btn btn--bloque btn--wa" type="submit" form="formPedido">${ICONOS.wa.replace("<svg", '<svg width="20" height="20"')} Enviar pedido por WhatsApp</button>
          <p class="nota-pago">Se abre WhatsApp con tu pedido listo para enviar.</p>
        </div>`;
      $("#volverBolsa").addEventListener("click", () => { vista = "bolsa"; pintarCarrito(); });
      $("#formPedido").addEventListener("submit", enviarPedido);
    }
  }

  function enviarPedido(e) {
    e.preventDefault();
    const f = e.target;
    const d = Object.fromEntries(new FormData(f).entries());
    const faltan = [...f.querySelectorAll("[required]")].filter((i) => !i.value.trim());
    if (faltan.length) {
      $("#errorPedido").textContent = "Completa nombre, celular, ciudad, departamento y dirección para enviar el pedido.";
      faltan[0].focus();
      return;
    }
    try { localStorage.setItem("aurora-datos-v1", JSON.stringify({ ...d, nota: "" })); } catch {}

    const lineas = bolsa.map((l) => {
      const p = porHandle(l.h);
      return `• ${l.q} × ${p.nombre} (${p.sku}) — ${pesos(p.precio * l.q)}`;
    });
    const msg = [
      "Hola Aurora Femme 💕 quiero hacer este pedido:",
      "",
      ...lineas,
      "",
      `Subtotal: ${pesos(subtotal())}`,
      `Envío: ${envio() ? pesos(envio()) : "Gratis"}`,
      `*Total: ${pesos(subtotal() + envio())}*`,
      "",
      `Nombre: ${d.nombre}`,
      `Celular: ${d.tel}`,
      `Dirección: ${d.dir}, ${d.ciudad}, ${d.depto}`,
      `Pago: ${d.pago}`,
      d.nota ? `Nota: ${d.nota}` : "",
    ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");

    window.open(`https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    bolsa = []; guardar(); vista = "bolsa";
    $("#carritoContenido").innerHTML = `
      <div class="carrito-cuerpo"><div class="carrito-vacio">
        <h3>Pedido enviado a WhatsApp</h3>
        <p>Te respondemos en horario de atención para confirmar el pago y la fecha de entrega.</p>
        <button class="btn btn--claro" id="seguirComprando">Seguir viendo la tienda</button>
      </div></div>`;
    $$(".contador").forEach((c) => { c.textContent = 0; c.dataset.n = 0; });
    $("#seguirComprando").addEventListener("click", cerrarCarrito);
  }

  let tAviso;
  function aviso(texto) {
    const t = $("#toast"); if (!t) return;
    t.textContent = texto; t.classList.add("visible");
    clearTimeout(tAviso); tAviso = setTimeout(() => t.classList.remove("visible"), 2400);
  }

  /* ---------------- Tarjetas de producto ---------------- */
  const tarjeta = (p) => {
    const c = COLORES[p.color];
    return `
      <article class="tarjeta">
        <div class="tarjeta-media">
          <a class="tarjeta-foto" href="${urlProducto(p)}" tabindex="-1" aria-hidden="true">${img(p, "")}</a>
          <button class="tarjeta-agregar" data-agregar="${p.handle}" aria-label="Agregar ${p.nombre} a la bolsa">Agregar a la bolsa</button>
        </div>
        <div class="tarjeta-info">
          <h3><a href="${urlProducto(p)}">${p.nombre}</a></h3>
          <span class="tarjeta-precio">${pesos(p.precio)}</span>
          <span class="tarjeta-color"><i class="punto" style="--c:${c.hex}"></i>${p.detalle}</span>
        </div>
      </article>`;
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-agregar]");
    if (b) { e.preventDefault(); agregar(b.dataset.agregar); }
  });

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
        ficha.href = urlProducto(p);
        ficha.querySelector("strong").textContent = p.nombre;
        ficha.querySelector("span").textContent = `${pesos(p.precio)} · ${p.detalle}`;
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
      <a class="coleccion" href="tienda.html?c=${c.id}">
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
            <figcaption><b>${r.nombre}</b>${r.ciudad ? `, ${r.ciudad}` : ""}${p ? `<a href="${urlProducto(p)}">${p.nombre}</a>` : ""}</figcaption>
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
          <a class="btn" href="tienda.html">Ver la tienda</a>
          <a class="btn btn--claro" href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener">Escribir por WhatsApp</a>
        </div>
      </aside>`;
    const otras = $("#otrasNotas");
    if (otras) otras.innerHTML = DIARIO.filter((x) => x !== a).slice(0, 3).map(tarjetaDiario).join("");
  }

  /* ---------------- Calculadora de tallas ---------------- */
  const TALLAS = [
    { t: "XS", busto: [80, 84], cintura: [60, 64], cadera: [86, 90] },
    { t: "S", busto: [85, 89], cintura: [65, 69], cadera: [91, 95] },
    { t: "M", busto: [90, 94], cintura: [70, 74], cadera: [96, 100] },
    { t: "L", busto: [95, 100], cintura: [75, 80], cadera: [101, 106] },
    { t: "XL", busto: [101, 107], cintura: [81, 87], cadera: [107, 113] },
  ];
  function initCalculadora() {
    const form = $("#calculadora");
    if (!form) return;
    const salida = $("#calcResultado");
    const filas = $$("#tablaTallas tbody tr");
    const calcular = () => {
      const val = (n) => parseFloat(form.elements[n].value);
      const medidas = ["busto", "cintura", "cadera"].filter((m) => !isNaN(val(m)));
      filas.forEach((f) => f.classList.remove("marcada"));
      if (!medidas.length) { salida.innerHTML = ""; return; }
      // Por cada medida, la talla que la contiene; se queda con la mayor
      let idx = -1;
      for (const m of medidas) {
        const v = val(m);
        let i = TALLAS.findIndex((t) => v <= t[m][1]);
        if (i === -1) i = TALLAS.length; // por encima de XL
        idx = Math.max(idx, i);
      }
      if (idx >= TALLAS.length) {
        salida.innerHTML = `Tus medidas pasan nuestra tabla. <a class="enlace" href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener">Escríbenos</a> y te asesoramos.`;
        return;
      }
      filas[idx]?.classList.add("marcada");
      salida.innerHTML = `<b>${TALLAS[idx].t}</b> es tu talla. Los hilos y panties son talla única y te quedan de XS a L.`;
    };
    form.addEventListener("input", calcular);
    form.addEventListener("submit", (e) => e.preventDefault());
  }

  /* ---------------- Tienda ---------------- */
  function initTienda() {
    const grilla = $("#grilla"); if (!grilla) return;
    const params = new URLSearchParams(location.search);
    let filtro = params.get("c") || "todo";
    let orden = "recomendado";
    let color = params.get("color") || "";
    const titulo = $("#tituloTienda"), bajada = $("#bajadaTienda"), colores = $("#filtroColores");

    const pintarColores = () => {
      const disponibles = [...new Set(PRODUCTOS.filter((p) => filtro === "todo" || p.coleccion === filtro).map((p) => p.color))];
      if (color && !disponibles.includes(color)) color = "";
      colores.innerHTML = disponibles.map((k) => `
        <button class="tela tela--chica" style="--c:${COLORES[k].hex}" data-color="${k}" aria-pressed="${k === color}" aria-label="${COLORES[k].nombre}" title="${COLORES[k].nombre}"></button>`).join("")
        + (color ? `<button class="quitar" id="limpiarColor">Quitar color</button>` : "");
      $$("[data-color]", colores).forEach((b) => b.addEventListener("click", () => { color = color === b.dataset.color ? "" : b.dataset.color; pintar(); }));
      $("#limpiarColor")?.addEventListener("click", () => { color = ""; pintar(); });
    };

    const pintar = () => {
      pintarColores();
      let lista = PRODUCTOS.filter((p) => (filtro === "todo" || p.coleccion === filtro) && (!color || p.color === color));
      if (orden === "menor") lista = [...lista].sort((a, b) => a.precio - b.precio);
      if (orden === "mayor") lista = [...lista].sort((a, b) => b.precio - a.precio);
      grilla.innerHTML = lista.length ? lista.map(tarjeta).join("")
        : `<div class="carrito-vacio" style="grid-column:1/-1"><h3>Nada en este color por ahora</h3><p>Quita el filtro de color para ver toda la línea.</p></div>`;
      $("#conteo").textContent = `${lista.length} ${lista.length === 1 ? "pieza" : "piezas"}`;
      const col = COLECCIONES.find((c) => c.id === filtro);
      const u = new URL(location);
      filtro === "todo" ? u.searchParams.delete("c") : u.searchParams.set("c", filtro);
      color ? u.searchParams.set("color", color) : u.searchParams.delete("color");
      history.replaceState(null, "", u);
      titulo.textContent = col ? col.nombre : "Toda la tienda";
      bajada.textContent = col ? col.texto : "Hilos de encaje con tirantes graduables y panties invisibles sin costuras. Todo en talla única.";
      document.title = `${col ? col.nombre : "Tienda"} | Aurora Femme`;
      $$(".chip").forEach((c) => c.setAttribute("aria-pressed", c.dataset.filtro === filtro));
    };
    $$(".chip").forEach((c) => c.addEventListener("click", () => {
      filtro = c.dataset.filtro;
      pintar();
    }));
    $("#orden").addEventListener("change", (e) => { orden = e.target.value; pintar(); });
    pintar();
  }

  /* ---------------- Producto ---------------- */
  function initProducto() {
    const cont = $("#producto"); if (!cont) return;
    const p = porHandle(new URLSearchParams(location.search).get("p"));
    if (!p) {
      cont.innerHTML = `<div class="carrito-vacio" style="grid-column:1/-1"><h1 style="font-size:2rem">No encontramos esta pieza</h1><p>Puede que ya no esté disponible. Mira lo que hay en la tienda.</p><a class="btn" href="tienda.html">Ver la tienda</a></div>`;
      return;
    }
    const c = COLORES[p.color];
    const col = COLECCIONES.find((x) => x.id === p.coleccion);
    const hermanos = PRODUCTOS.filter((x) => x.coleccion === p.coleccion && x.desc === p.desc);
    document.title = `${p.nombre} | Aurora Femme`;
    $('meta[name="description"]')?.setAttribute("content", `${p.nombre} ${p.detalle}. ${p.desc}`);
    let q = 1;

    cont.innerHTML = `
      <div class="producto-foto">${img(p, `${p.nombre} ${p.detalle}`, 'loading="eager"')}</div>
      <div class="producto-info">
        <nav class="migas" aria-label="Ruta"><a href="tienda.html">Tienda</a> / <a href="tienda.html?c=${col.id}">${col.nombre}</a></nav>
        <h1>${p.nombre}</h1>
        <p class="detalle">${p.detalle}</p>
        <p class="producto-precio">${pesos(p.precio)} <small style="font-size:.85rem;color:var(--gris-seda)">COP</small></p>

        <div class="bloque">
          <p class="bloque-titulo">Color: <b>${c.nombre}</b></p>
          <div class="variantes">
            ${hermanos.map((h) => `<a href="${urlProducto(h)}" style="--c:${COLORES[h.color].hex}" aria-label="${COLORES[h.color].nombre}" ${h === p ? 'aria-current="true"' : ""}></a>`).join("")}
          </div>
        </div>
        <div class="bloque">
          <p class="bloque-titulo">Talla: <b>Única</b> · se adapta de XS a L</p>
          <div class="comprar">
            <div class="cantidad" aria-label="Cantidad">
              <button id="qMenos" aria-label="Una menos">−</button><span id="qValor">1</span><button id="qMas" aria-label="Una más">+</button>
            </div>
            <button class="btn" id="agregarFicha">Agregar a la bolsa</button>
          </div>
          <ul class="ventajas">
            <li>${ICONOS.camion} Llega en ${TIENDA.entrega}</li>
            <li>${ICONOS.caja} Empaque de regalo sin costo adicional</li>
            <li>${ICONOS.chat} ¿Dudas con tu talla? <a class="enlace" href="https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(`Hola, tengo una pregunta sobre ${p.nombre} (${p.sku})`)}" target="_blank" rel="noopener">Pregúntanos</a></li>
          </ul>
        </div>
        <details class="acordeon" open><summary>Descripción</summary><div><p>${p.desc}</p></div></details>
        <details class="acordeon"><summary>Cuidado de la prenda</summary><div><p>Lava a mano con agua fría y jabón suave. No retuerzas el encaje: presiónalo con una toalla y sécalo a la sombra. No uses blanqueador ni secadora.</p></div></details>
        <details class="acordeon"><summary>Envíos y cambios</summary><div><p>Enviamos a toda Colombia en ${TIENDA.entrega}. Gratis desde ${pesos(TIENDA.envioGratisDesde)}. Por higiene, la ropa interior solo se cambia si llega con defecto de fábrica. <a class="enlace" href="politicas.html#cambios">Ver política</a></p></div></details>
        <p style="font-size:.82rem;color:var(--gris-seda);margin-top:16px">Referencia ${p.sku}</p>
      </div>`;

    $("#qMenos").addEventListener("click", () => { q = Math.max(1, q - 1); $("#qValor").textContent = q; });
    $("#qMas").addEventListener("click", () => { q += 1; $("#qValor").textContent = q; });
    $("#agregarFicha").addEventListener("click", () => { agregar(p.handle, q); abrirCarrito(); });

    const rel = $("#relacionados");
    if (rel) rel.innerHTML = PRODUCTOS.filter((x) => x !== p && x.coleccion === p.coleccion).slice(0, 4).map(tarjeta).join("");

    // Datos estructurados para Google
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Product",
      name: p.nombre, sku: p.sku, description: p.desc, color: c.nombre,
      image: new URL(p.img, location.href).href, brand: { "@type": "Brand", name: "Aurora Femme" },
      offers: { "@type": "Offer", priceCurrency: "COP", price: p.precio, availability: "https://schema.org/InStock" },
    });
    document.head.appendChild(ld);
  }

  /* ---------------- Arranque ---------------- */
  montarCabecera();
  montarPie();
  montarCarrito();
  if (pagina === "inicio") initInicio();
  if (pagina === "tienda") initTienda();
  if (pagina === "producto") initProducto();
  if (pagina === "diario") initDiario();
  if (pagina === "articulo") initArticulo();
})();
