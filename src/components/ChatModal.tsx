"use client";

import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { io, Socket } from "socket.io-client";
import { fetchChatHistory, getSocketBaseUrl, getToken, getUser } from "@/lib/api";

interface ChatModalProps {
  bookingId: string;
  onClose: () => void;
}

export default function ChatModal({ bookingId, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputStr, setInputStr] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = getUser();

  // Fetch history & Init socket
  useEffect(() => {
    let activeSocket: Socket;

    const init = async () => {
      try {
        const history = await fetchChatHistory(bookingId);
        setMessages(history);
      } catch (err) {
        console.error("Failed to load history", err);
      }

      const token = getToken();
      const socketUrl = getSocketBaseUrl();
      
      activeSocket = io(socketUrl, {
        auth: { token }
      });

      activeSocket.on("connect", () => {
        activeSocket.emit("join_booking", bookingId);
      });

      activeSocket.on("new_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      setSocket(activeSocket);
    };

    init();

    return () => {
      if (activeSocket) activeSocket.disconnect();
    };
  }, [bookingId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStr.trim() || !socket) return;

    socket.emit("send_message", {
      bookingId,
      message: inputStr,
    });
    
    // Optimistic UI update could be added here, but waiting for server is safer
    setInputStr("");
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div style={{
        background: "var(--color-surface)",
        width: "100%",
        maxWidth: "400px",
        height: "80vh",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "var(--space-3)",
          background: "var(--color-primary)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Live Chat</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Chat Body */}
        <div style={{
          flex: 1,
          padding: "var(--space-3)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          backgroundColor: "#f9fafb"
        }}>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={idx} style={{
                alignSelf: isMe ? "flex-end" : "flex-start",
                backgroundColor: isMe ? "var(--color-primary)" : "white",
                color: isMe ? "white" : "var(--color-text-primary)",
                padding: "8px 12px",
                borderRadius: "12px",
                maxWidth: "80%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                fontSize: "var(--font-size-sm)"
              }}>
                <div>{msg.message}</div>
                <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px", textAlign: isMe ? "right" : "left" }}>
                  {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} style={{
          padding: "var(--space-3)",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: "var(--space-2)"
        }}>
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            placeholder="Ketik pesan..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "20px",
              border: "1px solid var(--color-border)",
              outline: "none"
            }}
          />
          <button type="submit" style={{
            background: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </div>
  );
}
