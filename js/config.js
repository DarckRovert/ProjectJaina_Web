/**
 * Project Jaina — Configuración Global del Portal Web Oficial (GitHub Pages)
 * Sistema de Resolución y Conmutación Resiliente de Endpoints REST
 * Estándar Staff L9: Prevención de Mixed-Content, Detección de Protocolo y Fallbacks
 */

const CONFIG = {
    LOCAL_API: "http://127.0.0.1:8080",
    PUBLIC_TUNNEL_API: "https://ingrainedly-easeled-edelmira.ngrok-free.dev",

    KNOWN_ENDPOINTS: [
        { id: "tunnel", name: "Servidor Oficial Anycast/HTTPS", url: "https://ingrainedly-easeled-edelmira.ngrok-free.dev", secure: true },
        { id: "radmin", name: "Servidor Radmin VPN (Malla)", url: "http://26.140.157.205:8080", secure: false },
        { id: "local",  name: "Servidor Local (Sandbox)", url: "http://127.0.0.1:8080", secure: false }
    ],

    PAYPAL_CLIENT_ID: "sb",

    getApiUrl: function() {
        const proto = window.location.protocol;
        const host = window.location.hostname;
        const isHttps = (proto === "https:");

        // 1. Override explícito por Query Param (?api=https://...)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const queryApi = urlParams.get("api");
            if (queryApi) {
                const clean = queryApi.replace(/\/+$/, "");
                // Prevenir Mixed Content: Si la página es HTTPS, no permitir API HTTP
                if (isHttps && clean.startsWith("http://") && !clean.includes("localhost") && !clean.includes("127.0.0.1")) {
                    console.warn("[ProjectJaina Config] Ignorando API HTTP insegura en página HTTPS para prevenir bloqueo Mixed Content.");
                } else {
                    localStorage.setItem("projectjaina_api_url", clean);
                    return clean;
                }
            }
        } catch (_) {}

        // 2. Override explícito en LocalStorage
        try {
            const saved = localStorage.getItem("projectjaina_api_url");
            if (saved) {
                const cleanSaved = saved.replace(/\/+$/, "");
                if (isHttps && cleanSaved.startsWith("http://") && !cleanSaved.includes("localhost") && !cleanSaved.includes("127.0.0.1")) {
                    console.warn("[ProjectJaina Config] Descartando API HTTP de LocalStorage por estar en origen HTTPS.");
                    localStorage.removeItem("projectjaina_api_url");
                } else {
                    return cleanSaved;
                }
            }
        } catch (_) {}

        // 3. Entorno local (Archivo local, Loopback)
        if (proto === "file:" || host === "localhost" || host === "127.0.0.1" || host === "") {
            return this.LOCAL_API;
        }

        // 4. Red Privada Local / Radmin VPN en HTTP puro
        if (!isHttps && (host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("26.") || host.startsWith("172."))) {
            return `http://${host}:8080`;
        }

        // 5. GitHub Pages u Origen Público HTTPS obligatorio
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
