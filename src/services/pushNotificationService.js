/**
 * Servicio de Notificaciones Push - Frontend
 * Valle de los Ciervos PWA
 * 
 * @version 1.0
 * @date 2025-11-20
 */

// Clave pública VAPID (del servidor)
const VAPID_PUBLIC_KEY = 'BBiSyT2AKqeX3MwO8hrXKVDN_BXK5Ue7GfT5wLF0I6WGSrIypYZ-n4vvBctJEUBBNAF01_yjgv0C1l5xSdK8SxM';

// URL del API
const API_BASE_URL = '/valle/api';

/**
 * Verificar si el navegador soporta notificaciones push
 */
export function checkPushSupport() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no soportados');
    return false;
  }
  
  if (!('PushManager' in window)) {
    console.warn('Push API no soportada');
    return false;
  }
  
  if (!('Notification' in window)) {
    console.warn('Notifications API no soportada');
    return false;
  }
  
  return true;
}

/**
 * Obtener el estado actual de los permisos de notificaciones
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  return Notification.permission; // 'default', 'granted', 'denied'
}

/**
 * Solicitar permisos de notificaciones al usuario
 */
export async function requestNotificationPermission() {
  if (!checkPushSupport()) {
    throw new Error('Las notificaciones push no están soportadas en este navegador');
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    throw new Error('Los permisos de notificaciones fueron denegados previamente');
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Obtener la suscripción actual (si existe)
 */
export async function getCurrentSubscription() {
  if (!checkPushSupport()) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    return null;
  }
}

/**
 * Suscribirse a notificaciones push
 */
export async function subscribeToPush() {
  if (!checkPushSupport()) {
    throw new Error('Las notificaciones push no están soportadas');
  }
  
  try {
    // Verificar/solicitar permisos
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Permisos de notificaciones no otorgados');
    }
    
    // Esperar a que el Service Worker esté listo
    const registration = await navigator.serviceWorker.ready;
    
    // Verificar si ya hay una suscripción
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('Ya existe una suscripción push');
    } else {
      // Crear nueva suscripción
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      console.log('Nueva suscripción push creada');
    }
    
    // Enviar suscripción al servidor
    await sendSubscriptionToServer(subscription);
    
    return subscription;
    
  } catch (error) {
    console.error('Error al suscribirse a push:', error);
    throw error;
  }
}

/**
 * Desuscribirse de notificaciones push
 */
export async function unsubscribeFromPush() {
  if (!checkPushSupport()) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('No hay suscripción activa');
      return true;
    }
    
    // Eliminar suscripción del servidor primero
    await removeSubscriptionFromServer(subscription);
    
    // Luego cancelar suscripción del navegador
    const success = await subscription.unsubscribe();
    
    if (success) {
      console.log('Suscripción cancelada exitosamente');
    }
    
    return success;
    
  } catch (error) {
    console.error('Error al desuscribirse:', error);
    throw error;
  }
}

/**
 * Enviar suscripción al servidor
 */
async function sendSubscriptionToServer(subscription) {
  const token = localStorage.getItem('jwt_token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const subscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    }
  };
  
  const response = await fetch(`${API_BASE_URL}/push-subscribe.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(subscriptionData)
  });
  
  if (!response.ok) {
    throw new Error('Error al guardar suscripción en el servidor');
  }
  
  const data = await response.json();
  console.log('Suscripción guardada en servidor:', data);
  
  return data;
}

/**
 * Eliminar suscripción del servidor
 */
async function removeSubscriptionFromServer(subscription) {
  const token = localStorage.getItem('jwt_token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_BASE_URL}/push-subscribe.php`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint
    })
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar suscripción del servidor');
  }
  
  const data = await response.json();
  console.log('Suscripción eliminada del servidor:', data);
  
  return data;
}

/**
 * Verificar si el usuario está suscrito actualmente
 */
export async function isSubscribed() {
  const subscription = await getCurrentSubscription();
  return subscription !== null;
}

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
 * Mostrar notificación de prueba (requiere permisos)
 */
export async function showTestNotification() {
  if (!checkPushSupport()) {
    throw new Error('Las notificaciones no están soportadas');
  }
  
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    throw new Error('Permisos de notificaciones no otorgados');
  }
  
  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification('Notificación de Prueba', {
    body: 'Las notificaciones están funcionando correctamente 🎉',
    icon: '/valle/icons/icon-192x192.png',
    badge: '/valle/icons/icon-192x192.png',
    tag: 'test-notification',
    vibrate: [200, 100, 200]
  });
  
  console.log('Notificación de prueba mostrada');
}

export default {
  checkPushSupport,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  isSubscribed,
  showTestNotification
};