// sw.js - исправленная версия
const CACHE_NAME = "wedo-cache-v5";
const OFFLINE_URL = "/offline.html";

// Кешируем ТОЛЬКО статические файлы, НЕ HTML
const STATIC_CACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/css/st.css",
  "/css/toast.css",
  "/css/page.css",
  "/js/app.js",
  "/js/upload.js",
  "/js/config.js",
  "/assistant/style.css",
  "/assistant/script.js",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Установка v5");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Активация v5");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Удаляем старый кеш:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// ГЛАВНОЕ: НЕ кешируем HTML страницы
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // HTML страницы (включая teams/*.htm) - ТОЛЬКО СЕТЬ, НЕ КЕШ
  if (
    event.request.mode === "navigate" ||
    url.pathname.endsWith(".htm") ||
    url.pathname === "/" ||
    url.pathname === "/index.html"
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      }),
    );
    return;
  }

  // Статические файлы (css, js, изображения) - кеш с обновлением
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|json)$/)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        }),
    );
    return;
  }

  // Всё остальное - только сеть
  event.respondWith(fetch(event.request));
});
