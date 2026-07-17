"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons/faUserCircle";
import { faStar } from "@fortawesome/free-solid-svg-icons/faStar";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons/faLocationDot";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons/faTriangleExclamation";
import { faComments } from "@fortawesome/free-solid-svg-icons/faComments";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons/faCreditCard";
import { faHospital } from "@fortawesome/free-solid-svg-icons/faHospital";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons/faRotateRight";
import { faFileLines } from "@fortawesome/free-solid-svg-icons/faFileLines";
import { faUserInjured } from "@fortawesome/free-solid-svg-icons/faUserInjured";
import ChatModal from "@/components/ChatModal";
import { getBookingDetail, getBookingProgress, fetchPatientById, rateBooking } from "@/lib/api";
import { BOOKING_STATUS_LABELS, PROGRESS_LABELS } from "@/lib/constants";
import styles from "../bookings.module.css";

const PROGRESS_ORDER = [
  "heading_to_patient",
  "picked_up_patient",
  "heading_to_facility",
  "arrived_registration",
  "waiting_in_queue",
  "in_consultation",
  "heading_back",
  "completed",
];

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [caregiver, setCaregiver] = useState<any>(null);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBookingDetail(id);
        setBooking(b);
        if (b.patientId) {
          try {
            const p = await fetchPatientById(b.patientId);
            setPatient(p);
          } catch (e) { console.error(e); }
        }
        
        try {
          const prog = await getBookingProgress(id);
          setProgressList(Array.isArray(prog) ? prog : []);
          
          if (b.status === "completed" || b.status === "reported") {
            const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/bookings/${id}/report`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }).then(res => res.json()).catch(() => null);
            if (r?.success) setReport(r.data);
          }
        } catch (e) { console.error(e); }
      } catch (e) {
        console.error("Failed to load booking details", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const progressStatuses = new Set(progressList.map((p) => p.status));
  const latestProgress = progressList[progressList.length - 1];
  const latestIdx = latestProgress ? PROGRESS_ORDER.indexOf(latestProgress.status) : -1;

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Pilih rating bintang terlebih dahulu.");
      return;
    }
    try {
      setActionLoading(true);
      await rateBooking(id, rating, review);
      alert("Terima kasih atas ulasan Anda!");
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Gagal mengirim rating");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--color-primary)" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  if (!booking) {
    return (
      <>
        <div className={styles.pageHeader}>
          <button className={styles.backButton} onClick={() => router.push("/dashboard")} aria-label="Kembali">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className={styles.pageTitle}>Booking Tidak Ditemukan</h1>
        </div>
      </>
    );
  }

  const getStatusBanner = () => {
    switch (booking.status) {
      case "pending_matching":
      case "rescheduling":
        return styles.statusBannerPending;
      case "in_progress":
      case "matched":
      case "paid":
      case "scheduled":
        return styles.statusBannerActive;
      case "completed":
      case "reported":
        return styles.statusBannerComplete;
      default:
        return styles.statusBannerError;
    }
  };

  const getStatusBannerIcon = () => {
    switch (booking.status) {
      case "pending_matching":
      case "rescheduling":
        return faSpinner;
      case "in_progress":
        return faLocationDot;
      case "completed":
      case "reported":
        return faCircleCheck;
      default:
        return faTriangleExclamation;
    }
  };

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={() => router.push("/dashboard")} aria-label="Kembali" id="booking-detail-back">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.pageTitle}>Detail Booking</h1>
      </div>

      <div className={styles.detailContainer}>
        {/* ── Status Banner ── */}
        <div className={`${styles.statusBanner} ${getStatusBanner()}`}>
          <div className={styles.statusBannerIcon}>
            <FontAwesomeIcon icon={getStatusBannerIcon()} />
          </div>
          <div className={styles.statusBannerText}>
            <span className={styles.statusBannerTitle}>{BOOKING_STATUS_LABELS[booking.status]}</span>
            <span className={styles.statusBannerSub}>
              {booking.bookingType === "immediate" ? "Layanan segera" : `Dijadwalkan ${booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}`}
            </span>
          </div>
        </div>

        {/* ── Searching Animation (pending_matching / rescheduling) ── */}
        {(booking.status === "pending_matching" || booking.status === "rescheduling") && (
          <div className={styles.searchingAnimation}>
            <div className={styles.searchingDots}>
              <div className={styles.searchingDot} />
              <div className={styles.searchingDot} />
              <div className={styles.searchingDot} />
            </div>
            <p className={styles.searchingText}>
              {booking.status === "rescheduling"
                ? "Mencari caregiver pengganti untuk Anda..."
                : "Mencari caregiver terbaik berdasarkan lokasi dan rating..."}
            </p>
          </div>
        )}

        {/* ── Caregiver Profile (matched+) ── */}
        {caregiver && booking.status !== "pending_matching" && (
          <div className={styles.caregiverCard}>
            <div className={styles.caregiverTop}>
              <div className={styles.caregiverAvatar}>
                <FontAwesomeIcon icon={faUserCircle} />
              </div>
              <div className={styles.caregiverInfo}>
                <span className={styles.caregiverName}>{caregiver.name}</span>
                <div className={styles.caregiverMeta}>
                  <span className={styles.caregiverRating}>
                    <FontAwesomeIcon icon={faStar} /> {caregiver.rating}
                  </span>
                  <span>{caregiver.totalReviews} ulasan</span>
                </div>
              </div>
            </div>
            {booking.status === "in_progress" && (
              <div className={styles.actionRow}>
                <button className={styles.primaryAction} id="booking-chat-btn" onClick={() => setShowChat(true)}>
                  <FontAwesomeIcon icon={faComments} /> Chat
                </button>
                <button className={styles.secondaryAction} id="booking-reschedule-btn">
                  <FontAwesomeIcon icon={faRotateRight} /> Ganti
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Payment Button (matched) ── */}
        {booking.status === "matched" && (
          <button 
            className={styles.primaryAction} 
            style={{ padding: "16px" }} 
            id="booking-pay-btn"
            onClick={() => alert("Fitur pembayaran (Midtrans) sedang dalam pengembangan.")}
          >
            <FontAwesomeIcon icon={faCreditCard} /> 
            {` Bayar Rp${(booking.payment?.amount || 150000).toLocaleString("id-ID")}`}
          </button>
        )}

        {/* ── Progress Timeline (in_progress) ── */}
        {booking.status === "in_progress" && (
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>
              <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faLocationDot} /></span>
              Progress Layanan
            </h3>
            <div className={styles.timeline}>
              {PROGRESS_ORDER.map((status, i) => {
                const isDone = i <= latestIdx;
                const isCurrent = i === latestIdx;
                const progressEntry = progressList.find((p) => p.status === status);
                return (
                  <div
                    key={status}
                    className={`${styles.timelineItem} ${isDone ? styles.timelineItemDone : ""}`}
                  >
                    <div className={`${styles.timelineDot} ${isDone ? styles.timelineDotDone : ""} ${isCurrent ? styles.timelineDotCurrent : ""}`} />
                    <div className={styles.timelineContent}>
                      <span className={`${styles.timelineLabel} ${!isDone && !isCurrent ? styles.timelineLabelMuted : ""}`}>
                        {PROGRESS_LABELS[status]}
                      </span>
                      {progressEntry && (
                        <>
                          <span className={styles.timelineTime}>
                            {new Date(progressEntry.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {progressEntry.note && <span className={styles.timelineNote}>{progressEntry.note}</span>}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Facility Info ── */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faHospital} /></span>
            Fasilitas Tujuan
          </h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nama</span>
            <span className={styles.infoValue}>{booking.facilityName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Alamat</span>
            <span className={styles.infoValue}>{booking.facilityAddress}</span>
          </div>
        </div>

        {/* ── Patient Info ── */}
        {patient && (
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>
              <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faUserInjured} /></span>
              Pasien
            </h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nama</span>
              <span className={styles.infoValue}>{patient.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Alamat</span>
              <span className={styles.infoValue}>{patient.address}</span>
            </div>
          </div>
        )}

        {/* ── Report (completed) ── */}
        {(booking.status === "completed" || booking.status === "reported") && report && (
          <div className={styles.reportCard}>
            <h3 className={styles.infoCardTitle}>
              <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faFileLines} /></span>
              Laporan Caregiver
            </h3>
            <p className={styles.reportText}>{report.conditionSummary}</p>
            <p className={styles.reportText}>{report.notes}</p>
          </div>
        )}

        {/* ── Rating Form (completed, not yet rated) ── */}
        {booking.status === "completed" && (
          <div className={styles.ratingForm}>
            <h3 className={styles.infoCardTitle}>Beri Rating</h3>
            <div className={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`${styles.starButton} ${star <= rating ? styles.starActive : ""}`}
                  onClick={() => setRating(star)}
                  aria-label={`${star} bintang`}
                  id={`rating-star-${star}`}
                >
                  <FontAwesomeIcon icon={faStar} />
                </button>
              ))}
            </div>
            <textarea
              className={styles.ratingTextarea}
              placeholder="Tulis ulasan Anda (opsional)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <button
              className={styles.submitRatingButton}
              disabled={rating === 0}
              onClick={handleSubmitRating}
              id="submit-rating-btn"
            >
              Kirim Rating
            </button>
          </div>
        )}

        {/* ── Payment Info ── */}
        {booking.payment && (
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>
              <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faCreditCard} /></span>
              Pembayaran
            </h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total</span>
              <span className={styles.infoValue}>Rp{booking.payment.amount?.toLocaleString("id-ID")}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue} style={{ textTransform: "capitalize" }}>{booking.payment.status}</span>
            </div>
          </div>
        )}

        {/* ── Report & Rating (reported/completed) ── */}
        {(booking.status === "reported" || booking.status === "completed") && (
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>
              <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faFileLines} /></span>
              Laporan Caregiver
            </h3>
            {report ? (
              <div style={{ marginBottom: "var(--space-4)" }}>
                <div style={{ marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>Ringkasan Kondisi</span>
                  <p style={{ fontWeight: 600 }}>{report.conditionSummary}</p>
                </div>
                <div>
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>Catatan Tambahan</span>
                  <p style={{ background: "rgba(0,0,0,0.03)", padding: "var(--space-2)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)" }}>
                    {report.notes}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
                Laporan belum tersedia atau gagal dimuat.
              </p>
            )}

            {booking.status === "reported" && (
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
                <h4 style={{ marginBottom: "var(--space-2)", fontSize: "var(--font-size-md)" }}>Beri Penilaian</h4>
                <form onSubmit={handleSubmitRating} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "24px", color: "var(--color-text-secondary)" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <FontAwesomeIcon 
                        key={star} 
                        icon={faStar} 
                        style={{ color: rating >= star ? "#fbbf24" : "inherit", cursor: "pointer" }}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                  <textarea 
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda dengan caregiver ini..."
                    style={{ width: "100%", padding: "var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", minHeight: "80px", fontFamily: "inherit" }}
                  />
                  <button type="submit" className={styles.primaryAction} disabled={actionLoading || rating === 0}>
                    {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Kirim Ulasan"}
                  </button>
                </form>
              </div>
            )}
            
            {booking.rating && (
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
                <h4 style={{ marginBottom: "var(--space-2)", fontSize: "var(--font-size-md)" }}>Ulasan Anda</h4>
                <div style={{ display: "flex", gap: "var(--space-1)", color: "#fbbf24", marginBottom: "var(--space-2)" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <FontAwesomeIcon key={star} icon={faStar} style={{ opacity: booking.rating >= star ? 1 : 0.3 }} />
                  ))}
                </div>
                <p style={{ fontStyle: "italic", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>"{booking.review}"</p>
              </div>
            )}
          </div>
        )}

      </div>
      
      {showChat && (
        <ChatModal bookingId={id} onClose={() => setShowChat(false)} />
      )}
    </>
  );
}
