"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMapMarkerAlt, faUser, faNotesMedical, faPhoneAlt, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getBookingDetail } from "@/lib/api";
import styles from "./detail.module.css";

export default function DetailSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // We would fetch the real data here, but for now we'll mock it if the API isn't ready
    // Try to fetch, if it fails, use mock data
    const fetchDetail = async () => {
      try {
        const data = await getBookingDetail(bookingId);
        setBooking(data);
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
    
    fetchDetail();
  }, [bookingId]);

  const handleStart = () => {
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
      <footer className={styles.footer}>
        <button className={styles.startButton} onClick={handleStart}>
          Start
        </button>
      </footer>
    </div>
  );
}
