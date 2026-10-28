/**
 * ==============================================================================
 * Project JAIna — Jukebox & Fonoteca de la Taberna
 * Reproductor Comunitario de Música Lo-Fi & Creadores de Contenido
 * Destacado: "Peacebloom Burn Slow" de Barrens Boys (@barrensboys)
 * Estándar: Staff Software Engineer L9 (Mythos 5)
 * ==============================================================================
 */

class JainaJukeboxEngine {
    constructor() {
        this.tracks = [
            {
                id: "l0fCvz8dOtA",
                title: "Peacebloom Burn Slow",
                artist: "Barrens Boys (feat. Toro Loco)",
                genre: "Chill / Lo-Fi Hip-Hop Baldíos & Mulgore",
                type: "youtube",
                channelUrl: "https://www.youtube.com/@barrensboys",
                cover: "images/peacebloom_lofi_cover.jpg",
                badge: "🔥 DESTACADO DE LA COMUNIDAD",
                description: "Vibras relajadas de Los Baldíos y Mulgore con líricas nostálgicas de World of Warcraft, Druidas y Peacebloom."
            },
            {
                id: "-uxi6_5cFqw",
                title: "World of Warcraft Lofi Beats to Relax To",
                artist: "Community Warcraft Lo-Fi",
                genre: "Chillhop Nostalgia & Tavern Beats",
                type: "youtube",
                channelUrl: "https://www.youtube.com/watch?v=-uxi6_5cFqw",
                cover: "images/peacebloom_lofi_cover.jpg",
                badge: "🍂 NOSTALGIA DE TABERNA",
                description: "Arreglos lo-fi de Colinas Pardas, Elwynn y las tabernas de Azeroth para acompañar tus aventuras o sesiones de estudio."
            },
            {
                id: "procedural_dalaran",
                title: "Ecos Arcanos de Dalaran (Santuario de Jaina)",
                artist: "Jaina Web Audio Synthesizer",
                genre: "Drones Místicos & Campanas de Cristal",
                type: "procedural",
                channelUrl: "jainacore.html",
                cover: "images/jaina_arcane_sanctum.jpg",
                badge: "🔮 PROCEDURAL WEB AUDIO",
                description: "Atmósfera binaural generada matemáticamente en tiempo real por tu navegador con filtros resonantes y campanas armónicas."
            }
        ];

        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.volume = 80;
        this.isMuted = false;
        this.ytPlayer = null;
        this.isYtReady = false;
        this.pendingPlay = false;

        // Referencia al sintetizador procedural existente
        this.ambientSynth = window.jainaAmbientAudio || null;
    }

    init() {
        this.setupYouTubeAPI();
        this.bindDOM();
        this.renderPlaylist();
        this.updatePlayerUI();
    }

    setupYouTubeAPI() {
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                this.initYTPlayer();
            };
        } else {
            this.initYTPlayer();
        }
    }

    initYTPlayer() {
        const initialTrack = this.tracks[this.currentTrackIndex];
        let container = document.getElementById("ytIframeMount");
        if (!container) {
            container = document.createElement("div");
            container.id = "ytIframeMount";
            container.style.cssText = "position:fixed; bottom:-9999px; left:-9999px; width:1px; height:1px; opacity:0; pointer-events:none;";
            document.body.appendChild(container);
        }

        try {
            this.ytPlayer = new YT.Player("ytIframeMount", {
                height: "100%",
                width: "100%",
                videoId: initialTrack.type === "youtube" ? initialTrack.id : this.tracks[0].id,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    origin: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        this.isYtReady = true;
                        this.ytPlayer.setVolume(this.volume);
                        if (this.pendingPlay) {
                            this.pendingPlay = false;
                            this.play();
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === YT.PlayerState.PLAYING) {
                            this.setPlayingState(true);
                        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                            if (event.data === YT.PlayerState.ENDED) {
                                this.next();
                            } else {
                                this.setPlayingState(false);
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.warn("[Jukebox] YouTube API fallback mode:", e);
        }
    }

    bindDOM() {
        // Asegurar la presencia del Mini-Player Flotante si la página no lo tiene definido
        if (!document.getElementById("floatingJukeboxDock")) {
            const dock = document.createElement("div");
            dock.id = "floatingJukeboxDock";
            dock.className = "floating-jukebox-dock hidden-dock";
            dock.innerHTML = `
                <div class="mini-jb-vinyl" id="miniJbVinyl"></div>
                <div class="mini-jb-info">
                    <span class="mini-jb-title" id="miniJbTitle">Peacebloom Burn Slow</span>
                    <span class="mini-jb-artist" id="miniJbArtist">Barrens Boys</span>
                </div>
                <div class="mini-jb-actions">
                    <button class="mini-jb-btn" id="miniJbPlay" title="Reproducir / Pausar">▶</button>
                    <button class="mini-jb-btn" id="miniJbNext" title="Siguiente Pista">⏭</button>
                    <a href="index.html#fonoteca-taberna" class="mini-jb-btn" title="Ir a la Fonoteca" style="text-decoration: none;">🎶</a>
                    <button class="mini-jb-close" id="miniJbClose" title="Ocultar Mini-Player">×</button>
                </div>
            `;
            document.body.appendChild(dock);
        }

        // Botones de control en la sección principal (si existen)
        const btnPlay = document.getElementById("jbBtnPlay");
        const btnPrev = document.getElementById("jbBtnPrev");
        const btnNext = document.getElementById("jbBtnNext");
        const volSlider = document.getElementById("jbVolSlider");
        const btnMute = document.getElementById("jbBtnMute");

        if (btnPlay) btnPlay.addEventListener("click", () => this.togglePlay());
        if (btnPrev) btnPrev.addEventListener("click", () => this.prev());
        if (btnNext) btnNext.addEventListener("click", () => this.next());

        if (volSlider) {
            volSlider.addEventListener("input", (e) => {
                this.setVolume(parseInt(e.target.value, 10));
            });
        }

        if (btnMute) {
            btnMute.addEventListener("click", () => this.toggleMute());
        }

        // Mini-player flotante
        const miniPlay = document.getElementById("miniJbPlay");
        const miniNext = document.getElementById("miniJbNext");
        const miniClose = document.getElementById("miniJbClose");

        if (miniPlay) miniPlay.addEventListener("click", () => this.togglePlay());
        if (miniNext) miniNext.addEventListener("click", () => this.next());
        if (miniClose) {
            miniClose.addEventListener("click", () => {
                const dock = document.getElementById("floatingJukeboxDock");
                if (dock) dock.classList.add("hidden-dock");
            });
        }

        // Conectar con el botón original del Navbar (#ambientAudioBtn)
        const navAmbientBtn = document.getElementById("ambientAudioBtn");
        if (navAmbientBtn) {
            navAmbientBtn.addEventListener("click", (e) => {
                // Al hacer clic en el navbar, alternamos el Jukebox
                this.togglePlay();
            });
        }
    }

    renderPlaylist() {
        const listContainer = document.getElementById("jbPlaylistItems");
        if (!listContainer) return;

        listContainer.innerHTML = "";

        this.tracks.forEach((track, idx) => {
            const item = document.createElement("div");
            item.className = `jb-playlist-row ${idx === this.currentTrackIndex ? "active-track" : ""}`;
            item.setAttribute("data-track-index", idx);

            item.innerHTML = `
                <div class="jb-row-left">
                    <span class="jb-row-num">${idx + 1}</span>
                    <button class="jb-row-play-btn" aria-label="Reproducir pista ${idx + 1}">▶</button>
                    <div class="jb-row-meta">
                        <div class="jb-row-title">${track.title}</div>
                        <div class="jb-row-artist">${track.artist} · <span class="jb-row-genre">${track.genre}</span></div>
                    </div>
                </div>
                <div class="jb-row-right">
                    <span class="jb-row-badge">${track.badge}</span>
                    <a href="${track.channelUrl}" target="_blank" rel="noopener noreferrer" class="jb-row-link" title="Visitar canal oficial del creador">↗</a>
                </div>
            `;

            item.addEventListener("click", (e) => {
                if (e.target.tagName.toLowerCase() !== "a") {
                    this.loadTrack(idx, true);
                }
            });

            listContainer.appendChild(item);
        });
    }

    getAmbientSynth() {
        if (!this.ambientSynth && window.jainaAmbientAudio) {
            this.ambientSynth = window.jainaAmbientAudio;
        }
        return this.ambientSynth;
    }

    loadTrack(index, autoPlay = true) {
        if (index < 0) index = this.tracks.length - 1;
        if (index >= this.tracks.length) index = 0;

        this.currentTrackIndex = index;
        const track = this.tracks[index];

        // Detener sintetizador si estaba activo
        const prevSynth = this.getAmbientSynth();
        if (prevSynth && prevSynth.isPlaying) {
            prevSynth.stop();
        }

        if (track.type === "youtube") {
            if (this.ytPlayer && this.isYtReady && this.ytPlayer.loadVideoById) {
                if (autoPlay) {
                    this.ytPlayer.loadVideoById(track.id);
                } else {
                    this.ytPlayer.cueVideoById(track.id);
                }
            } else {
                this.pendingPlay = autoPlay;
            }
        } else if (track.type === "procedural") {
            if (this.ytPlayer && this.isYtReady && this.ytPlayer.pauseVideo) {
                this.ytPlayer.pauseVideo();
            }
            const synth = this.getAmbientSynth();
            if (synth) {
                synth.setVolume(this.isMuted ? 0 : this.volume);
                if (autoPlay) {
                    synth.play();
                    this.setPlayingState(true);
                }
            }
        }

        this.updatePlayerUI();
        this.renderPlaylist();
    }

    togglePlay() {
        const track = this.tracks[this.currentTrackIndex];

        if (track.type === "youtube") {
            if (!this.isYtReady || !this.ytPlayer) {
                this.pendingPlay = true;
                return;
            }
            if (this.isPlaying) {
                this.ytPlayer.pauseVideo();
                this.setPlayingState(false);
            } else {
                this.ytPlayer.playVideo();
                this.setPlayingState(true);
            }
        } else if (track.type === "procedural") {
            const synth = this.getAmbientSynth();
            if (synth) {
                synth.setVolume(this.isMuted ? 0 : this.volume);
                synth.toggle();
                this.setPlayingState(synth.isPlaying);
            }
        }
    }

    play() {
        const track = this.tracks[this.currentTrackIndex];
        if (track.type === "youtube") {
            if (this.ytPlayer && this.isYtReady && this.ytPlayer.playVideo) {
                this.ytPlayer.playVideo();
                this.setPlayingState(true);
            } else {
                this.pendingPlay = true;
            }
        } else if (track.type === "procedural") {
            const synth = this.getAmbientSynth();
            if (synth) {
                synth.setVolume(this.isMuted ? 0 : this.volume);
                synth.play();
                this.setPlayingState(true);
            }
        }
    }

    pause() {
        const track = this.tracks[this.currentTrackIndex];
        if (track.type === "youtube" && this.ytPlayer && this.isYtReady && this.ytPlayer.pauseVideo) {
            this.ytPlayer.pauseVideo();
        } else if (track.type === "procedural") {
            const synth = this.getAmbientSynth();
            if (synth) {
                synth.stop();
            }
        }
        this.setPlayingState(false);
    }

    next() {
        this.loadTrack(this.currentTrackIndex + 1, true);
    }

    prev() {
        this.loadTrack(this.currentTrackIndex - 1, true);
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(100, val));
        if (this.ytPlayer && this.isYtReady && this.ytPlayer.setVolume) {
            this.ytPlayer.setVolume(this.volume);
        }
        const synth = this.getAmbientSynth();
        if (synth && typeof synth.setVolume === "function") {
            synth.setVolume(this.isMuted ? 0 : this.volume);
        }
        this.isMuted = this.volume === 0;
        this.updateVolumeUI();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ytPlayer && this.isYtReady) {
            if (this.isMuted) {
                this.ytPlayer.mute();
            } else {
                this.ytPlayer.unMute();
                this.ytPlayer.setVolume(this.volume);
            }
        }
        const synth = this.getAmbientSynth();
        if (synth && typeof synth.setVolume === "function") {
            synth.setVolume(this.isMuted ? 0 : this.volume);
        }
        this.updateVolumeUI();
    }

    setPlayingState(playing) {
        this.isPlaying = playing;
        this.updatePlayerUI();
    }

    updatePlayerUI() {
        const track = this.tracks[this.currentTrackIndex];

        // Elementos principales de la sección
        const titleEl = document.getElementById("jbTrackTitle");
        const artistEl = document.getElementById("jbTrackArtist");
        const genreEl = document.getElementById("jbTrackGenre");
        const badgeEl = document.getElementById("jbTrackBadge");
        const descEl = document.getElementById("jbTrackDesc");
        const channelLink = document.getElementById("jbChannelLink");
        const playBtn = document.getElementById("jbBtnPlay");
        const vinylEl = document.getElementById("jbVinylDisc");

        if (titleEl) titleEl.textContent = track.title;
        if (artistEl) artistEl.textContent = track.artist;
        if (genreEl) genreEl.textContent = track.genre;
        if (badgeEl) badgeEl.textContent = track.badge;
        if (descEl) descEl.textContent = track.description;
        if (channelLink) channelLink.href = track.channelUrl;

        // Estado del botón Play principal
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying ? "❚❚" : "▶";
            playBtn.setAttribute("title", this.isPlaying ? "Pausar" : "Reproducir");
        }

        // Rotación del Vinilo
        if (vinylEl) {
            if (this.isPlaying) {
                vinylEl.classList.add("spinning");
            } else {
                vinylEl.classList.remove("spinning");
            }
        }

        // Mini Player Flotante
        const miniDock = document.getElementById("floatingJukeboxDock");
        const miniTitle = document.getElementById("miniJbTitle");
        const miniArtist = document.getElementById("miniJbArtist");
        const miniPlayBtn = document.getElementById("miniJbPlay");
        const miniVinyl = document.getElementById("miniJbVinyl");

        if (miniDock && this.isPlaying) {
            miniDock.classList.remove("hidden-dock");
        }

        if (miniTitle) miniTitle.textContent = track.title;
        if (miniArtist) miniArtist.textContent = track.artist;
        if (miniPlayBtn) miniPlayBtn.innerHTML = this.isPlaying ? "❚❚" : "▶";

        if (miniVinyl) {
            if (this.isPlaying) {
                miniVinyl.classList.add("spinning");
            } else {
                miniVinyl.classList.remove("spinning");
            }
        }

        // Animación de Ecualizador
        const eqBars = document.querySelectorAll(".jb-eq-bar, .equalizer-wave .eq-bar");
        eqBars.forEach((bar) => {
            if (this.isPlaying) {
                bar.classList.add("active-pulse");
            } else {
                bar.classList.remove("active-pulse");
            }
        });

        // Actualizar etiqueta del Navbar
        const navLabel = document.querySelector("#ambientAudioBtn .audio-label");
        const navBtn = document.getElementById("ambientAudioBtn");
        if (navLabel && navBtn) {
            if (this.isPlaying) {
                navBtn.classList.add("playing");
                navLabel.textContent = `🎶 ${track.title.substring(0, 14)}...`;
            } else {
                navBtn.classList.remove("playing");
                navLabel.textContent = "Fonoteca & Lo-Fi";
            }
        }
    }

    updateVolumeUI() {
        const slider = document.getElementById("jbVolSlider");
        const btnMute = document.getElementById("jbBtnMute");
        if (slider) slider.value = this.isMuted ? 0 : this.volume;
        if (btnMute) {
            btnMute.textContent = this.isMuted || this.volume === 0 ? "🔇" : (this.volume > 50 ? "🔊" : "🔉");
        }
    }
}

// Inicialización automática
document.addEventListener("DOMContentLoaded", () => {
    window.jainaJukebox = new JainaJukeboxEngine();
    window.jainaJukebox.init();
});
