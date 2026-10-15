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
Dispones de dos vías de conexión oficiales:
1. **Servidor Principal (Malla Radmin VPN — Recomendado para Clúster y Audio 3D):**
   ```text
   set realmlist 26.140.157.205
   ```
   * *Red Radmin:* `Project_Jaina`
   * *Contraseña:* `thedarck1993`
2. **Servidor Público Global (Túnel Anycast — Sin VPN):**
   ```text
   set realmlist ambulance-arxiv.tun.ply.gg:49390
   ```

### ¿Cómo descargo y juego en el Servidor Principal con Radmin VPN?
1. **Descarga Radmin VPN:** Descárgalo gratis desde [radmin-vpn.com](https://www.radmin-vpn.com/es/).
2. **Únete a la Red:** Abre Radmin VPN, haz clic en el botón de encendido y selecciona *Red ➔ Unirse a una red existente*:
   * **Nombre:** `Project_Jaina`
   * **Contraseña:** `thedarck1993`
3. **Crea tu cuenta:** Regístrate en la sección [Crear Cuenta](https://darckrovert.github.io/ProjectJaina_Web/registro.html) del portal oficial.
4. **Configura tu Realmlist:** Abre `Data\esES\realmlist.wtf` con el Bloc de Notas y escribe `set realmlist 26.140.157.205` (o usa el Lanzador Oficial en 1 clic).
5. **Abre Wow.exe y juega:** Ingresa con tu usuario y contraseña. Para habilitar el chat de voz por micrófono en el juego, ingresa desde tu navegador a `https://26.140.157.205:3050` una sola vez y escribe `/voz` in-game.


### ¿Cómo se instalan los AddOns oficiales?
El cliente oficial ya viene preconfigurado con la suite de 18 AddOns de Project JAIna en `Interface\AddOns\`. Si deseas actualizarlos manualmente:
1. Descarga el archivo de lanzamiento desde el repositorio GitHub correspondiente.
2. Descomprímelo asegurándote de que la carpeta quede en `Interface\AddOns\ProjectJaina_<NombreAddon>`.
3. En la pantalla de selección de personajes, activa la casilla **"Cargar accesorios desactualizados"**.

---

## 3. Modos de Juego y Características

### ¿Qué modos de juego están disponibles?
Al crear un personaje nuevo, podrás elegir entre:
- **Normal:** La experiencia clásica de WotLK con balance y calidad de vida moderna.
- **Hardcore:** Muerte permanente de personaje (1 sola vida).
- **Ironman:** Sin reliquias, sin subasta, sin comercio, equipando únicamente objetos blancos/grises.

---

## 4. Audio Espacial 3D y Chat de Voz

### ¿Cómo funciona la Voz Espacial 3D?
Project Jaina cuenta con un motor de audio binaural posicional en tiempo real:
1. En el juego, escribe `/voz` para generar un PIN de emparejamiento efímero de un solo uso.
2. Ingresa a la sección de [Voz 3D](https://darckrovert.github.io/ProjectJaina_Web/voz/) en tu navegador.
3. Introduce tu PIN y pulsa **Conectar**.
4. Escucharás a los jugadores cercanos con posicionamiento binaural 3D (HRTF) según su distancia y orientación en el mundo de juego.

### ¿Qué es el Gestor de Bots con IA (/bots o /chatter)?
Es la interfaz del addon `Chatter_Companion`, que conecta tus diálogos con los Playerbots y el motor de inferencia neuronal local (LM Studio). Puedes dar órdenes tácticas, solicitar buffs por clase, invitar a compañeros de aventura o debatir sobre el lore de Azeroth en lenguaje natural.

---
© 2026 **DarckRovert (Elnazzareno)** & **Antigravity (Mythos 5)** — Project JAIna
