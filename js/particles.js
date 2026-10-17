/**
 * Project JAIna — Master Arcane & Frost Particle Engine (GPU-Accelerated)
 * Capa dual de partículas etéreas de Dalaran: ascendentes arcanas y cristales de escarcha
 * Interactividad reactiva al cursor (vórtice de repulsión suave) y resonancia armónica con audio
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.createElement('canvas');
        canvas.id = 'ambientParticleCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.85';
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.scale(dpr, dpr);
        }
        resize();
        window.addEventListener('resize', resize);

        // Rastreo reactivo del cursor (para vórtice y deflexión sutil)
        const mouse = { x: -9999, y: -9999, radius: 140, isHovering: false };
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.isHovering = true;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
            mouse.isHovering = false;
        });

        // Generación de partículas
        const IS_MOBILE = width < 768;
        const PARTICLE_COUNT = IS_MOBILE ? 42 : Math.min(95, Math.floor(width / 18));
        const particles = [];

        const ARCANE_PALETTES = [
            { r: 0, g: 242, b: 254 },    // Arcane Frost Cyan
            { r: 79, g: 172, b: 254 },   // Azure Ley-line
            { r: 245, g: 158, b: 11 },   // Celestial Sunstrider Gold
            { r: 192, g: 132, b: 252 },  // Kirin Tor Violet
            { r: 255, g: 255, b: 255 }   // Pure Glacial Snow
        ];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const isFrost = Math.random() > 0.45; // 55% arcanas ascendentes, 45% escarcha descendente
            const color = ARCANE_PALETTES[Math.floor(Math.random() * ARCANE_PALETTES.length)];
            
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseRadius: Math.random() * 2.4 + 0.9,
                radius: 1,
                color: color,
                baseAlpha: Math.random() * 0.55 + 0.25,
                alpha: 0.5,
                isFrost: isFrost,
                vx: (Math.random() - 0.5) * 0.5,
                vy: isFrost ? (Math.random() * 0.6 + 0.35) : -(Math.random() * 0.7 + 0.3),
                oscFreq: Math.random() * 0.03 + 0.01,
                oscAmp: Math.random() * 0.6 + 0.2,
                oscOffset: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.02
            });
        }

        let time = 0;
        let isTabActive = true;
        document.addEventListener('visibilitychange', () => {
            isTabActive = !document.hidden;
        });

        function render() {
            if (!isTabActive) {
                requestAnimationFrame(render);
                return;
            }

            ctx.clearRect(0, 0, width, height);
            time += 0.018;

            // Detección de resonancia acústica con Ecos de Dalaran
            const isAudioActive = Boolean(window.jainaAmbientAudio && window.jainaAmbientAudio.isPlaying);
            const audioPulse = isAudioActive ? Math.sin(time * 3.5) * 0.25 + 0.25 : 0;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Movimiento intrínseco + oscilación senoidal
                p.x += p.vx + Math.sin(time * 1.5 + p.oscOffset) * p.oscAmp;
                p.y += p.vy;
                p.rotation += p.rotSpeed;

                // Reactividad al cursor (Fuerza suave de repulsión elástica)
                if (mouse.isHovering) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < mouse.radius && dist > 1) {
                        const force = (1 - dist / mouse.radius) * 1.6;
                        p.x += (dx / dist) * force * 1.8;
                        p.y += (dy / dist) * force * 1.8;
                    }
                }

                // Wrap-around de pantalla
                if (p.isFrost) {
                    if (p.y > height + 20) {
                        p.y = -20;
                        p.x = Math.random() * width;
                    }
                } else {
                    if (p.y < -20) {
                        p.y = height + 20;
                        p.x = Math.random() * width;
                    }
                }
                if (p.x < -20) p.x = width + 20;
                if (p.x > width + 20) p.x = -20;

                // Cálculo de resplandor dinámico con respiración
                const breathing = Math.sin(time * 2 + p.oscOffset) * 0.18;
                p.alpha = Math.min(1, Math.max(0.1, p.baseAlpha + breathing + audioPulse));
                p.radius = p.baseRadius * (1 + audioPulse * 0.5);

                // Dibujado optimizado por lotes
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);

                if (p.isFrost && p.baseRadius > 2.0) {
                    // Crystalline snowflake glimmer (estrella de 4 puntas de escarcha)
                    ctx.beginPath();
                    const s = p.radius * 2;
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.3, -s * 0.3);
                    ctx.lineTo(s, 0);
                    ctx.lineTo(s * 0.3, s * 0.3);
                    ctx.lineTo(0, s);
                    ctx.lineTo(-s * 0.3, s * 0.3);
                    ctx.lineTo(-s, 0);
                    ctx.lineTo(-s * 0.3, -s * 0.3);
                    ctx.closePath();
                    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
                    ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.8)`;
                    ctx.shadowBlur = p.radius * 4;
                    ctx.fill();
                } else {
                    // Mote arcano esférico con halo radiante
                    ctx.beginPath();
                    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
                    ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.9)`;
                    ctx.shadowBlur = p.radius * (isAudioActive ? 6 : 3.5);
                    ctx.fill();
                }

                ctx.restore();
            }

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    });
})();
