document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const STORAGE = {
    favorites: "hairlab_favoritos",
    profile: "hairlab_perfil",
    combo: "hairlab_ultima_combinacion"
  };

  // CATÁLOGO: nombres basados en tu carpeta img
  const images = [
    // TEXTURAS
    ["liso", "Cabello liso", "liso.jpg", "liso", "todos", "todos", "textura"],
    ["ondulado", "Cabello ondulado", "ondulado.jpg", "ondulado", "todos", "todos", "textura"],
    ["rizado", "Cabello rizado", "rizado.jpg", "rizado", "todos", "todos", "textura"],
    ["afro", "Cabello afro", "afro.jpg", "afro", "todos", "todos", "textura"],

    // CABELLO CORTO
    ["corto-liso", "Corto y liso", "corto-liso.jpg", "liso", "corto", "todos", "corte"],
    ["corto-ondulado", "Corto ondulado", "corto-ondulado.jpg", "ondulado", "corto", "todos", "corte"],
    ["corto-rizado", "Corto rizado", "corto-rizado.jpg", "rizado", "corto", "todos", "corte"],
    ["corto-afro", "Corto afro", "corto-afro.jpg", "afro", "corto", "todos", "corte"],

    // CABELLO MEDIO
    ["medio-liso", "Medio y liso", "medio-liso.jpg", "liso", "medio", "todos", "corte"],
    ["medio-ondulado", "Medio ondulado", "medio-ondulado.jpg", "ondulado", "medio", "todos", "corte"],
    ["medio-rizado", "Medio rizado", "medio-rizado.jpg", "rizado", "medio", "todos", "corte"],
    ["medio-afro", "Medio afro", "medio-afro.jpg", "afro", "medio", "todos", "corte"],

    // CABELLO LARGO
    ["largo-liso", "Largo y liso", "largo-liso.jpg", "liso", "largo", "todos", "corte"],
    ["largo-ondulado", "Largo ondulado", "largo-ondulado.jpg", "ondulado", "largo", "todos", "corte"],
    ["largo-rizado", "Largo rizado", "largo-rizado.jpg", "rizado", "largo", "todos", "corte"],
    ["largo-afro", "Largo afro", "largo-afro.jpg", "afro", "largo", "todos", "corte"],

    // COLORES
    ["chocolate", "Tono chocolate", "chocolate.jpg", "todos", "todos", "chocolate", "color"],
    ["negro", "Negro intenso", "negro.jpg", "todos", "todos", "negro", "color"],
    ["rubio", "Rubio luminoso", "rubio.jpg", "todos", "todos", "rubio", "color"],
    ["rojo", "Rojo vibrante", "rojo.jpg", "todos", "todos", "rojo", "color"],
    ["rosa", "Rosa creativo", "rosa.jpg", "todos", "todos", "rosa", "color"],

    // PEINADOS
    ["peinado-liso-corto-1", "Peinado liso corto", "peinado-liso-corto-1.jpg", "liso", "corto", "todos", "peinado"],
    ["peinado-liso-corto-2", "Liso con accesorio", "peinado-liso-corto-2.jpg", "liso", "corto", "todos", "peinado"],
    ["peinado-liso-medio-1", "Peinado liso medio", "peinado-liso-medio-1.jpg", "liso", "medio", "todos", "peinado"],
    ["peinado-liso-medio-2", "Peinado medio con lazo", "peinado-liso-medio-2.jpg", "liso", "medio", "todos", "peinado"],
    ["peinado-liso-largo-1", "Peinado largo", "peinado-liso-largo-1.jpg", "liso", "largo", "todos", "peinado"],
    ["peinado-liso-largo-2", "Peinado largo azul", "peinado-liso-largo-2.jpg", "liso", "largo", "todos", "peinado"],
    ["peinado-ondulado-corto-1", "Peinado ondulado corto", "peinado-ondulado-corto-1.jpg", "ondulado", "corto", "todos", "peinado"],
    ["peinado-ondulado-corto-2", "Ondas cortas", "peinado-ondulado-corto-2.jpg", "ondulado", "corto", "todos", "peinado"],
    ["peinado-ondulado-medio-1", "Ondas recogidas", "peinado-ondulado-medio-1.jpg", "ondulado", "medio", "todos", "peinado"],
    ["peinado-ondulado-medio-2", "Ondas medias", "peinado-ondulado-medio-2.jpg", "ondulado", "medio", "todos", "peinado"],
    ["peinado-ondulado-largo-1", "Ondas largas recogidas", "peinado-ondulado-largo-1.jpg", "ondulado", "largo", "todos", "peinado"],
    ["peinado-ondulado-largo-2", "Ondas largas con volumen", "peinado-ondulado-largo-2.jpg", "ondulado", "largo", "todos", "peinado"]
  ].map(([id, title, file, texture, length, color, category]) => ({
    id, title, file,
    texture: texture === "todos" ? ["liso", "ondulado", "rizado", "afro"] : [texture],
    length, color, category,
    mood: category === "color" ? ["atrevido", "natural"] : ["natural", "elegante"],
    description: title
  }));

  const read = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const save = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      toast("No se pudieron guardar los cambios.");
      return false;
    }
  };

  let favorites = read(STORAGE.favorites, []);
  if (!Array.isArray(favorites)) favorites = [];
  favorites = favorites.filter(id => images.some(item => item.id === id));

  let activeFilter = "todos";
  let searchTerm = "";
  let categoryFilter = "todos";
  let currentCombo = null;
  let toastTimer;

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // MENÚ MÓVIL
  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.textContent = open ? "✕" : "☰";
    });

    $$("a", mainNav).forEach(link => link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    }));
  }

  function categoryName(category) {
    return ({
      textura: "Texturas",
      corte: "Cortes y largos",
      peinado: "Peinados",
      color: "Colores"
    })[category] || "Inspiración";
  }

  function makeCard(item) {
    const article = document.createElement("article");
    article.className = "gallery-card";
    article.dataset.id = item.id;

    const wrap = document.createElement("div");
    wrap.className = "card-image-wrap";

    const img = document.createElement("img");
    img.className = "card-image";
    img.src = `img/${item.file}`;
    img.alt = item.title;
    img.loading = "lazy";
    img.decoding = "async";

    img.addEventListener("error", () => {
      img.classList.add("image-error");
      img.alt = `No se encontró img/${item.file}`;
      console.warn("Imagen no encontrada:", `img/${item.file}`);
    });

    const heart = document.createElement("button");
    heart.type = "button";
    heart.className = "favorite-btn";
    heart.dataset.favoriteId = item.id;
    heart.textContent = favorites.includes(item.id) ? "♥" : "♡";
    heart.classList.toggle("saved", favorites.includes(item.id));
    heart.setAttribute("aria-label", "Cambiar favorito");
    heart.setAttribute("aria-pressed", String(favorites.includes(item.id)));

    wrap.append(img, heart);

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
    tag.textContent = item.texture.join(" / ");

    meta.append(category, tag);
    info.append(title, meta);
    article.append(wrap, info);
    return article;
  }

  // GALERÍA Y FILTROS
  function matchesSearch(item, term) {
    return [
      item.title, item.description, item.category,
      item.length, item.color, ...item.texture, ...item.mood
    ].join(" ").toLowerCase().includes(term.toLowerCase());
  }

  function filteredImages() {
    return images.filter(item => {
      const textureMatch =
        activeFilter === "todos" ||
        item.texture.includes(activeFilter) ||
        item.category === activeFilter;

      const categoryMatch =
        categoryFilter === "todos" || item.category === categoryFilter;

      return textureMatch && categoryMatch && matchesSearch(item, searchTerm);
    });
  }

  function renderGallery() {
    const gallery = $("#gallery");
    const empty = $("#emptyState");
    if (!gallery) return;

    const result = filteredImages();
    gallery.replaceChildren(...result.map(makeCard));

    if (empty) empty.hidden = result.length > 0;
  }

  function setActiveFilter(filter) {
    activeFilter = filter;
    $$(".chip", $("#filterChips") || document).forEach(chip => {
      const active = chip.dataset.filter === filter;
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    renderGallery();
  }

  $("#filterChips")?.addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (button) setActiveFilter(button.dataset.filter);
  });

  $("#gallerySearch")?.addEventListener("input", event => {
    searchTerm = event.target.value.trim();
    renderGallery();
  });

  $("#categoryFilter")?.addEventListener("change", event => {
    categoryFilter = event.target.value;
    renderGallery();
  });

  $("#searchForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const input = $("#searchInput");
    searchTerm = input?.value.trim() || "";
    const gallerySearch = $("#gallerySearch");
    if (gallerySearch) gallerySearch.value = searchTerm;
    setActiveFilter("todos");
    $("#explorar")?.scrollIntoView({ behavior: "smooth" });
  });

  $("#clearFilters")?.addEventListener("click", () => {
    searchTerm = "";
    categoryFilter = "todos";
    if ($("#gallerySearch")) $("#gallerySearch").value = "";
    if ($("#searchInput")) $("#searchInput").value = "";
    if ($("#categoryFilter")) $("#categoryFilter").value = "todos";
    setActiveFilter("todos");
    toast("Filtros reiniciados.");
  });

  // FAVORITOS
  function renderFavorites() {
    const gallery = $("#favoritesGallery");
    const empty = $("#favoritesEmpty");
    if (!gallery) return;

    const saved = favorites
      .map(id => images.find(item => item.id === id))
      .filter(Boolean);

    gallery.replaceChildren(...saved.map(makeCard));
    if (empty) empty.style.display = saved.length ? "none" : "block";
    if ($("#favoriteCount")) $("#favoriteCount").textContent = String(saved.length);
    if ($("#favoritesHeadingCount")) {
      $("#favoritesHeadingCount").textContent = String(saved.length);
    }
  }

  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter(value => value !== id);
      toast("Eliminado de tus favoritos.");
    } else {
      favorites.push(id);
      toast("¡Guardado en tus favoritos! ♥");
    }
    save(STORAGE.favorites, favorites);
    renderGallery();
    renderFavorites();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-favorite-id]");
    if (button) toggleFavorite(button.dataset.favoriteId);
  });

  $("#clearFavorites")?.addEventListener("click", () => {
    if (!favorites.length) {
      toast("Todavía no tienes favoritos guardados.");
      return;
    }
    if (!confirm("¿Quieres quitar todas las imágenes de tus favoritos?")) return;
    favorites = [];
    save(STORAGE.favorites, favorites);
    renderGallery();
    renderFavorites();
    toast("Favoritos eliminados.");
  });

  // CREADOR DE COMBINACIONES
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

  function matchesCombination(item, combo) {
    return (combo.texture === "todos" || item.texture.includes(combo.texture)) &&
      (combo.length === "todos" || item.length === "todos" || item.length === combo.length) &&
      (combo.color === "todos" || item.color === "todos" || item.color === combo.color) &&
      (combo.mood === "todos" || item.mood.includes(combo.mood));
  }

  function renderCombo(items, message) {
    if (!lookResult) return;
    lookResult.replaceChildren();

    const container = document.createElement("div");
    container.className = "combo-result";

    const title = document.createElement("h3");
    title.textContent = "Tu inspiración personalizada";

    const description = document.createElement("p");
    description.textContent = message;

    const grid = document.createElement("div");
    grid.className = "combo-images";

    items.forEach(item => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      const caption = document.createElement("figcaption");
      img.src = `img/${item.file}`;
      img.alt = item.title;
      img.loading = "lazy";
      img.addEventListener("error", () => {
        console.warn("Imagen no encontrada:", `img/${item.file}`);
      });
      caption.textContent = item.title;
      figure.append(img, caption);
      grid.append(figure);
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
      save(STORAGE.favorites, favorites);
      renderGallery();
      renderFavorites();
      toast(added ? `Se guardaron ${added} nuevas ideas.` : "Ya estaban en favoritos.");
    });

    const another = document.createElement("button");
    another.type = "button";
    another.className = "btn secondary";
    another.textContent = "↻ Probar otra combinación";
    another.addEventListener("click", () => generateCombination(true));

    actions.append(saveButton, another);
    container.append(title, description, grid, actions);
    lookResult.append(container);
  }

  function generateCombination(randomize = false) {
    const combo = getCombination();
    let candidates = images.filter(item => matchesCombination(item, combo));

    if (randomize) candidates = candidates.sort(() => Math.random() - 0.5);

    if (!candidates.length) {
      if (creatorMessage) {
        creatorMessage.textContent = "No encontramos coincidencias exactas. Cambia alguna preferencia.";
      }
      return renderCombo(images.slice(0, 3), "Prueba otra combinación de preferencias.");
    }

    currentCombo = combo;
    save(STORAGE.combo, combo);

    const description = Object.values(combo).filter(value => value !== "todos").join(" · ");
    renderCombo(candidates.slice(0, 3), description ? `Tu selección: ${description}.` : "Ideas para explorar tu estilo.");

    if (creatorMessage) creatorMessage.textContent = "¡Combinación creada! Puedes guardar las ideas.";
  }

  $("#generateLook")?.addEventListener("click", () => generateCombination());

  $("#resetCreator")?.addEventListener("click", () => {
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
        </div>`;
    }
    if (creatorMessage) creatorMessage.textContent = "Preferencias reiniciadas.";
    toast("Creador reiniciado.");
  });

  // PERFIL
  const profileForm = $("#profileForm");
  const profileName = $("#profileName");
  const profileNote = $("#profileNote");
  const profileGreeting = $("#profileGreeting");
  const profileMessage = $("#profileMessage");

  function updateGreeting() {
    if (profileGreeting) profileGreeting.textContent = profileName?.value.trim() || "creadora";
  }

  function loadProfile() {
    const profile = read(STORAGE.profile, {});
    if (profileName && typeof profile.name === "string") profileName.value = profile.name;
    if (profileNote && typeof profile.note === "string") profileNote.value = profile.note;
    updateGreeting();
  }

  profileName?.addEventListener("input", updateGreeting);

  profileForm?.addEventListener("submit", event => {
    event.preventDefault();
    const profile = {
      name: profileName?.value.trim() || "",
      note: profileNote?.value.trim() || ""
    };
    if (!save(STORAGE.profile, profile)) return;
    updateGreeting();
    if (profileMessage) profileMessage.textContent = "¡Tu perfil se guardó correctamente!";
    toast("Perfil actualizado.");
  });

  // AÑO
  if ($("#year")) $("#year").textContent = String(new Date().getFullYear());

  // INICIALIZAR
  renderGallery();
  renderFavorites();
  loadProfile();

  const previousCombo = read(STORAGE.combo, null);
  if (previousCombo) {
    if (textureSelect) textureSelect.value = previousCombo.texture || "todos";
    if (lengthSelect) lengthSelect.value = previousCombo.length || "todos";
    if (colorSelect) colorSelect.value = previousCombo.color || "todos";
    if (moodSelect) moodSelect.value = previousCombo.mood || "todos";
  }

  console.info("HAIRLAB está lista para usarse.");
});