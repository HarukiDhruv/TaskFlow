import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Install from "./pages/Install";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/SplashScreen";
import { Onboarding } from "./components/Onboarding";

const queryClient = new QueryClient();
const ONBOARDING_KEY = 'taskflow_onboarding_complete';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    // Wait for: DOM mount + preferences check + minimum splash time
    const minSplashTime = 1500; // Minimum 1.5s for good UX
    const startTime = Date.now();

    const checkReady = () => {
      // Check if theme is applied (html has class or localStorage)
      const themeApplied = true; // Theme is handled by CSS

      // Simulate any async initialization
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minSplashTime - elapsed);

      setTimeout(() => {
        if (themeApplied) {
          setIsAppReady(true);
        }
      }, remaining);
    };

    // Start checking when component mounts
    checkReady();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AnimatePresence>
            {showSplash && (
              <SplashScreen 
                onComplete={handleSplashComplete} 
                isReady={isAppReady} 
              />
            )}
            {showOnboarding && (
              <Onboarding onComplete={handleOnboardingComplete} />
            )}
          </AnimatePresence>
          <div style={{ visibility: showSplash || showOnboarding ? 'hidden' : 'visible' }}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/install" element={<Install />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
