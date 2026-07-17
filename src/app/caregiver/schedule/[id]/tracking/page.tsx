"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser, faComments, faCheck, faLocationArrow, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getBookingDetail, getBookingProgress, updateBookingProgress } from "@/lib/api";
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

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBookingDetail(bookingId);
        setBooking(b);
        try {
          const prog = await getBookingProgress(bookingId);
          setHistory(Array.isArray(prog) ? prog : (prog.history || []));
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

  const handleUpdateStatus = async (statusId: string) => {
    setUpdating(true);
    try {
      const newProgress = await updateBookingProgress(bookingId, {
        status: statusId,
        latitude: -6.1925,
        longitude: 106.8415
      });
      setHistory(prev => [...prev, newProgress]);
    } catch (err: any) {
      console.warn("Failed to update status, mocking it:", err.message);
      setHistory(prev => [...prev, { status: statusId }]);
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
    if (history.length === 0) {
      handleUpdateStatus(PROGRESS_STEPS[1].id);
      return;
    }
    const currentStatusIndex = PROGRESS_STEPS.findIndex(s => s.id === history[history.length - 1].status);
    
    // If it's already completed, go to report page
    if (currentStatusIndex >= PROGRESS_STEPS.length - 1) {
      router.push(`/caregiver/schedule/${bookingId}/report`);
      return;
    }
    
    handleUpdateStatus(PROGRESS_STEPS[currentStatusIndex + 1].id);
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
    </div>
  );
}
