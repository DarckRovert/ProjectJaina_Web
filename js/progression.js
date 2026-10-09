/**
 * ============================================================================
 * Project JAIna - Motor de Línea de Fases y Progresión Temporal de Reinos
 * Archivo: js/progression.js
 * Versión: 2.0 Mythos (Estándar de Excelencia Visual)
 * ============================================================================
 */

(function () {
    'use strict';

    const PROGRESSION_SSOT_URL = 'data/progression.json';
    let progressionData = null;

    async function loadProgression() {
        try {
            const resp = await fetch(PROGRESSION_SSOT_URL + '?t=' + Date.now());
            if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
            progressionData = await resp.json();
            renderTimeline();
        } catch (err) {
            console.warn('[Progression] Error cargando datos de progresión:', err);
            // Fallback con datos locales si fetch falla
            progressionData = getFallbackProgression();
            renderTimeline();
        }
    }

    function renderTimeline() {
        const container = document.getElementById('timelineRail');
        if (!container || !progressionData || !progressionData.phases) return;

        container.innerHTML = '';
        const phases = progressionData.phases;
        const activeId = progressionData.active_phase_id || 'tbc';

        // Indicador de estado de la era en el banner superior
        const activePhaseObj = phases.find(p => p.id === activeId) || phases[1];
        const statusEraBadge = document.getElementById('activeEraBadge');
        if (statusEraBadge) {
            statusEraBadge.innerHTML = `🌟 Era Activa: <strong>${activePhaseObj.name}</strong> (Cap Nivel ${activePhaseObj.level_cap})`;
        }

        phases.forEach((phase, index) => {
            const isActive = (phase.id === activeId);
            const isCompleted = (phase.status === 'completed');

            const node = document.createElement('div');
            node.className = `phase-node ${isActive ? 'phase-active' : ''} ${isCompleted ? 'phase-completed' : 'phase-upcoming'}`;
            node.setAttribute('data-phase-id', phase.id);

            // Estado label superior
            let statusLabel = phase.status_label || (isCompleted ? 'COMPLETADA' : (isActive ? 'FASE ACTUAL' : 'LÍNEA DE FASES'));

            node.innerHTML = `
                <div class="phase-badge-top ${isActive ? 'badge-pulse' : ''}">${statusLabel}</div>
                <div class="phase-logo-wrapper" title="Ver detalles de ${phase.name}">
                    <img src="${phase.logo}" alt="${phase.name}" class="phase-logo-img" onerror="this.src='images/jaina_crest_logo.jpg'">
                </div>
                <div class="phase-dot-anchor">
                    <div class="phase-dot ${isActive ? 'dot-active' : (isCompleted ? 'dot-completed' : 'dot-upcoming')}">
                        ${isActive ? '<span class="pulse-ring"></span>' : ''}
                    </div>
                </div>
                <div class="phase-code-label">${phase.code}</div>
                <div class="phase-cap-tag">Cap Lv ${phase.level_cap}</div>
            `;

            node.addEventListener('click', () => openPhaseModal(phase));
            container.appendChild(node);
        });
    }

    function openPhaseModal(phase) {
        let modal = document.getElementById('phaseDetailModal');
        if (!modal) {
            modal = createModalDOM();
        }

        const modalBody = modal.querySelector('.modal-content-inner');
        if (!modalBody) return;

        const isCompleted = (phase.status === 'completed');
        const isActive = (phase.status === 'active');
        const statusClass = isActive ? 'status-active-badge' : (isCompleted ? 'status-comp-badge' : 'status-up-badge');

        modalBody.innerHTML = `
            <div class="modal-phase-header">
                <img src="${phase.logo}" alt="${phase.name}" class="modal-phase-logo">
                <div>
                    <span class="modal-badge ${statusClass}">${phase.status_label || phase.status}</span>
                    <h2 class="modal-phase-title">${phase.name}</h2>
                    <div class="modal-phase-subtitle">${phase.subtitle || ''} · Parche ${phase.patch || '3.3.5a'}</div>
                    <div class="modal-cap-highlight">⚔️ Tope de Nivel Máximo: <strong>Nivel ${phase.level_cap}</strong></div>
                </div>
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
                <div class="unlock-title">📜 Requisitos de Apertura / Transición de Era:</div>
                <div class="unlock-desc">${phase.unlock_requirements || 'Gobernado automáticamente por el motor de consensos de Gravity AI.'}</div>
            </div>
        `;

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
            active_phase_id: "tbc",
            phases: [
                { id: "vanilla", code: "VANILLA", name: "World of Warcraft Classic", status: "completed", status_label: "COMPLETADA", level_cap: 60, logo: "images/phases/vanilla.png", raids: ["Molten Core", "Onyxia 60", "Blackwing Lair", "AQ40"] },
                { id: "tbc", code: "TBC", name: "The Burning Crusade", status: "active", status_label: "FASE ACTUAL", level_cap: 70, logo: "images/phases/tbc.png", raids: ["Karazhan", "SSC", "The Eye", "Black Temple", "Sunwell"] },
                { id: "naxx", code: "NAXX", name: "Curse of Naxxramas", status: "upcoming", status_label: "LÍNEA DE FASES", level_cap: 80, logo: "images/phases/naxx.png", raids: ["Naxxramas 80", "Malygos", "Sartharion"] },
                { id: "ulduar", code: "ULDUAR", name: "Secrets of Ulduar", status: "upcoming", status_label: "LÍNEA DE FASES", level_cap: 80, logo: "images/phases/ulduar.png", raids: ["Ulduar 10/25 + Hardmodes"] },
                { id: "toc", code: "TOC", name: "Call of the Crusade", status: "upcoming", status_label: "LÍNEA DE FASES", level_cap: 80, logo: "images/phases/toc.png", raids: ["Prueba del Cruzado", "Onyxia 80"] }
            ]
        };
    }

    document.addEventListener('DOMContentLoaded', loadProgression);
})();
