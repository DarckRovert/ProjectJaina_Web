# ❓ FAQ — Preguntas Frecuentes — Project JAIna

## 1. General

### ¿Qué es Project JAIna?
**Project JAIna** es un servidor y ecosistema innovador de World of Warcraft (Wrath of the Lich King 3.3.5a Build 12340). Integra **HeroBots impulsados por Inteligencia Artificial Neuronal (IA)**, sistema de Lore Viviente, audio espacial 3D y gráficos Ultra-HD.

### ¿Por qué 'AI' en mayúsculas en el nombre?
Las letras **AI** en **Project JAIna** hacen un guiño directo a la arquitectura de inteligencia artificial cognitiva que controla a los compañeros de aventura y PNJs del reino.

### ¿Puedo jugar gratis?
Sí. El acceso al servidor y la descarga de todos los addons del ecosistema es 100% gratuito bajo licencia de código abierto.

---

## 2. Conexión e Instalación

### ¿Cuál es el realmlist oficial?
El cliente se conecta de forma directa sin necesidad de Hamachi ni VPNs:
```text
set realmlist 127.0.0.1
```
*(Requiere el Lanzador Oficial Anycast. Si juegas vía Radmin VPN, utiliza: `set realmlist 26.140.157.205`). También puedes utilizar el Lanzador Oficial (`ProjectJaina_Launcher.exe`), el cual autoconfigura la conexión con 1 solo clic.*

### ¿Cómo descargo y juego en Project JAIna (Cero VPN)?
1. **Crea tu cuenta:** Regístrate en 5 segundos en [Crear Cuenta](https://darckrovert.github.io/ProjectJaina_Web/registro.html) con cifrado militar SRP6.
2. **Descarga el Cliente o Lanzador:** 
   - Si no tienes World of Warcraft 3.3.5a: Descarga el cliente completo oficial (37 GB) desde el enlace de Google Drive o BitTorrent en el portal.
   - Si ya tienes un cliente 3.3.5a: Descarga solo el **Lanzador Oficial** (~40 MB) y colócalo en tu carpeta de juego.
3. **Abre el Lanzador y Juega:** Ejecuta `ProjectJaina_Launcher.exe` y haz clic en **¡JUGAR AHORA!**. ¡Listo! Sin instalar VPNs, sin pedir contraseñas de red y sin configurar IPs.
4. **Chat de Proximidad 3D:** Ingresa a la sección de [Voz](https://darckrovert.github.io/ProjectJaina_Web/voz/index.html) y escribe `/voz` dentro del juego para vincular tu micrófono.


### ¿Cómo se instalan los AddOns oficiales?
El cliente oficial ya viene preconfigurado con las 21 suites activas en `Interface\AddOns\` (17 AddOns canónicos para jugadores y 4 suites de Staff, pertenecientes al ecosistema certificado de 25 repositorios oficiales de Project JAIna). Si deseas actualizarlos manualmente:
1. Descarga el archivo de lanzamiento desde el repositorio GitHub correspondiente.
2. Descomprímelo asegurándote de que la carpeta quede en `Interface\AddOns\ProjectJaina_<NombreAddon>`.
3. En la pantalla de selección de personajes, activa la casilla **"Cargar accesorios desactualizados"**.

---

### ¿Qué reinos están disponibles en el juego?
El ecosistema cuenta con una arquitectura de servidor soberana y clúster bi-regional:
- **Project Jaina (Reino 1 Soberano - Perú):** El reino principal y unificado de Living Lore, economía balanceada, HeroBots autónomos y eventos mundiales (Puerto 8085 / Playit Anycast). **Consolida todas las modalidades de juego** (Normal, Hardcore Permadeath, Ironman Solitario, Die & Rise, Reto Andino) mediante el selector cinematográfico in-game (`/modos`), evitando la fragmentación de la población.
- **WanitosGym (Reino 3 - España):** Reino laboratorio y sandbox experimental gestionado por el equipo en España (Standby / Cluster LAN).

### ¿Cómo elijo mi facción?
Una sola cuenta te otorga acceso total al reino. Eliges libremente tu facción (**Alianza** u **Horda**) y tu raza al crear tus personajes dentro del juego:
- **Alianza:** Los héroes de la Alianza reciben la bendición de Lady Jaina Valiente e incorporación de honor a la hermandad canónica `<El Kirin Tor>` (Guild ID 21).
- **Horda:** Los guerreros de la Horda reciben el grito de guerra y provisiones de Thrall e incorporación a la hermandad canónica `<La Horda de Orgrimmar>` (Guild ID 22).

---

## 3. Modos de Juego y Desafíos de Supervivencia

### ¿Qué modos de juego están disponibles?
Al crear un personaje o hablar con Kaelia Sombraetérea (o mediante el comando `/modo`), puedes elegir entre:
- **Normal (Aventurero):** La experiencia canónica de WotLK 3.3.5a HD con resurrecciones ilimitadas, libre comercio y apoyo de HeroBots.
- **Hardcore:** Muerte permanente estricta (1 sola vida). Si tu salud llega a 0, tu alma queda sellada para siempre y se erige una lápida física (GO 192256).
- **Ironman:** Desafío extremo de autosuficiencia. 1 sola vida + prohibición absoluta de comercio, correo, subastas, grupos y hermandades; únicamente equipamiento gris y blanco.
- **Die & Rise (Metamorfosis Necrótica):** Comienzas con 3 vidas. Cada muerte altera tu carne en esqueleto no-muerto con auras profanas. Puedes restaurar vidas rezando en Santuarios Sagrados de la Luz. La 3ª muerte es definitiva.
- **Reto Andino x1:** Multiplicadores x1.00 estrictos como en 2008 para puristas del esfuerzo clásico.

### ¿Qué ocurre si mi personaje Hardcore o Ironman muere? ¿Pierdo todo?
¡No! En Project Jaina tu esfuerzo jamás se pierde gracias a la **Herencia de Almas**:
- Si tu héroe en modo Hardcore, Ironman o Die & Rise cae en combate tras superar el nivel 1, bendice tu cuenta.
- **Tu siguiente personaje creado en la cuenta recibirá automáticamente un bono de +100% XP (x2)** hasta alcanzar el nivel máximo que logró el héroe caído.

### ¿Qué pasa si se me corta el internet en medio de un combate peligroso?
El servidor cuenta con el **Santuario Anti-DC (Protección Activa de Desconexión L9)**: Si el núcleo detecta una pérdida súbita de paquetes o desconexión abrupta mientras estás en combate en un modo de muerte permanente, activa de inmediato un Santuario Divino de Inmunidad temporal, evitando que perezcas por fallos de tu proveedor de internet.

### ¿Puedo hacer mazmorras o campos de batalla si juego en solitario?
¡Absolutamente! Project Jaina cuenta con dos sistemas integrados para jugadores solitarios:
1. **Despacho Instantáneo RDF y Matchmaking PvP (Hito #205):** Abre el Buscador de Mazmorras (`I`) y encola. El motor interceptará tu solicitud y auto-reclutará de inmediato los roles faltantes (1 Tanque, 1 Sanador y 3 DPS) sincronizados a tu nivel, aceptando la propuesta y teletransportando a todo el grupo con las recompensas oficiales de RDF. Además, puedes escribir `.rdf go` para viajar instantáneamente con tu escuadrón a la entrada de la mazmorra correspondiente a tu nivel. En PvP, los campos de batalla (Garganta Grito de Guerra, Cuenca de Arathi, Valle de Alterac) inician con umbrales optimizados (2v2 / 4v4) acelerados por el motor nativo.
2. **Escuadrón Élite de Compañeros IA (Hito #204):** Puedes invocar en cualquier momento al escuadrón canónico escribiendo `.escuadron convocar` (o `.party ia convocar`). Se unirán **Silka** (Paladín Tanque), **Rogotten** (Pícaro Elfo de Sangre DPS, Set Tier 2 *Bloodfang* 18/18), **Aezrah** (Sacerdotisa Sanadora) y **Melissah** (Bruja DPS), con control táctico in-game (`.escuadron postura defensiva/ofensiva/pasiva`), chat real en la ventana de grupo y auxilio dinámico ante caídas de vida crítica.

---

## 4. Economía del Reino & Sistema de Divisas

### ¿Qué divisas existen en el servidor y para qué sirven?
Project Jaina cuenta con 3 divisas especiales estructuradas para garantizar un ecosistema **Zero Pay-to-Win**:
1. **Token de Jaina (Item 900100):** Micro-moneda soberana 1:1. Al hacerle clic derecho dentro del juego, se consume y acredita atómicamente **+1 Punto de Donación (PD)** en tu cuenta web. También se usa como divisa en el AddOn de tienda in-game (`ProjectJaina_Store`) para comprar monturas, bolsas y mascotas.
2. **Ficha de Jaina (Item 900200):** WoW Token Oficial. Al consumirse otorga **+100 PD** a tu cuenta web. Es 100% comerciable entre jugadores en mano o en la Casa de Subastas por oro del juego, permitiendo que jugadores free-to-play adquieran membresías VIP o cosméticos jugando.
3. **Ficha de Evento (Item 910000):** Moneda puramente cosmética. Se utiliza en la **Tienda Visual 3D (comando `/alas`)** para desbloquear 17 modelos de alas celestiales/demoníacas y auras con bonus de 3 días.
4. **Moneda de Oro:** Moneda base del juego para instrucción de hechizos, rutas de vuelo, reparaciones y comercio.

### ¿Cómo se consigue la Ficha de Evento (910000)?
Existen 4 formas de obtenerla:
1. **Regalo de Minuto Cero (100% Gratis):** Cada nuevo personaje recibe automáticamente **5 Fichas de Evento** en su inventario al entrar por primera vez al mundo (junto con 5 Tokens de Jaina, 10 de oro y 4 mochilas de 16 casillas). Con esas 5 fichas puedes comprar tus primeras alas de inmediato.
2. **Canje In-Game con Tokens de Jaina:** En la tienda integrada in-game puedes canjear Tokens de Jaina por paquetes de Fichas de Evento (200 Tokens &rarr; 10 Fichas, 800 Tokens &rarr; 50 Fichas, 1,500 Tokens &rarr; 100 Fichas).
3. **Packs del Portal Web:** Paquetes de apoyo comunitario (como el Pack de Bienvenida o la Membresía Kirin Tor) incluyen entre 10 y 50 Fichas de Evento como valor agregado.
4. **Eventos Mundiales:** Recompensas enviadas por correo por el Gobernador de Lore tras superar eventos del reino.

### ¿Cómo funciona la Casa de Subastas si hay pocos jugadores conectados?
El servidor integra el **Motor de Subastas Vivas (`95_AuctionHouse_Economy_Engine.lua`)**:
- Las casas de subasta cuentan con más de 1,200 materiales canónicos precargados en un mercado unificado cross-faction.
- Si publicas tus materiales recolectados (menas, hierbas, telas, elixires), un **Agente Comprador Autónomo** evalúa tu subasta tras 45 segundos y tiene un **80% de probabilidad de comprarla** al precio justo de mercado.
- El oro se te entrega en tu buzón por correo oficial de la casa de subastas con la comisión oficial del 5% ya retenida. ¡Tus horas de farmeo siempre tienen recompensa!

---

## 5. Audio Espacial 3D y Chat de Voz

### ¿Cómo funciona la Voz Espacial 3D?
Project Jaina cuenta con un motor de audio binaural posicional en tiempo real:
1. En el juego, escribe `/voz` para generar un PIN de emparejamiento efímero de un solo uso.
2. Ingresa a la sección de [Voz 3D](https://darckrovert.github.io/ProjectJaina_Web/voz/) en tu navegador.
3. Elige tu nodo de servidor preferido (**Perú** o **España**) con soporte cifrado HTTPS/WSS (certificados Multi-SAN SSL que autorizan la captura de micrófono sin advertencias).
4. Introduce tu PIN y pulsa **Conectar**.
5. Escucharás a los jugadores cercanos con posicionamiento binaural 3D (HRTF) según su distancia y orientación en el mundo de juego.

### ¿Qué es la Fonoteca Arcana & Radio Kirin Tor FM del Portal Web?
El portal oficial integra el estudio acústico **Kirin Tor Arcane Sonic Studio (v7.1)** accesible desde el botón superior **Fonoteca & Lo-Fi** en cualquier página (incluyendo esta Wiki) o en la cabina dedicada [Kirin Tor FM](https://darckrovert.github.io/ProjectJaina_Web/radio/):
- **15 canales verificados en 3 suites:** *Lo-Fi & Estudio* (5 streams relajantes), *Sinfonías de Azeroth* (5 temas orquestales de Theramore, Ventormenta, Orgrimmar, Dalaran e ICC) y *Kirin Tor FM En Vivo* (5 emisoras continuas).
- **Exclusión Mutua Inteligente (Sonic Mutex):** Si abres varias pestañas del portal, la música nunca se duplica ni se mezcla; al reproducir en una pestaña las demás se silencian automáticamente, mientras que el cliente de **Voz 3D** aplica *Auto-Ducking* suave al 18% cuando alguien habla cerca de ti.

### ¿Qué son la Base de Datos AoWoW, la Armería Tier 2 y el Modo Sandbox de Cuenta?
- **Base de Datos Soberana AoWoW ([database.html](https://darckrovert.github.io/ProjectJaina_Web/database.html)):** Explorador indexado con 8 pestañas (Armas, Armaduras, Monturas, Criaturas, Misiones, Zonas, Pase de Batalla y los 6 Baluartes Soberanos), filtros de rareza e Inspector Soberano con fichas completas y comandos.
- **Armería Soberana ([armeria.html](https://darckrovert.github.io/ProjectJaina_Web/armeria.html)):** Censo en tiempo real Alianza/Horda e inspección Paperdoll de 19 ranuras con enlaces directos compartibles (`?inspect=Nombre`).
- **Modo Sandbox en Mi Cuenta ([cuenta.html](https://darckrovert.github.io/ProjectJaina_Web/cuenta.html)):** Te permite probar y recorrer una vista interactiva de demostración del panel de cuenta e inventario incluso sin iniciar sesión o durante mantenimientos.

### ¿Qué es el Gestor de Bots con IA (/bots o /chatter)?
Es la interfaz conversacional integrada (`Chatter_Companion` + `ProjectJaina_MultiBot`) conectada al motor neuronal `mod-llm-chatter`. Permite dialogar en lenguaje natural con tus compañeros IA por grupo o susurro, configurar su personalidad narrativa y emitir órdenes tácticas rápidas (`/mbot`, `/pjc`, `/chatter`).

### ¿Cómo organiza automáticamente las bolsas e inventario el AddOn Dragonflight UI?
En la esquina superior derecha de tu mochila principal (o de la ventana del banco / banco de hermandad), verás un botón elegante con icono de escoba mágica (`INV_Pet_Broom`) y orfebrería de Dalaran. Al hacer clic, el ordenador inteligente clasifica tus objetos por categoría (armas, armaduras, consumibles, materiales de profesión, gemas y misceláneos), consolidando acumulaciones incompletas al instante.

### ¿Cómo protege el servidor la integridad de la red ante escaneos de internet?
El puerto de juego (8085) está protegido perimetralmente contra sondas externas o crawlers de internet (como Shodan o peticiones HTTPS/TLS no solicitadas). Si un bot externo intenta enviar encabezados TLS ClientHello o paquetes malformados, el subsistema de red `WorldSocket::ReadHeaderHandler` los detecta, aborta la conexión TCP inmediatamente con `CloseSocket()` y previene cualquier saturación de recursos sin afectar la fluidez del juego de los usuarios reales.

### ¿Qué ocurre si un personaje sube de nivel mientras está en cola para un Campo de Batalla?
Para salvaguardar el balance competitivo y evitar abusos de nivel en brackets PvP (por ejemplo, estar en el bracket 20-29 con nivel 30), el motor `BattleGroundHandler` verifica tu nivel en el momento exacto en que la cola se completa. Si superas el límite del bracket (`level > maxlevel`), el servidor cancela la invitación de forma segura y te retira de la cola, invitándote a anotarte en el nuevo bracket correspondiente a tu nivel.

---

### ¿Por qué los bots de Project JAIna son muy superiores en 1v1 y PvP a los bots de otros servidores privados?
En servidores privados tradicionales de WotLK con IA básica (como los vistos en videos populares donde duelan 1v1 contra cada clase), los bots sufren de 4 fallas críticas:
1. **Se quedan estáticos ante Stuns y CC (Loss of Control):** Se sientan durante 6 segundos enteros en Porrazo, Golpe bajo o Miedo sin tirar Abalorio ni raciales.
2. **No coordinan Ventanas de Burst:** Atacan de forma plana y secuencial sin sincronizar stuns con cooldowns mayores.
3. **No Reflejan ni Absorben Hechizos:** Permiten que el jugador les castee hechizos destructivos en la cara.
4. **Reacción Lenta:** Evalúan decisiones cada 2 segundos.

En **Project JAIna**, los bots operan bajo el **Motor Apex Gladiator 1v1 (`91_SuperBots_TacticalOverdrive.lua`)**:
- **Reacción Sub-segundo (400ms):** Tiempos de respuesta de rango gladiador R1 profesional.
- **Ruptura Reactiva de CC (Anti-Loss-of-Control):** Rompen stuns, raíces y miedos de inmediato usando el Abalorio PvP universal, raciales (*Sálvese quien pueda*, *Voluntad de los Renegados*) y defensivos de clase (*Traslación*, *Entereza ligada al hielo*, *Ira rabiosa*, *Mano de libertad*, *Piel de corteza*, *Bloque de hielo*).
- **Reflejo Predictivo y Derivación:** Interceptan en tiempo real cualquier casteo hostil proyectil (Guerrero activa *Reflejo de hechizos*, Chamán planta *Tótem derribador*, Pícaro/DK activan *Capa de las sombras* / *Caparazón antimagia*).
- **Apilamiento de Burst Ofensivo:** Encadenan stuns con cooldowns de daño letal (Alas de Paladín + Martillo de cólera, Filotormenta de Guerrero, Danza de las Sombras de Pícaro, Congelación profunda + Venas heladas de Mago, Gárgola de Caballero de la Muerte, etc.).
- **Inmunidad a Desecación de Maná/Energía:** Cuentan con un watchdog de combate que mantiene sus recursos altos para sostener rotaciones letales completas.

---

## 6. Comunidad y Soporte Oficial

### ¿Dónde puedo recibir ayuda directa o unirme a la comunidad?
Únete al **Discord Oficial de Project Jaina** a través de la invitación permanente universal:  
👉 [https://discord.gg/cXxMuRJrfy](https://discord.gg/cXxMuRJrfy)

En el servidor de Discord cuentas con:
- **`#🌐┃estado-de-reinos`**: Telemetría en tiempo real, latencias y avisos del clúster despachados por el Centinela.
- **`#🎫┃soporte-y-tickets`**: Atención técnica personalizada y resolución de incidencias.
- **Comandos de Barra Diagonal (`/estado`, `/soporte`, `/descargas`, `/reglas`, `/ping`)**: Operados por el bot oficial verificado **Proyecto Jaina Sentinel** (`1563652716859887807`).

---

## 7. Progresión Autónoma de Eras & Calendario Oficial (2026–2028)

### ¿Project JAIna es un reino progresivo? ¿Cómo funcionan los cambios de expansión?
¡Sí! El Reino Oficial (**Project Jaina — Puerto 8085**) opera bajo el motor autónomo **Chrono-Master v2.0**. Todos los jugadores y Playerbots progresan juntos desde **Classic Vanilla (Nivel 60)** hasta **Wrath of the Lich King (Nivel 80)** y el horizonte **Cataclysm**, **sin borrar jamás tus personajes, logros, monturas ni coleccionables**.

Cuando el reloj del servidor alcanza las `00:00 (UTC-5)` de la fecha de transición de una nueva era:
1. El gobernador actualiza automáticamente el nivel máximo (`MaxPlayerLevel`), desbloquea los continentes/bandas correspondientes (Portal Oscuro hacia Terrallende, barcos y zepelines hacia Rasganorte, bandas por Tier) y habilita las nuevas cotas de profesiones e idiomas/clases correspondientes (como el Caballero de la Muerte e Inscripción al iniciar WotLK).
2. El núcleo C++ (`PlayerbotFactory`) ajusta automáticamente el tope de los árboles de talentos de todos los bots (**31 puntos** en Classic 60, **41 puntos** en TBC 70 y **51 puntos** en WotLK 80), garantizando un balance PvP y PvE 100% fiel a cada expansión.

### ¿Cuánto dura cada era? ¿Cuál es el Calendario Oficial 2026–2028?
Puedes consultar el cronograma interactivo en vivo en la portada del [Portal Oficial](https://darckrovert.github.io/ProjectJaina_Web/#progresion) y en esta tabla de referencia (`UTC-5`):

| Fase | Era / Contenido Desbloqueado | Nivel Máx. | Inicio (`00:00 UTC-5`) | Fin | Duración |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Fase 1** | **Classic Vanilla** *(MC, Onyxia, BWL, ZG, AQ20/40)* | **60** | 24 Nov 2026 | 01 Mar 2027 | **97 días** |
| **Fase 2** | **The Burning Crusade** *(Karazhan, Gruul, SSC, TK, BT, Meseta)* | **70** | 01 Mar 2027 | 01 Jun 2027 | **92 días** |
| **Fase 3** | **WotLK — Naxxramas, Sagrario Obsidiana & Ojo de la Eternidad (T7)** | **80** | 01 Jun 2027 | 01 Ago 2027 | **61 días** |
| **Fase 4** | **WotLK — Secretos de Ulduar (T8)** | **80** | 01 Ago 2027 | 01 Oct 2027 | **61 días** |
| **Fase 5** | **WotLK — Prueba del Cruzado & Guarida de Onyxia 80 (T9)** | **80** | 01 Oct 2027 | 15 Nov 2027 | **45 días** |
| **Fase 6** | **WotLK — Ciudadela de la Corona de Hielo (ICC — T10)** | **80** | 15 Nov 2027 | 15 Feb 2028 | **92 días** |
| **Fase 7** | **WotLK — El Sagrario Rubí: Halion (T10.5)** | **80** | 15 Feb 2028 | 01 Abr 2028 | **46 días** |
| **Fase 8** | **Horizonte Cataclysm** *(Expansión de Mundo 80–85)* | **85** | 01 Abr 2028 | *Abierto* | **Permanente** |

---

© 2026 **DarckRovert (Elnazzareno)** & **Antigravity (Mythos 5)** — Project JAIna (Portal v7.1.0 — Hito #270)
