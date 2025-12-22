# 📱 Sistema PWA de Presentismo - Frontend

**Interfaz PWA con React + Vite + Tailwind CSS + Anthropic Claude**

Este es el cliente del sistema de control de asistencia para **Trinity Web Development**. Está diseñado bajo una **filosofía zen y minimalista** como una **Progressive Web App (PWA)** para permitir el fichaje de empleados mediante geolocalización y verificación por IA.

---

## 🎯 Características

✅ **Experiencia PWA Nativa** - Instalable en dispositivos móviles con soporte para Service Workers (`sw.js`) y funcionamiento offline.
✅ **Verificación de Identidad con IA** - Interfaz dinámica para responder preguntas generadas por **Claude API** para evitar suplantación.
✅ **Geolocalización en Tiempo Real** - Captura de coordenadas GPS mediante el navegador para validar la ubicación del fichaje.
✅ **Arquitectura por Features** - Organización de código escalable separando Admin, Empleado y Autenticación.
✅ **Protección de Rutas** - Sistema de navegación seguro basado en JWT y estados de autenticación global.
✅ **Notificaciones Push** - Sistema integrado de avisos para confirmar marcaciones y alertas administrativas.

---

## 📁 Estructura del Proyecto

```text
src/
|   App.css
|   App.jsx                 # Enrutador principal y lógica de rutas protegidas
|   index.css
|   Login.jsx               # Acceso unificado (Admin/Empleado)
|   main.jsx                # Punto de entrada de React
|   sw.js                   # Service Worker para capacidades PWA
|   
+---assets/
|       react.svg
|       
+---components/             # Componentes de arquitectura
|   |   ProtectedRoute.jsx  # Validador de acceso para usuarios logueados
|   |   PublicRoute.jsx     # Validador para evitar login doble
|   \---ui/                 # Modales, Toasts, Paginación y elementos UI
|
+---context/                # Estados globales (AuthContext, AppContext)
|
+---features/               # Lógica de negocio (El corazón de la App)
|   +---admin/              # Gestión de reportes, empleados y oficinas
|   +---auth/               # Flujo de login y validación por IA (PreguntasIA.jsx)
|   \---empleado/           # Panel de fichaje, historial y tareas
|
+---hooks/                  # Custom Hooks (useAuth, useGeolocation, useToast)
|
+---services/               # Comunicación con Backend y APIs
|       anthropicService.js # Lógica para la validación con Claude
|       api.js              # Configuración base de Axios/Fetch
|       authService.js      # Gestión de tokens y sesiones
|
\---utils/                  # Validadores de GPS y formateadores de datos

🚀 Instalación Rápida
1. Requisitos
Node.js 18.x o superior.

npm o yarn.

2. Pasos para despliegue local
Bash

# 1. Clonar el repositorio
git clone [https://github.com/Ezequiellarroza/asistencias.git](https://github.com/Ezequiellarroza/asistencias.git)

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
📡 Configuración (.env)
El frontend requiere configurar la URL de la API REST (PHP) para funcionar correctamente:

Fragmento de código

VITE_API_URL=[https://tu-api-backend.com/api](https://tu-api-backend.com/api)
VITE_APP_NAME="Asistencias Trinity"
🔒 Seguridad Implementada
✅ Rutas Protegidas - Verificación de JWT en cada cambio de vista. ✅ Sanitización de Datos - Limpieza de inputs para prevenir ataques XSS. ✅ Validación GPS - Comparación de precisión de coordenadas antes de enviar al servidor. ✅ Manejo de Sesiones - Persistencia segura de tokens en almacenamiento local.

📞 Soporte
Desarrollador: Eze - Trinity Web Development URL: https://ezequiellarroza.com.ar

Versión 1.0 | Dic 2025 | Production Ready ✅