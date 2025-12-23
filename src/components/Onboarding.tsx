import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: CheckCircle,
    title: "Track Your Tasks",
    description: "Organize your daily tasks with a beautiful, minimal interface. Swipe between days to plan ahead.",
    color: "text-foreground",
  },
  {
    icon: Target,
    title: "Build Habits",
    description: "Create habits and track your streaks. Small daily actions lead to big changes.",
    color: "text-foreground",
  },
  {
    icon: Sparkles,
    title: "Stay Focused",
    description: "No distractions. Just you and your goals. Works offline and syncs when you're ready.",
    color: "text-foreground",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] bg-background flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-secondary flex items-center justify-center"
            >
              <Icon className={`w-12 h-12 ${slide.color}`} />
            </motion.div>

            <h1 className="text-3xl font-bold mb-4">{slide.title}</h1>
            <p className="text-muted-foreground text-lg max-w-xs mx-auto">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-foreground'
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 pb-10 space-y-3">
        <Button
          onClick={handleNext}
          className="w-full h-14 rounded-2xl text-base font-semibold"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
        
        {currentSlide < slides.length - 1 && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full h-12 rounded-2xl text-muted-foreground"
          >
            Skip
          </Button>
        )}
      </div>
    </motion.div>
  );
}
