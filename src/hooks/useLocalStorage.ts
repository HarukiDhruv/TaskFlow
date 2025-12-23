import { useState, useEffect, useCallback } from 'react';
import { Task, Habit, HabitCompletion } from '@/types';
import { format, subDays, isToday, parseISO } from 'date-fns';

const TASKS_KEY = 'taskflow_tasks';
const HABITS_KEY = 'taskflow_habits';

export function useLocalStorage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(TASKS_KEY);
      const storedHabits = localStorage.getItem(HABITS_KEY);
      
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      
      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits);
        // Clean up any oversized custom icons that might cause quota issues
        const cleanedHabits = parsedHabits.map((h: Habit) => ({
          ...h,
          customIcon: h.customIcon && h.customIcon.length > 15000 ? undefined : h.customIcon
        }));
        setHabits(cleanedHabits);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(TASKS_KEY);
      localStorage.removeItem(HABITS_KEY);
    }
    
    setLoading(false);
  }, []);

  // Save tasks with error handling
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error);
      }
    }
  }, [tasks, loading]);

  // Save habits with error handling
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      } catch (error) {
        console.error('Failed to save habits to localStorage:', error);
        // If quota exceeded, try to clear old large icons
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          const reducedHabits = habits.map(h => ({
            ...h,
            customIcon: h.customIcon && h.customIcon.length > 10000 ? undefined : h.customIcon
          }));
          try {
            localStorage.setItem(HABITS_KEY, JSON.stringify(reducedHabits));
          } catch {
            console.error('Still failed after reducing icons');
          }
        }
      }
    }
  }, [habits, loading]);

  // Task operations
  const addTask = useCallback((title: string, emoji?: string, customIcon?: string, iconShape?: 'square' | 'circle', dueDate?: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      emoji,
      customIcon,
      iconShape,
      dueDate,
      completed: false,
      position: tasks.length,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [tasks.length]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const reorderTasks = useCallback((reorderedTasks: Task[]) => {
    setTasks(reorderedTasks.map((task, index) => ({ ...task, position: index })));
  }, []);

  // Habit operations
  const addHabit = useCallback((title: string, emoji: string, color: Habit['color'], customIcon?: string, iconShape?: 'square' | 'circle') => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title,
      emoji,
      customIcon,
      iconShape,
      color,
      streak: 0,
      completions: [],
      position: habits.length,
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, [habits.length]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(habit =>
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  }, []);

  const toggleHabitToday = useCallback((id: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;
      
      const existingIndex = habit.completions.findIndex(c => c.date === today);
      let newCompletions: HabitCompletion[];
      
      if (existingIndex >= 0) {
        // Toggle existing
        newCompletions = habit.completions.map((c, i) =>
          i === existingIndex ? { ...c, completed: !c.completed } : c
        );
      } else {
        // Add new completion
        newCompletions = [...habit.completions, { date: today, completed: true }];
      }
      
      // Calculate streak
      let streak = 0;
      const sortedCompletions = [...newCompletions]
        .filter(c => c.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      for (let i = 0; i < 365; i++) {
        const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const found = sortedCompletions.find(c => c.date === checkDate);
        if (found) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      
      return { ...habit, completions: newCompletions, streak };
    }));
  }, []);

  const reorderHabits = useCallback((reorderedHabits: Habit[]) => {
    setHabits(reorderedHabits.map((habit, index) => ({ ...habit, position: index })));
  }, []);

  const isHabitCompletedToday = useCallback((habit: Habit) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return habit.completions.some(c => c.date === today && c.completed);
  }, []);

  // Stats
  const incompleteTasks = tasks.filter(t => !t.completed).length;
  const laterTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) > new Date()).length;

  return {
    tasks,
    habits,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitToday,
    reorderHabits,
    isHabitCompletedToday,
    incompleteTasks,
    laterTasks,
  };
}
