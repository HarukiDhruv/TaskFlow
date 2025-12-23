import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2, GripVertical } from 'lucide-react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function TaskCard({ task, onToggle, onDelete, index }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-card rounded-2xl p-4 shadow-card transition-shadow group",
        isDragging && "shadow-card-hover opacity-90"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="touch-none opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
            task.completed
              ? "bg-primary border-primary"
              : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="animate-check-pop"
            >
              <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {task.customIcon ? (
              <div 
                className={cn(
                  "w-7 h-7 overflow-hidden flex-shrink-0",
                  task.iconShape === 'circle' ? 'rounded-full' : 'rounded-lg'
                )}
              >
                <img 
                  src={task.customIcon} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : task.emoji ? (
              <span className="text-lg">{task.emoji}</span>
            ) : null}
            <span
              className={cn(
                "font-medium truncate",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </span>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </motion.div>
  );
}
