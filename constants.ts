
import { SoundType } from './types';

export const AUDIO_ASSETS = {
  [SoundType.BELL]: 'https://cdn.pixabay.com/audio/2022/03/24/audio_730248e895.mp3',
  [SoundType.SINGING_BOWL]: 'https://cdn.pixabay.com/audio/2021/08/09/audio_8816d7c0f2.mp3',
  [SoundType.GONG]: 'https://cdn.pixabay.com/audio/2022/03/15/audio_27357c9183.mp3',
  [SoundType.CHIME]: 'https://cdn.pixabay.com/audio/2022/03/24/audio_3203306775.mp3',
  [SoundType.NATURE]: 'https://cdn.pixabay.com/audio/2022/01/18/audio_6069929d5b.mp3', 
  [SoundType.RAIN]: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c976f62b66.mp3',
  [SoundType.WHITE_NOISE]: 'https://cdn.pixabay.com/audio/2021/11/25/audio_91b32e01f9.mp3',
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
