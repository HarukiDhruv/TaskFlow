import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { format, isSameDay, parseISO } from 'date-fns';
import { Plus, User } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TabType } from '@/types';
import { TaskList } from '@/components/home/TaskList';
import { HabitList } from '@/components/home/HabitList';
import { AddItemModal } from '@/components/home/AddItemModal';
import { DateStrip } from '@/components/home/DateStrip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CreatorModal } from '@/components/CreatorModal';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

export default function Index() {
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const storage = useLocalStorage();
  const indicatorRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const dayAbbrev = format(today, 'EEE');
  const monthDay = format(today, 'MMMM d');
  const year = format(today, 'yyyy');

  // GSAP animation for tab indicator
  useEffect(() => {
    if (indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        x: activeTab === 'tasks' ? 0 : '100%',
        duration: 0.4,
        ease: 'power3.out',
      });
    }
  }, [activeTab]);

  // Swipe gesture handler
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if ((offset < -swipeThreshold || velocity < -500) && activeTab === 'tasks') {
        setActiveTab('habits');
      }
      else if ((offset > swipeThreshold || velocity > 500) && activeTab === 'habits') {
        setActiveTab('tasks');
      }
    },
    [activeTab]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Added safe-area-top class for PWA notch/status bar padding */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24 safe-area-top">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-1">
            <h1 className="text-4xl font-bold tracking-tight">{dayAbbrev}</h1>
            <div className="w-2 h-2 rounded-full bg-destructive mt-1 shadow-[0_0_8px_2px_hsl(var(--destructive)/0.5)] animate-pulse-slow" />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-lg font-medium">{monthDay}</p>
              <p className="text-sm text-muted-foreground">{year}</p>
            </div>
            <ThemeToggle />
            <button
              onClick={() => setShowCreatorModal(true)}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              aria-label="About creator"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </motion.header>

        {/* Date Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <DateStrip 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
        </motion.div>

        {/* iOS-style Glassy Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative flex rounded-2xl glass-tab p-1 mb-6 overflow-hidden"
        >
          {/* GSAP animated sliding indicator */}
          <div
            ref={indicatorRef}
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-card shadow-glass"
          >
            {/* Gloss effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-xl" />
            </div>
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            className={cn(
              "relative z-10 flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-colors duration-200",
              activeTab === 'tasks'
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={cn(
              "relative z-10 flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-colors duration-200",
              activeTab === 'habits'
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            Habits
          </button>
        </motion.div>

        {/* Swipeable Content Area */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="touch-pan-y cursor-grab active:cursor-grabbing"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'tasks' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'tasks' ? 20 : -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {activeTab === 'tasks' ? (
                <TaskList
                  tasks={storage.tasks.filter(task => {
                    if (!task.dueDate) {
                      // Tasks without due date show on today only
                      return isSameDay(selectedDate, new Date());
                    }
                    return isSameDay(parseISO(task.dueDate), selectedDate);
                  })}
                  onToggle={storage.toggleTask}
                  onDelete={storage.deleteTask}
                  onReorder={storage.reorderTasks}
                />
              ) : (
                <HabitList
                  habits={storage.habits}
                  onToggleToday={storage.toggleHabitToday}
                  onDelete={storage.deleteHabit}
                  onReorder={storage.reorderHabits}
                  isCompletedToday={storage.isHabitCompletedToday}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* FAB - Updated with safe area bottom for iPhone home indicator */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fixed right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddItemModal
            type={activeTab === 'tasks' ? 'task' : 'habit'}
            onAddTask={storage.addTask}
            onAddHabit={storage.addHabit}
            onClose={() => setShowAddModal(false)}
            defaultDate={selectedDate}
          />
        )}
      </AnimatePresence>

      {/* Creator Modal */}
      <CreatorModal 
        isOpen={showCreatorModal} 
        onClose={() => setShowCreatorModal(false)} 
      />
    </div>
  );
}
