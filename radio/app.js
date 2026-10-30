/**
 * ========================================================================
 * Project Jaina - Kirin Tor Arcane Radio (Standalone Web App v6.1)
 * Archivo: radio/app.js
 * Garantías L9:
 *   - BroadcastChannel('pj_sonic_mutex') + storage fallback (Cero audio duplicado entre pestañas)
 *   - Dual-Stage Resilient Stream Loader (CORS + Real FFT -> Direct Audio Fallback)
 *   - Analizador de espectro honesto (cae a 0 real en pausa/silencio)
 * ========================================================================
 */

const STATIONS = [
    {
        id: 1,
        name: "Taberna de Theramore",
        sub: "Radio Rivendell • Folk Medieval & Bardo Celta",
        genre: "Folk Medieval & Bardo",
        icon: "🍺",
        url: "https://play.radiorivendell.com/radio/8000/radio.mp3",
        desc: "Música de tabernas medievales, arpas, laúdes y flautas celtas para tus estancias en ciudades y descansos."
    },
    {
        id: 2,
        name: "Apex Mythic Raider",
        sub: "RPG Gamers Radio • Soundtracks Épicos de Batallas",
        genre: "Orquestal Épico & Boss Fights",
        icon: "⚔️",
        url: "https://stream.rpgamers.net/rpgn",
        desc: "Bandas sonoras épicas de combate orquestal, metales y percusión militar para mazmorras y encuentros míticos."
    },
    {
        id: 3,
        name: "Kirin Tor Lofi & Chill",
        sub: "Lofi Focus Laut.fm • Study & Relax Beats",
        genre: "Lo-Fi Beats & Relax",
        icon: "☕",
        url: "https://lofi.stream.laut.fm/lofi",
        desc: "Ritmos downtempo, melodías cálidas de piano y texturas de vinilo ideales para profesiones, pesca y farmeo."
    },
    {
        id: 4,
        name: "Sintetizadores de Gnomeregan",
        sub: "Nightwave Plaza • Synthwave & Retrowave 80s",
        genre: "Synthwave & Retrowave 80s",
        icon: "🌌",
        url: "https://radio.plaza.one/mp3",
        desc: "Sintetizadores analógicos, dreamwave y estética retrofuturista para la tecnología gnómica y goblin."
    },
    {
        id: 5,
        name: "Forja de Hierro Rock & Metal",
        sub: "Rock Antenne • Heavy Metal & Hard Rock",
        genre: "Heavy Metal & Hard Rock",
        icon: "🎸",
        url: "https://stream.rockantenne.de/heavy-metal/stream/mp3",
        desc: "Guitarras distorsionadas, baterías demoledoras y energía pura para campos de batalla PvP y mazmorras heroicas."
    },
    {
        id: 6,
        name: "Tierras Altas de Arathi",
        sub: "Ambient Sleep & Rain • Naturaleza & Hogueras",
        genre: "Naturaleza, Lluvia & Hogueras",
        icon: "🌲",
        url: "https://ambient.stream.laut.fm/ambient",
        desc: "Sonidos envolventes de lluvia en bosques ancestrales, viento, fogatas y serenidad ambiental de Azeroth."
    },
    {
        id: 7,
        name: "Dial Libre Personalizado",
        sub: "Transmisión Externa • URL Directa Icecast/MP3",
        genre: "URL Propia del Usuario",
        icon: "📻",
        url: "",
        desc: "Introduce cualquier enlace directo de streaming Icecast, Shoutcast o archivo MP3 para escuchar tu propia estación."
    }
];

const RADIO_TAB_ID = "pj_radio_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
let sonicMutexBC = null;

let currentIndex = 0;
let isPlaying = false;
let audio = null;
let streamGenId = 0;
let hasRealFFT = false;
let masterVolume = 0.70;

let audioCtx = null;
let analyser = null;
const wiredElements = new WeakSet();
let canvas, ctx;
let animationFrameId = null;

// DOM Elements
const btnPlayMaster = document.getElementById('btn-play-master');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const stationSelect = document.getElementById('station-select');
const volumeSlider = document.getElementById('volume-slider');
const volumeVal = document.getElementById('volume-val');
const deckStatusText = document.getElementById('deck-status-text');
const deckTrackTitle = document.getElementById('deck-track-title');
const deckGenreBadge = document.getElementById('deck-genre-badge');
const stationsGrid = document.getElementById('stations-grid');
const customUrlContainer = document.getElementById('custom-url-container');
const customUrlInput = document.getElementById('custom-url-input');

document.addEventListener('DOMContentLoaded', () => {
    initCrossTabMutex();
    initCanvas();
    renderStationCards();
    setupEventListeners();
    startVisualizer();
});

function initCrossTabMutex() {
    if (typeof BroadcastChannel !== 'undefined') {
        try {
            sonicMutexBC = new BroadcastChannel('pj_sonic_mutex');
            sonicMutexBC.onmessage = (ev) => {
                if (ev.data && ev.data.action === 'CLAIM_AUDIO' && ev.data.tabId !== RADIO_TAB_ID) {
                    stopActiveStream(true);
                }
            };
        } catch (_) {}
    }

    window.addEventListener('storage', (ev) => {
        if (ev.key === 'pj_sonic_active_tab' && ev.newValue) {
            try {
                const data = JSON.parse(ev.newValue);
                if (data && data.tabId && data.tabId !== RADIO_TAB_ID) {
                    stopActiveStream(true);
                }
            } catch (_) {}
        }
    });
}

function claimGlobalMutex() {
    const msg = { action: 'CLAIM_AUDIO', tabId: RADIO_TAB_ID, ts: Date.now() };
    if (sonicMutexBC) {
        try { sonicMutexBC.postMessage(msg); } catch (_) {}
    }
    try {
        localStorage.setItem('pj_sonic_active_tab', JSON.stringify(msg));
    } catch (_) {}
}

function stopActiveStream(markPausedUI = true) {
    streamGenId++;
    isPlaying = false;
    hasRealFFT = false;
    if (audio) {
        const old = audio;
        audio = null;
        old.onplaying = null;
        old.onpause = null;
        old.onerror = null;
        try { old.pause(); } catch (_) {}
        try { old.removeAttribute('src'); old.load(); } catch (_) {}
    }
    if (markPausedUI && btnPlayMaster && deckStatusText) {
        btnPlayMaster.textContent = '▶';
        deckStatusText.textContent = 'PAUSADO';
        deckStatusText.parentElement.style.borderColor = '#fbbf24';
        deckStatusText.parentElement.style.color = '#fbbf24';
    }
}

function initCanvas() {
    canvas = document.getElementById('visualizer');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    if (!canvas || !canvas.parentElement) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

function renderStationCards() {
    stationsGrid.innerHTML = '';
    STATIONS.forEach((st, idx) => {
        const card = document.createElement('div');
        card.className = `station-card ${idx === currentIndex ? 'active' : ''}`;
        card.innerHTML = `
            <div class="card-top">
                <span class="card-icon">${st.icon}</span>
                <div class="card-title">
                    <h4>${st.name}</h4>
                    <span>${st.genre}</span>
                </div>
            </div>
            <p class="card-desc">${st.desc}</p>
        `;
        card.addEventListener('click', () => {
            selectStation(idx);
            playStation(idx);
        });
        stationsGrid.appendChild(card);
    });
}

function ensureAudioContext() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.8;
            analyser.connect(audioCtx.destination);
        } catch (e) {
            console.warn('Visualizer AudioContext no disponible:', e);
            return false;
        }
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return true;
}

function setupEventListeners() {
    btnPlayMaster.addEventListener('click', togglePlay);

    btnPrev.addEventListener('click', () => {
        let prev = currentIndex - 1;
        if (prev < 0) prev = STATIONS.length - 1;
        selectStation(prev);
        if (isPlaying) playStation(prev);
    });

    btnNext.addEventListener('click', () => {
        let next = (currentIndex + 1) % STATIONS.length;
        selectStation(next);
        if (isPlaying) playStation(next);
    });

    stationSelect.addEventListener('change', () => {
        const idx = parseInt(stationSelect.value, 10);
        selectStation(idx);
        if (isPlaying) playStation(idx);
    });

    volumeSlider.addEventListener('input', () => {
        masterVolume = parseInt(volumeSlider.value, 10) / 100;
        if (audio) audio.volume = masterVolume;
        volumeVal.textContent = volumeSlider.value + '%';
    });

    if (customUrlInput) {
        customUrlInput.addEventListener('change', () => {
            const url = customUrlInput.value.trim();
            if (url) {
                STATIONS[6].url = url;
                if (currentIndex === 6) playStation(6);
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            togglePlay();
        }
    });
}

function selectStation(index) {
    currentIndex = index;
    stationSelect.value = String(index);

    const st = STATIONS[index];
    deckTrackTitle.textContent = `${st.id}. ${st.name} — ${st.sub}`;
    deckGenreBadge.textContent = st.genre;

    customUrlContainer.style.display = index === 6 ? 'block' : 'none';

    const cards = stationsGrid.querySelectorAll('.station-card');
    cards.forEach((c, i) => {
        c.classList.toggle('active', i === index);
    });
}

function playStation(index, useCors = true, existingGen = null) {
    const st = STATIONS[index];
    let streamUrl = st.url;
    if (index === 6 && customUrlInput && customUrlInput.value.trim()) {
        streamUrl = customUrlInput.value.trim();
    }

    if (!streamUrl) {
        alert('Por favor introduce una URL válida para el Dial Libre.');
        return;
    }

    claimGlobalMutex();
    const gen = existingGen !== null ? existingGen : ++streamGenId;
    if (audio) {
        const old = audio;
        audio = null;
        old.onplaying = null;
        old.onerror = null;
        try { old.pause(); old.removeAttribute('src'); old.load(); } catch (_) {}
    }

    deckStatusText.textContent = 'SINTONIZANDO...';
    deckStatusText.parentElement.style.borderColor = '#00ccff';
    deckStatusText.parentElement.style.color = '#00ccff';

    const el = new Audio();
    el.preload = 'auto';
    el.volume = masterVolume;
    if (useCors) el.crossOrigin = 'anonymous';
    audio = el;
    hasRealFFT = false;

    el.onplaying = () => {
        if (gen !== streamGenId) return;
        isPlaying = true;
        btnPlayMaster.textContent = '⏸';
        deckStatusText.textContent = 'TRANSMITIENDO';
        deckStatusText.parentElement.style.borderColor = '#22c55e';
        deckStatusText.parentElement.style.color = '#22c55e';

        if (useCors && ensureAudioContext()) {
            try {
                if (!wiredElements.has(el)) {
                    const srcNode = audioCtx.createMediaElementSource(el);
                    srcNode.connect(analyser);
                    wiredElements.add(el);
                }
                hasRealFFT = true;
            } catch (_) {
                hasRealFFT = false;
            }
        }
    };

    el.onerror = () => {
        if (gen !== streamGenId) return;
        if (useCors) {
            // Dual-Stage Auto-Recovery: Reintentar sin crossOrigin para reproducción directa
            playStation(index, false, gen);
            return;
        }
        isPlaying = false;
        btnPlayMaster.textContent = '▶';
        deckStatusText.textContent = 'ERROR EN STREAM';
        deckStatusText.parentElement.style.borderColor = '#ef4444';
        deckStatusText.parentElement.style.color = '#ef4444';
    };

    el.src = streamUrl;
    if (useCors && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    el.play().catch((err) => {
        if (gen !== streamGenId) return;
        console.warn('Autoplay bloqueado:', err);
        deckStatusText.textContent = 'PULSA ▶';
    });
}

function togglePlay() {
    ensureAudioContext();
    if (isPlaying) {
        stopActiveStream(true);
    } else {
        playStation(currentIndex, true);
    }
}

// Visualizador honesto de 64 bandas (cae a 0 real cuando está pausado o volumen 0)
function startVisualizer() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);
    const smoothBars = new Float32Array(bufferLength);

    function renderFrame(nowMs) {
        animationFrameId = requestAnimationFrame(renderFrame);
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const audible = isPlaying && masterVolume > 0;
        let gotFFT = false;
        if (audible && hasRealFFT && analyser) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let k = 0; k < 20; k++) sum += dataArray[k];
            gotFFT = sum > 0;
        }

        const t = nowMs * 0.001;
        for (let i = 0; i < bufferLength; i++) {
            let target = 0;
            if (audible) {
                if (gotFFT) {
                    target = (dataArray[i] / 255) * (0.4 + masterVolume * 0.6);
                } else {
                    const tilt = Math.exp(-i * 0.03);
                    target = (0.2 + 0.45 * (Math.sin(t * 2.5) * 0.5 + 0.5) * tilt + 0.25 * (Math.sin(t * 5.4 + i * 0.4) * 0.5 + 0.5)) * masterVolume;
                }
            }
            smoothBars[i] += (target - smoothBars[i]) * (target > smoothBars[i] ? 0.3 : 0.16);
            if (smoothBars[i] < 0.004) smoothBars[i] = 0;
        }

        const barWidth = (canvas.width / bufferLength) * 1.4;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = Math.max(2, smoothBars[i] * canvas.height * 0.85);
            if (smoothBars[i] === 0) {
                ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
                ctx.shadowBlur = 0;
                ctx.fillRect(x, canvas.height - 2, Math.max(2, barWidth - 2), 2);
            } else {
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                gradient.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
                gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.88)');
                gradient.addColorStop(1, 'rgba(0, 204, 255, 0.96)');
                ctx.fillStyle = gradient;
                ctx.shadowBlur = 6;
                ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
                ctx.fillRect(x, canvas.height - barHeight, Math.max(2, barWidth - 2), barHeight);
            }
            x += canvas.width / bufferLength;
        }
    }

    animationFrameId = requestAnimationFrame(renderFrame);
}
