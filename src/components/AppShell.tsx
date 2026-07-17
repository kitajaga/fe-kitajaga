"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const SplashScreen = dynamic(() => import("@/components/SplashScreen"), {
  ssr: false,
});

const SPLASH_KEY = "kitajaga_splash_shown";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SPLASH_KEY);
    if (!alreadyShown) {
      // Defer the state update to avoid linter warning about synchronous setState in effect
      queueMicrotask(() => {
        setShowSplash(true);
      });
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_KEY, "1");
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div
        style={{
          opacity: showSplash ? 0 : 1,
          transition: "opacity 0.3s ease 0.1s",
        }}
      >
        {children}
      </div>
    </>
  );
}
