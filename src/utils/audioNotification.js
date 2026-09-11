import storage from './storage';

const SOUND_KEY = 'notification_sound_enabled';

/**
 * Web Audio API synthesizer for instant notification chimes.
 * Does not rely on external audio files or MP3 network requests.
 */
class NotificationAudioPlayer {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  isSoundEnabled() {
    return storage.get(SOUND_KEY, true);
  }

  setSoundEnabled(enabled) {
    storage.set(SOUND_KEY, !!enabled);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification_sound_toggled', { detail: { enabled: !!enabled } }));
    }
    return !!enabled;
  }

  toggleSound() {
    const current = this.isSoundEnabled();
    return this.setSoundEnabled(!current);
  }

  /**
   * Play a melodious 2-tone notification chime
   * Note 1: 587.33 Hz (D5) -> Note 2: 880 Hz (A5)
   */
  playChime(type = 'default') {
    if (!this.isSoundEnabled()) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'order') {
        // Celebratory 3-chord major arpeggio (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
      } else {
        // Standard pleasant 2-tone chime
        const freqs = [587.33, 880.00];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.0001, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.35);
        });
      }
    } catch (err) {
      console.warn('Could not play audio notification chime:', err);
    }
  }
}

export const notificationAudio = new NotificationAudioPlayer();
export default notificationAudio;
