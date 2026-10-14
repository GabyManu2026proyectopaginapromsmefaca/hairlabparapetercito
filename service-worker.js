const CACHE_NAME = "hairlab-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./img/LOGO.png",
  "./img/medio-ondulado.jpg",
  "./img/ondulado.jpg",
  "./img/chocolate.jpg",
  "./img/rosa.jpg",
  "./img/largo-liso.jpg",
  "./img/peinado-liso-largo-1.jpg"
];

// Instalar y guardar los archivos disponibles
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        FILES_TO_CACHE.map(async (file) => {
          try {
            await cache.add(file);
          } catch (error) {
            console.warn("No se pudo guardar en caché:", file);
          }
        })
      );

      await self.skipWaiting();
    })
  );
});

// Activar y eliminar cachés antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Buscar primero en caché y luego en internet
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // No interceptar páginas de otros sitios
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});