import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Habit } from '@/types';
import { HabitCard } from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  onToggleToday: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (habits: Habit[]) => void;
  isCompletedToday: (habit: Habit) => boolean;
}

export function HabitList({ habits, onToggleToday, onDelete, onReorder, isCompletedToday }: HabitListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);
      onReorder(arrayMove(habits, oldIndex, newIndex));
    }
  };

  const sortedHabits = [...habits].sort((a, b) => a.position - b.position);

  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-muted-foreground">No habits yet. Build your streak!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortedHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sortedHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleToday={onToggleToday}
                onDelete={onDelete}
                isCompletedToday={isCompletedToday(habit)}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </motion.div>
  );
}
