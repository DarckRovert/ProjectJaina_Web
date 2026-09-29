# Arquitectura del Portal: SequitoWeb

Este documento describe la arquitectura técnica, el sistema de diseño y la integración con el ecosistema de **WoW Perú (Reino Andino - WotLK 3.3.5a)** de **El Séquito**.

## 1. Stack Tecnológico
- **Frontend**: HTML5 Semántico y Accesible.
- **Estilos**: CSS3 Moderno con Variables CSS, Grid Layout, Flexbox y Glassmorphism.
- **Lógica**: JavaScript Vanilla (ES6+), sin frameworks pesados (Zero-Dependencies).
- **Alojamiento**: GitHub Pages (Servido directamente desde el repositorio oficial mediante GitHub Actions).

## 2. Sistema de Diseño (Cyber-Void & Oro Andino)
La estética del portal fusiona la mística del Vacío con la identidad cultural y épica del **Reino Andino**:

### Colores de Núcleo
- **Fondo Base**: `#020005` (Deep Void).
- **Textos Principales**: `#f8fafc` (Slate 50).
- **Acentos Místicos**:
  - `fel-green`: `#4ade80` (Auras viles y confirmaciones).
  - `void-purple`: `#9333ea` (Poder abismal y sombras).
  - `blood-red`: `#ef4444` (Combate, alertas y sacrificios).
- **Acentos Reino Andino (WotLK)**:
  - `gold-andino`: `#D4AF37` (Oro Andino, nobleza y distinción de hermandad).
  - `frost-ice`: `#38bdf8` (Escarcha de Rasganorte y Corona de Hielo).

### Tipografía
- **Títulos**: `Cinzel` (Google Fonts) — Estética de autoridad, fantasía oscura y solemnidad.
- **Cuerpo**: `Inter` (Google Fonts) — Claridad técnica, máxima legibilidad en interfaces de datos.

## 3. Motores y Lógica Especializada

### Motor de Partículas (Fel, Void, Gold & Frost Embers)
Implementado en `script.js` utilizando la API de Canvas 2D:
- **Lógica**: Clase `Particle` con propiedades de velocidad, oscilación senoidal, densidad y paleta cromática equilibrada.
- **Interacción**: Sistema de repulsión por proximidad del puntero (Mouse Repulsion).
- **Optimización**: Limitado a 120 partículas para garantizar 60 FPS estables incluso en PCs de cabina con gráficos integrados.

### Observadores de Intersección
Animaciones de entrada escalonadas (`reveal`, `scale-in`, `from-left`, `from-right`) ejecutadas mediante `IntersectionObserver` con umbrales configurados para evitar lag de scroll.

### Utilidades Globales de Portapapeles
Funciones asíncronas seguras con fallback (`copyToClipboard`) para copiar con un solo clic el realmlist oficial (`set realmlist logon.wow-peru.lat`), comandos ingame (`/sdash`, `/srot`) y URLs de clonado de GitHub.

## 4. Ecosistema de Addons Vinculado (WoW Perú 3.3.5a)

| Addon | Propósito | Repositorio Oficial |
|---|---|---|
| **`WoWPeru_RaidSuite`** | Plataforma de combate, macros 30 specs, Loot Council, HUD y wipes | [Ver en GitHub](https://github.com/DarckRovert/WoWPeru_RaidSuite) |
| **`WoWPeru_BattlePass`** | Pase de Batalla estacional de 50 niveles (La Forja Andina) | [Ver en GitHub](https://github.com/DarckRovert/WoWPeru_BattlePass) |
| **`WoWPeru_Companion`** | Hub social meta-ligero, radar P2P de grupo y anuncios | [Ver en GitHub](https://github.com/DarckRovert/WoWPeru_Companion) |
| **`WoWPeru_GameModes`** | Selector cinematográfico de retos Hardcore (1 vida) e Ironman | [Ver en GitHub](https://github.com/DarckRovert/WoWPeru_GameModes) |
| **`WowPeruVisualShop`** | Catálogo cosmético de 18 alas dinámicas, 40+ auras y títulos | [Ver en GitHub](https://github.com/DarckRovert/WowPeruVisualShop) |
| **`Gravity AI Bridge`** | Orquestador local-first de IA y herramientas para desarrolladores | [Ver en GitHub](https://github.com/DarckRovert/Gravity_AI_bridge) |

---
© 2026 **DarckRovert (Elnazzareno)** — El Séquito | WoW Perú (Reino Andino)
