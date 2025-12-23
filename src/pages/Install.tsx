import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl border-2 border-foreground flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">Install TaskFlow</h1>
        <p className="text-muted-foreground mb-8">
          Add TaskFlow to your home screen for the best experience
        </p>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Already installed!</span>
            </div>
            <Button onClick={() => navigate('/')} className="w-full h-12 rounded-xl">
              Open App
            </Button>
          </div>
        ) : isIOS ? (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 text-left space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Install on iOS
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium shrink-0">1</span>
                  <span>Tap the <Share className="w-4 h-4 inline mx-1" /> Share button in Safari</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium shrink-0">2</span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium shrink-0">3</span>
                  <span>Tap "Add" to install</span>
                </li>
              </ol>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full h-12 rounded-xl">
              Continue in Browser
            </Button>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <Button onClick={handleInstall} className="w-full h-12 rounded-xl">
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full h-12 rounded-xl">
              Continue in Browser
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Open this page in Chrome or Safari to install
            </p>
            <Button onClick={() => navigate('/')} className="w-full h-12 rounded-xl">
              Continue to App
            </Button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">📱</div>
            <p className="text-xs text-muted-foreground mt-1">Works offline</p>
          </div>
          <div>
            <div className="text-2xl font-bold">⚡</div>
            <p className="text-xs text-muted-foreground mt-1">Fast & smooth</p>
          </div>
          <div>
            <div className="text-2xl font-bold">🔒</div>
            <p className="text-xs text-muted-foreground mt-1">Private & secure</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
