/**
 * ==============================================================================
 * Project JAIna — Base de Datos Soberana de Azeroth (AoWoW Nativo v7.1)
 * Archivo: js/database.js
 * Garantías L9:
 *  1. Sondeo híbrido: /api/database/items en vivo -> data/database_catalog.json (72+ registros verificados).
 *  2. Aislamiento estricto Wowhead: data-wowhead SOLO para entry < 900000 (Cero enlaces 404).
 *  3. Modal Inspector Soberano Kirin Tor para ítems custom (>= 900000) y los 6 Enclaves de Hermandad.
 *  4. Filtros combinables por Categoría (8 chips con conteo), Rareza y Ordenamiento + Copiado 1-clic.
 * ==============================================================================
 */

const QUALITY_RANK = { mitico: 6, legendario: 5, epico: 4, raro: 3, comun: 1 };
const CATEGORY_LABELS = {
    epic_gear: "Equipo Épico Cap 60",
    mounts: "Montura",
    wings: "Aura & Alas 3D",
    enclaves: "Enclave de Hermandad",
    transmog: "Guardarropa Espectral",
    battlepass: "Pase de Batalla",
    tokens: "Moneda & Suministro"
};

const DB_ENGINE = {
    category: "all",
    rarity: "all",
    sortBy: "default",
    query: "",
    page: 1,
    limit: 24,
    eraCap: 60,
    totalPages: 1,
    totalItems: 0,
    isLive: false,
    debounceTimer: null,
    cachedLocalCatalog: null,
    currentRenderedMap: {},

    async init() {
        this.ensureInspectorModal();
        this.bindEvents();
        await this.preloadLocalCatalogForCounts();
        await this.fetchItems();
    },

    async preloadLocalCatalogForCounts() {
        try {
            const res = await fetch(`data/database_catalog.json?v=20261030_v710`);
            if (res.ok) {
                this.cachedLocalCatalog = await res.json();
                this.updateCategoryChipCounts(this.cachedLocalCatalog);
            }
        } catch (_) {}
    },

    updateCategoryChipCounts(catalog) {
        if (!Array.isArray(catalog)) return;
        const counts = { all: catalog.length };
        catalog.forEach(it => {
            const c = it.category || "other";
            counts[c] = (counts[c] || 0) + 1;
        });
        document.querySelectorAll(".db-chip[data-cat]").forEach(chip => {
            const cat = chip.getAttribute("data-cat");
            if (!chip.dataset.baseLabel) {
                chip.dataset.baseLabel = chip.textContent.trim();
            }
            if (counts[cat] !== undefined) {
                chip.innerHTML = `${chip.dataset.baseLabel} <span style="opacity:0.75;font-size:0.78em;margin-left:3px;">(${counts[cat]})</span>`;
            }
        });
    },

    bindEvents() {
        const searchInput = document.getElementById("dbSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.query = e.target.value.trim().toLowerCase();
                    this.page = 1;
                    this.fetchItems();
                }, 220);
            });
        }

        const chips = document.querySelectorAll(".db-chip[data-cat]");
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                chips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                this.category = chip.getAttribute("data-cat") || "all";
                this.page = 1;
                this.fetchItems();
            });
        });

        const raritySel = document.getElementById("dbRarityFilter");
        if (raritySel) {
            raritySel.addEventListener("change", (e) => {
                this.rarity = e.target.value;
                this.page = 1;
                this.fetchItems();
            });
        }

        const sortSel = document.getElementById("dbSortSelect");
        if (sortSel) {
            sortSel.addEventListener("change", (e) => {
                this.sortBy = e.target.value;
                this.page = 1;
                this.fetchItems();
            });
        }

        const resetBtn = document.getElementById("dbResetFiltersBtn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                this.query = "";
                this.rarity = "all";
                this.sortBy = "default";
                this.category = "all";
                this.page = 1;
                if (searchInput) searchInput.value = "";
                if (raritySel) raritySel.value = "all";
                if (sortSel) sortSel.value = "default";
                chips.forEach(c => c.classList.toggle("active", c.getAttribute("data-cat") === "all"));
                this.fetchItems();
            });
        }
    },

    applyClientRarityAndSort(list) {
        let out = [...list];
        if (this.rarity !== "all") {
            out = out.filter(it => (it.rarity || "comun").toLowerCase() === this.rarity);
        }
        if (this.sortBy === "ilvl_desc") {
            out.sort((a, b) => (b.ilvl || 0) - (a.ilvl || 0));
        } else if (this.sortBy === "quality_desc") {
            out.sort((a, b) => (QUALITY_RANK[b.rarity] || b.quality || 0) - (QUALITY_RANK[a.rarity] || a.quality || 0) || ((b.ilvl || 0) - (a.ilvl || 0)));
        } else if (this.sortBy === "name_asc") {
            out.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));
        } else if (this.sortBy === "id_asc") {
            out.sort((a, b) => (Number(a.entry) || 999999) - (Number(b.entry) || 999999));
        }
        return out;
    },

    async fetchItems() {
        this.renderSkeleton();
        const apiUrl = (typeof CONFIG !== "undefined" && typeof CONFIG.getApiUrl === "function")
            ? CONFIG.getApiUrl()
            : "http://127.0.0.1:8080";

        const params = new URLSearchParams({
            q: this.query,
            cat: this.category,
            page: this.page,
            limit: this.limit,
            era_cap: this.eraCap
        });

        try {
            const ctrl = new AbortController();
            const timeoutId = setTimeout(() => ctrl.abort(), 2400);

            const res = await fetch(`${apiUrl}/api/database/items?${params.toString()}`, {
                method: "GET",
                signal: ctrl.signal,
                headers: {
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true"
                }
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.items) && data.items.length > 0) {
                    this.isLive = true;
                    const processed = this.applyClientRarityAndSort(data.items);
                    this.totalItems = (this.rarity === "all") ? (data.total || processed.length) : processed.length;
                    this.totalPages = (this.rarity === "all") ? (data.total_pages || 1) : Math.max(1, Math.ceil(processed.length / this.limit));
                    this.updateStatusBadge(true, "● SERVIDOR EN VIVO (CONECTADO A ACORE_WORLD)");
                    this.updateSummaryCounter(processed.length, this.totalItems);
                    this.renderGrid(processed);
                    this.renderPagination();
                    this.refreshWowheadTooltips();
                    return;
                }
            }
            throw new Error("Fallback al catálogo canónico");
        } catch (_) {
            await this.loadLocalFallback();
        }
    },

    async loadLocalFallback() {
        this.isLive = false;
        this.updateStatusBadge(false, "● CATÁLOGO CANÓNICO VERIFICADO (JAINACORE 3.3.5a SSOT)");

        if (!this.cachedLocalCatalog) {
            try {
                const res = await fetch(`data/database_catalog.json?t=${Date.now()}`);
                if (res.ok) {
                    this.cachedLocalCatalog = await res.json();
                    this.updateCategoryChipCounts(this.cachedLocalCatalog);
                }
            } catch (_) {
                this.cachedLocalCatalog = [];
            }
        }

        let filtered = [...(this.cachedLocalCatalog || [])];

        if (this.category !== "all") {
            filtered = filtered.filter(it => it.category === this.category);
        }

        if (this.query) {
            filtered = filtered.filter(it => {
                const name = (it.name || "").toLowerCase();
                const desc = (it.description || "").toLowerCase();
                const zone = (it.zone || "").toLowerCase();
                const ent = String(it.entry || it.id || "");
                return name.includes(this.query) || desc.includes(this.query) || zone.includes(this.query) || ent.includes(this.query);
            });
        }

        filtered = this.applyClientRarityAndSort(filtered);

        this.totalItems = filtered.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.limit));

        const offset = (this.page - 1) * this.limit;
        const pageItems = filtered.slice(offset, offset + this.limit);

        this.updateSummaryCounter(pageItems.length, this.totalItems);
        this.renderGrid(pageItems);
        this.renderPagination();
        this.refreshWowheadTooltips();
    },

    updateSummaryCounter(shownCount, totalCount) {
        const el = document.getElementById("dbCountSummary");
        if (!el) return;
        const catName = this.category === "all" ? "Todas las categorías" : (CATEGORY_LABELS[this.category] || this.category);
        el.innerHTML = `Mostrando <strong style="color:#fbbf24;">${shownCount}</strong> de <strong style="color:#fff;">${totalCount}</strong> registros · <span style="color:#38bdf8;">${catName}</span>`;
    },

    updateStatusBadge(isOnline, text) {
        let badge = document.getElementById("dbLiveBadge");
        if (!badge) {
            const container = document.querySelector(".db-search-bar");
            if (container) {
                badge = document.createElement("div");
                badge.id = "dbLiveBadge";
                badge.style.cssText = "text-align: center; margin-bottom: 1.1rem; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.5px;";
                container.parentNode.insertBefore(badge, container);
            }
        }
        if (badge) {
            badge.textContent = text;
            badge.style.color = isOnline ? "#39d353" : "#38bdf8";
        }
    },

    renderSkeleton() {
        const container = document.getElementById("dbResultsGrid");
        if (!container) return;
        container.innerHTML = Array.from({ length: 6 }).map(() => `
            <div class="db-card skeleton-card" style="opacity: 0.6; min-height: 180px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="width: 48px; height: 48px; border-radius: 8px; background: rgba(255,255,255,0.08); margin-bottom: 1rem;"></div>
                <div style="width: 70%; height: 16px; background: rgba(255,255,255,0.06); border-radius: 4px; margin-bottom: 0.5rem;"></div>
                <div style="width: 40%; height: 12px; background: rgba(255,255,255,0.04); border-radius: 4px;"></div>
            </div>
        `).join("");
    },

    renderGrid(items) {
        const container = document.getElementById("dbResultsGrid");
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 4rem 1rem;">
                    <div style="font-size: 2.8rem; margin-bottom: 0.8rem;">🔍</div>
                    <h3 style="color: #fff; margin-bottom: 0.4rem;">No se encontraron registros</h3>
                    <p>No hay coincidencias para los filtros seleccionados en la Base de Datos Soberana.</p>
                </div>
            `;
            return;
        }

        this.currentRenderedMap = {};
        container.innerHTML = items.map((it, idx) => {
            const key = String(it.entry || it.id || ("idx_" + idx));
            this.currentRenderedMap[key] = it;
            const isEnclave = (it.category === "enclaves" || Array.isArray(it.benefits));
            return isEnclave ? this.renderEnclaveCard(it, key) : this.renderItemCard(it, key);
        }).join("");
    },

    renderItemCard(it, key) {
        const rarity = (it.rarity || "epico").toLowerCase();
        const iconName = it.icon || "inv_misc_questionmark";
        const iconUrl = iconName.startsWith("http")
            ? iconName
            : `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`;

        const reqText = it.req || (it.req_level ? `Requiere Nivel ${it.req_level}` : "Sin requisito de nivel");
        const ilvlText = it.ilvl ? `iLvl ${it.ilvl}` : "";
        const entryNum = Number(it.entry) || 0;
        const isCanonicalWowItem = entryNum > 0 && entryNum < 900000;
        const catLabel = CATEGORY_LABELS[it.category] || (it.category || "ITEM").toUpperCase();

        const iconInner = `<img class="db-item-img-icon" src="${iconUrl}" alt="${this.escapeHtml(it.name)}" onerror="this.onerror=null; this.src='https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'">`;

        let iconLinkHtml = "";
        let titleLinkHtml = "";
        let actionBtnHtml = "";

        if (isCanonicalWowItem) {
            const whHref = `https://www.wowhead.com/wotlk/item=${entryNum}`;
            const whAttr = `data-wowhead="item=${entryNum}&domain=wotlk"`;
            iconLinkHtml = `<a href="${whHref}" ${whAttr} target="_blank" rel="noopener noreferrer" style="text-decoration:none;flex-shrink:0;">${iconInner}</a>`;
            titleLinkHtml = `<a href="${whHref}" ${whAttr} target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;">${this.escapeHtml(it.name)}</a>`;
            actionBtnHtml = `<button type="button" class="db-tag" style="cursor:pointer;color:#38bdf8;border-color:rgba(56,189,248,0.35);background:rgba(56,189,248,0.08);" onclick="DB_ENGINE.openInspector('${key}')">🔎 Ficha</button>`;
        } else {
            iconLinkHtml = `<button type="button" onclick="DB_ENGINE.openInspector('${key}')" style="background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;" title="Inspeccionar Objeto Soberano">${iconInner}</button>`;
            titleLinkHtml = `<a href="#inspect-${entryNum}" onclick="event.preventDefault(); DB_ENGINE.openInspector('${key}')" style="color:inherit;text-decoration:none;">${this.escapeHtml(it.name)}</a>`;
            actionBtnHtml = `<button type="button" class="db-tag" style="cursor:pointer;color:#fbbf24;border-color:rgba(245,158,11,0.4);background:rgba(245,158,11,0.1);" onclick="DB_ENGINE.openInspector('${key}')">✨ Inspeccionar</button>`;
        }

        return `
            <div class="db-card rarity-${rarity}">
                <div class="db-card-header">
                    ${iconLinkHtml}
                    <div style="min-width:0;flex:1;">
                        <h3 class="db-item-title ${rarity}">${titleLinkHtml}</h3>
                        <span class="db-item-type">${this.escapeHtml(catLabel)} · ${rarity.toUpperCase()}${!isCanonicalWowItem ? ' · EXCLUSIVO JAINA' : ''}</span>
                    </div>
                </div>
                <p class="db-item-desc">${this.escapeHtml(it.description || 'Registro verificado en acore_world (JainaCore 3.3.5a).')}</p>
                <div class="db-item-meta">
                    <span class="db-tag">ID: ${entryNum} ${ilvlText ? '· ' + ilvlText : ''}</span>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span>${this.escapeHtml(reqText)}</span>
                        ${actionBtnHtml}
                    </div>
                </div>
            </div>
        `;
    },

    renderEnclaveCard(enc, key) {
        const benefitsList = (enc.benefits || []).map(b => `<li>✓ ${this.escapeHtml(b)}</li>`).join("");
        const macro = enc.macro || `/way ${enc.coords || '50.0 50.0'} ${enc.name}`;
        return `
            <div class="db-card rarity-${enc.rarity || 'legendario'}" style="border-left: 3px solid #f59e0b;">
                <div class="db-card-header">
                    <div class="db-item-icon" style="font-size: 1.9rem; cursor: pointer;" onclick="DB_ENGINE.openInspector('${key}')">${enc.icon || '🏰'}</div>
                    <div style="flex:1;">
                        <h3 class="db-item-title ${enc.rarity || 'legendario'}" style="cursor:pointer;" onclick="DB_ENGINE.openInspector('${key}')">${this.escapeHtml(enc.name)}</h3>
                        <span class="db-item-type">ENCLAVE TERRITORIAL · ${this.escapeHtml(enc.zone || 'Azeroth')}</span>
                    </div>
                </div>
                <p class="db-item-desc">${this.escapeHtml(enc.description)}</p>
                <ul style="list-style: none; padding: 0; margin: 0.75rem 0; font-size: 0.83rem; color: #38bdf8; line-height: 1.55;">
                    ${benefitsList}
                </ul>
                <div class="db-item-meta">
                    <span class="db-tag">📍 ${this.escapeHtml(enc.coords || 'Azeroth')}</span>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color: var(--gold-primary); font-weight: 700;">${this.escapeHtml(enc.requirements || 'Hermandad Nv. 3+')}</span>
                        <button type="button" class="db-tag" style="cursor:pointer;color:#fbbf24;border-color:rgba(245,158,11,0.45);background:rgba(245,158,11,0.12);" onclick="DB_ENGINE.copyCommand('${this.escapeAttr(macro)}', 'Macro TomTom copiada')">📋 /way</button>
                    </div>
                </div>
            </div>
        `;
    },

    ensureInspectorModal() {
        if (document.getElementById("sovInspectorModal")) return;
        const overlay = document.createElement("div");
        overlay.id = "sovInspectorModal";
        overlay.className = "sov-inspector-overlay";
        overlay.innerHTML = `<div class="sov-inspector-card" id="sovInspectorBody"></div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.classList.remove("active");
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") overlay.classList.remove("active");
        });
    },

    openInspector(key) {
        const it = this.currentRenderedMap[key];
        if (!it) return;
        const overlay = document.getElementById("sovInspectorModal");
        const body = document.getElementById("sovInspectorBody");
        if (!overlay || !body) return;

        const isEnclave = (it.category === "enclaves" || Array.isArray(it.benefits));
        const rarity = (it.rarity || "legendario").toLowerCase();
        const entryNum = Number(it.entry) || 0;
        const isCanonical = !isEnclave && entryNum > 0 && entryNum < 900000;
        const iconUrl = (it.icon && !isEnclave)
            ? (it.icon.startsWith("http") ? it.icon : `https://wow.zamimg.com/images/wow/icons/large/${it.icon}.jpg`)
            : "";

        const copyTarget = isEnclave
            ? (it.macro || `/way ${it.coords} ${it.name}`)
            : (it.command || `.item ${entryNum}`);
        const copyLabel = isEnclave ? "📋 Copiar Macro /way TomTom" : (it.command ? `📋 Copiar Comando (${it.command})` : `📋 Copiar ID #${entryNum}`);

        const benefitsHtml = isEnclave && Array.isArray(it.benefits)
            ? `<div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:0.9rem 1rem;margin-bottom:1rem;">
                   <div style="font-size:0.76rem;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:0.4rem;">Bonificaciones Territoriales Activas</div>
                   <ul style="margin:0;padding-left:1.1rem;color:#e2e8f0;font-size:0.86rem;line-height:1.6;">
                       ${it.benefits.map(b => `<li>${this.escapeHtml(b)}</li>`).join("")}
                   </ul>
               </div>`
            : "";

        body.innerHTML = `
            <button type="button" onclick="document.getElementById('sovInspectorModal').classList.remove('active')" style="position:absolute;top:14px;right:16px;background:none;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer;line-height:1;">&times;</button>
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:1.1rem;">
                ${isEnclave
                    ? `<div class="db-item-icon" style="width:56px;height:56px;font-size:2.1rem;">${it.icon || '🏰'}</div>`
                    : `<img class="db-item-img-icon" style="width:56px;height:56px;" src="${iconUrl}" alt="${this.escapeHtml(it.name)}">`
                }
                <div>
                    <div style="font-size:0.74rem;font-weight:800;color:#38bdf8;text-transform:uppercase;letter-spacing:0.06em;">
                        ${isEnclave ? 'ENCLAVE CONQUISTABLE · ' + this.escapeHtml(it.zone || 'Azeroth') : (CATEGORY_LABELS[it.category] || 'REGISTRO SOBERANO') + ' · ' + rarity.toUpperCase()}
                    </div>
                    <h2 class="db-item-title ${rarity}" style="font-size:1.32rem;margin-top:2px;">${this.escapeHtml(it.name)}</h2>
                </div>
            </div>
            <p style="color:#cbd5e1;font-size:0.93rem;line-height:1.6;margin-bottom:1.1rem;">${this.escapeHtml(it.description || '')}</p>
            ${benefitsHtml}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;margin-bottom:1.25rem;font-size:0.83rem;">
                <div style="background:rgba(0,0,0,0.35);padding:0.65rem 0.85rem;border-radius:8px;border:1px solid rgba(255,255,255,0.07);">
                    <span style="color:#94a3b8;display:block;font-size:0.72rem;">IDENTIFICADOR / COORDS</span>
                    <strong style="color:#fff;">${isEnclave ? this.escapeHtml(it.coords || '') : '#' + entryNum + (it.ilvl ? ' · iLvl ' + it.ilvl : '')}</strong>
                </div>
                <div style="background:rgba(0,0,0,0.35);padding:0.65rem 0.85rem;border-radius:8px;border:1px solid rgba(255,255,255,0.07);">
                    <span style="color:#94a3b8;display:block;font-size:0.72rem;">FUENTE / REQUISITO</span>
                    <strong style="color:#fbbf24;">${this.escapeHtml(it.source || it.requirements || it.req || 'Era Clásica Cap 60')}</strong>
                </div>
            </div>
            <div style="display:flex;gap:0.7rem;flex-wrap:wrap;justify-content:flex-end;">
                <button type="button" class="pj-dialog-btn pj-dialog-btn-confirm" onclick="DB_ENGINE.copyCommand('${this.escapeAttr(String(copyTarget))}', 'Copiado al portapapeles')">${this.escapeHtml(copyLabel)}</button>
                ${isCanonical
                    ? `<a href="https://www.wowhead.com/wotlk/item=${entryNum}" target="_blank" rel="noopener noreferrer" class="pj-dialog-btn pj-dialog-btn-cancel" style="text-decoration:none;">🌐 Ver en Wowhead WotLK</a>`
                    : `<a href="tienda.html" class="pj-dialog-btn pj-dialog-btn-cancel" style="text-decoration:none;">💎 Ver en Tesorería</a>`
                }
            </div>
        `;
        overlay.classList.add("active");
    },

    copyCommand(text, label) {
        navigator.clipboard.writeText(text).then(() => {
            if (window.showPortalToast) {
                window.showPortalToast(`✓ <strong>${label}:</strong> <code>${this.escapeHtml(text)}</code>`, "success", 3200);
            }
        }).catch(() => {
            if (window.showPortalToast) {
                window.showPortalToast(`📋 Comando: <code>${this.escapeHtml(text)}</code>`, "info", 4500);
            }
        });
    },

    renderPagination() {
        let pagContainer = document.getElementById("dbPagination");
        if (!pagContainer) {
            pagContainer = document.createElement("div");
            pagContainer.id = "dbPagination";
            pagContainer.style.cssText = "display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 3rem; padding: 1rem;";
            const main = document.querySelector("main");
            if (main) main.appendChild(pagContainer);
        }

        if (this.totalPages <= 1) {
            pagContainer.innerHTML = "";
            return;
        }

        pagContainer.innerHTML = `
            <button class="db-chip" id="btnPrevPage" ${this.page <= 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
                ◀ Anterior
            </button>
            <span style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">
                Página <strong style="color: #fff;">${this.page}</strong> de <strong style="color: #fff;">${this.totalPages}</strong> (${this.totalItems} registros)
            </span>
            <button class="db-chip" id="btnNextPage" ${this.page >= this.totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
                Siguiente ▶
            </button>
        `;

        const prevBtn = document.getElementById("btnPrevPage");
        const nextBtn = document.getElementById("btnNextPage");

        if (prevBtn && this.page > 1) {
            prevBtn.addEventListener("click", () => {
                this.page--;
                this.fetchItems();
                window.scrollTo({ top: 250, behavior: "smooth" });
            });
        }
        if (nextBtn && this.page < this.totalPages) {
            nextBtn.addEventListener("click", () => {
                this.page++;
                this.fetchItems();
                window.scrollTo({ top: 250, behavior: "smooth" });
            });
        }
    },

    refreshWowheadTooltips() {
        if (window.$WowheadPower && typeof window.$WowheadPower.refreshLinks === "function") {
            try { window.$WowheadPower.refreshLinks(); } catch (_) {}
        }
    },

    escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    },

    escapeAttr(str) {
        return this.escapeHtml(str).replace(/'/g, "\\'");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    DB_ENGINE.init();
});
