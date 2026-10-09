/**
 * Project JAIna — Simulador Interactivo de Lore Viviente con Lady Jaina
 * Conecta con el LLM local (Qwen 2.5 3B en puerto 1234) o responde canónicamente.
 */
(function () {
    'use strict';

    const CANONICAL_RESPONSES = {
        "mision": "«Mi misión en Theramore y Dalaran siempre ha sido preservar la paz entre los pueblos libres y salvaguardar los secretos del Kirin Tor. Con Rasganorte en el horizonte, no permitiré que la oscuridad consuma nuestro mundo.»",
        "herobot": "«Cuando me invoques con '.playerbots add Jaina', lucharé a tu lado con la furia de la escarcha y el poder arcano de Archus. Adaptaré mis hechizos a cada encuentro y protegeré a tus aliados con barreras de hielo.»",
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

        promptPills.forEach(pill => {
            pill.addEventListener('click', () => {
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
            const typingEl = document.createElement('div');
            typingEl.className = 'chat-msg msg-jaina typing';
            typingEl.innerHTML = `
                <img src="images/jaina_crest_logo.jpg" alt="Jaina" class="msg-avatar-img">
                <div class="msg-bubble"><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span> Conjurando respuesta arcana...</div>
            `;
            chatLog.appendChild(typingEl);
            chatLog.scrollTop = chatLog.scrollHeight;

            let replyText = "";

            // Intento de conexión con el motor de IA si está hosteado
            try {
                const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : 'http://127.0.0.1:8080';
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                const res = await fetch(`${apiUrl}/api/chat`, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: rawText, speaker: "Aventurero" })
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data.reply) replyText = data.reply;
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
                    } else if (lower.includes("addon") || lower.includes("interfaz") || lower.includes("dragonflight")) {
                        replyText = "«Hemos preparado 18 AddOns oficiales para ti: Dragonflight UI en 3.3.5a, audio espacial 3D, Pase de Batalla y gráficos remasterizados. Todo disponible en el Launcher oficial.»";
                    } else {
                        replyText = `«He reflexionado sobre tus palabras: "${escapeHtml(rawText)}". El destino de Azeroth se forjará con el coraje de héroes como tú. Te espero en Dalaran y en las cámaras de Theramore.»`;
                    }
                }
            }

            setTimeout(() => {
                typingEl.remove();
                const msgEl = document.createElement('div');
                msgEl.className = 'chat-msg msg-jaina';
                msgEl.innerHTML = `
                    <img src="images/jaina_crest_logo.jpg" alt="Lady Jaina" class="msg-avatar-img">
                    <div class="msg-bubble">
                        <div class="msg-sender">Lady Jaina Valiente <span class="badge-ai-spark">IA Neuronal</span></div>
                        <div class="msg-text">${replyText}</div>
                    </div>
                `;
                chatLog.appendChild(msgEl);
                chatLog.scrollTop = chatLog.scrollHeight;
            }, 700);
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    });
})();
