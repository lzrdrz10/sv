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

// === CACHÉ ===
function getCachedData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function setCachedData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// === CONJUNTO GLOBAL DE TÍTULOS BLOQUEADOS (PRIORIDAD) ===
let titulosBloqueados = new Set();

// === PROCESAR HTML ===
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

    const tituloNorm = titulo.toLowerCase().trim();
    if (titulosBloqueados.has(tituloNorm)) return;

    const yearDiv = article.querySelector("div.text-xs.text-white\\/70");
    if (!yearDiv) return;
    const year = yearDiv.innerText.trim().match(/\d{4}/)?.[0];
    if (!year) return;

    lista.push({ year: parseInt(year), titulo, link, poster, categoria: tipo });
    titulosBloqueados.add(tituloNorm);
  });

  return lista.sort((a, b) => a.year - b.year);
}

// === RENDERIZAR ===
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

// === CARGAR CON CACHÉ RÁPIDO (solo fetch si no hay caché) ===
async function cargarColeccion(categoria, url, contenedor, seccionElement, cacheKey) {
  const cached = getCachedData(cacheKey);

  // SI HAY CACHÉ → CARGA INMEDIATA
  if (cached && Array.isArray(cached)) {
    console.log(`Cargado desde caché: ${categoria}`);
    renderizarLista(cached, contenedor, seccionElement);
    return;
  }

  // SI NO HAY CACHÉ → DESCARGAR Y GUARDAR
  console.log(`Descargando ${categoria} (primera vez)...`);
  const html = await fetch(url).then(r => r.text()).catch(() => "");
  const lista = procesarHTML(html, categoria === "Movie" ? "Movie" : categoria === "Serie" ? "Serie" : "Animación");

  setCachedData(cacheKey, lista);
  renderizarLista(lista, contenedor, seccionElement);
}

// === BOTÓN DE ACTUALIZACIÓN MANUAL (opcional, recomendado) ===
function crearBotonActualizar() {
  const btn = document.createElement("button");
  btn.textContent = "Actualizar Contenido";
  btn.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 9999;
    background: #e300ff; color: white; border: none; padding: 12px 16px;
    border-radius: 50px; font-size: 14px; font-weight: 600;
    box-shadow: 0 4px 12px rgba(227,0,255,0.4);
    cursor: pointer; transition: all 0.3s;
  `;
  btn.onmouseover = () => btn.style.transform = "scale(1.05)";
  btn.onmouseout = () => btn.style.transform = "scale(1)";
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "Actualizando...";
    localStorage.removeItem(CACHE_KEYS.animacion);
    localStorage.removeItem(CACHE_KEYS.peliculas);
    localStorage.removeItem(CACHE_KEYS.series);
    location.reload();
  };
  document.body.appendChild(btn);
}

// === EJECUCIÓN ===
(async () => {
  titulosBloqueados.clear();
  crearBotonActualizar(); // Botón flotante

  await cargarColeccion("Animación", URLs.animacion, contenedores.animacion, secciones.animacion, CACHE_KEYS.animacion);
  await cargarColeccion("Movie", URLs.peliculas, contenedores.peliculas, secciones.peliculas, CACHE_KEYS.peliculas);
  await cargarColeccion("Serie", URLs.series, contenedores.series, secciones.series, CACHE_KEYS.series);
})();
