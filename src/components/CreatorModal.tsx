import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatorModal({ isOpen, onClose }: CreatorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="relative w-full max-w-sm bg-card rounded-3xl p-8 shadow-xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center text-center pt-4">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="w-24 h-24 rounded-full bg-muted overflow-hidden ring-2 ring-border/50 mb-6"
                >
                  <div className="w-full h-full flex items-center justify-center text-3xl font-light text-muted-foreground">
                    DH
                  </div>
                </motion.div>

                {/* Name */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="text-xl font-medium tracking-tight mb-3"
                >
                  <span className="font-normal">Dhruba</span>{' '}
                  <span className="text-muted-foreground font-light italic">(harukidhruv)</span>
                </motion.h2>

                {/* Bio */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-[280px]"
                >
                  Focused on the essentials: performance, accessibility, and precision. I build lightweight digital solutions that strip away the noise to let the user’s journey take center stage
                </motion.p>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <a
                    href="https://www.linkedin.com/in/dhrubajyoti-hazarika-81399827a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://x.com/codeWdhruv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    X
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
