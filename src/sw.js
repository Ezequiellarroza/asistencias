/**
 * Service Worker - Valle de los Ciervos PWA
 * Con soporte para Notificaciones Push
 * 
 * @version 2.0
 * @date 2025-11-21
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// ============================================
// PRECACHING
// ============================================
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ============================================
// ESTRATEGIAS DE CACHÉ
// ============================================

// APIs - Network First
registerRoute(
  /^https:\/\/.*\/api\/.*/i,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 300
      })
    ]
  })
);

// HTML - Network First
registerRoute(
  /\.html$/,
  new NetworkFirst({
    cacheName: 'html-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 86400
      })
    ]
  })
);

// CSS y JS - Stale While Revalidate
registerRoute(
  /\.(?:js|css)$/,
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 2592000
      })
    ]
  })
);

// Imágenes - Cache First
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 2592000
      })
    ]
  })
);

// Fuentes - Cache First
registerRoute(
  /\.(?:woff|woff2|ttf|eot)$/,
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 31536000
      })
    ]
  })
);

// Navegación - Fallback a index.html
const navRoute = new NavigationRoute(
  ({ request }) => {
    return caches.match('/valle/index.html');
  },
  {
    denylist: [/^\/api/]
  }
);
registerRoute(navRoute);

// ============================================
// NOTIFICACIONES PUSH
// ============================================

/**
 * Manejar evento push (cuando llega una notificación)
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido');
  console.log('[Service Worker] Tiene datos:', event.data ? 'SÍ' : 'NO');
  
  if (event.data) {
    console.log('[Service Worker] Tipo:', typeof event.data);
    
    try {
      // Intentar parsear como JSON
      const textData = event.data.text();
      console.log('[Service Worker] Data text:', textData);
      
      const payload = JSON.parse(textData);
      console.log('[Service Worker] Payload parseado:', payload);
      
      // Mostrar notificación con datos del payload
      event.waitUntil(
        self.registration.showNotification(payload.title || 'Valle de los Ciervos', {
          body: payload.body || 'Nueva notificación',
          icon: payload.icon || '/valle/icons/icon-192x192.png',
          badge: payload.badge || '/valle/icons/icon-192x192.png',
          tag: payload.data?.type || 'general',
          requireInteraction: payload.data?.urgency === 'high',
          data: payload.data || { url: '/valle/' },
          vibrate: [200, 100, 200],
          actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Cerrar' }
          ]
        })
      );
      
    } catch (error) {
      console.error('[Service Worker] Error parseando push:', error);
      console.error('[Service Worker] Error stack:', error.stack);
      
      // Mostrar notificación por defecto si falla el parseo
      event.waitUntil(
        self.registration.showNotification('Nueva notificación', {
          body: 'Tienes una actualización en Valle de los Ciervos',
          icon: '/valle/icons/icon-192x192.png',
          badge: '/valle/icons/icon-192x192.png',
          tag: 'default-notification',
          data: { url: '/valle/' }
        })
      );
    }
  } else {
    console.log('[Service Worker] Push sin datos');
    
    // Notificación por defecto cuando no hay payload
    event.waitUntil(
      self.registration.showNotification('Nueva notificación', {
        body: 'Tienes una actualización',
        icon: '/valle/icons/icon-192x192.png',
        badge: '/valle/icons/icon-192x192.png',
        data: { url: '/valle/' }
      })
    );
  }
});

/**
 * Manejar clic en notificación
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/valle/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Manejar cambios en la suscripción push
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Service Worker] Suscripción push cambió');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BBiSyT2AKqeX3MwO8hrXKVDN_BXK5Ue7GfT5wLF0I6WGSrIypYZ-n4vvBctJEUBBNAF01_yjgv0C1l5xSdK8SxM'
      )
    })
    .then((subscription) => {
      console.log('[Service Worker] Nueva suscripción creada');
      
      return fetch('/valle/api/push-subscribe.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getTokenFromStorage()
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          }
        })
      });
    })
    .catch((error) => {
      console.error('[Service Worker] Error al renovar suscripción:', error);
    })
  );
});

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Convertir base64 URL-safe a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Convertir ArrayBuffer a base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Obtener token JWT del storage
 */
function getTokenFromStorage() {
  return '';
}

// ============================================
// ACTIVACIÓN Y SKIP WAITING
// ============================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando v2.0...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando v2.0...');
  event.waitUntil(clients.claim());
});

console.log('[Service Worker] v2.0 cargado con soporte para Push Notifications');