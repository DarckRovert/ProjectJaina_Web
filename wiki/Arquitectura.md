# Arquitectura del Portal: SequitoWeb

Este documento describe la arquitectura técnica y el sistema de diseño del portal oficial de **El Séquito del Terror**.

## 1. Stack Tecnológico
- **Frontend**: HTML5 Semántico.
- **Estilos**: CSS3 Moderno con Variables CSS y Flexbox/Grid Advanced.
- **Lógica**: JavaScript Vanilla (ES6+).
- **Alojamiento**: Netlify (Open Source Plan).

## 2. Sistema de Diseño (Cyber-Void)
La estética del portal se basa en una paleta "Cyber-Void" con los siguientes componentes:

### Colores de Núcleo
- **Fondo**: `#020005` (Deep Void).
- **Textos**: `#f8fafc` (Slate 50).
- **Acentos**:
    - `fel-green`: `#4ade80` (Auras viles).
    - `neon-pink`: `#f72585` (Lore y mística).
    - `void-purple`: `#9333ea` (Poder abismal).

### Tipografía
- **Títulos**: `Cinzel` (Google Fonts) - Estética de fantasía oscura y autoridad.
- **Cuerpo**: `Inter` (Google Fonts) - Claridad técnica y legibilidad.

## 3. Motores y Lógica Especializada

### Motor de Partículas (Fel Embers)
Implementado en `script.js` utilizando la API de Canvas 2D. 
- **Lógica**: Clase `Particle` con propiedades de velocidad, densidad y color aleatorio basado en el lore.
- **Interacción**: Sistema de repulsión por proximidad del puntero (Mouse Repulsion).

### Observadores de Intersección
Se utiliza `IntersectionObserver` para gestionar las animaciones de entrada (`reveal`) de forma eficiente, evitando el uso excesivo de eventos de scroll.

### Sistema de Navegación
- **Sticky Navbar**: Con efecto de desenfoque (`backdrop-filter`) y cambio de estilo al hacer scroll.
- **Active Link Tracking**: Sincronización automática de los enlaces de navegación con la sección visible en pantalla.

---
© 2026 **DarckRovert** — El Séquito del Terror
