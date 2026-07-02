// audio.js — tiny synthesized SFX/music engine using the WebAudio API.
// No external assets required, keeps the project self-contained for GitHub Pages.

const Audio2 = (() => {
  let ctx = null;
  let musicNodes = [];
  let musicTimer = null;
  let enabled = true;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ freq = 440, duration = 0.15, type = 'sine', gain = 0.15, glideTo = null, delay = 0 }) {
    if (!enabled) return;
    const c = ensureCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    const t0 = c.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  return {
    unlock() { ensureCtx(); },
    setEnabled(v) { enabled = v; },

    jump() {
      tone({ freq: 300, glideTo: 620, duration: 0.16, type: 'triangle', gain: 0.12 });
    },
    land() {
      tone({ freq: 180, glideTo: 90, duration: 0.08, type: 'sine', gain: 0.08 });
    },
    coffee() {
      tone({ freq: 520, glideTo: 880, duration: 0.12, type: 'sine', gain: 0.14 });
      tone({ freq: 780, duration: 0.1, type: 'sine', gain: 0.1, delay: 0.06 });
    },
    cigarette() {
      tone({ freq: 220, glideTo: 260, duration: 0.15, type: 'sawtooth', gain: 0.08 });
    },
    hit() {
      tone({ freq: 160, glideTo: 60, duration: 0.25, type: 'sawtooth', gain: 0.16 });
    },
    stomp() {
      tone({ freq: 400, glideTo: 120, duration: 0.14, type: 'square', gain: 0.13 });
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, duration: 0.22, type: 'triangle', gain: 0.13, delay: i * 0.12 }));
    },
    lose() {
      [400, 340, 260, 180].forEach((f, i) => tone({ freq: f, duration: 0.3, type: 'sawtooth', gain: 0.12, delay: i * 0.14 }));
    },

    startMusic() {
      if (!enabled || musicTimer) return;
      const c = ensureCtx();
      const notes = [392, 440, 523, 587, 523, 440]; // gentle office elevator-music loop
      let i = 0;
      musicTimer = setInterval(() => {
        if (!enabled) return;
        tone({ freq: notes[i % notes.length], duration: 0.5, type: 'sine', gain: 0.035 });
        i++;
      }, 480);
    },
    stopMusic() {
      if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    }
  };
})();
