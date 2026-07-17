"use client";

import { useEffect, useState } from "react";
import styles from "./SplashScreen.module.css";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "progress" | "exit">("enter");

  useEffect(() => {
    // Phase 1: Logo enters (0–600ms)
    const t1 = setTimeout(() => setPhase("progress"), 600);
    // Phase 2: Progress fills (600–2100ms), then exit
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    // Phase 3: Unmount after exit animation
    const t3 = setTimeout(() => onComplete(), 2850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`${styles.splash} ${phase === "exit" ? styles.exit : ""}`}>
      {/* Animated background blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      {/* Grid overlay */}
      <div className={styles.grid} />

      <div className={styles.content}>
        {/* Logo mark */}
        <div className={`${styles.logoWrap} ${phase !== "enter" ? styles.logoIn : ""}`}>
          <div className={styles.logoRing}>
            <div className={styles.logoInner}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Heart + shield icon */}
                <path
                  d="M20 34s-14-8.4-14-18C6 9.6 10.6 5 16 5c2.2 0 4.2.8 5.8 2.1C22.6 8.4 21 10.8 20 12c-1-1.2-2.6-3.6-1.8-4.9C16.6 5.8 14.6 5 12 5 7.6 5 4 8.6 4 13c0 9.4 16 18 16 18z"
                  fill="white"
                  opacity="0.3"
                />
                <path
                  d="M20 34C20 34 6 25.6 6 16c0-4.4 3.6-8 8-8 2.2 0 4.2.8 5.8 2.1A7.8 7.8 0 0126 8c4.4 0 8 3.6 8 8 0 9.6-14 18-14 18z"
                  fill="white"
                />
                <path
                  d="M20 12l2.5 5.5H28l-4.5 3.5L25 26l-5-3.5L15 26l1.5-5L12 17.5h5.5L20 12z"
                  fill="#A5CE00"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div className={`${styles.brandWrap} ${phase !== "enter" ? styles.brandIn : ""}`}>
          <h1 className={styles.brandName}>
            <span className={styles.brandKita}>Kita</span>
            <span className={styles.brandJaga}>jaga</span>
          </h1>
          <p className={styles.tagline}>Caregiver Terpercaya, Kapan Saja</p>
        </div>

        {/* Progress bar */}
        <div className={`${styles.progressWrap} ${phase !== "enter" ? styles.progressIn : ""}`}>
          <div className={styles.progressTrack}>
            <div className={`${styles.progressFill} ${phase === "progress" || phase === "exit" ? styles.progressAnimate : ""}`} />
          </div>
          <span className={styles.loadingText}>Memuat aplikasi...</span>
        </div>
      </div>

      {/* Bottom badge */}
      <div className={`${styles.bottomBadge} ${phase !== "enter" ? styles.badgeIn : ""}`}>
        <span>Melayani dengan hati 💙</span>
      </div>
    </div>
  );
}
