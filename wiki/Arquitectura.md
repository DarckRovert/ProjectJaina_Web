# 🏛️ Arquitectura del Portal: Project Jaina Web (v7.4.5)

Este documento describe la arquitectura técnica, el sistema de diseño y la integración con el ecosistema de **Project Jaina (WotLK 3.3.5a - Living Lore & AI Revolution — Hito #382)**.

---

## 1. Stack Tecnológico
- **Frontend**: HTML5 Semántico, Accesible y Optimizado para SEO en las 13 páginas del ecosistema (`?v=20261030_v710` / `?v=20261116_v745..v751`).
- **Estilos**: CSS3 Moderno modular (`css/style.css`), Glassmorphism arcano, Grid Layout, Paperdoll responsivo (`.pd-slots-responsive`), badges desacoplados anti-colisión Zamimg y animaciones GPU-accelerated.
- **Lógica**: JavaScript Vanilla Modular (ES6+), Zero-Dependencies:
  - `js/config.js`: Resolución dinámica multi-tier de endpoints (Localhost `:8080`, Túnel HTTPS Anycast y modo estático autónomo).
  - `js/navbar.js`: Barra de navegación global AAA, menú móvil responsivo y **Suite Universal Kirin Tor de Diálogos No Bloqueantes** (`showPortalToast`, `showPortalConfirm`, `showPortalPrompt`) con saneamiento anti-XSS (0 `alert`/`confirm`/`prompt` en todo el portal).
  - `js/auth.js`: Gestión de sesión HMAC-SHA256 de usuario (`getToken()`, `getAuthHeaders()`), Bearer token y resolución de rutas relativas (`getBasePath()` compatible con raíz, `/wiki/`, `/voz/` y `/radio/`).
  - `js/register.js`: Registro criptográfico SRP6 RFC 5054, modal **Discord Quick-Bind** con correo sintético RFC-5322 (`@discord.projectjaina.net`), conmutadores de visibilidad de contraseña y sonda de estado de AuthServer.
  - `js/cuenta.js`: Panel integral de cuenta y personajes con `AbortController` de 4.5s, cabeceras autenticadas `getAuthHeaders()`, normalización de razas/clases (`PJ_RACE_MAP`, `PJ_CLASS_MAP`), guarda `< 900000` para ítems custom, caché `accountSnapshot` y **Modo Sandbox Interactivo** (`launchAccountSandboxDemo()`).
  - `js/database.js`: Motor **AoWoW Soberano v7.1** con paginación directa desde servidor (`data.items`, `data.total`, `data.total_pages`), 72 registros verificados en 8 pestañas (incluyendo *Pase de Batalla* y los *6 Baluartes Soberanos*), filtros por rareza/ordenamiento e Inspector Modal Soberano.
  - `js/armory.js`: **Armería Soberana v7.4.5** con paperdoll responsivo de 19 ranuras `"0".."18"` normalizado vía `buildArmoryItemsBySlot()` (sincronizada 1:1 con `acore_characters`, GearScore real en `jaina_webapi_daemon`, saneamiento HTML `escapeArmoryHtml`, indicador `is_dead`, badges de modos de juego `HARDCORE`, `IRONMAN`, `DIE_AND_RISE`, `SLOW_X1`, retención de caché en vivo y deep-link `?inspect=`).
  - `js/jaina_dialogue.js`: Diálogo neuronal de Lady Jaina (`/api/chat`) con sanitización HTML anti-XSS (`escapeHtml`), timeout `14000ms` y detección unificada `neural`/`neural_gpu`/`gravity_cloud*`.
  - `js/store.js`: Tienda cosmética Zero-P2W con contenedores de ítems `.store-item-badge`, saneamiento `_escapeStoreHtml()`, códigos de referencia autoritativos del backend y despacho transaccional idempotente.
  - `js/lore_audio.js` & `radio/app.js`: **Kirin Tor Arcane Sonic Studio** (15 canales en 3 suites: *Lo-Fi & Estudio*, *Sinfonías de Azeroth* y *Kirin Tor FM En Vivo*) sincronizado entre pestañas mediante `BroadcastChannel('pj_sonic_mutex')`.
  - `voz/app.js`: Cliente de Audio Espacial 3D WebRTC con renderizado binaural HRTF, soporte `/voice-ws` tras gateway `:8080`, fallback de audio en 2 etapas (WebAudio CORS → Direct HTMLAudio), Voice Activity Detection (VAD) y *Auto-Ducking* al 18% de la música local.
- **Alojamiento & CDN**: GitHub Pages con despliegue sincronizado en ramas `main` y `gh-pages` (`Deploy_ProjectJainaWeb.bat`).
- **URL Oficial**: [https://darckrovert.github.io/ProjectJaina_Web/](https://darckrovert.github.io/ProjectJaina_Web/)
- **Portal de Voz 3D**: [https://darckrovert.github.io/ProjectJaina_Web/voz/](https://darckrovert.github.io/ProjectJaina_Web/voz/)
- **Radio Kirin Tor FM**: [https://darckrovert.github.io/ProjectJaina_Web/radio/](https://darckrovert.github.io/ProjectJaina_Web/radio/)

---

## 2. Sistema de Diseño (Arcane Frost & Oro Regio)
La estética del portal rinde homenaje a Lady Jaina Valiente y la ciudadela de Theramore:

### Paleta Cromática
- **Fondo Base Abisal**: `#080b12` (Void Black)
- **Superficies Glassmorphism**: `rgba(16, 22, 36, 0.75)` con `backdrop-filter: blur(12px)`
- **Azul Arcano Primario**: `#00ccff` (Poder de Escarcha y Arcano)
- **Oro Regio**: `#d4af37` (Acento de realeza y nobleza de Kul Tiras)
- **Bordes Resplandecientes**: `rgba(0, 204, 255, 0.2)`
- **Texto Primario**: `#f0f6fc` (Máxima legibilidad y contraste)
- **Texto Secundario**: `#8b949e`

### Tipografía
- **Títulos y Rótulos Épicos**: `Cinzel`, serif (Google Fonts) — solemnidad y fantasía heroica.
- **Cuerpo y Datos Técnicos**: `Inter`, sans-serif (Google Fonts) — legibilidad de alta densidad para armerías, inspectores AoWoW y formularios.

---

## 3. Integración con el Núcleo del Servidor y Clúster Bi-Regional
- **Malla Bi-Regional Soberana**:
  - **Nodo Maestro Perú (`node_1_master` - `26.140.157.205`)**: Aloja MySQL 8.4 autoritativo, AuthServer (`:3724`), WorldServer de producción (`:8085`) y `jaina_webapi_daemon.exe` (Tokio/Axum `:8080`).
  - **Nodo Cómputo España (`node_2_compute` - `26.202.12.241`)**: Aloja Reino 3 `WanitosGym` (`:8087`), inferencia neuronal y contingencia activa en espejo.
  - **Conmutación Automática (Sentinel Failover & Maintenance Lock)**: `ProjectJaina_Sentinel.py` supervisa la malla respetando `maintenance_lock.json` (`TTL <= 300s`) durante transiciones controladas de era.
- **Topología de Reinos Consolidada**:
  - **Reino 1: Project Jaina [Reino Oficial de Producción]**: ID 1, Puerto `8085` (Anycast L4 `ambulance-ergonomic.tun.ply.gg:11356`, DB: `acore_characters`). Progresión autónoma **Chrono-Master v2.0** (Calendario 2026–2028 de 8 fases, actualmente Classic Vanilla Nivel 60), Lore Viviente, 7 Campeones Soberanos Persistentes y todas las modalidades de juego unificadas (`/modos`).
  - **Reino 3: WanitosGym [Reino Laboratorio - España]**: ID 3, Puerto `8087` (Nodo España `26.202.12.241`, Era WotLK ICC Cap 80).
- **Bifacción Canónica Simétrica y Hermandades Oficiales**:
  - 🦁 **La Alianza & El Kirin Tor**: Hermandad canónica `<El Kirin Tor>` (Guild ID 21, Lady Jaina Valiente).
  - 🐺 **La Horda de Orgrimmar**: Hermandad canónica `<La Horda de Orgrimmar>` (Guild ID 22, Jefe de Guerra Thrall).
- **Micro-Backend API**: `jaina_webapi_daemon.exe` (Tokio/Axum, puerto `8080`) con soporte SSOT para los 6 Baluartes Soberanos (`CANONICAL_ENCLAVES`), cálculo real de GearScore en Armería, normalización de hermandades, filtro `battlepass`, Tienda y Progresión.
- **Coordinador de Voz 3D WebRTC**: `server/voice_service/server.js` (puerto `3050` / gateway `3051` HTTPS/WSS Multi-SAN).
- **Puente Neuronal de IA (LLM)**: LM Studio / Neural Worker (`:1234` / `:5005`) conectado vía `mod-llm-chatter` bajo la regla *Smallest-Model-First*.
- **Gobernanza Legal & Blindaje**: Cumplimiento vía `terms.html` y `privacy.html` integrados en todas las páginas del portal, y defensa perimetral `ProjectJaina_Shield.py` + `jaina_threat_radar.py`.
