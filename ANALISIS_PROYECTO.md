# Analisis del Proyecto: Sistema de Asistencias - Valle de los Ciervos

**Fecha de analisis:** 28 de enero de 2026
**Version analizada:** 1.0.0 (PWA Presentismo)

---

## 1. Resumen Ejecutivo

### Estado actual
El proyecto es una **PWA (Progressive Web App)** de control de asistencia/presentismo para "Valle de los Ciervos" (cabanas en Tandil). Consta unicamente de un **frontend React** que consume una API PHP alojada en `ezequiellarroza.com.ar/valle/api`. El backend no esta incluido en este repositorio.

La aplicacion esta **funcional y en produccion**, con un conjunto amplio de funcionalidades tanto para empleados como para administradores. Sin embargo, presenta areas significativas de mejora en seguridad, arquitectura, mantenimiento de codigo y buenas practicas.

### Tecnologias principales
| Capa | Tecnologia |
|------|-----------|
| Framework | React 19.1.1 |
| Build Tool | Vite 7.1.7 |
| Routing | React Router DOM 7.9.5 |
| Estilos | Tailwind CSS 3.4.1 |
| Iconos | Lucide React 0.552.0 |
| PWA | vite-plugin-pwa 1.1.0 (Workbox) |
| API Backend | PHP (externo, no en repo) |
| Auth | JWT (localStorage) |

---

## 2. Estructura del Proyecto

```
asistencias/
├── .env / .env.example
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── icons/                        # 9 iconos PWA (72x72 a 512x512)
├── public/
│   ├── manifest.json
│   └── vite.svg
└── src/
    ├── main.jsx                  # Entry point + registro SW
    ├── App.jsx                   # Router principal
    ├── Login.jsx                 # Login legacy (no usado)
    ├── App.css / index.css       # Estilos globales + Tailwind
    ├── sw.js                     # Service Worker (Workbox + Push)
    ├── context/
    │   ├── AuthContext.jsx       # Estado de autenticacion
    │   └── AppContext.jsx        # [VACIO]
    ├── hooks/
    │   ├── useAuth.js            # [VACIO]
    │   ├── useAPI.js             # [VACIO]
    │   ├── useGeolocation.js     # GPS + Haversine
    │   ├── useToast.jsx          # Sistema de notificaciones UI
    │   └── useViewTransition.js  # View Transitions API
    ├── services/
    │   ├── api.js                # Cliente HTTP (fetch + JWT)
    │   ├── authService.js        # Login empleado/admin + IA
    │   ├── marcacionService.js   # Entrada/salida + GPS
    │   ├── empleadoService.js    # CRUD empleados + tareas
    │   ├── adminService.js       # 30+ metodos admin (1038 lineas)
    │   ├── pushNotificationService.js  # Web Push API
    │   ├── anthropicService.js   # [VACIO]
    │   └── gmailService.js       # [VACIO]
    ├── components/
    │   ├── ProtectedRoute.jsx    # Guard por rol
    │   ├── PublicRoute.jsx       # Guard publico
    │   └── ui/
    │       ├── Modal.jsx
    │       ├── ConfirmModal.jsx
    │       ├── CambiarPasswordModal.jsx
    │       ├── ModalSeleccionOficina.jsx
    │       ├── Pagination.jsx
    │       ├── Toast.jsx
    │       └── ToastContainer.jsx
    ├── features/
    │   ├── auth/
    │   │   ├── LoginEmpleado.jsx
    │   │   ├── LoginAdmin.jsx
    │   │   └── PreguntasIA.jsx   # Verificacion IA
    │   ├── empleado/
    │   │   ├── Dashboard.jsx     # Pantalla principal
    │   │   ├── Marcacion.jsx     # [DEPRECADO]
    │   │   ├── Historial.jsx
    │   │   └── Tareas.jsx
    │   └── admin/
    │       ├── Dashboard.jsx
    │       ├── Alertas.jsx
    │       ├── Empleados.jsx
    │       ├── EmpleadosPresentes.jsx
    │       ├── Oficinas.jsx
    │       ├── Departamentos.jsx
    │       ├── Espacios.jsx
    │       ├── Notificaciones.jsx
    │       ├── Tareas.jsx
    │       ├── MarcacionManual.jsx
    │       ├── Reportes.jsx
    │       ├── ReporteDetalle.jsx
    │       ├── UsuariosAdmin.jsx
    │       ├── Configuracion.jsx
    │       └── Feriados.jsx
    └── utils/
        ├── validators.js         # Validacion telefono AR
        ├── geolocation.js        # Haversine (duplicado)
        ├── constants.js          # [VACIO]
        └── formatters.js         # [VACIO]
```

---

## 3. Funcionalidades Implementadas

### Portal Empleado
- **Login por telefono** (formato argentino +54 / local)
- **Verificacion por IA** (preguntas de seguridad via Anthropic)
- **Marcacion de entrada/salida** con GPS
- **Seleccion de oficina** con calculo de distancia
- **Fallback sin GPS** (genera alerta en backend)
- **Gestion de tareas** (ver, crear, cambiar estado, comentar)
- **Historial de marcaciones**

### Panel Administrador
- **Dashboard** con estadisticas (empleados, presentes, oficinas)
- **CRUD Empleados** (alta, baja logica, modificacion)
- **CRUD Oficinas** (con coordenadas GPS y radio)
- **CRUD Departamentos**
- **CRUD Espacios** (cabanas, habitaciones)
- **Gestion de Tareas** (asignar, priorizar, seguimiento)
- **Marcacion Manual** (entrada, salida, ausencia multi-dia)
- **Sistema de Alertas** (GPS fuera de rango, sin GPS, etc.)
- **Reportes de asistencia** (por empleado, rango de fechas)
- **Empleados presentes** (agrupados por oficina)
- **Gestion de Usuarios Admin** (CRUD + cambio de password)
- **Gestion de Feriados**
- **Configuracion del sistema**
- **Notificaciones Push** (suscripcion, envio, test)

### PWA
- Service Worker con Workbox (cache strategies)
- Manifest para instalacion
- Soporte offline (app shell)
- Push Notifications con VAPID
- Auto-update cada 60 segundos

---

## 4. Endpoints de la API

### Autenticacion
| Metodo | Endpoint | Funcion |
|--------|----------|---------|
| POST | `/empleado/login.php` | Login empleado por telefono |
| POST | `/empleado/generar-preguntas.php` | Preguntas IA para verificacion |
| POST | `/empleado/verificar-respuesta.php` | Verificar respuestas IA |
| POST | `/admin/login.php` | Login admin (user/pass) |

### Empleado
| Metodo | Endpoint | Funcion |
|--------|----------|---------|
| GET | `/empleado/estado.php` | Estado actual de marcacion |
| POST | `/empleado/marcar-entrada.php` | Registrar entrada |
| POST | `/empleado/marcar-salida.php` | Registrar salida |
| GET | `/empleado/marcaciones.php` | Historial de marcaciones |
| GET | `/empleado/oficinas.php` | Oficinas con distancias |
| GET/POST/PUT | `/empleado/tareas.php` | CRUD tareas empleado |
| GET | `/empleado/departamentos.php` | Lista departamentos |
| GET | `/empleado/espacios.php` | Lista espacios |

### Administracion
| Metodo | Endpoint | Funcion |
|--------|----------|---------|
| GET | `/admin/estadisticas.php` | Stats del dashboard |
| GET/POST | `/admin/alertas.php` | Gestion alertas |
| POST | `/admin/revisar-alerta.php` | Resolver alerta |
| GET/POST/PUT/DELETE | `/admin/empleados.php` | CRUD empleados |
| GET/POST/PUT/DELETE | `/admin/oficinas.php` | CRUD oficinas |
| GET/POST/PUT/DELETE | `/admin/departamentos.php` | CRUD departamentos |
| GET/POST/PUT/DELETE | `/admin/espacios.php` | CRUD espacios |
| GET/POST/PUT | `/admin/tareas.php` | Gestion tareas |
| GET/POST/PUT/DELETE | `/admin/marcaciones-manuales.php` | Marcaciones manuales |
| GET/POST/PUT/PATCH/DELETE | `/admin/usuarios-admin.php` | CRUD admins |
| GET | `/admin/reportes.php` | Reportes asistencia |
| GET | `/admin/empleados-presentes.php` | Presentes hoy |
| GET/POST/PUT/DELETE | `/admin/feriados.php` | Gestion feriados |
| POST/DELETE | `/push-subscribe.php` | Suscripcion push |

---

## 5. Flujo de Autenticacion

### Empleado
```
1. Ingresa telefono → POST /empleado/login.php
2. Backend devuelve: { empleado_id, nombre, apellido, jwt_token, oficina }
3. Se guarda jwt_token, empleado y oficina en localStorage
4. Se crea objeto user con tipo:'empleado' en AuthContext
5. Redireccion a /empleado/dashboard
```

### Admin
```
1. Ingresa username + password → POST /admin/login.php
2. Backend devuelve: { jwt_token, id, username, nombre, email }
3. Se guarda jwt_token en localStorage
4. Se crea objeto user con tipo:'admin' en AuthContext
5. Redireccion a /admin/dashboard
```

### Manejo de sesion
- JWT en `localStorage.jwt_token`
- Header `Authorization: Bearer <token>` en cada request
- Error 401 → evento `unauthorized` → limpia storage → redirect a login
- No hay refresh token ni renovacion automatica

---

## 6. Problemas de Seguridad Detectados

### CRITICO

1. **Console.logs con datos sensibles en produccion** (`api.js:30-31, 62-65, 86, 106, 117`)
   - Se loguean tokens JWT (parciales), bodies de request, URLs completas y respuestas
   - Cualquier persona con DevTools puede ver tokens y datos de la API
   - El .env tiene `VITE_ENABLE_CONSOLE_LOGS=false` pero no se usa en el codigo

2. **JWT almacenado en localStorage** (`api.js:34`, `authService.js:26`)
   - Vulnerable a ataques XSS: cualquier script inyectado puede leer `localStorage`
   - No hay proteccion contra robo de token
   - Mejor alternativa: cookies httpOnly con flag Secure

3. **Login de empleado solo por telefono** (`LoginEmpleado.jsx`, `authService.js:12-40`)
   - No requiere password ni segundo factor
   - Cualquiera que conozca un telefono de empleado puede autenticarse
   - La verificacion por IA existe (`PreguntasIA.jsx`) pero no esta integrada en el flujo principal

4. **VAPID key hardcodeada** (`pushNotificationService.js:10`, `sw.js:218`)
   - La clave publica VAPID esta en el codigo fuente visible
   - Esta duplicada en dos archivos

5. **API Base URL hardcodeada** (`api.js:6`)
   - URL de produccion en el codigo fuente
   - Comentario indica que `.env` no funciona en build, pero no se investigo la causa

### MEDIO

6. **Sin validacion de expiacion del JWT en frontend**
   - Solo se verifica si existe el token, no si esta expirado
   - Se depende completamente del 401 del backend

7. **Datos del usuario en localStorage sin encriptar** (`authService.js:29-30`)
   - Nombre, apellido, telefono y oficina en texto plano
   - Accesible desde DevTools y cualquier script

8. **`getTokenFromStorage()` en Service Worker devuelve string vacio** (`sw.js:283-285`)
   - La funcion para renovar suscripcion push no puede autenticarse
   - El SW no tiene acceso a localStorage

9. **Sin proteccion CSRF**
   - Las peticiones fetch no incluyen tokens CSRF
   - Depende de que el backend valide el JWT correctamente

10. **Sin rate limiting en el frontend**
    - No hay proteccion contra clicks multiples en botones criticos (mas alla de `disabled`)
    - No hay debounce en busquedas

---

## 7. Areas de Mejora y Deuda Tecnica

### Archivos Vacios (codigo muerto)
Los siguientes archivos existen pero estan vacios y no se usan:
- `src/context/AppContext.jsx` - Context vacio
- `src/hooks/useAuth.js` - Hook vacio (la funcionalidad ya esta en AuthContext)
- `src/hooks/useAPI.js` - Hook vacio
- `src/services/anthropicService.js` - Servicio vacio
- `src/services/gmailService.js` - Servicio vacio
- `src/utils/constants.js` - Constantes vacio
- `src/utils/formatters.js` - Formatters vacio
- `src/.env.example` - Sin contenido

### Codigo Duplicado

1. **Calculo Haversine duplicado en 3 lugares:**
   - `src/hooks/useGeolocation.js:154-167` (funcion `calcularDistancia`)
   - `src/utils/geolocation.js` (funcion `calcularDistancia`)
   - `src/services/marcacionService.js:208-223` (metodo `validarUbicacion`)

2. **Funciones helper duplicadas en SW y pushNotificationService:**
   - `urlBase64ToUint8Array()` en `sw.js:252-265` y `pushNotificationService.js:248-262`
   - `arrayBufferToBase64()` en `sw.js:271-278` y `pushNotificationService.js:267-274`

3. **Patron de servicio repetitivo** (`adminService.js`):
   - 30+ metodos con la misma estructura try/catch/response.success
   - Cada metodo repite el mismo patron de manejo de errores
   - El archivo tiene 1038 lineas, la mayoria boilerplate

4. **Servicio `empleadoService.js` duplica funcionalidad de `adminService.js`:**
   - Ambos tienen metodos CRUD para empleados apuntando a los mismos endpoints
   - `empleadoService.obtenerEmpleados()` llama a `/admin/empleados.php` (endpoint admin)

5. **Componente `Login.jsx` en raiz no se usa:**
   - Existe `src/Login.jsx` pero las rutas usan `LoginEmpleado.jsx` y `LoginAdmin.jsx`
   - Codigo legacy no eliminado

### Problemas de Arquitectura

1. **`adminService.js` es un God Object** (1038 lineas)
   - Contiene toda la logica admin en una sola clase
   - Deberia dividirse por dominio: `alertaService`, `oficinaService`, `tareaService`, etc.

2. **No hay manejo de estado global para datos**
   - Cada componente hace sus propias llamadas API
   - No hay cache de datos ni estado compartido
   - `AppContext.jsx` esta vacio
   - Se podria usar React Query / TanStack Query

3. **Sin lazy loading de rutas**
   - Todos los componentes se importan estaticamente en `App.jsx`
   - El bundle incluye todo el panel admin aunque el usuario sea empleado
   - Se deberia usar `React.lazy()` + `Suspense`

4. **Inconsistencia en indentacion** (`App.jsx:211-227`)
   - Las ultimas rutas tienen indentacion diferente al resto
   - Mezcla de estilos en el mismo archivo

5. **Patron singleton en servicios sin necesidad**
   - Todos los servicios son clases con instancia singleton exportada
   - Podrian ser funciones simples (no mantienen estado interno)
   - El patron clase agrega complejidad innecesaria

6. **Falta de TypeScript**
   - El proyecto tiene `@types/react` y `@types/react-dom` en devDependencies
   - Pero todo el codigo es JavaScript puro (.jsx/.js)
   - Sin type-checking, los errores se descubren en runtime

### Problemas de UX/Frontend

1. **Sin page "Not Found" real**
   - La ruta catch-all (`*`) redirige silenciosamente a `/`
   - No hay feedback al usuario de que la ruta no existe

2. **Sin skeleton loaders**
   - Solo se muestra un spinner generico durante la carga
   - No hay indicacion visual de la estructura que se va a cargar

3. **Sin manejo de estado offline real**
   - El SW cachea assets pero las llamadas API fallan silenciosamente
   - No hay indicador "sin conexion" ni cola de operaciones offline

4. **Componente Marcacion.jsx deprecado pero no eliminado**
   - `src/features/empleado/Marcacion.jsx` existe pero no tiene ruta
   - El Dashboard ya integra la funcionalidad de marcacion

### Mejoras de Rendimiento

1. **Sin memoizacion**
   - Los componentes no usan `React.memo`, `useMemo` ni `useCallback` (salvo useGeolocation)
   - Re-renders innecesarios en listas grandes (empleados, tareas, reportes)

2. **`defaultOptions` recrea objeto en cada render** (`useGeolocation.js:19-23`)
   - El objeto de opciones se recrea cada render
   - Esto invalida los `useCallback` que lo usan como dependencia
   - Deberia estar fuera del componente o en `useMemo`

3. **Sin virtualizacion de listas**
   - Las listas de empleados, tareas, alertas no usan virtualizacion
   - Con muchos registros, el rendimiento se degrada

4. **Iconos PWA no optimizados**
   - 9 archivos PNG sin compresion WebP
   - Se podrian reducir a los 3 requeridos (192, 512, maskable)

### Buenas Practicas Faltantes

1. **Sin tests** - No hay archivos de test ni configuracion de testing
2. **Sin CI/CD** - No hay pipeline de integracion continua
3. **Sin error boundary** - Un error en un componente rompe toda la app
4. **Sin linting en pre-commit** - ESLint configurado pero sin husky/lint-staged
5. **Sin versionado semantico real** - Version 0.0.0 en package.json
6. **Sin documentacion de API** - Los endpoints se descubren leyendo el codigo
7. **Sin variables de entorno para diferente environments** - Solo hay `.env` de produccion
8. **Manifest.json inconsistente con vite.config.js** - Diferentes configuraciones de PWA

---

## 8. Dependencias

### Produccion
| Paquete | Version | Estado |
|---------|---------|--------|
| react | ^19.1.1 | Actualizado |
| react-dom | ^19.1.1 | Actualizado |
| react-router-dom | ^7.9.5 | Actualizado |
| lucide-react | ^0.552.0 | Actualizado |

### Desarrollo
| Paquete | Version | Nota |
|---------|---------|------|
| vite | ^7.1.7 | Actualizado |
| tailwindcss | ^3.4.1 | v4 disponible |
| @vitejs/plugin-react | ^5.0.4 | OK |
| vite-plugin-pwa | ^1.1.0 | OK |
| eslint | ^9.36.0 | OK |
| autoprefixer | ^10.4.21 | OK |
| postcss | ^8.5.6 | OK |

**Nota:** El proyecto tiene pocas dependencias, lo cual es positivo para el tamano del bundle y la superficie de ataque.

---

## 9. Lista Priorizada de Mejoras

### Prioridad CRITICA (Seguridad)

| # | Mejora | Impacto |
|---|--------|---------|
| 1 | Eliminar todos los `console.log` de produccion o implementar logging condicional | Datos sensibles expuestos |
| 2 | Agregar segundo factor de autenticacion para empleados (la verificacion IA ya existe) | Login solo con telefono |
| 3 | Migrar JWT de localStorage a cookies httpOnly (requiere cambio en backend) | Proteccion contra XSS |
| 4 | Mover VAPID key a variables de entorno | Clave hardcodeada |
| 5 | Arreglar el uso de variables de entorno (investigar por que .env no funciona en build) | URL de produccion hardcodeada |

### Prioridad ALTA (Calidad de Codigo)

| # | Mejora | Impacto |
|---|--------|---------|
| 6 | Eliminar archivos vacios y codigo muerto (Login.jsx, Marcacion.jsx, servicios vacios) | Confusion en el codebase |
| 7 | Refactorizar `adminService.js` en servicios mas pequenos por dominio | Mantenibilidad |
| 8 | Unificar calculo Haversine en un solo lugar (`utils/geolocation.js`) | Codigo duplicado |
| 9 | Eliminar `empleadoService.js` duplicado o clarificar responsabilidades | Duplicacion de logica |
| 10 | Implementar lazy loading de rutas con `React.lazy()` | Bundle size |

### Prioridad MEDIA (Arquitectura y DX)

| # | Mejora | Impacto |
|---|--------|---------|
| 11 | Agregar React Error Boundary | Resilencia de la app |
| 12 | Implementar cache de datos (React Query o similar) | Rendimiento y UX |
| 13 | Agregar tests unitarios basicos (al menos servicios y hooks) | Confiabilidad |
| 14 | Arreglar `getTokenFromStorage()` en Service Worker (siempre devuelve '') | Push notifications rotas |
| 15 | Fixear el bug de `defaultOptions` en useGeolocation (recrea objeto cada render) | Rendimiento GPS |

### Prioridad BAJA (Nice to have)

| # | Mejora | Impacto |
|---|--------|---------|
| 16 | Migrar a TypeScript | Type safety |
| 17 | Agregar pagina 404 real | UX |
| 18 | Agregar skeleton loaders | UX |
| 19 | Agregar indicador offline | UX |
| 20 | Comprimir iconos PWA (WebP) y reducir a los necesarios | Performance |
| 21 | Configurar CI/CD y pre-commit hooks | DX |
| 22 | Actualizar Tailwind a v4 | Modernizacion |
| 23 | Simplificar servicios de clases a funciones | Reducir complejidad |

---

## 10. Metricas del Proyecto

| Metrica | Valor |
|---------|-------|
| Total archivos fuente | ~45 |
| Lineas de codigo (aprox) | ~5,500 |
| Componentes React | 23 |
| Servicios | 5 activos + 3 vacios |
| Hooks custom | 3 activos + 2 vacios |
| Endpoints API | ~30 |
| Dependencias produccion | 4 |
| Dependencias dev | 11 |
| Tests | 0 |
| Coverage | 0% |

---

## 11. Conclusion

El proyecto esta **funcional y cumple su proposito** como sistema de asistencia con GPS. La arquitectura es razonable para el tamano del proyecto, con buena separacion entre features de empleado y admin.

Los **puntos mas urgentes** a resolver son:
1. Los console.log con datos sensibles en produccion
2. La autenticacion debil de empleados (solo telefono)
3. La limpieza de codigo muerto y archivos vacios
4. El refactoring del adminService monolitico

El proyecto tiene una buena base para crecer, pero necesita atencion en seguridad y mantenibilidad antes de escalar.
