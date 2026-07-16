"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { faRocket } from "@fortawesome/free-solid-svg-icons/faRocket";
import styles from "./onboarding.module.css";

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: "/images/onboarding-1.png",
    title: "Pendampingan Lansia, Tanpa Khawatir",
    description:
      "Temukan caregiver terpercaya untuk mendampingi orang tua Anda ke rumah sakit atau kegiatan harian lainnya.",
  },
  {
    id: 2,
    image: "/images/onboarding-2.png",
    title: "Caregiver Terpercaya, Siap Kapan Saja",
    description:
      "Caregiver terverifikasi siap melayani secara on-demand maupun terjadwal, sesuai kebutuhan Anda.",
  },
  {
    id: 3,
    image: "/images/onboarding-3.png",
    title: "Transparan & Aman",
    description:
      "Pantau progress pendampingan secara realtime, chat langsung, dan pembayaran yang aman dengan sistem escrow.",
  },
];

const SWIPE_THRESHOLD = 50;

export default function OnboardingPage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const isLastSlide = activeSlide === SLIDES.length - 1;

  const goToSlide = useCallback((index: number) => {
    setActiveSlide(Math.max(0, Math.min(index, SLIDES.length - 1)));
  }, []);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      localStorage.setItem("onboarding_complete", "true");
      router.push("/role-pick");
    } else {
      setActiveSlide((prev) => prev + 1);
    }
  }, [isLastSlide, router]);

  const handleSkip = useCallback(() => {
    localStorage.setItem("onboarding_complete", "true");
    router.push("/role-pick");
  }, [router]);

  // ── Touch handlers ──
  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      startXRef.current = clientX;
      currentXRef.current = clientX;
      setIsDragging(true);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging) return;
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      currentXRef.current = clientX;
      const diff = clientX - startXRef.current;

      // Resist overscrolling at boundaries
      if (
        (activeSlide === 0 && diff > 0) ||
        (activeSlide === SLIDES.length - 1 && diff < 0)
      ) {
        setDragOffset(diff * 0.3);
      } else {
        setDragOffset(diff);
      }
    },
    [isDragging, activeSlide]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentXRef.current - startXRef.current;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff < 0 && activeSlide < SLIDES.length - 1) {
        setActiveSlide((prev) => prev + 1);
      } else if (diff > 0 && activeSlide > 0) {
        setActiveSlide((prev) => prev - 1);
      }
    }

    setDragOffset(0);
  }, [isDragging, activeSlide]);

  const trackTransform = `translateX(calc(-${activeSlide * 100}% + ${dragOffset}px))`;

  return (
    <main id="onboarding-screen" className={styles.onboardingContainer}>
      {/* Carousel */}
      <div
        className={styles.carouselWrapper}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <div
          className={`${styles.carouselTrack} ${isDragging ? styles.dragging : ""}`}
          style={{ transform: trackTransform }}
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className={styles.slide}>
              <div className={styles.slideIllustration}>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 480px) 280px, 320px"
                  priority={slide.id === 1}
                />
              </div>
              <div className={styles.slideContent}>
                <h2 className={styles.slideTitle}>{slide.title}</h2>
                <p className={styles.slideDescription}>
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controlsSection}>
        {/* Dots */}
        <div className={styles.dotsContainer} role="tablist" aria-label="Slide indicators">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              className={`${styles.dot} ${index === activeSlide ? styles.dotActive : ""}`}
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === activeSlide}
              aria-label={`Slide ${index + 1}`}
              id={`onboarding-dot-${index}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className={styles.buttonsRow}>
          <button
            className={`${styles.skipButton} ${isLastSlide ? styles.skipHidden : ""}`}
            onClick={handleSkip}
            id="onboarding-skip-btn"
          >
            Lewati
          </button>

          <button
            className={`${styles.nextButton} ${isLastSlide ? styles.ctaButton : ""}`}
            onClick={handleNext}
            id="onboarding-next-btn"
          >
            {isLastSlide ? "Mulai Sekarang" : "Selanjutnya"}
            <span className={styles.arrowIcon} aria-hidden="true">
              <FontAwesomeIcon icon={isLastSlide ? faRocket : faArrowRight} />
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
