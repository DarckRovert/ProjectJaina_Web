/**
 * Project JAIna — Ambient Arcane & Frost Particle Canvas
 * Partículas etéreas arcanas y nieve celestial aceleradas por GPU
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
        canvas.style.opacity = '0.65';
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const PARTICLE_COUNT = Math.min(55, Math.floor(window.innerWidth / 25));

        const colors = [
            'rgba(0, 229, 255, ',   // Arcane cyan
            'rgba(243, 156, 18, ',   // Gold celestial
            'rgba(165, 94, 234, ',   // Kirin Tor violet
            'rgba(255, 255, 255, '   // Frost snow
        ];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.2 + 0.8,
                colorBase: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.6 + 0.2,
                vx: (Math.random() - 0.5) * 0.45,
                vy: Math.random() * 0.65 + 0.35, // Caída suave de escarcha
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }

        let time = 0;
        function animate() {
            ctx.clearRect(0, 0, width, height);
            time += 0.02;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx + Math.sin(time + p.pulseOffset) * 0.2;
                p.y += p.vy;

                if (p.y > height) {
                    p.y = -10;
                    p.x = Math.random() * width;
                }
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(time * 2 + p.pulseOffset));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.colorBase + currentAlpha + ')';
                ctx.shadowBlur = p.radius * 4;
                ctx.shadowColor = p.colorBase + '0.8)';
                ctx.fill();
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });
})();
