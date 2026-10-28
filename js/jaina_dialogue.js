/**
 * Project JAIna — Simulador Interactivo de Lore Viviente con Lady Jaina
 * Conecta con el LLM local (Qwen 2.5 3B en puerto 1234) o responde canónicamente.
 */
(function () {
    'use strict';

    const CANONICAL_RESPONSES = {
        "mision": "«Mi misión en Theramore y Dalaran siempre ha sido preservar la paz entre los pueblos libres y salvaguardar los secretos del Kirin Tor. Con Rasganorte en el horizonte, no permitiré que la oscuridad consuma nuestro mundo.»",
        "herobot": "«Cuando me invoques con '.playerbots add Jaina', lucharé a tu lado con la furia de la escarcha y el poder arcano de Archus. Adaptaré mis hechizos a cada encuentro y protegeré a tus aliados con barreras de hielo.»",
        "baluartes": "«Los Baluartes de Hermandad no se compran con dinero real; se conquistan con honor. Cualquier hermandad de nivel 3 o superior con 2,500 monedas de oro puede presentarse ante el Heraldo Intendente en uno de los 6 enclaves estratégicos. Al reclamarlo, izarán los estandartes de su facción, recibirán descanso de hermandad (Rested XP) y accederán a suministros y reparaciones exclusivas.»",
        "galeon": "«Cada 45 minutos, los vigías de Theramore tocan las campanas de alarma naval. Un galeón renegado fondea frente a nuestros arrecifes. Si trepas por sus escalas de red, podrás tripular la artillería de cubierta disparando cañonazos reales con pólvora o saquear el cofre de suministros navales en la popa. ¡Una verdadera prueba de valor en mar abierto!»",
        "audio": "«Gracias al cálculo binaural 3D en puerto 3050, puedes escuchar mi voz resonando según mi posición en el mundo. Si camino a tu izquierda o conjuro a tus espaldas, tu percepción espacial será absoluta.»",
        "fuente": "«Terrallende es el preludio de una amenaza mayor. La purificación de la Fuente del Sol y la caída de Kil'jaeden son imperativos antes de enfrentar los ejércitos de la Plaga en Rasganorte.»",
        "reino": "«Project JAIna no es un simple servidor; es un lienzo donde nuestras memorias perduran. Cada conversación que tengamos, cada batalla compartida, quedará grabada en mi memoria persistente.»"
    };

    document.addEventListener('DOMContentLoaded', () => {
        const chatInput = document.getElementById('jainaChatInput');
        const sendBtn = document.getElementById('jainaSendBtn');
        const chatLog = document.getElementById('jainaChatLog');
        const promptPills = document.querySelectorAll('.prompt-pill');

        if (!chatLog) return;

        let isGenerating = false;

        function setGeneratingState(generating) {
            isGenerating = generating;
            if (sendBtn) sendBtn.disabled = generating;
            if (chatInput) chatInput.disabled = generating;
            promptPills.forEach(p => {
                p.style.pointerEvents = generating ? 'none' : 'auto';
                p.style.opacity = generating ? '0.6' : '1';
            });
            if (!generating && chatInput) chatInput.focus();
        }

        promptPills.forEach(pill => {
            pill.addEventListener('click', () => {
                if (isGenerating) return;
                const promptKey = pill.getAttribute('data-prompt');
                const promptText = pill.innerText;
                addUserMessage(promptText);
                generateJainaReply(promptKey, promptText);
            });
        });

        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', handleUserSubmit);
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleUserSubmit();
            });
        }

        function handleUserSubmit() {
            if (isGenerating) return;
            const text = chatInput.value.trim();
            if (!text) return;
            chatInput.value = '';
            addUserMessage(text);
            generateJainaReply(null, text);
        }

        function addUserMessage(text) {
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-msg msg-user';
            msgEl.innerHTML = `
                <div class="msg-bubble">${escapeHtml(text)}</div>
                <div class="msg-avatar">⚔️</div>
            `;
            chatLog.appendChild(msgEl);
            chatLog.scrollTop = chatLog.scrollHeight;
        }

        async function generateJainaReply(promptKey, rawText) {
            setGeneratingState(true);

            const typingEl = document.createElement('div');
            typingEl.className = 'chat-msg msg-jaina typing';
            typingEl.innerHTML = `
                <img src="images/jaina_crest_logo.jpg" alt="Jaina" class="msg-avatar-img">
                <div class="msg-bubble"><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span> Conjurando respuesta arcana...</div>
            `;
            chatLog.appendChild(typingEl);
            chatLog.scrollTop = chatLog.scrollHeight;

            let replyText = "";
            let isNeural = false;

            // Intento de conexión con el motor de IA si está hosteado
            try {
                const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : 'http://127.0.0.1:8080';
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const res = await fetch(`${apiUrl}/api/chat`, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({ message: rawText, speaker: "Aventurero" })
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data.reply) {
                        replyText = data.reply;
                        if (data.source === 'neural') isNeural = true;
                    }
                }
            } catch (e) {
                // Servidor local o LLM en espera, usar modelo canónico local
            }

            if (!replyText) {
                if (promptKey && CANONICAL_RESPONSES[promptKey]) {
                    replyText = CANONICAL_RESPONSES[promptKey];
                } else {
                    const lower = (rawText || "").toLowerCase();
                    if (lower.includes("hola") || lower.includes("saludos")) {
                        replyText = "«Saludos, viajero. Las agujas de Dalaran te dan la bienvenida. ¿Qué inquietudes traes ante el Consejo del Kirin Tor?»";
                    } else if (lower.includes("arthas") || lower.includes("lich") || lower.includes("rey")) {
                        replyText = "«Arthas eligió su sendero en Stratholme... Un dolor que jamás sanará del todo. Pero por los inocentes de Azeroth, debemos poner fin a su tiranía helada.»";
                    } else if (lower.includes("addon") || lower.includes("interfaz") || lower.includes("dragonflight") || lower.includes("lorehud")) {
                        replyText = "«Hemos preparado 21 AddOns oficiales para ti (17 para aventureros y 4 de maestría): Dragonflight UI en 3.3.5a, audio espacial 3D, LoreHUD con cinemáticas, Pase de Batalla y gráficos remasterizados. Todo disponible en el Launcher oficial.»";
                    } else if (lower.includes("baluarte") || lower.includes("outpost") || lower.includes("hermandad") || lower.includes("fortin")) {
                        replyText = "«Los Baluartes de Hermandad son 6 enclaves estratégicos en Azeroth conquistables con 2,500 monedas de oro por hermandades nivel 3+. Al izar el estandarte, otorgan bonificación de descanso (Rested XP) y suministros exclusivos sin pay-to-win.»";
                    } else if (lower.includes("galeon") || lower.includes("desertor") || lower.includes("barco") || lower.includes("naval") || lower.includes("cañon")) {
                        replyText = "«El Galeón de los Desertores es un evento dinámico cada 45 minutos en la bahía de Theramore. Las campanas de costa dan la alarma, permitiendo abordar por escalas de cuerda, operar cañones de artillería interactivos y reclamar el botín del cofre de popa.»";
                    } else {
                        replyText = `«He reflexionado sobre tus palabras: "${escapeHtml(rawText)}". El destino de Azeroth se forjará con el coraje de héroes como tú. Te espero en Dalaran y en las cámaras de Theramore.»`;
                    }
                }
            }

            setTimeout(() => {
                typingEl.remove();
                const msgEl = document.createElement('div');
                msgEl.className = 'chat-msg msg-jaina';
                const badgeHtml = isNeural 
                    ? '<span class="badge-ai-spark">⚡ IA Neuronal</span>'
                    : '<span class="badge-ai-spark badge-canonical" style="background: rgba(148, 163, 184, 0.2); border-color: rgba(148, 163, 184, 0.4); color: #cbd5e1;">📜 Registro Canónico</span>';

                msgEl.innerHTML = `
                    <img src="images/jaina_crest_logo.jpg" alt="Lady Jaina" class="msg-avatar-img">
                    <div class="msg-bubble">
                        <div class="msg-sender">Lady Jaina Valiente ${badgeHtml}</div>
                        <div class="msg-text">${replyText}</div>
                    </div>
                `;
                chatLog.appendChild(msgEl);
                chatLog.scrollTop = chatLog.scrollHeight;
                setGeneratingState(false);
            }, 300);
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    });
})();
