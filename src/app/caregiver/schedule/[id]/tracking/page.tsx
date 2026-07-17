"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser, faComments, faCheck, faLocationArrow, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getBookingDetail, getBookingProgress, updateBookingProgress, PHOTO_REQUIRED_STATUSES } from "@/lib/api";
import dynamic from "next/dynamic";
import styles from "./tracking.module.css";

const MapViewer = dynamic(() => import("@/components/MapViewer"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}><FontAwesomeIcon icon={faSpinner} spin /> Memuat Peta...</div>
});

const PROGRESS_STEPS = [
  { id: "heading_to_patient", label: "Menuju lokasi pasien" },
  { id: "picked_up_patient", label: "Jemput pasien" },
  { id: "heading_to_facility", label: "Menuju fasilitas kesehatan" },
  { id: "arrived_registration", label: "Registrasi di faskes" },
  { id: "waiting_in_queue", label: "Menunggu antrean" },
  { id: "in_consultation", label: "Konsultasi selesai" },
  { id: "heading_back", label: "Perjalanan pulang" },
  { id: "completed", label: "Selesai diantar" },
];

export default function TrackingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBookingDetail(bookingId);
        setBooking(b);
        try {
          const prog = await getBookingProgress(bookingId);
          setHistory(prog.history);
        } catch (e) {
          setHistory([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookingId]);

  const handleUpdateStatus = async (statusId: string, file: File | null) => {
    setUpdating(true);
    try {
      const isPhotoRequired = PHOTO_REQUIRED_STATUSES.includes(statusId as typeof PHOTO_REQUIRED_STATUSES[number]);
      if (isPhotoRequired && !file) {
        alert("Foto bukti wajib diunggah untuk status ini.");
        return;
      }

      let photoUrl = "";
      if (isPhotoRequired && file) {
        photoUrl = "https://via.placeholder.com/600x400.png?text=" + encodeURIComponent(statusId);
      }

      const newProgress = await updateBookingProgress(bookingId, {
        status: statusId,
        latitude: -6.1925,
        longitude: 106.8415,
        ...(photoUrl && { photoUrl })
      });
      setHistory(prev => [...prev, newProgress]);
      setShowPhotoUpload(false);
      setPhotoFile(null);
      setPendingStatusId(null);
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status");
    } finally {
      setUpdating(false);
    }
  };

  const getStepStatus = (stepId: string) => {
    const stepIndex = PROGRESS_STEPS.findIndex(s => s.id === stepId);
    if (history.length === 0) return stepIndex === 0 ? "current" : "upcoming";
    const currentStatusIndex = PROGRESS_STEPS.findIndex(s => s.id === history[history.length - 1].status);
    
    if (stepIndex < currentStatusIndex) return "completed";
    if (stepIndex === currentStatusIndex) return "current";
    return "upcoming";
  };

  const handleNextStep = () => {
    let nextStepIdx = 0;
    if (history.length > 0) {
      const currentStatusIndex = PROGRESS_STEPS.findIndex(s => s.id === history[history.length - 1].status);
      nextStepIdx = currentStatusIndex + 1;
    } else {
      // First step is heading_to_patient (index 0)
      nextStepIdx = 0;
    }
    
    // If it's already completed, go to report page
    if (nextStepIdx >= PROGRESS_STEPS.length) {
      router.push(`/caregiver/schedule/${bookingId}/report`);
      return;
    }
    
    const nextStatus = PROGRESS_STEPS[nextStepIdx].id;
    const isPhotoRequired = PHOTO_REQUIRED_STATUSES.includes(nextStatus as typeof PHOTO_REQUIRED_STATUSES[number]);

    if (isPhotoRequired) {
      setPendingStatusId(nextStatus);
      setShowPhotoUpload(true);
    } else {
      handleUpdateStatus(nextStatus, null);
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}><div className={styles.spinner} /></div>;
  }

  const isCompleted = history.length > 0 && history[history.length - 1].status === "completed";

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.title}>Tracking Progress</h1>
      </header>

      {/* Map / Avatar Area */}
      <div className={styles.topMapArea}>
        <div className={styles.mapContainer}>
          <MapViewer 
            latitude={booking?.latitude || -6.200000} 
            longitude={booking?.longitude || 106.816666} 
            zoom={15} 
            popupText={booking?.patient?.name || "Lokasi Pasien"} 
          />
        </div>
        <div className={styles.patientInfoOverlay}>
          <div className={styles.avatarLarge}>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className={styles.patientDetails}>
            <h2 className={styles.patientName}>{booking?.patient?.name || "Pasien"}</h2>
            <p className={styles.facilityText}>{booking?.facility?.name || booking?.facilityName || "Fasilitas"}</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.progressCard}>
          <h3 className={styles.progressTitle}>Progress Layanan</h3>
          
          <div className={styles.stepperContainer}>
            {PROGRESS_STEPS.map((step, idx) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className={`${styles.stepRow} ${styles[status]}`}>
                  <div className={styles.stepIndicator}>
                    <div className={styles.stepDot}>
                      {status === "completed" && <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />}
                      {status === "current" && <div className={styles.innerDot} />}
                    </div>
                    {idx < PROGRESS_STEPS.length - 1 && <div className={styles.stepLine} />}
                  </div>
                  <div className={styles.stepContent}>
                    <span className={styles.stepLabel}>{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <footer className={styles.footer}>
        <button className={styles.chatButton} onClick={() => router.push(`/caregiver/schedule/${bookingId}/chat`)}>
          <FontAwesomeIcon icon={faComments} />
        </button>
        <button 
          className={styles.nextButton} 
          onClick={handleNextStep} 
          disabled={updating}
        >
          {updating ? "Updating..." : isCompleted ? "Beri Laporan Selesai" : "Update Status"}
          {!updating && !isCompleted && <FontAwesomeIcon icon={faLocationArrow} />}
        </button>
      </footer>

      {/* Photo Upload Overlay/Modal */}
      {showPhotoUpload && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "var(--space-4)",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "var(--color-white)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-5)",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--color-gray-200)"
          }}>
            <h4 style={{ marginBottom: "var(--space-2)", color: "var(--color-gray-900)", fontSize: "1.1rem", fontWeight: 600 }}>
              Unggah Foto Bukti
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginBottom: "var(--space-4)" }}>
              Ambil atau pilih foto bukti untuk status <strong>{PROGRESS_STEPS.find(s => s.id === pendingStatusId)?.label}</strong>.
            </p>
            
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              style={{
                width: "100%",
                padding: "var(--space-3)",
                border: "1px solid var(--color-gray-200)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "var(--space-4)",
                fontSize: "0.875rem"
              }}
            />

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button 
                className={styles.nextButton}
                style={{ flex: 1, padding: "10px" }}
                onClick={() => handleUpdateStatus(pendingStatusId!, photoFile)}
                disabled={updating || !photoFile}
              >
                {updating ? "Mengirim..." : "Kirim"}
              </button>
              <button 
                onClick={() => {
                  setShowPhotoUpload(false);
                  setPhotoFile(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "var(--color-gray-100)",
                  color: "var(--color-gray-700)",
                  border: "none",
                  borderRadius: "var(--radius-xl)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem"
                }}
                disabled={updating}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
