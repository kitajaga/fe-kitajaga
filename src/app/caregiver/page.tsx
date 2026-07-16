"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons/faHouse";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import { faComments } from "@fortawesome/free-solid-svg-icons/faComments";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons/faUserCircle";
import { faBell } from "@fortawesome/free-solid-svg-icons/faBell";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faComment } from "@fortawesome/free-solid-svg-icons/faComment";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons/faLightbulb";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";
import { faHeartPulse } from "@fortawesome/free-solid-svg-icons/faHeartPulse";
import { faShieldHeart } from "@fortawesome/free-solid-svg-icons/faShieldHeart";
import styles from "./home.module.css";

const BANNERS = [
  { id: 1, title: "Selamat Datang di Kitajaga!", subtitle: "Platform pendampingan lansia terpercaya", color: "var(--gradient-brand)" },
  { id: 2, title: "Tips Hari Ini", subtitle: "Selalu patuhi SOP saat mendampingi pasien", color: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)" },
  { id: 3, title: "Update Profil Anda", subtitle: "Lengkapi profil untuk mendapatkan lebih banyak pesanan", color: "linear-gradient(135deg, #065F46 0%, #10B981 100%)" },
];

const TIPS = [
  { id: 1, icon: faHeartPulse, title: "Perhatikan Vital Sign", desc: "Cek tekanan darah & suhu pasien secara berkala" },
  { id: 2, icon: faShieldHeart, title: "Keselamatan Utama", desc: "Pastikan pasien aman selama perjalanan" },
  { id: 3, icon: faLightbulb, title: "Komunikasi Aktif", desc: "Update keluarga secara berkala lewat chat" },
];

export default function CaregiverHomePage() {
  const router = useRouter();
  const [activeBanner, setActiveBanner] = useState(0);

  return (
    <div className={styles.pageWrapper}>
      <main id="caregiver-home" className={styles.homeContainer}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              <FontAwesomeIcon icon={faUserCircle} />
            </div>
            <div className={styles.greeting}>
              <span className={styles.greetingLabel}>Halo, Caregiver</span>
              <h1 className={styles.greetingName}>Suster Rina</h1>
            </div>
          </div>
          <button className={styles.notifButton} aria-label="Notifikasi" id="home-notif-btn">
            <FontAwesomeIcon icon={faBell} />
            <span className={styles.notifBadge} />
          </button>
        </header>

        {/* ── Banner Carousel ── */}
        <section className={styles.bannerSection} aria-label="Banner promosi">
          <div className={styles.bannerTrack} style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
            {BANNERS.map((b) => (
              <div key={b.id} className={styles.bannerSlide} style={{ background: b.color }}>
                <h2 className={styles.bannerTitle}>{b.title}</h2>
                <p className={styles.bannerSubtitle}>{b.subtitle}</p>
              </div>
            ))}
          </div>
          <div className={styles.bannerDots}>
            {BANNERS.map((b, i) => (
              <button key={b.id} className={`${styles.bannerDot} ${i === activeBanner ? styles.bannerDotActive : ""}`} onClick={() => setActiveBanner(i)} aria-label={`Banner ${i + 1}`} />
            ))}
          </div>
        </section>

        {/* ── Active Booking Card ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pesanan Aktif</h2>
            <button className={styles.seeAllButton} onClick={() => router.push("/caregiver/schedule")} id="home-see-all-btn">
              Lihat Semua <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className={styles.bookingCard}>
            <div className={styles.bookingTop}>
              <div className={styles.bookingAvatar}>
                <FontAwesomeIcon icon={faUserCircle} />
              </div>
              <div className={styles.bookingInfo}>
                <span className={styles.bookingName}>Budi Santoso</span>
                <span className={styles.bookingDetail}>RSCM Jakarta · Hari ini, 09:00</span>
                <span className={styles.bookingStatus}>
                  <FontAwesomeIcon icon={faCircleCheck} /> Terkonfirmasi
                </span>
              </div>
            </div>
            <div className={styles.bookingActions}>
              <button className={styles.chatButton} id="home-chat-btn">
                <FontAwesomeIcon icon={faComment} /> Chat
              </button>
              <button className={styles.detailButton} id="home-detail-btn">
                Detail <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Tips & Info ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tips &amp; Info</h2>
          </div>
          <div className={styles.tipsGrid}>
            {TIPS.map((tip) => (
              <div key={tip.id} className={styles.tipCard}>
                <div className={styles.tipIcon}>
                  <FontAwesomeIcon icon={tip.icon} />
                </div>
                <div className={styles.tipText}>
                  <span className={styles.tipTitle}>{tip.title}</span>
                  <span className={styles.tipDesc}>{tip.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className={styles.bottomNav} aria-label="Navigasi utama">
        <button className={`${styles.navItem} ${styles.navItemActive}`} id="nav-home">
          <FontAwesomeIcon icon={faHouse} className={styles.navIcon} />
          <span className={styles.navLabel}>Home</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push("/caregiver/schedule")} id="nav-schedule">
          <FontAwesomeIcon icon={faCalendarDays} className={styles.navIcon} />
          <span className={styles.navLabel}>Jadwal</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push("/caregiver/chat")} id="nav-chat">
          <FontAwesomeIcon icon={faComments} className={styles.navIcon} />
          <span className={styles.navLabel}>Chat</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push("/caregiver/profile")} id="nav-profile">
          <FontAwesomeIcon icon={faUserCircle} className={styles.navIcon} />
          <span className={styles.navLabel}>Profil</span>
        </button>
      </nav>
    </div>
  );
}
