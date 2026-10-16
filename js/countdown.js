/**
 * ============================================================================
 * Project JAIna — Relojes Maestros de Apertura & Telemetría Progresiva en Vivo
 * Archivo: js/countdown.js
 * Versión: 3.0 Mythos (Precisión Atómica & Estándar de Excelencia Visual)
 * ============================================================================
 */

(function () {
    'use strict';

    // ------------------------------------------------------------------------
    // CONSTANTES Y CONFIGURACIÓN TEMPORAL (SSOT)
    // ------------------------------------------------------------------------
    // Apertura Oficial Solicitada: 24 de Noviembre de 2026 (UTC-5 / Lima/Bogotá)
    const GRAND_OPENING_TARGET = new Date('2026-11-24T00:00:00-05:00').getTime();
    const PROJECT_CREATION_START = new Date('2026-10-01T00:00:00-05:00').getTime();
    const PROGRESSION_SSOT_URL = 'data/progression.json';

    // Estado interno sincronizado de telemetría de servidor
    let serverBootEpoch = null;
    let serverUptimeSeconds = 0;
    let isServerLive = false;
    let progressionMetadata = null;

    // ------------------------------------------------------------------------
    // INICIALIZACIÓN
    // ------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        initGrandOpeningCountdown();
        initServerLiveChronometer();
    });

    // ------------------------------------------------------------------------
    // 1. CONTADOR DE CUENTA REGRESIVA PARA LA GRAN APERTURA (24/11/2026)
    // ------------------------------------------------------------------------
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

            // Barra de progreso temporal (Desde inicio del proyecto hasta 24/11/2026)
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

    // ------------------------------------------------------------------------
    // 2. CRONÓMETRO DE REINO EN VIVO & TELEMETRÍA DE TRANSICIÓN DE ERAS
    // ------------------------------------------------------------------------
    async function initServerLiveChronometer() {
        // Cargar metadatos canónicos de progresión
        await fetchProgressionSSOT();

        // Escucha reactiva al despachador autoritativo de app.js (elimina doble tráfico HTTP)
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

        // Reloj tickeando en vivo local cada segundo para el Uptime
        setInterval(tickLocalChronometers, 1000);

        // Sondeo de fallback con AbortController solo si app.js no estuviese presente
        if (typeof window.dispatchEvent !== 'function') {
            setInterval(syncServerTelemetry, 15000);
        }
    }

    async function fetchProgressionSSOT() {
        try {
            const resp = await fetch(PROGRESSION_SSOT_URL + '?t=' + Date.now());
            if (resp.ok) {
                progressionMetadata = await resp.json();
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
        // Solo incrementar uptime continuo si el servidor está activo en vivo
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

        // Barra de estado hero
        const serverUptimeEl = document.getElementById('serverUptime');
        if (serverUptimeEl) {
            serverUptimeEl.textContent = uptimeStr;
        }

        // HUD de Línea de Fases
        const hudServerUptimeEl = document.getElementById('hudServerUptime');
        if (hudServerUptimeEl) {
            hudServerUptimeEl.textContent = uptimeStr;
        }

        // Indicador de Era & Cap en Hero
        const activeEraCapEl = document.getElementById('activeEraCap');
        if (activeEraCapEl && progressionMetadata) {
            const cap = progressionMetadata.active_level_cap || 60;
            const phaseId = (progressionMetadata.active_phase_id || 'vanilla').toLowerCase();
            const phaseLabel = phaseId === 'vanilla' ? 'Vanilla' : (phaseId === 'tbc' ? 'TBC' : 'WotLK');
            activeEraCapEl.textContent = `${phaseLabel} (Lv ${cap})`;
        }
    }

    function renderProgressionChronometer() {
        if (!progressionMetadata) return;

        const now = Date.now();
        const launchDate = progressionMetadata.server_launch_date
            ? new Date(progressionMetadata.server_launch_date).getTime()
            : GRAND_OPENING_TARGET;

        // Elementos DOM
        const elapsedEl = document.getElementById('currentPhaseElapsedTime') || document.getElementById('tbcElapsedTime');
        const nextPhaseCountdownEl = document.getElementById('nextPhaseCountdown');
        const gaugeTextEl = document.getElementById('transitionPercentText');
        const gaugeFillEl = document.getElementById('transitionGaugeFill');

        // Tarjetas dinámicas del flujo de transición
        const currentTagEl = document.getElementById('flowStepCurrentTag');
        const currentNameEl = document.getElementById('flowStepCurrentName');
        const nextTagEl = document.getElementById('flowStepNextTag');
        const nextNameEl = document.getElementById('flowStepNextName');

        // CASO 1: ANTES DE LA GRAN APERTURA (PRE-LANZAMIENTO / STANDBY EN ERA VANILLA)
        const stepCurrentEl = document.getElementById('flowStepCurrent');
        if (now < launchDate) {
            if (elapsedEl) {
                elapsedEl.textContent = 'Tiempo en Era: 00d 00h 00m (Standby)';
            }
            if (nextPhaseCountdownEl) {
                nextPhaseCountdownEl.textContent = 'Apertura: Bloqueada (Post-Vanilla)';
            }
            if (gaugeTextEl) {
                gaugeTextEl.textContent = '0.0%';
            }
            if (gaugeFillEl) {
                gaugeFillEl.style.width = '0%';
            }

            if (stepCurrentEl) {
                stepCurrentEl.classList.add('era-vanilla');
            }
            if (currentTagEl) currentTagEl.textContent = 'ERA INICIAL (APERTURA 24 NOV)';
            if (currentNameEl) currentNameEl.textContent = 'Vanilla Classic (Cap 60)';
            if (nextTagEl) nextTagEl.textContent = 'SIGUIENTE ERA (BLOQUEADA)';
            if (nextNameEl) nextNameEl.textContent = 'The Burning Crusade (Cap 70)';
            return;
        }

        // CASO 2: POST-APERTURA (A PARTIR DEL 24 DE NOVIEMBRE DE 2026 · 100% AUTOMÁTICO)
        if (stepCurrentEl) {
            stepCurrentEl.classList.add('era-vanilla');
        }
        const phaseStart = launchDate;
        const nextTarget = progressionMetadata.next_phase_target
            ? new Date(progressionMetadata.next_phase_target).getTime()
            : new Date('2027-03-01T00:00:00-05:00').getTime();

        const phaseElapsedSec = Math.max(0, Math.floor((now - phaseStart) / 1000));
        if (elapsedEl) {
            elapsedEl.textContent = `Tiempo en Era: ${formatShortDuration(phaseElapsedSec)}`;
        }

        const remainingSec = Math.max(0, Math.floor((nextTarget - now) / 1000));
        if (nextPhaseCountdownEl) {
            nextPhaseCountdownEl.textContent = `Apertura en: ${formatShortDuration(remainingSec)}`;
        }

        const totalPhaseSpan = nextTarget - phaseStart;
        const currentElapsedSpan = now - phaseStart;
        let progressPct = 0;
        if (totalPhaseSpan > 0) {
            progressPct = Math.min(100, Math.max(0, (currentElapsedSpan / totalPhaseSpan) * 100));
        }

        if (gaugeTextEl) {
            gaugeTextEl.textContent = progressPct.toFixed(1) + '%';
        }
        if (gaugeFillEl) {
            gaugeFillEl.style.width = progressPct.toFixed(1) + '%';
        }

        if (currentTagEl) currentTagEl.textContent = 'ERA ACTUAL EN CURSO';
        if (currentNameEl) currentNameEl.textContent = progressionMetadata.active_phase_name || 'Vanilla Classic (Cap 60)';
        if (nextTagEl) nextTagEl.textContent = 'SIGUIENTE TRANSICIÓN';
        if (nextNameEl) nextNameEl.textContent = 'The Burning Crusade (Cap 70)';
    }

    // ------------------------------------------------------------------------
    // UTILIDADES DE FORMATEO TEMPORAL
    // ------------------------------------------------------------------------
    function formatDuration(totalSec) {
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        const dStr = String(days).padStart(2, '0') + 'd';
        const hStr = String(hours).padStart(2, '0') + 'h';
        const mStr = String(minutes).padStart(2, '0') + 'm';
        const sStr = String(seconds).padStart(2, '0') + 's';

        return `${dStr} ${hStr} ${mStr} ${sStr}`;
    }

    function formatShortDuration(totalSec) {
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);

        return `${days}d ${hours}h ${minutes}m`;
    }

})();
