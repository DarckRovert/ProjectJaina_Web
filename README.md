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
* **Topología Soberana Consolidada:**
  * **Reino 1 Oficial (Project Jaina):** Puerto 8085 (Servidor Principal, Anycast Zero-VPN L4 `ambulance-ergonomic.tun.ply.gg:11356`, DB: `acore_characters`). Alberga de forma unificada las 7 modalidades de juego mediante el selector in-game (`80_GameModesSystem.lua`).
  * **Reino 3 (WanitosGym):** Puerto 8087 (Nodo de Cómputo y Laboratorio España / Standby).
* **7 Modos de Juego In-Game:** Normal Blizzlike con QoL, Hardcore Permadeath (con Santuario Anti-DC de 30s), Ironman Solitario, Die & Rise (metamorfosis necrótica de 3 vidas), Reto Andino x1 clásico, y Herencia de Almas (+100% XP x2 tras perecer).
* **Arquitectura Económica & Divisas de Circuito Cerrado:**
  * **Ficha de Jaina (Item 900200):** WoW Token canónico canjeable por 100 PD o transable libremente por oro.
  * **Token de Jaina (Item 900100):** Divisa soberana 1:1 para cosméticos y monturas en tienda.
  * **Ficha de Evento (Item 910000):** Divisa para la Tienda Visual 3D (`/alas`) para auras y alas celestiales.
  * **Onboarding Gratuito:** 5 Fichas gratuitas al crear la primera cuenta.
  * **AHBot Dynamic Buyer:** Inyección automática de liquidez y compra de materiales de profesiones a los 45s con 80% de probabilidad.
* **Bifacción Canónica Simétrica:** Sistema autoritativo con soporte para **Alianza** y **Horda**. Una sola cuenta otorga acceso total al reino; la facción se selecciona in-game al crear personaje. Hermandades canónicas oficiales: `<El Kirin Tor>` (Guild 21, Lady Jaina) y `<La Horda de Orgrimmar>` (Guild 22, Jefe de Guerra Thrall) con auto-incorporación y bienvenida inmersiva en el primer inicio de sesión.
* **Cronograma Interactivo de Progresión de Eras (2026–2028) & Chrono-Master v2.0:** Línea de tiempo visual de las 8 fases del reino (`Classic Vanilla` → `TBC` → `WotLK T7..T10.5` → `Cataclysm`) sincronizada en tiempo real con `/api/progression` y respaldo autónomo en `data/progression.json`.
* **Telemetría y Estado de Servidor en Vivo:** Conexión asíncrona a `ProjectJaina_WebAPI` para mostrar estado del reino, latencia, versión y población.
* **Subpáginas Especializadas:**
  * **Armería v2.5:** Visualizador de perfiles de héroes, GearScore, talentos, badges de 10 clases (incluyendo Caballero de la Muerte) y búsqueda insensible a acentos (`normalizeStr`).
  * **Base de Datos Soberana AoWoW (`database.html`):** Motor de búsqueda indexado de objetos, criaturas y hechizos con visualizador de tooltips idénticos a WotLK 3.3.5a y conectividad en vivo con `acore_world`.
  * **BugTracker Comunitario (`bugs.html`):** Portal interactivo de reporte y seguimiento de incidencias comunitarias con trazabilidad de estado.
  * **Tienda:** Catálogo visual de cosméticos, monturas y pases de batalla con despacho transaccional idempotente.
  * **Registro & Discord SSO:** Formulario seguro para creación de cuentas con hashing criptográfico SRP6, acceso universal al reino (sin selección de facción en el registro) y registro express en 1 clic con OAuth2 de Discord (`/api/auth/discord/register`).
  * **Voz Espacial 3D:** Cliente web de audio binaural posicional HRTF con emparejamiento por PIN in-game, selector dinámico dual-node (Perú y España) y cifrado Multi-SAN SSL.
  * **Wiki y Lore:** Cronología de eventos mundiales, profecías, manual de usuario, guías de modos y economía.
  * **Descargas CDN & Espejos Oficiales:** Descarga en 1 clic del Lanzador Oficial Standalone v2.2.0 (`ProjectJaina_Launcher_Oficial.zip`), espejos directos Google Drive y enlaces BitTorrent.
* **Activos Gráficos Oficiales:** Ilustraciones Ultra-HD generadas para la cabecera cinemática, escudo heráldico y citadel arcana.

---

## 🚀 3. Despliegue en GitHub Pages y Enlaces Oficiales

El portal se sirve directamente a través de **GitHub Pages**:
* **URL Pública Oficial:** [https://darckrovert.github.io/ProjectJaina_Web/](https://darckrovert.github.io/ProjectJaina_Web/)
* **Comunidad Oficial Discord (Invitación Permanente):** [https://discord.gg/cXxMuRJrfy](https://discord.gg/cXxMuRJrfy)
* **Condiciones del Servicio:** [https://darckrovert.github.io/ProjectJaina_Web/terms.html](https://darckrovert.github.io/ProjectJaina_Web/terms.html)
* **Política de Privacidad:** [https://darckrovert.github.io/ProjectJaina_Web/privacy.html](https://darckrovert.github.io/ProjectJaina_Web/privacy.html)
* **Cliente de Voz Espacial 3D:** [https://darckrovert.github.io/ProjectJaina_Web/voz/](https://darckrovert.github.io/ProjectJaina_Web/voz/)
* **Descarga del Lanzador Oficial (.ZIP Directo):** [https://darckrovert.github.io/ProjectJaina_Web/downloads/ProjectJaina_Launcher_Oficial.zip](https://darckrovert.github.io/ProjectJaina_Web/downloads/ProjectJaina_Launcher_Oficial.zip)
* **Descarga del Lanzador Completo (.RAR Espejo Google Drive):** [https://drive.google.com/file/d/19emgLBtqUhxqf9SM_HM3PMYNqoaVG6WB/view?usp=drive_link](https://drive.google.com/file/d/19emgLBtqUhxqf9SM_HM3PMYNqoaVG6WB/view?usp=drive_link)
* **Descarga del Cliente Completo FHD (.RAR Espejo Google Drive):** [https://drive.google.com/file/d/1VlsfI9WvZ6kyaz03pwC3peJ_hSA3-2MZ/view?usp=drive_link](https://drive.google.com/file/d/1VlsfI9WvZ6kyaz03pwC3peJ_hSA3-2MZ/view?usp=drive_link)

