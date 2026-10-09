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

    // 4. Envío del Formulario SRP6
    if (regForm) {
        regForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value;
            const confirmPassword = document.getElementById("regConfirmPassword").value;
            const email = document.getElementById("regEmail").value.trim();
            const clan = document.querySelector('input[name="clan"]:checked')?.value || "PROJECT_JAINA";

            if (password !== confirmPassword) {
                showMessage("Las contraseñas no coinciden. Por favor verifica antes de continuar.", "error");
                return;
            }

            if (password.length < 4) {
                showMessage("La contraseña debe tener al menos 4 caracteres de longitud.", "error");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = "⏳ Generando Hash SRP6 & Conectando a Base de Datos...";
            showMessage("Procesando credenciales criptográficas y registrando en acore_auth...", "info");

            try {
                const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : 'http://127.0.0.1:8080';
                const response = await fetch(`${apiUrl}/api/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        email: email,
                        clan: clan
                    })
                });

                const result = await response.json();

                if (response.ok && result.ok) {
                    showMessage(`🎉 ¡ÉXITO! Cuenta '${username.toUpperCase()}' creada y activada al instante en el reino. Ya puedes iniciar sesión en World of Warcraft o con tu Launcher oficial.`, "success");
                    regForm.reset();
                    if (strengthBar) strengthBar.style.width = "0%";
                    if (strengthText) strengthText.innerText = "Seguridad: Ingresa una contraseña";
                    if (matchIndicator) matchIndicator.innerText = "";
                } else {
                    showMessage(`⚠️ No se pudo registrar: ${result.message || 'El usuario ya existe o hubo un error en la base de datos.'}`, "error");
                }
            } catch (err) {
                showMessage("🛡️ El servidor local se encuentra en espera o estás navegando fuera de la red VPN. Si estás jugando en clúster, conéctate a la red Radmin VPN (Project_Jaina) o contacta al staff.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "⚔️ CREAR CUENTA SRP6 AL INSTANTE";
            }
        });
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
        } else {
            msgBox.style.background = "rgba(52, 152, 219, 0.18)";
            msgBox.style.borderColor = "rgba(52, 152, 219, 0.5)";
            msgBox.style.color = "#3498db";
        }
    }
});
