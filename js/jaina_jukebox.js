/**
 * ==============================================================================
 * Project JAIna — ArcaneSonicEngine v6.1 («Kirin Tor Arcane Sonic Studio»)
 * Singleton Maestro de Audio: 15 Canales Verificados (6 Creadores YT + 6 Radios 24/7 + 3 Biomas 3D)
 * Garantías L9:
 *   1. Mutex Matemático Intra-Página & Inter-Pestaña (BroadcastChannel + storage fallback)
 *   2. Dual-Stage Resilient Stream Loader (Stage 1 CORS + Real 64-Band FFT -> Stage 2 Hardware Direct)
 *   3. Sincronización Bidireccional con IFrame YouTube y Tráiler Cinemático WotLK
 *   4. Slide-Over Fonoteca Drawer Universal (z:9500) + Pro Studio Floating Dock (z:9000)
 * ==============================================================================
 */

class ArcaneSonicEngine {
    constructor() {
        const path = (window.location.pathname || "").replace(/\\/g, "/");
        this.rootPrefix = /\/(wiki|radio|voz)\//i.test(path) ? "../" : "";
        this.tabId = "pj_sonic_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

        this.tracks = [
            // =================================================================
            // PESTAÑA 1: CREADORES & WOW LO-FI (6 Pistas On-Demand · Seek mm:ss)
            // =================================================================
            {
                id: "l0fCvz8dOtA",
                title: "Peacebloom Burn Slow",
                artist: "Barrens Boys (feat. Toro Loco)",
                genre: "Chill / Lo-Fi Hip-Hop · Baldíos & Mulgore",
                category: "creators",
                type: "youtube",
                channelUrl: "https://www.youtube.com/@barrensboys",
                channelLabel: "Apoyar a @barrensboys en YouTube",
                cover: "images/peacebloom_lofi_cover.jpg",
                badge: "🔥 HIMNO COMUNIDAD",
                description: "Vibras relajadas de Los Baldíos y Mulgore con líricas nostálgicas de World of Warcraft, Druidas y Peacebloom."
            },
            {
                id: "1yY3Xseids0",
                title: "Gurubashi Arena With The Boys",
                artist: "Barrens Boys",
                genre: "Stranglethorn Groove & PvP Storytelling",
                category: "creators",
                type: "youtube",
                channelUrl: "https://www.youtube.com/@barrensboys",
                channelLabel: "Apoyar a @barrensboys en YouTube",
                cover: "images/creators_tavern_welcome.jpg",
                badge: "⚔️ ARENA GURUBASHI",
                description: "Crónica musical del caos en la Arena Gurubashi de Vega de Tuercespina junto a la hermandad."
            },
            {
                id: "V5OvVRMELI8",
                title: "Your Buddy Rolled Druid Forever",
                artist: "Barrens Boys",
                genre: "Acoustic Tavern Folk & Classic Nostalgia",
                category: "creators",
                type: "youtube",
                channelUrl: "https://www.youtube.com/@barrensboys",
                channelLabel: "Apoyar a @barrensboys en YouTube",
                cover: "images/guild_outposts_epic.jpg",
                badge: "🐾 CLÁSICO DRUIDA",
                description: "Homenaje acústico a ese compañero inseparable de aventuras que eligió Druida desde el primer día en Azeroth."
            },
            {
                id: "-uxi6_5cFqw",
                title: "WoW Lo-Fi Beats To Chill To",
                artist: "World of Warcraft Official",
                genre: "Official Blizzard Lo-Fi · Tavern & Study",
                category: "creators",
                type: "youtube",
                channelUrl: "https://www.youtube.com/@Warcraft",
                channelLabel: "Canal Oficial @Warcraft",
                cover: "images/jaina_living_lore.jpg",
                badge: "🍂 OFICIAL WARCRAFT",
                description: "Mezcla oficial Lo-Fi de World of Warcraft ideal para profesiones, lectura de lore, subastas y farmeo relajado."
            },
            {
                id: "4NRPEe7YnCQ",
                title: "WoW Synthwave Beats To Chill To",
                artist: "World of Warcraft Official",
                genre: "Arcane Outland & Dalaran Synthwave",
                category: "creators",
                type: "youtube",
                channelUrl: "https://www.youtube.com/@Warcraft",
                channelLabel: "Canal Oficial @Warcraft",
                cover: "images/jaina_arcane_sanctum.jpg",
                badge: "🌌 SYNTHWAVE OFICIAL",
                description: "Remezcla oficial retro-arcana con sintetizadores analógicos inspirados en Terrallende, Tormenta Abisal y Dalaran."
            },
            {
                id: "pWTSK5waNs8",
                title: "Grizzly Hills — Nyckelharpa & Forest",
                artist: "Wrath of the Lich King OST",
                genre: "Nordic Nyckelharpa · Colinas Pardas",
                category: "creators",
                type: "youtube",
                channelUrl: "https://www.youtube.com/watch?v=pWTSK5waNs8",
                channelLabel: "Ver Ambiente Completo en YouTube",
                cover: "images/armory_champions_epic.jpg",
                badge: "🌲 COLINAS PARDAS",
                description: "La legendaria nyckelharpa acústica y los bosques boreales de Rasganorte: la pieza más querida de WotLK 3.3.5a."
            },

            // =================================================================
            // PESTAÑA 2: EMISORAS KIRIN TOR 24/7 (6 Streams HTTPS Icecast Directos)
            // =================================================================
            {
                id: "radio_theramore",
                title: "Taberna de Theramore 24/7",
                artist: "Radio Rivendell · Emisora en Vivo",
                genre: "Folk Medieval, Laúd & Bardo Celta",
                category: "radio",
                type: "radio",
                streamUrl: "https://play.radiorivendell.com/radio/8000/radio.mp3",
                channelUrl: "radio/index.html",
                channelLabel: "Abrir Cabina Kirin Tor Radio 24/7",
                cover: "images/creators_tavern_welcome.jpg",
                badge: "🍺 EN VIVO 24/7",
                description: "Transmisión continua de arpas, laúdes y melodías de posada medieval para tus descansos en Ventormenta o Theramore."
            },
            {
                id: "radio_dalaran_lofi",
                title: "Salón de Estudio de Dalaran 24/7",
                artist: "Kirin Tor Lo-Fi · Laut.fm Stream",
                genre: "Lo-Fi Chillhop & Warm Vinyl Beats",
                category: "radio",
                type: "radio",
                streamUrl: "https://lofi.stream.laut.fm/lofi",
                channelUrl: "radio/index.html",
                channelLabel: "Abrir Cabina Kirin Tor Radio 24/7",
                cover: "images/peacebloom_lofi_cover.jpg",
                badge: "☕ EN VIVO 24/7",
                description: "Emisora ininterrumpida 24/7 de beats downtempo, pianos suaves y texturas cálidas para pesca y alquimia."
            },
            {
                id: "radio_icecrown_raid",
                title: "Vanguardia de Corona de Hielo 24/7",
                artist: "RPGamers Network · Raid Soundtrack",
                genre: "Orquestal Épico, Coros & Boss Raids",
                category: "radio",
                type: "radio",
                streamUrl: "https://stream.rpgamers.net/rpgn",
                channelUrl: "radio/index.html",
                channelLabel: "Abrir Cabina Kirin Tor Radio 24/7",
                cover: "images/icecrown_citadel_epic.jpg",
                badge: "⚔️ EN VIVO 24/7",
                description: "Bandas sonoras sinfónicas de combate y encuentros heroicos en directo para noches de banda en ICC y Ulduar."
            },
            {
                id: "radio_gnomeregan",
                title: "Tecnomancia de Gnomeregan 24/7",
                artist: "Nightwave Plaza · Retrowave Stream",
                genre: "Future Synth, Vaporwave & 80s Dreamwave",
                category: "radio",
                type: "radio",
                streamUrl: "https://radio.plaza.one/mp3",
                channelUrl: "radio/index.html",
                channelLabel: "Abrir Cabina Kirin Tor Radio 24/7",
                cover: "images/jaina_arcane_sanctum.jpg",
                badge: "⚡ EN VIVO 24/7",
                description: "Frecuencia electrónica de alta fidelidad 24/7 para ingenieros gnómicos, talleres mecánicos y vuelos nocturnos."
            },
            {
                id: "radio_ironforge_metal",
                title: "Forja de Hierro PvP & Metal 24/7",
                artist: "Rock Antenne · Heavy Metal Direct",
                genre: "Heavy Metal & Hard Rock de Combate",
                category: "radio",
                type: "radio",
                streamUrl: "https://stream.rockantenne.de/heavy-metal/stream/mp3",
                channelUrl: "radio/index.html",
                channelLabel: "Abrir Cabina Kirin Tor Radio 24/7",
                cover: "images/deserter_galleon_epic.jpg",
                badge: "🎸 EN VIVO 24/7",
                description: "Riffs demoledores y doble bombo en directo 24/7 para Campos de Batalla, Garganta Grito de Guerra y Arenas."
            },
            {
                id: "radio_arathi_forest",
                title: "Bosques de Arathi & Lluvia 24/7",
                artist: "Ambient Stream · Naturaleza & Calma",
                genre: "Paisajes Atmosféricos, Lluvia & Serenidad",
                category: "radio",
                type: "radio",
                streamUrl: "https://ambient.stream.laut.fm/ambient",
                channelUrl: "radio/index.html",
                channelLabel: "Abrir Cabina Kirin Tor Radio 24/7",
                cover: "images/jaina_living_lore.jpg",
                badge: "🌧️ EN VIVO 24/7",
                description: "Texturas ambientales etéreas y serenidad nocturna 24/7 para inmersión profunda mientras exploras Azeroth."
            },

            // =================================================================
            // PESTAÑA 3: AMBIENTES BINAURALES 3D (3 Biomas WebAudio Zero-Bandwidth)
            // =================================================================
            {
                id: "procedural_dalaran",
                title: "Santuario Arcano de Dalaran",
                artist: "Kirin Tor WebAudio 3D Synthesizer",
                genre: "Acordes A-Lydian & Campanas de Cristal",
                category: "biomes",
                type: "procedural",
                channelUrl: "jainacore.html",
                channelLabel: "Explorar Arquitectura JainaCore",
                cover: "images/jaina_arcane_sanctum.jpg",
                badge: "🔮 BIOMA 3D",
                description: "Síntesis matemática binaural en tiempo real (cero consumo de red): drones de líneas Ley y cristales resonantes."
            },
            {
                id: "procedural_hearth",
                title: "Posada de la Lumbre (Hoguera & Laúd)",
                artist: "Kirin Tor WebAudio 3D Synthesizer",
                genre: "Fuego Crepitante Orgánico & Arpa Celta",
                category: "biomes",
                type: "procedural",
                channelUrl: "jainacore.html",
                channelLabel: "Explorar Arquitectura JainaCore",
                cover: "images/creators_tavern_welcome.jpg",
                badge: "🔥 BIOMA 3D",
                description: "Brasas cálidas generadas por ruido Browniano filtrado, chispas de leña y quintas acústicas de laúd en Re Mixolidio."
            },
            {
                id: "procedural_frozen_throne",
                title: "Trono Helado de Rasganorte",
                artist: "Kirin Tor WebAudio 3D Synthesizer",
                genre: "Ventisca Estereofónica & Coro Glacial",
                category: "biomes",
                type: "procedural",
                channelUrl: "jainacore.html",
                channelLabel: "Explorar Arquitectura JainaCore",
                cover: "images/icecrown_citadel_epic.jpg",
                badge: "❄️ BIOMA 3D",
                description: "Vientos árticos barridos por osciladores LFO en cuadratura estéreo sobre un pad catedralicio sombrío en Re Menor."
            }
        ];

        // Persistencia limpia en localStorage
        let savedTrackId = null;
        let savedVol = 80;
        let savedCat = "creators";
        try {
            savedTrackId = localStorage.getItem("jaina_sonic_track_id");
            const sv = localStorage.getItem("jaina_jukebox_vol");
            const sc = localStorage.getItem("jaina_sonic_cat");
            if (sv !== null && !Number.isNaN(parseInt(sv, 10))) savedVol = parseInt(sv, 10);
            if (sc && ["creators", "radio", "biomes", "all"].includes(sc)) savedCat = sc;
        } catch (_) {}

        const foundIdx = savedTrackId ? this.tracks.findIndex(t => t.id === savedTrackId) : -1;
        this.currentTrackIndex = foundIdx >= 0 ? foundIdx : 0;
        this.activeCategory = savedCat;

        this.isPlaying = false;
        this.isLoadingStream = false;
        this.volume = Math.max(0, Math.min(100, savedVol));
        this.isMuted = false;
        this.isDrawerOpen = false;
        this.isDockMinimized = false;

        // Motores de salida
        this.ytPlayer = null;
        this.isYtReady = false;
        this.pendingYtPlay = false;
        this.trailerPlayer = null;

        // Motor Dual-Stage Icecast Radio
        this.radioAudio = null;
        this._radioGenId = 0;
        this._radioAudioCtx = null;
        this._radioAnalyser = null;
        this._radioHasRealFFT = false;
        this._wiredAudioEls = new WeakSet();

        // Scrubbing & Spectrum Loop
        this._isScrubbing = false;
        this._seekTimer = null;
        this._rafId = null;
        this._fftBins = new Uint8Array(64);
        this._smoothBins = new Float32Array(64);

        // Cross-Tab Mutex
        this._bc = null;
        this._initCrossTabMutex();
    }

    _resolveAsset(relPath) {
        if (!relPath) return "";
        if (/^https?:\/\//i.test(relPath) || relPath.startsWith("#")) return relPath;
        return this.rootPrefix + relPath;
    }

    _getBiomeSynth() {
        return window.jainaBiomeSynth || (window.jainaAmbientAudio && window.jainaAmbientAudio.synth) || null;
    }

    init() {
        this._injectUniversalDOM();
        this._bindDOMEvents();
        this._setupYouTubeAPI();
        this.renderPlaylists();
        this.updatePlayerUI();
        this.updateVolumeUI();
        this._startSeekPoller();
        this._startSpectrumLoop();
    }

    // =========================================================================
    // 1. MUTEX GLOBAL INTER-PESTAÑA E INTRA-PÁGINA (CERO SONIDOS MEZCLADOS)
    // =========================================================================
    _initCrossTabMutex() {
        if (typeof BroadcastChannel !== "undefined") {
            try {
                this._bc = new BroadcastChannel("pj_sonic_mutex");
                this._bc.onmessage = (ev) => {
                    if (ev.data && ev.data.action === "CLAIM_AUDIO" && ev.data.tabId !== this.tabId) {
                        this.pauseAllLocal(false);
                    }
                };
            } catch (_) {}
        }

        window.addEventListener("storage", (ev) => {
            if (ev.key === "pj_sonic_active_tab" && ev.newValue) {
                try {
                    const payload = JSON.parse(ev.newValue);
                    if (payload && payload.tabId && payload.tabId !== this.tabId) {
                        this.pauseAllLocal(false);
                    }
                } catch (_) {}
            }
        });
    }

    _claimGlobalMutex() {
        const msg = { action: "CLAIM_AUDIO", tabId: this.tabId, ts: Date.now() };
        if (this._bc) {
            try { this._bc.postMessage(msg); } catch (_) {}
        }
        try {
            localStorage.setItem("pj_sonic_active_tab", JSON.stringify(msg));
        } catch (_) {}
    }

    _stopRadioImmediate() {
        this._radioGenId++;
        this.isLoadingStream = false;
        this._radioHasRealFFT = false;
        if (this.radioAudio) {
            const el = this.radioAudio;
            this.radioAudio = null;
            el.onplaying = null;
            el.onerror = null;
            el.onPause = null;
            try { el.pause(); } catch (_) {}
            try {
                el.removeAttribute("src");
                el.load();
            } catch (_) {}
        }
    }

    _stopYoutubeImmediate() {
        this.pendingYtPlay = false;
        if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.pauseVideo === "function") {
            try { this.ytPlayer.pauseVideo(); } catch (_) {}
        }
    }

    _stopTrailerImmediate() {
        if (this.trailerPlayer && typeof this.trailerPlayer.pauseVideo === "function") {
            try { this.trailerPlayer.pauseVideo(); } catch (_) {}
        }
    }

    _stopBiomeImmediate() {
        const synth = this._getBiomeSynth();
        if (synth && typeof synth.stopImmediate === "function") {
            synth.stopImmediate();
        }
    }

    _teardownAllExcept(keepType) {
        if (keepType !== "youtube") this._stopYoutubeImmediate();
        if (keepType !== "radio") this._stopRadioImmediate();
        if (keepType !== "procedural") this._stopBiomeImmediate();
        this._stopTrailerImmediate();
    }

    pauseAllLocal(turnOffHearth = false) {
        this._stopYoutubeImmediate();
        this._stopRadioImmediate();
        this._stopBiomeImmediate();
        if (turnOffHearth) {
            const synth = this._getBiomeSynth();
            if (synth) synth.setHearthOverlay(false);
        }
        this.isPlaying = false;
        this.updatePlayerUI();
        this.renderPlaylists();
    }

    // =========================================================================
    // 2. YOUTUBE IFRAME API + PUENTE CON TRÁILER CINEMÁTICO WOTLK
    // =========================================================================
    _setupYouTubeAPI() {
        const bootPlayers = () => {
            this._initMainYTPlayer();
            this._initTrailerYTPlayer();
        };

        if (window.YT && window.YT.Player) {
            bootPlayers();
        } else {
            const prevCb = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof prevCb === "function") prevCb();
                bootPlayers();
            };
            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                const tag = document.createElement("script");
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScript = document.getElementsByTagName("script")[0];
                if (firstScript && firstScript.parentNode) {
                    firstScript.parentNode.insertBefore(tag, firstScript);
                } else {
                    document.head.appendChild(tag);
                }
            }
        }
    }

    _initMainYTPlayer() {
        let container = document.getElementById("ytIframeMount");
        if (!container) {
            container = document.createElement("div");
            container.id = "ytIframeMount";
            container.style.cssText = "position:fixed;bottom:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
            document.body.appendChild(container);
        }

        const initialTrack = this.tracks[this.currentTrackIndex];
        const initialVid = initialTrack.type === "youtube" ? initialTrack.id : "l0fCvz8dOtA";
        const playerVars = {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1
        };
        if (window.location.protocol.startsWith("http")) {
            playerVars.origin = window.location.origin;
        }

        try {
            this.ytPlayer = new YT.Player("ytIframeMount", {
                height: "100%",
                width: "100%",
                videoId: initialVid,
                playerVars,
                events: {
                    onReady: () => {
                        this.isYtReady = true;
                        this._applyYtVolume();
                        if (this.pendingYtPlay) {
                            this.pendingYtPlay = false;
                            const tr = this.tracks[this.currentTrackIndex];
                            if (tr && tr.type === "youtube") {
                                this._claimGlobalMutex();
                                this._teardownAllExcept("youtube");
                                this.ytPlayer.loadVideoById(tr.id);
                            }
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === YT.PlayerState.PLAYING) {
                            // Si el usuario pulsó Play directamente dentro del IFrame de YouTube,
                            // reclamamos el mutex y cortamos al instante cualquier Radio o Bioma 3D activo.
                            this._claimGlobalMutex();
                            this._stopRadioImmediate();
                            this._stopBiomeImmediate();
                            this._stopTrailerImmediate();

                            try {
                                const vData = this.ytPlayer.getVideoData && this.ytPlayer.getVideoData();
                                if (vData && vData.video_id) {
                                    const matchedIdx = this.tracks.findIndex(t => t.type === "youtube" && t.id === vData.video_id);
                                    if (matchedIdx >= 0 && matchedIdx !== this.currentTrackIndex) {
                                        this.currentTrackIndex = matchedIdx;
                                    }
                                }
                            } catch (_) {}

                            this.isPlaying = true;
                            this.updatePlayerUI();
                            this.renderPlaylists();
                        } else if (event.data === YT.PlayerState.ENDED) {
                            if (this.tracks[this.currentTrackIndex].type === "youtube") {
                                this.next();
                            }
                        } else if (event.data === YT.PlayerState.PAUSED) {
                            if (this.tracks[this.currentTrackIndex].type === "youtube") {
                                this.isPlaying = false;
                                this.updatePlayerUI();
                                this.renderPlaylists();
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.warn("[ArcaneSonicEngine] YouTube API init warning:", err);
        }
    }

    _initTrailerYTPlayer() {
        const trailerEl = document.getElementById("trailerCinematicIframe");
        if (!trailerEl) return;
        try {
            this.trailerPlayer = new YT.Player("trailerCinematicIframe", {
                events: {
                    onStateChange: (ev) => {
                        if (ev.data === YT.PlayerState.PLAYING) {
                            // El usuario reprodujo la cinemática de Rasganorte: silenciamos la música de fondo
                            this._claimGlobalMutex();
                            this.pauseAllLocal(false);
                        }
                    }
                }
            });
        } catch (_) {}
    }

    _applyYtVolume() {
        if (!this.ytPlayer || !this.isYtReady) return;
        try {
            if (this.isMuted || this.volume === 0) {
                this.ytPlayer.mute();
            } else {
                this.ytPlayer.unMute();
                this.ytPlayer.setVolume(this.volume);
            }
        } catch (_) {}
    }

    // =========================================================================
    // 3. DUAL-STAGE RESILIENT ICECAST STREAM LOADER (CORS FFT -> DIRECT AUDIO)
    // =========================================================================
    _ensureRadioAnalyser() {
        if (!this._radioAudioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return false;
            this._radioAudioCtx = new AudioCtx();
            this._radioAnalyser = this._radioAudioCtx.createAnalyser();
            this._radioAnalyser.fftSize = 128;
            this._radioAnalyser.smoothingTimeConstant = 0.8;
            this._radioAnalyser.connect(this._radioAudioCtx.destination);
        }
        if (this._radioAudioCtx.state === "suspended") {
            this._radioAudioCtx.resume().catch(() => {});
        }
        return true;
    }

    _startRadioStream(track, useCors = true, existingGenId = null) {
        const genId = existingGenId !== null ? existingGenId : ++this._radioGenId;

        if (this.radioAudio) {
            const old = this.radioAudio;
            this.radioAudio = null;
            old.onplaying = null;
            old.onerror = null;
            try { old.pause(); old.removeAttribute("src"); old.load(); } catch (_) {}
        }

        const audio = new Audio();
        audio.preload = "auto";
        audio.volume = this.isMuted ? 0 : (this.volume / 100);

        if (useCors) {
            audio.crossOrigin = "anonymous";
        }

        this.radioAudio = audio;
        this.isLoadingStream = true;
        this._radioHasRealFFT = false;
        this.updatePlayerUI();

        audio.onplaying = () => {
            if (genId !== this._radioGenId) return;
            this.isLoadingStream = false;
            this.isPlaying = true;

            if (useCors && this._ensureRadioAnalyser()) {
                try {
                    if (!this._wiredAudioEls.has(audio)) {
                        const srcNode = this._radioAudioCtx.createMediaElementSource(audio);
                        srcNode.connect(this._radioAnalyser);
                        this._wiredAudioEls.add(audio);
                    }
                    this._radioHasRealFFT = true;
                } catch (_) {
                    this._radioHasRealFFT = false;
                }
            }
            this.updatePlayerUI();
            this.renderPlaylists();
        };

        audio.onerror = () => {
            if (genId !== this._radioGenId) return;
            if (useCors) {
                // Stage 2 Auto-Recovery (< 200ms): Reintentar sin atributo crossOrigin para reproducción directa 100% garantizada
                this._startRadioStream(track, false, genId);
                return;
            }
            this.isLoadingStream = false;
            this.isPlaying = false;
            this.updatePlayerUI();
            this.renderPlaylists();
        };

        audio.src = track.streamUrl;
        if (useCors && this._radioAudioCtx && this._radioAudioCtx.state === "suspended") {
            this._radioAudioCtx.resume().catch(() => {});
        }
        audio.play().catch(() => {
            if (genId !== this._radioGenId) return;
            this.isLoadingStream = false;
            this.isPlaying = false;
            this.updatePlayerUI();
        });
    }

    // =========================================================================
    // 4. TRANSPORTE UNIFICADO (LOAD / PLAY / PAUSE / SEEK / VOLUME / HEARTH)
    // =========================================================================
    loadTrack(index, autoPlay = true) {
        if (index < 0) index = this.tracks.length - 1;
        if (index >= this.tracks.length) index = 0;

        this.currentTrackIndex = index;
        const track = this.tracks[index];

        try {
            localStorage.setItem("jaina_sonic_track_id", track.id);
        } catch (_) {}

        if (this.activeCategory !== "all" && this.activeCategory !== track.category) {
            this.activeCategory = track.category;
            try { localStorage.setItem("jaina_sonic_cat", this.activeCategory); } catch (_) {}
        }

        if (!autoPlay) {
            this.pauseAllLocal(false);
            if (track.type === "youtube" && this.ytPlayer && this.isYtReady && this.ytPlayer.cueVideoById) {
                try { this.ytPlayer.cueVideoById(track.id); } catch (_) {}
            }
            this.updatePlayerUI();
            this.renderPlaylists();
            return;
        }

        this._claimGlobalMutex();
        this._teardownAllExcept(track.type);

        if (track.type === "youtube") {
            this._stopRadioImmediate();
            this._stopBiomeImmediate();
            if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.loadVideoById === "function") {
                this._applyYtVolume();
                this.ytPlayer.loadVideoById(track.id);
                this.isPlaying = true;
            } else {
                this.pendingYtPlay = true;
                this.isPlaying = true;
            }
        } else if (track.type === "radio") {
            this._stopYoutubeImmediate();
            this._stopBiomeImmediate();
            this._startRadioStream(track, true);
        } else if (track.type === "procedural") {
            this._stopYoutubeImmediate();
            this._stopRadioImmediate();
            const synth = this._getBiomeSynth();
            if (synth) {
                synth.setVolume(this.isMuted ? 0 : this.volume);
                synth.play(track.id);
                this.isPlaying = true;
            }
        }

        this.updatePlayerUI();
        this.renderPlaylists();
    }

    togglePlay() {
        if (this.isPlaying || this.isLoadingStream) {
            this.pauseAllLocal(false);
        } else {
            this.playCurrent();
        }
    }

    playCurrent() {
        const track = this.tracks[this.currentTrackIndex];
        this._claimGlobalMutex();
        this._teardownAllExcept(track.type);

        if (track.type === "youtube") {
            if (this.ytPlayer && this.isYtReady) {
                this._applyYtVolume();
                try {
                    const vData = this.ytPlayer.getVideoData && this.ytPlayer.getVideoData();
                    if (!vData || vData.video_id !== track.id) {
                        this.ytPlayer.loadVideoById(track.id);
                    } else {
                        this.ytPlayer.playVideo();
                    }
                } catch (_) {
                    this.ytPlayer.loadVideoById(track.id);
                }
                this.isPlaying = true;
            } else {
                this.pendingYtPlay = true;
                this.isPlaying = true;
            }
        } else if (track.type === "radio") {
            this._startRadioStream(track, true);
        } else if (track.type === "procedural") {
            const synth = this._getBiomeSynth();
            if (synth) {
                synth.setVolume(this.isMuted ? 0 : this.volume);
                synth.play(track.id);
                this.isPlaying = true;
            }
        }

        this.updatePlayerUI();
        this.renderPlaylists();
    }

    next() {
        this.loadTrack(this.currentTrackIndex + 1, true);
    }

    prev() {
        this.loadTrack(this.currentTrackIndex - 1, true);
    }

    seekToFraction(fraction0to1) {
        const track = this.tracks[this.currentTrackIndex];
        if (track.type !== "youtube" || !this.ytPlayer || !this.isYtReady) return;
        try {
            const dur = this.ytPlayer.getDuration ? this.ytPlayer.getDuration() : 0;
            if (dur > 0) {
                const targetSec = Math.max(0, Math.min(dur, fraction0to1 * dur));
                this.ytPlayer.seekTo(targetSec, true);
                this._updateSeekReadouts(targetSec, dur);
            }
        } catch (_) {}
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(100, Number(val) || 0));
        this.isMuted = this.volume === 0;
        try { localStorage.setItem("jaina_jukebox_vol", String(this.volume)); } catch (_) {}

        this._applyYtVolume();
        if (this.radioAudio) {
            this.radioAudio.volume = this.isMuted ? 0 : (this.volume / 100);
        }
        const synth = this._getBiomeSynth();
        if (synth) {
            synth.setVolume(this.isMuted ? 0 : this.volume);
        }
        this.updateVolumeUI();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (!this.isMuted && this.volume === 0) {
            this.volume = 65;
        }
        this._applyYtVolume();
        if (this.radioAudio) {
            this.radioAudio.volume = this.isMuted ? 0 : (this.volume / 100);
        }
        const synth = this._getBiomeSynth();
        if (synth) {
            synth.setVolume(this.isMuted ? 0 : this.volume);
        }
        this.updateVolumeUI();
    }

    toggleHearthOverlay() {
        const synth = this._getBiomeSynth();
        if (!synth) return;
        const nextState = !synth.hearthOverlayEnabled;
        synth.setVolume(this.isMuted ? 0 : this.volume);
        synth.setHearthOverlay(nextState);
        this.updateHearthUI();
    }

    setCategory(cat) {
        if (!["creators", "radio", "biomes", "all"].includes(cat)) return;
        this.activeCategory = cat;
        try { localStorage.setItem("jaina_sonic_cat", cat); } catch (_) {}
        this.renderPlaylists();
        this._syncCategoryTabButtons();
    }

    openDrawer() {
        this.isDrawerOpen = true;
        const bd = document.getElementById("sonicDrawerBackdrop");
        const pn = document.getElementById("sonicDrawerPanel");
        if (bd) bd.classList.add("open");
        if (pn) pn.classList.add("open");
    }

    closeDrawer() {
        this.isDrawerOpen = false;
        const bd = document.getElementById("sonicDrawerBackdrop");
        const pn = document.getElementById("sonicDrawerPanel");
        if (bd) bd.classList.remove("open");
        if (pn) pn.classList.remove("open");
    }

    toggleDrawer() {
        if (this.isDrawerOpen) this.closeDrawer();
        else this.openDrawer();
    }

    // =========================================================================
    // 5. INYECCIÓN UNIVERSAL DEL PRO FLOATING DOCK & SLIDE-OVER DRAWER
    // =========================================================================
    _injectUniversalDOM() {
        // 1. Pro Studio Floating Dock (z-index: 9000)
        const oldDock = document.getElementById("floatingJukeboxDock");
        if (oldDock) oldDock.remove();

        const dock = document.createElement("div");
        dock.id = "floatingJukeboxDock";
        dock.className = "floating-jukebox-dock hidden-dock";
        dock.innerHTML = `
            <div class="dock-top-progress">
                <div class="jb-seek-row" id="dockSeekRow" style="gap:6px;">
                    <input type="range" class="dock-seek-slider" id="dockSeekSlider" min="0" max="1000" value="0" aria-label="Progreso de pista">
                    <span class="dock-time-readout" id="dockTimeReadout">00:00 / 00:00</span>
                </div>
                <div class="dock-live-pill" id="dockLivePill">
                    <span class="jb-live-dot"></span>
                    <span id="dockLiveLabel">EN VIVO 24/7 · STREAM DIRECTO</span>
                </div>
            </div>
            <div class="dock-main-row">
                <div class="mini-jb-vinyl" id="miniJbVinyl" title="Abrir Estudio Lateral Kirin Tor"></div>
                <div class="mini-jb-info" id="miniJbInfoTrigger" title="Abrir Estudio Lateral Kirin Tor">
                    <div class="mini-jb-title-row">
                        <span class="mini-jb-title" id="miniJbTitle">Peacebloom Burn Slow</span>
                    </div>
                    <span class="mini-jb-artist" id="miniJbArtist">Barrens Boys (feat. Toro Loco)</span>
                </div>
                <canvas class="dock-spectrum-canvas" id="dockSpectrumCanvas" width="96" height="28"></canvas>
                <div class="mini-jb-actions">
                    <button type="button" class="mini-jb-btn" id="miniJbPrev" title="Canal Anterior">⏮</button>
                    <button type="button" class="mini-jb-btn play-accent" id="miniJbPlay" title="Reproducir / Pausar">▶</button>
                    <button type="button" class="mini-jb-btn" id="miniJbNext" title="Siguiente Canal">⏭</button>
                    <div class="mini-jb-vol-wrap">
                        <button type="button" class="mini-jb-util-btn" id="miniJbMute" title="Silenciar">🔊</button>
                        <input type="range" class="mini-jb-vol-slider" id="miniJbVolSlider" min="0" max="100" value="${this.volume}" title="Volumen">
                    </div>
                    <button type="button" class="mini-jb-drawer-btn" id="miniJbDrawerBtn" title="Abrir Fonoteca sin salir de esta página">
                        <span>🎛️</span><span>Fonoteca</span>
                    </button>
                    <button type="button" class="mini-jb-util-btn" id="miniJbMinBtn" title="Minimizar / Expandir">—</button>
                    <button type="button" class="mini-jb-util-btn close-stop" id="miniJbClose" title="Detener y cerrar reproductor">✕</button>
                </div>
            </div>
        `;
        document.body.appendChild(dock);

        // 2. Universal Slide-Over Fonoteca Drawer (z-index: 9500)
        if (!document.getElementById("sonicDrawerPanel")) {
            const backdrop = document.createElement("div");
            backdrop.id = "sonicDrawerBackdrop";
            backdrop.className = "sonic-drawer-backdrop";

            const panel = document.createElement("aside");
            panel.id = "sonicDrawerPanel";
            panel.className = "sonic-drawer-panel";
            panel.setAttribute("aria-label", "Kirin Tor Arcane Sonic Studio");
            panel.innerHTML = `
                <div class="sonic-drawer-header">
                    <div class="sonic-drawer-brand">
                        <span class="sonic-drawer-kicker">🎛️ Kirin Tor Arcane Sonic Studio v6.1</span>
                        <h3 class="sonic-drawer-heading">Fonoteca & Radio 24/7</h3>
                    </div>
                    <button type="button" class="sonic-drawer-close" id="drawerCloseBtn" title="Cerrar panel (Esc)">✕</button>
                </div>

                <div class="sonic-drawer-deck">
                    <div class="drawer-now-row">
                        <div class="drawer-vinyl" id="drawerVinyl"></div>
                        <div class="drawer-track-meta">
                            <span class="drawer-mode-badge" id="drawerModeBadge">🔥 HIMNO COMUNIDAD</span>
                            <div class="drawer-track-title" id="drawerTrackTitle">Peacebloom Burn Slow</div>
                            <div class="drawer-track-artist" id="drawerTrackArtist">Barrens Boys (feat. Toro Loco)</div>
                        </div>
                    </div>

                    <div class="drawer-spectrum-wrap">
                        <canvas class="drawer-spectrum-canvas" id="drawerSpectrumCanvas" width="380" height="44"></canvas>
                    </div>

                    <div class="drawer-seek-wrap">
                        <div class="jb-seek-row" id="drawerSeekRow">
                            <span class="jb-time-label" id="drawerTimeCurrent">00:00</span>
                            <input type="range" class="jb-seek-slider" id="drawerSeekSlider" min="0" max="1000" value="0" aria-label="Barra de tiempo">
                            <span class="jb-time-label" id="drawerTimeTotal">00:00</span>
                        </div>
                        <div class="jb-live-stream-bar" id="drawerLiveBar" style="width:100%; justify-content:center;">
                            <span class="jb-live-dot"></span>
                            <span id="drawerLiveText">EN VIVO 24/7 · STREAM DIRECTO</span>
                        </div>
                    </div>

                    <div class="drawer-controls-row">
                        <div class="drawer-transport">
                            <button type="button" class="mini-jb-btn" id="drawerBtnPrev" title="Anterior">⏮</button>
                            <button type="button" class="mini-jb-btn play-accent" id="drawerBtnPlay" style="width:38px;height:38px;font-size:0.95rem;" title="Reproducir / Pausar">▶</button>
                            <button type="button" class="mini-jb-btn" id="drawerBtnNext" title="Siguiente">⏭</button>
                        </div>
                        <div class="drawer-vol-box">
                            <button type="button" class="jb-vol-mute-btn" id="drawerBtnMute" title="Silenciar">🔊</button>
                            <input type="range" class="jb-vol-slider" id="drawerVolSlider" style="width:92px;" min="0" max="100" value="${this.volume}">
                            <span class="jb-vol-pct" id="drawerVolPct">${this.volume}%</span>
                        </div>
                    </div>

                    <div class="drawer-extra-bar">
                        <button type="button" class="jb-hearth-toggle" id="drawerBtnHearth" title="Mezclar sonido cálido de hoguera crepitante">
                            🔥 Hoguera: OFF
                        </button>
                        <a href="https://www.youtube.com/@barrensboys" target="_blank" rel="noopener noreferrer" class="drawer-ext-link" id="drawerChannelLink">
                            📺 Canal Oficial ↗
                        </a>
                    </div>
                </div>

                <div class="sonic-drawer-tabs">
                    <div class="jb-cat-tabs" data-cat-group="drawer">
                        <button type="button" class="jb-cat-tab" data-cat="creators">🔥 Creadores (6)</button>
                        <button type="button" class="jb-cat-tab" data-cat="radio">📻 Radio 24/7 (6)</button>
                        <button type="button" class="jb-cat-tab" data-cat="biomes">🔮 Biomas 3D (3)</button>
                        <button type="button" class="jb-cat-tab" data-cat="all">✨ Todos (15)</button>
                    </div>
                </div>

                <div class="sonic-drawer-list" id="drawerPlaylistItems"></div>
            `;

            document.body.appendChild(backdrop);
            document.body.appendChild(panel);
        }
    }

    _bindDOMEvents() {
        const bindClick = (id, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener("click", fn);
        };

        // Controles Cabina Principal (#fonoteca-taberna en index.html)
        bindClick("jbBtnPlay", () => this.togglePlay());
        bindClick("jbBtnPrev", () => this.prev());
        bindClick("jbBtnNext", () => this.next());
        bindClick("jbBtnMute", () => this.toggleMute());
        bindClick("jbBtnHearth", () => this.toggleHearthOverlay());

        // Controles Slide-Over Drawer
        bindClick("drawerCloseBtn", () => this.closeDrawer());
        bindClick("sonicDrawerBackdrop", () => this.closeDrawer());
        bindClick("drawerBtnPlay", () => this.togglePlay());
        bindClick("drawerBtnPrev", () => this.prev());
        bindClick("drawerBtnNext", () => this.next());
        bindClick("drawerBtnMute", () => this.toggleMute());
        bindClick("drawerBtnHearth", () => this.toggleHearthOverlay());

        // Controles Pro Floating Dock
        bindClick("miniJbPlay", () => this.togglePlay());
        bindClick("miniJbPrev", () => this.prev());
        bindClick("miniJbNext", () => this.next());
        bindClick("miniJbMute", () => this.toggleMute());
        bindClick("miniJbDrawerBtn", () => this.toggleDrawer());
        bindClick("miniJbVinyl", () => this.toggleDrawer());
        bindClick("miniJbInfoTrigger", () => this.toggleDrawer());

        bindClick("miniJbMinBtn", () => {
            this.isDockMinimized = !this.isDockMinimized;
            const dock = document.getElementById("floatingJukeboxDock");
            const minBtn = document.getElementById("miniJbMinBtn");
            if (dock) dock.classList.toggle("minimized-dock", this.isDockMinimized);
            if (minBtn) minBtn.textContent = this.isDockMinimized ? "▢" : "—";
        });

        bindClick("miniJbClose", () => {
            this.pauseAllLocal(false);
            const dock = document.getElementById("floatingJukeboxDock");
            if (dock) dock.classList.add("hidden-dock");
        });

        // Sliders de Volumen sincronizados
        ["jbVolSlider", "drawerVolSlider", "miniJbVolSlider"].forEach((id) => {
            const sl = document.getElementById(id);
            if (sl) {
                sl.addEventListener("input", (e) => this.setVolume(parseInt(e.target.value, 10)));
            }
        });

        // Sliders de Seek Bar sincronizados
        ["jbSeekSlider", "drawerSeekSlider", "dockSeekSlider"].forEach((id) => {
            const sl = document.getElementById(id);
            if (!sl) return;
            sl.addEventListener("pointerdown", () => { this._isScrubbing = true; });
            sl.addEventListener("input", (e) => {
                this._isScrubbing = true;
                const pct = (parseFloat(e.target.value) / 1000) * 100;
                sl.style.setProperty("--seek-pct", `${pct.toFixed(1)}%`);
            });
            sl.addEventListener("change", (e) => {
                const frac = parseFloat(e.target.value) / 1000;
                this._isScrubbing = false;
                this.seekToFraction(frac);
            });
        });

        // Pestañas de Categoría (Homepage + Drawer)
        document.querySelectorAll(".jb-cat-tab[data-cat]").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.setCategory(btn.getAttribute("data-cat"));
            });
        });

        // Botón Universal del Navbar (#ambientAudioBtn): Abre el Drawer sin abandonar la página activa
        const navBtn = document.getElementById("ambientAudioBtn");
        if (navBtn) {
            navBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.toggleDrawer();
            });
        }

        // Tecla Escape cierra el Drawer
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isDrawerOpen) {
                this.closeDrawer();
            }
        });
    }

    // =========================================================================
    // 6. RENDERIZADO DE PLAYLISTS, METADATOS, SEEK BAR & ESPECTRO 60 FPS
    // =========================================================================
    _syncCategoryTabButtons() {
        document.querySelectorAll(".jb-cat-tab[data-cat]").forEach((btn) => {
            const isMatch = btn.getAttribute("data-cat") === this.activeCategory;
            btn.classList.toggle("active", isMatch);
        });
    }

    renderPlaylists() {
        this._syncCategoryTabButtons();
        const containers = [
            document.getElementById("jbPlaylistItems"),
            document.getElementById("drawerPlaylistItems")
        ].filter(Boolean);

        const filtered = this.tracks
            .map((track, originalIdx) => ({ track, originalIdx }))
            .filter(({ track }) => this.activeCategory === "all" || track.category === this.activeCategory);

        containers.forEach((container) => {
            container.innerHTML = "";
            filtered.forEach(({ track, originalIdx }) => {
                const isCurrent = originalIdx === this.currentTrackIndex;
                const row = document.createElement("div");
                row.className = `jb-playlist-row ${isCurrent ? "active-track" : ""}`;

                const modeClass = track.type === "radio" ? "mode-radio" : (track.type === "procedural" ? "mode-procedural" : "");
                const playGlyph = isCurrent && this.isPlaying ? "❚❚" : (isCurrent && this.isLoadingStream ? "⏳" : "▶");
                const resolvedCover = this._resolveAsset(track.cover);
                const resolvedHref = this._resolveAsset(track.channelUrl);
                const isExternal = /^https?:\/\//i.test(resolvedHref);

                row.innerHTML = `
                    <div class="jb-row-left">
                        <span class="jb-row-play-indicator">${playGlyph}</span>
                        <img class="jb-row-thumb" src="${resolvedCover}" alt="" loading="lazy">
                        <div class="jb-row-meta">
                            <div class="jb-row-title">${track.title}</div>
                            <div class="jb-row-artist">${track.artist} · <span class="jb-row-genre">${track.genre}</span></div>
                        </div>
                    </div>
                    <div class="jb-row-right">
                        <span class="jb-row-badge ${modeClass}">${track.badge}</span>
                        <a href="${resolvedHref}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""} class="jb-row-link" title="${track.channelLabel || "Abrir enlace"}">↗</a>
                    </div>
                `;

                row.addEventListener("click", (e) => {
                    if (e.target.closest("a")) return;
                    if (originalIdx === this.currentTrackIndex) {
                        this.togglePlay();
                    } else {
                        this.loadTrack(originalIdx, true);
                    }
                });

                container.appendChild(row);
            });
        });
    }

    updatePlayerUI() {
        const track = this.tracks[this.currentTrackIndex];
        if (!track) return;

        const coverUrl = `url('${this._resolveAsset(track.cover)}')`;
        const resolvedChannel = this._resolveAsset(track.channelUrl);
        const isExternal = /^https?:\/\//i.test(resolvedChannel);
        const playSymbol = this.isLoadingStream ? "⏳" : (this.isPlaying ? "❚❚" : "▶");
        const modeText = track.type === "youtube"
            ? "📺 YOUTUBE ON-DEMAND"
            : (track.type === "radio" ? "📻 ICECAST HTTPS 24/7" : "🔮 WEBAUDIO 3D BINAURAL");

        // 1. Homepage Studio (#fonoteca-taberna)
        const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setTxt("jbTrackBadge", track.badge);
        setTxt("jbSourceModePill", modeText);
        setTxt("jbTrackTitle", track.title);
        setTxt("jbTrackArtist", track.artist);
        setTxt("jbTrackGenre", track.genre);
        setTxt("jbTrackDesc", track.description);

        const jbPlay = document.getElementById("jbBtnPlay");
        if (jbPlay) {
            jbPlay.textContent = playSymbol;
            jbPlay.title = this.isPlaying ? "Pausar" : "Reproducir";
        }

        const vinylDisc = document.getElementById("jbVinylDisc");
        const vinylLabel = document.querySelector("#jbVinylDisc .jb-vinyl-label");
        const tonearm = document.getElementById("jbTonearm");
        if (vinylDisc) vinylDisc.classList.toggle("spinning", this.isPlaying);
        if (vinylLabel) vinylLabel.style.backgroundImage = coverUrl;
        if (tonearm) tonearm.classList.toggle("playing", this.isPlaying);

        const jbLink = document.getElementById("jbChannelLink");
        if (jbLink) {
            jbLink.href = resolvedChannel;
            if (isExternal) {
                jbLink.setAttribute("target", "_blank");
                jbLink.setAttribute("rel", "noopener noreferrer");
            } else {
                jbLink.removeAttribute("target");
            }
            jbLink.innerHTML = `<span>${track.type === "radio" ? "📻" : (track.type === "procedural" ? "🔮" : "📺")}</span><span>${track.channelLabel || "Canal Oficial"}</span>`;
        }

        // Visor no-video en Homepage cuando suena Radio 24/7 o Bioma 3D
        const nonVideoOverlay = document.getElementById("jbNonVideoOverlay");
        if (nonVideoOverlay) {
            const showOverlay = track.type !== "youtube";
            nonVideoOverlay.classList.toggle("active", showOverlay);
            if (showOverlay) {
                nonVideoOverlay.style.backgroundImage = coverUrl;
                setTxt("jbNonVideoTag", modeText);
                setTxt("jbNonVideoTitle", track.title);
                setTxt("jbNonVideoSub", this.isLoadingStream ? "Sintonizando flujo seguro HTTPS..." : track.description);
            }
        }

        // 2. Slide-Over Drawer
        setTxt("drawerModeBadge", `${track.badge} · ${modeText}`);
        setTxt("drawerTrackTitle", track.title);
        setTxt("drawerTrackArtist", track.artist);
        const drVinyl = document.getElementById("drawerVinyl");
        if (drVinyl) {
            drVinyl.style.backgroundImage = coverUrl;
            drVinyl.classList.toggle("spinning", this.isPlaying);
        }
        const drPlay = document.getElementById("drawerBtnPlay");
        if (drPlay) drPlay.textContent = playSymbol;

        const drLink = document.getElementById("drawerChannelLink");
        if (drLink) {
            drLink.href = resolvedChannel;
            if (isExternal) {
                drLink.setAttribute("target", "_blank");
                drLink.setAttribute("rel", "noopener noreferrer");
            } else {
                drLink.removeAttribute("target");
            }
            drLink.textContent = `${track.type === "radio" ? "📻 Cabina Radio" : "📺 Canal Oficial"} ↗`;
        }

        // 3. Pro Studio Floating Dock
        const dock = document.getElementById("floatingJukeboxDock");
        if (dock && (this.isPlaying || this.isLoadingStream)) {
            dock.classList.remove("hidden-dock");
        }
        setTxt("miniJbTitle", track.title);
        setTxt("miniJbArtist", this.isLoadingStream ? "Sintonizando señal en vivo..." : track.artist);
        const miniPlay = document.getElementById("miniJbPlay");
        if (miniPlay) miniPlay.textContent = playSymbol;
        const miniVinyl = document.getElementById("miniJbVinyl");
        if (miniVinyl) {
            miniVinyl.style.backgroundImage = coverUrl;
            miniVinyl.classList.toggle("spinning", this.isPlaying);
        }

        // Alternar Seek Bar On-Demand vs Indicador EN VIVO / SÍNTESIS 3D
        const isSeekable = track.type === "youtube";
        const liveLabel = track.type === "radio"
            ? (this.isLoadingStream ? "SINTONIZANDO STREAM HTTPS..." : "EN VIVO 24/7 · ICECAST DIRECTO")
            : "SÍNTESIS BINAURAL 3D EN TIEMPO REAL";

        [
            { seek: "jbSeekRow", live: "jbLiveBar", txt: "jbLiveText" },
            { seek: "drawerSeekRow", live: "drawerLiveBar", txt: "drawerLiveText" },
            { seek: "dockSeekRow", live: "dockLivePill", txt: "dockLiveLabel" }
        ].forEach(({ seek, live, txt }) => {
            const sEl = document.getElementById(seek);
            const lEl = document.getElementById(live);
            if (sEl) sEl.style.display = isSeekable ? "flex" : "none";
            if (lEl) lEl.classList.toggle("visible", !isSeekable);
            setTxt(txt, liveLabel);
        });

        // 4. Navbar Pill (#ambientAudioBtn)
        const navBtn = document.getElementById("ambientAudioBtn");
        const navLabel = document.querySelector("#ambientAudioBtn .audio-label");
        if (navBtn && navLabel) {
            if (this.isPlaying) {
                navBtn.classList.add("playing");
                const shortTitle = track.title.length > 16 ? track.title.slice(0, 16) + "…" : track.title;
                navLabel.textContent = `🎶 ${shortTitle}`;
            } else {
                navBtn.classList.remove("playing");
                navLabel.textContent = "Fonoteca & Radio";
            }
        }

        this.updateHearthUI();
    }

    updateVolumeUI() {
        const effVol = this.isMuted ? 0 : this.volume;
        const icon = effVol === 0 ? "🔇" : (effVol > 50 ? "🔊" : "🔉");

        ["jbVolSlider", "drawerVolSlider", "miniJbVolSlider"].forEach((id) => {
            const sl = document.getElementById(id);
            if (sl) sl.value = String(effVol);
        });
        ["jbBtnMute", "drawerBtnMute", "miniJbMute"].forEach((id) => {
            const b = document.getElementById(id);
            if (b) b.textContent = icon;
        });
        ["jbVolPct", "drawerVolPct"].forEach((id) => {
            const p = document.getElementById(id);
            if (p) p.textContent = `${effVol}%`;
        });
    }

    updateHearthUI() {
        const synth = this._getBiomeSynth();
        const active = Boolean(synth && synth.hearthOverlayEnabled);
        ["jbBtnHearth", "drawerBtnHearth"].forEach((id) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.toggle("active", active);
                btn.textContent = active ? "🔥 Hoguera: ON" : "🔥 Hoguera: OFF";
            }
        });
    }

    _formatTime(sec) {
        if (!Number.isFinite(sec) || sec < 0) return "00:00";
        const total = Math.floor(sec);
        const hrs = Math.floor(total / 3600);
        const mins = Math.floor((total % 3600) / 60);
        const secs = total % 60;
        if (hrs > 0) {
            return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        }
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    _updateSeekReadouts(curSec, durSec) {
        const curFmt = this._formatTime(curSec);
        const durFmt = this._formatTime(durSec);
        const permille = durSec > 0 ? Math.min(1000, Math.round((curSec / durSec) * 1000)) : 0;
        const pctStr = `${(permille / 10).toFixed(1)}%`;

        const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setTxt("jbTimeCurrent", curFmt);
        setTxt("jbTimeTotal", durFmt);
        setTxt("drawerTimeCurrent", curFmt);
        setTxt("drawerTimeTotal", durFmt);
        setTxt("dockTimeReadout", `${curFmt} / ${durFmt}`);

        if (!this._isScrubbing) {
            ["jbSeekSlider", "drawerSeekSlider", "dockSeekSlider"].forEach((id) => {
                const sl = document.getElementById(id);
                if (sl) {
                    sl.value = String(permille);
                    sl.style.setProperty("--seek-pct", pctStr);
                }
            });
        }
    }

    _startSeekPoller() {
        if (this._seekTimer) clearInterval(this._seekTimer);
        this._seekTimer = setInterval(() => {
            const track = this.tracks[this.currentTrackIndex];
            if (!track || track.type !== "youtube" || !this.ytPlayer || !this.isYtReady) return;
            try {
                const cur = this.ytPlayer.getCurrentTime ? this.ytPlayer.getCurrentTime() : 0;
                const dur = this.ytPlayer.getDuration ? this.ytPlayer.getDuration() : 0;
                this._updateSeekReadouts(cur, dur);
            } catch (_) {}
        }, 250);
    }

    // =========================================================================
    // 7. ANALIZADOR DE ESPECTRO <CANVAS> 60 FPS (CAE A CERO REAL EN PAUSA/MUTE)
    // =========================================================================
    _startSpectrumLoop() {
        const canvases = () => [
            { el: document.getElementById("jbMainSpectrumCanvas"), bars: 48 },
            { el: document.getElementById("drawerSpectrumCanvas"), bars: 40 },
            { el: document.getElementById("dockSpectrumCanvas"), bars: 18 }
        ].filter(c => c.el);

        const render = (nowMs) => {
            this._rafId = requestAnimationFrame(render);

            const synth = this._getBiomeSynth();
            const hearthOn = Boolean(synth && synth.hearthOverlayEnabled);
            const audible = (this.isPlaying || hearthOn) && !this.isMuted && this.volume > 0;
            const track = this.tracks[this.currentTrackIndex];
            const volScale = this.isMuted ? 0 : (0.35 + (this.volume / 100) * 0.65);

            let gotRealFFT = false;
            if (audible) {
                if (track && track.type === "radio" && this._radioHasRealFFT && this._radioAnalyser) {
                    this._radioAnalyser.getByteFrequencyData(this._fftBins);
                    // Verificar que el buffer no esté en cero por restricción silenciosa
                    let sum = 0;
                    for (let i = 0; i < 24; i++) sum += this._fftBins[i];
                    gotRealFFT = sum > 0;
                } else if (synth && ((track && track.type === "procedural" && this.isPlaying) || hearthOn)) {
                    gotRealFFT = synth.getFrequencyData(this._fftBins);
                }
            }

            const t = nowMs * 0.001;
            for (let i = 0; i < 64; i++) {
                let target = 0;
                if (audible) {
                    if (gotRealFFT) {
                        target = (this._fftBins[i] / 255) * volScale;
                    } else {
                        // Modelo armónico dinámico para YouTube IFrame / Stage-2 Direct Audio (Cross-Origin PCM aislado)
                        const bassEnv = Math.max(0, Math.sin(t * 2.35) * 0.5 + 0.5);
                        const midWave = Math.sin(t * 5.1 + i * 0.34) * 0.5 + 0.5;
                        const hiShimmer = Math.sin(t * 9.7 + i * 0.85) * 0.5 + 0.5;
                        const spectralTilt = Math.exp(-i * 0.032);
                        target = (0.18 + 0.48 * bassEnv * spectralTilt + 0.28 * midWave + 0.14 * hiShimmer * (1 - spectralTilt * 0.4)) * volScale;
                    }
                }
                // Caída exponencial limpia a 0 absoluto cuando está pausado o silenciado
                const lerpRate = target > this._smoothBins[i] ? 0.32 : 0.16;
                this._smoothBins[i] += (target - this._smoothBins[i]) * lerpRate;
                if (this._smoothBins[i] < 0.004) this._smoothBins[i] = 0;
            }

            const targets = canvases();
            for (let c = 0; c < targets.length; c++) {
                const { el, bars } = targets[c];
                const w = el.width;
                const h = el.height;
                const ctx = el.getContext("2d");
                if (!ctx) continue;

                ctx.clearRect(0, 0, w, h);

                const step = w / bars;
                const barW = Math.max(2, step - 2);
                const grad = ctx.createLinearGradient(0, h, 0, 0);
                grad.addColorStop(0, "rgba(245, 158, 11, 0.85)");
                grad.addColorStop(0.6, "rgba(252, 211, 77, 0.92)");
                grad.addColorStop(1, "rgba(56, 189, 248, 0.98)");
                ctx.fillStyle = grad;

                for (let b = 0; b < bars; b++) {
                    const binIdx = Math.min(63, Math.floor((b / bars) * 48));
                    const val = Math.min(1, this._smoothBins[binIdx]);
                    const bh = Math.max(2, Math.round(val * (h - 4)));
                    const x = Math.round(b * step);
                    const y = h - bh;

                    if (val === 0) {
                        ctx.fillStyle = "rgba(148, 163, 184, 0.18)";
                        ctx.fillRect(x, h - 2, barW, 2);
                        ctx.fillStyle = grad;
                    } else {
                        ctx.fillRect(x, y, barW, bh);
                    }
                }
            }
        };

        this._rafId = requestAnimationFrame(render);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.jainaJukebox = new ArcaneSonicEngine();
    window.jainaJukebox.init();
});
