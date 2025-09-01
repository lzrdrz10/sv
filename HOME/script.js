document.addEventListener("DOMContentLoaded", () => {
  loadContent();
});

// 🔹 Extraer datos de una película desde HTML
function parseMovieHtml(html, urlBase, filename) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const titulo = doc.querySelector("title")?.textContent.trim() || "Título desconocido";

  const styleText = doc.querySelector("style")?.textContent || "";
  const heroImage = styleText.match(/body\s*{\s*background:\s*url\(['"]([^'"]+)['"]\)/i)?.[1] || "";

  let posterImage =
    doc.querySelector(".flex.items-center.justify-center.w-\\[110px\\].h-\\[160px\\] img")?.src ||
    doc.querySelector('img[src^="https://image.tmdb.org"]')?.src ||
    "";

  const sinopsis = doc.querySelector("#sinopsis p.text-gray-300.text-sm.leading-relaxed")?.textContent.trim() || "Sinopsis no disponible.";

  const year = doc.querySelector(".year, [class*='year'], [data-year], .flex.flex-wrap.items-center.space-x-2.text-xs.text-gray-400 span:last-child")?.textContent.trim() || "2025";

  return { titulo, heroImage, posterImage, sinopsis, url: `${urlBase}/${filename}`, year };
}

// 🔹 Función genérica para obtener datos de GitHub
async function fetchMedia(apiUrl, urlBase, parserFn, fallbackData = []) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error GitHub: ${response.status}`);
    const data = await response.json();

    const promises = data
      .filter(item => item.type === "file" && item.name.endsWith(".html") && item.name !== "index.html")
      .map(async (item) => {
        try {
          const html = await (await fetch(item.download_url)).text();
          return parserFn(html, urlBase, item.name);
        } catch (e) {
          console.error(`Error procesando ${item.name}:`, e);
          return null;
        }
      });

    const result = (await Promise.all(promises)).filter(Boolean);
    return result.length ? result : fallbackData;
  } catch (e) {
    console.error("Error al cargar media:", e);
    return fallbackData;
  }
}

// 🔹 Manejo de caché
async function getCachedData(key, fetchFn, duration) {
  const now = Date.now();
  const cached = localStorage.getItem(key);
  const timestamp = localStorage.getItem(`${key}Time`);

  if (cached && timestamp && now - parseInt(timestamp, 10) < duration) {
    return JSON.parse(cached);
  }

  const fresh = await fetchFn();
  if (fresh.length) {
    localStorage.setItem(key, JSON.stringify(fresh));
    localStorage.setItem(`${key}Time`, now.toString());
  }
  return fresh;
}

// 🔹 Cargar contenido principal
async function loadContent() {
  const day = 24 * 60 * 60 * 1000;

  const peliculas = await getCachedData("peliculas", () =>
    fetchMedia("https://api.github.com/repos/lzrdrz10/sv/contents/Peliculas", "Peliculas", parseMovieHtml, [
      { titulo: "Fallback Película", heroImage: "", posterImage: "", sinopsis: "Ejemplo", url: "Peliculas/demo.html", year: "2025" }
    ]), day
  );

  // 🔹 Utilidad
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);

  function renderList(containerId, items) {
    document.getElementById(containerId).innerHTML = items.map(item => `
      <div class="flex-shrink-0 flex flex-col items-center w-28 relative">
        <a href="${item.url}" class="relative overflow-hidden w-full">
          <img class="h-40 w-full object-cover" src="${item.posterImage}" alt="${item.titulo}" loading="lazy" />
          <div class="absolute top-2 right-2 flex items-center space-x-1 select-none">
            <div class="w-0.5 h-5 bg-pink-500 rounded"></div>
            <span class="text-white text-xs font-semibold">${item.year}</span>
          </div>
        </a>
        <span class="mt-1 text-white text-center text-sm font-semibold truncate w-full">${item.titulo}</span>
      </div>
    `).join("");
  }

  // 🔹 Hero dinámico
  const elegida = peliculas[Math.floor(Math.random() * peliculas.length)];
  document.getElementById("dynamicHero").innerHTML = `
    <img src="${elegida.heroImage || 'https://image.tmdb.org/t/p/w780/zsgdVbuEwqZbnUN9qLGEMBYf2Zo.jpg'}" alt="${elegida.titulo}" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6">
      <h2 class="text-white text-3xl md:text-4xl font-extrabold mb-6 drop-shadow-lg">${elegida.titulo}</h2>
      <div class="flex space-x-5">
        <a href="${elegida.url}"  
           class="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition duration-300 ease-in-out">
          <i class="fas fa-play mr-3 text-lg"></i>Play
        </a>
        <button id="openModal" 
           class="flex items-center bg-transparent border-2 border-white hover:border-blue-600 hover:text-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-md transition duration-300 ease-in-out">
          <i class="fas fa-info-circle mr-3 text-lg"></i> Info
        </button>
      </div>
    </div>
  `;

  // Modal
  const modal = document.getElementById("infoModal");
  const modalText = document.getElementById("modalDescription");
  document.getElementById("openModal").onclick = () => { modal.classList.remove("hidden"); modalText.textContent = elegida.sinopsis; };
  document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");
  modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };

  // Listas populares
  renderList("popularMovies", shuffle(peliculas).slice(0, 6));

  // Icono usuario
  document.getElementById("iconoImg").src = localStorage.getItem("iconoUsuario") || "https://i.pinimg.com/736x/91/86/1b/91861b749841221d52122f0c2933d8a6.jpg";
  document.getElementById("btnUsuario").onclick = () => (window.location.href = "HOME/ajustes.html");
}
