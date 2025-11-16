
var URLs = [
  "https://raw.githubusercontent.com/lzrdrz10/sv/main/HOME/Buscador.html",
  "https://raw.githubusercontent.com/lzrdrz10/sv/main/HOME/Buscador2.html"
];

// Palabra clave a filtrar
var filtroNombre = "Monster High";

// Donde se insertarán las tarjetas finales
var contenedor = document.getElementById("contenedorColeccion");

function obtenerHTML(url) {
  return fetch(url)
    .then(r => r.text())
    .catch(() => "");
}

function procesarHTML(html) {
  var temp = document.createElement("div");
  temp.innerHTML = html;

  var lista = [];

  var items = temp.querySelectorAll("li");
  items.forEach(li => {
    var a = li.querySelector("a");
    if (!a) return;

    var url = a.getAttribute("href");
    if (!url) return;

    var spans = li.querySelectorAll("span.hidden");
    if (spans.length === 0) return;

    var tituloCompleto = spans[0].innerText.trim();

    // Filtrar por nombre
    if (!tituloCompleto.toLowerCase().includes(filtroNombre.toLowerCase())) return;

    // Extraer año (últimos 4 dígitos)
    var match = tituloCompleto.match(/(\d{4})$/);
    if (!match) return;
    var year = parseInt(match[1]);

    // Extraer el poster
    var img = li.querySelector("img");
    var poster = img ? img.src : "";

    lista.push({
      year: year,
      titulo: tituloCompleto,
      link: url.replace("../", ""), // por si deseas ajustar rutas
      poster: poster
    });
  });

  return lista;
}

async function cargarColeccion() {
  var todos = [];

  for (var url of URLs) {
    var html = await obtenerHTML(url);
    var lista = procesarHTML(html);
    todos.push(...lista);
  }

  // Ordenar ASC por año
  todos.sort((a, b) => a.year - b.year);

  // Insertar en el formato solicitado
  var contador = 1;

  todos.forEach(item => {
    var tarjeta = document.createElement("a");
    tarjeta.className = "sesionAdultoTarjeta";
    tarjeta.href = item.link;
    tarjeta.setAttribute("aria-label", item.titulo);

    tarjeta.innerHTML = `
      <img class="sesionAdultoPoster" src="${item.poster}" loading="lazy" decoding="async">
      <div class="sesionAdultoOverlay"></div>
      <span class="sesionAdultoBadge">Movie ${contador}</span>
    `;

    contenedor.appendChild(tarjeta);
    contador++;
  });
}

cargarColeccion();

