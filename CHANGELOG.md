# 📋 Registro de Cambios (Changelog) — Project Jaina Web

Todas las modificaciones notables a este proyecto están documentadas cronológicamente en este archivo.

---

## [v2.0.0] - 2026-10-08 — Ecosistema Project Jaina (Living Lore & AI Revolution)

### 🌟 Agregado & Rediseño Completo
- **Portal Web AAA:** Implementación del nuevo portal de alta fidelidad con Glassmorphism arcano, paleta de colores de Theramore (`#00ccff`, `#d4af37`, `#080b12`) y tipografía Cinzel/Inter.
- **Lore Viviente de Jaina:** Sección interactiva que introduce el concepto de HeroBots y LoreBots conscientes mediante IA neuronal local.
- **Submódulos Especializados:**
  - `armeria.html`: Inspección de personajes, GearScore y estadísticas.
  - `tienda.html`: Catálogo de cosméticos, auras y Pase de Batalla.
  - `registro.html`: Formulario con cifrado SRP6 para creación de cuentas directas en AzerothCore.
- **Activos Gráficos Oficiales:** Generación e integración de ilustraciones Ultra-HD (`jaina_crest_logo.jpg`, `jaina_hero_banner.jpg`, `jaina_living_lore.jpg`).
- **Despliegue GitHub Pages:** Flujo de trabajo CI/CD automatizado vía `.github/workflows/deploy-pages.yml` y rama `gh-pages`.

### 🛡️ Mantenimiento & Erradicación Legacy
- **Eliminación Total de Remnants:** Purga de scripts y hojas de estilo obsoletos del antiguo proyecto (`Deploy_SequitoWeb.bat`, `script.js`, `styles.css`).
- **Scripts de Automatización:** Creado `Deploy_ProjectJainaWeb.bat` para sincronización dual (`main` y `gh-pages`) en un solo paso.
- **Documentación Wiki:** Actualizados manuales de arquitectura, API y usuario hacia los estándares de Project Jaina.
