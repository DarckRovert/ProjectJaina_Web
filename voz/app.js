/**
 * ========================================================================
 * Project Jaina - Cliente Web de Voz Espacial 3D (app.js)
 * Reino: Project Jaina | Web Oficial: https://darckrovert.github.io/ProjectJaina_Web/
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

const PUBLIC_GATEWAY_URL = 'https://ingrainedly-easeled-edelmira.ngrok-free.dev';

const KNOWN_SERVERS = [
    PUBLIC_GATEWAY_URL,
    'https://localhost:3050',
    'http://localhost:3050',
    'https://127.0.0.1:3050',
    'http://127.0.0.1:3050',
    'https://26.140.157.205:3050',
    'http://26.140.157.205:3050'
];

function initServerSelector() {
    if (!serverSelect) return;

    // Si la web se sirve directamente desde el Voice Coordinator (puerto 3050)
    if (window.location.port === '3050' || window.location.origin.includes(':3050')) {
        let optDirect = serverSelect.querySelector('option[value="direct"]');
        if (!optDirect) {
            optDirect = document.createElement('option');
            optDirect.value = 'direct';
            optDirect.textContent = `⚡ Conexión Directa Local (${window.location.origin})`;
            serverSelect.insertBefore(optDirect, serverSelect.firstChild);
        }
        serverSelect.value = 'direct';
        if (customServerInput) customServerInput.style.display = 'none';
        const localHint = document.getElementById('local-server-hint');
        if (localHint) localHint.style.display = 'none';
        return;
    }

    const saved = localStorage.getItem('projectjaina_voice_server');
    
    if (saved) {
        if (KNOWN_SERVERS.includes(saved)) {
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
        // Por defecto en web pública conectar al Gateway Oficial Global sin requerir VPN
        if (window.location.hostname.includes('github.io') || !window.location.hostname.includes('localhost')) {
            serverSelect.value = PUBLIC_GATEWAY_URL;
        } else {
            serverSelect.value = window.location.protocol === 'https:' ? 'https://localhost:3050' : 'http://localhost:3050';
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
    // Si la web se sirve directamente desde el Voice Coordinator (puerto 3050)
    if (window.location.port === '3050' || window.location.origin.includes(':3050') || (serverSelect && serverSelect.value === 'direct')) {
        return window.location.origin;
    }
    const saved = localStorage.getItem('projectjaina_voice_server');
    if (saved && (KNOWN_SERVERS.includes(saved) || (customServerInput && saved === customServerInput.value.trim()))) {
        return saved.replace(/\/+$/, '');
    }
    if (serverSelect && serverSelect.value !== 'custom') {
        return serverSelect.value.replace(/\/+$/, '');
    }
    if (window.location.hostname.includes('github.io') || !window.location.hostname.includes('localhost')) {
        return PUBLIC_GATEWAY_URL;
    }
    return window.location.protocol === 'https:' ? 'https://localhost:3050' : 'http://localhost:3050';
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
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
        } catch (micErr) {
            console.error('Error al capturar micrófono:', micErr);
            alert('No se pudo acceder al micrófono: ' + micErr.message + '\n\nVerifica los permisos de audio en tu navegador o conecta tus audífonos con micrófono.');
            btnConnect.disabled = false;
            btnConnect.querySelector('.btn-text').textContent = 'Conectar a la Voz';
            return;
        }

        // Configurar analizador de voz para VAD
        setupLocalAudioAnalyser();

        const baseUrl = getVoiceServerBaseUrl();

        // Validar PIN contra el backend
        let response, data;
        try {
            response = await fetch(`${baseUrl}/api/verify-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });
            data = await response.json();
        } catch (netErr) {
            console.error('Error al conectar con servidor de voz:', netErr);
            handleVoiceConnectionError(baseUrl, netErr);
            btnConnect.disabled = false;
            btnConnect.querySelector('.btn-text').textContent = 'Conectar a la Voz';
            return;
        }

        if (!data || !data.success) {
            alert((data && data.error) || 'Error verificando PIN. Asegúrate de escribir /voz dentro del juego para obtener un código fresco.');
            btnConnect.disabled = false;
            btnConnect.querySelector('.btn-text').textContent = 'Conectar a la Voz';
            return;
        }

        currentCharacter = data.character;
        charNameEl.textContent = currentCharacter.name;

        // Conectar WebSocket de Señalización y Coordenadas
        connectWebSocket(data.token);

    } catch (err) {
        console.error('Error general de sesión:', err);
        alert('Error inesperado: ' + err.message);
        btnConnect.disabled = false;
        btnConnect.querySelector('.btn-text').textContent = 'Conectar a la Voz';
    }
});

function handleVoiceConnectionError(baseUrl, netErr) {
    const isCrossOrigin = window.location.origin !== baseUrl;
    const isHttpsTarget = baseUrl.startsWith('https:');
    const isLocalOrPrivateTarget = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || baseUrl.includes('26.') || baseUrl.includes('192.168.');

    let alertBox = document.getElementById('voice-conn-alert');
    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'voice-conn-alert';
        alertBox.className = 'info-alert';
        pinForm.parentNode.insertBefore(alertBox, pinForm.nextSibling);
    }
    alertBox.classList.remove('hidden');

    if (window.location.protocol === 'https:' && baseUrl.startsWith('http:')) {
        alertBox.style.cssText = 'border-left: 3px solid #f59e0b; background: rgba(245, 158, 11, 0.12); margin-top: 16px; display: flex; gap: 12px; padding: 14px 16px; border-radius: 8px; text-align: left;';
        alertBox.innerHTML = `
            <div class="alert-icon" style="font-size: 1.4rem;">⚠️</div>
            <div class="alert-content">
                <strong style="color: #f59e0b; display: block; font-size: 0.9rem; margin-bottom: 4px;">Contenido Mixto Bloqueado (HTTPS ➔ HTTP)</strong>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.4;">Esta página se cargó por HTTPS seguro pero el servidor de voz seleccionado usa HTTP sin cifrar. Tu navegador impide peticiones inseguras cruzadas.</p>
                <div style="margin-top: 10px;">
                    <a href="${baseUrl}/" class="btn btn-secondary btn-sm" style="color: #00ccff; text-decoration: none;">Abrir ${baseUrl} directamente</a>
                </div>
            </div>
        `;
        alert(`⚠️ AVISO DE CONTENIDO MIXTO:\nTu navegador bloqueó la conexión a ${baseUrl} porque esta página se cargó por HTTPS pero el servidor seleccionado usa HTTP.\n\nSOLUCIÓN: Abre la interfaz directamente desde tu servidor local en: ${baseUrl}/`);
    } else if (isCrossOrigin && isHttpsTarget && isLocalOrPrivateTarget) {
        alertBox.style.cssText = 'border-left: 3px solid #00ccff; background: rgba(0, 204, 255, 0.1); margin-top: 16px; display: flex; gap: 12px; padding: 14px 16px; border-radius: 8px; text-align: left;';
        alertBox.innerHTML = `
            <div class="alert-icon" style="font-size: 1.4rem;">🔒</div>
            <div class="alert-content">
                <strong style="color: #00ccff; display: block; font-size: 0.9rem; margin-bottom: 4px;">Autorización de Certificado SSL Requerida</strong>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.4;">El servidor local (<code>${baseUrl}</code>) utiliza un certificado SSL seguro auto-firmado para WebRTC. Los navegadores modernos bloquean peticiones en segundo plano desde páginas externas (como GitHub Pages) hasta que autorices el certificado.</p>
                <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <a href="${baseUrl}/" class="btn btn-primary btn-sm" style="text-decoration: none; padding: 8px 16px; font-weight: 600;">👉 Abrir Aplicación Directa (${baseUrl})</a>
                    <a href="${baseUrl}/api/status" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration: none; padding: 8px 14px;">Autorizar en Pestaña</a>
                </div>
            </div>
        `;
        alert(`🔒 AUTORIZACIÓN DE CERTIFICADO REQUERIDA:\n\nEl servidor de voz local en ${baseUrl} utiliza un certificado SSL auto-firmado para WebRTC.\nTu navegador bloqueó la conexión en segundo plano desde GitHub Pages.\n\nSOLUCIONES:\n1. Recomendada: Abre la aplicación directamente en tu navegador en:\n   ${baseUrl}/\n   (En Edge/Chrome pulsa "Configuración avanzada" -> "Continuar").\n\n2. O autoriza el certificado abriendo en una pestaña:\n   ${baseUrl}/api/status\n   y luego regresa aquí y pulsa "Conectar a la Voz".`);
    } else {
        alertBox.style.cssText = 'border-left: 3px solid #ef4444; background: rgba(239, 68, 68, 0.1); margin-top: 16px; display: flex; gap: 12px; padding: 14px 16px; border-radius: 8px; text-align: left;';
        alertBox.innerHTML = `
            <div class="alert-icon" style="font-size: 1.4rem;">❌</div>
            <div class="alert-content">
                <strong style="color: #ef4444; display: block; font-size: 0.9rem; margin-bottom: 4px;">No se pudo conectar al Servidor de Voz</strong>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.4;">No hay respuesta en <code>${baseUrl}</code>. Comprueba que el microservicio esté iniciado ejecutando <code>Iniciar_Voz_Espacial.bat</code> en la carpeta del servidor.</p>
            </div>
        `;
        alert(`No se pudo conectar al servidor de voz en: ${baseUrl}\n\nVerifica que el servicio esté iniciado (puerto 3050) ejecutando Iniciar_Voz_Espacial.bat.`);
    }
}

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
    const host = baseUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const wsPath = host.includes('ngrok') || host.includes('projectjaina') || host.includes(':8080') ? '/voice-ws' : '';
    ws = new WebSocket(`${wsProto}//${host}${wsPath}?token=${token}`);

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

            // 3.5 Control Remoto de Radio In-Game
            else if (msg.type === 'radio-command') {
                if (msg.action === 'play') {
                    if (!isRadioPlaying) toggleRadioPlayback();
                } else if (msg.action === 'pause' || msg.action === 'stop') {
                    if (isRadioPlaying) toggleRadioPlayback();
                } else if (msg.action === 'next') {
                    let next = (radioIndex + 1) % RADIO_STATIONS.length;
                    selectRadioStation(next);
                    if (!isRadioPlaying) toggleRadioPlayback();
                } else if (msg.action === 'prev') {
                    let prev = radioIndex - 1;
                    if (prev < 0) prev = RADIO_STATIONS.length - 1;
                    selectRadioStation(prev);
                    if (!isRadioPlaying) toggleRadioPlayback();
                } else if (msg.action === 'station') {
                    let st = (parseInt(msg.station, 10) - 1);
                    if (st >= 0 && st < RADIO_STATIONS.length) {
                        selectRadioStation(st);
                        if (!isRadioPlaying) toggleRadioPlayback();
                    }
                } else if (msg.action === 'volume') {
                    let v = parseInt(msg.volume, 10);
                    if (!isNaN(v)) {
                        elRadioVolSlider.value = Math.max(0, Math.min(100, v));
                        radioMasterVolume = elRadioVolSlider.value / 100;
                        elRadioVolVal.textContent = elRadioVolSlider.value + '%';
                        if (!isAudioDucked) radioAudio.volume = radioMasterVolume;
                    }
                }
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

        // Dirección cardinal relativa (Web Audio API: relZ < 0 es Frente, relZ > 0 es Atrás)
        let dirLabel = 'Frente';
        if (p.relX > 2) dirLabel = 'Derecha';
        else if (p.relX < -2) dirLabel = 'Izquierda';

        if (p.relZ > 2) {
            dirLabel = 'Atrás' + (p.relX > 2 ? ' Der' : p.relX < -2 ? ' Izq' : '');
        } else if (p.relZ < -2) {
            dirLabel = 'Frente' + (p.relX > 2 ? ' Der' : p.relX < -2 ? ' Izq' : '');
        }

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
    
    // Auto-Ducking: comprobar si algún aventurero cercano está hablando
    const isAnyoneSpeaking = (peers || []).some(p => p.speaking);
    applyAutoDucking(isAnyoneSpeaking);
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
    initRadioEngine();


// ==============================================================================
// 5. MOTOR DE RADIO EN VIVO 24/7 (KIRIN TOR RADIO / RADIO JAINA)
// ==============================================================================
const RADIO_STATIONS = [
    { id: 1, name: "Taberna de Theramore (Folk Medieval)", url: "https://play.radiorivendell.com/radio/8000/radio.mp3", genre: "Folk Celta & Bardo Medieval" },
    { id: 2, name: "Apex Mythic Raider (Epic Orchestral)", url: "https://stream.rpgamers.net/rpgn", genre: "Soundtracks Épicos de Batallas" },
    { id: 3, name: "Kirin Tor Lofi & Chill (Study Beats)", url: "https://lofi.stream.laut.fm/lofi", genre: "Lo-Fi Beats & Relax" },
    { id: 4, name: "Sintetizadores de Gnomeregan (Synthwave)", url: "https://radio.plaza.one/mp3", genre: "Synthwave & Retrowave 80s" },
    { id: 5, name: "Forja de Hierro Rock & Metal", url: "https://stream.rockantenne.de/heavy-metal/stream/mp3", genre: "Heavy Metal & Hard Rock" },
    { id: 6, name: "Tierras Altas de Arathi (Ambient)", url: "https://ambient.stream.laut.fm/ambient", genre: "Naturaleza, Lluvia & Hogueras" },
    { id: 7, name: "Dial Libre Personalizado", url: "", genre: "URL Directa del Jugador" }
];

let radioIndex = 0;
let radioAudio = new Audio();
radioAudio.crossOrigin = "anonymous";
let radioMasterVolume = 0.50; // 50%
let isRadioPlaying = false;
let isAudioDucked = false;

const elRadioSelect = document.getElementById('radio-station-select');
const elRadioGenre = document.getElementById('radio-station-genre');
const elRadioName = document.getElementById('radio-current-name');
const elRadioStatus = document.getElementById('radio-status-tag');
const elRadioBtnPlay = document.getElementById('btn-radio-play');
const elRadioBtnPrev = document.getElementById('btn-radio-prev');
const elRadioBtnNext = document.getElementById('btn-radio-next');
const elRadioVolSlider = document.getElementById('radio-volume-slider');
const elRadioVolVal = document.getElementById('radio-volume-val');
const elRadioAutoDucking = document.getElementById('radio-auto-ducking');
const elRadioCustomBox = document.getElementById('radio-custom-url-box');
const elRadioCustomInput = document.getElementById('radio-custom-url-input');

function initRadioEngine() {
    if (!elRadioBtnPlay) return;

    radioAudio.volume = radioMasterVolume;

    elRadioSelect.addEventListener('change', () => {
        selectRadioStation(parseInt(elRadioSelect.value, 10));
    });

    elRadioBtnPlay.addEventListener('click', () => {
        toggleRadioPlayback();
    });

    elRadioBtnPrev.addEventListener('click', () => {
        let prev = radioIndex - 1;
        if (prev < 0) prev = RADIO_STATIONS.length - 1;
        selectRadioStation(prev);
    });

    elRadioBtnNext.addEventListener('click', () => {
        let next = (radioIndex + 1) % RADIO_STATIONS.length;
        selectRadioStation(next);
    });

    elRadioVolSlider.addEventListener('input', () => {
        radioMasterVolume = parseInt(elRadioVolSlider.value, 10) / 100;
        elRadioVolVal.textContent = elRadioVolSlider.value + '%';
        if (!isAudioDucked) {
            radioAudio.volume = radioMasterVolume;
        }
    });

    if (elRadioCustomInput) {
        elRadioCustomInput.addEventListener('change', () => {
            const customUrl = elRadioCustomInput.value.trim();
            if (customUrl) {
                RADIO_STATIONS[6].url = customUrl;
                if (radioIndex === 6) {
                    playRadioStation(6);
                }
            }
        });
    }

    radioAudio.addEventListener('playing', () => {
        isRadioPlaying = true;
        elRadioStatus.textContent = '● Transmitiendo en vivo';
        elRadioStatus.style.color = '#22c55e';
        elRadioBtnPlay.textContent = '⏸ Pausar';
        elRadioBtnPlay.style.background = '#0284c7';
        elRadioBtnPlay.style.color = '#fff';
        reportRadioTitle(RADIO_STATIONS[radioIndex].name);
    });

    radioAudio.addEventListener('pause', () => {
        isRadioPlaying = false;
        elRadioStatus.textContent = 'Pausado';
        elRadioStatus.style.color = '#fbbf24';
        elRadioBtnPlay.textContent = '▶ Sintonizar';
        elRadioBtnPlay.style.background = '#eab308';
        elRadioBtnPlay.style.color = '#000';
    });

    radioAudio.addEventListener('error', () => {
        isRadioPlaying = false;
        elRadioStatus.textContent = '⚠ Error en stream (reintentando...)';
        elRadioStatus.style.color = '#ef4444';
        elRadioBtnPlay.textContent = '▶ Reintentar';
    });
}

function selectRadioStation(index) {
    radioIndex = index;
    elRadioSelect.value = String(index);
    const station = RADIO_STATIONS[index];
    elRadioGenre.textContent = station.genre;
    elRadioName.textContent = `${station.id}. ${station.name}`;

    if (index === 6 && elRadioCustomBox) {
        elRadioCustomBox.style.display = 'block';
    } else if (elRadioCustomBox) {
        elRadioCustomBox.style.display = 'none';
    }

    if (isRadioPlaying) {
        playRadioStation(index);
    }
}

function playRadioStation(index) {
    const station = RADIO_STATIONS[index];
    let streamUrl = station.url;
    if (index === 6 && elRadioCustomInput && elRadioCustomInput.value.trim()) {
        streamUrl = elRadioCustomInput.value.trim();
    }
    if (!streamUrl) {
        alert('Por favor introduce una URL válida de stream para el Dial Personalizado.');
        return;
    }

    elRadioStatus.textContent = 'Sintonizando...';
    elRadioStatus.style.color = '#38bdf8';
    radioAudio.src = streamUrl;
    radioAudio.load();
    radioAudio.play().catch(e => {
        console.warn('Autoplay radio prevenido:', e);
        elRadioStatus.textContent = 'Haz clic en Sintonizar';
        elRadioStatus.style.color = '#fbbf24';
    });
}

function toggleRadioPlayback() {
    if (isRadioPlaying) {
        radioAudio.pause();
    } else {
        playRadioStation(radioIndex);
    }
}

function applyAutoDucking(isAnyoneSpeaking) {
    if (!elRadioAutoDucking || !elRadioAutoDucking.checked || !isRadioPlaying) return;

    if (isAnyoneSpeaking && !isAudioDucked) {
        isAudioDucked = true;
        // Atenuar música al 30% del volumen nominal para priorizar voz 3D
        radioAudio.volume = radioMasterVolume * 0.30;
    } else if (!isAnyoneSpeaking && isAudioDucked) {
        isAudioDucked = false;
        // Restaurar volumen nominal
        radioAudio.volume = radioMasterVolume;
    }
}

function reportRadioTitle(title) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'radio-now-playing',
            title: title
        }));
    }
}
