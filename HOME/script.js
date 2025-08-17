
var peliculas = [
  {
    titulo: "Cómo entrenar a tu dragón (2025)",
    imagen: "https://image.tmdb.org/t/p/original/7HqLLVjdjhXS0Qoz1SgZofhkIpE.jpg",
    descripcion: "En la escarpada isla de Mema, donde vikingos y dragones han sido enemigos acérrimos durante generaciones, Hipo se desmarca desafiando siglos de tradición cuando entabla amistad con Desdentao, un temido dragón Furia Nocturna...",
    url: "https://zinecia.github.io/peli73/index.html"
  },
  {
    titulo: "Happy Gilmore 2 (2025)",
    imagen: "https://image.tmdb.org/t/p/original/88DDOXggxZLxobBolSRRLkaS8h7.jpg",
    descripcion: "Happy, ya retirado del golf profesional, regresa al circuito no por gloria sino para financiar la escuela de danza de su hija, Viena.",
    url: "https://tvacount.github.io/contenido206/index.html"
  },
  {
    titulo: "Lilo y Stitch (2025)",
    imagen: "https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
    descripcion: "Una solitaria niña hawaiana y un extraterrestre fugitivo crean un vínculo inquebrantable en esta aventura llena de emociones.",
    url: "https://zinecia.github.io/peli96/index.html"
  },
  {
    titulo: "Los Cuatro Fantásticos (2025)",
    imagen: "https://image.tmdb.org/t/p/original/s94NjfKkcSczZ1FembwmQZwsuwY.jpg",
    descripcion: "La Primera Familia de Marvel enfrenta a Galactus y su heraldo Estela Plateada, mientras tratan de proteger el mundo y su unión familiar.",
    url: "https://tvacount.github.io/contenido190/index.html"
  }
];

var elegida = peliculas[Math.floor(Math.random() * peliculas.length)];

// Insertar contenido del héroe
document.getElementById('dynamicHero').innerHTML = `
  <img src="${elegida.imagen}" alt="${elegida.titulo}" class="w-full h-full object-cover" />
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

// Modal info
var modal = document.getElementById('infoModal');
var modalText = document.getElementById('modalDescription');
var openModalBtn = document.getElementById('openModal');
var closeModalBtn = document.getElementById('closeModal');

openModalBtn.addEventListener('click', function() {
  modal.classList.remove('hidden');
  modalText.textContent = elegida.descripcion;
});

closeModalBtn.addEventListener('click', function() {
  modal.classList.add('hidden');
});

modal.addEventListener('click', function(e) {
  if (e.target === modal) modal.classList.add('hidden');
});

// Mostrar icono usuario del localStorage
var iconoGuardado = localStorage.getItem('iconoUsuario');
if(iconoGuardado){
  document.getElementById('iconoImg').src = iconoGuardado;
} else {
  document.getElementById('iconoImg').src = 'https://i.imgur.com/mRK9uvR.png';
}

// Redireccionar al dar clic en el botón
var btnUsuario = document.getElementById('btnUsuario');
btnUsuario.addEventListener('click', function(){
  window.location.href = 'ajustes.html';
});
