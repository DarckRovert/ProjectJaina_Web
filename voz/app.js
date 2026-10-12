/**
 * ========================================================================
 * Project Jaina - Cliente Web de Voz Espacial 3D (app.js)
 * Reino: Project Jaina | Servidor: https://projectjaina.com/
 * ========================================================================
 * Captura de Micrófono con Supresión de Ruido, Detección de Actividad de Voz (VAD),
 * Señalización WebRTC y Motor de Renderizado Binaural 3D (Web Audio API HRTF).
 */

// Elementos DOM
const loginCard = document.getElementById('login-card');
const voiceCard = document.getElementById('voice-card');
const pinForm = document.getElementById('pin-form');
const pinInput = document.getElementById('pin-input');
const btnConnect = document.getElementById('btn-connect');
const btnDisconnect = document.getElementById('btn-disconnect');
const charNameEl = document.getElementById('char-name');
const avatarRingEl = document.getElementById('avatar-ring');
const vuBarEl = document.getElementById('vu-bar');
const btnToggleMic = document.getElementById('btn-toggle-mic');
const micIconEl = document.getElementById('mic-icon');
const micBtnTextEl = document.getElementById('mic-btn-text');
const micStatusTextEl = document.getElementById('mic-status-text');
const sliderVolume = document.getElementById('slider-volume');
const volumeValEl = document.getElementById('volume-val');
const sliderGate = document.getElementById('slider-gate');
const gateValEl = document.getElementById('gate-val');
const peersListEl = document.getElementById('peers-list');
const nearbyCountEl = document.getElementById('nearby-count');
const serverSelect = document.getElementById('server-select');
const customServerInput = document.getElementById('custom-server-input');

function initServerSelector() {
    if (!serverSelect) return;
    const saved = localStorage.getItem('projectjaina_voice_server');
    if (saved) {
        if (saved === 'http://193.84.88.26:3050' || saved === 'http://localhost:3050') {
            serverSelect.value = saved;
            if (customServerInput) customServerInput.style.display = 'none';
        } else {
            serverSelect.value = 'custom';
            if (customServerInput) {
                customServerInput.value = saved;
                customServerInput.style.display = 'block';
            }
        }
    } else {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            serverSelect.value = 'http://localhost:3050';
        } else {
            serverSelect.value = 'http://193.84.88.26:3050';
        }
    }

    serverSelect.addEventListener('change', () => {
        if (serverSelect.value === 'custom') {
            if (customServerInput) {
                customServerInput.style.display = 'block';
                customServerInput.focus();
            }
        } else {
            if (customServerInput) customServerInput.style.display = 'none';
            localStorage.setItem('projectjaina_voice_server', serverSelect.value);
        }
    });

    if (customServerInput) {
        customServerInput.addEventListener('input', () => {
            const val = customServerInput.value.trim();
            if (val) localStorage.setItem('projectjaina_voice_server', val);
        });
    }
}

function getVoiceServerBaseUrl() {
    const saved = localStorage.getItem('projectjaina_voice_server');
    if (saved) return saved.replace(/\/+$/, '');
    if (serverSelect && serverSelect.value !== 'custom') {
        return serverSelect.value.replace(/\/+$/, '');
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3050';
    }
    return 'http://193.84.88.26:3050';
}

// Configuración de WebRTC (STUN público de alta velocidad)
const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Estado Local de la Sesión
let audioContext = null;
let localStream = null;
let analyserNode = null;
let isMicMuted = false;
let isLocalSpeaking = false;
let noiseGateThreshold = 15; // Porcentaje
let masterVolume = 1.0;
let ws = null;
let currentCharacter = null;
let peerConnections = new Map(); // peerGuid -> { pc, panner, gain, sourceStream }

// --------------------------------------------------------------------------
// 1. Inicialización y Vinculación con PIN
// --------------------------------------------------------------------------
pinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = pinInput.value.trim();
    if (!pin || pin.length !== 6) return;

    btnConnect.disabled = true;
    btnConnect.querySelector('.btn-text').textContent = 'Vinculando...';

    try {
        // Inicializar AudioContext mediante gesto de usuario
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Capturar micrófono con filtros de hardware de navegador
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        // Configurar analizador de voz para VAD
        setupLocalAudioAnalyser();

        const baseUrl = getVoiceServerBaseUrl();
        // Validar PIN contra el backend
        const response = await fetch(`${baseUrl}/api/verify-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });

        const data = await response.json();
        if (!data.success) {
            alert(data.error || 'Error verificando PIN');
            btnConnect.disabled = false;
            btnConnect.querySelector('.btn-text').textContent = 'Conectar a la Voz';
            return;
        }

        currentCharacter = data.character;
        charNameEl.textContent = currentCharacter.name;

        // Conectar WebSocket de Señalización y Coordenadas
        connectWebSocket(data.token);

    } catch (err) {
        console.error('Error al iniciar audio o sesión:', err);
        alert('No se pudo acceder al micrófono: ' + err.message);
        btnConnect.disabled = false;
        btnConnect.querySelector('.btn-text').textContent = 'Conectar a la Voz';
    }
});

// --------------------------------------------------------------------------
// 2. Analizador de Micrófono & VAD (Voice Activity Detection)
// --------------------------------------------------------------------------
function setupLocalAudioAnalyser() {
    const source = audioContext.createMediaStreamSource(localStream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 512;
    analyserNode.smoothingTimeConstant = 0.4;
    source.connect(analyserNode);

    const buffer = new Uint8Array(analyserNode.frequencyBinCount);
    let silenceTicks = 0;

    function monitorMic() {
        if (!analyserNode) return;

        analyserNode.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const volumePercent = Math.min(100, Math.round((avg / 128) * 100));

        // Actualizar VU-meter
        if (isMicMuted) {
            vuBarEl.style.width = '0%';
        } else {
            vuBarEl.style.width = volumePercent + '%';
        }

        // Lógica de Puerta de Ruido (VAD)
        if (!isMicMuted && volumePercent > noiseGateThreshold) {
            silenceTicks = 0;
            if (!isLocalSpeaking) {
                isLocalSpeaking = true;
                avatarRingEl.classList.add('speaking');
                sendAudioState(true);
            }
        } else {
            silenceTicks++;
            if (silenceTicks > 8 && isLocalSpeaking) { // ~130ms de gracia
                isLocalSpeaking = false;
                avatarRingEl.classList.remove('speaking');
                sendAudioState(false);
            }
        }

        requestAnimationFrame(monitorMic);
    }

    monitorMic();
}

function sendAudioState(speaking) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'audio-state',
            speaking
        }));
    }
}

// --------------------------------------------------------------------------
// 3. Conexión WebSocket y Señalización WebRTC
// --------------------------------------------------------------------------
function connectWebSocket(token) {
    const baseUrl = getVoiceServerBaseUrl();
    const isHttps = baseUrl.startsWith('https:');
    const wsProto = isHttps ? 'wss:' : 'ws:';
    const host = baseUrl.replace(/^https?:\/\//, '');
    ws = new WebSocket(`${wsProto}//${host}?token=${token}`);

    ws.onopen = () => {
        loginCard.classList.add('hidden');
        voiceCard.classList.remove('hidden');
    };

    ws.onmessage = async (event) => {
        try {
            const msg = JSON.parse(event.data);

            // 3.1 Actualización de Proximidad 3D y Telemetría
            if (msg.type === 'proximity-update') {
                handleProximityUpdate(msg.peers || []);
            }

            // 3.2 Nuevo par entra en rango auditivo (<= 25 yardas)
            else if (msg.type === 'peer-joined') {
                if (msg.initiator) {
                    await initiatePeerConnection(msg.guid, msg.name);
                }
            }

            // 3.3 Par sale de rango auditivo (> 25 yardas)
            else if (msg.type === 'peer-left') {
                closePeerConnection(msg.guid);
            }

            // 3.4 Señalización WebRTC (Offer, Answer, ICE Candidate)
            else if (msg.type === 'signal') {
                handleRemoteSignal(msg.fromGuid, msg.fromName, msg.signal);
            }

        } catch (err) {
            console.error('Error procesando mensaje WS:', err);
        }
    };

    ws.onclose = () => {
        handleDisconnect();
    };
}

// --------------------------------------------------------------------------
// 4. Motor de Audio 3D Binaural (HRTF Panner) por Par
// --------------------------------------------------------------------------
function setupSpatialAudioNode(remoteStream, peerGuid) {
    const source = audioContext.createMediaStreamSource(remoteStream);

    // Nodo de Paneo 3D Binaural
    const panner = audioContext.createPanner();
    panner.panningModel = 'HRTF'; // Head-Related Transfer Function
    panner.distanceModel = 'inverse';
    panner.refDistance = 2.0;      // Volumen 100% hasta 2m
    panner.maxDistance = 25.0;     // Atenuación total a 25m
    panner.rolloffFactor = 1.3;

    // Nodo de Ganancia / Volumen
    const gain = audioContext.createGain();
    gain.gain.value = masterVolume;

    source.connect(panner);
    panner.connect(gain);
    gain.connect(audioContext.destination);

    return { panner, gain };
}

// --------------------------------------------------------------------------
// 5. Gestión de Conexiones P2P WebRTC
// --------------------------------------------------------------------------
async function createPeer(peerGuid, peerName) {
    if (peerConnections.has(peerGuid)) {
        return peerConnections.get(peerGuid);
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    const peerData = {
        pc,
        name: peerName,
        panner: null,
        gain: null
    };
    peerConnections.set(peerGuid, peerData);

    // Añadir pista de micrófono local
    localStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });

    // Envío de candidatos ICE
    pc.onicecandidate = (e) => {
        if (e.candidate && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'signal',
                targetGuid: peerGuid,
                signal: { candidate: e.candidate }
            }));
        }
    };

    // Recepción de audio remoto
    pc.ontrack = (e) => {
        if (e.streams && e.streams[0]) {
            const { panner, gain } = setupSpatialAudioNode(e.streams[0], peerGuid);
            peerData.panner = panner;
            peerData.gain = gain;
        }
    };

    return peerData;
}

async function initiatePeerConnection(peerGuid, peerName) {
    const peerData = await createPeer(peerGuid, peerName);
    const offer = await peerData.pc.createOffer();
    await peerData.pc.setLocalDescription(offer);

    ws.send(JSON.stringify({
        type: 'signal',
        targetGuid: peerGuid,
        signal: { sdp: peerData.pc.localDescription }
    }));
}

async function handleRemoteSignal(fromGuid, fromName, signal) {
    const peerData = await createPeer(fromGuid, fromName);
    const pc = peerData.pc;

    if (signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        if (signal.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({
                type: 'signal',
                targetGuid: fromGuid,
                signal: { sdp: pc.localDescription }
            }));
        }

        // Aplicar candidatos ICE acumulados antes de completar setRemoteDescription
        if (peerData.pendingCandidates && peerData.pendingCandidates.length > 0) {
            for (const cand of peerData.pendingCandidates) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                    console.error('Error aplicando ICE candidate pendiente:', e);
                }
            }
            peerData.pendingCandidates = [];
        }
    } else if (signal.candidate) {
        if (!pc.remoteDescription) {
            peerData.pendingCandidates = peerData.pendingCandidates || [];
            peerData.pendingCandidates.push(signal.candidate);
        } else {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            } catch (e) {
                console.error('Error añadiendo ICE candidate:', e);
            }
        }
    }
}

function closePeerConnection(peerGuid) {
    const peerData = peerConnections.get(peerGuid);
    if (peerData) {
        if (peerData.pc) peerData.pc.close();
        if (peerData.gain) {
            try { peerData.gain.disconnect(); } catch (e) {}
        }
        if (peerData.panner) {
            try { peerData.panner.disconnect(); } catch (e) {}
        }
        peerConnections.delete(peerGuid);
    }
}

// --------------------------------------------------------------------------
// 6. Actualización Espacial 3D y Renderizado del Radar
// --------------------------------------------------------------------------
function handleProximityUpdate(peers) {
    nearbyCountEl.textContent = `${peers.length} cerca`;

    if (peers.length === 0) {
        peersListEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧭</div>
                <p>No hay otros aventureros hablando en un radio de 25 yardas.</p>
                <small>Conforme te acerques a otros personajes en el mundo, sus voces se orientarán automáticamente en tus auriculares.</small>
            </div>
        `;
        return;
    }

    let html = '';
    const now = audioContext ? audioContext.currentTime : 0;

    for (const p of peers) {
        // Actualizar coordenadas del PannerNode si existe conexión de audio
        const peerData = peerConnections.get(p.guid);
        if (peerData && peerData.panner && peerData.gain) {
            // Suavizado en tiempo para evitar clics acústicos
            peerData.panner.positionX.setTargetAtTime(p.relX, now, 0.05);
            peerData.panner.positionY.setTargetAtTime(p.relY, now, 0.05);
            peerData.panner.positionZ.setTargetAtTime(p.relZ, now, 0.05);
            peerData.gain.gain.setTargetAtTime(p.volume * masterVolume, now, 0.05);
        }

        // Dirección cardinal relativa
        let dirLabel = 'Frente';
        if (p.relX > 2) dirLabel = 'Derecha';
        else if (p.relX < -2) dirLabel = 'Izquierda';
        if (p.relZ < -2) dirLabel = 'Atrás ' + (p.relX > 2 ? 'Der' : p.relX < -2 ? 'Izq' : '');

        html += `
            <div class="peer-item ${p.isSpeaking ? 'speaking' : ''}">
                <div class="peer-meta">
                    <span class="peer-icon">${p.isSpeaking ? '🔊' : '🎧'}</span>
                    <div>
                        <div class="peer-name">${p.name}</div>
                        <div class="peer-distance">${p.distance} yardas (${dirLabel})</div>
                    </div>
                </div>
                <div class="peer-spatial-info">
                    <div>Volumen: ${Math.round(p.volume * 100)}%</div>
                    <small>${p.isSpeaking ? '<span style="color:#10b981;">Hablando</span>' : 'En silencio'}</small>
                </div>
            </div>
        `;
    }

    peersListEl.innerHTML = html;
}

// --------------------------------------------------------------------------
// 7. Controles de UI (Mute, Sliders, Desconectar)
// --------------------------------------------------------------------------
btnToggleMic.addEventListener('click', () => {
    if (!localStream) return;
    isMicMuted = !isMicMuted;

    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicMuted;
    });

    if (isMicMuted) {
        btnToggleMic.classList.add('muted');
        micIconEl.textContent = '🔇';
        micBtnTextEl.textContent = 'Reanudar Micro';
        micStatusTextEl.textContent = 'Silenciado';
        micStatusTextEl.classList.add('muted');
        vuBarEl.style.width = '0%';
        sendAudioState(false);
    } else {
        btnToggleMic.classList.remove('muted');
        micIconEl.textContent = '🎤';
        micBtnTextEl.textContent = 'Silenciar Micro';
        micStatusTextEl.textContent = 'Escuchando';
        micStatusTextEl.classList.remove('muted');
    }
});

sliderVolume.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    volumeValEl.textContent = val + '%';
    masterVolume = val / 100;
});

sliderGate.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    gateValEl.textContent = val + '%';
    noiseGateThreshold = val;
});

btnDisconnect.addEventListener('click', () => {
    handleDisconnect();
});

function handleDisconnect() {
    if (ws) {
        ws.close();
        ws = null;
    }

    for (const peerData of peerConnections.values()) {
        if (peerData.pc) peerData.pc.close();
        if (peerData.gain) {
            try { peerData.gain.disconnect(); } catch (e) {}
        }
        if (peerData.panner) {
            try { peerData.panner.disconnect(); } catch (e) {}
        }
    }
    peerConnections.clear();

    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
    }

    loginCard.classList.remove('hidden');
    voiceCard.classList.add('hidden');
    btnConnect.disabled = false;
    btnConnect.querySelector('.btn-text').textContent = 'Conectar a la Voz';
    pinInput.value = '';
}

// Inicializar selector de servidor
initServerSelector();
