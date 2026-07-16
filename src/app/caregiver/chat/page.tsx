"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCalendarDays, faComments, faUserCircle, faChevronRight, faCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./chat-list.module.css";

const MOCK_CHATS = [
  {
    id: "booking-uuid-1",
    patientName: "Budi Santoso",
    lastMessage: "Ya, saya tiba sekitar 10 menit lagi.",
    time: "20.45",
    unread: 0,
  },
  {
    id: "booking-uuid-2",
    patientName: "Keluarga Hendri Pratama",
    lastMessage: "Apakah suster bisa datang lebih awal?",
    time: "Kemarin",
    unread: 2,
  },
  {
    id: "booking-uuid-3",
    patientName: "Ibu Siti Aminah",
    lastMessage: "Terima kasih banyak atas bantuannya.",
    time: "12 Jul",
    unread: 0,
  }
];

export default function ChatListPage() {
  const router = useRouter();

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Pesan</h1>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        {MOCK_CHATS.map((chat) => (
          <div 
            key={chat.id} 
            className={styles.chatCard}
            onClick={() => router.push(`/caregiver/schedule/${chat.id}/chat`)}
          >
            <div className={styles.avatar}>
              <FontAwesomeIcon icon={faUserCircle} />
            </div>
            
            <div className={styles.chatInfo}>
              <div className={styles.chatTop}>
                <span className={styles.patientName}>{chat.patientName}</span>
                <span className={styles.chatTime}>{chat.time}</span>
              </div>
              <div className={styles.chatBottom}>
                <span className={`${styles.lastMessage} ${chat.unread > 0 ? styles.lastMessageUnread : ""}`}>
                  {chat.lastMessage}
                </span>
                {chat.unread > 0 && (
                  <span className={styles.unreadBadge}>{chat.unread}</span>
                )}
              </div>
            </div>
            
            <div className={styles.chevron}>
               <FontAwesomeIcon icon={faChevronRight} />
            </div>
          </div>
        ))}
        
        {MOCK_CHATS.length === 0 && (
          <div className={styles.emptyState}>
            <p>Belum ada pesan.</p>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className={styles.bottomNav}>
        <button className={styles.navItem} onClick={() => router.push("/caregiver")}>
          <FontAwesomeIcon icon={faHouse} className={styles.navIcon} />
          <span className={styles.navLabel}>Home</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push("/caregiver/schedule")}>
          <FontAwesomeIcon icon={faCalendarDays} className={styles.navIcon} />
          <span className={styles.navLabel}>Jadwal</span>
        </button>
        <button className={`${styles.navItem} ${styles.navItemActive}`}>
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
