import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export default function Stats() {
  const navigate = useNavigate();
  const storage = useLocalStorage();
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Calculate stats
  const completedTasks = storage.tasks.filter(t => t.completed).length;
  const totalTasks = storage.tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Habits completed today
  const habitsCompletedToday = storage.habits.filter(h => storage.isHabitCompletedToday(h)).length;
  const totalHabits = storage.habits.length;

  // Best streak
  const bestStreak = storage.habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Statistics</h1>
        </motion.header>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{completedTasks} / {totalTasks}</p>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-full bg-foreground rounded-full"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{completionRate}% completion rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Habits Today</p>
                <p className="text-2xl font-bold">{habitsCompletedToday} / {totalHabits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Streak</p>
                <p className="text-2xl font-bold">{bestStreak} days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
