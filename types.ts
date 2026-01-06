
export enum SoundType {
  BELL = 'bell',
  SINGING_BOWL = 'singing-bowl',
  GONG = 'gong',
  CHIME = 'chime',
  NATURE = 'nature',
  RAIN = 'rain',
  WHITE_NOISE = 'white-noise',
  NONE = 'none'
}

export interface MeditationConfig {
  id: string;
  name: string;
  totalDuration: number; // in seconds
  intervalDuration: number; // in seconds
  prepDuration: number; // countdown before start, in seconds
  startSound: SoundType;
  intervalSound: SoundType;
  finishSound: SoundType;
  backgroundSound: SoundType;
  reminders: Reminder[];
}

export interface Reminder {
  id: string;
  time: string; // HH:mm
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  configId: string; // The routine to trigger
}

export interface MeditationSession {
  id: string;
  configId: string;
  configName: string;
  date: string;
  durationCompleted: number;
  totalDurationGoal: number;
  completed: boolean;
}

export type View = 'dashboard' | 'timer' | 'history' | 'edit-config' | 'reminders';
