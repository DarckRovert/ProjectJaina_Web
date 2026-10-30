# 🔌 Guía de API y Módulos JavaScript — Project Jaina Web (v7.1.0)

Documentación técnica de los módulos JavaScript del cliente y los endpoints REST/WebSocket que alimentan el portal oficial de **Project Jaina (Hito #270)**.

---

## 1. Módulos del Cliente (`js/`, `radio/`, `voz/`)

### `js/config.js` — Fuente Única de Verdad (SSOT) de Red
Gestiona la resolución dinámica de endpoints según el origen desde donde navegue el usuario:
- **Local / Sandbox**: `http://127.0.0.1:8080`
- **Producción / Web Pública**: Túnel HTTPS Anycast configurable (`CONFIG.getApiUrl()`) con degradación elegante hacia catálogos estáticos verificados (`data/*.json`) cuando opera sin backend.

### `js/navbar.js` — Navegación Global & Suite Kirin Tor de Diálogos
- Renderiza y coordina la barra de navegación AAA, menús desplegables y menú hamburguesa móvil en todas las páginas (incluyendo `/wiki/`, `/voz/`, `terms.html` y `privacy.html`).
- Expone los helpers globales asíncronos **`window.showPortalToast`**, **`window.showPortalConfirm`** y **`window.showPortalPrompt`** con saneamiento estricto de entidades HTML (anti-XSS), erradicando el 100% de llamadas bloqueantes `alert()`, `confirm()` y `prompt()`.

### `js/register.js` — Registro Autoritativo SRP6 & Discord Quick-Bind
- Validación en cliente, conmutadores de visibilidad de contraseña y envío asíncrono (`fetch POST`) hacia `/api/register` bajo estándar criptográfico **SRP6 RFC 5054**.
- Modal **Discord Quick-Bind** no bloqueante que genera correos sintéticos válidos conforme a RFC-5322 (`@discord.projectjaina.net`) cuando el usuario vincula su identidad rápida.
- Sonda asíncrona de estado del AuthServer para informar disponibilidad en tiempo real.

### `js/cuenta.js` — Panel de Gestión de Cuenta & Modo Sandbox Interactivo
- Consulta reactiva con `AbortController` acotado (4.5s) de balance PD/PV, estado 2FA, historial y personajes con GearScore, oro e inventario.
- Guarda `< 900000` para ítems propietarios del servidor (evita consultas externas fallidas a Wowhead).
- **Modo Sandbox Interactivo (`launchAccountSandboxDemo()`)**: Permite explorar toda la interfaz de gestión de cuenta y personajes con datos demostrativos cuando el jugador navega offline o antes de iniciar sesión.

### `js/database.js` — Motor Base de Datos Soberana AoWoW (v7.1)
- Gestiona 8 categorías (`weapons`, `armor`, `mounts`, `npcs`, `quests`, `zones`, `battlepass`, `enclaves`) con contadores en vivo por pestaña, búsqueda instantánea, filtro por rareza y ordenamiento multicriterio.
- Respaldo estático verificado en `data/database_catalog.json` (72 registros canónicos y custom con iconos verificados HTTP 200) e **Inspector Modal Soberano** con ficha técnica completa y comando `.additem` / coordenadas.

### `js/armory.js` — Armería Soberana & Paperdoll Responsivo (v7.1)
- Búsqueda normalizada insensible a diacríticos (`NFD`), barra de **Censo del Reino** (proporción Alianza/Horda, GearScore medio, horas jugadas y muertes con honor), filtros de facción/clase y ordenamiento dinámico.
- **Paperdoll Responsivo de 19 Ranuras (`"0".."18"`)**: Renderiza los 20 campeones de `data/armory.json` con sets canónicos Tier 2 verificados por clase, cero tormentas XHR cuando el icono ya está precacheado y botón de enlace directo compartible (`?inspect=Nombre`).

### `js/store.js` — Catálogo Visual de Tienda & Donaciones
- Renderizado de paquetes y cosméticos con insignias `.store-item-badge` desacopladas de `.icontinyl` (cero mosaicos repetidos de Zamimg) e integración transaccional idempotente con entrega vía SOAP.

### `js/lore_audio.js` & `radio/app.js` — Kirin Tor Arcane Sonic Studio
- Reproductor global persistente (Dock + Drawer categorizado) y estación dedicada `/radio/` con **15 canales verificados** en 3 suites (*Lo-Fi & Estudio*, *Sinfonías de Azeroth* y *Kirin Tor FM En Vivo*).
- **Cross-Tab Sonic Mutex (`BroadcastChannel('pj_sonic_mutex')`)**: Silencia automáticamente reproductores en otras pestañas abiertas al iniciar una pista, evitando superposición de audio.

### `voz/app.js` — Señalización WebRTC y Motor Binaural HRTF
- Negociación WebRTC bidireccional de baja latencia con selector dual-node (**Nodo 1 Perú** `26.140.157.205` y **Nodo 2 España** `26.202.12.241`) y certificados SSL Multi-SAN X.509 (`:3051`).
- Renderizado espacial HRTF (`AudioContext` + `PannerNode`) según coordenadas `(X, Y, Z, O)`, fallback de prueba acústica en 2 etapas (WebAudio CORS → Direct Audio) y *Auto-Ducking* coordinado al 18% con la Fonoteca.

---

## 2. Endpoints del Micro-Backend (`ProjectJaina_WebAPI.py` — Puerto 8080)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Estado del reino (online/offline), uptime, población activa y salud de microservicios. |
| `POST` | `/api/register` | Alta autoritativa de cuenta en `acore_auth.account` mediante criptografía SRP6 (`salt` + `verifier`). |
| `POST` | `/api/auth/login` | Autenticación web segura mediante validación matemática SRP6 RFC 5054. |
| `POST` | `/api/auth/discord/register` | Registro express y vinculación de identidad Discord OAuth2 / Quick-Bind. |
| `GET/POST` | `/api/account/details` | Datos completos de cuenta, balance PD/PV, permisos y personajes con GS e inventario. |
| `POST` | `/api/account/change-password` | Recálculo seguro de `salt` y `verifier` SRP6 para cambio de contraseña. |
| `POST` | `/api/account/promo` | Canje atómico de códigos promocionales con acreditación de PD/PV. |
| `POST` | `/api/account/vote` | Registro de voto comunitario y acreditación de Puntos de Votación (PV). |
| `POST` | `/api/account/transfer-points` | Transferencia validada de Puntos de Donación (PD) entre cuentas. |
| `POST` | `/api/character/service` | Servicios de personaje in-game: desatascar (`unstuck`), revivir, renombrar, etc. |
| `GET` | `/api/account/history` | Historial auditado de transacciones de puntos y servicios ejecutados. |
| `GET` | `/api/armory` | Perfiles completos de personajes (nivel, clase, raza, GearScore, 19 slots de equipo y estadísticas). |
| `GET` | `/api/database/items` | Consulta indexada AoWoW en `acore_world` para las 8 categorías (`weapons`, `armor`, `mounts`, `npcs`, `quests`, `zones`, `battlepass`, `enclaves`). |
| `GET` | `/api/database/enclaves` | Estado soberano, guarnición, coordenadas e intendente de los 6 Baluartes de Hermandad (`CANONICAL_ENCLAVES`). |
| `GET` | `/api/shop/catalog` | Catálogo visual de monturas, auras, cosméticos y pases de batalla. |
| `GET` | `/api/progression` | Telemetría en vivo de la era activa de Chrono-Master v2.0 (`vanilla`, `tbc`, `wotlk`), fase y level cap. |
| `POST` | `/api/progression/transition` | Transición atómica autenticada de era temporal en conciliación con Eluna. |
| `POST` | `/api/shop/paypal/capture` | Captura y verificación idempotente de órdenes PayPal (`uq_order_reward`). |
| `POST` | `/api/shop/simulate_delivery` | Despacho de recompensas cosméticas in-game vía comando SOAP. |
| `POST` | `/api/admin/command` | Ejecución autenticada (`X-Admin-Token` en tiempo constante `hmac.compare_digest`) de comandos SOAP. |

---

## 3. Endpoints del Coordinador de Voz Espacial (`server.js` — Puerto 3050 / SSL 3051)

| Protocolo | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Telemetría de oradores conectados, tokens activos y sesiones WebRTC para la Consola GM. |
| `POST` | `/api/eluna-sync` | Ingesta de coordenadas 3D de personajes humanos transmitidas por `65_VoiceProximitySync.lua`. |
| `GET` | `/api/consume-pins` | Retorno de PINs canjeados para confirmación instantánea in-game vía Eluna. |
| `WS/WSS` | `/` | Canal de señalización WebRTC para intercambio SDP (`Offer`/`Answer`), candidatos ICE y estado VAD. |
