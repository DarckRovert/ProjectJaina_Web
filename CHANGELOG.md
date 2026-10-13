# 📋 Registro de Cambios (Changelog) — Project Jaina Web

Todas las modificaciones notables a este proyecto están documentadas cronológicamente en este archivo.

---

## [v2.1.0] - 2026-10-12 — Despliegue de Voz Espacial 3D, Resiliencia Multi-Tier y Navegación Unificada

### 🎙️ Audio Espacial 3D WebRTC
- **Portal de Voz Dedicado (`voz/`):** Despliegue del cliente web de voz posicional (`voz/index.html` y `voz/app.js`) con motor de audio binaural Web Audio API (HRTF panner), VAD (Voice Activity Detection), visualizador de VU-meter y control de puerta de ruido.
- **Selector de Servidores y Detección Automática:** Erradicada la IP estática obsoleta de VPS; implementada selección dinámica entre desarrollo local (`localhost:3050`), red Radmin VPN (`26.140.157.205:3050`) y servidores personalizados.
- **Integración de Navegación Global:** Añadido el acceso a Voz 3D en la barra de navegación superior en las 5 páginas principales (`index.html`, `armeria.html`, `tienda.html`, `registro.html`, `wiki/index.html`).

### 🌐 Resiliencia y Conectividad WebAPI
- **Cascada de Resolución Multi-Tier (`js/config.js`):** Eliminada la dependencia fija del túnel ngrok expirado; introducido mecanismo de sondeo secuencial con timeout de 1.5s vía `AbortController` (Localhost -> Radmin VPN -> Túnel).
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
