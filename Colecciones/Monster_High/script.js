// Preloader
document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const duration = getComputedStyle(document.documentElement).getPropertyValue("--preloader-time").trim();
  const ms = parseFloat(duration) * (duration.includes("ms") ? 1 : 1000);
  setTimeout(() => preloader.classList.add("hide"), ms);
});

// === CLAVES DE CACHÉ ===
const CACHE_KEYS = {
  animacion: "cache_monsterhigh_animacion",
  peliculas: "cache_monsterhigh_peliculas",
  series: "cache_monsterhigh_series"
};

// === URLs Y CONTENEDORES ===
const URLs = {
  animacion: "https://raw.githubusercontent.com/lzrdrz10/sv/main/Categorias/animacion/index.html",
  peliculas: "https://raw.githubusercontent.com/lzrdrz10/sv/main/Categorias/movie/index.html",
  series: "https://raw.githubusercontent.com/lzrdrz10/sv/main/Categorias/serie/index.html"
};
const filtroNombre = "Monster High";
const contenedores = {
  animacion: document.getElementById("contenedorAnimacion"),
  peliculas: document.getElementById("contenedorPeliculas"),
  series: document.getElementById("contenedorSeries")
};
const secciones = {
  animacion: contenedores.animacion.closest(".sesionAdulto"),
  peliculas: contenedores.peliculas.closest(".sesionAdulto"),
  series: contenedores.series.closest(".sesionAdulto")
};

// === CACHÉ PERSISTENTE ===
function getCachedData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn("Error leyendo caché:", e);
    return null;
  }
}

function setCachedData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Error guardando caché:", e);
  }
}

// === CONJUNTO GLOBAL DE TÍTULOS USADOS (PRIORIDAD: ANIMACIÓN > PELÍCULAS > SERIES) ===
let titulosBloqueados = new Set(); // Títulos ya asignados (evita duplicados entre categorías)

// === PROCESAR HTML Y EXTRAER ITEMS ===
function procesarHTML(html, tipo) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const lista = [];

  temp.querySelectorAll("article").forEach(article => {
    const a = article.querySelector("a");
    if (!a) return;
    const link = a.getAttribute("href")?.replace("../../", "");
    const img = article.querySelector("img");
    if (!img) return;
    const poster = img.src;
    const tituloDiv = article.querySelector("div.mt-2.font-semibold");
    if (!tituloDiv) return;
    const titulo = tituloDiv.innerText.trim();
    if (!titulo.toLowerCase().includes(filtroNombre.toLowerCase())) return;

    const tituloNormalizado = titulo.toLowerCase().trim();
    if (titulosBloqueados.has(tituloNormalizado)) return; // Ya usado en categoría superior

    const yearDiv = article.querySelector("div.text-xs.text-white\\/70");
    if (!yearDiv) return;
    const year = yearDiv.innerText.trim().match(/\d{4}/)?.[0];
    if (!year) return;

    lista.push({
      year: parseInt(year),
      titulo,
      link,
      poster,
      categoria: tipo
    });
    titulosBloqueados.add(tituloNormalizado); // Bloquear para categorías inferiores
  });

  return lista.sort((a, b) => a.year - b.year);
}

// === RENDERIZAR LISTA ===
function renderizarLista(lista, contenedor, seccionElement) {
  if (lista.length === 0) {
    seccionElement.style.display = "none";
    return;
  }
  seccionElement.style.display = "block";

  contenedor.innerHTML = "";
  lista.forEach((item, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "sesionAdultoTarjetaWrapper";
    const enlace = document.createElement("a");
    enlace.className = "sesionAdultoTarjeta";
    enlace.href = item.link;
    enlace.setAttribute("aria-label", item.titulo);
    enlace.innerHTML = `
      <img class="sesionAdultoPoster" src="${item.poster}" loading="lazy" decoding="async">
      <div class="sesionAdultoOverlay"></div>
      <span class="sesionAdultoBadge">${item.categoria} ${i + 1}</span>
    `;
    const titulo = document.createElement("div");
    titulo.className = "sesionAdultoTitle";
    titulo.textContent = item.titulo;
    wrapper.appendChild(enlace);
    wrapper.appendChild(titulo);
    contenedor.appendChild(wrapper);
  });
}

// === CARGAR COLECCIÓN CON CACHÉ + PRIORIDAD ===
async function cargarColeccion(categoria, url, contenedor, seccionElement, cacheKey) {
  let listaFinal = [];

  // 1. Cargar caché
  const cached = getCachedData(cacheKey);
  if (cached && Array.isArray(cached)) {
    listaFinal = cached;
    console.log(`Caché cargado: ${categoria} (${listaFinal.length} ítems)`);
  }

  // 2. Descargar contenido actual
  console.log(`Buscando nuevos ítems en ${categoria}...`);
  const html = await fetch(url).then(r => r.text()).catch(() => "");
  const nuevosItems = procesarHTML(html, categoria === "Movie" ? "Movie" : categoria === "Serie" ? "Serie" : "Animación");

  // 3. Agregar solo ítems nuevos (por link)
  const linksExistentes = new Set(listaFinal.map(i => i.link));
  const itemsNuevos = nuevosItems.filter(item => !linksExistentes.has(item.link));

  if (itemsNuevos.length > 0) {
    listaFinal.push(...itemsNuevos);
    listaFinal.sort((a, b) => a.year - b.year);
    setCachedData(cacheKey, listaFinal);
    console.log(`+${itemsNuevos.length} nuevos en ${categoria}`);
  } else {
    console.log(`Sin cambios en ${categoria}`);
  }

  // 4. Renderizar
  renderizarLista(listaFinal, contenedor, seccionElement);
}

// === EJECUCIÓN EN ORDEN DE PRIORIDAD ===
(async () => {
  titulosBloqueados.clear();

  // 1. ANIMACIÓN (máxima prioridad)
  await cargarColeccion("Animación", URLs.animacion, contenedores.animacion, secciones.animacion, CACHE_KEYS.animacion);

  // 2. PELÍCULAS (solo si no está en Animación)
  await cargarColeccion("Movie", URLs.peliculas, contenedores.peliculas, secciones.peliculas, CACHE_KEYS.peliculas);

  // 3. SERIES (solo si no está en ninguna otra)
  await cargarColeccion("Serie", URLs.series, contenedores.series, secciones.series, CACHE_KEYS.series);
})();
