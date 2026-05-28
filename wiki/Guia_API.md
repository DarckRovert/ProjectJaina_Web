# Guía de la API Interna (JavaScript)

Documentación técnica de las funciones y lógica contenida en `script.js`.

## 1. Motor de Partículas

### `initCanvas()`
Inicializa las dimensiones del canvas al tamaño del `window.innerWidth` y `innerHeight`.

### `class Particle`
- **`reset()`**: Reinicia la posición y propiedades de la partícula cuando sale de los límites.
- **`update()`**: Calcula la nueva posición aplicando velocidad, oscilación senoidal y repulsión del ratón.
- **`draw()`**: Renderiza la partícula en el contexto 2D del canvas.

### `animate()`
Bucle principal de animación que limpia el canvas y actualiza/dibuja cada partícula utilizando `requestAnimationFrame`.

## 2. Utilidades de UI

### `copyRepoUrl(url, buttonElement)`
Gestiona el copiado de URLs al portapapeles y la retroalimentación visual del botón.
- **Parámetros**:
    - `url` (String): La URL del repositorio de GitHub.
    - `buttonElement` (DOMElement): El botón que disparó la acción.

### `updateActiveNavLink()`
Calcula qué sección se encuentra actualmente en el viewport y añade la clase `.active` al enlace correspondiente en la barra de navegación.

## 3. Navegación Móvil

### `openMenu()` / `closeMenu()`
Controlan la visibilidad del menú móvil (`overlay`) y gestionan el estado del scroll del cuerpo para evitar doble scroll.

---
© 2026 **DarckRovert** — El Séquito del Terror
