import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface SplashScreenProps {
  onComplete: () => void;
  isReady: boolean;
}

const SplashScreen = ({ onComplete, isReady }: SplashScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  // Heartbeat pulse animation
  useEffect(() => {
    if (!logoRef.current) return;

    const heartbeatTl = gsap.timeline({ repeat: -1 });
    
    heartbeatTl
      .to(logoRef.current, {
        scale: 1.15,
        duration: 0.12,
        ease: 'power2.out',
      })
      .to(logoRef.current, {
        scale: 1,
        duration: 0.1,
        ease: 'power2.in',
      })
      .to(logoRef.current, {
        scale: 1.08,
        duration: 0.1,
        ease: 'power2.out',
      })
      .to(logoRef.current, {
        scale: 1,
        duration: 0.15,
        ease: 'power2.in',
      })
      .to(logoRef.current, {
        duration: 0.6,
      });

    return () => {
      heartbeatTl.kill();
    };
  }, []);

  // Loading dots animation
  useEffect(() => {
    if (!dotsRef.current) return;

    const dots = dotsRef.current.querySelectorAll('.loading-dot');
    
    const dotsTl = gsap.timeline({ repeat: -1 });
    
    dots.forEach((dot, i) => {
      dotsTl.to(dot, {
        y: -6,
        duration: 0.25,
        ease: 'power2.out',
      }, i * 0.12)
      .to(dot, {
        y: 0,
        duration: 0.25,
        ease: 'power2.in',
      }, i * 0.12 + 0.25);
    });

    return () => {
      dotsTl.kill();
    };
  }, []);

  // Exit animation when ready
  useEffect(() => {
    if (!isReady || isExiting) return;

    setIsExiting(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 50);
      }
    });

    tl.to(logoRef.current, {
      scale: 1.1,
      duration: 0.2,
      ease: 'power2.out',
    })
    .to([logoRef.current, textRef.current, dotsRef.current], {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      stagger: 0.05,
    })
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.out',
    }, '-=0.1');
  }, [isReady, isExiting, onComplete]);

  // Initial entrance animation
  useEffect(() => {
    if (!logoRef.current || !textRef.current || !dotsRef.current) return;

    gsap.set([logoRef.current, textRef.current, dotsRef.current], {
      opacity: 0,
      y: 20,
    });

    const tl = gsap.timeline();

    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
    })
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power3.out',
    }, '-=0.2')
    .to(dotsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: 'power3.out',
    }, '-=0.1');
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
    >
      <div
        ref={logoRef}
        className="relative mb-8 flex items-center justify-center"
      >
        <div className="w-16 h-16 rounded-2xl border-2 border-foreground flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <div ref={textRef} className="text-center mb-10">
        <h1 className="text-xl font-medium text-foreground tracking-wide">
          TaskFlow
        </h1>
      </div>

      <div ref={dotsRef} className="flex items-center gap-2">
        <div className="loading-dot w-1.5 h-1.5 rounded-full bg-foreground" />
        <div className="loading-dot w-1.5 h-1.5 rounded-full bg-foreground" />
        <div className="loading-dot w-1.5 h-1.5 rounded-full bg-foreground" />
      </div>
    </div>
  );
};

export default SplashScreen;
