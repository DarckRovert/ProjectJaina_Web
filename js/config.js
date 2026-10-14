/**
 * Project Jaina — Configuración Global del Portal Web Oficial (GitHub Pages)
 * Sistema de Resolución y Conmutación Resiliente de Endpoints REST
 */

const CONFIG = {
    LOCAL_API: "http://127.0.0.1:8080",
    PUBLIC_TUNNEL_API: "https://ingrainedly-easeled-edelmira.ngrok-free.dev",

    KNOWN_ENDPOINTS: [
        { id: "tunnel", name: "Servidor Oficial (HTTPS)", url: "https://ingrainedly-easeled-edelmira.ngrok-free.dev" },
        { id: "local",  name: "Servidor Local (Sandbox)", url: "http://127.0.0.1:8080" }
    ],

    PAYPAL_CLIENT_ID: "sb",

    getApiUrl: function() {
        // 1. Override explícito por Query Param (?api=http://...)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const queryApi = urlParams.get("api");
            if (queryApi) {
                localStorage.setItem("projectjaina_api_url", queryApi.replace(/\/+$/, ""));
                return queryApi.replace(/\/+$/, "");
            }
        } catch (_) {}

        // 2. Override explícito en LocalStorage
        try {
            const saved = localStorage.getItem("projectjaina_api_url");
            if (saved) return saved.replace(/\/+$/, "");
        } catch (_) {}

        const proto = window.location.protocol;
        const host = window.location.hostname;

        // 3. Entorno local (Archivo, Loopback)
        if (proto === "file:" || host === "localhost" || host === "127.0.0.1" || host === "") {
            return this.LOCAL_API;
        }

        // 4. Subred de Red Privada
        if (host.startsWith("26.")) {
            return `http://${host}:8080`;
        }

        // 5. Red Privada Local (LAN: 192.168.x.x o 10.x.x.x)
        if (host.startsWith("192.168.") || host.startsWith("10.")) {
            return `http://${host}:8080`;
        }

        // 6. GitHub Pages u Origen Público
        return this.PUBLIC_TUNNEL_API.replace(/\/+$/, "");
    },

    setApiUrl: function(url) {
        if (!url) return;
        localStorage.setItem("projectjaina_api_url", url.replace(/\/+$/, ""));
        window.location.reload();
    },

    resetApiUrl: function() {
        localStorage.removeItem("projectjaina_api_url");
        window.location.reload();
    }
};
