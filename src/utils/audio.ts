// Audio utilities for Japanese pronunciation and interactive sound effects

class SoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play simple synth tones
  public playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted or failed
    }
  }

  // Success stroke sound (ascending pleasant chime)
  public playStrokeSuccess() {
    this.playTone(523.25, 0.15, 'sine', 0.12); // C5
  }

  public playSuccessChime() {
    this.playStrokeSuccess();
  }

  // Character completed chime (happy triad)
  public playCompleteChime() {
    this.playTone(523.25, 0.12, 'sine', 0.15); // C5
    setTimeout(() => this.playTone(659.25, 0.12, 'sine', 0.15), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.25, 'sine', 0.18), 200); // G5
  }

  // Master fanfare
  public playMasterFanfare() {
    this.playTone(523.25, 0.1, 'triangle', 0.18);
    setTimeout(() => this.playTone(659.25, 0.1, 'triangle', 0.18), 90);
    setTimeout(() => this.playTone(783.99, 0.12, 'triangle', 0.2), 180);
    setTimeout(() => this.playTone(1046.5, 0.35, 'triangle', 0.25), 270);
  }

  // Error buzzer / wrong stroke
  public playError() {
    this.playTone(196, 0.22, 'sawtooth', 0.2); // G3
  }

  public playErrorBuzz() {
    this.playError();
  }

  // Japanese Pronunciation
  public speakKana(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playTone(440, 0.3, 'sine');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      // Try finding Japanese voice
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      this.playTone(480, 0.3, 'sine');
    }
  }
}

export const sounds = new SoundManager();
