"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./chat.module.css";
import { fetchBookings } from "@/lib/api";

export default function UserChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const bookings = await fetchBookings();
        const activeBookings = bookings.filter((b: any) => 
          !["pending_matching", "rescheduling", "cancelled", "completed", "reported", "payment_failed"].includes(b.status)
        );
        
        const formattedChats = activeBookings.map((b: any) => ({
          id: b.id,
          caregiverName: b.caregiver?.name || "Caregiver",
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
            onClick={() => router.push(`/chat/${chat.id}`)}
          >
            <div className={styles.avatar}>
              <FontAwesomeIcon icon={faUserCircle} />
            </div>
            
            <div className={styles.chatInfo}>
              <div className={styles.chatTop}>
                <span className={styles.caregiverName}>{chat.caregiverName}</span>
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
            <p>Belum ada pesan aktif.</p>
          </div>
        )}
      </main>
    </div>
  );
}
