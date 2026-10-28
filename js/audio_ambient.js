/**
 * Project Jaina — Sintetizador de Audio Ambiente Arcano (Web Audio API)
 * Ecosonido Procedural de Dalaran y el Santuario de Lady Jaina
 * Cero dependencias externas · Cero consumo de ancho de banda · Pure Web Standards
 */

class ArcaneAmbientAudio {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.masterGain = null;
        this.nodes = [];
        this.chimeTimer = null;
        this.button = null;
        this.userVolumePct = 100;
    }

    init() {
        this.button = document.getElementById("ambientAudioBtn");
        if (!this.button) return;

        // Si Jukebox Engine está presente, delega el control para evitar doble reproducción simultánea
        this.button.addEventListener("click", () => {
            if (window.jainaJukebox) {
                return;
            }
            this.toggle();
        });

        // Manejo de visibilidad de página (pausar si la pestaña se oculta)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.isPlaying) {
                this.pause();
            } else if (!document.hidden && this.wasPlayingBeforeHide) {
                this.resume();
            }
        });
    }

    async toggle() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();
        }

        if (this.ctx.state === "suspended") {
            await this.ctx.resume();
        }

        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }

    async play() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();
        }

        if (this.ctx.state === "suspended") {
            await this.ctx.resume();
        }

        if (this.isPlaying) return;
        this.isPlaying = true;
        this.wasPlayingBeforeHide = true;

        // Master Gain con Fade-In suave
        const targetGain = (this.userVolumePct / 100) * 0.35;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain), this.ctx.currentTime + 3.0);
        this.masterGain.connect(this.ctx.destination);

        // Capa 2: Filtro Resonante Biquad con LFO (Respiración Mística)
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.5, this.ctx.currentTime);
        filter.connect(this.masterGain);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 1 ciclo cada ~8 seg
        lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        this.nodes.push(filter, lfo, lfoGain);

        // Capa 1: Drone Arcano Grave (Fundamento A2 - 110Hz y E3 - 164.8Hz) - enrutados a través del filtro
        this.createDrone(110.0, "sine", 0.22, filter);
        this.createDrone(164.81, "triangle", 0.15, filter);
        this.createDrone(220.0, "sine", 0.09, filter);

        // Capa 3: Campanas de Cristal de Dalaran (Chimes estocásticos)
        this.startCrystalChimes();

        this.updateUI(true);
    }

    createDrone(freq, type, volume, destination = null) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Ligero detuning armónico para profundidad estereofónica
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(destination || this.masterGain);

        osc.start();
        this.nodes.push(osc, gain);
    }

    startCrystalChimes() {
        const chordNotes = [440.0, 523.25, 659.25, 880.0, 1046.5]; // A4, C5, E5, A5, C6 (Acorde Arcano de Escarcha)

        const triggerChime = () => {
            if (!this.isPlaying || !this.ctx) return;

            const noteFreq = chordNotes[Math.floor(Math.random() * chordNotes.length)];
            const chimeOsc = this.ctx.createOscillator();
            const chimeGain = this.ctx.createGain();

            chimeOsc.type = "sine";
            chimeOsc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);

            // Envolvente de percusión de cristal (Ataque ultra rápido, decaimiento largo)
            const now = this.ctx.currentTime;
            chimeGain.gain.setValueAtTime(0.0001, now);
            chimeGain.gain.linearRampToValueAtTime(0.045, now + 0.05);
            chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

            chimeOsc.connect(chimeGain);
            chimeGain.connect(this.masterGain);

            chimeOsc.onended = () => {
                try { chimeOsc.disconnect(); } catch (e) {}
                try { chimeGain.disconnect(); } catch (e) {}
                const i1 = this.nodes.indexOf(chimeOsc);
                if (i1 !== -1) this.nodes.splice(i1, 1);
                const i2 = this.nodes.indexOf(chimeGain);
                if (i2 !== -1) this.nodes.splice(i2, 1);
            };
            this.nodes.push(chimeOsc, chimeGain);

            chimeOsc.start(now);
            chimeOsc.stop(now + 3.6);

            // Próxima campana en un intervalo orgánico (entre 4 y 9 segundos)
            const nextDelay = 4000 + Math.random() * 5000;
            this.chimeTimer = setTimeout(triggerChime, nextDelay);
        };

        this.chimeTimer = setTimeout(triggerChime, 2500);
    }

    stop() {
        if (!this.isPlaying || !this.ctx) return;
        this.isPlaying = false;
        this.wasPlayingBeforeHide = false;

        if (this.chimeTimer) {
            clearTimeout(this.chimeTimer);
            this.chimeTimer = null;
        }

        // Fade-out suave antes de cerrar nodos
        if (this.masterGain) {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
            this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

            setTimeout(() => {
                this.nodes.forEach(node => {
                    try { if (node.stop) node.stop(); } catch (e) {}
                    try { if (node.disconnect) node.disconnect(); } catch (e) {}
                });
                this.nodes = [];
            }, 1250);
        }

        this.updateUI(false);
    }

    pause() {
        if (this.ctx && this.isPlaying) {
            this.ctx.suspend();
            this.updateUI(false);
        }
    }

    resume() {
        if (this.ctx && this.isPlaying) {
            this.ctx.resume();
            this.updateUI(true);
        }
    }

    setVolume(volPercent) {
        this.userVolumePct = Math.max(0, Math.min(100, volPercent));
        if (this.masterGain && this.ctx) {
            const targetGain = (this.userVolumePct / 100) * 0.35;
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
        }
    }

    updateUI(active) {
        if (!this.button) return;
        if (window.jainaJukebox) return;

        if (active) {
            this.button.classList.add("playing");
            this.button.setAttribute("title", "Pausar Ecosonido Arcano de Dalaran");
            const label = this.button.querySelector(".audio-label");
            if (label) label.textContent = "Arcano: ACTIVO";
        } else {
            this.button.classList.remove("playing");
            this.button.setAttribute("title", "Activar Ecosonido Arcano de Dalaran");
            const label = this.button.querySelector(".audio-label");
            if (label) label.textContent = "Ecos de Dalaran";
        }
    }
}

// Inicialización automática al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    window.jainaAmbientAudio = new ArcaneAmbientAudio();
    window.jainaAmbientAudio.init();
});
