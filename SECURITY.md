# 🛡️ Política de Seguridad — Project JAIna Web

Este documento describe la política de seguridad y las salvaguardas criptográficas/cliente del portal oficial de **Project JAIna (WotLK 3.3.5a — Portal v7.4.5)**.

## 1. Versiones Soportadas

Actualmente se proporciona soporte activo de seguridad para las siguientes versiones del portal:

| Versión | Estado de Soporte |
| :--- | :--- |
| **7.4.x (Actual — v7.4.5 / Hito #382)** | ✅ Soporte Activo Completo |
| **7.0.x – 7.3.x** | ✅ Parches Críticos |
| **< 7.0** | ❌ Obsoleta |

## 2. Salvaguardas Arquitectónicas (v7.4.5)

1. **Autenticación SRP6 Zero-Plaintext & Sesiones HMAC-SHA256 (RFC 5054):** Las credenciales de registro y cambio de contraseña se procesan bajo protocolo criptográfico SRP6 (`salt` + `verifier`) hacia `acore_auth.account` con tokens de sesión HMAC-SHA256 (`getAuthHeaders()` en `js/auth.js`) y `verify_admin_token_with` fail-closed en rutas administrativas.
2. **Saneamiento Anti-XSS en Diálogos y Renderizadores (`navbar.js`, `armory.js`, `store.js`, `jaina_dialogue.js`):** Escape estricto de entidades HTML (`&`, `<`, `>`, `"`, `'`) en toasts/modales, tarjetas de Armería (`escapeArmoryHtml`) y comprobantes de Tienda (`_escapeStoreHtml`) antes de insertar en el DOM.
3. **Cero Exposición de IPs Residenciales:** Ningún script frontend contiene direcciones IP públicas residenciales cableadas; toda resolución pasa por `js/config.js` y túneles Anycast/HTTPS autorizados con `AbortController` acotado (4.5s).
4. **Aislamiento de Ítems Personalizados (`entry >= 900000`):** Tanto `js/database.js` como `js/cuenta.js` bloquean peticiones externas hacia APIs de terceros (Wowhead) para identificadores propietarios del servidor, evitando fugas de telemetría y errores HTTP 404.

## 3. Reporte Responsable de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en el portal o en sus endpoints asociados:
- **No abras un Issue público** con detalles de explotación.
- Envía el reporte directamente a la administración en el canal `#🎫┃soporte-y-tickets` del [Discord Oficial de Project Jaina](https://discord.gg/cXxMuRJrfy) o contacta a **DarckRovert**.
