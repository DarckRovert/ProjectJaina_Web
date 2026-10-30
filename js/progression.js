/**
 * ============================================================================
 * Project JAIna - Motor de Línea de Fases, Calendario Oficial y API en Vivo
 * Archivo: js/progression.js
 * Versión: 3.0 Mythos (Sincronización API + Calendario Oficial 2026-2028)
 * ============================================================================
 */

(function () {
    'use strict';

    const PROGRESSION_SSOT_URL = 'data/progression.json';
    let progressionData = null;

    async function fetchLiveOrStaticProgression() {
        // 1. Intentar consultar la API viva del clúster primero para reflejar transiciones instantáneas
        try {
            const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl)
                ? CONFIG.getApiUrl()
                : null;
            if (apiUrl) {
                const ctrl = new AbortController();
                const timer = setTimeout(() => ctrl.abort(), 2800);
                const resp = await fetch(`${apiUrl}/api/progression`, {
                    method: 'GET',
                    signal: ctrl.signal,
                    headers: {
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
                clearTimeout(timer);
                if (resp.ok) {
                    const liveData = await resp.json();
                    if (liveData && Array.isArray(liveData.phases) && liveData.phases.length > 0) {
                        return liveData;
                    }
                }
            }
        } catch (_) {
            // Silencioso: conmuta de inmediato al JSON estático del repositorio
        }

        // 2. Fallback garantizado: JSON SSOT estático en GitHub Pages / servidor local
        const respStatic = await fetch(PROGRESSION_SSOT_URL + '?t=' + Date.now());
        if (!respStatic.ok) throw new Error(`HTTP error ${respStatic.status}`);
        return await respStatic.json();
    }

    async function loadProgression() {
        try {
            progressionData = await fetchLiveOrStaticProgression();
        } catch (err) {
            console.warn('[Progression] Usando fallback embebido:', err);
            progressionData = getFallbackProgression();
        }

        renderTimeline();
        bindCalendarButton();

        // Notificar a countdown.js para compartir el mismo SSOT sin doble petición
        try {
            window.dispatchEvent(new CustomEvent('jaina:progression', { detail: progressionData }));
        } catch (_) {}
    }

    function bindCalendarButton() {
        const btn = document.getElementById('openCalendarModalBtn');
        if (btn && !btn.dataset.boundCalendar) {
            btn.dataset.boundCalendar = '1';
            btn.addEventListener('click', () => openFullCalendarModal());
        }
    }

    function renderTimeline() {
        const container = document.getElementById('timelineRail');
        if (!container || !progressionData || !progressionData.phases) return;

        container.innerHTML = '';
        const phases = progressionData.phases;
        const activeId = progressionData.active_phase_id || 'vanilla';

        const activePhaseObj = phases.find(p => p.id === activeId) || phases[0];
        const statusEraBadge = document.getElementById('activeEraBadge');
        if (statusEraBadge) {
            const dateBadge = activePhaseObj.date_range_label ? ` · <span style="opacity:0.9">${activePhaseObj.date_range_label}</span>` : '';
            statusEraBadge.innerHTML = `🌟 Era Activa: <strong>${activePhaseObj.name}</strong> (Cap Nivel ${activePhaseObj.level_cap})${dateBadge}`;
        }

        phases.forEach((phase) => {
            const isActive = (phase.id === activeId);
            const isCompleted = (phase.status === 'completed');

            const node = document.createElement('div');
            node.className = `phase-node ${isActive ? 'phase-active' : ''} ${isCompleted ? 'phase-completed' : 'phase-upcoming'}`;
            node.setAttribute('data-phase-id', phase.id);

            const statusLabel = phase.status_label || (isCompleted ? 'COMPLETADA' : (isActive ? 'FASE ACTUAL' : 'LÍNEA DE FASES'));
            const dateRange = phase.date_range_label || '';
            const durationStr = phase.duration_label || '';

            node.innerHTML = `
                <div class="phase-badge-top ${isActive ? 'badge-pulse' : ''}">${statusLabel}</div>
                <div class="phase-logo-wrapper" title="Ver fechas, bandas y detalles de ${phase.name}">
                    <img src="${phase.logo}" alt="${phase.name}" class="phase-logo-img" onerror="this.src='images/jaina_crest_logo.jpg'">
                </div>
                <div class="phase-dot-anchor">
                    <div class="phase-dot ${isActive ? 'dot-active' : (isCompleted ? 'dot-completed' : 'dot-upcoming')}">
                        ${isActive ? '<span class="pulse-ring"></span>' : ''}
                    </div>
                </div>
                <div class="phase-code-label">${phase.code}</div>
                <div class="phase-cap-tag">Cap Lv ${phase.level_cap}</div>
                ${dateRange ? `<div class="phase-date-subtag">${dateRange}</div>` : ''}
                ${durationStr ? `<div class="phase-duration-subtag">⏱ ${durationStr}</div>` : ''}
            `;

            node.addEventListener('click', () => openPhaseModal(phase));
            container.appendChild(node);
        });
    }

    function formatIsoSpanish(isoStr) {
        if (!isoStr) return 'Horizonte Abierto';
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · 00:00 (UTC-5)';
        } catch (_) {
            return isoStr;
        }
    }

    function openPhaseModal(phase) {
        let modal = document.getElementById('phaseDetailModal');
        if (!modal) {
            modal = createModalDOM();
        }

        const card = modal.querySelector('.phase-modal-card');
        if (card) card.classList.remove('phase-modal-wide');

        const modalBody = modal.querySelector('.modal-content-inner');
        if (!modalBody) return;

        const activeId = (progressionData && progressionData.active_phase_id) || 'vanilla';
        const isCompleted = (phase.status === 'completed');
        const isActive = (phase.id === activeId || phase.status === 'active');
        const statusClass = isActive ? 'status-active-badge' : (isCompleted ? 'status-comp-badge' : 'status-up-badge');

        modalBody.innerHTML = `
            <div class="modal-phase-header">
                <img src="${phase.logo}" alt="${phase.name}" class="modal-phase-logo" onerror="this.src='images/jaina_crest_logo.jpg'">
                <div>
                    <span class="modal-badge ${statusClass}">${phase.status_label || phase.status}</span>
                    <h2 class="modal-phase-title">${phase.name}</h2>
                    <div class="modal-phase-subtitle">${phase.subtitle || ''} · Parche ${phase.patch || '3.3.5a'}</div>
                    <div class="modal-cap-highlight">⚔️ Tope de Nivel Máximo: <strong>Nivel ${phase.level_cap}</strong> · Duración: <strong>${phase.duration_label || 'Programada'}</strong></div>
                </div>
            </div>

            <div class="era-schedule-banner">
                <div><span>📅 Apertura Oficial:</span> <strong>${formatIsoSpanish(phase.start_date)}</strong></div>
                <div><span>🏁 Cierre / Transición:</span> <strong>${formatIsoSpanish(phase.end_date)}</strong></div>
            </div>

            <div class="modal-lore-quote">
                ${phase.jaina_lore || '«El tiempo fluye como un río de magia arcana. Cada era debe ser forjada por la voluntad de sus héroes.»'}
            </div>

            <div class="modal-grid-details">
                <div class="modal-col">
                    <h4 class="modal-col-title">🏰 Bandas & Raids Desbloqueadas</h4>
                    <ul class="modal-items-list">
                        ${(phase.raids && phase.raids.length > 0)
                            ? phase.raids.map(r => `<li><span class="check-icon">⚔️</span> ${r}</li>`).join('')
                            : '<li><em>Contenido reservado para el despliegue de era.</em></li>'}
                    </ul>
                </div>
                <div class="modal-col">
                    <h4 class="modal-col-title">🗺️ Mazmorras & Campañas Clave</h4>
                    <ul class="modal-items-list">
                        ${(phase.dungeons && phase.dungeons.length > 0)
                            ? phase.dungeons.map(d => `<li><span class="check-icon">🛡️</span> ${d}</li>`).join('')
                            : '<li><em>Mazmorras de nivel correspondientes a la era.</em></li>'}
                    </ul>
                </div>
            </div>

            <div class="modal-unlock-box">
                <div class="unlock-title">📜 Reglas de Apertura / Transición Autónoma:</div>
                <div class="unlock-desc">${phase.unlock_requirements || 'Gobernado automáticamente por el motor Chrono-Master de Gravity AI.'}</div>
            </div>
        `;

        modal.classList.add('modal-visible');
    }

    function openFullCalendarModal() {
        if (!progressionData || !progressionData.phases) return;

        let modal = document.getElementById('phaseDetailModal');
        if (!modal) {
            modal = createModalDOM();
        }

        const card = modal.querySelector('.phase-modal-card');
        if (card) card.classList.add('phase-modal-wide');

        const modalBody = modal.querySelector('.modal-content-inner');
        if (!modalBody) return;

        const activeId = progressionData.active_phase_id || 'vanilla';
        const tzLabel = progressionData.timezone_label || 'UTC-5 (Lima / Bogotá)';

        const rowsHtml = progressionData.phases.map((p, idx) => {
            const isActive = (p.id === activeId);
            const isCompleted = (p.status === 'completed');
            const badgeCls = isActive ? 'status-active-badge' : (isCompleted ? 'status-comp-badge' : 'status-up-badge');
            const badgeTxt = isActive ? 'EN CURSO' : (isCompleted ? 'COMPLETADA' : `FASE ${idx + 1}`);
            const topRaids = (p.raids || []).slice(0, 3).join(', ');

            return `
                <tr class="cal-row ${isActive ? 'cal-row-active' : ''}" data-cal-phase="${p.id}" title="Haz clic para ver todas las bandas y mazmorras de ${p.name}">
                    <td><span class="modal-badge ${badgeCls}">${badgeTxt}</span></td>
                    <td>
                        <div class="cal-phase-name">${p.name}</div>
                        <div class="cal-phase-sub">Parche ${p.patch || '3.3.5a'} · ${p.code}</div>
                    </td>
                    <td class="cal-cap">Nv. ${p.level_cap}</td>
                    <td class="cal-dates">${p.date_range_label || formatIsoSpanish(p.start_date)}</td>
                    <td class="cal-dur">${p.duration_label || '—'}</td>
                    <td class="cal-raids">${topRaids}</td>
                </tr>
            `;
        }).join('');

        modalBody.innerHTML = `
            <div class="cal-modal-header">
                <span class="modal-badge status-active-badge">CRONOGRAMA CANÓNICO AUTOMATIZADO</span>
                <h2 class="modal-phase-title">📅 Calendario Oficial de Eras (2026 – 2028)</h2>
                <p class="modal-phase-subtitle">
                    Todas las transiciones de Era son ejecutadas de forma <strong>100% autónoma</strong> a las <strong>00:00 (${tzLabel})</strong> por <em>Gravity AI Chrono-Master</em>. Haz clic en cualquier fila para inspeccionar sus bandas y requisitos.
                </p>
            </div>
            <div class="cal-table-wrapper">
                <table class="era-calendar-table">
                    <thead>
                        <tr>
                            <th>Estado</th>
                            <th>Era / Temporada</th>
                            <th>Cap</th>
                            <th>Ventana Oficial (${tzLabel})</th>
                            <th>Duración</th>
                            <th>Bandas Principales</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;

        modalBody.querySelectorAll('tr[data-cal-phase]').forEach(row => {
            row.addEventListener('click', () => {
                const pid = row.getAttribute('data-cal-phase');
                const found = progressionData.phases.find(x => x.id === pid);
                if (found) openPhaseModal(found);
            });
        });

        modal.classList.add('modal-visible');
    }

    function createModalDOM() {
        const modal = document.createElement('div');
        modal.id = 'phaseDetailModal';
        modal.className = 'phase-modal-backdrop';
        modal.innerHTML = `
            <div class="phase-modal-card">
                <button class="modal-close-btn" id="closePhaseModalBtn" aria-label="Cerrar">&times;</button>
                <div class="modal-content-inner"></div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'closePhaseModalBtn') {
                modal.classList.remove('modal-visible');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('modal-visible')) {
                modal.classList.remove('modal-visible');
            }
        });

        return modal;
    }

    function getFallbackProgression() {
        return {
            realm_name: "Project JAIna",
            active_phase_id: "vanilla",
            timezone_label: "UTC-5 (Lima / Bogotá)",
            phases: [
                { id: "vanilla", code: "VANILLA", name: "World of Warcraft Classic", patch: "1.12.1", status: "active", status_label: "FASE ACTUAL", level_cap: 60, date_range_label: "24 Nov 2026 – 01 Mar 2027", duration_label: "97 días (~3.2 meses)", logo: "images/phases/vanilla.png", raids: ["Molten Core", "Onyxia 60", "Blackwing Lair", "Zul'Gurub", "AQ20 / AQ40"] },
                { id: "tbc", code: "TBC", name: "The Burning Crusade", patch: "2.4.3", status: "upcoming", status_label: "PRÓXIMA ERA", level_cap: 70, date_range_label: "01 Mar 2027 – 01 Jun 2027", duration_label: "92 días (3 meses)", logo: "images/phases/tbc.png", raids: ["Karazhan", "SSC", "The Eye", "Hyjal", "Black Temple", "Sunwell"] },
                { id: "naxx", code: "NAXX", name: "Curse of Naxxramas", patch: "3.0.9", status: "upcoming", status_label: "LÍNEA DE FASES", level_cap: 80, date_range_label: "01 Jun 2027 – 01 Ago 2027", duration_label: "61 días (2 meses)", logo: "images/phases/naxx.png", raids: ["Naxxramas 80", "Ojo de la Eternidad", "Sagrario Obsidiana"] },
                { id: "ulduar", code: "ULDUAR", name: "Secrets of Ulduar", patch: "3.1.3", status: "upcoming", status_label: "LÍNEA DE FASES", level_cap: 80, date_range_label: "01 Ago 2027 – 01 Oct 2027", duration_label: "61 días (2 meses)", logo: "images/phases/ulduar.png", raids: ["Ulduar 10/25 + Hardmodes", "Algalon"] },
                { id: "toc", code: "TOC", name: "Call of the Crusade", patch: "3.2.2a", status: "upcoming", status_label: "LÍNEA DE FASES", level_cap: 80, date_range_label: "01 Oct 2027 – 15 Nov 2027", duration_label: "45 días (1.5 meses)", logo: "images/phases/toc.png", raids: ["Prueba del Gran Cruzado", "Onyxia 80"] },
                { id: "icc", code: "ICC", name: "Fall of the Lich King", patch: "3.3.0", status: "upcoming", status_label: "LÍNEA DE FASES", level_cap: 80, date_range_label: "15 Nov 2027 – 15 Feb 2028", duration_label: "92 días (3 meses)", logo: "images/phases/icc.png", raids: ["Ciudadela de la Corona de Hielo 10/25 H"] },
                { id: "ruby", code: "RUBY", name: "The Ruby Sanctum", patch: "3.3.5a", status: "upcoming", status_label: "LÍNEA DE FASES", level_cap: 80, date_range_label: "15 Feb 2028 – 01 Abr 2028", duration_label: "46 días (1.5 meses)", logo: "images/phases/ruby.png", raids: ["El Sagrario Rubí (Halion 10/25 H)"] },
                { id: "cataclysm", code: "CATACLYSM", name: "The Shattering & Beyond", patch: "4.0+", status: "upcoming", status_label: "HORIZONTE", level_cap: 85, date_range_label: "Desde 01 Abr 2028", duration_label: "Horizonte Abierto", logo: "images/phases/cataclysm.png", raids: ["Descenso de Alanegra", "Tierras de Fuego", "Alma de Dragón"] }
            ]
        };
    }

    document.addEventListener('DOMContentLoaded', loadProgression);
})();
