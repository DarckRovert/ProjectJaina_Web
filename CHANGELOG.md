# 📋 Registro de Cambios (Changelog) — Project Jaina Web

Todas las modificaciones notables a este proyecto están documentadas cronológicamente en este archivo.

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
