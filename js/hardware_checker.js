/**
 * Project Jaina — Evaluador Interactivo de Hardware ("Can I Run It?")
 * Permite a cualquier jugador comprobar al instante el rendimiento estimado
 * en Project Jaina con parches HD, Dragonflight UI y Audio 3D.
 */

document.addEventListener("DOMContentLoaded", () => {
    initHardwareChecker();
});

function initHardwareChecker() {
    const ramSelect = document.getElementById("hwRamSelect");
    const gpuSelect = document.getElementById("hwGpuSelect");
    const resSelect = document.getElementById("hwResSelect");
    const resultBox = document.getElementById("hwResultBox");

    if (!ramSelect || !gpuSelect || !resultBox) return;

    // Detección automática preliminar (si la API del navegador lo soporta)
    if (navigator.deviceMemory) {
        const mem = navigator.deviceMemory;
        if (mem >= 16) ramSelect.value = "16";
        else if (mem >= 8) ramSelect.value = "8";
        else if (mem >= 4) ramSelect.value = "4";
        else ramSelect.value = "2";
    }

    const evaluatePerformance = () => {
        const ram = parseInt(ramSelect.value, 10) || 4;
        const gpuTier = gpuSelect.value;
        const res = resSelect ? resSelect.value : "1080p";

        let score = 0; // 1: Básico, 2: Óptimo HD, 3: Ultra 120+

        // Evaluación de RAM
        if (ram >= 16) score += 3;
        else if (ram >= 8) score += 2;
        else if (ram >= 4) score += 1;
        else score += 0;

        // Evaluación de Gráficos
        if (gpuTier === "dedicated_high" || gpuTier === "apple_silicon") score += 3;
        else if (gpuTier === "dedicated_mid") score += 2;
        else if (gpuTier === "apu_vega" || gpuTier === "dedicated_low") score += 1;
        else score += 0;

        // Renderizado del resultado dinámico
        if (score >= 5) {
            resultBox.className = "hw-result-badge tier-ultra";
            resultBox.style.background = "rgba(168, 85, 247, 0.15)";
            resultBox.style.borderColor = "rgba(168, 85, 247, 0.4)";
            resultBox.style.color = "#c084fc";
            resultBox.innerHTML = `
                <div style="font-size: 1.3rem;">🔮</div>
                <div>
                    <strong style="color: #ffffff; display: block; font-size: 0.86rem;">RENDIMIENTO ULTRA ÉPICO (100 ~ 144+ FPS)</strong>
                    <span>Tu equipo ejecutará Project Jaina en calidad cinematográfica máxima con Texturas HD WotLK, Interfaz Dragonflight, Audio 3D HRTF y campo de visión ultra-amplio sin caídas.</span>
                </div>
            `;
        } else if (score >= 3) {
            resultBox.className = "hw-result-badge tier-optimal";
            resultBox.style.background = "rgba(46, 204, 113, 0.15)";
            resultBox.style.borderColor = "rgba(46, 204, 113, 0.4)";
            resultBox.style.color = "#2ecc71";
            resultBox.innerHTML = `
                <div style="font-size: 1.3rem;">🌟</div>
                <div>
                    <strong style="color: #ffffff; display: block; font-size: 0.86rem;">EXPERIENCIA FULL HD FLUIDA (60+ FPS)</strong>
                    <span>Rendimiento ideal a ${res}. Podrás jugar con todas las mejoras de calidad de vida, sonido binaural 3D y texturas HD con tiempos de carga instantáneos.</span>
                </div>
            `;
        } else {
            resultBox.className = "hw-result-badge tier-budget";
            resultBox.style.background = "rgba(56, 189, 248, 0.15)";
            resultBox.style.borderColor = "rgba(56, 189, 248, 0.4)";
            resultBox.style.color = "#38bdf8";
            resultBox.innerHTML = `
                <div style="font-size: 1.3rem;">⚡</div>
                <div>
                    <strong style="color: #ffffff; display: block; font-size: 0.86rem;">RENDIMIENTO COMPETITIVO (60 FPS ESTABLE)</strong>
                    <span>Project Jaina está ultra-optimizado. Podrás jugar sin problemas activando la opción estándar en el lanzador. Consumo de RAM estimado: ~1.2 GB.</span>
                </div>
            `;
        }
    };

    ramSelect.addEventListener("change", evaluatePerformance);
    gpuSelect.addEventListener("change", evaluatePerformance);
    if (resSelect) resSelect.addEventListener("change", evaluatePerformance);

    // Evaluación inicial
    evaluatePerformance();
}
