"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
import { getUser } from "@/lib/api";

export default function SplashScreen() {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2800);

    const redirectTimer = setTimeout(() => {
      // Check if user already logged in → redirect accordingly
      const user = getUser();
      if (user && user.token) {
        if (user.role === "caregiver") {
          router.push("/caregiver");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Check if onboarding is complete
        const onboardingDone = localStorage.getItem("onboarding_complete");
        if (onboardingDone) {
          router.push("/role-pick");
        } else {
          router.push("/onboarding");
        }
      }
    }, 3300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main
      id="splash-screen"
      className={`${styles.splashContainer} ${isFadingOut ? styles.fadeOut : ""}`}
    >
      {/* Decorative dots */}
      <div className={styles.decorDots} aria-hidden="true">
        <span className={styles.decorDot} />
        <span className={styles.decorDot} />
        <span className={styles.decorDot} />
      </div>

      {/* Logo & Brand */}
      <div className={styles.logoWrapper}>
        <Image
          src="/icons/kitajaga-logo.png"
          alt="Kitajaga Logo"
          width={120}
          height={120}
          className={styles.logo}
          priority
        />
        <h1 className={styles.brandName}>Kitajaga</h1>
        <p className={styles.tagline}>
          Pendampingan lansia terpercaya, kapan saja di mana saja
        </p>
      </div>

      {/* Loading indicator */}
      <div className={styles.loadingSection} aria-label="Memuat aplikasi">
        <div className={styles.loadingBar}>
          <div className={styles.loadingBarInner} />
          <div className={styles.loadingProgress} />
        </div>
        <span className={styles.loadingText}>Memuat</span>
      </div>
    </main>
  );
}
