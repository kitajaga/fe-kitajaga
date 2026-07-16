"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faClock,
  faHouse,
  faCalendarDays,
  faComments,
  faUserCircle,
  faClockRotateLeft,
  faLocationDot,
  faSpinner,
  faXmark,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./schedule.module.css";
import { fetchBookings } from "@/lib/api";

// ── Types ──
interface Booking {
  id: string;
  status: string;
  bookingType: "immediate" | "scheduled";
  scheduledAt: string | null;
  patient?: { id: string; name: string };
  facility?: { name: string; address: string };
  facilityName?: string;
  facilityAddress?: string;
  createdAt: string;
}

// ── Helpers ──
const STATUS_LABEL: Record<string, string> = {
  pending_matching: "Mencari Caregiver",
  matched: "Terjadwal",
  paid: "Pembayaran Diterima",
  scheduled: "Menunggu Jadwal",
  in_progress: "Sedang Berjalan",
  completed: "Selesai",
  reported: "Laporan Terkirim",
  rescheduling: "Dijadwalkan Ulang",
  reschedule_failed: "Gagal Dijadwalkan Ulang",
  payment_failed: "Pembayaran Gagal",
};

type FilterTab = "all" | "active" | "completed" | "other";

const ACTIVE_STATUSES = ["matched", "paid", "scheduled", "in_progress"];
const COMPLETED_STATUSES = ["completed", "reported"];

function getFilteredBookings(bookings: Booking[], tab: FilterTab): Booking[] {
  switch (tab) {
    case "active":
      return bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
    case "completed":
      return bookings.filter((b) => COMPLETED_STATUSES.includes(b.status));
    case "other":
      return bookings.filter(
        (b) => !ACTIVE_STATUSES.includes(b.status) && !COMPLETED_STATUSES.includes(b.status)
      );
    default:
      return bookings;
  }
}

function getStatusIcon(status: string) {
  if (ACTIVE_STATUSES.includes(status)) return faLocationDot;
  if (COMPLETED_STATUSES.includes(status)) return faCircleCheck;
  if (status === "pending_matching" || status === "rescheduling") return faSpinner;
  if (status.includes("failed")) return faXmark;
  return faClock;
}

function getStatusClass(status: string, styles: Record<string, string>): string {
  if (ACTIVE_STATUSES.includes(status)) return styles.statusActive;
  if (COMPLETED_STATUSES.includes(status)) return styles.statusCompleted;
  if (status.includes("failed")) return styles.statusFailed;
  return styles.statusPending;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ──
export default function CaregiverSchedulePage() {
  const router = useRouter();
  const [tab, setTab] = useState<FilterTab>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBookings();
        setBookings(data || []);
      } catch (err) {
        setError("Gagal memuat riwayat tugas. Coba lagi nanti.");
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = getFilteredBookings(bookings, tab);

  const tabItems: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: bookings.length },
    { key: "active", label: "Aktif", count: getFilteredBookings(bookings, "active").length },
    { key: "completed", label: "Selesai", count: getFilteredBookings(bookings, "completed").length },
    { key: "other", label: "Lainnya", count: getFilteredBookings(bookings, "other").length },
  ];

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <FontAwesomeIcon icon={faClockRotateLeft} />
          </div>
          <h1 className={styles.title}>Riwayat Tugas</h1>
        </header>

        {/* Filter Tabs */}
        <div className={styles.tabsBar}>
          {tabItems.map((t) => (
            <button
              key={t.key}
              className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`${styles.tabBadge} ${tab === t.key ? styles.tabBadgeActive : ""}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.listSection}>
          {loading ? (
            <div className={styles.stateWrapper}>
              <FontAwesomeIcon icon={faSpinner} spin className={styles.stateIcon} />
              <p className={styles.stateText}>Memuat riwayat tugas...</p>
            </div>
          ) : error ? (
            <div className={styles.stateWrapper}>
              <p className={styles.stateTextError}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.stateWrapper}>
              <FontAwesomeIcon icon={faClockRotateLeft} className={styles.stateIconEmpty} />
              <p className={styles.stateText}>
                {tab === "active"
                  ? "Tidak ada tugas aktif saat ini."
                  : tab === "completed"
                  ? "Belum ada tugas yang selesai."
                  : "Belum ada data tugas."}
              </p>
            </div>
          ) : (
            <div className={styles.bookingList}>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.bookingCard} ${ACTIVE_STATUSES.includes(item.status) ? styles.bookingCardActive : ""}`}
                  onClick={() => router.push(`/caregiver/schedule/${item.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/caregiver/schedule/${item.id}`)}
                >
                  {/* Status bar on left */}
                  <div className={`${styles.statusBar} ${getStatusClass(item.status, styles)}`} />

                  <div className={styles.cardBody}>
                    {/* Top row */}
                    <div className={styles.cardTop}>
                      <span className={styles.patientName}>
                        {item.patient?.name || "Pasien"}
                      </span>
                      <span className={`${styles.statusChip} ${getStatusClass(item.status, styles)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(item.status)} />
                        {STATUS_LABEL[item.status] || item.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Facility */}
                    <p className={styles.facilityName}>
                      {item.facility?.name || item.facilityName || "—"}
                    </p>
                    <p className={styles.facilityAddress}>
                      {item.facility?.address || item.facilityAddress || ""}
                    </p>

                    {/* Bottom row */}
                    <div className={styles.cardBottom}>
                      <span className={styles.dateText}>
                        <FontAwesomeIcon icon={faCalendarDays} />
                        {formatDate(item.scheduledAt || item.createdAt)}
                      </span>
                      <span className={styles.bookingType}>
                        {item.bookingType === "immediate" ? "Segera" : "Terjadwal"}
                      </span>
                      <FontAwesomeIcon icon={faChevronRight} className={styles.arrowIcon} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
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
