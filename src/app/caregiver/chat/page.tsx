"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCalendarDays, faComments, faUserCircle, faChevronRight, faCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./chat-list.module.css";
import { fetchBookings } from "@/lib/api";

export default function ChatListPage() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const bookings = await fetchBookings();
        // Filter active bookings that can be chatted with
        const activeBookings = bookings.filter((b: any) => 
          b.status !== "pending" && b.status !== "cancelled" && b.status !== "completed" && b.status !== "reported"
        );
        
        const formattedChats = activeBookings.map((b: any) => ({
          id: b.id,
          patientName: b.patient?.name || "Pasien",
          lastMessage: "Mulai percakapan...",
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          unread: 0
        }));
        
        setChats(formattedChats);
      } catch (err) {
        console.error("Failed to load chats", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadChats();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Pesan</h1>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Memuat daftar chat...</div>
        ) : chats.map((chat) => (
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
        
        {!loading && chats.length === 0 && (
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
