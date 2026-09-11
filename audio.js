/**
 * Procedural Web Audio Engine for Chakaram Game
 * Clean, pleasant acoustic sound effects:
 * - Chozhi Cowrie Shell rattle & shake
 * - Crisp Stone/Wood coin hop clacks
 * - Sacred Temple Bell chime for Daayam, Captures, and Victory
 * - Defeat / Capture whoosh
 */

class TempleAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    // Crisp Stone/Wood Coin Hop Tap
    playStoneClack() {
        if (this.isMuted) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + Math.random() * 80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.06);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    // Chozhi (Cowrie Shell) Rattle
    playChozhiRattle() {
        if (this.isMuted) return;
        this.init();

        const count = 5;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (this.isMuted) return;
                const bufferSize = this.ctx.sampleRate * 0.04;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let j = 0; j < bufferSize; j++) {
                    data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 2400 + Math.random() * 800;
                filter.Q.value = 4.0;

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                noise.start();
            }, i * 45 + Math.random() * 15);
        }
    }

    // Sacred Temple Bell (Daayam, Crown, Victory)
    playTempleBell(pitch = 1.0) {
        if (this.isMuted) return;
        this.init();

        const baseFreq = 540 * pitch;
        const harmonics = [1.0, 2.0, 2.76, 5.4];
        const gains = [0.25, 0.12, 0.08, 0.04];

        harmonics.forEach((h, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq * h, this.ctx.currentTime);

            const duration = 1.4 / (idx + 1);
            gain.gain.setValueAtTime(gains[idx], this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        });
    }

    // Opponent Capture / Cut Sound
    playCaptureSound() {
        if (this.isMuted) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.23);
    }
}

window.templeAudio = new TempleAudioEngine();
