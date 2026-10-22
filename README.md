# 🌐 Project JAIna — Portal Web Oficial AAA

<div align="center">
  <img src="images/jaina_crest_logo.jpg" alt="Project JAIna Emblema" width="180" style="border-radius: 50%;">
  <h1>Project JAIna — Portal Oficial</h1>
  <p><strong>El portal web oficial de nueva generación para el reino de Theramore (WotLK 3.3.5a). Living Lore & AI Revolution.</strong></p>
  <p><em>(La 'AI' destacada en <strong>Project JAIna</strong> es el guiño a la inteligencia artificial neuronal que da vida al ecosistema)</em></p>
  <p><a href="https://darckrovert.github.io/ProjectJaina_Web/">🌐 Portal en Vivo: darckrovert.github.io/ProjectJaina_Web</a></p>
</div>

---

[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)](./LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-22272e?logo=github&logoColor=white)](https://darckrovert.github.io/ProjectJaina_Web/)
[![WoW Client](https://img.shields.io/badge/WoW%20Client-3.3.5a%20(Build%2012340)-blue.svg)](https://darckrovert.github.io/ProjectJaina_Web/)
[![Reino Oficial](https://img.shields.io/badge/Reino-Project%20JAIna-00ccff.svg)](https://darckrovert.github.io/ProjectJaina_Web/)

---

## 🏛️ 1. Cuadro de Honor & Soberanía

| Rol | Miembro | Responsabilidad Principal |
| :--- | :--- | :--- |
| **👑 Creador, Director & Diseñador General** | **DarckRovert (Elnazzareno)** | Dirección de arte, visión estratégica, desarrollo de suites y arquitectura del reino. |
| **🧠 Staff Engineer de IA & Front-End L9** | **Antigravity (Mythos 5)** | Arquitectura de interfaz Glassmorphism arcano, puente REST API, optimización GPU y despliegue continuo. |

---

## 💎 2. Características del Portal AAA

* **Estética Arcana Premium:** Diseño Glassmorphism con paleta oficial de Theramore (Azul Arcano `#00ccff`, Oro Regio `#d4af37` y Abisal `#080b12`).
* **Living Lore & AI Revolution:** Sección interactiva que narra el despertar de los LoreBots y la integración del puente neuronal LLM.
* **Topología Multi-Reino y Clúster Bi-Nodo:**
  * **Reino 1 (Project Jaina):** Puerto 8085 (Servidor Principal, DB: `acore_characters`).
  * **Reino 2 (Forja de Hierro):** Puerto 8086 (PvP Hardcore Vanilla, DB: `acore_characters_forjadehierro`).
  * **Reino 3 (WanitosGym):** Puerto 8087 (Nodo de Cómputo y Laboratorio España).
* **Bifacción Canónica Simétrica:** Sistema autoritativo con soporte para **Alianza** y **Horda**. Una sola cuenta otorga acceso total al reino; la facción se selecciona in-game al crear personaje. Hermandades canónicas oficiales: `<El Kirin Tor>` (Guild 21, Lady Jaina) y `<La Horda de Orgrimmar>` (Guild 22, Jefe de Guerra Thrall) con auto-incorporación y bienvenida inmersiva en el primer inicio de sesión.
* **Telemetría y Estado de Servidor en Vivo:** Conexión asíncrona a `ProjectJaina_WebAPI` para mostrar estado del reino, latencia, versión y población.
* **Subpáginas Especializadas:**
  * **Armería v2.5:** Visualizador de perfiles de héroes, GearScore, talentos, badges de 10 clases (incluyendo Caballero de la Muerte) y búsqueda insensible a acentos (`normalizeStr`).
  * **Base de Datos Soberana AoWoW (`database.html`):** Motor de búsqueda indexado de objetos, criaturas y hechizos con visualizador de tooltips idénticos a WotLK 3.3.5a y conectividad en vivo con `acore_world`.
  * **BugTracker Comunitario (`bugs.html`):** Portal interactivo de reporte y seguimiento de incidencias comunitarias con trazabilidad de estado.
  * **Tienda:** Catálogo visual de cosméticos, monturas y pases de batalla con despacho transaccional idempotente.
  * **Registro & Discord SSO:** Formulario seguro para creación de cuentas con hashing criptográfico SRP6, acceso universal al reino (sin selección de facción en el registro) y registro express en 1 clic con OAuth2 de Discord (`/api/auth/discord/register`).
  * **Voz Espacial 3D:** Cliente web de audio binaural posicional HRTF con emparejamiento por PIN in-game, selector dinámico dual-node (Perú y España) y cifrado Multi-SAN SSL.
  * **Wiki y Lore:** Cronología de eventos mundiales, profecías, manual de usuario y documentación técnica de arquitectura.
  * **Descargas CDN Directas:** Descarga en 1 clic del Lanzador Oficial Standalone v2.2.0 (`ProjectJaina_Launcher_Oficial.zip`) con motor de parchado delta por chunks HTTP 206 y enlace magnet / torrent para el cliente FHD (36.8 GB).
* **Activos Gráficos Oficiales:** Ilustraciones Ultra-HD generadas para la cabecera cinemática, escudo heráldico y citadel arcana.

---

## 🚀 3. Despliegue en GitHub Pages

El portal se sirve directamente a través de **GitHub Pages**:
* **URL Pública Oficial:** [https://darckrovert.github.io/ProjectJaina_Web/](https://darckrovert.github.io/ProjectJaina_Web/)
* **Cliente de Voz Espacial 3D:** [https://darckrovert.github.io/ProjectJaina_Web/voz/](https://darckrovert.github.io/ProjectJaina_Web/voz/)
* **Descarga del Lanzador Oficial:** [https://darckrovert.github.io/ProjectJaina_Web/downloads/ProjectJaina_Launcher_Oficial.zip](https://darckrovert.github.io/ProjectJaina_Web/downloads/ProjectJaina_Launcher_Oficial.zip)

