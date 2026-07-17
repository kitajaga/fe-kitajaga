"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUserCircle, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { getBookingDetail, getToken, getUser, getSocketBaseUrl, fetchChatHistory } from "@/lib/api";
import styles from "./chat.module.css";

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  sentAt: string;
  type?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = getUser()?.id;

  useEffect(() => {
    getBookingDetail(bookingId)
      .then((data) => setBooking(data))
      .catch((err) => console.error("Failed to fetch booking for chat:", err));

    fetchChatHistory(bookingId)
      .then((history) => setMessages(history))
      .catch((err) => console.error("Failed to load chat history:", err));

    const token = getToken() || "";
    const socketUrl = getSocketBaseUrl();
    const socket = io(socketUrl, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_booking", bookingId);
    });

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("progress_update", (data: { statusLabel?: string; status?: string }) => {
      const sysMsg: Message = {
        id: `progress-${Date.now()}`,
        senderId: "system",
        senderRole: "system",
        message: `📍 Update: ${data.statusLabel || data.status}`,
        sentAt: new Date().toISOString(),
        type: "progress_update",
      };
      setMessages((prev) => [...prev, sysMsg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", { bookingId, message: inputText });
    }
    setInputText("");
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className={styles.headerInfo}>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
          <h1 className={styles.title}>Chat dengan Keluarga</h1>
        </div>
      </header>

      <main className={styles.chatArea}>
        <div className={styles.contextBanner}>
          Booking {booking?.patient?.name || "Pasien"} • {booking?.facility?.name || booking?.facilityName || "Fasilitas"}
        </div>

        <div className={styles.dateDivider}>
          <span>HARI INI</span>
        </div>

        <div className={styles.messageList}>
          {messages.length === 0 && (
            <div className={styles.systemBubble}>Belum ada pesan. Mulai percakapan dengan keluarga pasien.</div>
          )}
          {messages.map((msg) => {
            if (msg.senderRole === "system" || msg.type === "progress_update") {
              return (
                <div key={msg.id} className={styles.systemBubble}>
                  {msg.message}
                </div>
              );
            }

            const isMe = msg.senderId === currentUserId || msg.senderRole === "caregiver";
            return (
              <div key={msg.id} className={`${styles.messageWrapper} ${isMe ? styles.wrapperMe : styles.wrapperThem}`}>
                <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                  <p className={styles.messageText}>{msg.message}</p>
                  <span className={styles.messageTime}>{formatTime(msg.sentAt)}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.infoTextBottom}>
          Gunakan chat untuk koordinasi layanan yang sudah matched.
        </div>
      </main>

      <footer className={styles.inputContainer}>
        <form className={styles.inputForm} onSubmit={handleSend}>
          <input
            type="text"
            className={styles.textInput}
            placeholder="Tulis pesan..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className={styles.sendButton} disabled={!inputText.trim()}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </footer>
    </div>
  );
}
