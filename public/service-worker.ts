const CACHE_NAME = 'costa-verde-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';
const IMAGE_CACHE = 'image-v1';

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
];

const API_ROUTES = [
  '/api/boats',
  '/api/bookings',
  '/api/favorites',
];

// Função auxiliar para verificar se uma URL é uma rota da API
const isApiRoute = (url: string) => API_ROUTES.some(route => url.includes(route));

// Função auxiliar para verificar se é uma imagem
const isImageRequest = (url: string) => url.match(/\.(jpg|jpeg|png|gif|webp)/i);

// Função para limitar o tamanho do cache
const limitCacheSize = async (cacheName: string, maxItems: number) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
};

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
      caches.open(IMAGE_CACHE),
    ])
  );
  (self as any).skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && 
                         name !== DYNAMIC_CACHE && 
                         name !== API_CACHE &&
                         name !== IMAGE_CACHE)
          .map(name => caches.delete(name))
      );
    })
  );
  (self as any).clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para assets estáticos
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(response => response || fetch(request))
    );
    return;
  }

  // Estratégia para rotas da API
  if (isApiRoute(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then(async response => {
          const cache = await caches.open(API_CACHE);
          const clonedResponse = response.clone();
          await cache.put(request, clonedResponse);
          await limitCacheSize(API_CACHE, 50);
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || new Response(
            JSON.stringify({ error: 'Offline', cached: true }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Estratégia para imagens
  if (isImageRequest(url.pathname)) {
    event.respondWith(
      caches.match(request).then(async response => {
        if (response) return response;

        try {
          const fetchResponse = await fetch(request);
          const cache = await caches.open(IMAGE_CACHE);
          await cache.put(request, fetchResponse.clone());
          await limitCacheSize(IMAGE_CACHE, 100);
          return fetchResponse;
        } catch (error) {
          return new Response('Imagem indisponível', { status: 503 });
        }
      })
    );
    return;
  }

  // Estratégia padrão para outros recursos
  event.respondWith(
    fetch(request)
      .then(async response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, response.clone());
        await limitCacheSize(DYNAMIC_CACHE, 75);
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        if (request.mode === 'navigate') {
          return caches.match('/offline');
        }

        return new Response('Recurso indisponível', { status: 503 });
      })
  );
});

// Sincronização em background para envios offline
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  } else if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Listener para notificações push
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.description,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url,
    actions: [
      { action: 'view', title: 'Ver detalhes' }
    ]
  };

  event.waitUntil(
    (self as any).registration.showNotification(data.title, options)
  );
});

// Handler para ações de notificação
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  if (event.action === 'view' && event.notification.data) {
    event.waitUntil(
      (self as any).clients.openWindow(event.notification.data)
    );
  }
});

// Funções auxiliares para sincronização
async function syncBookings() {
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  const bookingRequests = requests.filter(request => 
    request.url.includes('/api/bookings') && 
    request.method === 'POST'
  );

  return Promise.all(
    bookingRequests.map(async request => {
      try {
        await fetch(request.clone());
        return cache.delete(request);
      } catch (error) {
        console.error('Erro ao sincronizar reserva:', error);
      }
    })
  );
}

async function syncFavorites() {
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  const favoriteRequests = requests.filter(request => 
    request.url.includes('/api/favorites') && 
    (request.method === 'POST' || request.method === 'DELETE')
  );

  return Promise.all(
    favoriteRequests.map(async request => {
      try {
        await fetch(request.clone());
        return cache.delete(request);
      } catch (error) {
        console.error('Erro ao sincronizar favoritos:', error);
      }
    })
  );
} 