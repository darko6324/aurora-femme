/* =========================================================
   Aurora Femme — medición (Google Analytics 4, Google Ads y píxel de Meta)
   Para activar o cambiar una herramienta, solo cambia su ID aquí abajo.
   Un ID vacío ("") deja esa herramienta apagada.
   ========================================================= */
(function () {
  var IDS = {
    ga4: "",                       // Google Analytics 4 · ID de medición "G-XXXXXXXXXX"
    googleAds: "AW-18428516057",   // Google Ads · etiqueta de la cuenta 393-753-6064
    metaPixel: "",                 // Meta (Facebook / Instagram) · ID del conjunto de datos (solo números)
  };
  // Conversiones de Google Ads: "AW-.../etiqueta". Vacías = no se envían a Ads (GA4 y Meta sí reciben el evento).
  var CONVERSIONES_ADS = {
    whatsapp: "",                  // clic en WhatsApp
    agregar: "",                   // agrega una pieza a la bolsa
    pedido: "",                    // envía el pedido desde la bolsa
  };

  var MONEDA = "COP";
  var PLATAFORMA = "https://pedidos.laempanadaguerrera.com";

  /* ---------- Carga de las etiquetas ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var primerGoogle = IDS.ga4 || IDS.googleAds;
  if (primerGoogle) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + primerGoogle;
    document.head.appendChild(s);
    gtag("js", new Date());
    if (IDS.ga4) gtag("config", IDS.ga4);
    if (IDS.googleAds) gtag("config", IDS.googleAds);
  }

  if (IDS.metaPixel) {
    /* Código base del píxel de Meta */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", IDS.metaPixel);
    window.fbq("track", "PageView");
  }

  /* ---------- Un solo punto para enviar eventos a las tres herramientas ---------- */
  // ga: nombre del evento en GA4 · meta: nombre del evento estándar de Meta · conv: clave en CONVERSIONES_ADS
  function medir(ga, datos, meta, conv) {
    datos = datos || {};
    if (primerGoogle) gtag("event", ga, datos);
    if (IDS.metaPixel && meta) {
      var m = {};
      if (datos.value != null) { m.value = datos.value; m.currency = datos.currency || MONEDA; }
      if (datos.items && datos.items.length) {
        m.content_ids = datos.items.map(function (i) { return i.item_id; });
        m.content_name = datos.items[0].item_name;
        m.content_type = "product";
      }
      window.fbq("track", meta, m);
    }
    var etiqueta = conv && CONVERSIONES_ADS[conv];
    if (etiqueta && IDS.googleAds) gtag("event", "conversion", { send_to: etiqueta, value: datos.value, currency: datos.currency || MONEDA });
  }
  window.auroraMedir = medir;

  /* ---------- Producto que se está viendo (sale de los datos para Google de la ficha) ---------- */
  function productoDeLaPagina() {
    var bloques = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < bloques.length; i++) {
      try {
        var d = JSON.parse(bloques[i].textContent);
        if (d["@type"] !== "Product" && d["@type"] !== "ProductGroup") continue;
        var oferta = d.offers || (d.hasVariant && d.hasVariant[0] && d.hasVariant[0].offers) || {};
        return {
          item_id: d.productGroupID || d.sku,
          item_name: d.name,
          item_brand: "Aurora Femme",
          item_category: d.category,
          item_variant: d.color,
          price: Number(oferta.price) || undefined,
        };
      } catch (e) { /* bloque sin JSON válido */ }
    }
    return null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var pagina = document.body.dataset.pagina;
    var p = productoDeLaPagina();
    if (pagina === "producto" && p) {
      medir("view_item", { currency: MONEDA, value: p.price, items: [p] }, "ViewContent");
    }
    if (pagina === "categoria") {
      var nombre = (document.querySelector("h1") || {}).textContent || "";
      medir("view_item_list", { item_list_name: nombre.trim() });
    }
  });

  /* ---------- Clics: WhatsApp y "Agregar a la bolsa" desde una ficha ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (/wa\.me\/|api\.whatsapp\.com/.test(href)) {
      medir("contact", { method: "whatsapp", link_url: location.pathname }, "Contact", "whatsapp");
    } else if (/tienda\.html\?producto=/.test(href)) {
      var p = productoDeLaPagina();
      medir("select_item", { items: p ? [p] : [] });
    }
  }, true);

  /* ---------- Tienda embebida (tienda.html): bolsa y pedido ---------- */
  var unidades = null;
  window.addEventListener("message", function (e) {
    if (e.origin !== PLATAFORMA) return;
    var m = e.data || {};
    if (typeof m.tipo !== "string" || m.tipo.indexOf("aurora:") !== 0) return;
    var tipo = m.tipo.slice(7);
    if (tipo === "bolsa") {
      var n = Number(m.unidades) || 0;
      // La primera lectura solo dice cuántas había guardadas; se mide cuando aumentan
      if (unidades !== null && n > unidades) {
        var datos = { currency: MONEDA, quantity: n - unidades };
        if (m.total != null) datos.value = Number(m.total) || undefined;
        medir("add_to_cart", datos, "AddToCart", "agregar");
      }
      unidades = n;
    } else if (tipo === "bolsa-abierta") {
      medir("view_cart", { currency: MONEDA }, null);
    } else if (tipo === "pedido") {
      // Lo envía la plataforma al confirmar un pedido: { total, unidades, codigo }
      medir("purchase", { currency: MONEDA, value: Number(m.total) || undefined, transaction_id: m.codigo }, "Purchase", "pedido");
    } else if (tipo === "checkout") {
      medir("begin_checkout", { currency: MONEDA, value: Number(m.total) || undefined }, "InitiateCheckout");
    }
  });
})();
