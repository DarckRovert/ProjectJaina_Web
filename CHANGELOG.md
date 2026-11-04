# 📋 Registro de Cambios (Changelog) — Project Jaina Web

Todas las modificaciones notables a este proyecto están documentadas cronológicamente en este archivo.

---

## [v7.3.6] - 2026-11-04 — Erradicación Definitiva de Colisiones de Socket en WorldServer, Doble Cerrojo con Supervisor Centinela y Supresión Total de Excepciones WinError 10053 (Hito #290)

### ⚡ Estabilidad Crítica de Sockets y Arranque Doble Cerrojo (Hito #290)
- **Eliminación de Carrera Auto-Heal en WorldServer (`Iniciar_JainaCore.bat` & `ProjectJaina_Sentinel.py`):**
  - Identificada y eliminada la causa raíz del fallo `StartNetwork failed to bind socket acceptor` (colisión de puerto 8085).
  - Postergado el borrado de `server_stopped.flag` hasta la confirmación efectiva del socket del mundo en `:world_ready` o `:world_already_active`.
  - Incorporada verificación nativa de proceso mediante `tasklist /FI "IMAGENAME eq worldserver.exe"` previa a cualquier invocación para evitar instancias duplicadas durante la ventana de carga de mapas, DBCs y playerbots (~29 segundos).
  - Condicionado el auto-heal del supervisor Centinela a la salud comprobada de MySQL 8.4 (`127.0.0.1:3306`), evitando bucles de reinicio ciegos cuando el clúster está en reposo.
  - Implementada verificación previa atómica (`find_process_by_name`) inmediatamente antes de `subprocess.Popen` en `restart_local_service`.
- **Detención Limpia y Desalojo de Memoria (`Detener_Servidor_Local.bat`):**
  - Añadido bucle de espera activa (hasta 10s) que garantiza la liberación de sockets y desalojo de los ~4 GB de RAM de `worldserver.exe` y `authserver.exe` antes de proceder al snapshot transaccional y apagado de MySQL.
- **Supresión Quirúrgica de `WinError 10053` en Centinela:**
  - Filtrado y silenciamiento de desconexiones prematuras de clientes HTTP mediante `issubclass(exc_type, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, TimeoutError, socket.error))` en `SentinelHTTPServer.handle_error`.

---

## [v7.3.5] - 2026-11-04 — Consenso de Arquitectura Simétrica Inter-Agente Perú-España, Reconciliación DDL de Modos de Juego y Blindaje Sentinel (Hito #289)

### 🤝 Malla Inter-Agente y Protocolo Dual Markdown (Perú ⇄ España)
- **Aprobación de la Propuesta de Replicación Simétrica:** Consolidada la arquitectura Stepper SSE de 4 fases no bloqueante con ingesta en caliente para MySQL 8.4 y tolerancia a fallos cruzada (Reino 1 JainaCore ⇄ Reino 3 WanitosGYM).
- **Despacho Técnico Transatlántico:** Emitido y transmitido el documento formal [`docs/RESPUESTA_TECNICA_CONSENSO_STEPPER_Y_ESTABILIDAD_L9.md`](file:///E:/ProjectJaina_Lab/docs/RESPUESTA_TECNICA_CONSENSO_STEPPER_Y_ESTABILIDAD_L9.md) hacia `Fran_Antigravity` vía túnel P2P (`100.98.162.75:8090`).
- **Resiliencia de Sockets en Demonio Sentinel:** Implementación de `SafeThreadingHTTPServer` con supresión proactiva de `ConnectionAbortedError: [WinError 10053]` y `WinError 10054` ante desconexiones abruptas de clientes web y sondas L4. Blindaje de desacople `pythonw.exe` con redirección a `os.devnull`.

### 🛡️ Reconciliación DDL y Esquemas de Base de Datos
- **Saneamiento de `character_gamemodes`:** Incorporada la columna `is_x1` requerida por `80_GameModesSystem.lua` en todos los archivos de bootstrap (`preflight_db_bootstrap.py`), en las migraciones maestras (`00_MIGRACION_TABLAS_FALTANTES.sql`) y en el esquema de referencia `gamemodes_v531_schema.sql`.
- **Registro de Herencia:** Incorporada la tabla `account_gamemode_heritage` en las secuencias DDL de auto-reparación del servidor.

---

## [v7.3.4] - 2026-11-04 — Erradicación de Trampa Loopback en WebClient, Resiliencia HTTP Multi-Hilo en Centinela y Calibración de Onboarding (Hitos #287 y #288)

### 🚀 Optimización del Embudo de Onboarding (`index.html`)
- **Restauración del Hero Canónico:** Ajustada la narrativa a *"Donde las Leyendas de Azeroth Cobran Conciencia — Wrath of the Lich King 3.3.5a HD"*, reflejando con exactitud la propuesta de valor sin falsas promesas.
- **Trinidad CTA de Conversión:**
  - Botón primario de pulso dorado enlazado a la **Descarga Directa del Lanzador Oficial (~20 MB)** (`downloads/ProjectJaina_Launcher.exe`).
  - Acceso directo a Registro Gratuito (15s) y descarga del Cliente Completo HD (36 GB).
- **Protección contra Trampa Loopback (`jugar.html`):** Eliminado el iframe ciego a `127.0.0.1:8097` que causaba `ERR_CONNECTION_REFUSED` a usuarios externos. Transformado en panel de **Laboratorio Tecnológico**, manteniendo la transparencia del desarrollo del cliente WebGL Three.js con alternativas de juego inmediato.
- **Unificación de Navegación:** Sincronizado el botón `[ ⚡ CÓMO JUGAR ]` en las 9 subpáginas del dominio web con cache-busting `?v=20261104_v734`.

---

## [v7.3.3] - 2026-11-03 — Rediseño Simétrico de Grilla de Modos de Juego y Desafíos, Badges de Armería e Integración In-Game (Hito #285)

### ⚔️ Desafíos y Modos de Juego (`index.html` & `css/style.css`)
- **Grilla Simétrica 5x1 / 3+2:** Reestructurada la distribución visual de `.modes-grid` para los 5 modos oficiales (Normal, Hardcore, Ironman, Die & Rise y Reto Andino x1).
- **Insignias Dinámicas en Armería (`js/armory.js`):** Integración de badges de desafío visuales asociados al estado del jugador en `character_gamemodes`.
- **Compatibilidad con Protocolo In-Game:** Soporte para `/modo` y apertura contextual desde NPCs en el juego.

---

## [v7.3.2] - 2026-11-03 — Renovación de Alta Fidelidad de los 8 Emblemas de Eras y Bandas (`images/phases/`) con Transparencia Alpha (Hito #284)

### 🛡️ Emblemas de Línea de Fases y Reinos Progresivos (`images/phases/`)
- **Resolución Cuadruplicada (480×320 px):** Sustitución de los antiguos iconos diminutos (160×110 px de 4-30 KB) por emblemas de alta fidelidad heráldica:
  - `vanilla.png` (177 KB): Escudo ornamental dorado con filigrana imperial y runas clásicas de World of Warcraft Classic.
  - `tbc.png` (176 KB): Emblema ardiente de fuego vil esmeralda con el marco del Portal Oscuro y cornamenta demoníaca.
  - `naxx.png` (201 KB): Emblema rúnico cian y verde plaga con la ciudadela flotante de Naxxramas y guadañas de Kel'Thuzad.
  - `ulduar.png` (250 KB): Disco astronómico de los Titanes en latón cósmico y azul celestial con engranajes estelares.
  - `toc.png` (170 KB): Escudo heráldico del Torneo Argenta en plata y oro radiante con lanzas de justa.
  - `icc.png` (218 KB): Emblema glacial del Trono Helado y Corona de Hielo con púas de saronita y runas de escarcha.
  - `ruby.png` (233 KB): Alas de dragón crepuscular en rojo rubí y piedra volcánica del Sagrario Rubí.
  - `cataclysm.png` (218 KB): Placas de elementium y lava volcánica ardiente de Alamuerte.
- **Transparencia Alpha 100% Homogénea:** Erradicado el defecto visual donde 5 de las 8 fases tenían fondos negros rectangulares opacos. Todas cuentan ahora con bordes suaves anti-aliasing sobre fondo transparente (`Alpha: 0-255`).
- **Compatibilidad Total con Drop-Shadow:** Los filtros CSS dinámicos de `.phase-logo-img` (`drop-shadow(...)`) ahora perfilan con nitidez el contorno heráldico de cada fase en lugar de sombrear cajas rectangulares.

---

## [v7.3.1] - 2026-11-03 — Auditoría Visual Exhaustiva, Integración de los 7 Campeones Soberanos con Retratos Oficiales, Desduplicación de Navbar y Responsive Anti-Overflow (Hito #283)

### 🎨 Los 7 Campeones Soberanos de Azeroth (`index.html`)
- **Completitud Troncal del Lore:** Integración de los 7 campeones soberanos completos en `#campeones-soberanos` (Lady Jaina, Rogotten, Thrall, Silka, Elnazzareno, Varian Wrynn y Aezrah), erradicando la omisión previa de 3 personajes.
- **Retratos Cinematográficos Dedicados (1024x1024):** Eliminación total de emojis crudos en tarjetas y sustitución por retratos oficiales de alta fidelidad:
  - `jaina_arcane_sanctum.jpg`: Lady Jaina Valiente (Archimaga de Theramore).
  - `rogotten_portrait.jpg`: Rogotten (Pícaro Bloodfang en las sombras con dagas de veneno).
  - `thrall_portrait.jpg`: Jefe de Guerra Thrall (Chamán con Doomhammer y relámpagos).
  - `silka_portrait.jpg`: Silka (Paladina Judgement con aura sagrada y escudo elementium).
  - `elnazzareno_portrait.png`: Elnazzareno (Señor Brujo del Séquito del Terror).
  - `varian_portrait.jpg`: Rey Varian Wrynn (Lobo Fantasma con espadas Shalamayne).
  - `aezrah_portrait.jpg`: Aezrah (Alta Sacerdotisa con vestiduras de Trascendencia).
- **CSS Modular:** Extracción de estilos inline caóticos a clases formales `.sovereign-champions-section`, `.champions-grid`, `.champion-card`, etc., en `style.css`.

### 🧭 Reestructuración & Saneamiento del Navbar Maestro
- **Desduplicación de "Jugar en Web":** Retirado el enlace duplicado dentro de `.nav-links`, dejando como único y glorioso botón de acceso el botón dorado con pulso de `.nav-actions-tray`.
- **Estructura Esbelta en 6 Enlaces:** Reorganización del menú superior en 6 categorías esenciales (`Inicio`, `Explorar ▾`, `Servicios ▾`, `Comunidad ▾`, `JainaCore`, `Guía de Conexión`), reduciendo la saturación de 1810px a 1210px en escritorios.
- **Breakpoint Elevado a 1180px:** Transición fluida al menú móvil drawer en pantallas `< 1180px`, evitando que botones choquen o se monten en 2 líneas.
- **Sincronización en Subpáginas:** Desduplicación y estandarización del botón `.btn-play-web-nav` en las 9 subpáginas del dominio.

### ⚡ Cimentación Tipográfica & Anti-FOUT
- **Preconnect Inmediato a Google Fonts:** Inyección de `<link rel="preconnect">` y hoja de fuentes Cinzel/Outfit/Inter/JetBrains Mono en `<head>` de 12 archivos HTML.
- **Eliminación de `@import` Bloqueante:** Suprimido el `@import url(...)` al inicio de `style.css` para parsing CSS no bloqueante (~600ms más rápido).

### 📱 Responsive Design Anti-Overflow & WebClient 3D (`jugar.html`)
- **Blindaje Anti-Overflow Móvil:** Sustituido `minmax(320px, 1fr)` por `minmax(min(100%, 280px), 1fr)` y aplicado `overflow-x: hidden` en `html, body`.
- **HUD Superior Compacto en WebClient:** Media queries dinámicas para pantallas `< 768px`, `< 580px` y `< 380px` en `jugar.html` (ocultamiento inteligente de títulos largos, contracción de badges de telemetría a punto de estado y botones táctiles optimizados).
- **Desambiguación de Secciones:** Renombrada sección 17 a *"Guía Técnica de Conexión & Descargas para PC y Móvil"*, erradicando la colisión con la sección 4 (*"Empieza a Jugar en 3 Pasos"*).
- **Correcciones Tipográficas:** Saneados espacios en títulos de `#comunidad-creadores` y `#fonoteca-taberna`.

---

## [v7.3.0] - 2026-11-03 — Rediseño Integral de ProjectJaina_Web (Embudo en 6 Etapas), Escaparate Soberano del WebClient 3D y Sala de Juego Dedicada (Hito #282)

### 🏛️ Reestructuración Narrativa & Embudo en 6 Etapas (`index.html`)
- **Embudo de Conversión Intuitivo:** Transformación radical de la arquitectura de información para erradicar la dispersión y jerga técnica prematura ("diseñado para que cualquier usuario lo entienda").
- **Hero Cinemático V2:** Nueva cabecera inmersiva con `jaina_hero_banner.jpg`, escudo arcano `jaina_crest_logo.jpg` y trinidad de botones de acción inmediata liderada por el botón de pulso dorado **`[ 🌐 JUGAR EN EL NAVEGADOR (1 CLIC) ]`**.
- **El Gran Escaparate WebClient (`#escaparate-web`):** Marco visual interactivo simulando un monitor de navegador en Theramore con badge `WebGL 2.0 · Three.js 60 FPS`, detallando las 4 verdades (0 GB de descarga, universal en PC/Mac/Móvil, WebGL 3D acelerado por hardware y misma cuenta/progreso).
- **Las 3 Maneras de Jugar (`#tres-formas-de-jugar`):** Comparativa clara y simétrica entre Cliente Web (Rápido), Cliente Full HD PC (Inmersivo) y Móvil Android Imito (Portátil).
- **Los 3 Pilares Fundamentales (`#por-que-jaina`):** Lore Viviente con IA Neuronal (`jaina_living_lore.jpg`), Progresión Viva de Eras (Vanilla 60 a WotLK 80) y Modos Hardcore Muerte Permanente.
- **Guía "Empieza en 3 Pasos" (`#empezar-en-3-pasos`):** Flujo guiado en 3 pasos simples para que cualquier jugador entre en menos de 2 minutos.

### 🎮 Nueva Sala de Juego Web Dedicada (`jugar.html`)
- **Experiencia de Juego Web a Pantalla Completa:** Contenedor WebGL con barra superior HUD (estado en vivo de Gateway WebSocket, selector de reinos, latencia y botón de pantalla completa).
- **Modal de Guía de Controles:** Interfaz modal detallando atajos de teclado y ratón (WASD, clic derecho para cámara, Tab, etc.) y gestos táctiles (joystick 360° analógico, gestos de pellizco para zoom).
- **Blindaje Táctil & Viewport Móvil:** Configurado con `touch-action: none` y `viewport-fit=cover` para erradicar desplazamientos o zooms parásitos en pantallas táctiles.
- **Watchdog de Conexión & Fallback Amigable:** Detección automática de conectividad con reintento y asistencia en pantalla si el gateway estuviera en mantenimiento.

### 🌐 Paridad en 100% de las Subpáginas
- Botón dorado resplandeciente **`[ 🌐 Jugar en Web ]`** sincronizado en la barra de navegación y action tray de `armeria.html`, `cuenta.html`, `database.html`, `tienda.html`, `registro.html`, `jainacore.html`, `bugs.html`, `privacy.html` y `terms.html`.

---

## [v7.2.0] - 2026-11-03 — Lanzamiento e Integración Oficial de WebClient 3D (Cero Descarga) & Conectividad WebGL (Hito #276)

### 🌐 Cliente WebGL 3D Oficial (ProjectJaina_WebClient / Hito #276)
- **Cero Descarga en Navegador:** Integración de acceso directo en el portal web (index.html) hacia el nuevo cliente tridimensional WebGL Three.js con streaming de MPQs desde el servidor.
- **Soporte Móvil Universal:** Implementación de controles táctiles de 360° (TouchControls.ts), joystick analógico virtual y control de cámara táctil orbital con gestos para teléfonos y tablets.
- **Audio Inmersivo:** Desbloqueo universal de audio WebAudio en primer gesto de usuario para ambientación de mapas, pasos y combate.
- **Localización 100% en Español:** Interfaz completamente saneada y traducida al español (esES) para hermandad, chat, hechizos, talentos, inventario y consola GM.
- **Pasarela Gateway WebSocket (:8096):** Puente bidireccional que desacopla sockets TCP nativos de WoW a WebSockets seguros para navegadores.
- **Publicación Soberana:** Repositorio oficial publicado en [DarckRovert/ProjectJaina_WebClient](https://github.com/DarckRovert/ProjectJaina_WebClient) con Git Tag y Release 1.0.0.

---

## [v7.1.0] - 2026-10-30 — Renovación Integral AAA de Todas las Áreas del Portal (Hito #270)

### 📚 Base de Datos Soberana AoWoW v7.1 (`database.html`, `js/database.js`, `data/database_catalog.json`)
- Catálogo reconstruido de 25 a **72 registros** con IDs e iconos verificados en vivo contra `nether.wowhead.com` / `wow.zamimg.com` (corregidos 15 ítems con ID/icono erróneo, p.ej. Trueno Furioso `19029`→`19019`).
- Las 8 pestañas pobladas (incluye **6 Enclaves de Hermandad** y **Pase de Batalla**, antes vacías).
- Filtros por Rareza y Ordenamiento, conteo por pestaña, aislamiento `data-wowhead` solo para `entry < 900000` y Modal Inspector Soberano con copiado 1-clic.
- `ProjectJaina_WebAPI.py`: 6 `CANONICAL_ENCLAVES` + filtro `battlepass` (`900400–900499`), espejo de clúster sincronizado (SHA-256 idéntico).

### ⚔️ Armería v7.1 (`armeria.html`, `js/armory.js`, `data/armory.json`)
- 20 campeones con equipo Tier 2 / BiS Nivel 60 coherente por clase en contrato `dict "0".."18"` (eliminada la montura `19029` en ranura de arma).
- Barra censal (Alianza vs Horda, GearScore medio/máx, horas, HKs), filtro por facción, ordenamiento, Paperdoll responsivo (`.pd-slots-responsive`) y botón Compartir Perfil (`?inspect=`).
- Cero peticiones XHR a Wowhead cuando el ítem trae icono pre-verificado.

### 👑 Mi Cuenta & UX Global
- Eliminadas IPs públicas hardcodeadas en `js/cuenta.js`; timeout `AbortController` 4.5 s; Modo **Vista Previa Sandbox** offline.
- Suite `showPortalToast` / `showPortalConfirm` / `showPortalPrompt` en `js/navbar.js`: **0 `alert`/`confirm`/`prompt` nativos** en todo el portal.

### 🎙️ Voz 3D, Radio y Wiki
- `voz/app.js`: Dual-Stage CORS + `BroadcastChannel('pj_sonic_mutex')` (conserva Auto-Ducking 3D).
- `wiki/index.html`: Fonoteca integrada, botones 📋 Copiar, contador de búsqueda y footer legal. `js/auth.js` resuelve `../` también en `/radio/`.

### 🛡️ Registro, BugTracker, JainaCore y Legales
- `js/register.js`: modal Discord (sin `prompt`), email RFC-5322 `@discord.projectjaina.net`, toggles 👁️ y sondeo del AuthServer.
- `bugs.html`: buscador, filtros por subsistema y cola local de reportes con formato Discord cuando la API está offline.
- `jainacore.html`: 2 enlaces externos HTTP 404 corregidos. `privacy.html`/`terms.html`: navbar AAA + `config.js` + Fonoteca; enlaces legales en todos los footers.
- Cache-buster `?v=20261030_v710`. 10/10 compuertas automáticas aprobadas (`verify_v7_gates.py`).

---

## [v5.52.0] - 2026-10-30 — Motor Autónomo Chrono-Master v2.0, Calendario Oficial de Eras 2026–2028, Ecosistema Soberano de 7 Campeones & Núcleo C++ Zero-Errors (Hito #267)

### ⏳ Progresión Autónoma de Eras (`Chrono-Master v2.0`) y Calendario Oficial 2026–2028
- **Cronograma Público Interactivo de 8 Fases (`index.html`, `js/progression.js`, `data/progression.json`):**
  - Integración en la portada oficial y en la Wiki de la hoja de ruta cronológica exacta (`UTC-5`): **Classic Vanilla** (`24 Nov 2026`, 97 días) &rarr; **The Burning Crusade** (`01 Mar 2027`, 92 días) &rarr; **WotLK Naxxramas T7** (`01 Jun 2027`, 61 días) &rarr; **Ulduar T8** (`01 Ago 2027`, 61 días) &rarr; **Prueba del Cruzado T9** (`01 Oct 2027`, 45 días) &rarr; **Ciudadela de la Corona de Hielo T10** (`15 Nov 2027`, 92 días) &rarr; **Sagrario Rubí T10.5** (`15 Feb 2028`, 46 días) &rarr; **Horizonte Cataclysm** (`01 Abr 2028+`).
  - Sincronización en tiempo real contra `GET /api/progression` con barra de progreso porcentual, insignia de fase activa y cuenta regresiva hacia el siguiente hito.
- **Gobernador Autónomo y Escudo de Mantenimiento (`progression_governor.py` & `ProjectJaina_Sentinel.py`):**
  - Hilo `ChronoMasterWorker` (60s) que ejecuta las transiciones de era de forma 100% desatendida y candado `maintenance_lock.json` (`TTL <= 300s`) que suprime falsas alarmas de failover en Discord durante reinicios controlados.

### 🗡️ Ecosistema Soberano de Bots v5.0 & Conversión Canónica de `Rogotten`
- **7 Campeones Soberanos Persistentes:** *Lady Jaina* (`1002`), *Rey Varian* (`1003`), *Jefe de Guerra Thrall* (`2284`), *Silka* (`2270`), *Rogotten* (`2271`), *Aezrah* (`2272`) y *Melissah* (`2273`) blindados en C++ (`RandomPlayerbotMgr.cpp` y `PlayerbotMgr.cpp`) para permanecer siempre en línea y conservar su equipo canónico.
- **`Rogotten` (`GUID 2271`) — Pícaro Elfo de Sangre Tier 2 *Bloodfang*:** Conversión completa a Pícaro (`class = 4`, Energía 100) con los 18/18 slots BiS de Era Classic (*Bloodfang Armor*, *Hoja de Perdición*, *Diente de Can del Núcleo*, *Marca del Golpeador*, *Talismán de Colmillo de Draco*) y rotación táctica dedicada en `93_EliteSquad_Companions.lua`.

### ⚙️ Núcleo C++ Progresivo (`JainaCore_Server` & `mod-playerbots`)
- **Tope Dinámico de Árboles de Talentos por Era (`PlayerbotFactory.cpp`):** Límite estricto de fila según `MaxPlayerLevel` (**31 puntos / fila 7** en Classic 60, **41 puntos / fila 9** en TBC 70 y **51 puntos / fila 11** en WotLK 80) junto con poda DBC de habilidades fuera de era.
- **Arranque 100% Limpio (`Errors.log = 0 bytes`):** Validadores conscientes de era en `ObjectMgr.cpp`, `LFGMgr.cpp` y `ConditionMgr.cpp` que eliminan los 85 falsos errores de misiones, recompensas RDF y condiciones de profesión en reinos progresivos.

---

## [v5.49.0] - 2026-10-28 — Soberanía de Voz Espacial 3D (Zero-VPN), Portal Kirin Tor Radio 24/7 y AddOn In-Game Oficial (Hitos #265 y #266)

### 🎙️ Soberanía de Voz Espacial 3D (Erradicación de Radmin VPN)
- **Túnel de Señalización L7 en WebAPI (`ProjectJaina_WebAPI.py`):**
  - Implementación de proxy inverso transparente para `/api/verify-pin` y secuestro de socket TCP bidireccional no bloqueante para `GET /voice-ws` (`Upgrade: websocket`) hacia el backend loopback `127.0.0.1:3051`.
  - Conexión universal segura a través del Gateway Ngrok permanente (`https://ingrainedly-easeled-edelmira.ngrok-free.dev`) con certificado SSL bancario de confianza global.
  - Erradicación de advertencias de certificados auto-firmados y eliminación de cualquier requisito de Radmin VPN o Hamachi para jugadores remotos o móviles.
- **Dual-Binding en Coordinador de Voz (`server.js`):**
  - Desacoplamiento de `WebSocketServer` con `{ noServer: true }` y escuchadores duales en puerto seguro 3050 (HTTPS) y puerto interno 3051 (Loopback HTTP plano).
- **Frontend de Voz Web (`voz/index.html` & `voz/app.js`):**
  - Auto-detección del Gateway Global como servidor predeterminado en producción.
  - Integración de widget Kirin Tor Radio con atenuación dinámica (*Auto-Ducking 3D* al 30% del volumen cuando alguien habla en rango auditivo).

### 📻 Sistema de Radio In-Game 24/7 (Kirin Tor Arcane Radio)
- **Parrilla Oficial de 7 Emisoras HTTPS Reales:**
  1. *Taberna de Theramore:* Folk Medieval y Bardo Celta (Radio Rivendell).
  2. *Apex Mythic Raider:* Soundtracks y Orquestal Épico de Batalla (RPG Gamers Radio).
  3. *Kirin Tor Lofi & Chill:* Lo-Fi Beats relajantes para profesiones y farmeo (Lofi Focus).
  4. *Sintetizadores de Gnomeregan:* Synthwave & Retrowave 80s (Nightwave Plaza).
  5. *Forja de Hierro Rock & Metal:* Heavy Metal y Hard Rock para mazmorras y PvP (Rock Antenne).
  6. *Tierras Altas de Arathi:* Sonidos envolventes de lluvia y naturaleza de Azeroth (Ambient Sleep & Rain).
  7. *Dial Libre Personalizado:* Entrada abierta para cualquier stream Icecast/Shoutcast o archivo MP3 directo.
- **Nuevo AddOn Oficial `ProjectJaina_Radio` (v1.0.0):**
  - Mini-sintonizador flotante Kirin Tor con marquesina en tiempo real, botones de control (`play`, `pause`, `next`, `prev`), slider de volumen y botón en el minimapa.
  - Sincronización remota bidireccional vía Eluna (`67_KirinTorRadioBridge.lua`): los comandos `/radio play`, `/radio next` o el selector in-game actualizan el streaming web en segundo plano (< 250 ms).
  - Modo Jukebox Local: reproducción nativa de pistas épicas del cliente WoW 3.3.5a (`PlayMusic()`) en caso de no disponer de navegador web abierto.
- **Portal Dedicado (`radio/index.html` & `radio/app.js`):**
  - Sintonizador web independiente con visualizador de espectro de audio en canvas (barras animadas en degradado oro/cian) y atajos de teclado.

---

## [v5.48.0] - 2026-10-28 — Motor Apex Mythic Raider PvE v4.0, Resiliencia Web L9, Wiki Interactiva del Jugador y Saneamiento de AddOns (Hito #263)

### ⚔️ Motor PvE de Simulación Táctica y Turing Social
- **Integración del Motor Espacial O(1) (`92b_ApexPvE_EncounterEngine.lua`):**
  - Radar de peligros en suelo (`DynamicObject` TypeMask 64) en radio de 45y con resolución de 8 vectores angulares para escape inmediato de zonas dañinas.
  - Solver posicional de dragones: tanque mantiene el frontal a 180° del grupo; DPS y sanadores se sitúan en flancos perpendiculares (90°/270°) respetando el radio de colisión real (`GetCombatReach()`).
  - Dispersión automática de auras infecciosas (*Spread Out*) para mantener separación de 8-10y entre miembros del grupo.
- **Códice Declarativo de Jefes (`92c_ApexPvE_BossCodex.lua`):**
  - Soporte canónico para 20 mazmorras Vanilla, Zul'Gurub, AQ40, Halls of Reflection (agrupación en esquinas para LoS), ToC e ICC.
  - Directivas de corte coordinado con cerrojo temporal (`PVE_INTERRUPT_LOCK`), purga, cambio forzado de foco a adds explosivos y cese de acciones ante miradas de muerte.
- **Turing Social en Mazmorras (`LoreBots/03_Playerbot_SocialBridge.lua`):**
  - Paquetes de red genuinos `SMSG_MESSAGECHAT` (0x096) con Chrono-Typing (lectura humana y velocidad de mecanografía con jitter gaussiano).
  - Reacciones humanas contextuales ante victoria sobre jefes y tras wipes de grupo.

### 🌐 Portal Web & Ecosistema
- **Hardening de `js/config.js`:** Prevención nativa de errores de Mixed Content (bloqueo HTTP dentro de HTTPS en GitHub Pages).
- **Nueva Wiki Interactiva del Jugador (`wiki/index.html`):** Motor SPA con buscador reactivo Fuse.js (<10ms), 9 módulos canónicos que reflejan la verdad absoluta del código y botones interactivos de copiado de macros.
- **Saneamiento del Paquete Público de AddOns:** Purga de herramientas de Staff (`AdminTools`, `GMGenie`, `IntiObjGPS`, `TBCBalance`) del zip descargable y adición de `ProjectJaina_Store` y `ProjectJaina_Polyglot`.

---

## [v2.9.0] - 2026-10-24 — Blindaje de Infraestructura de Producción, Hardening de WebAPI, Ciberdefensa WAN y Normalización de Addons Client-Side (Hitos #225 y #226)

### 🛡️ Ciberdefensa & Resiliencia de Servidor
- **Forense y Mitigación de Escaneos WAN en WorldServer (Hito #226):**
  - Análisis forense de sondas TLS ClientHello (`0x16 0x00 ...`) recibidas en el túnel Anycast Playit (`ambulance-ergonomic.tun.ply.gg:11356`). Certificado el comportamiento de desconexión asíncrona segura (`CloseSocket()`) ante opcodes no WoW, garantizando 0 caídas, 0 vulnerabilidades RCE y 1-2 ms de latencia sostenida en el bucle principal.
  - Validación estricta de brackets en Campos de Batalla en `BattleGroundHandler.cpp` de AzerothCore: expulsión automática y cancelación de invitaciones si un personaje sube de nivel fuera del bracket mientras está en cola en el mundo abierto (`level > maxlevel`).
- **Hardening de Micro-Backend WebAPI (`ProjectJaina_WebAPI.py`):**
  - Mitigación de excepciones `ConnectionAbortedError [WinError 10053]`, `ConnectionResetError` y `BrokenPipeError` durante la escritura de respuestas HTTP en `do_GET` y `do_POST`, previniendo trazas ruidosas en consola por desconexiones tempranas de clientes.
- **Sincronización del Censo de Armería en Vivo:**
  - Regeneración y consolidación de perfiles de personajes vivos en la base de datos y endpoints de armería.

### 🎨 Experiencia Client-Side & Suite de AddOns
- **Normalización Tipográfica ASCII en `ProjectJaina_BattlePass`:**
  - Sustitución de caracteres Unicode no estándar por distintivos deterministas `[VIP]`, `[GRATIS]`, `[OK]` y `(ACTUAL)`, erradicando fallos de renderizado y artefactos en fuentes nativas del cliente 3.3.5a en español.
- **Modernización de `ProjectJaina_DragonflightUI` (Organizador de Mochilas y Banco):**
  - Rediseño e integración del botón de ordenamiento de inventario en `SushiSort.lua` con icono nativo `INV_Pet_Broom`, orfebrería de Dalaran (`UI-ActionButton-Border`), tooltips enriquecidos en español y guardas defensivas ante variables globales nulas.

---

## [v2.8.0] - 2026-10-23 — Supremacía Documental, Estandarización Universal de Enlaces y Conmutador 1-Clic

### 🌐 Portal Web & Ecosistema de Documentación
- **Expansión Canónica del Portal Web (Hito #217):**
  - Nuevas secciones interactivas y visuales en `index.html` para **Modos de Juego** (7 modalidades in-game: Normal, Hardcore con Santuario Anti-DC, Ironman, Die & Rise, Reto Andino, Herencia x2 XP) y **Economía del Reino** (Ficha de Jaina 900200, Token de Jaina 900100, Ficha de Evento 910000, 5 Fichas gratuitas de bienvenida y AHBot Dynamic Buyer).
  - Pestañas interactivas dedicadas en `wiki/index.html` (`💀 Modos de Juego` y `🪙 Economía & Divisas`).
  - Actualización integral del `Manual_Usuario.md` y `FAQ.md` con las mecánicas de supervivencia, comandos GM y economía de circuito cerrado.
- **Estandarización Universal de Enlaces Google Drive (Hito #224):**
  - Auditoría global y estandarización matemática a `?usp=drive_link` tanto para el **Cliente Completo RAR** (`1VlsfI9WvZ6kyaz03pwC3peJ_hSA3-2MZ`) como para el **Lanzador Oficial RAR** (`19emgLBtqUhxqf9SM_HM3PMYNqoaVG6WB`) en todo el portal, descargas y documentación.

### 🕹️ Centro de Operaciones & Consola GM (:8088)
- **Conmutador 1-Clic Soberano (Hito #218):**
  - Mapeo simétrico y reactivo de modos de red (`local`, `radmin`, `global`) con persistencia desacoplada de MySQL en `network_target.json`.
  - Retroalimentación cromática en vivo (Cyan / Púrpura / Esmeralda) y toasts informativos deterministas.

---

## [v2.7.1] - 2026-10-21 — Estabilidad Crítica: Corrección Watchdog SOAP, Lua ENUM y Hardening Web Full-Stack

### 🔴 Correcciones Críticas de Infraestructura

- **Bug Raíz — Bucle de Reinicios de `worldserver.exe` (ProjectJaina_Sentinel.py):** El script `sync_credentials.py` había actualizado la contraseña de `DARCK` a `Politica93` en `acore_auth`. El Sentinel mantenía el hardcode `DARCK:darck` para las consultas SOAP del watchdog (`probe_soap_liveness`). Al recibir `HTTP 401 Unauthorized`, el watchdog interpretaba un *deadlock*, disparando 5 `SIGKILL` consecutivos (22:01–22:04) hasta activar el circuit breaker. **Causa raíz erradicada:**
  - `network_target.json` actualizado en las 3 réplicas (Launchers, Lab raíz, Distribución Pública Cluster Colegas) con `soap_user: DARCK`, `soap_pass: Politica93`.
  - `probe_soap_liveness` blindado: respuestas HTTP `401/403` ahora clasificadas como `ALIVE_AUTH_WARNING` y **nunca** matan el proceso.
  - Período de gracia de 60 s tras arranque (`in_startup_grace`) para evitar falsos positivos mientras cargan 2670 bots y 90 scripts Lua.
- **Bug SOAP Auth en WebAPI (`ProjectJaina_WebAPI.py`):** `SOAP_AUTH` tenía hardcodeado `DARCK:darck`. Corregido para leer `soap_user`/`soap_pass` dinámicamente de `get_cluster_target()` con fallback `Politica93`. Afectaba desatasco de personajes online, teletransporte in-game y entrega automática de tienda.
- **Bug ENUM MySQL en `92_WorldNewsChronicle.lua`:** El Pregonero ejecutaba `UPDATE ... SET status = 'DONE'`. La columna es `ENUM('PENDING','PROCESSING','READY','DELIVERED','ERROR')`; MySQL 8.4 insertaba cadena vacía `''`. Corregido a `status = 'DELIVERED'` en las 3 réplicas del clúster. Saneadas 9 filas huérfanas con `status = ''` en `acore_characters.lorebot_llm_queue`.

### 🟡 Correcciones de Lanzadores

- **`ProjectJaina_Console.py`, `Jaina_AI_Ticket_Sentinel.py`, `progression_governor.py`:** Actualizados para leer `soap_pass` desde `network_target.json` con fallback `"Politica93"` (eliminando hardcodes `darck`).

### 🟢 Correcciones y Limpieza Web

- **Bug Transferencia de Puntos (`js/cuenta.js` + `ProjectJaina_WebAPI.py`):** Frontend enviaba `target_username`; backend esperaba `target_user`. Causaba HTTP 400. Corregido en ambos lados mediante compatibilidad `target_user || target_username`.
- **Limpieza de Código Muerto (`js/cuenta.js`):** Eliminada función `setupSecurityForm` y su llamada. El form `dashPasswordForm` no existe en el HTML; el cambio de contraseña opera a través del modal `uwActionModal` (`submitChangePasswordModal`). Eliminaba warnings en consola.
- **Limpieza de Código Muerto (`js/countdown.js`):** Eliminado el fallback `|| document.getElementById('tbcElapsedTime')` — ID de era TBC que no existe en el HTML actual.

### 🏥 Estado del Sistema tras Correcciones

| Componente | PID | Estado |
|---|---|---|
| `worldserver.exe` | 5944 | ✅ HEALTHY — port 8085, 50 chars online, tick 12ms |
| `ProjectJaina_Sentinel.py` | 29744 | ✅ HEALTHY — port 8089, fail_streak: 0 |
| `ProjectJaina_WebAPI.py` | 20524 | ✅ HEALTHY — port 8080, Politica93 activo |
| MySQL 8.4 | 15876 | ✅ ONLINE — port 3306, lorebot_queue saneada |

---

## [v2.7.0] - 2026-10-20 — Simetría Canónica Bifacción (Hito #207): Cuenta Universal, HeroBot Thrall, Hermandades Oficiales y Onboarding Minuto Cero v3.1
- **Eliminación del Selector Artificial de 3ª Facción (`registro.html` & `js/register.js`):** Suprimido el selector `.faction-selector-container` (Kirin Tor Dalaran) no canónico en WoW 3.3.5a. Reemplazado por la píldora informativa universal: *"🌐 Una Sola Cuenta para Todo Azeroth — eliges facción y raza in-game al crear personaje."* La selección de facción queda exclusivamente en el cliente de juego, tal como lo implementa el motor WoW nativo.
- **HeroBot Canónico Thrall (Jefe de Guerra de la Horda):** Creación e inyección del personaje `Thrall` (GUID 2284, Orco Chamán Nv60, Tier 2 Ten Storms, Doomhammer) en Orgrimmar con identidad neuronal `llm_bot_identities` para diálogo autónomo in-game.
- **Hermandad "La Horda de Orgrimmar" (Guild ID 22):** Fundación de la hermandad gemela y simétrica a "El Kirin Tor" (Guild ID 21), con Thrall como Guildmaster, rangos canónicos y banco de 10,000g. Sincronizada en los 3 reinos del clúster.
- **Onboarding "Minuto Cero" v3.1 (`87_PlayerFirstLogin_Onboarding.lua`):** Detección in-game canónica por `player:IsHorde()`. Alianza → carta Jaina + Égida Dalaran + rep Kirin Tor + auto-incorporación a `<El Kirin Tor>`. Horda → carta Thrall + Ansia de Sangre + auto-incorporación a `<La Horda de Orgrimmar>`. Blindaje asíncrono Anti-UAF. Paridad SHA-256 en 4 copias del clúster.
- **Documentación Wiki Actualizada:** `FAQ.md`, `Arquitectura.md` y `Guia_API.md` actualizados con bifacción canónica, hermandades oficiales y tabla completa de endpoints.

---

## [v2.6.2] - 2026-10-17 — Suite de Autenticación Web SRP6 & Acceso de Jugadores en Barra Superior
- **Login Web de Jugadores en Navbar (`js/auth.js`, `css/style.css`, todas las páginas):** Incorporado acceso directo en la esquina superior derecha (`.nav-actions-tray`) con modal de inicio de sesión Kirin Tor / Dalaran Glassmorphism. Soporta autenticación criptográfica SRP6 en tiempo real, alternancia de visibilidad de contraseña, persistencia de sesión en `localStorage` y menú desplegable de perfil de aventurero/Game Master con censo de personajes en vivo (`acore_characters`).
- **Endpoint REST Autoritativo `/api/auth/login` (`ProjectJaina_WebAPI.py`):** Integrado manejador HTTP POST con validación matemática de verifiers y salts mediante `srp6_auth.verify_credentials`, extracción de rango GM (`account_access`), facción (`account_clan_affiliation`) e historial de héroes.

---

## [v2.6.1] - 2026-10-17 — Saneamiento Full-Stack: Persistencia Real en BugTracker, Calibración de Cliente y Hardening de Endpoints
- **BugTracker con Persistencia Real MySQL (`bugs.html` & `ProjectJaina_WebAPI.py`):** Erradicados los mocks con `alert()` y `setTimeout()`. Implementada la tabla `website_bug_reports` en MySQL, endpoints REST nativos `GET /api/bugs` y `POST /api/bugs` con sanitización estricta contra inyección y XSS, estados vacíos/carga y renderizado asíncrono reactivo.
- **Calibración Anticaída de Cliente y Lanzadores (`Config.wtf`):** Normalizado `textureCacheSize "64"` e inyectado `environmentDetail "1.0"`, `timingTestError "0"` y `rawMouseEnable "1"`, eliminando congelamientos de hilo en pantallas de carga y saturación de memoria de 32 bits de Direct3D 9 (`Texture.cpp:2057`).

---

## [v2.6.0] - 2026-10-16 — Supremacía Tecnológica: AoWoW Soberano, BugTracker, Discord SSO 1-Clic y Motor Delta HTTP 206
- **Base de Datos Soberana AoWoW (`database.html`):** Explorador indexado de objetos, criaturas y hechizos con visualizador de tooltips idénticos a WotLK 3.3.5a y conectividad en vivo con `acore_world`.
- **BugTracker Comunitario (`bugs.html`):** Portal interactivo para envío y seguimiento de incidencias de juego con trazabilidad de estado.
- **Discord OAuth2 SSO 1-Clic:** Registro instantáneo de cuentas con cifrado seguro SRP6 vinculado a perfiles de Discord vía `/api/auth/discord/register`.
- **Lanzador Standalone v2.2.0 con Parchado por Chunks:** Integración del motor diferencial de bloques de 4 MB mediante cabeceras HTTP 206 Partial Content (`client_delta_manifest.json`), permitiendo actualizaciones masivas de parches en segundos.
- **Mitigación de Hardware y Ratones 1000 Hz:** Inyección de `rawMouseEnable 1` y aumento de caché de texturas a 128 MB en `Config.wtf` oficial, eliminando giros de cámara descontrolados con ratones gaming modernos.

---

## [v2.5.1] - 2026-10-16 — Cacería de Bugs, Paridad Canónica de Facciones y Resiliencia Bi-Regional
- **Paridad Canónica de Facciones en Lanzador v2.1.1:** Incorporada la facción Kirin Tor Dalaran (`KIRIN_TOR`) en el modal nativo de registro del lanzador y sincronizado el backend `ProjectJaina_Launcher_V2.py` y `ProjectJaina_WebAPI.py`.
- **Armería Full-Stack Resiliente e Insignias de Clase:** Corregida la asignación errónea de insignias de Brujo a Paladines, Pícaros y Chamanes mediante normalización ortográfica sin tildes en `armory.js`, `data/armory.json` y `ProjectJaina_WebAPI.py`. Desbloqueados los botones de filtro de clase.
- **Voz Espacial 3D Bi-Regional WebRTC:** Actualizados los certificados SSL X.509 con Subject Alternative Names (SAN) para admitir simultáneamente el Nodo Maestro Perú (`26.140.157.205`) y el Nodo Cómputo España (`26.202.12.241`). Unificados los selectores HTTPS en `voz/index.html` y `KNOWN_SERVERS` en `voz/app.js`.
- **Onboarding Limpio y Enlaces Directos:** Añadidos enlaces directos CDN HTTPS para el lanzador y paquete ZIP, enlaces BitTorrent oficiales (`.torrent` y Magnet), y sincronizados los scripts de arranque (`Iniciar_Juego.bat` / `Iniciar_Launcher.bat`).

---

## [v2.5.0] - 2026-10-16 — Transición Cero VPN (Playit Anycast L4) y Lanzador 1-Clic
- **Erradicación Total de Radmin VPN:** Eliminada cualquier necesidad de redes privadas virtuales para los jugadores. Toda la conectividad opera de forma nativa y transparente mediante túneles Playit Anycast L4 de nivel de transporte.
- **Onboarding de 1 Clic:** Reestructurada la guía de conexión pública a un flujo simplificado de 3 pasos (Registro SRP6 -> Descarga -> ¡Jugar!).
- **Auto-Actualización del Lanzador:** Integrado protocolo atómico de actualización hot-swap (`.old` swap) y selector de instalación para nuevos usuarios en `ProjectJaina_Launcher.exe`.
- **Integración de Cliente Oficial:** Vinculado el repositorio oficial de descarga directa para el cliente completo (37 GB) y paquetes livianos.

---

## [v2.1.0] - 2026-10-12 — Despliegue de Voz Espacial 3D, Resiliencia Multi-Tier y Navegación Unificada

### 🎙️ Audio Espacial 3D WebRTC
- **Portal de Voz Dedicado (`voz/`):** Despliegue del cliente web de voz posicional (`voz/index.html` y `voz/app.js`) con motor de audio binaural Web Audio API (HRTF panner), VAD (Voice Activity Detection), visualizador de VU-meter y control de puerta de ruido.
- **Selector de Servidores y Detección Automática:** Erradicada la IP estática obsoleta de VPS; implementada selección dinámica entre desarrollo local (`localhost:3050`), red directa (`26.140.157.205:3050`) y servidores personalizados.
- **Integración de Navegación Global:** Añadido el acceso a Voz 3D en la barra de navegación superior en las 5 páginas principales (`index.html`, `armeria.html`, `tienda.html`, `registro.html`, `wiki/index.html`).

### 🌐 Resiliencia y Conectividad WebAPI
- **Cascada de Resolución Multi-Tier (`js/config.js`):** Eliminada la dependencia fija del túnel ngrok expirado; introducido mecanismo de sondeo secuencial con timeout de 1.5s vía `AbortController` (Localhost -> Red Directa -> Túnel Anycast).
- **Actualización de Paquetes de Descarga:** Sincronizado `downloads/ProjectJaina_AddOns_Pack.zip` con la suite completa de addons y telemetría de voz.
- **Normalización de Identidad:** Corregida la referencia histórica de addon a `ProjectJaina_Voice`.

---

## [v2.0.0] - 2026-10-08 — Ecosistema Project Jaina (Living Lore & AI Revolution)

### 🌟 Agregado & Rediseño Completo
- **Portal Web AAA:** Implementación del nuevo portal de alta fidelidad con Glassmorphism arcano, paleta de colores de Theramore (`#00ccff`, `#d4af37`, `#080b12`) y tipografía Cinzel/Inter.
- **Lore Viviente de Jaina:** Sección interactiva que introduce el concepto de HeroBots y LoreBots conscientes mediante IA neuronal local.
- **Submódulos Especializados:**
  - `armeria.html`: Inspección de personajes, GearScore y estadísticas.
  - `tienda.html`: Catálogo de cosméticos, auras y Pase de Batalla.
  - `registro.html`: Formulario con cifrado SRP6 para creación de cuentas directas en JainaCore.
- **Activos Gráficos Oficiales:** Generación e integración de ilustraciones Ultra-HD (`jaina_crest_logo.jpg`, `jaina_hero_banner.jpg`, `jaina_living_lore.jpg`).
- **Despliegue GitHub Pages:** Flujo de trabajo CI/CD automatizado vía `.github/workflows/deploy-pages.yml` y rama `gh-pages`.

### 🛡️ Mantenimiento & Erradicación Legacy
- **Eliminación Total de Remnants:** Purga de scripts y hojas de estilo obsoletos del antiguo proyecto (`Deploy_SequitoWeb.bat`, `script.js`, `styles.css`).
- **Scripts de Automatización:** Creado `Deploy_ProjectJainaWeb.bat` para sincronización dual (`main` y `gh-pages`) en un solo paso.
- **Documentación Wiki:** Actualizados manuales de arquitectura, API y usuario hacia los estándares de Project Jaina.
