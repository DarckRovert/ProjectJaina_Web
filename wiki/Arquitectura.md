# 🏛️ Arquitectura del Portal: Project Jaina Web

Este documento describe la arquitectura técnica, el sistema de diseño y la integración con el ecosistema de **Project Jaina (WotLK 3.3.5a - Living Lore & AI Revolution)**.

---

## 1. Stack Tecnológico
- **Frontend**: HTML5 Semántico, Accesible y Optimizado para SEO.
- **Estilos**: CSS3 Moderno modular (`css/style.css`), Glassmorphism arcano, Grid Layout, Flexbox y animaciones GPU-accelerated.
- **Lógica**: JavaScript Vanilla Modular (ES6+), Zero-Dependencies:
  - `js/config.js`: Detección automática de entorno (local, Radmin, GitHub Pages / túnel público).
  - `js/register.js`: Manejo de registro seguro con criptografía SRP6 compatible con AzerothCore.
  - `js/store.js`: Tienda visual y pasarela de cosméticos/pases de batalla.
  - `js/armory.js`: Visualizador interactivo de perfiles de personajes y estadísticas.
- **Alojamiento & CDN**: GitHub Pages con despliegue automatizado en `gh-pages` y GitHub Actions (`.github/workflows/deploy-pages.yml`).
- **URL Oficial**: [https://darckrovert.github.io/ProjectJaina_Web/](https://darckrovert.github.io/ProjectJaina_Web/)

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

## 3. Integración con el Núcleo del Servidor
- **Micro-Backend**: `ProjectJaina_WebAPI.py` (puerto `8080`).
- **Autenticación**: Hashing criptográfico SRP6 (`srp6_auth.py`) compatible con la base de datos `auth.account` de AzerothCore.
- **Telemetría**: Estado del reino en tiempo real (población, latencia, versión WotLK 3.3.5a Build 12340).
