# 🔌 Guía de API y Módulos JavaScript — Project Jaina Web

Documentación técnica de los módulos JavaScript del cliente que alimentan el portal de **Project Jaina**.

---

## 1. Módulos del Cliente

### `js/config.js` — Fuente Única de Verdad (SSOT) de Red
Gestiona la resolución dinámica de endpoints según el origen desde donde navegue el usuario:
- **Local / Sandbox**: `http://127.0.0.1:8080`
- **Producción / Web Pública**: Túnel Anycast seguro o endpoint de backend configurable (`CONFIG.getApiUrl()`).

### `js/register.js` — Registro Autoritativo SRP6
Maneja la captura, validación previa en cliente y envío asíncrono (`fetch POST`) hacia `/api/register`:
- Longitud mínima de credenciales (3-16 caracteres de usuario, mínimo 4 en contraseña).
- Confirmación de contraseña y feedback visual mediante toasts no bloqueantes.
- Creación autoritativa en `auth.account` de JainaCore con soporte de 3 facciones canónicas: `ALIANZA`, `HORDA` y `KIRIN_TOR` (Dalaran).
- Normalización automática de facciones legadas (`EL_SEQUITO` $\rightarrow$ `HORDA`).

### `js/store.js` — Catálogo Visual de Tienda & Donaciones
- Renderizado de artículos cosméticos (monturas, transfiguraciones, auras y títulos).
- Integración con pasarela PayPal / Donaciones y asignación automática por SOAP o comando de servidor con idempotencia transaccional (`uq_order_reward`).

### `js/armory.js` — Inspección de Héroes y Estadísticas
- Búsqueda y filtrado de personajes en la base de datos `characters` con inmunidad a diacríticos (`normalizeStr` con descompositor Unicode `NFD` y regex `[\u0300-\u036f]`).
- Mapeo preciso de insignias para las 10 clases oficiales de WotLK (incluyendo `Caballero de la Muerte`, `Paladín`, `Pícaro`, `Chamán`).
- Visualización de GearScore, talentos, logros y estadísticas de combate.

### `voz/app.js` — Señalización WebRTC y Motor Binaural HRTF
- Negociación de canales de audio WebRTC bidireccionales de baja latencia con el microservicio de señalización.
- Selector interactivo de servidor dual-node: **Nodo 1 Perú** (`26.140.157.205`) y **Nodo 2 España** (`26.202.12.241`).
- Soporte para certificados SSL Multi-SAN X.509 vía `jaina_voice_gateway.py` (Puerto 3051 HTTPS / WSS).
- Motor de renderizado espacial con `AudioContext` y `PannerNode` (modelo HRTF) en función de las coordenadas (X, Y, Z, O) del juego.
- Voice Activity Detection (VAD) local y medidor de nivel VU para optimización de ancho de banda.


---

## 2. Endpoints del Micro-Backend (`ProjectJaina_WebAPI.py`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/gameserver/status` | Devuelve estado del reino (online/offline), uptime, jugadores conectados y servicios. |
| `POST` | `/api/register` | Crea una cuenta en la base de datos `acore_auth` utilizando criptografía SRP6 (salt + verifier). |
| `GET` | `/api/armory` | Perfiles completos de personajes (nivel, clase, raza, GearScore, equipamiento, estadísticas). |
| `GET` | `/api/shop/catalog` | Catálogo visual de monturas, auras, cosméticos y pases de batalla. |
| `GET` | `/api/progression` | Telemetría de la fase de progresión activa (`vanilla`, `tbc`, `wotlk`) y level cap. |
| `POST` | `/api/progression/transition` | Transición atómica de era temporal (requiere clave GM y concilia con Eluna). |
| `POST` | `/api/shop/paypal/capture` | Procesamiento y captura de pedidos de tienda mediante pasarela PayPal. |
| `POST` | `/api/shop/simulate_delivery` | Despacho de ítems cosméticos in-game vía comando SOAP en el servidor. |
| `POST` | `/api/admin/command` | Despacho seguro de comandos administrativos SOAP (`.say`, `.reload`, etc.). |

---

## 3. Endpoints del Coordinador de Voz Espacial (`server.js` - Puerto 3050)

| Protocolo | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Retorna telemetría de oradores conectados, tokens activos y sesiones WebRTC para la Consola GM. |
| `POST` | `/api/eluna-sync` | Ingesta de telemetría y coordenadas 3D de personajes humanos transmitidas por `65_VoiceProximitySync.lua`. |
| `GET` | `/api/consume-pins` | Retorna los PINs canjeados para que Eluna notifique al jugador in-game del emparejamiento exitoso. |
| `WS/WSS`| `/` | Socket de señalización WebRTC para intercambio de SDP (Offer/Answer), candidatos ICE y estado de micrófono. |
