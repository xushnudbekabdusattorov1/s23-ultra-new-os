export type TabType = 'focus' | 'spen' | 'zen' | 'device';

export type TaskCategory = 'ish' | 'shaxsiy' | 'fikr' | 'maqsad';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: TaskCategory;
  createdAt: number;
}

export type PenType = 'fountain' | 'highlighter' | 'pencil' | 'eraser';

export interface DrawingStroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  type: PenType;
}

export type Language = 'uz' | 'en' | 'ru';

export type WallpaperStyle = 'mineral' | 'cream' | 'oled' | 'botanic';

export type AmbientSound = 'none' | 'rain' | 'binaural' | 'forest';

export interface SavedNote {
  id: string;
  title: string;
  imageData: string;
  date: string;
}
