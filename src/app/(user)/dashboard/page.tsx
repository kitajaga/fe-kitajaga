"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons/faUserCircle";
import { faBell } from "@fortawesome/free-solid-svg-icons/faBell";
import { faBolt } from "@fortawesome/free-solid-svg-icons/faBolt";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons/faCalendarPlus";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons/faLocationDot";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";
import { faUserInjured } from "@fortawesome/free-solid-svg-icons/faUserInjured";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import {
  BOOKING_STATUS_LABELS,
} from "@/lib/mockData";
import { useApi } from "@/hooks/useApi";
import { fetchProfile, fetchBookings, fetchPatients, fetchCaregivers } from "@/lib/api";
import type { BookingStatus } from "@/lib/mockData";
import styles from "./dashboard.module.css";

function getStatusStyle(status: BookingStatus) {
  switch (status) {
    case "in_progress":
    case "matched":
    case "paid":
    case "scheduled":
      return styles.statusActive;
    case "completed":
    case "reported":
      return styles.statusCompleted;
    default:
      return styles.statusPending;
  }
}

function getStatusIcon(status: BookingStatus) {
  switch (status) {
    case "in_progress":
      return faLocationDot;
    case "completed":
    case "reported":
      return faCircleCheck;
    case "pending_matching":
    case "rescheduling":
      return faSpinner;
    default:
      return faCalendarDays;
  }
}

export default function UserDashboardPage() {
  const router = useRouter();

  const { data: user, loading: loadingUser } = useApi(fetchProfile);
  const { data: bookings, loading: loadingBookings } = useApi(fetchBookings);
  const { data: patients, loading: loadingPatients } = useApi(fetchPatients);
  const { data: caregivers, loading: loadingCaregivers } = useApi(fetchCaregivers);

  const isLoading = loadingUser || loadingBookings || loadingPatients || loadingCaregivers;

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--color-primary)" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  const activeBookings = (bookings || []).filter(
    (b) => !["completed", "reported", "reschedule_failed"].includes(b.status)
  );

  return (
    <>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
          <div className={styles.greeting}>
            <span className={styles.greetingLabel}>Selamat datang</span>
            <h1 className={styles.greetingName}>{user?.name || "Pengguna"}</h1>
          </div>
        </div>
        <button className={styles.notifButton} aria-label="Notifikasi" id="dashboard-notif-btn">
          <FontAwesomeIcon icon={faBell} />
          <span className={styles.notifBadge} />
        </button>
      </header>

      {/* ── Quick Actions ── */}
      <div className={styles.quickActions}>
        <button
          className={`${styles.quickAction} ${styles.quickActionPrimary}`}
          onClick={() => router.push("/bookings/new?type=immediate")}
          id="dashboard-immediate-btn"
        >
          <div className={styles.quickActionIcon}>
            <FontAwesomeIcon icon={faBolt} />
          </div>
          <span className={styles.quickActionLabel}>Pesan Sekarang</span>
        </button>
        <button
          className={`${styles.quickAction} ${styles.quickActionSecondary}`}
          onClick={() => router.push("/bookings/new?type=scheduled")}
          id="dashboard-scheduled-btn"
        >
          <div className={styles.quickActionIcon}>
            <FontAwesomeIcon icon={faCalendarPlus} />
          </div>
          <span className={styles.quickActionLabel}>Jadwalkan Layanan</span>
        </button>
      </div>

      {/* ── Promotional Banners ── */}
      <section className={styles.bannerSection}>
        <div className={`${styles.bannerCard} ${styles.bannerCard1}`}>
          <h3 className={styles.bannerTitle}>Diskon Khusus 20%</h3>
          <p className={styles.bannerSubtitle}>Untuk pemesanan layanan pendampingan lansia pertama Anda.</p>
        </div>
        <div className={`${styles.bannerCard} ${styles.bannerCard2}`}>
          <h3 className={styles.bannerTitle}>Peduli Orang Tua</h3>
          <p className={styles.bannerSubtitle}>Berikan kasih sayang terbaik di masa tua mereka bersama caregiver profesional.</p>
        </div>
        <div className={`${styles.bannerCard} ${styles.bannerCard3}`}>
          <h3 className={styles.bannerTitle}>Layanan 24/7</h3>
          <p className={styles.bannerSubtitle}>Kami selalu siap mendampingi orang tua Anda kapan pun dibutuhkan.</p>
        </div>
      </section>

      {/* ── Active Bookings ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Booking Aktif</h2>
          <button className={styles.seeAllButton} onClick={() => router.push("/activity")} id="dashboard-see-all-booking">
            Lihat Semua <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        {activeBookings.length > 0 ? (
          activeBookings.map((booking) => {
            const patient = (patients || []).find((p) => p.id === booking.patientId);
            const caregiver = booking.caregiverId
              ? (caregivers || []).find((c) => c.id === booking.caregiverId)
              : null;

            return (
              <div
                key={booking.id}
                className={styles.bookingCard}
                onClick={() => router.push(`/bookings/${booking.id}`)}
              >
                <div className={styles.bookingCardTop}>
                  <div className={styles.bookingCardAvatar}>
                    <FontAwesomeIcon icon={faUserInjured} />
                  </div>
                  <div className={styles.bookingCardInfo}>
                    <span className={styles.bookingCardName}>{patient?.name ?? "Pasien"}</span>
                    <span className={styles.bookingCardDetail}>
                      {booking.facilityName} · {booking.bookingType === "immediate" ? "Sekarang" : new Date(booking.scheduledAt!).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                    <span className={`${styles.bookingCardStatus} ${getStatusStyle(booking.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                </div>
                {booking.status === "in_progress" && caregiver && (
                  <div className={styles.bookingCardActions}>
                    <button
                      className={styles.trackButton}
                      onClick={(e) => { e.stopPropagation(); router.push(`/bookings/${booking.id}`); }}
                      id={`dashboard-track-${booking.id}`}
                    >
                      <FontAwesomeIcon icon={faLocationDot} /> Lacak
                    </button>
                    <button
                      className={styles.detailButton}
                      onClick={(e) => { e.stopPropagation(); router.push(`/bookings/${booking.id}`); }}
                      id={`dashboard-detail-${booking.id}`}
                    >
                      Detail <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>
            <p className={styles.emptyText}>Belum ada booking aktif.<br />Pesan caregiver sekarang!</p>
          </div>
        )}
      </section>

      {/* ── Patient List ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pasien Anda</h2>
          <button className={styles.seeAllButton} onClick={() => router.push("/patients")} id="dashboard-see-all-patients">
            Lihat Semua <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <div className={styles.patientList}>
          {(patients || []).map((patient) => (
            <button
              key={patient.id}
              className={styles.patientItem}
              onClick={() => router.push(`/patients/${patient.id}`)}
              id={`dashboard-patient-${patient.id}`}
            >
              <div className={styles.patientItemIcon}>
                <FontAwesomeIcon icon={faUserInjured} />
              </div>
              <div className={styles.patientItemText}>
                <span className={styles.patientItemName}>{patient.name}</span>
                <span className={styles.patientItemSub}>{patient.address}</span>
              </div>
              <FontAwesomeIcon icon={faChevronRight} className={styles.patientItemArrow} />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
