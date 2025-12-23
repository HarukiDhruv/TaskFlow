import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ImagePlus, Square, Circle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Habit } from '@/types';
import { cn } from '@/lib/utils';

interface AddItemModalProps {
  type: 'task' | 'habit';
  onAddTask: (title: string, emoji?: string, customIcon?: string, iconShape?: 'square' | 'circle', dueDate?: string) => void;
  onAddHabit: (title: string, emoji: string, color: Habit['color'], customIcon?: string, iconShape?: 'square' | 'circle') => void;
  onClose: () => void;
  defaultDate?: Date;
}

const EMOJIS = ['💼', '📚', '💪', '🏃', '🧘', '💧', '🎯', '✍️', '🎨', '🎵', '🌱', '☕'];
const COLORS: { value: Habit['color']; class: string }[] = [
  { value: 'blue', class: 'bg-habit-blue' },
  { value: 'green', class: 'bg-habit-green' },
  { value: 'purple', class: 'bg-habit-purple' },
  { value: 'orange', class: 'bg-habit-orange' },
  { value: 'pink', class: 'bg-habit-pink' },
];

export function AddItemModal({ type, onAddTask, onAddHabit, onClose, defaultDate }: AddItemModalProps) {
  const [title, setTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💼');
  const [selectedColor, setSelectedColor] = useState<Habit['color']>('blue');
  const [currentType, setCurrentType] = useState(type);
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [iconShape, setIconShape] = useState<'square' | 'circle'>('circle');
  const [dueDate, setDueDate] = useState<Date | undefined>(defaultDate || new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (currentType === 'task') {
      const dueDateStr = dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined;
      onAddTask(title.trim(), customIcon ? undefined : selectedEmoji, customIcon || undefined, customIcon ? iconShape : undefined, dueDateStr);
    } else {
      onAddHabit(title.trim(), customIcon ? '' : selectedEmoji, selectedColor, customIcon || undefined, customIcon ? iconShape : undefined);
    }
    onClose();
  };

  const compressImage = (file: File, maxSize: number = 100): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = maxSize;
          canvas.width = size;
          canvas.height = size;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Calculate crop to make it square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          
          // Compress to JPEG with quality 0.7
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressed);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 100);
        setCustomIcon(compressed);
      } catch (error) {
        console.error('Failed to compress image:', error);
      }
    }
  };

  const clearCustomIcon = () => {
    setCustomIcon(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-lg bg-card rounded-t-3xl md:rounded-3xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            Add {currentType === 'task' ? 'Task' : 'Habit'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Type Toggle */}
        <div className="flex rounded-full bg-secondary p-1 mb-6">
          <button
            onClick={() => setCurrentType('task')}
            className={cn(
              "flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all",
              currentType === 'task'
                ? "bg-card shadow-card text-foreground"
                : "text-muted-foreground"
            )}
          >
            Task
          </button>
          <button
            onClick={() => setCurrentType('habit')}
            className={cn(
              "flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all",
              currentType === 'habit'
                ? "bg-card shadow-card text-foreground"
                : "text-muted-foreground"
            )}
          >
            Habit
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            placeholder={currentType === 'task' ? "What do you need to do?" : "What habit do you want to build?"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 rounded-xl text-base"
            autoFocus
          />

          {/* Due Date Picker (Tasks only) */}
          {currentType === 'task' && (
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">Due Date</label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 rounded-xl justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "EEEE, MMMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Icon Section */}
          <div>
            <label className="text-sm font-medium mb-2 block text-muted-foreground">Icon</label>
            
            {/* Custom Icon Upload */}
            <div className="flex items-center gap-3 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="icon-upload"
              />
              
              {customIcon ? (
                <div className="flex items-center gap-3">
                  <div 
                    className={cn(
                      "w-14 h-14 overflow-hidden border-2 border-primary bg-secondary flex items-center justify-center",
                      iconShape === 'circle' ? 'rounded-full' : 'rounded-xl'
                    )}
                  >
                    <img 
                      src={customIcon} 
                      alt="Custom icon" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Shape Toggle */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIconShape('square')}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        iconShape === 'square'
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "bg-secondary hover:bg-secondary/80"
                      )}
                    >
                      <Square className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconShape('circle')}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        iconShape === 'circle'
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "bg-secondary hover:bg-secondary/80"
                      )}
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={clearCustomIcon}
                    className="text-muted-foreground"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label 
                  htmlFor="icon-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 cursor-pointer transition-all"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload from Gallery</span>
                </label>
              )}
            </div>

            {/* Emoji Picker - only show if no custom icon */}
            {!customIcon && (
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                      selectedEmoji === emoji
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Picker (Habits only) */}
          {currentType === 'habit' && (
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">Color</label>
              <div className="flex gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all",
                      color.class,
                      selectedColor === color.value
                        ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110"
                        : "opacity-70 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!title.trim()}
            className="w-full h-12 rounded-xl text-base font-medium"
          >
            Add {currentType === 'task' ? 'Task' : 'Habit'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
