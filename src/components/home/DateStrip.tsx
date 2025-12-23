import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { addDays, format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAY_WIDTH = 48;
const VISIBLE_DAYS = 7;
const TOTAL_DAYS = 21; // 3 weeks worth of days for smooth scrolling

export function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const today = new Date();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [centerOffset, setCenterOffset] = useState(0);
  
  // Generate days centered around today + offset
  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => 
    addDays(today, i - Math.floor(TOTAL_DAYS / 2) + centerOffset)
  );

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const currentX = x.get();
    const totalWidth = DAY_WIDTH * TOTAL_DAYS;
    const threshold = DAY_WIDTH * 3;
    
    // If dragged far enough, shift the center and reset position
    if (currentX < -threshold) {
      setCenterOffset(prev => prev + 7);
      animate(x, 0, { duration: 0 });
    } else if (currentX > threshold) {
      setCenterOffset(prev => prev - 7);
      animate(x, 0, { duration: 0 });
    } else {
      // Snap back smoothly
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  return (
    <div ref={containerRef} className="overflow-hidden">
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -DAY_WIDTH * 5, right: DAY_WIDTH * 5 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="flex justify-center gap-1 cursor-grab active:cursor-grabbing"
      >
        {days.slice(Math.floor(TOTAL_DAYS / 2) - 3, Math.floor(TOTAL_DAYS / 2) + 4).map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          
          const handleSelect = () => {
            // Haptic feedback on Android (iOS Safari doesn't support Vibration API)
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
            onSelectDate(day);
          };
          
          return (
            <motion.button
              key={day.toISOString()}
              onClick={handleSelect}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex flex-col items-center py-3 px-2 rounded-2xl transition-all duration-200 min-w-[44px]",
                isSelected 
                  ? "bg-foreground text-background" 
                  : isToday
                    ? "bg-muted text-foreground"
                    : "text-foreground hover:bg-secondary"
              )}
            >
              <span className={cn(
                "text-lg font-semibold",
                isSelected ? "text-background" : "text-foreground"
              )}>
                {format(day, 'd')}
              </span>
              <span className={cn(
                "text-[10px] uppercase tracking-wider mt-0.5",
                isSelected ? "text-background/70" : "text-muted-foreground"
              )}>
                {format(day, 'EEE')}
              </span>
              {/* Today indicator - red dot when not selected */}
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
