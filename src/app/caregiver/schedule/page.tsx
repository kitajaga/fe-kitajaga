"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck, faClock, faHouse, faCalendarDays, faComments, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./schedule.module.css";

const MOCK_SCHEDULES = [
  {
    id: "booking-uuid-1",
    name: "Budi Santoso",
    facility: "RSCM Jakarta",
    time: "06.00 - 12.00",
    status: "Sedang berlangsung",
    type: "ongoing"
  },
  {
    id: "booking-uuid-2",
    name: "Hendri Pratama",
    facility: "RSCM Jakarta",
    time: "13.00 - 19.00",
    status: "Upcoming",
    type: "upcoming"
  }
];

export default function CaregiverSchedulePage() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(5);

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
          
          {MOCK_SCHEDULES.map((item) => (
            <div key={item.id} className={styles.scheduleItemWrapper} onClick={() => router.push(`/caregiver/schedule/${item.id}`)}>
              <div className={styles.timelineDot} />
              <div className={`${styles.scheduleCard} ${item.type === "ongoing" ? styles.scheduleCardOngoing : ""}`}>
                <div className={styles.cardTop}>
                  <span className={styles.patientName}>{item.name}</span>
                  <span className={styles.timeText}>{item.time}</span>
                </div>
                <div className={styles.facilityName}>{item.facility}</div>
                <div className={styles.statusText}>
                  <FontAwesomeIcon icon={item.type === "ongoing" ? faCircleCheck : faClock} className={styles.statusIcon} />
                  {item.status}
                </div>
              </div>
            </div>
          ))}
          
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
