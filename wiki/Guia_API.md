# Guía de la API Interna (JavaScript & Frontend)

Documentación técnica de las funciones y lógica contenida en `script.js` del portal **SequitoWeb**.

---

## 1. Motor de Partículas (Canvas 2D)

### `initCanvas()`
Calcula y sincroniza las dimensiones del canvas con `window.innerWidth` e `innerHeight`.

### `class Particle`
- **`reset()`**: Asigna posición aleatoria y selecciona una tonalidad cromática balanceada:
  - `rgba(212, 175, 55, a)`: Oro Andino (#D4AF37)
  - `rgba(220, 38, 38, a)`: Sangre Letal
  - `rgba(147, 51, 234, a)`: Vacío Abismal
  - `rgba(74, 222, 128, a)`: Fuego Vil
  - `rgba(56, 189, 248, a)`: Escarcha de Rasganorte
- **`update()`**: Aplica vector de velocidad vertical ascendente, oscilación horizontal senoidal y fuerza de repulsión reactiva ante el puntero del ratón (`mouse repulsion`).
- **`draw()`**: Renderiza el punto en el contexto 2D usando `arc` y `fill`.

### `animate()`
Bucle de renderizado continuo sincronizado con la tasa de refresco del monitor mediante `requestAnimationFrame`.

---

## 2. Utilidades de Portapapeles & UI

### `window.copyToClipboard(text, btnElement, successMsg)`
Gestiona la copia segura de texto al portapapeles con retroalimentación visual e interactiva instantánea:
- Utiliza la API moderna `navigator.clipboard.writeText` con fallback transparente a elemento `textarea` oculto.
- Cambia temporalmente el contenido del botón a `✓ ¡COPIADO!` y restaura su estado original tras 2.2 segundos.

### `window.copyRepoUrl(url, btnElement)`
Wrapper especializado para clonado de repositorios en GitHub.

---

## 3. Observadores de Scroll & Menú Móvil

### `IntersectionObserver`
Detecta cuándo las secciones y tarjetas ingresan al viewport (`threshold: 0.12`) y aplica la clase `.active` para desencadenar animaciones CSS aceleradas por GPU.

### `updateActiveNavLink()`
Monitorea la posición vertical de la página y resalta dinámicamente el enlace correspondiente en la barra de navegación superior.

### Menú Desplegable Móvil
Controla la apertura y cierre del menú para pantallas táctiles (`#nav-hamburger` y `#mobile-nav`), bloqueando el scroll del `body` mientras el menú esté visible para evitar desplazamientos accidentales.

---
© 2026 **DarckRovert** — El Séquito del Terror
