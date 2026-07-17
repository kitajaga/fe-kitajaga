"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faMapMarkerAlt, 
  faUser, 
  faNotesMedical, 
  faPhoneAlt, 
  faExclamationTriangle, 
  faCheckCircle, 
  faSpinner, 
  faBookOpen, 
  faTriangleExclamation 
} from "@fortawesome/free-solid-svg-icons";
import { getBookingDetail, acceptBooking, getToken, fetchGuidebook, acknowledgeGuidebook, getSocketBaseUrl } from "@/lib/api";
import { io } from "socket.io-client";
import styles from "./detail.module.css";

export default function DetailSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [guidebook, setGuidebook] = useState<any>(null);
  const [guidebookError, setGuidebookError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    try {
      const data = await getBookingDetail(bookingId);
      setBooking(data);
      setGuidebook(null);
      setGuidebookError(null);
      
      // Fetch Guidebook
      if (data.guidebookId) {
        try {
          const gb = await fetchGuidebook(bookingId);
          setGuidebook(gb);
          setGuidebookError(null);
        } catch (e) {
          console.warn("Guidebook not found or error", e);
          setGuidebookError("Guidebook sedang diproses atau belum tersedia. Tunggu beberapa saat lalu muat ulang halaman.");
        }
      } else {
        setGuidebookError("Guidebook belum tersedia untuk booking ini.");
      }
    } catch (err: any) {
      console.warn("Using mock data due to error:", err.message);
      setBooking({
        id: bookingId,
        status: "matched",
        bookingType: "scheduled",
        scheduledAt: "2026-07-15T09:00:00Z",
        facility: {
          name: "RSCM Jakarta",
          address: "Jl. Diponegoro No.71",
        },
        patient: {
          name: "Budi Santoso",
          address: "Jl. Menteng Raya No.10",
          allergies: ["Debu", "Kacang"],
          patientNote: "Mengidap diabetes, sering lupa minum obat sore.",
          emergencyContact: { name: "Rina", phone: "081234567890" }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();

    const token = getToken();
    const socketUrl = getSocketBaseUrl();
    const socket = io(socketUrl, { auth: { token } });

    socket.on("connect", () => {
      socket.emit("join_booking", bookingId);
    });

    const handleUpdate = () => {
      fetchDetail();
    };

    socket.on("booking_status_updated", handleUpdate);
    socket.on("booking_updated", handleUpdate);

    return () => {
      socket.disconnect();
    };
  }, [bookingId]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptBooking(bookingId);
      alert("Pesanan berhasil diterima!");
      fetchDetail();
    } catch (err: any) {
      alert(err.message || "Gagal menerima pesanan.");
    } finally {
      setAccepting(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!guidebook) return;
    setActionLoading(true);
    try {
      await acknowledgeGuidebook(guidebook.id);
      setGuidebook({ ...guidebook, acknowledgedByCaregiver: true });
      setBooking({ ...booking, guidebookAcknowledged: true });
      alert("Guidebook berhasil disetujui.");
    } catch (e: any) {
      alert(e.message || "Gagal menyetujui Guidebook");
    } finally {
      setActionLoading(false);
    }
  };

  const isGuidebookAcknowledged = Boolean(booking?.guidebookAcknowledged ?? guidebook?.acknowledgedByCaregiver);

  const handleStart = () => {
    if (!isGuidebookAcknowledged) {
      alert("Harap baca dan setujui Guidebook sebelum memulai layanan.");
      return;
    }
    // Start CG event -> go to tracking & chat
    router.push(`/caregiver/schedule/${bookingId}/tracking`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Memuat detail...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.errorContainer}>
        <p>{error || "Data tidak ditemukan"}</p>
        <button onClick={() => router.back()}>Kembali</button>
      </div>
    );
  }

  const dateStr = new Date(booking.scheduledAt).toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.title}>Detail Schedule</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        
        {/* Status & Time */}
        <div className={styles.card}>
          <div className={styles.statusBadge}>{booking.status}</div>
          <h2 className={styles.timeTitle}>Waktu Pelayanan</h2>
          <p className={styles.timeText}>{dateStr}</p>
        </div>

        {/* Patient Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            Informasi Pasien
          </h2>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nama</span>
            <span className={styles.infoValue}>{booking.patient?.name || "-"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Alamat Penjemputan</span>
            <span className={styles.infoValue}>{booking.patient?.address || "-"}</span>
          </div>
          
          {booking.patient?.allergies && booking.patient.allergies.length > 0 && (
            <div className={styles.alertBox}>
              <FontAwesomeIcon icon={faExclamationTriangle} className={styles.alertIcon} />
              <div>
                <strong>Alergi:</strong> {booking.patient.allergies.join(", ")}
              </div>
            </div>
          )}
          
          {booking.patient?.patientNote && (
            <div className={styles.infoRowVertical}>
              <span className={styles.infoLabel}>
                <FontAwesomeIcon icon={faNotesMedical} className={styles.smallIcon} /> Catatan Khusus
              </span>
              <p className={styles.infoDesc}>{booking.patient.patientNote}</p>
            </div>
          )}
        </div>

        {/* Facility Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} />
            Tujuan (Fasilitas Kesehatan)
          </h2>
          <div className={styles.infoRowVertical}>
            <span className={styles.infoValueLarge}>{booking.facility?.name || booking.facilityName || "-"}</span>
            <span className={styles.infoValue}>{booking.facility?.address || booking.facilityAddress || "-"}</span>
          </div>
        </div>

        {/* AI Guidebook */}
        {guidebook ? (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faBookOpen} className={styles.icon} />
              AI Guidebook
            </h2>
            <p style={{ fontSize: "0.875rem", marginBottom: "0.75rem", opacity: 0.9 }}>
              {guidebook.quickSummary}
            </p>
            
            <div style={{ marginBottom: "0.5rem" }}><strong>Do (Harus Dilakukan):</strong></div>
            <ul style={{ paddingLeft: "1.25rem", marginBottom: "1rem", fontSize: "0.875rem", lineHeight: 1.5 }}>
              {guidebook.do?.map((item: string, idx: number) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>{item}</li>
              ))}
            </ul>

            <div style={{ marginBottom: "0.5rem" }}><strong>Don&apos;t (Dilarang):</strong></div>
            <ul style={{ paddingLeft: "1.25rem", marginBottom: "1rem", fontSize: "0.875rem", lineHeight: 1.5, color: "#e53e3e" }}>
              {guidebook.dont?.map((item: string, idx: number) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>{item}</li>
              ))}
            </ul>

            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", color: "#991B1B" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <FontAwesomeIcon icon={faTriangleExclamation} color="#dc2626" /> 
                <strong>Warning Signs</strong>
              </div>
              {guidebook.warningSigns?.map((ws: string, idx: number) => (
                <div key={idx} style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>• {ws}</div>
              ))}
            </div>

            <div style={{ marginTop: "1rem", fontSize: "0.75rem" }}>
              <strong>Kontak Darurat: </strong> {guidebook.emergencyContact?.name} ({guidebook.emergencyContact?.phone})
            </div>
          </div>
        ) : (
          <div className={styles.card}>
            <span style={{ color: "var(--color-gray-500)", fontSize: "0.875rem" }}>
              {guidebookError || "Guidebook belum tersedia."}
            </span>
          </div>
        )}

        {/* Emergency Contact */}
        {booking.patient?.emergencyContact && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faPhoneAlt} className={styles.icon} />
              Kontak Darurat
            </h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nama</span>
              <span className={styles.infoValue}>{booking.patient.emergencyContact.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Telepon</span>
              <a href={`tel:${booking.patient.emergencyContact.phone}`} className={styles.phoneLink}>
                {booking.patient.emergencyContact.phone}
              </a>
            </div>
          </div>
        )}

      </main>

      {/* Footer Action */}
      <footer className={styles.footer} style={{ position: "sticky", bottom: 0 }}>
        {booking.status === "pending_matching" ? (
          isGuidebookAcknowledged ? (
            <button className={styles.startButton} onClick={handleAccept} disabled={accepting}>
              {accepting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Terima Pesanan"}
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div className={styles.alertBox} style={{ marginBottom: "0.5rem" }}>
                <FontAwesomeIcon icon={faTriangleExclamation} className={styles.alertIcon} />
                <span>Harap baca dan setujui Guidebook sebelum menerima atau memulai layanan.</span>
              </div>
              <button className={styles.startButton} onClick={handleAcknowledge} disabled={actionLoading || !guidebook}>
                {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />} Saya Telah Membaca & Paham
              </button>
            </div>
          )
        ) : !isGuidebookAcknowledged ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div className={styles.alertBox} style={{ marginBottom: "0.5rem" }}>
              <FontAwesomeIcon icon={faTriangleExclamation} className={styles.alertIcon} />
              <span>Harap setujui Guidebook sebelum memulai layanan.</span>
            </div>
            <button className={styles.startButton} onClick={handleAcknowledge} disabled={actionLoading || !guidebook}>
              {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />} Saya Telah Membaca & Paham
            </button>
          </div>
        ) : (
          <button className={styles.startButton} onClick={handleStart}>
            Mulai Layanan
          </button>
        )}
      </footer>
    </div>
  );
}
