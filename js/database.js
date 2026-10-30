/**
 * ==============================================================================
 * Project JAIna — Base de Datos Soberana de Azeroth (AoWoW Nativo L9)
 * Archivo: js/database.js
 * Versión: 3.0 Mythos (Empirismo Estricto, Resiliencia y Cero Mockups)
 * ==============================================================================
 * Características:
 *  1. Sondeo en vivo hacia /api/database/items contra acore_world.item_template.
 *  2. Paginación asíncrona real (24 ítems por página) y debounce de búsqueda (300ms).
 *  3. Integración con Nether Wowhead (tooltips dinámicos con data-wowhead).
 *  4. Fallback automático a data/database_catalog.json si la API local/túnel está offline.
 *  5. Filtro de Era Vanilla estricto (ReqLevel <= 60 / iLvl <= 92).
 * ==============================================================================
 */

const DB_ENGINE = {
    category: "all",
    query: "",
    page: 1,
    limit: 24,
    eraCap: 60,
    totalPages: 1,
    totalItems: 0,
    isLive: false,
    debounceTimer: null,
    cachedLocalCatalog: null,

    async init() {
        this.bindEvents();
        await this.fetchItems();
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
                }, 300);
            });
        }

        const chips = document.querySelectorAll(".db-chip");
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                chips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                this.category = chip.getAttribute("data-cat") || "all";
                this.page = 1;
                this.fetchItems();
            });
        });
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
            const timeoutId = setTimeout(() => ctrl.abort(), 2800);

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
                if (data && Array.isArray(data.items)) {
                    this.isLive = true;
                    this.totalItems = data.total || data.items.length;
                    this.totalPages = data.total_pages || 1;
                    this.updateStatusBadge(true, "● SERVIDOR EN VIVO (CONECTADO A ACORE_WORLD)");
                    this.renderGrid(data.items);
                    this.renderPagination();
                    this.refreshWowheadTooltips();
                    return;
                }
            }
            throw new Error("Respuesta no válida del endpoint");
        } catch (err) {
            // Fallback transparente al catálogo canónico local
            await this.loadLocalFallback();
        }
    },

    async loadLocalFallback() {
        this.isLive = false;
        this.updateStatusBadge(false, "○ MODO RESGUARDO LOCAL (CATÁLOGO CANÓNICO OFFLINE)");

        if (!this.cachedLocalCatalog) {
            try {
                const res = await fetch(`data/database_catalog.json?t=${Date.now()}`);
                if (res.ok) {
                    this.cachedLocalCatalog = await res.json();
                }
            } catch (_) {
                this.cachedLocalCatalog = [];
            }
        }

        let filtered = [...(this.cachedLocalCatalog || [])];

        // Filtro de categoría
        if (this.category !== "all") {
            filtered = filtered.filter(it => it.category === this.category);
        }

        // Filtro de búsqueda
        if (this.query) {
            filtered = filtered.filter(it => {
                const name = (it.name || "").toLowerCase();
                const desc = (it.description || "").toLowerCase();
                const ent = String(it.entry || "");
                return name.includes(this.query) || desc.includes(this.query) || ent.includes(this.query);
            });
        }

        this.totalItems = filtered.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.limit));

        const offset = (this.page - 1) * this.limit;
        const pageItems = filtered.slice(offset, offset + this.limit);

        this.renderGrid(pageItems);
        this.renderPagination();
        this.refreshWowheadTooltips();
    },

    updateStatusBadge(isOnline, text) {
        let badge = document.getElementById("dbLiveBadge");
        if (!badge) {
            const container = document.querySelector(".db-search-bar");
            if (container) {
                badge = document.createElement("div");
                badge.id = "dbLiveBadge";
                badge.style.cssText = "text-align: center; margin-bottom: 1.2rem; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.5px; transition: all 0.3s ease;";
                container.parentNode.insertBefore(badge, container);
            }
        }
        if (badge) {
            badge.textContent = text;
            badge.style.color = isOnline ? "#39d353" : "#ffb74d";
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
                    <p>No hay coincidencias para "<strong>${this.escapeHtml(this.query)}</strong>" en la categoría actual de Era Vanilla.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(it => {
            const isEnclave = (it.category === "enclaves" || it.benefits);
            if (isEnclave) {
                return this.renderEnclaveCard(it);
            }
            return this.renderItemCard(it);
        }).join("");
    },

    renderItemCard(it) {
        const rarity = it.rarity || "comun";
        const iconName = it.icon || "inv_misc_questionmark";
        const iconUrl = iconName.startsWith("http")
            ? iconName
            : `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`;

        const reqText = it.req || (it.req_level ? `Requiere Nivel ${it.req_level}` : "Sin requisito de nivel");
        const ilvlText = it.ilvl ? `iLvl ${it.ilvl}` : "";
        const entryTag = it.entry ? `ID: ${it.entry}` : "";

        return `
            <div class="db-card rarity-${rarity}">
                <div class="db-card-header">
                    <a href="https://www.wowhead.com/wotlk/item=${it.entry}" data-wowhead="item=${it.entry}&domain=wotlk" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                        <img class="db-item-img-icon" src="${iconUrl}" alt="${this.escapeHtml(it.name)}" onerror="this.onerror=null; this.src='https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'">
                    </a>
                    <div>
                        <h3 class="db-item-title ${rarity}">
                            <a href="https://www.wowhead.com/wotlk/item=${it.entry}" data-wowhead="item=${it.entry}&domain=wotlk" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                                ${this.escapeHtml(it.name)}
                            </a>
                        </h3>
                        <span class="db-item-type">${(it.category || 'ITEM').toUpperCase()} · ${rarity.toUpperCase()}</span>
                    </div>
                </div>
                <p class="db-item-desc">${this.escapeHtml(it.description || 'Objeto de Era Clásica registrado en acore_world.')}</p>
                <div class="db-item-meta">
                    <span class="db-tag">${entryTag} ${ilvlText ? '· ' + ilvlText : ''}</span>
                    <span>${this.escapeHtml(reqText)}</span>
                </div>
            </div>
        `;
    },

    renderEnclaveCard(enc) {
        const benefitsList = (enc.benefits || []).map(b => `<li>✓ ${this.escapeHtml(b)}</li>`).join("");
        return `
            <div class="db-card rarity-${enc.rarity || 'legendario'}" style="border-left: 3px solid #f59e0b;">
                <div class="db-card-header">
                    <div class="db-item-icon" style="font-size: 2rem;">${enc.icon || '🏰'}</div>
                    <div>
                        <h3 class="db-item-title ${enc.rarity || 'legendario'}">${this.escapeHtml(enc.name)}</h3>
                        <span class="db-item-type">ENCLAVE DE HERMANDAD · ${enc.zone || 'Azeroth'}</span>
                    </div>
                </div>
                <p class="db-item-desc">${this.escapeHtml(enc.description)}</p>
                <ul style="list-style: none; padding: 0; margin: 0.8rem 0; font-size: 0.84rem; color: #38bdf8; line-height: 1.6;">
                    ${benefitsList}
                </ul>
                <div class="db-item-meta">
                    <span class="db-tag">Coords: ${enc.coords || 'Reino 1'}</span>
                    <span style="color: var(--gold-primary); font-weight: 600;">${this.escapeHtml(enc.requirements || 'Nivel 3+')}</span>
                </div>
            </div>
        `;
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
                window.scrollTo({ top: 380, behavior: "smooth" });
            });
        }
        if (nextBtn && this.page < this.totalPages) {
            nextBtn.addEventListener("click", () => {
                this.page++;
                this.fetchItems();
                window.scrollTo({ top: 380, behavior: "smooth" });
            });
        }
    },

    refreshWowheadTooltips() {
        if (window.$WowheadPower && typeof window.$WowheadPower.refreshLinks === "function") {
            try {
                window.$WowheadPower.refreshLinks();
            } catch (_) {}
        }
    },

    escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    DB_ENGINE.init();
});
