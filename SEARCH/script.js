
  let itemsPorCarga = 30;
  let elementosMostrados = 0;

  function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function ordenarYLimitar() {
    const ul = document.getElementById("busquedas");
    const li = Array.from(ul.querySelectorAll("li"));
    elementosMostrados = 0;

    li.forEach(el => el.style.display = "none");

    for (let i = 0; i < itemsPorCarga && i < li.length; i++) {
      li[i].style.display = "";
      elementosMostrados++;
    }

    document.getElementById("verMasBtn").classList.toggle("hidden", elementosMostrados >= li.length);
  }

  function mostrarMas() {
    const ul = document.getElementById("busquedas");
    const li = Array.from(ul.querySelectorAll("li"));
    let nuevosMostrados = 0;

    for (let i = elementosMostrados; i < li.length && nuevosMostrados < itemsPorCarga; i++) {
      li[i].style.display = "";
      nuevosMostrados++;
      elementosMostrados++;
    }

    if (elementosMostrados >= li.length) {
      document.getElementById("verMasBtn").classList.add("hidden");
    }
  }

  function filtrar() {
    const input = document.getElementById("buscar").value.trim();
    const palabrasFiltro = normalizarTexto(input).split(/\s+/).filter(Boolean);
    const ul = document.getElementById("busquedas");
    const li = Array.from(ul.querySelectorAll("li"));
    const estado = document.getElementById("estadoBusqueda");

    estado.classList.remove("hidden");
    estado.innerHTML = `Buscando<span class="dot-1"></span><span class="dot-2"></span><span class="dot-3"></span>`;

    setTimeout(() => {
      let encontrados = 0;

      li.forEach(el => {
        // 🔹 Capturamos TODO el texto del li, incluyendo los <span class="hidden">
        const spans = Array.from(el.querySelectorAll("span.hidden")).map(s => s.textContent);
        const texto = normalizarTexto((el.textContent || "") + " " + spans.join(" "));

        // 🔹 Verificamos que TODAS las palabras escritas estén en el texto
        const coincide = palabrasFiltro.every(palabra => texto.includes(palabra));

        el.style.display = coincide ? "" : "none";
        if (coincide) encontrados++;
      });

      if (palabrasFiltro.length > 0) {
        estado.classList.remove("hidden");
        estado.innerHTML = encontrados > 0
          ? `Resultados encontrados: ${encontrados}`
          : `No se encontraron resultados.`;
        document.getElementById("verMasBtn").classList.add("hidden");
      } else {
        estado.classList.add("hidden");
        ordenarYLimitar();
      }
    }, 300);
  }

  window.addEventListener("load", () => {
    document.getElementById("buscar").focus();
    setTimeout(() => {
      const input = document.getElementById("buscar");
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 200);
    ordenarYLimitar();
  });
  
  document.getElementById('btnRegresar').addEventListener('click', () => {
    // Suponiendo que en localStorage tienes guardada la URL anterior en 'paginaAnterior'
    const paginaAnterior = localStorage.getItem('paginaAnterior');
    if (paginaAnterior) {
      window.location.href = paginaAnterior;
    } else {
      // Si no hay valor guardado, vuelve a la página principal por defecto
      window.history.back();
    }
  });
