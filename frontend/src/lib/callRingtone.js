class CallRingtone {
  constructor() {
    this.ctx = null;
    this.intervalId = null;
    this.active = false;
  }

  async start() {
    if (this.active) return;
    this.active = true;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") {
      await this.ctx.resume().catch(() => {});
    }

    this.playPattern();
    this.intervalId = window.setInterval(() => this.playPattern(), 2800);
  }

  playPattern() {
    if (!this.ctx || this.ctx.state === "closed") return;

    const start = this.ctx.currentTime;
    const tones = [
      { freq: 440, at: 0 },
      { freq: 480, at: 0.25 },
      { freq: 440, at: 0.5 },
      { freq: 480, at: 0.75 },
    ];

    tones.forEach(({ freq, at }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start + at);
      gain.gain.linearRampToValueAtTime(0.18, start + at + 0.04);
      gain.gain.linearRampToValueAtTime(0, start + at + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start + at);
      osc.stop(start + at + 0.24);
    });
  }

  stop() {
    this.active = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

let ringtoneInstance = null;

export function startCallRingtone() {
  if (!ringtoneInstance) ringtoneInstance = new CallRingtone();
  ringtoneInstance.start();
}

export function stopCallRingtone() {
  ringtoneInstance?.stop();
}
