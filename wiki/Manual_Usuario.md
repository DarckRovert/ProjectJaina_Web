# Manual de Usuario — Portal & Ecosistema Sequito

Bienvenido al centro de mando digital de **El Séquito** en **WoW Perú (Reino Andino - WotLK 3.3.5a)**. Este manual describe cómo instalar, configurar y operar las herramientas oficiales de la hermandad.

---

## 1. Conexión al Servidor (WoW Perú 3.3.5a)

1. Asegúrate de tener instalado el cliente **World of Warcraft: Wrath of the Lich King (3.3.5a Build 12340)**.
2. Abre el archivo de configuración de reino ubicado en:
   - `Data\esES\realmlist.wtf` (Cliente en español)
   - `Data\enUS\realmlist.wtf` (Cliente en inglés)
3. Modifica la primera línea para que quede exactamente así:
   ```text
   set realmlist logon.wow-peru.lat
   ```
4. Guarda el archivo y ejecuta `Wow.exe`.

---

## 2. Los 5 Componentes del Ecosistema

### 1. Sequito RaidSuite (`WoWPeru_RaidSuite`)
La plataforma táctica de combate que unifica las 30 especializaciones del juego:
- **Macro Universal `SeqRot`:** Crea automáticamente una macro inteligente con modificadores (`Shift`, `Ctrl`, `Alt`, `@mouseover`) que se adapta según tus talentos activos y dual spec.
- **Dashboard Central (`/sdash`):** Vista panorámica del grupo, logros internos de hermandad y galería de botín.
- **HUD de Rotación (`/srot`):** Barra flotante que resalta procs clave en verde esmeralda (`Buena racha`, `Arte de la guerra`, `Oleada de sangre`, `Escarcha blanca`, `Diezmar`, `Eclipses`).
- **Loot Council (`/sloot`):** Gestión automatizada de reparto de ítems épicos con cola inteligente, desempate numérico e intercepción de `/azar 100`.
- **Análisis de Wipes (`/swipe`):** Descubre con exactitud matemática quién murió primero, qué daño recibió y qué cortes de casteo fallaron.

### 2. Pase de Batalla (`WoWPeru_BattlePass`)
- Progresión de 50 niveles con recompensas en la vía Gratuita y VIP.
- Accede con el comando `/bp` o haciendo clic en el icono del minimapa.
- Misiones diarias y semanales sincronizadas con los logros de RaidSuite.

### 3. Companion (`WoWPeru_Companion`)
- Telemetría social ultra-ligera (&lt; 100 KB RAM).
- Ejecuta `/companion` para ver qué miembros de tu grupo tienen los addons de WoW Perú instalados.
- Detecta automáticamente si juegas en modo **Hardcore** o **Ironman** con badge visual.
- Anuncia en el canal de grupo cuando un compañero sube de nivel en el Pase de Batalla.

### 4. GameModes (`WoWPeru_GameModes`)
- Selector cinematográfico en el primer ingreso de tu personaje.
- Permite seleccionar retos como **Hardcore (1 sola vida)** o **Ironman**.
- Bloqueo de seguridad con doble confirmación modal para evitar activaciones accidentales.

### 5. VisualShop (`WowPeruVisualShop`)
- Catálogo de cosméticos de alta gama: 18 modelos de alas, más de 40 auras combinadas y títulos de prestigio.
- Acceso rápido con `/tienda` y previsualización 3D en tiempo real sobre tu personaje.

---

## 3. Reclutamiento & Integración al Clan

Para formar parte de las expediciones de raid de **El Séquito**:
1. Únete a nuestro Discord oficial: [discord.gg/SfY8vfFWTC](https://discord.gg/SfY8vfFWTC).
2. Preséntate en el canal `#reclutamiento` con el nombre de tu personaje, clase y especialización.
3. Asegúrate de tener instalados **WoWPeru_RaidSuite** y **WoWPeru_Companion**.
4. Asiste a los eventos con equipo encantado, gemado y consumibles completos.

---
© 2026 **DarckRovert (Elnazzareno)** — El Séquito | WoW Perú (Reino Andino)
