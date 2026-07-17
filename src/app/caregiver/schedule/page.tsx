"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faCircleCheck,
  faSpinner,
  faCircleXmark,
  faCalendarDays,
  faClockRotateLeft,
  faHouse,
  faComments,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { fetchBookings, getUser } from "@/lib/api";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import styles from "./schedule.module.css";

// ── Helpers ──
function getIconStyle(status: string) {
  const active = ["in_progress", "matched", "paid", "scheduled", "heading_to_patient", "picked_up_patient", "heading_to_facility", "arrived_registration", "waiting_in_queue", "in_consultation", "heading_back"];
  const complete = ["completed", "reported"];
  const pending = ["pending_matching", "rescheduling"];
  if (active.includes(status)) return styles.iconActive;
  if (complete.includes(status)) return styles.iconComplete;
  if (pending.includes(status)) return styles.iconPending;
  return styles.iconError;
}

function getStatusBadge(status: string) {
  const active = ["in_progress", "matched", "paid", "scheduled", "heading_to_patient", "picked_up_patient", "heading_to_facility", "arrived_registration", "waiting_in_queue", "in_consultation", "heading_back"];
  const complete = ["completed", "reported"];
  const pending = ["pending_matching", "rescheduling"];
  if (active.includes(status)) return styles.statusActive;
  if (complete.includes(status)) return styles.statusComplete;
  if (pending.includes(status)) return styles.statusPending;
  return styles.statusError;
}

function getStatusIcon(status: string) {
  const active = ["in_progress", "matched", "paid", "scheduled", "heading_to_patient", "picked_up_patient", "heading_to_facility", "arrived_registration", "waiting_in_queue", "in_consultation", "heading_back"];
  const complete = ["completed", "reported"];
  const pending = ["pending_matching", "rescheduling"];
  if (active.includes(status)) return faLocationDot;
  if (complete.includes(status)) return faCircleCheck;
  if (pending.includes(status)) return faSpinner;
  return faCircleXmark;
}

// ── Categorization ──
type BookingCategory = "ongoing" | "upcoming" | "completed";
function getBookingCategory(status: string): BookingCategory {
  if (["in_progress", "heading_to_patient", "picked_up_patient", "heading_to_facility", "arrived_registration", "waiting_in_queue", "in_consultation", "heading_back"].includes(status)) return "ongoing";
  if (["completed", "reported", "payment_failed", "reschedule_failed"].includes(status)) return "completed";
  return "upcoming";
}

const STATUS_LABEL: Record<string, string> = {
  pending_matching: "Mencari Caregiver",
  matched: "Terjadwal",
  paid: "Pembayaran Diterima",
  scheduled: "Menunggu Jadwal",
  in_progress: "Sedang Berjalan",
  heading_to_patient: "Menuju Pasien",
  picked_up_patient: "Jemput Pasien",
  heading_to_facility: "Menuju Faskes",
  arrived_registration: "Registrasi",
  waiting_in_queue: "Menunggu Antrean",
  in_consultation: "Konsultasi",
  heading_back: "Perjalanan Pulang",
  completed: "Selesai",
  reported: "Laporan Terkirim",
  rescheduling: "Dijadwalkan Ulang",
  reschedule_failed: "Gagal Dijadwalkan Ulang",
  payment_failed: "Pembayaran Gagal",
};

// ── Calendar ──
function generateCalendarDates() {
  const dates = [];
  const today = new Date();
  for (let i = -7; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

// ── Component ──
export default function CaregiverSchedulePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterTab, setFilterTab] = useState<BookingCategory | "all">("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Role Guard ──
  useEffect(() => {
    const user = getUser();
    if (!user || !user.token) {
      router.replace("/auth/caregiver/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBookings();
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calendarDates = useMemo(() => generateCalendarDates(), []);

  // Filter bookings by selected date AND selected tab
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b: any) => {
      // 1. Date filter
      const bDateStr = b.scheduledAt || b.createdAt;
      if (!bDateStr) return false;
      const bDate = new Date(bDateStr);
      const isDateMatch = bDate.toDateString() === selectedDate.toDateString();
      if (!isDateMatch) return false;

      // 2. Tab filter
      if (filterTab === "all") return true;
      return getBookingCategory(b.status) === filterTab;
    });
  }, [bookings, selectedDate, filterTab]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--color-primary)" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Jadwal</h1>
      </div>

      {/* ── Calendar Filter ── */}
      <div className={styles.calendarStrip}>
        <div className={styles.monthHeader}>
          <FontAwesomeIcon icon={faCalendarDays} className={styles.monthIcon} />
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </div>
        <div className={styles.datesRow}>
          {calendarDates.map((date, idx) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={idx}
                className={`${styles.dateItem} ${isSelected ? styles.dateItemSelected : ""} ${isToday && !isSelected ? styles.dateItemToday : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className={styles.dateDayName}>{WEEKDAYS[date.getDay()]}</span>
                <span className={styles.dateDayNumber}>{date.getDate()}</span>
                {isToday && <span className={styles.todayDot} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className={styles.filterTabs}>
        {([
          { key: "all", label: "Semua" },
          { key: "ongoing", label: "Berlangsung" },
          { key: "upcoming", label: "Akan Datang" },
          { key: "completed", label: "Selesai" },
        ] as { key: BookingCategory | "all"; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            className={`${styles.filterTab} ${filterTab === tab.key ? styles.filterTabActive : ""}`}
            onClick={() => setFilterTab(tab.key)}
            id={`cg-filter-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className={styles.listContainer}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking: any) => (
            <button
              key={booking.id}
              className={styles.activityCard}
              onClick={() => router.push(`/caregiver/schedule/${booking.id}`)}
              id={`cg-booking-${booking.id}`}
            >
              <div className={`${styles.activityIcon} ${getIconStyle(booking.status)}`}>
                <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
              </div>
              <div className={styles.activityContent}>
                <span className={styles.activityName}>{booking.patient?.name ?? "Pasien"}</span>
                <span className={styles.activitySub}>
                  {booking.facility?.name || booking.facilityName || "Fasilitas"}
                </span>
                <span className={`${styles.activityStatus} ${getStatusBadge(booking.status)}`}>
                  {STATUS_LABEL[booking.status] || BOOKING_STATUS_LABELS[booking.status] || booking.status.replace(/_/g, " ")}
                </span>
              </div>
              <span className={styles.activityDate}>
                {new Date(booking.scheduledAt || booking.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </button>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FontAwesomeIcon icon={faClockRotateLeft} />
            </div>
            <span className={styles.emptyTitle}>Tidak ada jadwal</span>
            <p className={styles.emptyText}>Belum ada tugas untuk tanggal dan filter ini.</p>
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav className={styles.bottomNav}>
        <button className={styles.navItem} onClick={() => router.push("/caregiver")}>
          <FontAwesomeIcon icon={faHouse} className={styles.navIcon} />
          <span className={styles.navLabel}>Home</span>
        </button>
        <button className={`${styles.navItem} ${styles.navItemActive}`}>
          <FontAwesomeIcon icon={faCalendarDays} className={styles.navIcon} />
          <span className={styles.navLabel}>Jadwal</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push("/caregiver/chat")}>
          <FontAwesomeIcon icon={faComments} className={styles.navIcon} />
          <span className={styles.navLabel}>Chat</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push("/caregiver/profile")}>
          <FontAwesomeIcon icon={faUserCircle} className={styles.navIcon} />
          <span className={styles.navLabel}>Profil</span>
        </button>
      </nav>
    </div>
  );
}
