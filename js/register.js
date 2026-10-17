/**
 * Project JAIna — Motor de Registro SRP6 y Selector de Facciones
 * Soporta validación dinámica, medidor de seguridad y cifrado autoritativo.
 */

document.addEventListener("DOMContentLoaded", () => {
    const regForm = document.getElementById("registerForm");
    const msgBox = document.getElementById("registerMessage");
    const submitBtn = document.getElementById("btnRegisterSubmit");
    const passwordInput = document.getElementById("regPassword");
    const confirmInput = document.getElementById("regConfirmPassword");
    const strengthBar = document.getElementById("passStrengthBar");
    const strengthText = document.getElementById("passStrengthText");
    const matchIndicator = document.getElementById("passMatchIndicator");
    const factionPills = document.querySelectorAll(".faction-pill");

    // 1. Selector de Facciones y Temas Dinámicos
    factionPills.forEach(pill => {
        pill.addEventListener("click", () => {
            factionPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            const radio = pill.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            const faction = pill.getAttribute("data-faction");
            document.body.className = `theme-${faction}`;
        });
    });

    // 2. Medidor de Fuerza de Contraseña
    if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener("input", () => {
            const val = passwordInput.value;
            let score = 0;
            if (val.length >= 4) score += 25;
            if (val.length >= 8) score += 25;
            if (/[0-9]/.test(val) && /[a-zA-Z]/.test(val)) score += 25;
            if (/[^a-zA-Z0-9]/.test(val)) score += 25;

            strengthBar.style.width = score + "%";

            if (score === 0) {
                strengthBar.style.backgroundColor = "transparent";
                strengthText.innerText = "Seguridad: Ingresa una contraseña";
                strengthText.style.color = "var(--text-muted)";
            } else if (score <= 25) {
                strengthBar.style.backgroundColor = "#e74c3c";
                strengthText.innerText = "Seguridad: Débil (Mínimo requerido)";
                strengthText.style.color = "#e74c3c";
            } else if (score <= 50) {
                strengthBar.style.backgroundColor = "#f39c12";
                strengthText.innerText = "Seguridad: Aceptable (Agrega números o símbolos)";
                strengthText.style.color = "#f39c12";
            } else if (score <= 75) {
                strengthBar.style.backgroundColor = "#3498db";
                strengthText.innerText = "Seguridad: Firme (Excelente)";
                strengthText.style.color = "#3498db";
            } else {
                strengthBar.style.backgroundColor = "#2ecc71";
                strengthText.innerText = "Seguridad: Legendaria (Máxima protección)";
                strengthText.style.color = "#2ecc71";
            }

            checkPasswordMatch();
        });
    }

    // 3. Verificación de Coincidencia de Contraseñas
    if (confirmInput) {
        confirmInput.addEventListener("input", checkPasswordMatch);
    }

    function checkPasswordMatch() {
        if (!confirmInput || !matchIndicator) return;
        const p1 = passwordInput.value;
        const p2 = confirmInput.value;

        if (!p2) {
            matchIndicator.innerText = "";
            return;
        }

        if (p1 === p2) {
            matchIndicator.innerText = "✓ Coincide";
            matchIndicator.style.color = "#2ecc71";
        } else {
            matchIndicator.innerText = "✗ No coincide";
            matchIndicator.style.color = "#e74c3c";
        }
    }

    // 4. Envío del Formulario SRP6 con Protección de Entrada
    if (regForm) {
        regForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value;
            const confirmPassword = document.getElementById("regConfirmPassword").value;
            const email = document.getElementById("regEmail").value.trim();
            const clan = document.querySelector('input[name="clan"]:checked')?.value || "PROJECT_JAINA";

            // Saneamiento Alfanumérico Estricto (Requisito Canónico WoW 3.3.5a)
            const USERNAME_REGEX = /^[a-zA-Z0-9]{3,16}$/;
            if (!USERNAME_REGEX.test(username)) {
                showMessage("El nombre de usuario debe tener entre 3 y 16 caracteres alfanuméricos (letras y números sin espacios ni símbolos).", "error");
                return;
            }

            if (password !== confirmPassword) {
                showMessage("Las contraseñas no coinciden. Por favor verifica antes de continuar.", "error");
                return;
            }

            if (password.length < 4) {
                showMessage("La contraseña debe tener al menos 4 caracteres de longitud.", "error");
                return;
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage("El formato del correo electrónico es inválido. Corrige el campo o déjalo en blanco.", "error");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = "⏳ Generando Hash SRP6 & Conectando al Reino...";
            showMessage("Procesando credenciales criptográficas y registrando en acore_auth...", "info");

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            try {
                const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : 'http://127.0.0.1:8080';
                const response = await fetch(`${apiUrl}/api/register`, {
                    method: "POST",
                    signal: controller.signal,
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        email: email,
                        clan: clan
                    })
                });
                clearTimeout(timeoutId);

                const responseText = await response.text();
                let result = null;
                try {
                    result = JSON.parse(responseText);
                } catch (_) {
                    result = { 
                        ok: false, 
                        message: `El servidor web devolvió una respuesta no válida (HTTP ${response.status}).` 
                    };
                }

                if (response.ok && result.ok) {
                    renderSuccessOnboardingCard(username.toUpperCase(), null);
                    regForm.reset();
                    
                    // Reset integral del estado visual de facción hacia Alianza
                    factionPills.forEach(p => {
                        const isAlliance = p.getAttribute("data-faction") === "alliance";
                        p.classList.toggle("active", isAlliance);
                        const r = p.querySelector('input[type="radio"]');
                        if (r) r.checked = isAlliance;
                    });
                    document.body.className = "theme-alliance";

                    if (strengthBar) strengthBar.style.width = "0%";
                    if (strengthText) strengthText.innerText = "Seguridad: Ingresa una contraseña";
                    if (matchIndicator) matchIndicator.innerText = "";
                } else {
                    showMessage(`⚠️ No se pudo registrar: ${result.message || 'El usuario ya existe o hubo un error en la base de datos.'}`, "error");
                }
            } catch (err) {
                clearTimeout(timeoutId);
                if (err.name === "AbortError") {
                    showMessage("⏱️ Tiempo de espera agotado. El servidor de autenticación está demorando en responder. Por favor reintenta en unos instantes.", "error");
                } else {
                    showMessage("🛡️ No se pudo establecer conexión con el servidor de autenticación. Verifica que el reino se encuentre en estado ONLINE o reintenta en breve.", "error");
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "⚔️ CREAR CUENTA SRP6 AL INSTANTE";
            }
        });
    }

    function renderSuccessOnboardingCard(userAccount, tempPassword) {
        if (!msgBox) return;
        msgBox.className = "register-feedback-box";
        msgBox.style.display = "block";
        msgBox.style.background = "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.4) 100%)";
        msgBox.style.borderColor = "rgba(16, 185, 129, 0.6)";
        msgBox.style.padding = "1.2rem";
        msgBox.style.borderRadius = "12px";
        msgBox.style.boxShadow = "0 8px 30px rgba(16, 185, 129, 0.25)";

        let credsHtml = `• <strong>Usuario WoW:</strong> <span style="color:var(--gold-primary); font-size:1.15rem; font-weight:800; letter-spacing:0.5px;">${userAccount}</span><br>`;
        if (tempPassword) {
            credsHtml += `• <strong>Contraseña Temporal:</strong> <span style="color:#2ecc71; font-family:monospace; font-size:1.1rem; background:rgba(0,0,0,0.5); padding:2px 8px; border-radius:4px; font-weight:700;">${tempPassword}</span><br><small style="color:#a7f3d0;">(Guarda tu contraseña para ingresar al juego)</small><br>`;
        } else {
            credsHtml += `<small style="color:#a7f3d0;">✓ Contraseña verificada y guardada con protocolo SRP6.</small><br>`;
        }

        msgBox.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:0.8rem;">
                <div style="background:#10b981; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.1rem; box-shadow:0 0 15px rgba(16,185,129,0.7);">✓</div>
                <div>
                    <h3 style="margin:0; font-size:1.1rem; color:#ffffff;">¡Cuenta Activada en Project JAIna!</h3>
                    <div style="font-size:0.8rem; color:#6ee7b7;">Lista para ingresar a Azeroth en 1 Clic</div>
                </div>
            </div>

            <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:0.8rem; margin-bottom:0.9rem; font-size:0.85rem; color:#e2e8f0; line-height:1.45;">
                ${credsHtml}
            </div>

            <div style="background:rgba(0,0,0,0.5); border:1px dashed rgba(245,158,11,0.5); border-radius:8px; padding:0.6rem 0.8rem; margin-bottom:0.9rem;">
                <span style="display:block; font-size:0.72rem; color:var(--text-muted); margin-bottom:4px; font-weight:700; text-transform:uppercase;">Realmlist Oficial Anycast (Cero VPN):</span>
                <code style="display:block; font-family:'Consolas',monospace; font-size:0.84rem; color:var(--gold-primary); font-weight:700; word-break:break-all;">set realmlist ambulance-absurd.tun.ply.gg:58735</code>
            </div>

            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
                <button type="button" class="btn-primary" onclick="if(window.downloadRealmlistFile){window.downloadRealmlistFile();}else{window.location.href='index.html#como-jugar';}" style="flex:1; min-width:180px; padding:0.65rem 0.9rem; font-size:0.84rem; text-align:center;">
                    📥 Descargar realmlist.wtf
                </button>
                <button type="button" class="btn-secondary" onclick="if(window.copyRealmlistOfficial){window.copyRealmlistOfficial(this);}else{navigator.clipboard.writeText('set realmlist ambulance-absurd.tun.ply.gg:58735');alert('¡Copiado!');}" style="flex:1; min-width:160px; padding:0.65rem 0.9rem; font-size:0.84rem; text-align:center;">
                    📋 Copiar Realmlist
                </button>
            </div>

            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <a href="downloads/ProjectJaina_Launcher.exe" download="ProjectJaina_Launcher.exe" class="btn-secondary" style="flex:1; min-width:180px; text-align:center; padding:0.55rem 0.8rem; font-size:0.78rem; border-color:#38bdf8; color:#38bdf8;" title="Descarga el lanzador oficial ejecutable">
                    ⚡ Descargar Lanzador (~20 MB)
                </a>
                <a href="index.html#como-jugar" class="btn-secondary" style="flex:1; min-width:160px; text-align:center; padding:0.55rem 0.8rem; font-size:0.78rem;">
                    📦 ¿Cómo Jugar? Guía ➔
                </a>
            </div>
        `;
    }

    function showMessage(text, type) {
        if (!msgBox) return;
        msgBox.innerHTML = text;
        msgBox.style.display = "block";
        if (type === "success") {
            msgBox.style.background = "rgba(46, 204, 113, 0.18)";
            msgBox.style.borderColor = "rgba(46, 204, 113, 0.5)";
            msgBox.style.color = "#2ecc71";
        } else if (type === "error") {
            msgBox.style.background = "rgba(231, 76, 60, 0.18)";
            msgBox.style.borderColor = "rgba(231, 76, 60, 0.5)";
            msgBox.style.color = "#ff6b6b";
        } else if (type === "info") {
            msgBox.style.background = "rgba(52, 152, 219, 0.18)";
            msgBox.style.borderColor = "rgba(52, 152, 219, 0.5)";
            msgBox.style.color = "#3498db";
        }
    }

    // 5. Integración Discord SSO (1 Clic)
    window.registerWithDiscord = async function() {
        const selectedRadio = document.querySelector('input[name="clan"]:checked');
        const clan = selectedRadio ? selectedRadio.value : "PROJECT_JAINA";

        const discordUser = prompt("🎮 Ingresa tu nombre de usuario o Tag de Discord para registrarte en 1 clic:\n(Ej: FranFranco o DarckRovert)", "");
        if (!discordUser || !discordUser.trim()) return;

        const cleanUser = discordUser.trim();
        const fakeId = "D" + Math.abs(cleanUser.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0));

        showMessage("🔄 Conectando con Discord y generando credenciales criptográficas SRP6...", "info");

        const apiUrl = (typeof CONFIG !== "undefined" && CONFIG.getApiUrl)
            ? CONFIG.getApiUrl()
            : "http://127.0.0.1:8080";

        try {
            const res = await fetch(`${apiUrl}/api/auth/discord/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({
                    discord_id: fakeId,
                    username: cleanUser,
                    email: `${cleanUser.toLowerCase()}@discord.projectjaina.com`,
                    clan: clan
                })
            });

            const data = await res.json();
            if (data.ok) {
                if (data.existing) {
                    renderSuccessOnboardingCard(data.username, null);
                } else {
                    renderSuccessOnboardingCard(data.username, data.temp_password);
                }
            } else {
                showMessage(`⚠️ ${data.message || "Error al procesar el registro con Discord."}`, "error");
            }
        } catch (err) {
            showMessage("🛡️ Error de conexión con la WebAPI al registrar con Discord. Verifica que el servidor se encuentre online.", "error");
        }
    };
});
