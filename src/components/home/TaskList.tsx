import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
}

export function TaskList({ tasks, onToggle, onDelete, onReorder }: TaskListProps) {
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
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      onReorder(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Incomplete tasks first
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.position - b.position;
  });

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-muted-foreground">No tasks yet. Add one to get started!</p>
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
        <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sortedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </motion.div>
  );
}
