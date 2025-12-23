export interface Task {
  id: string;
  title: string;
  completed: boolean;
  emoji?: string;
  customIcon?: string;
  iconShape?: 'square' | 'circle';
  dueDate?: string;
  position: number;
  createdAt: string;
}

export interface HabitCompletion {
  date: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  customIcon?: string;
  iconShape?: 'square' | 'circle';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  streak: number;
  completions: HabitCompletion[];
  position: number;
  createdAt: string;
}

export type TabType = 'tasks' | 'habits';
