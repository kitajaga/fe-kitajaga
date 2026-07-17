"use client";

import { useState, useEffect } from "react";
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
import { fetchCaregiverProfile, fetchBookings, getUser, updateCaregiverStatus, updateCaregiverLocation, getToken, acceptBooking } from "@/lib/api";
import { io } from "socket.io-client";

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
  const [profile, setProfile] = useState<any>(null); //belum ada api profile
  const [activeBooking, setActiveBooking] = useState<any>(null); //belum ada api profile
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<any>(null);
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  // ── Role Guard ──
  useEffect(() => {
    const user = getUser();
    if (!user || !user.token) {
      router.replace("/auth/caregiver/login");
      return;
    }
    if (user.role !== "caregiver") {
      // User (keluarga) mencoba akses halaman caregiver
      router.replace("/dashboard");
      return;
    }
  }, [router]);

  // ── Data Loading ──
  const loadData = async () => {
    try {
      const [profileData, bookingsData] = await Promise.all([
        fetchCaregiverProfile().catch(() => null),
        fetchBookings().catch(() => [])
      ]);
      
      if (profileData) {
        setProfile(profileData);
      }
      
      if (bookingsData && bookingsData.length > 0) {
        // Find the first booking that is active
        const active = bookingsData.find((b: any) => 
          b.status === "pending_matching" ||
          b.status === "matched" || 
          b.status === "in_progress" || 
          b.status === "heading_to_patient" ||
          b.status === "picked_up_patient" ||
          b.status === "heading_to_facility" ||
          b.status === "arrived_registration" ||
          b.status === "waiting_in_queue" ||
          b.status === "in_consultation" ||
          b.status === "heading_back"
        );
        setActiveBooking(active || bookingsData[0]);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // ── WebSocket for New Booking Offers & Status Updates ──
    const token = getToken();
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "https://be-kitajaga-production.up.railway.app";
    const socket = io(socketUrl, { auth: { token } });

    socket.on("connect", () => {
      console.log("Caregiver dashboard connected to socket");
    });

    socket.on("new_booking_offer", (data: any) => {
      console.log("New booking offer:", data);
      setIncomingOffer(data);
      loadData();
    });

    socket.on("booking_status_updated", (data: any) => {
      console.log("Booking status updated:", data);
      loadData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAcceptIncomingOffer = async () => {
    if (!incomingOffer?.bookingId) return;
    setAcceptingOffer(true);
    try {
      await acceptBooking(incomingOffer.bookingId);
      alert("Pesanan berhasil diterima!");
      setIncomingOffer(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menerima pesanan.");
    } finally {
      setAcceptingOffer(false);
    }
  };

  // ── Online Status & Location ──
  useEffect(() => {
    if (profile) {
      setIsOnline(profile.availabilityStatus === "online");
    }
  }, [profile]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isOnline) {
      // Update location immediately and then every 30 seconds
      const sendLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              updateCaregiverLocation(pos.coords.latitude, pos.coords.longitude)
                .catch(err => console.error("Failed to update location:", err));
            },
            (err) => {
              console.warn("Geolocation error, using fallback location:", err);
              // Fallback for local testing if location is denied or HTTP
              updateCaregiverLocation(-6.200000, 106.816666).catch(() => {});
            }
          );
        } else {
          console.warn("Geolocation not supported, using fallback location");
          updateCaregiverLocation(-6.200000, 106.816666).catch(() => {});
        }
      };
      
      sendLocation();
      intervalId = setInterval(sendLocation, 30000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline]);

  const handleToggleStatus = async () => {
    if (statusLoading) return;
    setStatusLoading(true);
    try {
      const newStatus = isOnline ? "offline" : "online";
      await updateCaregiverStatus(newStatus);
      setIsOnline(!isOnline);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Gagal memperbarui status. Pastikan koneksi stabil.");
    } finally {
      setStatusLoading(false);
    }
  };

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
              <h1 className={styles.greetingName}>{loading ? "Memuat..." : (profile?.name || "Suster")}</h1>
              
              <div className={styles.toggleContainer}>
                <button 
                  className={`${styles.toggleSwitch} ${isOnline ? styles.active : ""}`}
                  onClick={handleToggleStatus}
                  disabled={statusLoading}
                  aria-label="Toggle Online Status"
                >
                  <span className={styles.toggleThumb} />
                </button>
                <span className={`${styles.toggleLabel} ${isOnline ? styles.online : ""}`}>
                  {statusLoading ? "Memproses..." : (isOnline ? "Online" : "Offline")}
                </span>
              </div>
            </div>
          </div>
          <button className={styles.notifButton} aria-label="Notifikasi" id="home-notif-btn">
            <FontAwesomeIcon icon={faBell} />
            <span className={styles.notifBadge} />
          </button>
        </header>

        {/* ── Incoming Booking Offer Notification ── */}
        {incomingOffer && (
          <section className={styles.section} style={{ marginBottom: "1rem" }}>
            <div style={{
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: "white",
              padding: "16px",
              borderRadius: "16px",
              boxShadow: "0 10px 20px rgba(37,99,235,0.2)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>🔔 Pesanan Baru Masuk!</span>
                <button onClick={() => setIncomingOffer(null)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "16px" }}>✕</button>
              </div>
              <p style={{ margin: "4px 0", fontSize: "15px", fontWeight: 600 }}>Pasien: {incomingOffer.patientName || "Pasien"}</p>
              <p style={{ margin: "4px 0 12px 0", fontSize: "13px", opacity: 0.9 }}>Tujuan: {incomingOffer.facilityName || "Fasilitas Kesehatan"}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  onClick={handleAcceptIncomingOffer}
                  disabled={acceptingOffer}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "white",
                    color: "#2563EB",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {acceptingOffer ? "Memproses..." : "Terima Pesanan"}
                </button>
                <button 
                  onClick={() => router.push(`/caregiver/schedule/${incomingOffer.bookingId}`)}
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Detail
                </button>
              </div>
            </div>
          </section>
        )}

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
          
          {loading ? (
             <div className={styles.bookingCard} style={{ opacity: 0.5 }}>Memuat...</div>
          ) : activeBooking ? (
            <div className={styles.bookingCard}>
              <div className={styles.bookingTop}>
                <div className={styles.bookingAvatar}>
                  <FontAwesomeIcon icon={faUserCircle} />
                </div>
                <div className={styles.bookingInfo}>
                  <span className={styles.bookingName}>{activeBooking.patient?.name || "Pasien"}</span>
                  <span className={styles.bookingDetail}>
                    {activeBooking.facility?.name || activeBooking.facilityName || "Fasilitas"} · {new Date(activeBooking.scheduledAt || Date.now()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className={styles.bookingStatus}>
                    <FontAwesomeIcon icon={faCircleCheck} /> {activeBooking.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div className={styles.bookingActions}>
                <button className={styles.chatButton} onClick={() => router.push(`/caregiver/schedule/${activeBooking.id}/chat`)} id="home-chat-btn">
                  <FontAwesomeIcon icon={faComment} /> Chat
                </button>
                <button className={styles.detailButton} onClick={() => router.push(`/caregiver/schedule/${activeBooking.id}`)} id="home-detail-btn">
                  Detail <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.bookingCard} style={{ opacity: 0.5 }}>
              Belum ada pesanan aktif.
            </div>
          )}
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
