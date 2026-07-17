"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCircleCheck, faSpinner, faCircleXmark, faCalendarDays, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { useApi } from "@/hooks/useApi";
import { fetchBookings, getToken, getSocketBaseUrl } from "@/lib/api";
import { io } from "socket.io-client";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import styles from "./activity.module.css";

// ── Helpers ──
function getIconStyle(status: string) {
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

function getStatusBadge(status: string) {
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

function getStatusIcon(status: string) {
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

// ── Categorization ──
type BookingCategory = "ongoing" | "upcoming" | "completed";
function getBookingCategory(status: string): BookingCategory {
  if (status === "in_progress") return "ongoing";
  if (["completed", "reported", "payment_failed", "reschedule_failed"].includes(status)) return "completed";
  return "upcoming";
}

// ── Generate Calendar Strip (7 days back, 14 days forward) ──
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

export default function SchedulePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterTab, setFilterTab] = useState<BookingCategory | "all">("all");
  
  const { data: bookingsData, loading: loadingBookings, refetch: refetchBookings } = useApi(fetchBookings);
  
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(getSocketBaseUrl(), { auth: { token } });
    const handleUpdate = () => { void refetchBookings(); };

    socket.on("booking_status_updated", handleUpdate);
    socket.on("booking_updated", handleUpdate);
    socket.on("booking_status_changed", handleUpdate);

    return () => {
      socket.disconnect();
    };
  }, [refetchBookings]);

  const calendarDates = useMemo(() => generateCalendarDates(), []);

  // Filter bookings by selected date AND selected tab
  const filteredBookings = useMemo(() => {
    if (!bookingsData) return [];
    return bookingsData.filter((b) => {
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
  }, [bookingsData, selectedDate, filterTab]);

  if (loadingBookings) {
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
            id={`filter-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className={styles.listContainer}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <button
              key={booking.id}
              className={styles.activityCard}
              onClick={() => router.push(`/bookings/${booking.id}`)}
              id={`schedule-booking-${booking.id}`}
            >
              <div className={`${styles.activityIcon} ${getIconStyle(booking.status)}`}>
                <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
              </div>
              <div className={styles.activityContent}>
                <span className={styles.activityName}>{booking.patient?.name ?? "Pasien"}</span>
                <span className={styles.activitySub}>
                  {booking.facilityName}{booking.caregiver?.name ? ` · ${booking.caregiver.name}` : ""}
                </span>
                <span className={`${styles.activityStatus} ${getStatusBadge(booking.status)}`}>
                  {BOOKING_STATUS_LABELS[booking.status]}
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
            <p className={styles.emptyText}>Belum ada booking untuk tanggal dan status ini.</p>
            <button className={styles.bookActionBtn} onClick={() => router.push("/bookings/new")}>
              Pesan Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
