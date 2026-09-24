import { Task, SavedNote, WallpaperStyle, Language } from '../types';

const TASKS_KEY = 'szenith_tasks_v1';
const NOTES_KEY = 'szenith_notes_v1';
const SETTINGS_KEY = 'szenith_settings_v1';

export interface AppSettings {
  wallpaper: WallpaperStyle;
  language: Language;
  soundEnabled: boolean;
  frameMode: boolean; // true = S23 Ultra device frame, false = clean fullscreen mobile
}

const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    text: 'Bugungi 3 ta muhim ustuvor vazifani belgilash',
    completed: false,
    category: 'maqsad',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 't-2',
    text: 'S-Pen bilan kundalik qisqa qayd va eskiz chizish',
    completed: true,
    category: 'fikr',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 't-3',
    text: '25 daqiqalik chuqur diqqat (Zen Pomodoro)',
    completed: false,
    category: 'ish',
    createdAt: Date.now() - 10800000,
  },
  {
    id: 't-4',
    text: '4-7-8 nafas mashqi bilan ongni tinchlantirish',
    completed: false,
    category: 'shaxsiy',
    createdAt: Date.now() - 14400000,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  wallpaper: 'oled',
  language: 'uz',
  soundEnabled: true,
  frameMode: true,
};

export const getSavedTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // quota safe
  }
};

export const getSavedNotes = (): SavedNote[] => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveNotes = (notes: SavedNote[]): void => {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // quota safe
  }
};

export const getAppSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveAppSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // safe
  }
};
