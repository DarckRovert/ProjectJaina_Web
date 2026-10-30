/**
 * ============================================================================
 * Project JAIna — Relojes Maestros de Apertura & Telemetría Progresiva en Vivo
 * Archivo: js/countdown.js
 * Versión: 3.1 Mythos (Resolución Dinámica Multi-Era 2026-2028 + API Live)
 * ============================================================================
 */

(function () {
    'use strict';

    const GRAND_OPENING_TARGET = new Date('2026-11-24T00:00:00-05:00').getTime();
    const PROJECT_CREATION_START = new Date('2026-10-01T00:00:00-05:00').getTime();
    const PROGRESSION_SSOT_URL = 'data/progression.json';

    let serverBootEpoch = null;
    let serverUptimeSeconds = 0;
    let isServerLive = false;
    let progressionMetadata = null;

    document.addEventListener('DOMContentLoaded', () => {
        initGrandOpeningCountdown();
        initServerLiveChronometer();
    });

    function initGrandOpeningCountdown() {
        function updateOpeningClock() {
            const now = Date.now();
            const diff = GRAND_OPENING_TARGET - now;

            const daysEl = document.getElementById('openingDays');
            const hoursEl = document.getElementById('openingHours');
            const minutesEl = document.getElementById('openingMinutes');
            const secondsEl = document.getElementById('openingSeconds');
            const progressFillEl = document.getElementById('openingProgressFill');

            if (diff <= 0) {
                if (daysEl) daysEl.textContent = '00';
                if (hoursEl) hoursEl.textContent = '00';
                if (minutesEl) minutesEl.textContent = '00';
                if (secondsEl) secondsEl.textContent = '00';
                if (progressFillEl) progressFillEl.style.width = '100%';

                const titleEl = document.querySelector('.opening-title');
                if (titleEl) {
                    titleEl.innerHTML = '⚔️ ¡EL PORTAL ESTÁ ABIERTO! · EL REINO ESTÁ ACTIVO ⚔️';
                    titleEl.style.color = 'var(--gold-primary)';
                }
                return;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

            if (progressFillEl) {
                const totalSpan = GRAND_OPENING_TARGET - PROJECT_CREATION_START;
                const elapsedSpan = now - PROJECT_CREATION_START;
                let pct = (elapsedSpan / totalSpan) * 100;
                pct = Math.max(0, Math.min(100, pct));
                progressFillEl.style.width = pct.toFixed(1) + '%';
            }
        }

        updateOpeningClock();
        setInterval(updateOpeningClock, 1000);
    }

    async function initServerLiveChronometer() {
        window.addEventListener('jaina:progression', (e) => {
            if (e && e.detail) {
                progressionMetadata = e.detail;
                renderServerTelemetryUI();
                renderProgressionChronometer();
            }
        });

        await fetchProgressionSSOT();

        window.addEventListener('jaina:telemetry', (e) => {
            const data = e.detail;
            if (!data) return;

            isServerLive = (data.isOnline === true || data.status === 'ONLINE' || data.world_online === true);

            if (data.server_uptime_seconds !== undefined) {
                serverUptimeSeconds = Number(data.server_uptime_seconds) || 0;
            } else if (!isServerLive) {
                serverUptimeSeconds = 0;
            }

            if (data.world_tickrate_ms) {
                const tickEl = document.getElementById('paramTickrate');
                if (tickEl) tickEl.textContent = `~${data.world_tickrate_ms} ms (Estable)`;
            }

            renderServerTelemetryUI();
            renderProgressionChronometer();
        });

        setInterval(tickLocalChronometers, 1000);
        // Refresco periódico cada 5 minutos del estado de progresión para captar cambios de Era sin F5
        setInterval(fetchProgressionSSOT, 300000);

        if (typeof window.dispatchEvent !== 'function') {
            setInterval(syncServerTelemetry, 15000);
        }
    }

    async function fetchProgressionSSOT() {
        try {
            const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : null;
            if (apiUrl) {
                const ctrl = new AbortController();
                const tId = setTimeout(() => ctrl.abort(), 2800);
                try {
                    const liveResp = await fetch(`${apiUrl}/api/progression`, {
                        method: 'GET',
                        signal: ctrl.signal,
                        headers: { 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
                    });
                    clearTimeout(tId);
                    if (liveResp.ok) {
                        const j = await liveResp.json();
                        if (j && Array.isArray(j.phases)) {
                            progressionMetadata = j;
                            renderServerTelemetryUI();
                            renderProgressionChronometer();
                            return;
                        }
                    }
                } catch (_) {
                    clearTimeout(tId);
                }
            }

            const resp = await fetch(PROGRESSION_SSOT_URL + '?t=' + Date.now());
            if (resp.ok) {
                progressionMetadata = await resp.json();
                renderServerTelemetryUI();
                renderProgressionChronometer();
            }
        } catch (e) {
            console.warn('[Countdown] Usando fallback local para progresión:', e);
        }
    }

    async function syncServerTelemetry() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        try {
            const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl)
                ? CONFIG.getApiUrl()
                : 'http://127.0.0.1:8080';

            const resp = await fetch(`${apiUrl}/api/status`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            clearTimeout(timeoutId);

            if (resp.ok) {
                const data = await resp.json();
                isServerLive = (data.status === 'ONLINE' || data.world_online === true);

                if (data.server_uptime_seconds !== undefined) {
                    serverUptimeSeconds = Number(data.server_uptime_seconds) || 0;
                } else if (data.server_start_time) {
                    const startEpoch = new Date(data.server_start_time).getTime();
                    serverUptimeSeconds = Math.max(0, Math.floor((Date.now() - startEpoch) / 1000));
                } else if (isServerLive) {
                    if (!serverBootEpoch) {
                        serverBootEpoch = Date.now() - (serverUptimeSeconds * 1000);
                    }
                }

                if (data.world_tickrate_ms) {
                    const tickEl = document.getElementById('paramTickrate');
                    if (tickEl) tickEl.textContent = `~${data.world_tickrate_ms} ms (Estable)`;
                }
            } else {
                throw new Error('API offline');
            }
        } catch (err) {
            clearTimeout(timeoutId);
            isServerLive = false;
            serverUptimeSeconds = 0;
        }

        renderServerTelemetryUI();
    }

    function tickLocalChronometers() {
        if (isServerLive) {
            serverUptimeSeconds++;
        }
        renderServerTelemetryUI();
        renderProgressionChronometer();
    }

    function renderServerTelemetryUI() {
        const uptimeStr = isServerLive
            ? formatDuration(serverUptimeSeconds)
            : '00d 00h 00m 00s (STANDBY)';

        const serverUptimeEl = document.getElementById('serverUptime');
        if (serverUptimeEl) serverUptimeEl.textContent = uptimeStr;

        const hudServerUptimeEl = document.getElementById('hudServerUptime');
        if (hudServerUptimeEl) hudServerUptimeEl.textContent = uptimeStr;

        const activeEraCapEl = document.getElementById('activeEraCap');
        if (activeEraCapEl && progressionMetadata) {
            const phases = progressionMetadata.phases || [];
            const activeId = (progressionMetadata.active_phase_id || 'vanilla').toLowerCase();
            const curObj = phases.find(p => p.id === activeId);
            const cap = (curObj && curObj.level_cap) || progressionMetadata.active_level_cap || 60;
            const shortCode = curObj ? curObj.code : (activeId === 'vanilla' ? 'VANILLA' : activeId.toUpperCase());
            activeEraCapEl.textContent = `${shortCode} (Lv ${cap})`;
        }
    }

    function renderProgressionChronometer() {
        if (!progressionMetadata) return;

        const now = Date.now();
        const launchDate = progressionMetadata.server_launch_date
            ? new Date(progressionMetadata.server_launch_date).getTime()
            : GRAND_OPENING_TARGET;

        const phases = progressionMetadata.phases || [];
        const activeId = (progressionMetadata.active_phase_id || 'vanilla').toLowerCase();
        const activeIdx = Math.max(0, phases.findIndex(p => p.id === activeId));
        const curPhase = phases[activeIdx] || { id: 'vanilla', name: 'Vanilla Classic', level_cap: 60 };
        const nextPhase = phases[activeIdx + 1] || null;
        const horizonPhase = phases[activeIdx + 2] || null;

        const elapsedEl = document.getElementById('currentPhaseElapsedTime');
        const nextPhaseCountdownEl = document.getElementById('nextPhaseCountdown');
        const gaugeTextEl = document.getElementById('transitionPercentText');
        const gaugeFillEl = document.getElementById('transitionGaugeFill');

        const currentTagEl = document.getElementById('flowStepCurrentTag');
        const currentNameEl = document.getElementById('flowStepCurrentName');
        const nextTagEl = document.getElementById('flowStepNextTag');
        const nextNameEl = document.getElementById('flowStepNextName');

        const horizonCardEl = document.getElementById('flowStepHorizon');
        if (horizonCardEl && horizonPhase) {
            const hName = horizonCardEl.querySelector('.flow-step-name');
            const hTime = horizonCardEl.querySelector('.flow-step-time');
            if (hName) hName.textContent = `${horizonPhase.name} (Cap ${horizonPhase.level_cap})`;
            if (hTime) hTime.textContent = horizonPhase.date_range_label || `Parche ${horizonPhase.patch}`;
        }

        const stepCurrentEl = document.getElementById('flowStepCurrent');
        if (stepCurrentEl) {
            stepCurrentEl.classList.add('era-vanilla');
        }

        // CASO 1: PRE-LANZAMIENTO (ANTES DEL 24 DE NOVIEMBRE DE 2026)
        if (now < launchDate && activeId === 'vanilla') {
            if (elapsedEl) elapsedEl.textContent = `Ventana: ${curPhase.date_range_label || '24 Nov 2026 – 01 Mar 2027'} (${curPhase.duration_label || '97d'})`;
            if (nextPhaseCountdownEl) {
                nextPhaseCountdownEl.textContent = nextPhase && nextPhase.date_range_label
                    ? `Programada: ${nextPhase.date_range_label}`
                    : 'Apertura: 01 Mar 2027';
            }
            if (gaugeTextEl) gaugeTextEl.textContent = '0.0%';
            if (gaugeFillEl) gaugeFillEl.style.width = '0%';

            if (currentTagEl) currentTagEl.textContent = 'ERA INICIAL (APERTURA 24 NOV)';
            if (currentNameEl) currentNameEl.textContent = `${curPhase.name} (Cap ${curPhase.level_cap})`;
            if (nextTagEl) nextTagEl.textContent = 'SIGUIENTE ERA (PROGRAMADA)';
            if (nextNameEl) {
                nextNameEl.textContent = nextPhase
                    ? `${nextPhase.name} (Cap ${nextPhase.level_cap})`
                    : 'Horizonte Final';
            }
            return;
        }

        // CASO 2: ERA EN CURSO (100% DINÁMICO PARA LAS 8 FASES)
        const phaseStartIso = curPhase.start_date || progressionMetadata.current_phase_start || progressionMetadata.server_launch_date;
        const phaseStart = phaseStartIso ? new Date(phaseStartIso).getTime() : launchDate;

        const nextTargetIso = (nextPhase && nextPhase.start_date) || curPhase.end_date || progressionMetadata.next_phase_target;
        const nextTarget = nextTargetIso ? new Date(nextTargetIso).getTime() : null;

        const phaseElapsedSec = Math.max(0, Math.floor((now - phaseStart) / 1000));
        if (elapsedEl) {
            elapsedEl.textContent = `Tiempo en Era: ${formatShortDuration(phaseElapsedSec)}`;
        }

        if (nextTarget && nextPhase) {
            const remainingSec = Math.max(0, Math.floor((nextTarget - now) / 1000));
            if (nextPhaseCountdownEl) {
                nextPhaseCountdownEl.textContent = `Apertura en: ${formatShortDuration(remainingSec)}`;
            }
            const totalPhaseSpan = nextTarget - phaseStart;
            const currentElapsedSpan = now - phaseStart;
            const progressPct = totalPhaseSpan > 0
                ? Math.min(100, Math.max(0, (currentElapsedSpan / totalPhaseSpan) * 100))
                : 100;
            if (gaugeTextEl) gaugeTextEl.textContent = progressPct.toFixed(1) + '%';
            if (gaugeFillEl) gaugeFillEl.style.width = progressPct.toFixed(1) + '%';
        } else {
            if (nextPhaseCountdownEl) nextPhaseCountdownEl.textContent = 'Horizonte Abierto';
            if (gaugeTextEl) gaugeTextEl.textContent = '100%';
            if (gaugeFillEl) gaugeFillEl.style.width = '100%';
        }

        if (currentTagEl) currentTagEl.textContent = 'ERA ACTUAL EN CURSO';
        if (currentNameEl) currentNameEl.textContent = `${curPhase.name} (Cap ${curPhase.level_cap})`;
        if (nextTagEl) nextTagEl.textContent = nextPhase ? 'SIGUIENTE TRANSICIÓN' : 'ESTADO FINAL';
        if (nextNameEl) {
            nextNameEl.textContent = nextPhase
                ? `${nextPhase.name} (Cap ${nextPhase.level_cap})`
                : 'Lore Viviente Expandido';
        }
    }

    function formatDuration(totalSec) {
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    function formatShortDuration(totalSec) {
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);

        return `${days}d ${hours}h ${minutes}m`;
    }
})();
