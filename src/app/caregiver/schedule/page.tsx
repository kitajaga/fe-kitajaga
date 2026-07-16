"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck, faClock, faHouse, faCalendarDays, faComments, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./schedule.module.css";

import { fetchBookings } from "@/lib/api";

export default function CaregiverSchedulePage() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(5);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchBookings();
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push("/caregiver")}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className={styles.title}>schedule</h1>
        </header>

        {/* Calendar Section */}
        <div className={styles.calendarSection}>
          <p className={styles.dateText}>May 5, 2026</p>
          <h2 className={styles.todayText}>Today</h2>
          
          <div className={styles.daysScroll}>
            {[4, 5, 6, 7, 8, 9].map((day, idx) => (
              <div 
                key={day} 
                className={`${styles.dayCard} ${selectedDay === day ? styles.dayCardActive : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                <span className={styles.dayName}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}
                </span>
                <span className={styles.dayNumber}>{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        <div className={styles.scheduleList}>
          <div className={styles.timelineLine} />
          
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>Memuat jadwal...</div>
          ) : bookings.map((item) => {
            const isOngoing = item.status === "in_progress" || item.status === "matched" || item.status.includes("heading") || item.status.includes("patient") || item.status.includes("registration") || item.status.includes("consultation") || item.status.includes("queue");
            return (
              <div key={item.id} className={styles.scheduleItemWrapper} onClick={() => router.push(`/caregiver/schedule/${item.id}`)}>
                <div className={styles.timelineDot} />
                <div className={`${styles.scheduleCard} ${isOngoing ? styles.scheduleCardOngoing : ""}`}>
                  <div className={styles.cardTop}>
                    <span className={styles.patientName}>{item.patient?.name || "Pasien"}</span>
                    <span className={styles.timeText}>{new Date(item.scheduledAt || Date.now()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className={styles.facilityName}>{item.facility?.name || item.facilityName || "Fasilitas"}</div>
                  <div className={styles.statusText}>
                    <FontAwesomeIcon icon={isOngoing ? faCircleCheck : faClock} className={styles.statusIcon} />
                    {item.status.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className={styles.scheduleItemWrapper}>
            <div className={styles.timelineDotEmpty} />
            <div className={styles.emptyCard}>
              <div className={styles.emptyLine} />
              <div className={styles.emptyLineShort} />
            </div>
          </div>
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
