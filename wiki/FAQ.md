# FAQ — Preguntas Frecuentes

## General

### ¿Qué es El Séquito?
Es la hermandad de élite más disciplinada y tecnológicamente avanzada de **WoW Perú (Reino Andino - WotLK 3.3.5a)**, fundada y liderada por **Elnazzareno** (Gnomo Brujo). Operamos bajo una filosofía de disciplina táctica, preparación rigurosa y uso intensivo de herramientas personalizadas de combate.

### ¿A qué servidor pertenecemos?
Jugamos en **WoW Perú — Reino Andino**, servidor oficial de World of Warcraft en la expansión Wrath of the Lich King (3.3.5a Build 12340).

### ¿Puedo usar los addons si no pertenezco a la hermandad?
Sí. Todos los addons del ecosistema son proyectos de código abierto (**Open Source**) bajo licencia **MIT** desarrollados por DarckRovert y el equipo de WoW Perú. Puedes descargarlos y utilizarlos libremente en tus personajes.

---

## Conexión e Instalación

### ¿Cuál es el realmlist de WoW Perú?
Para conectar tu cliente 3.3.5a al servidor, abre tu archivo `Data\esES\realmlist.wtf` (o `Data\enUS\realmlist.wtf`) con Bloc de Notas y configura:
```text
set realmlist logon.wow-peru.lat
```

### ¿Cómo instalo los addons del Séquito?
1. Descarga el archivo ZIP de cada repositorio oficial desde GitHub o clónalo con Git.
2. Extrae la carpeta de cada addon dentro de:
   `World of Warcraft\Interface\AddOns\`
3. Verifica que la carpeta quede en primer nivel (ej: `Interface\AddOns\WoWPeru_RaidSuite\WoWPeru_RaidSuite.toc`).
4. En la pantalla de personajes, haz clic en **Accesorios** y marca la casilla **"Cargar accesorios desactualizados"**.

### ¿Qué comando abre el Dashboard central de combate?
Usa `/sdash` o `/raidsuite`. También puedes hacer clic sobre la esfera flotante en pantalla.

### ¿Cuáles son los comandos más utilizados?
- `/sdash`: Dashboard central (Resumen de grupo, rotación, logros, botín).
- `/srot`: HUD reactivo flotante con alertas de PROCS en verde esmeralda.
- `/sloot`: Panel del Concilio de Botín (Loot Council) para bandas.
- `/sinspect`: Inspector asíncrono de talentos, GearScore real y encantamientos.
- `/swipe`: Autopsia del último wipe (daño, muertes y cortes fallados).
- `/bp`: Ventana del Pase de Batalla estacional.
- `/companion`: Estado de addons y modo de juego de los miembros del grupo.

---

## Técnico & Rendimiento

### ¿Los addons reducen los FPS en computadoras antiguas?
No. Todo el ecosistema ha sido optimizado bajo el estándar de **cabinas de internet peruanas** (CPUs Dual-Core, gráficos integrados Intel HD). Los addons operan en Lua 5.1 puro, utilizan tickers espaciados y pools de ranuras reciclables en memoria (`Zero Heap Thrashing`), garantizando 60 FPS estables.

### He encontrado un bug o error en un addon o en la web.
Por favor, abre un reporte en el repositorio correspondiente de GitHub o en nuestro canal `#soporte` en Discord.

---
© 2026 **DarckRovert (Elnazzareno)** — El Séquito | WoW Perú (Reino Andino)
