"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons/faLocationDot";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons/faCircleXmark";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons/faClockRotateLeft";
import { BOOKING_STATUS_LABELS } from "@/lib/mockData";
import { useApi } from "@/hooks/useApi";
import { fetchBookings, fetchPatients, fetchCaregivers } from "@/lib/api";
import type { BookingStatus, MockBooking } from "@/lib/mockData";
import styles from "./activity.module.css";

type Filter = "all" | "active" | "completed" | "failed";

function getIconStyle(status: BookingStatus) {
  switch (status) {
    case "in_progress":
    case "matched":
    case "paid":
    case "scheduled":
      return styles.iconActive;
    case "completed":
    case "reported":
      return styles.iconComplete;
    case "pending_matching":
    case "rescheduling":
      return styles.iconPending;
    default:
      return styles.iconError;
  }
}

function getStatusBadge(status: BookingStatus) {
  switch (status) {
    case "in_progress":
    case "matched":
    case "paid":
    case "scheduled":
      return styles.statusActive;
    case "completed":
    case "reported":
      return styles.statusComplete;
    case "pending_matching":
    case "rescheduling":
      return styles.statusPending;
    default:
      return styles.statusError;
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
      return faCircleXmark;
  }
}

function filterBookings(bookings: MockBooking[], filter: Filter) {
  return bookings.filter((b) => {
    switch (filter) {
      case "active":
        return ["pending_matching", "matched", "paid", "scheduled", "in_progress", "rescheduling"].includes(b.status);
      case "completed":
        return ["completed", "reported"].includes(b.status);
      case "failed":
        return ["reschedule_failed", "payment_failed"].includes(b.status);
      default:
        return true;
    }
  });
}

export default function ActivityPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  
  const { data: bookingsData, loading: loadingBookings } = useApi(fetchBookings);
  const { data: patients, loading: loadingPatients } = useApi(fetchPatients);
  const { data: caregivers, loading: loadingCaregivers } = useApi(fetchCaregivers);

  const isLoading = loadingBookings || loadingPatients || loadingCaregivers;
  
  const bookings = filterBookings(bookingsData || [], filter);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--color-primary)" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={() => router.push("/dashboard")} aria-label="Kembali" id="activity-back-btn">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.pageTitle}>Riwayat Aktivitas</h1>
      </div>

      {/* ── Filter Tabs ── */}
      <div className={styles.filterTabs}>
        {([
          { key: "all", label: "Semua" },
          { key: "active", label: "Aktif" },
          { key: "completed", label: "Selesai" },
          { key: "failed", label: "Gagal" },
        ] as { key: Filter; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            className={`${styles.filterTab} ${filter === tab.key ? styles.filterTabActive : ""}`}
            onClick={() => setFilter(tab.key)}
            id={`filter-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className={styles.listContainer}>
        {bookings.length > 0 ? (
          bookings.map((booking) => {
            const patient = (patients || []).find((p) => p.id === booking.patientId);
            const caregiver = booking.caregiverId ? (caregivers || []).find((c) => c.id === booking.caregiverId) : null;

            return (
              <button
                key={booking.id}
                className={styles.activityCard}
                onClick={() => router.push(`/bookings/${booking.id}`)}
                id={`activity-${booking.id}`}
              >
                <div className={`${styles.activityIcon} ${getIconStyle(booking.status)}`}>
                  <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                </div>
                <div className={styles.activityContent}>
                  <span className={styles.activityName}>{patient?.name ?? "Pasien"}</span>
                  <span className={styles.activitySub}>
                    {booking.facilityName}{caregiver ? ` · ${caregiver.name}` : ""}
                  </span>
                  <span className={`${styles.activityStatus} ${getStatusBadge(booking.status)}`}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>
                <span className={styles.activityDate}>
                  {new Date(booking.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              </button>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FontAwesomeIcon icon={faClockRotateLeft} />
            </div>
            <span className={styles.emptyTitle}>Belum ada riwayat</span>
            <p className={styles.emptyText}>Booking yang sudah selesai atau dibatalkan akan muncul di sini.</p>
          </div>
        )}
      </div>
    </>
  );
}
