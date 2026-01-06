
import { SoundType } from '../types';
import { AUDIO_ASSETS } from '../constants';

class AudioService {
  private bgAudio: HTMLAudioElement | null = null;
  private isInitialized = false;

  // Browser requirement: Audio must be initialized via user gesture
  init() {
    if (this.isInitialized) return;
    try {
      // Use a tiny base64 silent wav to "prime" the audio engine
      const silent = new Audio();
      silent.src = 'data:audio/wav;base64,UklGRigAAABXQVZFAmZtdCAQAAAAAQABAIAAAIAAAIABAABhZGF0YSAAAACAgICAgIA=';
      silent.play().catch(() => {});
      this.isInitialized = true;
      console.log("Audio service initialized via user gesture");
    } catch (e) {
      console.warn("Audio initialization failed", e);
    }
  }

  private createAudio(url: string): HTMLAudioElement {
    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    return audio;
  }

  async playEffect(type: SoundType) {
    if (type === SoundType.NONE) return;
    const url = AUDIO_ASSETS[type];
    if (!url) return;

    try {
      const audio = this.createAudio(url);
      audio.volume = 0.8;
      await audio.play();
    } catch (e) {
      console.warn(`Effect ${type} failed:`, e);
    }
  }

  async playBackground(type: SoundType) {
    await this.stopBackground();
    if (type === SoundType.NONE) return;
    const url = AUDIO_ASSETS[type];
    if (!url) return;

    try {
      this.bgAudio = this.createAudio(url);
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.3;
      await this.bgAudio.play();
    } catch (e) {
      console.warn("Background audio play failed:", e);
    }
  }

  stopBackground() {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.src = "";
      this.bgAudio = null;
    }
  }

  pauseBackground() {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  async resumeBackground() {
    if (this.bgAudio && this.bgAudio.paused) {
      try {
        await this.bgAudio.play();
      } catch (e) {
        console.warn("Background audio resume failed:", e);
      }
    }
  }
}

export const audioService = new AudioService();
