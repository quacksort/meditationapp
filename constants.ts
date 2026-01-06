
import { SoundType } from './types';

export const AUDIO_ASSETS = {
  [SoundType.BELL]: '/assets/sounds/bell.mp3',
  [SoundType.SINGING_BOWL]: '/assets/sounds/singing_bowl.mp3',
  [SoundType.GONG]: '/assets/sounds/gong.mp3',
  [SoundType.CHIME]: '/assets/sounds/chime.mp3',
  [SoundType.NATURE]: '/assets/sounds/nature.mp3',
  [SoundType.RAIN]: '/assets/sounds/rain.mp3',
  [SoundType.WHITE_NOISE]: '/assets/sounds/white_noise.mp3',
  [SoundType.NONE]: ''
};

export const DEFAULT_CONFIGS = [
  {
    id: 'default-1',
    name: 'Morning Focus',
    totalDuration: 600, // 10 mins
    intervalDuration: 120, // 2 mins
    prepDuration: 10,
    startSound: SoundType.BELL,
    intervalSound: SoundType.CHIME,
    finishSound: SoundType.GONG,
    backgroundSound: SoundType.NATURE,
    reminders: []
  },
  {
    id: 'default-2',
    name: 'Quick Reset',
    totalDuration: 300,
    intervalDuration: 0,
    prepDuration: 5,
    startSound: SoundType.SINGING_BOWL,
    intervalSound: SoundType.NONE,
    finishSound: SoundType.BELL,
    backgroundSound: SoundType.WHITE_NOISE,
    reminders: []
  }
];
