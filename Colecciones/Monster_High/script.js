// Preloader
document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const duration = getComputedStyle(document.documentElement).getPropertyValue("--preloader-time").trim();
  const ms = parseFloat(duration) * (duration.includes("ms") ? 1 : 1000);
  setTimeout(() => preloader.classList.add("hide"), ms);
});

const URLs = {
  animacion: "https://raw.githubusercontent.com/lzrdrz10/sv/main/Categorias/animacion/index.html",
  peliculas: "https://raw.githubusercontent.com/lzrdrz10/sv/main/Categorias/movie/index.html",
  series:    "https://raw.githubusercontent.com/lzrdrz10/sv/main/Categorias/serie/index.html"
};
const filtroNombre = "Monster High";

const contenedores = {
  animacion: document.getElementById("contenedorAnimacion"),
  peliculas: document.getElementById("contenedorPeliculas"),
  series:    document.getElementById("contenedorSeries")
};

const secciones = {
  animacion: contenedores.animacion.closest(".sesionAdulto"),
  peliculas: contenedores.peliculas.closest(".sesionAdulto"),
  series:    contenedores.series.closest(".sesionAdulto")
};

let titulosUsados = new Set(); // Para evitar duplicados

function obtenerHTML(url) {
  return fetch(url).then(r => r.text()).catch(() => "");
}

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
    
    // === EVITAR DUPLICADOS: PRIORIDAD ANIMACIÓN > PELÍCULAS > SERIES ===
    if (titulosUsados.has(tituloNormalizado)) return;

    const yearDiv = article.querySelector("div.text-xs.text-white\\/70");
    if (!yearDiv) return;
    const year = yearDiv.innerText.trim().match(/\d{4}/)?.[0];
    if (!year) return;

    lista.push({ year: parseInt(year), titulo, link, poster, categoria: tipo });
    titulosUsados.add(tituloNormalizado); // Marcar como usado
  });
  return lista;
}

async function cargarColeccion(categoria, url, contenedor, seccionElement) {
  const html = await obtenerHTML(url);
  let lista = procesarHTML(html, categoria);
  lista.sort((a, b) => a.year - b.year);

  // Ocultar sección si está vacía
  if (lista.length === 0) {
    seccionElement.style.display = "none";
    return;
  } else {
    seccionElement.style.display = "block";
  }

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


(async () => {
  titulosUsados.clear();

  await cargarColeccion("Animación", URLs.animacion, contenedores.animacion, secciones.animacion);
  await cargarColeccion("Movie", URLs.peliculas, contenedores.peliculas, secciones.peliculas);
  await cargarColeccion("Serie", URLs.series, contenedores.series, secciones.series);
})();
