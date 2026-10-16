# 📖 Manual de Usuario — Portal & Ecosistema Project Jaina

Guía oficial para administradores, maestros de juego y jugadores de **Project Jaina (WotLK 3.3.5a — Living Lore & AI Revolution)**.  
**Fecha de Actualización:** 11 de Octubre de 2026  
**Líder & Arquitecto:** DarckRovert (Elnazzareno)  
**Staff AI Engineer:** Antigravity L9 (Mythos 5)  

---

## 1. Módulos del Portal Web Oficial

### 🌟 Inicio y Lore Viviente (`index.html`)
- Presentación cinematográfica de la revolución de IA y Lore Viviente en Theramore.
- Información interactiva sobre Lady Jaina Proudmoore y los HeroBots con consciencia neuronal.
- **Mundo Viviente & Sistemas Exclusivos (v2.5):**
  * *Baluartes de Hermandad:* 6 enclaves estratégicos conquistables con oro in-game (Anti-P2W), estandartes dinámicos de facción, zona de descanso (Rested XP) y Heraldo Intendente (`NPC 5061`) con reparaciones y censo.
  * *Galeón de los Desertores:* Evento naval periódico cada 45 minutos en la bahía de Theramore, campanas de alarma, escalas de abordaje, artillería interactiva (`GO 5051`) y cofre de suministros navales (`GO 2850`) con botín abierto.
- Guía rápida paso a paso de "¿Cómo Jugar?":
  1. **Crear tu Cuenta de Juego:** Registro instantáneo con cifrado militar SRP6 en [`registro.html`](../registro.html).
  2. **Descarga en 1 Clic (Sin VPN):** Descarga el cliente completo o el Lanzador Oficial (`ProjectJaina_Launcher.exe`) desde el portal.
  3. **Conexión Global Directa:** Ejecuta el Lanzador Oficial y pulsa **¡JUGAR AHORA!**. El motor Anycast L4 conecta de inmediato con `127.0.0.1` sin que tengas que instalar ningún adaptador de red ni introducir contraseñas.
  4. **Audio Espacial 3D WebRTC:** Entra al portal de voz con tu navegador para autorizar el micrófono y habla por proximidad en el juego con el comando `/voz`.


### 🛡️ Registro Seguro de Cuentas (`registro.html`)
- Formulario de alta instantánea sin almacenamiento de contraseñas en texto plano.
- Criptografía **SRP6 (Secure Remote Password)** compatible con `acore_auth.account`.

### ⚔️ Armería en Vivo (`armeria.html`)
- Consulta en tiempo real de estadísticas de personajes, cálculo de GearScore, talentos y logros.
- Búsqueda interactiva de héroes y líderes de facción.

### 📜 Wiki y Cronología de Lore (`wiki/index.html`)
- Registro histórico de eventos mundiales (`world_lore_events`) en tiempo real.
- Estado de los líderes legendarios (Thrall, Varian, Sylvanas, Jaina).

### 💎 Tienda Cosmética y Visuales (`tienda.html`)
- Catálogo de cosméticos de rol, auras visuales y monturas estéticas (pay-to-win = 0).

### 🎙️ Voz Espacial 3D (`voz/index.html`)
- Cliente web binaural HRTF interactivo con detección de actividad de voz (VAD).
- Emparejamiento seguro mediante PIN temporal generado en el juego con `/voz`.
- Ajustes en tiempo real de ganancia, puerta de ruido (Noise Gate), VU-meter y lista de oradores en rango auditivo (25 yardas).

---

## 2. Ecosistema de AddOns Oficiales del Cliente

El cliente `ProjectJaina_FHD` integra la suite canónica de AddOns oficiales de Project Jaina (`## Interface: 30300`), regulados bajo la política de AddOns de Blizzard y licenciados bajo términos de código abierto:

### A. Interfaz Visual y Utilidades
1. **`ProjectJaina_DragonflightUI`**: Reemplazo integral con interfaz moderna estilo Dragonflight 10.x.
2. **`ProjectJaina_AbbreviatedStatus`**: Abreviación numérica compacta (k, M) en barras de vida, maná y energía.
3. **`ProjectJaina_Graphics`**: Panel de opciones avanzadas para renderizado Direct3D 9, nitidez y estabilidad.
4. **`ProjectJaina_Talented`**: Editor avanzado de plantillas de talentos con importador/exportador de builds.

### B. Sistemas de Inmersión, Combate y Compañeros con IA
5. **`ProjectJaina_BattlePass`**: Pase de Batalla estacional con misiones diarias y cosméticos de temporada.
6. **`ProjectJaina_Companion`**: Hub social ligero de grupo, presencia y utilidades sin taint.
7. **`Chatter_Companion`**: Gestor de Playerbots con IA, diálogo en lenguaje natural y órdenes tácticas (/bots, /chatter, /llmc).
8. **`ProjectJaina_GameModes`**: Selector cinematográfico de desafíos (Normal, Hardcore permadeath, Ironman).
9. **`ProjectJaina_LoreHUD`**: Subtítulos cinematográficos y telemetría de eventos narrativos de LoreBots.
10. **`ProjectJaina_MultiBot`**: Control táctico, roles, formaciones e inventario de compañeros Playerbots.
11. **`ProjectJaina_PrideTrace`**: Diagnóstico de telemetría de vuelo y controles de aeronaves en tiempo real.
12. **`ProjectJaina_RaidSuite`**: Suite táctica de bandas: CLEU Dispatcher, monitoreo de cooldowns y alertas.
13. **`ProjectJaina_VisualShop`**: Probador 3D y catálogo visual de cosméticos de rol.
14. **`ProjectJaina_Voice`**: Interfaz visual y HUD del sistema de Audio Espacial 3D WebRTC con PIN.
15. **`ProjectJaina_Wardrobe`**: Guardarropa y transfiguración de apariencias estéticas de armaduras y armas.

### C. Herramientas Administrativas de Game Master (Cliente Maestro)
16. **`ProjectJaina_AdminTools` (v2.1.0)**: Panel integral de administración (`/admin`, `/adt`) con 9 pestañas y panel dedicado `"Mundo"` para supervisión, censo y control en tiempo real de Baluartes y el Galeón de Theramore.
17. **`WaniGM Tools` (v2.1.0 Deluxe Living World Edition)**: Panel compacto y replegable (`/wgm`, `/jainagm`) creado por Wanitos (FranFranco) & DarckRovert con arte animado de Jaina y Sylvanas, control de parpadeo realista, hover-peek y pestañas `[General]` y `[Mundo 2.5]`.
18. **`ProjectJaina_GMGenie`**: Suite de atención a tickets, moderación comunitaria y macros de teletransporte con destinos predefinidos para los 6 Baluartes y el Galeón.
19. **`ProjectJaina_IntiObjGPS`**: Editor y geolocalizador espacial por lotes para Game Masters.
20. **`ProjectJaina_TBCBalance`**: Monitor de balance numérico para bandas de The Burning Crusade en modo GM.

---

## 3. Consola y Comandos de GM para Mundo Viviente (v2.5)

Los Game Masters disponen de comandos de consola y Eluna nativos para inspección, teletransporte e intervención técnica de los nuevos sistemas:

### 🏰 Baluartes de Hermandad (`.outpost`)
| Comando | Descripción |
| :--- | :--- |
| `.outpost list` | Despliega el censo completo de soberanía, facción y hermandad regente de los 6 enclaves. |
| `.outpost tele <1..6>` | Teletransporta de inmediato al GM a las coordenadas exactas del Baluarte especificado. |
| `.outpost reset <1..6>` | Resetea la soberanía del enclave indicado, eliminando guardias y restaurando el estado neutral. |
| `.outpost reset all` | Resetea masivamente los 6 enclaves del mundo a soberanía neutral. |
| `.outpost claim <1..6>` | Asigna forzosamente la soberanía del Baluarte a la hermandad del GM ejecutor. |

### 🏴‍☠️ Galeón de los Desertores (`.galleon`)
| Comando | Descripción |
| :--- | :--- |
| `.galleon status` | Consulta la fase actual del evento (`CALM`, `ENGAGED`, `BOARDING`, `DEFEATED`) y tiempos de espera. |
| `.galleon tele` | Teletransporta al GM a la cubierta superior del galeón frente al Teniente desertor. |
| `.galleon ladder` | Teletransporta a la escala de abordaje acuática para pruebas de ascenso e interacción. |
| `.galleon alert` | Dispara forzosamente la sirena de alarma, campanas portuarias y el bombardeo costero. |
| `.galleon testcannon` | Ejecuta una deflagración de prueba del cañón de artillería naval (`GO 5051`). |
| `.galleon reset` | Restaura el galeón al estado de calma, limpiando cofres activos y reiniciando el ciclo. |

---

## 4. Marco Legal y Propiedad Intelectual
Para consultar el marco legal completo, el inventario de licencias MIT/GPL de cada módulo y los descargos de propiedad intelectual de Blizzard Entertainment, Inc., consulte el documento autoritativo [`LEGAL_NOTICES.md`](file:///E:/LEGAL_NOTICES.md).
