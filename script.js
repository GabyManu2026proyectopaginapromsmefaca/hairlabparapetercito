
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================
  // HAIRLAB — CONFIGURACIÓN
  // ==========================================

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const STORAGE = {
    favorites: "hairlab_favoritos",
    profile: "hairlab_perfil",
    combo: "hairlab_ultima_combinacion"
  };

  /*
    IMPORTANTE:
    Los nombres de las imágenes deben coincidir exactamente
    con los archivos que tienes dentro de la carpeta img.
  */

  const images = [
    {
      id: "medio-ondulado",
      title: "Ondas suaves",
      file: "medio-ondulado.jpg",
      texture: ["ondulado"],
      length: "medio",
      color: "todos",
      category: "textura",
      mood: ["natural", "romantico"],
      description: "Ondas suaves para un look natural."
    },
    {
      id: "ondulado",
      title: "Cabello ondulado",
      file: "ondulado.jpg",
      texture: ["ondulado"],
      length: "todos",
      color: "todos",
      category: "textura",
      mood: ["natural", "elegante"],
      description: "Ideas para lucir la textura ondulada."
    },
    {
      id: "chocolate",
      title: "Chocolate",
      file: "chocolate.jpg",
      texture: ["liso", "ondulado", "rizado"],
      length: "todos",
      color: "chocolate",
      category: "color",
      mood: ["natural", "elegante"],
      description: "Inspiración en tonos chocolate."
    },
    {
      id: "rosa",
      title: "Rosa creativo",
      file: "rosa.jpg",
      texture: ["liso", "ondulado", "rizado"],
      length: "todos",
      color: "rosa",
      category: "color",
      mood: ["atrevido", "romantico"],
      description: "Una idea de color para experimentar."
    },
    {
      id: "largo-liso",
      title: "Largo y liso",
      file: "largo-liso.jpg",
      texture: ["liso"],
      length: "largo",
      color: "todos",
      category: "corte",
      mood: ["natural", "elegante"],
      description: "Inspiración para cabello largo y liso."
    },
    {
      id: "peinado-liso-largo-1",
      title: "Peinado largo",
      file: "peinado-liso-largo-1.jpg",
      texture: ["liso"],
      length: "largo",
      color: "todos",
      category: "peinado",
      mood: ["elegante", "romantico"],
      description: "Una idea de peinado para cabello largo."
    }
  ];

  // ==========================================
  // ALMACENAMIENTO SEGURO
  // ==========================================

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn("No se pudo leer el almacenamiento:", key);
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      showToast("No se pudieron guardar los cambios en este navegador.");
      return false;
    }
  }

  let favorites = readStorage(STORAGE.favorites, []);
  if (!Array.isArray(favorites)) favorites = [];

  favorites = favorites.filter(id =>
    images.some(item => item.id === id)
  );

  let activeFilter = "todos";
  let searchTerm = "";
  let categoryFilter = "todos";
  let currentCombo = null;

  // ==========================================
  // NOTIFICACIONES
  // ==========================================

  let toastTimer;

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  // ==========================================
  // MENÚ DE NAVEGACIÓN
  // ==========================================

  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú" : "Abrir menú"
      );
      menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    $$("a", mainNav).forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
        menuToggle.textContent = "☰";
      });
    });

    document.addEventListener("click", event => {
      if (
        window.innerWidth <= 780 &&
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
      }
    });
  }

  // ==========================================
  // CREAR TARJETAS DE IMÁGENES
  // ==========================================

  function makeCard(item) {
    const article = document.createElement("article");
    article.className = "gallery-card";
    article.dataset.id = item.id;

    const imageWrap = document.createElement("div");
    imageWrap.className = "card-image-wrap";

    const image = document.createElement("img");
    image.className = "card-image";
    image.src = "img/" + item.file;
    image.alt = item.title;
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener("error", () => {
      imageWrap.classList.add("image-missing");
      image.alt = "Imagen no disponible: " + item.file;

      if (!image.dataset.errorShown) {
        image.dataset.errorShown = "true";
        console.warn("No se encontró la imagen:", "img/" + item.file);
      }
    });

    const heart = document.createElement("button");
    heart.className = "favorite-btn";
    heart.type = "button";
    heart.dataset.favoriteId = item.id;
    heart.setAttribute("aria-label", "Añadir a favoritos");

    imageWrap.append(image, heart);

    const info = document.createElement("div");
    info.className = "card-info";

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "card-meta";

    const category = document.createElement("span");
    category.textContent = categoryName(item.category);

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.texture[0];

    meta.append(category, tag);
    info.append(title, meta);
    article.append(imageWrap, info);

    updateHeart(heart, item.id);

    return article;
  }

  function categoryName(category) {
    const names = {
      textura: "Texturas",
      corte: "Cortes y largos",
      peinado: "Peinados",
      color: "Colores"
    };

    return names[category] || "Inspiración";
  }

  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================

  function matchesSearch(item, term) {
    const content = [
      item.title,
      item.description,
      item.category,
      item.length,
      item.color,
      ...item.texture,
      ...item.mood
    ].join(" ").toLowerCase();

    return content.includes(term.toLowerCase());
  }

  function getFilteredImages() {
    return images.filter(item => {
      const matchesFilter =
        activeFilter === "todos" ||
        item.texture.includes(activeFilter) ||
        item.category === activeFilter;

      const matchesCategory =
        categoryFilter === "todos" ||
        item.category === categoryFilter;

      return (
        matchesFilter &&
        matchesCategory &&
        matchesSearch(item, searchTerm)
      );
    });
  }

  function renderGallery() {
    const gallery = $("#gallery");
    const emptyState = $("#emptyState");

    if (!gallery) return;

    const filtered = getFilteredImages();
    gallery.replaceChildren();

    filtered.forEach(item => {
      gallery.appendChild(makeCard(item));
    });

    if (emptyState) {
      emptyState.hidden = filtered.length !== 0;
    }
  }

  function setActiveFilter(filter) {
    activeFilter = filter;

    $$(".chip", $("#filterChips") || document).forEach(chip => {
      const isActive = chip.dataset.filter === filter;
      chip.classList.toggle("active", isActive);
      chip.setAttribute("aria-pressed", String(isActive));
    });

    renderGallery();
  }

  const filterChips = $("#filterChips");

  if (filterChips) {
    filterChips.addEventListener("click", event => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;

      setActiveFilter(button.dataset.filter);
    });
  }

  const gallerySearch = $("#gallerySearch");

  if (gallerySearch) {
    gallerySearch.addEventListener("input", () => {
      searchTerm = gallerySearch.value.trim();
      renderGallery();
    });
  }

  const categorySelect = $("#categoryFilter");

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      categoryFilter = categorySelect.value;
      renderGallery();
    });
  }

  const searchForm = $("#searchForm");
  const searchInput = $("#searchInput");

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();

      searchTerm = searchInput.value.trim();

      if (gallerySearch) {
        gallerySearch.value = searchInput.value;
      }

      setActiveFilter("todos");

      document.querySelector("#explorar")?.scrollIntoView({
        behavior: "smooth"
      });
    });
  }

  const clearFilters = $("#clearFilters");

  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      searchTerm = "";
      categoryFilter = "todos";

      if (gallerySearch) gallerySearch.value = "";
      if (searchInput) searchInput.value = "";
      if (categorySelect) categorySelect.value = "todos";

      setActiveFilter("todos");
      showToast("Filtros reiniciados.");
    });
  }

  // ==========================================
  // FAVORITOS
  // ==========================================

  function updateHeart(button, id) {
    const isFavorite = favorites.includes(id);

    button.classList.toggle("saved", isFavorite);
    button.textContent = isFavorite ? "♥" : "♡";
    button.setAttribute(
      "aria-label",
      isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"
    );
    button.setAttribute("aria-pressed", String(isFavorite));
  }

  function renderFavorites() {
    const gallery = $("#favoritesGallery");
    const empty = $("#favoritesEmpty");

    if (!gallery) return;

    gallery.replaceChildren();

    const savedItems = favorites
      .map(id => images.find(item => item.id === id))
      .filter(Boolean);

    savedItems.forEach(item => {
      gallery.appendChild(makeCard(item));
    });

    if (empty) {
      empty.style.display = savedItems.length ? "none" : "block";
    }

    const count = String(savedItems.length);

    if ($("#favoriteCount")) $("#favoriteCount").textContent = count;
    if ($("#favoritesHeadingCount")) {
      $("#favoritesHeadingCount").textContent = count;
    }
  }

  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter(favoriteId => favoriteId !== id);
      showToast("Eliminado de tus favoritos.");
    } else {
      favorites.push(id);
      showToast("¡Guardado en tus favoritos! ♥");
    }

    saveStorage(STORAGE.favorites, favorites);

    renderGallery();
    renderFavorites();
    renderComboIfNeeded();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-favorite-id]");
    if (!button) return;

    toggleFavorite(button.dataset.favoriteId);
  });

  const clearFavorites = $("#clearFavorites");

  if (clearFavorites) {
    clearFavorites.addEventListener("click", () => {
      if (favorites.length === 0) {
        showToast("Todavía no tienes favoritos guardados.");
        return;
      }

      const confirmed = window.confirm(
        "¿Quieres quitar todas las imágenes de tus favoritos?"
      );

      if (!confirmed) return;

      favorites = [];
      saveStorage(STORAGE.favorites, favorites);
      renderGallery();
      renderFavorites();
      renderComboIfNeeded();
      showToast("Tu colección de favoritos está vacía.");
    });
  }

  // ==========================================
  // CREADOR DE COMBINACIONES
  // ==========================================

  const textureSelect = $("#textureSelect");
  const lengthSelect = $("#lengthSelect");
  const colorSelect = $("#colorSelect");
  const moodSelect = $("#moodSelect");
  const lookResult = $("#lookResult");
  const creatorMessage = $("#creatorMessage");

  function getCombination() {
    return {
      texture: textureSelect?.value || "todos",
      length: lengthSelect?.value || "todos",
      color: colorSelect?.value || "todos",
      mood: moodSelect?.value || "todos"
    };
  }

  function matchesCombination(item, combination) {
    const textureMatches =
      combination.texture === "todos" ||
      item.texture.includes(combination.texture);

    const lengthMatches =
      combination.length === "todos" ||
      item.length === "todos" ||
      item.length === combination.length;

    const colorMatches =
      combination.color === "todos" ||
      item.color === "todos" ||
      item.color === combination.color;

    const moodMatches =
      combination.mood === "todos" ||
      item.mood.includes(combination.mood);

    return textureMatches && lengthMatches && colorMatches && moodMatches;
  }

  function getComboCandidates(combination) {
    return images.filter(item =>
      matchesCombination(item, combination)
    );
  }

  function renderCombo(items, combination, message) {
    if (!lookResult) return;

    lookResult.replaceChildren();

    const container = document.createElement("div");
    container.className = "combo-result";

    const title = document.createElement("h3");
    title.textContent = "Tu inspiración personalizada";

    const description = document.createElement("p");
    description.textContent = message;

    const imageGrid = document.createElement("div");
    imageGrid.className = "combo-images";

    items.forEach(item => {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      const caption = document.createElement("figcaption");

      image.src = "img/" + item.file;
      image.alt = item.title;
      image.loading = "lazy";

      image.addEventListener("error", () => {
        image.alt = "Imagen no disponible: " + item.file;
      });

      caption.textContent = item.title;

      figure.append(image, caption);
      imageGrid.appendChild(figure);
    });

    const actions = document.createElement("div");
    actions.className = "combo-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "btn primary";
    saveButton.textContent = "♡ Guardar imágenes";

    saveButton.addEventListener("click", () => {
      let added = 0;

      items.forEach(item => {
        if (!favorites.includes(item.id)) {
          favorites.push(item.id);
          added++;
        }
      });

      saveStorage(STORAGE.favorites, favorites);
      renderGallery();
      renderFavorites();
      renderComboIfNeeded();

      showToast(
        added
          ? "Se guardaron " + added + " nuevas ideas."
          : "Estas ideas ya estaban en tus favoritos."
      );
    });

    const newButton = document.createElement("button");
    newButton.type = "button";
    newButton.className = "btn secondary";
    newButton.textContent = "↻ Probar otra combinación";

    newButton.addEventListener("click", () => {
      generateCombination(true);
    });

    actions.append(saveButton, newButton);
    container.append(title, description, imageGrid, actions);
    lookResult.appendChild(container);
  }

  function renderComboIfNeeded() {
    if (!currentCombo) return;

    const items = getComboCandidates(currentCombo);
    const selected = items.filter(item => favorites.includes(item.id));

    if (selected.length) {
      renderCombo(
        selected.slice(0, 3),
        currentCombo,
        "Ideas de tu combinación que guardaste en favoritos."
      );
    }
  }

  function generateCombination(randomize = false) {
    const combination = getCombination();
    let candidates = getComboCandidates(combination);

    if (randomize && candidates.length > 1) {
      candidates = candidates
        .map(item => ({ item, order: Math.random() }))
        .sort((a, b) => a.order - b.order)
        .map(entry => entry.item);
    }

    if (!candidates.length) {
      if (creatorMessage) {
        creatorMessage.textContent =
          "No encontramos una coincidencia exacta. Prueba cambiar alguna preferencia.";
      }

      renderCombo(
        images.slice(0, 3),
        combination,
        "No encontramos coincidencias exactas; aquí tienes ideas alternativas."
      );

      currentCombo = combination;
      return;
    }

    const selected = candidates.slice(0, 3);

    currentCombo = combination;

    saveStorage(STORAGE.combo, combination);

    const description = [
      combination.texture !== "todos" ? combination.texture : "",
      combination.length !== "todos" ? combination.length : "",
      combination.color !== "todos" ? combination.color : "",
      combination.mood !== "todos" ? combination.mood : ""
    ].filter(Boolean).join(" · ");

    renderCombo(
      selected,
      combination,
      description
        ? "Tu selección: " + description + "."
        : "Una selección de inspiración para que explores tu estilo."
    );

    if (creatorMessage) {
      creatorMessage.textContent =
        "¡Combinación creada! Puedes guardar las ideas o probar otra.";
    }
  }

  const generateButton = $("#generateLook");

  if (generateButton) {
    generateButton.addEventListener("click", () => {
      generateCombination(false);
    });
  }

  const resetCreator = $("#resetCreator");

  if (resetCreator) {
    resetCreator.addEventListener("click", () => {
      if (textureSelect) textureSelect.value = "todos";
      if (lengthSelect) lengthSelect.value = "todos";
      if (colorSelect) colorSelect.value = "todos";
      if (moodSelect) moodSelect.value = "todos";

      currentCombo = null;

      if (lookResult) {
        lookResult.innerHTML = `
          <div class="placeholder">
            <span>✧</span>
            <h3>Tu moodboard aparecerá aquí</h3>
            <p>Elige tus preferencias y crea una nueva combinación.</p>
          </div>
        `;
      }

      if (creatorMessage) {
        creatorMessage.textContent =
          "Preferencias reiniciadas. ¡Empieza de nuevo!";
      }

      showToast("Creador reiniciado.");
    });
  }

  // ==========================================
  // PERFIL PERSONALIZADO
  // ==========================================

  const profileForm = $("#profileForm");
  const profileName = $("#profileName");
  const profileNote = $("#profileNote");
  const profileGreeting = $("#profileGreeting");
  const profileMessage = $("#profileMessage");

  function loadProfile() {
    const profile = readStorage(STORAGE.profile, {});

    if (profileName && typeof profile.name === "string") {
      profileName.value = profile.name;
    }

    if (profileNote && typeof profile.note === "string") {
      profileNote.value = profile.note;
    }

    updateGreeting();
  }

  function updateGreeting() {
    if (!profileGreeting) return;

    const name = profileName?.value.trim();
    profileGreeting.textContent = name || "creadora";
  }

  if (profileName) {
    profileName.addEventListener("input", updateGreeting);
  }

  if (profileForm) {
    profileForm.addEventListener("submit", event => {
      event.preventDefault();

      const profile = {
        name: profileName?.value.trim() || "",
        note: profileNote?.value.trim() || ""
      };

      if (!saveStorage(STORAGE.profile, profile)) return;

      updateGreeting();

      if (profileMessage) {
        profileMessage.textContent = "¡Tu perfil se guardó correctamente!";
      }

      showToast("Perfil actualizado.");
    });
  }

  // ==========================================
  // AÑO DEL PIE DE PÁGINA
  // ==========================================

  const year = $("#year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ==========================================
  // INICIALIZAR LA APLICACIÓN
  // ==========================================

  renderGallery();
  renderFavorites();
  loadProfile();

  // Recuperar preferencias del creador sin generar automáticamente.
  const previousCombo = readStorage(STORAGE.combo, null);

  if (previousCombo && typeof previousCombo === "object") {
    if (textureSelect) {
      textureSelect.value = previousCombo.texture || "todos";
    }

    if (lengthSelect) {
      lengthSelect.value = previousCombo.length || "todos";
    }

    if (colorSelect) {
      colorSelect.value = previousCombo.color || "todos";
    }

    if (moodSelect) {
      moodSelect.value = previousCombo.mood || "todos";
    }
  }

  console.info("HAIRLAB está lista para usarse.");
});
