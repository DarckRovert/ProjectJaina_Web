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
  1. Descargar el cliente optimizado FHD (3.3.5a Build 12340).
  2. Crear tu cuenta criptográfica SRP6 desde el portal web.
  3. Ejecutar el juego en 1 clic mediante `ProjectJaina_Hub.exe` o el lanzador oficial.

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
16. **`ProjectJaina_AdminTools`**: Panel integral de comandos GM, teletransportes y control de servidor.
17. **`ProjectJaina_GMGenie`**: Suite de atención a tickets y macros de asistencia comunitaria.
18. **`ProjectJaina_IntiObjGPS`**: Editor y geolocalizador espacial por lotes para Game Masters.
19. **`ProjectJaina_TBCBalance`**: Monitor de balance numérico para bandas de The Burning Crusade en modo GM.

---

## 3. Marco Legal y Propiedad Intelectual
Para consultar el marco legal completo, el inventario de licencias MIT/GPL de cada módulo y los descargos de propiedad intelectual de Blizzard Entertainment, Inc., consulte el documento autoritativo [`LEGAL_NOTICES.md`](file:///E:/LEGAL_NOTICES.md).
