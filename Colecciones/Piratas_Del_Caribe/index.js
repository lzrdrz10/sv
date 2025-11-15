// === DATOS MOCK ===
const mockCategories = [
  { name: "Tendencias", movies: [
    { title: "Dune: Parte Dos", img: "8b8R8l88kDh0d40nC9TjGsUgaEM.jpg" },
    { title: "Oppenheimer", img: "8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
    { title: "The Batman", img: "74xTEgt7R36Fpooo50r9T25Se2x.jpg" },
    { title: "Interstellar", img: "gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
    { title: "Top Gun: Maverick",  img: "62HCnUTziyWcpDaBO2i1wgbU5W.jpg" },
    { title: "Avatar: El sentido del agua", img: "t6HIqrRAclMCA60Y0HOS9Jh7fC1.jpg" }
  ]},
  { name: "Ciencia Ficción", movies: [
    { title: "Blade Runner 2049", img: "gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" },
    { title: "Matrix Resurrections", img: "fge73g0pjjAynCh1doxxP5rjFvf.jpg" },
    { title: "Arrival", img: "x2FJX2JRXv5d1C5dMczf5W2kQ4q.jpg" },
    { title: "Inception", img: "9gk7adHYeDK4rOxc0KuV6q2fNq.jpg" },
    { title: "Tenet", img: "k68nPLbIST6NPV1GKmbdPys6JI8.jpg" },
    { title: "Ex Machina", img: "bmqol1CNtI6f4gO3vJ8r1X7d2Kk.jpg" }
  ]},
  { name: "Acción", movies: [
    { title: "John Wick 4", img: "vZloFAK7NmvMGKE7VkCT73T7Djf.jpg" },
    { title: "Mad Max: Fury Road", img: "8tZYB4OpyQ4k87iKDGfl8YfW1kF.jpg" },
    { title: "The Raid", img: "cC1nZ7T7f2vU8zS0b8d6v9r9z2x.jpg" },
    { title: "Mission Impossible 7", img: "r1eZLjI6v7b6k5e0r8k2t1u8m3v.jpg" },
    { title: "Deadpool & Wolverine", img: "8cdWjvZQUExUUTzyp4t6EDMUBj8.jpg" },
    { title: "Gladiator II", img: "2gY4lOEZJ0i9a4t3v7r8k9s0t1u.jpg" }
  ]}
];

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// === CONSTRUIR SECCIONES ===
function buildSections() {
  const container = document.getElementById("movies-container");
  mockCategories.forEach(cat => {
    const skeletonRow = Array(6).fill().map(() => 
      `<div class="movie-card skeleton" style="width:250px;height:140px;"></div>`
    ).join('');

    const sectionHTML = `
      <section class="section">
        <h2 class="section-title">${cat.name} <span class="explore">Explorar todo</span></h2>
        <div class="movies-row" id="row-${cat.name.replace(/\s+/g, '-')}">
          ${skeletonRow}
        </div>
      </section>
    `;
    container.innerHTML += sectionHTML;

    setTimeout(() => {
      const row = document.getElementById(`row-${cat.name.replace(/\s+/g, '-')}`);
      row.innerHTML = cat.movies.map(movie => `
        <div class="movie-card">
          <img src="${IMG_BASE}${movie.img}" alt="${movie.title}" loading="lazy">
          <div class="movie-title">${movie.title}</div>
        </div>
      `).join('');
    }, 800);
  });
}

// === HEADER SCROLL ===
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  header.classList.toggle('scrolled', window.scrollY > 100);
});

// === MODAL ===
const modal = document.getElementById('info-modal');
const openBtn = document.getElementById('open-modal');
const closeBtn = document.getElementById('close-modal');

openBtn.addEventListener('click', () => {
  modal.classList.add('open');
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('open');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('open');
  }
});

// === INICIAR ===
window.onload = buildSections;