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
El cliente oficial ya viene preconfigurado con la suite de 18 AddOns de Project JAIna en `Interface\AddOns\`. Si deseas actualizarlos manualmente:
1. Descarga el archivo de lanzamiento desde el repositorio GitHub correspondiente.
2. Descomprímelo asegurándote de que la carpeta quede en `Interface\AddOns\ProjectJaina_<NombreAddon>`.
3. En la pantalla de selección de personajes, activa la casilla **"Cargar accesorios desactualizados"**.

---

### ¿Qué reinos están disponibles en el juego?
El ecosistema cuenta con soporte multi-reino en clúster bi-regional:
- **Project Jaina (Reino 1):** El reino principal de Living Lore, economía balanceada y eventos mundiales.
- **WanitosGym (Reino 2):** Reino complementario de desafíos y contingencia.

### ¿Qué facciones puedo elegir al registrarme?
El sistema de registro y el lanzador oficial integran 3 facciones canónicas:
- **Alianza:** Los defensores de Theramore y Ventormenta.
- **Horda:** La fuerza de Orgrimmar y los Clanes de Durotar.
- **Kirin Tor (Dalaran):** Los magos arcanos de Dalaran guiados por el Ojo Violeta.

---

## 3. Modos de Juego y Características

### ¿Qué modos de juego están disponibles?
Al crear un personaje nuevo, podrás elegir entre:
- **Normal:** La experiencia clásica de WotLK con balance y calidad de vida moderna.
- **Hardcore:** Muerte permanente de personaje (1 sola vida).
- **Ironman:** Sin reliquias, sin subasta, sin comercio, equipando únicamente objetos blancos/grises.

### ¿Puedo hacer mazmorras o campos de batalla si juego en solitario?
¡Absolutamente! Project Jaina cuenta con dos sistemas integrados para jugadores solitarios:
1. **Despacho Instantáneo RDF y Matchmaking PvP (Hito #205):** Abre el Buscador de Mazmorras (`I`) y encola. El motor interceptará tu solicitud y auto-reclutará de inmediato los roles faltantes (1 Tanque, 1 Sanador y 3 DPS) sincronizados a tu nivel, aceptando la propuesta y teletransportando a todo el grupo con las recompensas oficiales de RDF. Además, puedes escribir `.rdf go` para viajar instantáneamente con tu escuadrón a la entrada de la mazmorra correspondiente a tu nivel. En PvP, los campos de batalla (Garganta Grito de Guerra, Cuenca de Arathi, Valle de Alterac) inician con umbrales optimizados (2v2 / 4v4) acelerados por el motor nativo.
2. **Escuadrón Élite de Compañeros IA (Hito #204):** Puedes invocar en cualquier momento al escuadrón canónico escribiendo `.escuadron convocar` (o `.party ia convocar`). Se unirán **Silka** (Paladín Tanque), **Rogotten** (Paladín DPS), **Aezrah** (Sacerdotisa Sanadora) y **Melissah** (Bruja DPS), con control táctico in-game (`.escuadron postura defensiva/ofensiva/pasiva`), chat real en la ventana de grupo y auxilio dinámico ante caídas de vida crítica.

---

## 4. Audio Espacial 3D y Chat de Voz

### ¿Cómo funciona la Voz Espacial 3D?
Project Jaina cuenta con un motor de audio binaural posicional en tiempo real:
1. En el juego, escribe `/voz` para generar un PIN de emparejamiento efímero de un solo uso.
2. Ingresa a la sección de [Voz 3D](https://darckrovert.github.io/ProjectJaina_Web/voz/) en tu navegador.
3. Elige tu nodo de servidor preferido (**Perú** o **España**) con soporte cifrado HTTPS/WSS (certificados Multi-SAN SSL que autorizan la captura de micrófono sin advertencias).
4. Introduce tu PIN y pulsa **Conectar**.
5. Escucharás a los jugadores cercanos con posicionamiento binaural 3D (HRTF) según su distancia y orientación en el mundo de juego.

### ¿Qué es el Gestor de Bots con IA (/bots o /chatter)?
Es la interfaz del addon `Chatter_Companion`, que conecta tus diálogos con los Playerbots y el motor de inferencia neuronal local (LM Studio). Puedes dar órdenes tácticas, solicitar buffs por clase, invitar a compañeros de aventura o debatir sobre el lore de Azeroth en lenguaje natural.

---
© 2026 **DarckRovert (Elnazzareno)** & **Antigravity (Mythos 5)** — Project JAIna

