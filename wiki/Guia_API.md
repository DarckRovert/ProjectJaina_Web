# 🔌 Guía de API y Módulos JavaScript — Project Jaina Web

Documentación técnica de los módulos JavaScript del cliente que alimentan el portal de **Project Jaina**.

---

## 1. Módulos del Cliente

### `js/config.js` — Fuente Única de Verdad (SSOT) de Red
Gestiona la resolución dinámica de endpoints según el origen desde donde navegue el usuario:
- **Local / Sandbox**: `http://127.0.0.1:8080`
- **Radmin VPN**: `http://26.140.157.205:8080`
- **Producción / Web Pública**: Túnel seguro o endpoint de backend configurable (`CONFIG.getApiUrl()`).

### `js/register.js` — Registro Autoritativo SRP6
Maneja la captura, validación previa en cliente y envío asíncrono (`fetch POST`) hacia `/api/register`:
- Longitud mínima de credenciales (3-16 caracteres de usuario, mínimo 4 en contraseña).
- Confirmación de contraseña y feedback visual mediante toasts no bloqueantes.
- Creación autoritativa en `auth.account` de AzerothCore.

### `js/store.js` — Catálogo Visual de Tienda & Donaciones
- Renderizado de artículos cosméticos (monturas, transfiguraciones, auras y títulos).
- Integración con pasarela PayPal / Donaciones y asignación automática por SOAP o comando de servidor.

### `js/armory.js` — Inspección de Héroes y Estadísticas
- Búsqueda y filtrado de personajes en la base de datos `characters`.
- Visualización de GearScore, talentos, logros y estadísticas de combate.

---

## 2. Endpoints del Micro-Backend (`ProjectJaina_WebAPI.py`)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Devuelve estado del reino (online/offline), uptime y jugadores conectados. |
| `POST` | `/api/register` | Crea una cuenta en la base de datos `auth` utilizando SRP6 salt y verifier. |
| `GET` | `/api/armory/characters` | Lista de personajes activos para la armería pública. |
| `GET` | `/api/store/catalog` | Catálogo de recompensas y canjes disponibles. |
