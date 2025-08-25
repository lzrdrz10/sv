
 async function fetchPeliculas() {
  const apiUrl = 'https://api.github.com/repos/lzrdrz10/sv/contents/Peliculas';
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error al obtener archivos de GitHub: ${response.status}`);
    const data = await response.json();

    const peliculasPromises = data
      .filter(item => item.type === 'file' && item.name.endsWith('.html'))
      .map(async (item) => {
        try {
          const htmlResponse = await fetch(item.download_url);
          if (!htmlResponse.ok) throw new Error(`Error al obtener ${item.download_url}: ${htmlResponse.status}`);
          const html = await htmlResponse.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Extraer título
          const titulo = doc.querySelector('title') ? doc.querySelector('title').textContent.trim() : 'Título desconocido';

          // Extraer imagen de fondo del CSS para hero
          let backgroundImage = '';
          const styleElement = doc.querySelector('style');
          if (styleElement) {
            const cssText = styleElement.textContent;
            const bgMatch = cssText.match(/body\s*{\s*background:\s*url\(['"]([^'"]+)['"]\)/i);
            if (bgMatch && bgMatch[1]) {
              backgroundImage = bgMatch[1];
            }
          }

          // Extraer poster para populares
          let posterImage = '';
          const posterDiv = doc.querySelector('.flex.items-center.justify-center.w-\\\[110px\\\].h-\\\[160px\\\]');
          if (posterDiv) {
            const img = posterDiv.querySelector('img');
            if (img) {
              posterImage = img.src;
            }
          } else {
            const fallbackImg = doc.querySelector('img[src^="https://image.tmdb.org"]');
            if (fallbackImg) {
              posterImage = fallbackImg.src;
            }
          }

          // Extraer sinopsis
          let sinopsis = '';
          const sinopsisElement = doc.querySelector('#sinopsis p.text-gray-300.text-sm.leading-relaxed');
          if (sinopsisElement) {
            sinopsis = sinopsisElement.textContent.trim();
            console.log(`Sinopsis encontrada para ${item.name}: ${sinopsis.substring(0, 50)}...`);
          } else {
            sinopsis = 'Sinopsis no disponible.';
            console.warn(`No se encontró sinopsis en ${item.download_url}`);
          }

          // Construir URL
          const url = `https://lzrdrz10.github.io/sv/Peliculas/${item.name}`;

          // Extraer año
          let year = '2025';
          const yearElement = doc.querySelector('.year, [class*="year"], [data-year], .flex.flex-wrap.items-center.space-x-2.text-xs.text-gray-400 span:last-child');
          if (yearElement) {
            year = yearElement.textContent.trim() || '2025';
          }

          return { titulo, heroImage: backgroundImage, posterImage, sinopsis, url, year };
        } catch (error) {
          console.error(`Error procesando ${item.name}:`, error);
          return null;
        }
      });

    let peliculas = (await Promise.all(peliculasPromises)).filter(p => p !== null);

    if (peliculas.length === 0) {
      console.warn('No se encontraron películas, usando datos de respaldo.');
      peliculas = [
        {
          titulo: "Cómo entrenar a tu dragón (2025)",
          heroImage: "https://image.tmdb.org/t/p/original/7HqLLVjdjhXS0Qoz1SgZofhkIpE.jpg",
          posterImage: "https://image.tmdb.org/t/p/original/7HqLLVjdjhXS0Qoz1SgZofhkIpE.jpg",
          sinopsis: "En la escarpada isla de Mema, donde vikingos y dragones han sido enemigos acérrimos durante generaciones, Hipo se desmarca desafiando siglos de tradición cuando entabla amistad con Desdentao, un temido dragón Furia Nocturna...",
          url: "https://zinecia.github.io/peli73/index.html",
          year: "2025"
        },
        {
          titulo: "Happy Gilmore 2 (2025)",
          heroImage: "https://image.tmdb.org/t/p/original/88DDOXggxZLxobBolSRRLkaS8h7.jpg",
          posterImage: "https://image.tmdb.org/t/p/original/88DDOXggxZLxobBolSRRLkaS8h7.jpg",
          sinopsis: "Happy, ya retirado del golf profesional, regresa al circuito no por gloria sino para financiar la escuela de danza de su hija, Viena.",
          url: "https://tvacount.github.io/contenido206/index.html",
          year: "2025"
        },
        {
          titulo: "Lilo y Stitch (2025)",
          heroImage: "https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
          posterImage: "https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
          sinopsis: "Una solitaria niña hawaiana y un extraterrestre fugitivo crean un vínculo inquebrantable en esta aventura llena de emociones.",
          url: "https://zinecia.github.io/peli96/index.html",
          year: "2025"
        },
        {
          titulo: "Los Cuatro Fantásticos (2025)",
          heroImage: "https://image.tmdb.org/t/p/original/s94NjfKkcSczZ1FembwmQZwsuwY.jpg",
          posterImage: "https://image.tmdb.org/t/p/original/s94NjfKkcSczZ1FembwmQZwsuwY.jpg",
          sinopsis: "La Primera Familia de Marvel enfrenta a Galactus y su heraldo Estela Plateada, mientras tratan de proteger el mundo y su unión familiar.",
          url: "https://tvacount.github.io/contenido190/index.html",
          year: "2025"
        }
      ];
    }

    return peliculas;
  } catch (error) {
    console.error('Error al cargar películas:', error);
    return [];
  }
}

async function loadPeliculas() {
  const cacheKey = 'cachedPeliculas';
  const timestampKey = 'peliculasTimestamp';
  const cacheDuration = 24 * 60 * 60 * 1000;

  // Limpiar caché para pruebas (puedes eliminar esto después de verificar que funciona)
  localStorage.removeItem('cachedPeliculas');
  localStorage.removeItem('peliculasTimestamp');

  const cachedData = localStorage.getItem(cacheKey);
  const cachedTimestamp = localStorage.getItem(timestampKey);

  let peliculas;
  const now = Date.now();

  if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp, 10) < cacheDuration)) {
    peliculas = JSON.parse(cachedData);
    console.log('Cargando películas desde caché');
  } else {
    peliculas = await fetchPeliculas();
    if (peliculas.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify(peliculas));
      localStorage.setItem(timestampKey, now.toString());
      console.log('Películas cargadas desde API y guardadas en caché');
    } else {
      console.warn('No se cargaron películas, usando datos de respaldo');
      peliculas = [
        {
          titulo: "Cómo entrenar a tu dragón (2025)",
          heroImage: "https://image.tmdb.org/t/p/original/7HqLLVjdjhXS0Qoz1SgZofhkIpE.jpg",
          posterImage: "https://image.tmdb.org/t/p/original/7HqLLVjdjhXS0Qoz1SgZofhkIpE.jpg",
          sinopsis: "En la escarpada isla de Mema, donde vikingos y dragones han sido enemigos acérrimos durante generaciones, Hipo se desmarca desafiando siglos de tradición cuando entabla amistad con Desdentao, un temido dragón Furia Nocturna...",
          url: "https://zinecia.github.io/peli73/index.html",
          year: "2025"
        },
        {
          titulo: "Happy Gilmore 2 (2025)",
          heroImage: "https://image.tmdb.org/t/p/original/88DDOXggxZLxobBolSRRLkaS8h7.jpg",
          posterImage: "https://image.tmdb.org/t/p/original/88DDOXggxZLxobBolSRRLkaS8h7.jpg",
          sinopsis: "Happy, ya retirado del golf profesional, regresa al circuito no por gloria sino para financiar la escuela de danza de su hija, Viena.",
          url: "https://tvacount.github.io/contenido206/index.html",
          year: "2025"
        },
        {
          titulo: "Lilo y Stitch (2025)",
          heroImage: "https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
          posterImage: "https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
          sinopsis: "Una solitaria niña hawaiana y un extraterrestre fugitivo crean un vínculo inquebrantable en esta aventura llena de emociones.",
          url: "https://zinecia.github.io/peli96/index.html",
          year: "2025"
        },
        {
          titulo: "Los Cuatro Fantásticos (2025)",
          heroImage: "https://image.tmdb.org/t/p/original/s94NjfKkcSczZ1FembwmQZwsuwY.jpg",
          posterImage: "https://image.tmdb.org/t/p/original/s94NjfKkcSczZ1FembwmQZwsuwY.jpg",
          sinopsis: "La Primera Familia de Marvel enfrenta a Galactus y su heraldo Estela Plateada, mientras tratan de proteger el mundo y su unión familiar.",
          url: "https://tvacount.github.io/contenido190/index.html",
          year: "2025"
        }
      ];
    }
  }

  const elegida = peliculas[Math.floor(Math.random() * peliculas.length)];

  document.getElementById('dynamicHero').innerHTML = `
    <img src="${elegida.heroImage || 'https://image.tmdb.org/t/p/original/zsgdVbuEwqZbnUN9qLGEMBYf2Zo.jpg'}" alt="${elegida.titulo}" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6">
      <h2 class="text-white text-3xl md:text-4xl font-extrabold mb-6 drop-shadow-lg">${elegida.titulo}</h2>
      <div class="flex space-x-5">
        <a href="${elegida.url}" target="_blank" 
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

  const modal = document.getElementById('infoModal');
  const modalText = document.getElementById('modalDescription');
  const openModalBtn = document.getElementById('openModal');
  const closeModalBtn = document.getElementById('closeModal');

  openModalBtn.addEventListener('click', function() {
    modal.classList.remove('hidden');
    modalText.textContent = elegida.sinopsis || 'Sinopsis no disponible.';
    console.log(`Mostrando sinopsis para ${elegida.titulo}: ${elegida.sinopsis.substring(0, 50)}...`);
  });

  closeModalBtn.addEventListener('click', function() {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.classList.add('hidden');
  });

  const popularMoviesContainer = document.getElementById('popularMovies');
  popularMoviesContainer.innerHTML = peliculas.slice(0, 4).map(pelicula => `
    <div class="flex-shrink-0 flex flex-col items-center w-28 relative">
      <a href="${pelicula.url}" target="_blank" class="relative overflow-hidden w-full">
        <img class="h-40 w-full object-cover" src="${pelicula.posterImage}" alt="${pelicula.titulo}" />
        <div class="absolute top-2 right-2 flex items-center space-x-1 select-none">
          <div class="w-0.5 h-5 bg-pink-500 rounded"></div>
          <span class="text-white text-xs font-semibold">${pelicula.year}</span>
        </div>
      </a>
      <span class="mt-1 text-white text-center text-sm font-semibold leading-tight truncate w-full">
        ${pelicula.titulo}
      </span>
    </div>
  `).join('');
}

loadPeliculas();

var iconoGuardado = localStorage.getItem('iconoUsuario');
if(iconoGuardado){
  document.getElementById('iconoImg').src = iconoGuardado;
} else {
  document.getElementById('iconoImg').src = 'https://i.pinimg.com/736x/91/86/1b/91861b749841221d52122f0c2933d8a6.jpg';
}

var btnUsuario = document.getElementById('btnUsuario');
btnUsuario.addEventListener('click', function(){
  window.location.href = 'HOME/ajustes.html';
});
