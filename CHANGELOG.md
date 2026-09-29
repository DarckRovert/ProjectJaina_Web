# 📋 Registro de Cambios (Changelog) — SequitoWeb

Todas las modificaciones notables de este proyecto están documentadas en este archivo siguiendo [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y respetando [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [6.0.1] - 2026-09-28

### 🚀 Migración de Hosting: Netlify → GitHub Pages
- **Eliminación Total de Netlify:** Erradicados todos los badges, enlaces y referencias a Netlify en index.html, README.md, wiki/Arquitectura.md y .gitignore.
- **Workflow de GitHub Actions:** Creado .github/workflows/deploy-pages.yml para compilar y desplegar automáticamente la web en **GitHub Pages** (https://darckrovert.github.io/SequitoWeb/) en cada push a main.
- **Actualización de Scripts:** Modernizado Deploy_SequitoWeb.bat eliminando comandos antiguos dual-push a master y garantizando sincronización exclusiva sobre main.
- **Eliminación de Assets Obsoletos:** Removido ssets/netlify-badge.svg.

---

## [6.0.0] - 2026-09-28

### 🌟 Migración Oficial a WoW Perú (Reino Andino - WotLK 3.3.5a)
- **Rebranding Completo:** Transformación integral del portal desde Turtle WoW (Vanilla 1.12.1) hacia **WoW Perú — Reino Andino (WotLK 3.3.5a Build 12340)**.
- **Nuevo Arsenal de Addons Oficiales:**
  - Incorporado **`WoWPeru_RaidSuite` v11.0.0 (Sequito Platform)** como núcleo de combate para las 30 especializaciones de WotLK, Loot Council, GearScore y autopsia de wipes.
  - Incorporado **`WoWPeru_BattlePass` v2.0.0 (Temporada 2: La Forja Andina)** con sincronización hex de 50 niveles y misiones de hermandad.
  - Incorporado **`WoWPeru_Companion` v1.0.1** para telemetría P2P social en grupo y raid con blindaje contra reseteos de WTF en cabinas.
  - Incorporado **`WoWPeru_GameModes` v1.0.0** como selector de modalidades Hardcore (1 vida) e Ironman.
  - Incorporado **`WowPeruVisualShop` v1.0.0** para el catálogo cosmético de alas, auras y títulos.
  - Eliminados los 14 addons legacy obsoletos de Vanilla 1.12.1.
- **Sistema de Diseño (Cyber-Void & Oro Andino):**
  - Añadidos tokens de **Oro Andino (`--gold-andino: #D4AF37`)** y **Escarcha (`--frost-ice: #38bdf8`)**.
  - Nuevas clases utilitarias: `.gold-btn`, `.frost-btn`, `.badge-andino`, `.badge-frost`, `.realmlist-box`, `.copy-pill-btn`, `.slash-cmd-tag`.
- **Motor de Partículas Canvas 2D (`script.js`):**
  - Añadidas partículas de Oro Andino y Escarcha reactivas a la posición del cursor (`mouse repulsion`).
  - Utilidad global `copyToClipboard()` con retroalimentación visual táctil instantánea.
- **Guía de Conexión & Descargas:**
  - Caja interactiva con botón de copiado del realmlist oficial: `set realmlist logon.wow-peru.lat`.
  - Tabla de descarga directa de repositorios oficiales en GitHub (clonado Git y descarga ZIP).
  - Eliminados enlaces antiguos a clientes de Google Drive y referencias a launchers de Vanilla.
- **Narrativa Canónica (Lore):**
  - Crónicas de Elnazzareno actualizadas para narrar la expedición a Rasganorte (Northrend), el desafío a Corona de Hielo y la conquista de la Forja Andina en el Reino Andino.
- **Documentación & Wiki:**
  - Actualización completa de `wiki/Arquitectura.md`, `wiki/FAQ.md`, `wiki/Manual_Usuario.md` y `wiki/Guia_API.md`.
  - README.md y metadatos adaptados a las directivas de WoW Perú.

---

## [5.0.0] - 2026-05-28
- Rediseño general con tema Cyber-Void, motor de partículas Canvas y paleta neón.

## [1.0.0] - 2026-04-09
- Lanzamiento inicial del portal para la hermandad El Séquito del Terror.
