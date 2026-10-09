/**
 * Project Jaina (projectjaina.com) — Configuración Global del Portal Web
 * Auto-detecta si el usuario navega desde archivo local (file://), localhost, Radmin VPN o GitHub Pages.
 */

const CONFIG = {
    // URL por defecto del Micro-Backend (ProjectJaina_WebAPI.py en puerto 8080)
    LOCAL_API: "http://127.0.0.1:8080",
    RADMIN_API: "http://26.140.157.205:8080",
    PUBLIC_TUNNEL_API: "https://ingrainedly-easeled-edelmira.ngrok-free.dev", // Endpoint HTTPS permanente de ngrok

    // Client ID de PayPal (Reemplaza con tu Client ID de PayPal Developer)
    // Para pruebas inmediatas en sandbox usa 'sb', para producción tu Client ID real.
    PAYPAL_CLIENT_ID: "sb", 

    // Obtener la URL activa según el origen
    getApiUrl: function() {
        const proto = window.location.protocol;
        const host = window.location.hostname;

        // Si se abre directamente desde el explorador de archivos (file:///) o localhost
        if (proto === "file:" || host === "localhost" || host === "127.0.0.1" || host === "") {
            return this.LOCAL_API;
        } else if (host === "26.140.157.205") {
            return this.RADMIN_API;
        }
        // Cuando se carga desde GitHub Pages (darckrovert.github.io)
        return this.PUBLIC_TUNNEL_API;
    }
};
