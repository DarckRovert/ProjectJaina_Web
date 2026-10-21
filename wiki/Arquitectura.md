# 🏛️ Arquitectura del Portal: Project Jaina Web

Este documento describe la arquitectura técnica, el sistema de diseño y la integración con el ecosistema de **Project Jaina (WotLK 3.3.5a - Living Lore & AI Revolution)**.

---

## 1. Stack Tecnológico
- **Frontend**: HTML5 Semántico, Accesible y Optimizado para SEO.
- **Estilos**: CSS3 Moderno modular (`css/style.css`), Glassmorphism arcano, Grid Layout, Flexbox y animaciones GPU-accelerated.
- **Lógica**: JavaScript Vanilla Modular (ES6+), Zero-Dependencies:
  - `js/config.js`: Detección automática y resolución en cascada multi-tier (Localhost, Túnel Anycast dinámico).
  - `js/register.js`: Manejo de registro seguro con criptografía SRP6 compatible con JainaCore.
  - `js/store.js`: Tienda visual y pasarela de cosméticos/pases de batalla.
  - `js/armory.js`: Visualizador interactivo de perfiles de personajes y estadísticas.
  - `voz/app.js`: Cliente de Audio Espacial 3D WebRTC con renderizado binaural HRTF (Web Audio API), Voice Activity Detection (VAD) y señalización de proximidad.
- **Alojamiento & CDN**: GitHub Pages con despliegue nativo desde rama `main`.
- **URL Oficial**: [https://darckrovert.github.io/ProjectJaina_Web/](https://darckrovert.github.io/ProjectJaina_Web/)
- **Portal de Voz 3D**: [https://darckrovert.github.io/ProjectJaina_Web/voz/](https://darckrovert.github.io/ProjectJaina_Web/voz/)

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
- **Cuerpo y Datos Técnicos**: `Inter`, sans-serif (Google Fonts) — legibilidad de alta densidad para armerías y formularios.

---

## 3. Integración con el Núcleo del Servidor y Clúster Bi-Regional
- **Malla Bi-Regional Soberana**:
  - **Nodo Maestro Perú (`node_1_master` - 26.140.157.205)**: Aloja MySQL 8.4 autoritativo, AuthServer y WorldServer de producción.
  - **Nodo Cómputo España (`node_2_compute` - 26.202.12.241)**: Computa audio 3D espacial WebRTC, inferencia neuronal de HeroBots y contingencia activa.
  - **Conmutación Automática (Sentinel Failover)**: Si el nodo maestro de Perú o el nodo de España sufren una desconexión, el demonio Centinela delega dinámicamente la carga de ambos reinos al nodo superviviente sin requerir intervención del usuario.
- **Topología Multi-Reino**:
  - **Reino 1: Project Jaina (Global)**: ID 1, Puerto `8085` (Anycast L4). Progresión de Era Clásica (Nivel 60).
  - **Reino 2: WanitosGym**: ID 2, Puerto `8085` (España) con delegación automática a Puerto `8086` (Perú contingencia).
- **Bifacción Canónica Simétrica y Hermandades Oficiales**:
  - 🦁 **La Alianza & El Kirin Tor**: Liderada por Lady Jaina Valiente con la hermandad canónica `<El Kirin Tor>` (Guild ID 21).
  - 🐺 **La Horda de Orgrimmar**: Liderada por el Jefe de Guerra Thrall con la hermandad canónica `<La Horda de Orgrimmar>` (Guild ID 22).
  - Cuenta universal con libre selección de raza y facción *in-game*, con auto-incorporación y bienvenida en el primer inicio de sesión.
- **Micro-Backend API**: `ProjectJaina_WebAPI.py` (puerto `8080`).
- **Coordinador de Voz 3D WebRTC**: `server/voice_service/server.js` (puerto `3050` HTTPS/WSS con certificado multi-SAN).
- **Puente Neuronal de IA (LLM)**: LM Studio / Neural Worker (puerto `1234`) conectado a través de `mod-llm-chatter` y `03_Playerbot_SocialBridge.lua`.
- **Autenticación**: Hashing criptográfico SRP6 (`srp6_auth.py`) compatible con la base de datos `acore_auth.account` de JainaCore.
- **Telemetría**: Estado del reino en tiempo real (población, latencia, versión WotLK 3.3.5a Build 12340).
