/**
 * Project Jaina / Project Jaina — Registro SRP6 en Vivo
 */

document.addEventListener("DOMContentLoaded", () => {
    const regForm = document.getElementById("registerForm");
    const msgBox = document.getElementById("registerMessage");
    const submitBtn = document.getElementById("btnRegisterSubmit");

    if (regForm) {
        regForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value;
            const confirmPassword = document.getElementById("regConfirmPassword").value;
            const email = document.getElementById("regEmail").value.trim();
            const clan = document.querySelector('input[name="clan"]:checked')?.value || "PROJECT_JAINA";

            if (password !== confirmPassword) {
                showMessage("Las contraseñas no coinciden. Por favor verifica.", "error");
                return;
            }

            if (password.length < 4) {
                showMessage("La contraseña debe tener al menos 4 caracteres.", "error");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerText = "⏳ Creando Cuenta en el Núcleo...";
            showMessage("Procesando criptografía SRP6 y registrando en AzerothCore...", "info");

            try {
                const apiUrl = CONFIG.getApiUrl();
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
                    showMessage(`🎉 ¡Éxito! Cuenta '${username.toUpperCase()}' creada exitosamente. Ya puedes iniciar sesión con Wow.exe o desde tu Launcher.`, "success");
                    regForm.reset();
                } else {
                    showMessage(`⚠️ No se pudo registrar: ${result.message || 'Error desconocido'}`, "error");
                }
            } catch (err) {
                showMessage("❌ Error de conexión con el servidor. Verifica que tu servidor local esté en línea o conéctate a la red Radmin VPN.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "⚔️ CREAR CUENTA SRP6";
            }
        });
    }

    function showMessage(text, type) {
        if (!msgBox) return;
        msgBox.innerText = text;
        msgBox.style.display = "block";
        if (type === "success") {
            msgBox.style.background = "rgba(46, 204, 113, 0.15)";
            msgBox.style.borderColor = "rgba(46, 204, 113, 0.4)";
            msgBox.style.color = "#2ecc71";
        } else if (type === "error") {
            msgBox.style.background = "rgba(231, 76, 60, 0.15)";
            msgBox.style.borderColor = "rgba(231, 76, 60, 0.4)";
            msgBox.style.color = "#e74c3c";
        } else {
            msgBox.style.background = "rgba(52, 152, 219, 0.15)";
            msgBox.style.borderColor = "rgba(52, 152, 219, 0.4)";
            msgBox.style.color = "#3498db";
        }
    }
});
