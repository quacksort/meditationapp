
import { MeditationConfig, MeditationSession, Reminder } from '../types';
import { DEFAULT_CONFIGS } from '../constants';

const KEYS = {
  CONFIGS: 'zen_configs',
  SESSIONS: 'zen_sessions',
  REMINDERS: 'zen_reminders'
};

export const storage = {
  getConfigs: (): MeditationConfig[] => {
    const data = localStorage.getItem(KEYS.CONFIGS);
    return data ? JSON.parse(data) : DEFAULT_CONFIGS;
  },
  saveConfigs: (configs: MeditationConfig[]) => {
    localStorage.setItem(KEYS.CONFIGS, JSON.stringify(configs));
  },
  getSessions: (): MeditationSession[] => {
    const data = localStorage.getItem(KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },
  saveSession: (session: MeditationSession) => {
    const sessions = storage.getSessions();
    sessions.unshift(session);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions.slice(0, 100))); // Keep last 100
  },
  deleteSession: (id: string) => {
    const sessions = storage.getSessions().filter(s => s.id !== id);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },
  deleteConfig: (id: string) => {
    const configs = storage.getConfigs().filter(c => c.id !== id);
    storage.saveConfigs(configs);
  },
  getReminders: (): Reminder[] => {
    const data = localStorage.getItem(KEYS.REMINDERS);
    return data ? JSON.parse(data) : [];
  },
  saveReminders: (reminders: Reminder[]) => {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  }
};
