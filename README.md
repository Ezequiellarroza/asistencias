🎯 Características Principales
✅ Instalable (PWA) - Soporte para Service Workers (sw.js) y funcionamiento offline. ✅ Verificación con IA - Integración con Claude (Anthropic) para validación de identidad. ✅ Geolocalización en Tiempo Real - Captura y validación de coordenadas GPS al marcar. ✅ Gestión Multiarea - Paneles específicos para Administradores y Empleados. ✅ Sistema de Notificaciones - Soporte para Push Notifications y alertas visuales dinámicas. ✅ Seguridad de Rutas - Protección de vistas mediante JWT y contextos de autenticación.

📁 Estructura del Proyecto
Plaintext

src/
|   App.jsx                 # Enrutador principal y lógica de rutas
|   Login.jsx               # Pantalla de acceso unificada
|   main.jsx                # Punto de entrada de React
|   sw.js                   # Configuración de Service Worker (PWA)
|   
+---components/             # Componentes de arquitectura
|   |   ProtectedRoute.jsx  # Validador de rutas privadas
|   |   PublicRoute.jsx    # Validador de rutas públicas
|   \---ui/                 # Componentes de interfaz (Modales, Toasts)
|
+---context/                # Estados globales (Auth y App)
|
+---features/               # Lógica de negocio por roles
|   +---admin/              # Panel de control, Reportes y Gestión
|   +---auth/               # Flujo de Login y Preguntas de IA
|   \---empleado/           # Marcación, Historial y Dashboard de usuario
|
+---hooks/                  # Lógica reutilizable (GPS, API, Toast)
|
+---services/               # Comunicación con APIs externas y Backend
|       anthropicService.js # Conexión con IA Claude
|       api.js              # Configuración base de Fetch/Axios
|       pushNotification.js # Gestión de notificaciones push
|
\---utils/                  # Validadores, formateadores y constantes
🚀 Instalación y Desarrollo
1. Requisitos
Node.js v18.0 o superior.

npm o yarn.

2. Configuración
Bash

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
3. Comandos
Desarrollo: npm run dev

Producción: npm run build

Previsualizar: npm run preview

⚙️ Variables de Entorno (.env)
Es necesario configurar la URL del backend para que el sistema funcione:

Fragmento de código

VITE_API_URL=https://tu-api-backend.com/api
VITE_ANTHROPIC_KEY=tu_key_aqui
📞 Soporte y Desarrollo
Desarrollador: Eze - Trinity Web Development

Marca: Trinity Personal Brand

URL: https://ezequiellarroza.com.ar

Versión 1.0 | Dic 2025 | Estructura Profesional ✅