# 📋 Registro de Cambios (Changelog) — Project Jaina Web

Todas las modificaciones notables a este proyecto están documentadas cronológicamente en este archivo.

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
