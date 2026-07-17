"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUserCircle, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { getBookingDetail, getToken } from "@/lib/api";
import styles from "./chat.module.css";

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  sentAt: string;
  type: string;
}

export default function UserChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load booking detail
    getBookingDetail(bookingId)
      .then((data) => setBooking(data))
      .catch((err) => console.error("Failed to fetch booking for chat:", err));

    // Connect to websocket
    const token = getToken() || "";
    const socketUrl = "https://be-kitajaga-production.up.railway.app";
    const socket = io(socketUrl, {
      auth: { token },
      autoConnect: false // disable auto connect if backend is not ready
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_booking", { bookingId });
    });

    socket.on("new_message", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("progress_update", (data: any) => {
      const sysMsg: Message = {
        id: Math.random().toString(36),
        senderId: "system",
        senderRole: "system",
        message: `📍 Update: ${data.statusLabel || data.status}`,
        sentAt: new Date().toISOString(),
        type: "progress_update"
      };
      setMessages(prev => [...prev, sysMsg]);
    });

    try {
      socket.connect();
    } catch (e) {
      console.warn("Socket connection failed, using mock mode");
    }

    // Mock initial messages
    setMessages([
      {
        id: "m1",
        senderId: "me",
        senderRole: "user",
        message: "Halo Suster, apakah sudah menuju rumah?",
        sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: "text"
      },
      {
        id: "m2",
        senderId: "system",
        senderRole: "system",
        message: "Update: Caregiver menuju lokasi pasien",
        sentAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        type: "progress_update"
      },
      {
        id: "m3",
        senderId: "u2",
        senderRole: "caregiver",
        message: "Ya, saya tiba sekitar 10 menit lagi.",
        sentAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
        type: "text"
      }
    ]);

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
    } else {
      // Mock local addition
      setMessages(prev => [...prev, {
        id: Math.random().toString(36),
        senderId: "me",
        senderRole: "user",
        message: inputText,
        sentAt: new Date().toISOString(),
        type: "text"
      }]);
    }
    setInputText("");
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className={styles.headerInfo}>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
          <h1 className={styles.title}>Chat dengan Caregiver</h1>
        </div>
      </header>

      {/* Chat Area */}
      <main className={styles.chatArea}>
        <div className={styles.contextBanner}>
          Booking {booking?.patient?.name || "Pasien"} • {booking?.facility?.name || booking?.facilityName || "Fasilitas"}
        </div>
        
        <div className={styles.dateDivider}>
          <span>HARI INI</span>
        </div>

        <div className={styles.messageList}>
          {messages.map(msg => {
            if (msg.senderRole === "system" || msg.type === "progress_update") {
              return (
                <div key={msg.id} className={styles.systemBubble}>
                  {msg.message}
                </div>
              );
            }
            
            const isMe = msg.senderRole === "user";
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

      {/* Input Area */}
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
