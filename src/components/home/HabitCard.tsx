import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Flame, Trash2, GripVertical } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Habit } from '@/types';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onToggleToday: (id: string) => void;
  onDelete: (id: string) => void;
  isCompletedToday: boolean;
  index: number;
}

const colorClasses = {
  blue: 'bg-habit-blue',
  green: 'bg-habit-green',
  purple: 'bg-habit-purple',
  orange: 'bg-habit-orange',
  pink: 'bg-habit-pink',
};

const glowClasses = {
  blue: 'glow-blue',
  green: 'glow-green',
  purple: 'glow-purple',
  orange: 'glow-orange',
  pink: 'glow-pink',
};

export function HabitCard({ habit, onToggleToday, onDelete, isCompletedToday, index }: HabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Generate last 14 days grid (2 rows of 7)
  const progressGrid = useMemo(() => {
    const days: { date: string; completed: boolean }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const completion = habit.completions.find(c => c.date === date);
      days.push({ date, completed: completion?.completed ?? false });
    }
    return days;
  }, [habit.completions]);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-card rounded-2xl p-4 transition-shadow group",
        glowClasses[habit.color],
        isDragging && "opacity-90"
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="touch-none opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>
          
          {habit.customIcon ? (
            <div 
              className={cn(
                "w-8 h-8 overflow-hidden flex-shrink-0",
                habit.iconShape === 'circle' ? 'rounded-full' : 'rounded-lg'
              )}
            >
              <img 
                src={habit.customIcon} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <span className="text-2xl">{habit.emoji}</span>
          )}
          <span className="font-semibold text-lg">{habit.title}</span>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-medium">{habit.streak}</span>
        </div>
      </div>

      {/* Content Row */}
      <div className="flex items-end justify-between">
        {/* Check Button */}
        <button
          onClick={() => onToggleToday(habit.id)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isCompletedToday
              ? colorClasses[habit.color]
              : "border-2 border-muted-foreground/30 hover:border-primary"
          )}
        >
          {isCompletedToday && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="animate-check-pop"
            >
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {/* Progress Grid */}
        <div className="grid grid-cols-7 gap-1">
          {progressGrid.map((day, i) => (
            <div
              key={day.date}
              className={cn(
                "habit-grid-cell",
                day.completed ? colorClasses[habit.color] : "empty"
              )}
              title={day.date}
            />
          ))}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(habit.id)}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </motion.div>
  );
}
