/**
 * ========================================================================
 * Project Jaina - Kirin Tor Arcane Radio (Standalone Web App)
 * Archivo: radio/app.js
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

let currentIndex = 0;
let isPlaying = false;
let audio = new Audio();
audio.crossOrigin = "anonymous";
let masterVolume = 0.70;

let audioCtx = null;
let analyser = null;
let sourceNode = null;
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
    initCanvas();
    renderStationCards();
    setupEventListeners();
    setupAudioContext();
});

function initCanvas() {
    canvas = document.getElementById('visualizer');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    if (!canvas) return;
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
            if (!isPlaying) togglePlay();
        });
        stationsGrid.appendChild(card);
    });
}

function setupAudioContext() {
    audio.volume = masterVolume;

    audio.addEventListener('playing', () => {
        isPlaying = true;
        btnPlayMaster.textContent = '⏸';
        deckStatusText.textContent = 'TRANSMITIENDO';
        deckStatusText.parentElement.style.borderColor = '#22c55e';
        deckStatusText.parentElement.style.color = '#22c55e';
        startVisualizer();
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        btnPlayMaster.textContent = '▶';
        deckStatusText.textContent = 'PAUSADO';
        deckStatusText.parentElement.style.borderColor = '#fbbf24';
        deckStatusText.parentElement.style.color = '#fbbf24';
    });

    audio.addEventListener('error', (e) => {
        console.error('Audio stream error:', e);
        isPlaying = false;
        btnPlayMaster.textContent = '▶';
        deckStatusText.textContent = 'ERROR EN STREAM';
        deckStatusText.parentElement.style.borderColor = '#ef4444';
        deckStatusText.parentElement.style.color = '#ef4444';
    });
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
        audio.volume = masterVolume;
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

    // Tecla Espacio para reproducir/pausar
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

    if (index === 6) {
        customUrlContainer.style.display = 'block';
    } else {
        customUrlContainer.style.display = 'none';
    }

    // Actualizar tarjetas activas
    const cards = stationsGrid.querySelectorAll('.station-card');
    cards.forEach((c, i) => {
        if (i === index) c.classList.add('active');
        else c.classList.remove('active');
    });
}

function playStation(index) {
    const st = STATIONS[index];
    let streamUrl = st.url;
    if (index === 6 && customUrlInput && customUrlInput.value.trim()) {
        streamUrl = customUrlInput.value.trim();
    }

    if (!streamUrl) {
        alert('Por favor introduce una URL válida para el Dial Libre.');
        return;
    }

    deckStatusText.textContent = 'SINTONIZANDO...';
    deckStatusText.parentElement.style.borderColor = '#00ccff';
    deckStatusText.parentElement.style.color = '#00ccff';

    audio.src = streamUrl;
    audio.load();
    audio.play().catch(err => {
        console.warn('Autoplay bloqueado:', err);
        deckStatusText.textContent = 'PULSA ▶';
    });
}

function togglePlay() {
    // Inicializar Web Audio API en el primer gesto
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            sourceNode = audioCtx.createMediaElementSource(audio);
            sourceNode.connect(analyser);
            analyser.connect(audioCtx.destination);
        } catch (e) {
            console.warn('Visualizer AudioContext no disponible:', e);
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (isPlaying) {
        audio.pause();
    } else {
        playStation(currentIndex);
    }
}

// Bucle de Visualizador de Barras Kirin Tor
function startVisualizer() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    function renderFrame() {
        animationFrameId = requestAnimationFrame(renderFrame);

        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (analyser && isPlaying) {
            analyser.getByteFrequencyData(dataArray);
        } else {
            // Animación sutil de reposo
            for (let i = 0; i < bufferLength; i++) {
                dataArray[i] = Math.sin(Date.now() / 400 + i) * 15 + 20;
            }
        }

        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

            // Degradado Kirin Tor (Gold a Cyan)
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
            gradient.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
            gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.85)');
            gradient.addColorStop(1, 'rgba(0, 204, 255, 0.95)');

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

            x += barWidth;
        }
    }

    renderFrame();
}
