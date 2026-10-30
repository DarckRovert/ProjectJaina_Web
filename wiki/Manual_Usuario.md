# 📖 Manual de Usuario — Portal & Ecosistema Project Jaina

Guía oficial para administradores, maestros de juego y jugadores de **Project Jaina (WotLK 3.3.5a — Living Lore & AI Revolution)**.  
**Fecha de Actualización:** 30 de Octubre de 2026 (v5.52.1 — Hito #269)  
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
  1. **Crear tu Cuenta de Juego:** Registro instantáneo con cifrado militar SRP6 en [`registro.html`](../registro.html). Selección tripartita: Alianza de Jaina, Kirin Tor Dalaran o Horda de Orgrimmar.
  2. **Descarga en 1 Clic (Sin VPN):** Descarga el cliente completo o el Lanzador Oficial (`ProjectJaina_Launcher.exe` v2.1.3) desde el portal o vía BitTorrent.
  3. **Conexión Global Directa:** Ejecuta el Lanzador Oficial y pulsa **⚔️ ENTRAR A AZEROTH**. El motor Anycast L4 conecta de inmediato con `127.0.0.1` sin que tengas que instalar ningún adaptador de red ni introducir contraseñas.
  4. **Audio Espacial 3D WebRTC:** Entra al portal de voz con tu navegador (PC o celular) para autorizar el micrófono y habla por proximidad en el juego con el comando `/voz`.


### 🛡️ Registro Seguro de Cuentas (`registro.html`)
- Formulario de alta instantánea sin almacenamiento de contraseñas en texto plano.
- Criptografía **SRP6 (Secure Remote Password)** compatible con `acore_auth.account`.
- Selección de facción canónica tripartita: Alianza de Jaina (`ALLIANCE`), Kirin Tor Dalaran (`KIRIN_TOR`) o La Horda (`HORDE`).

### ⚔️ Armería en Vivo (`armeria.html`)
- Consulta en tiempo real de estadísticas de personajes, cálculo de GearScore, talentos y logros sincronizados con `acore_characters`.
- Motor de búsqueda y filtrado de clases normalizado insensible a tildes (Paladines, Pícaros, Chamanes con colores e insignias oficiales de WoW).

### 📜 Wiki y Cronología de Lore (`wiki/index.html`)
- Registro histórico de eventos mundiales (`world_lore_events`) en tiempo real.
- Estado de los líderes legendarios (Thrall, Varian, Sylvanas, Jaina).

### 💀 Modos de Juego & Desafíos In-Game
- **Normal (Aventurero):** Reglas canónicas WotLK 3.3.5a HD con resurrecciones ilimitadas y libre comercio.
- **Hardcore:** 1 sola vida, muerte permanente irrevocable con lápida física y bloqueo de ángeles.
- **Ironman:** 1 sola vida con autosuficiencia estricta: sin comercio, sin buzón, sin subastas, sin hermandades y únicamente equipamiento blanco y gris.
- **Die & Rise:** 3 vidas iniciales con metamorfosis necrótica progresiva (esqueleto, aura fría profana) y purificación en santuarios.
- **Reto Andino x1:** Multiplicadores x1 estricto como en 2008 para puristas del esfuerzo clásico.
- **Herencia de Almas:** Si tu héroe Hardcore/Ironman/Die&Rise muere tras superar el nivel 1, tu siguiente personaje recibe **+100% XP (x2)** hasta el nivel del mártir caído.
- **Santuario Anti-DC:** Inmunidad temporal de emergencia si tu conexión sufre una desconexión súbita en combate.

### 🪙 Arquitectura Económica & Divisas Soberanas
- **Token de Jaina (Item 900100):** Micro-moneda 1:1. Clic derecho in-game acredita **+1 Punto de Donación (PD)** en tu cuenta web. Se utiliza en el AddOn de tienda in-game.
- **Ficha de Jaina — WoW Token (Item 900200):** Token canónico de 100 PD. Se puede vender libremente por oro en la Casa de Subastas o consumirse para recibir **+100 PD** en la web.
- **Ficha de Evento (Item 910000):** Moneda cosmética para la **Tienda Visual 3D (`/alas`)** para activar 17 tipos de alas y auras con bonus de 3 días.
- **Onboarding de Minuto Cero:** Todo personaje nuevo recibe **5 Fichas de Evento gratis**, 6 Tokens de Jaina, 10 de oro y 4 mochilas de 16 casillas al entrar por primera vez.
- **Motor de Subastas Vivas (AH Engine):** Agente comprador autónomo que evalúa materiales publicados por jugadores y los compra en 45 segundos con un 80% de probabilidad, garantizando liquidez en profesiones.

### 💎 Tienda Cosmética y Visuales (`tienda.html`)
- Catálogo de cosméticos de rol, auras visuales y monturas estéticas (pay-to-win = 0).
- Guía rápida interactiva de divisas y canje automatizado mediante correo SOAP in-game.

### 🎙️ Voz Espacial 3D (`voz/index.html`)
- Cliente web binaural HRTF interactivo con detección de actividad de voz (VAD).
- Emparejamiento seguro mediante PIN temporal generado en el juego con `/voz`.
- Ajustes en tiempo real de ganancia, puerta de ruido (Noise Gate), VU-meter y lista de oradores en rango auditivo (25 yardas).

---

## 2. Ecosistema de AddOns Oficiales del Cliente

El cliente `ProjectJaina_FHD` integra la suite canónica de AddOns oficiales de Project Jaina (`## Interface: 30300`), regulados bajo la política de AddOns de Blizzard y licenciados bajo términos de código abierto:

### A. Interfaz Visual y Utilidades
1. **`ProjectJaina_DragonflightUI`**: Reemplazo integral con interfaz moderna estilo Dragonflight 10.x, incluyendo organizador automático inteligente de mochilas, banco personal y banco de hermandad con 1-clic (icono de escoba mágica con orfebrería de Dalaran) y barras de acción dinámicas.
2. **`ProjectJaina_AbbreviatedStatus`**: Abreviación numérica compacta (k, M) en barras de vida, maná y energía.
3. **`ProjectJaina_Graphics`**: Panel de opciones avanzadas para renderizado Direct3D 9, nitidez y estabilidad.
4. **`ProjectJaina_Talented`**: Editor avanzado de plantillas de talentos con importador/exportador de builds.

### B. Sistemas de Inmersión, Combate y Compañeros con IA
5. **`ProjectJaina_BattlePass`**: Pase de Batalla estacional con misiones diarias, recompensas cosméticas exclusivas y tipografía normalizada para renderizado nativo 3.3.5a en español.
6. **`ProjectJaina_Companion`**: Hub social ligero de grupo, presencia y utilidades sin taint.
7. **`Chatter_Companion`**: Gestor de Playerbots con IA, diálogo en lenguaje natural y órdenes tácticas (/bots, /chatter, /llmc).
8. **`ProjectJaina_GameModes`**: Selector cinematográfico AAA de modalidades de juego (Aventurero Normal, Hardcore con muerte permanente, Ironman solitario y Reto Andino x1 blizzlike) mediante comando `/modos` o `/jainamodes`.
9. **`ProjectJaina_LoreHUD`**: Subtítulos cinematográficos y telemetría de eventos narrativos de LoreBots.
10. **`ProjectJaina_MultiBot`**: Control táctico, roles, formaciones e inventario de compañeros Playerbots.
11. **`ProjectJaina_PrideTrace`**: Diagnóstico de telemetría de vuelo y controles de aeronaves en tiempo real.
12. **`ProjectJaina_RaidSuite`**: Suite táctica de bandas: CLEU Dispatcher, monitoreo de cooldowns y alertas.
13. **`ProjectJaina_VisualShop`**: Probador 3D y catálogo visual de cosméticos de rol.
14. **`ProjectJaina_Voice`**: Interfaz visual y HUD del sistema de Audio Espacial 3D WebRTC con PIN.
15. **`ProjectJaina_Wardrobe`**: Guardarropa y transfiguración de apariencias estéticas de armaduras y armas.

### C. Herramientas Administrativas de Game Master (Cliente Maestro)
16. **`ProjectJaina_AdminTools` (v2.1.0)**: Panel integral de administración (`/admin`, `/adt`) con 9 pestañas y panel dedicado `"Mundo"` para supervisión, censo y control en tiempo real de Baluartes y el Galeón de Theramore.
17. **`ProjectJaina_GMGenie` (v3.1.0 Sovereign Edition — JainaGM Suite)**: Suite unificada de Game Master que absorbe e integra el Panel de Control JainaGM (5 pestañas operativas: General, Tele, Mundo Baluartes, Items, Utils) con arte animado de Jaina & Sylvanas con ciclo de parpadeo realista, sistema de tickets de soporte, HUD de staff y comandos rápidos (`/gm`, `/jainagm`, `/staff`, `/control`).
18. **`ProjectJaina_IntiObjGPS`**: Editor y geolocalizador espacial por lotes para Game Masters.
19. **`ProjectJaina_TBCBalance`**: Monitor de balance numérico para bandas de The Burning Crusade en modo GM.

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

### ⚔️ Escuadrón Élite de Compañeros IA (`.escuadron` / `.party ia`)
| Comando | Descripción |
| :--- | :--- |
| `.escuadron convocar` | Invoca a Silka (Tanque), Rogotten (Pícaro Elfo de Sangre DPS Tier 2 Bloodfang), Aezrah (Healer) y Melissah (DPS Brujo) a la party, calibrados a nivel 60. |
| `.escuadron disolver` | Remueve a los 4 compañeros del grupo con diálogos canónicos de despedida. |
| `.escuadron postura defensiva` | Conmuta la estrategia del escuadrón a control de masas, absorción de daño y curas prioritarias. |
| `.escuadron postura ofensiva` | Activa ráfagas de DPS máximo, ataques concentrados y ejecución rápida de objetivos. |
| `.escuadron postura pasiva` | Detiene el combate activo de los compañeros y los coloca en seguimiento estricto del jugador. |

### 🧭 Buscador de Mazmorras Instantáneo y Despacho PvP (`.rdf` / `.bg`)
| Comando | Descripción |
| :--- | :--- |
| `.rdf go [mazmorra]` (o `.lfg go`) | Teletransporta de inmediato al líder y a su escuadrón a la entrada de la mazmorra clásica correspondiente a su nivel. |
| `.rdf bots` | Auto-completa la party del jugador con 1 Tanque, 1 Sanador y 3 DPS para la cola de RDF. |
| `.rdf list` | Muestra el catálogo de las 18 mazmorras clásicas de Vanilla con sus rangos de nivel. |
| `.rdf tank` / `.rdf heal` / `.rdf dps` | Invoca o añade un bot de rol específico al grupo. |
| `.bg bots` | Acelera la apertura de Campos de Batalla (WSG, AB, AV) forzando el despacho de bots en brackets 2v2/4v4. |

---

## 4. Marco Legal y Propiedad Intelectual
Para consultar el marco legal completo, el inventario de licencias MIT/GPL de cada módulo y los descargos de propiedad intelectual de Blizzard Entertainment, Inc., consulte el documento autoritativo [`LEGAL_NOTICES.md`](file:///E:/LEGAL_NOTICES.md).


### 11. Convivencia con Playerbots y Asistencia en Grupo (Hito #228)
* **Invitación a Grupo:** Cualquier jugador humano puede invitar a cualquier Playerbot del mundo (`/invite [Nombre]`). El bot aceptará de forma inmediata e incondicional (`AiPlayerbot.GroupInvitationPermission = 2`).
* **Comportamiento en Grupo:** Al unirse, el bot se vincula al líder humano como su Maestro. Lo seguirá fielmente, asistirá en combate según su rol (Tanque, Sanador o DPS), completará y aceptará misiones del grupo, despojará botín y recolectará hierbas o minerales (`+follow,+quest,+accept all quests,+loot,+gather,+grind`).
* **Consultas y Asistencia de Juego:** Puedes susurrar o hablarle por chat local a cualquier Playerbot para pedirle consejos sobre monturas y equitación, formas de farmear oro, qué mazmorras hacer a tu nivel, cómo anotarte a PvP o cómo optimizar tus profesiones y talentos.
* **Matchmaking Instantáneo en Mazmorras y PvP:**
  - Al anotarte en el Buscador de Mazmorras (RDF), el sistema convoca o alinea automáticamente a los compañeros faltantes.
  - Al anotarte a un Campo de Batalla (WSG, Arathi, Alterac, Ojo de la Tormenta, Isla de la Conquista) mediante la tecla `H`, los Playerbots elegibles de tu nivel se anotan de inmediato para iniciar la partida.
