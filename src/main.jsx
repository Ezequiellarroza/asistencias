import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Configurar auto-actualización del Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nueva versión disponible, actualizando...')
    // Recargar automáticamente cuando hay una actualización
    updateSW(true)
  },
  onOfflineReady() {
    console.log('Aplicación lista para funcionar sin conexión')
  },
  onRegistered(registration) {
    console.log('Service Worker registrado')
    
    // Verificar actualizaciones cada 60 segundos
    if (registration) {
      setInterval(() => {
        registration.update()
      }, 60000) // 60 segundos
    }
  },
  onRegisterError(error) {
    console.error('Error al registrar Service Worker:', error)
  },
  immediate: true // Activar inmediatamente
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)