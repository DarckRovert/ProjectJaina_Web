/**
 * ==============================================================================
 * Project JAIna — ProceduralBiomeSynth v6.1 (Web Audio Binaural Engine)
 * Tres Paisajes Sonoros Matemáticos + Capa Opcional de Hoguera + FFT Real
 * Garantía L9: Token Generacional Atómico (Cero Osciladores Huérfanos / Cero Solapamiento)
 * ==============================================================================
 */

class ProceduralBiomeSynth {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.isPlaying = false;
        this.activeBiome = "procedural_dalaran";
        this.userVolumePct = 80;
        this._genCounter = 0;
        this._activeGen = null;

        // Capa ambiental opcional de Hoguera (desactivada por defecto)
        this.hearthOverlayEnabled = false;
        this._hearthNodes = null;
        this._hearthTimer = null;

        this._noiseBuffers = { pink: null, brown: null };

        document.addEventListener("visibilitychange", () => {
            if (!this.ctx) return;
            if (document.hidden && this.isPlaying) {
                this._wasPlayingBeforeHide = true;
            }
        });
    }

    _ensureContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return false;
            this.ctx = new AudioCtx();
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 128;
            this.analyser.smoothingTimeConstant = 0.82;
            this.analyser.connect(this.ctx.destination);
            this._buildNoiseBuffers();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return true;
    }

    _buildNoiseBuffers() {
        if (!this.ctx) return;
        const sr = this.ctx.sampleRate;
        const len = sr * 4;

        // Pink Noise (Paul Kellet's refined method)
        const pinkBuf = this.ctx.createBuffer(1, len, sr);
        const pinkOut = pinkBuf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < len; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            pinkOut[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }
        this._noiseBuffers.pink = pinkBuf;

        // Brown Noise (Leaky integrator warm rumble)
        const brownBuf = this.ctx.createBuffer(1, len, sr);
        const brownOut = brownBuf.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < len; i++) {
            const white = Math.random() * 2 - 1;
            brownOut[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = brownOut[i];
            brownOut[i] *= 2.8;
        }
        this._noiseBuffers.brown = brownBuf;
    }

    /**
     * Corte atómico garantizado (< 40 ms anti-click ramp) sobre cualquier generación previa.
     * Jamás deja osciladores ni timers huérfanos.
     */
    stopImmediate() {
        this._genCounter++;
        this.isPlaying = false;
        if (this._activeGen) {
            const genToKill = this._activeGen;
            this._activeGen = null;
            this._teardownGenObject(genToKill);
        }
    }

    stop() {
        this.stopImmediate();
    }

    _teardownGenObject(gen) {
        if (!gen) return;
        gen.alive = false;
        gen.timers.forEach(t => clearTimeout(t));
        gen.timers.length = 0;

        if (this.ctx && gen.masterGain) {
            try {
                const now = this.ctx.currentTime;
                gen.masterGain.gain.cancelScheduledValues(now);
                gen.masterGain.gain.setValueAtTime(Math.max(0.0001, gen.masterGain.gain.value), now);
                gen.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.035);
            } catch (_) {}
        }

        setTimeout(() => {
            gen.nodes.forEach(n => {
                try { if (typeof n.stop === "function") n.stop(); } catch (_) {}
                try { if (typeof n.disconnect === "function") n.disconnect(); } catch (_) {}
            });
            gen.nodes.length = 0;
            if (gen.masterGain) {
                try { gen.masterGain.disconnect(); } catch (_) {}
            }
        }, 45);
    }

    async play(biomeId = null) {
        if (biomeId) this.activeBiome = biomeId;
        this.stopImmediate();

        if (!this._ensureContext()) return;
        if (this.ctx.state === "suspended") {
            try { await this.ctx.resume(); } catch (_) {}
        }

        const genId = ++this._genCounter;
        const gen = {
            id: genId,
            alive: true,
            masterGain: this.ctx.createGain(),
            nodes: [],
            timers: []
        };

        const now = this.ctx.currentTime;
        const targetGain = Math.max(0.0001, (this.userVolumePct / 100) * 0.42);
        gen.masterGain.gain.setValueAtTime(0.0001, now);
        gen.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.8);
        gen.masterGain.connect(this.analyser);

        this._activeGen = gen;
        this.isPlaying = true;

        if (this.activeBiome === "procedural_hearth") {
            this._buildTavernHearthBiome(gen);
        } else if (this.activeBiome === "procedural_frozen_throne") {
            this._buildFrozenThroneBiome(gen);
        } else {
            this._buildDalaranSanctumBiome(gen);
        }
    }

    async toggle() {
        if (this.isPlaying) {
            this.stopImmediate();
        } else {
            await this.play(this.activeBiome);
        }
    }

    setVolume(volPercent) {
        this.userVolumePct = Math.max(0, Math.min(100, volPercent));
        if (this.ctx && this._activeGen && this._activeGen.masterGain) {
            const now = this.ctx.currentTime;
            const targetGain = (this.userVolumePct / 100) * 0.42;
            this._activeGen.masterGain.gain.cancelScheduledValues(now);
            this._activeGen.masterGain.gain.setValueAtTime(this._activeGen.masterGain.gain.value, now);
            this._activeGen.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.08);
        }
        if (this.ctx && this._hearthNodes && this._hearthNodes.gain) {
            const now = this.ctx.currentTime;
            const hGain = (this.userVolumePct / 100) * 0.22;
            this._hearthNodes.gain.gain.setTargetAtTime(hGain, now, 0.05);
        }
    }

    getFrequencyData(targetArray) {
        if (!this.analyser || (!this.isPlaying && !this.hearthOverlayEnabled)) return false;
        this.analyser.getByteFrequencyData(targetArray);
        return true;
    }

    // -------------------------------------------------------------------------
    // BIOMA 1: SANTUARIO ARCANO DE DALARAN (Pads Armónicos + Ecos de Cristal)
    // -------------------------------------------------------------------------
    _buildDalaranSanctumBiome(gen) {
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(420, now);
        filter.Q.setValueAtTime(2.8, now);
        filter.connect(gen.masterGain);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.11, now);
        lfoGain.gain.setValueAtTime(190, now);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(now);
        gen.nodes.push(filter, lfo, lfoGain);

        // Acorde A-Lydian / Maj9 cálido
        const voices = [
            { f: 110.00, type: "sine", vol: 0.24, detune: -3 },
            { f: 164.81, type: "triangle", vol: 0.14, detune: 4 },
            { f: 220.00, type: "sine", vol: 0.11, detune: -5 },
            { f: 277.18, type: "sine", vol: 0.06, detune: 6 },
            { f: 329.63, type: "triangle", vol: 0.05, detune: -2 }
        ];
        voices.forEach(v => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = v.type;
            osc.frequency.setValueAtTime(v.f, now);
            osc.detune.setValueAtTime(v.detune, now);
            g.gain.setValueAtTime(v.vol, now);
            osc.connect(g);
            g.connect(filter);
            osc.start(now);
            gen.nodes.push(osc, g);
        });

        // Red de Delay Estéreo Suave para Campanas de Cristal
        const delay = ctx.createDelay(1.0);
        const fb = ctx.createGain();
        const dFilter = ctx.createBiquadFilter();
        delay.delayTime.setValueAtTime(0.42, now);
        fb.gain.setValueAtTime(0.32, now);
        dFilter.type = "lowpass";
        dFilter.frequency.setValueAtTime(1800, now);
        delay.connect(dFilter);
        dFilter.connect(fb);
        fb.connect(delay);
        dFilter.connect(gen.masterGain);
        gen.nodes.push(delay, fb, dFilter);

        const notes = [440.0, 493.88, 554.37, 659.25, 739.99, 880.0, 987.77];
        const scheduleChime = () => {
            if (!gen.alive || this._activeGen !== gen) return;
            const t = ctx.currentTime;
            const freq = notes[Math.floor(Math.random() * notes.length)];
            const osc = ctx.createOscillator();
            const cg = ctx.createGain();
            const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t);
            cg.gain.setValueAtTime(0.0001, t);
            cg.gain.linearRampToValueAtTime(0.055, t + 0.03);
            cg.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

            if (pan) {
                pan.pan.setValueAtTime((Math.random() - 0.5) * 1.3, t);
                osc.connect(cg);
                cg.connect(pan);
                pan.connect(gen.masterGain);
                pan.connect(delay);
                gen.nodes.push(pan);
            } else {
                osc.connect(cg);
                cg.connect(gen.masterGain);
                cg.connect(delay);
            }

            osc.start(t);
            osc.stop(t + 3.3);
            gen.nodes.push(osc, cg);

            const tid = setTimeout(scheduleChime, 2600 + Math.random() * 3800);
            gen.timers.push(tid);
        };
        gen.timers.push(setTimeout(scheduleChime, 900));
    }

    // -------------------------------------------------------------------------
    // BIOMA 2: POSADA DE LA LUMBRE (Hoguera Crepitante + Arpa de Taberna)
    // -------------------------------------------------------------------------
    _buildTavernHearthBiome(gen) {
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // 1. Brasa cálida continua (Brown Noise filtrado)
        if (this._noiseBuffers.brown) {
            const fireSrc = ctx.createBufferSource();
            fireSrc.buffer = this._noiseBuffers.brown;
            fireSrc.loop = true;

            const fireLp = ctx.createBiquadFilter();
            fireLp.type = "lowpass";
            fireLp.frequency.setValueAtTime(240, now);

            const fireGain = ctx.createGain();
            fireGain.gain.setValueAtTime(0.35, now);

            fireSrc.connect(fireLp);
            fireLp.connect(fireGain);
            fireGain.connect(gen.masterGain);
            fireSrc.start(now);
            gen.nodes.push(fireSrc, fireLp, fireGain);
        }

        // 2. Crepitaciones orgánicas de leña
        const scheduleCrackle = () => {
            if (!gen.alive || this._activeGen !== gen) return;
            if (this._noiseBuffers.pink) {
                const t = ctx.currentTime;
                const bursts = 1 + Math.floor(Math.random() * 3);
                for (let b = 0; b < bursts; b++) {
                    const offset = b * (0.03 + Math.random() * 0.08);
                    const src = ctx.createBufferSource();
                    src.buffer = this._noiseBuffers.pink;
                    const bp = ctx.createBiquadFilter();
                    bp.type = "bandpass";
                    bp.frequency.setValueAtTime(1400 + Math.random() * 2200, t + offset);
                    bp.Q.setValueAtTime(3.0, t + offset);

                    const eg = ctx.createGain();
                    const dur = 0.012 + Math.random() * 0.022;
                    eg.gain.setValueAtTime(0.0001, t + offset);
                    eg.gain.linearRampToValueAtTime(0.18 + Math.random() * 0.16, t + offset + 0.003);
                    eg.gain.exponentialRampToValueAtTime(0.0001, t + offset + dur);

                    src.connect(bp);
                    bp.connect(eg);
                    eg.connect(gen.masterGain);
                    src.start(t + offset, Math.random() * 2.5, dur + 0.01);
                    gen.nodes.push(src, bp, eg);
                }
            }
            gen.timers.push(setTimeout(scheduleCrackle, 180 + Math.random() * 650));
        };
        gen.timers.push(setTimeout(scheduleCrackle, 150));

        // 3. Quintas cálidas de Laúd / Arpa Celta de Posada (D Mixolydian)
        const luteScale = [146.83, 220.00, 293.66, 329.63, 369.99, 440.00, 493.88, 587.33];
        const scheduleLute = () => {
            if (!gen.alive || this._activeGen !== gen) return;
            const t = ctx.currentTime;
            const f = luteScale[Math.floor(Math.random() * luteScale.length)];
            const osc = ctx.createOscillator();
            const lp = ctx.createBiquadFilter();
            const g = ctx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(f, t);
            lp.type = "lowpass";
            lp.frequency.setValueAtTime(1400, t);
            lp.frequency.exponentialRampToValueAtTime(320, t + 2.4);

            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(0.11, t + 0.018);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);

            osc.connect(lp);
            lp.connect(g);
            g.connect(gen.masterGain);
            osc.start(t);
            osc.stop(t + 2.7);
            gen.nodes.push(osc, lp, g);

            gen.timers.push(setTimeout(scheduleLute, 1800 + Math.random() * 3200));
        };
        gen.timers.push(setTimeout(scheduleLute, 800));
    }

    // -------------------------------------------------------------------------
    // BIOMA 3: TRONO HELADO DE RASGANORTE (Ventisca Estéreo + Coro Glacial)
    // -------------------------------------------------------------------------
    _buildFrozenThroneBiome(gen) {
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // 1. Ventisca estereofónica barrida por LFOs en cuadratura
        if (this._noiseBuffers.pink) {
            [-0.65, 0.65].forEach((panVal, idx) => {
                const windSrc = ctx.createBufferSource();
                windSrc.buffer = this._noiseBuffers.pink;
                windSrc.loop = true;

                const bp = ctx.createBiquadFilter();
                bp.type = "bandpass";
                bp.frequency.setValueAtTime(idx === 0 ? 380 : 540, now);
                bp.Q.setValueAtTime(4.8, now);

                const lfo = ctx.createOscillator();
                const lfoG = ctx.createGain();
                lfo.frequency.setValueAtTime(idx === 0 ? 0.07 : 0.11, now);
                lfoG.gain.setValueAtTime(220, now);
                lfo.connect(lfoG);
                lfoG.connect(bp.frequency);

                const wg = ctx.createGain();
                wg.gain.setValueAtTime(0.28, now);

                windSrc.connect(bp);
                bp.connect(wg);
                if (ctx.createStereoPanner) {
                    const panner = ctx.createStereoPanner();
                    panner.pan.setValueAtTime(panVal, now);
                    wg.connect(panner);
                    panner.connect(gen.masterGain);
                    gen.nodes.push(panner);
                } else {
                    wg.connect(gen.masterGain);
                }

                windSrc.start(now, idx * 1.5);
                lfo.start(now);
                gen.nodes.push(windSrc, bp, lfo, lfoG, wg);
            });
        }

        // 2. Pad Catedralicio en Re Menor (D2, A2, D3, F3, A3)
        const choirFilter = ctx.createBiquadFilter();
        choirFilter.type = "lowpass";
        choirFilter.frequency.setValueAtTime(340, now);
        choirFilter.connect(gen.masterGain);
        gen.nodes.push(choirFilter);

        [
            { f: 73.42, t: "sine", v: 0.25 },
            { f: 146.83, t: "triangle", v: 0.14 },
            { f: 174.61, t: "sine", v: 0.09 },
            { f: 220.00, t: "triangle", v: 0.08 }
        ].forEach(c => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = c.t;
            osc.frequency.setValueAtTime(c.f, now);
            osc.detune.setValueAtTime((Math.random() - 0.5) * 10, now);
            g.gain.setValueAtTime(c.v, now);
            osc.connect(g);
            g.connect(choirFilter);
            osc.start(now);
            gen.nodes.push(osc, g);
        });
    }

    // -------------------------------------------------------------------------
    // CAPA OPCIONAL DE HOGUERA MEZCLABLE (OFF POR DEFECTO)
    // -------------------------------------------------------------------------
    setHearthOverlay(enabled) {
        this.hearthOverlayEnabled = Boolean(enabled);
        if (!this.hearthOverlayEnabled) {
            if (this._hearthTimer) {
                clearTimeout(this._hearthTimer);
                this._hearthTimer = null;
            }
            if (this._hearthNodes) {
                try { this._hearthNodes.src.stop(); } catch (_) {}
                try { this._hearthNodes.gain.disconnect(); } catch (_) {}
                this._hearthNodes = null;
            }
            return;
        }

        if (!this._ensureContext() || this._hearthNodes) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const master = ctx.createGain();
        master.gain.setValueAtTime((this.userVolumePct / 100) * 0.22, now);
        master.connect(this.analyser);

        const src = ctx.createBufferSource();
        src.buffer = this._noiseBuffers.brown;
        src.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(210, now);
        src.connect(lp);
        lp.connect(master);
        src.start(now);

        this._hearthNodes = { src, lp, gain: master };

        const loopCrackle = () => {
            if (!this.hearthOverlayEnabled || !this._hearthNodes || !this._noiseBuffers.pink) return;
            const t = ctx.currentTime;
            const cSrc = ctx.createBufferSource();
            cSrc.buffer = this._noiseBuffers.pink;
            const bp = ctx.createBiquadFilter();
            bp.type = "bandpass";
            bp.frequency.setValueAtTime(1600 + Math.random() * 1800, t);
            const cg = ctx.createGain();
            cg.gain.setValueAtTime(0.0001, t);
            cg.gain.linearRampToValueAtTime(0.14, t + 0.003);
            cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
            cSrc.connect(bp);
            bp.connect(cg);
            cg.connect(master);
            cSrc.start(t, Math.random() * 2.0, 0.025);
            this._hearthTimer = setTimeout(loopCrackle, 240 + Math.random() * 750);
        };
        this._hearthTimer = setTimeout(loopCrackle, 200);
    }
}

// Instancia global + Proxy compatible con js/particles.js (sin enganchar listener duplicado a #ambientAudioBtn)
document.addEventListener("DOMContentLoaded", () => {
    const biomeSynth = new ProceduralBiomeSynth();
    window.jainaBiomeSynth = biomeSynth;

    // Contrato estricto para js/particles.js (pulso armónico de escarcha con cualquier fuente activa)
    window.jainaAmbientAudio = {
        synth: biomeSynth,
        get isPlaying() {
            const engineActive = Boolean(window.jainaJukebox && window.jainaJukebox.isPlaying);
            return engineActive || biomeSynth.isPlaying || biomeSynth.hearthOverlayEnabled;
        },
        play: (b) => biomeSynth.play(b),
        stop: () => biomeSynth.stopImmediate(),
        toggle: () => biomeSynth.toggle(),
        setVolume: (v) => biomeSynth.setVolume(v)
    };
});
