"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSpinner, faUserInjured, faBookOpen, faCheckCircle, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { 
  getBookingDetail, 
  fetchPatientById,
  fetchGuidebook, 
  acknowledgeGuidebook,
  acceptBooking,
  updateBookingProgress,
  submitReport,
  getBookingProgress,
  PHOTO_REQUIRED_STATUSES,
} from "@/lib/api";
import { BOOKING_STATUS_LABELS, PROGRESS_LABELS } from "@/lib/constants";
import ChatModal from "@/components/ChatModal";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import styles from "../caregiverBookings.module.css";

export default function CaregiverBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [guidebook, setGuidebook] = useState<any>(null);
  const [guidebookError, setGuidebookError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportNotes, setReportNotes] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<{ status: string; photoRequired: boolean } | null>(null);
  const [progressNote, setProgressNote] = useState("");
  const [progressPhoto, setProgressPhoto] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [progressHistory, setProgressHistory] = useState<any[]>([]);

  const PROGRESS_ORDER = [
    "heading_to_patient",
    "picked_up_patient",
    "heading_to_facility",
    "arrived_registration",
    "waiting_in_queue",
    "in_consultation",
    "heading_back",
    "completed"
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBookingDetail(id);
        setBooking(b);
        setGuidebook(null);
        setGuidebookError(null);
        if (b.patient) {
          setPatient(b.patient);
        } else if (b.patientId) {
          const p = await fetchPatientById(b.patientId).catch(() => null);
          if (p) setPatient(p);
        }
        
        // Fetch guidebook
        if (b.guidebookId) {
          try {
            const gb = await fetchGuidebook(id);
            setGuidebook(gb);
            setGuidebookError(null);
          } catch (e) {
            console.error("Guidebook not found or forbidden", e);
            setGuidebookError("Guidebook sedang diproses atau belum tersedia. Mohon tunggu beberapa saat lalu muat ulang halaman.");
          }
        } else {
          setGuidebookError("Guidebook belum tersedia untuk booking ini.");
        }

        if (b.status === "in_progress" || b.status === "completed" || b.status === "reported" || b.status === "paid" || b.status === "scheduled") {
          try {
            const prog = await getBookingProgress(id);
            setProgressHistory(prog.history);
          } catch (err) {
            console.error("Failed to fetch progress", err);
          }
        }
      } catch (e) {
        console.error("Failed to load booking details", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleAcknowledge = async () => {
    if (!guidebook) return;
    try {
      setActionLoading(true);
      await acknowledgeGuidebook(guidebook.id);
      setGuidebook({ ...guidebook, acknowledgedByCaregiver: true });
      setBooking({ ...booking, guidebookAcknowledged: true });
      alert("Guidebook berhasil dipahami.");
    } catch (e: any) {
      alert(e.message || "Gagal acknowledge guidebook");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await acceptBooking(id);
      alert("Pesanan berhasil diterima!");
      router.push("/caregiver"); // redirect to home to see active booking
    } catch (e: any) {
      alert(e.message || "Gagal menerima pesanan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgressClick = (nextStatus: string) => {
    const photoRequired = PHOTO_REQUIRED_STATUSES.includes(nextStatus as typeof PHOTO_REQUIRED_STATUSES[number]);
    setPendingProgress({ status: nextStatus, photoRequired });
    setProgressNote("");
    setProgressPhoto(null);
    setIsCameraOpen(photoRequired);
  };

  const submitUpdateProgress = async () => {
    if (!pendingProgress) return;

    if (pendingProgress.photoRequired && !progressPhoto) {
      alert("Foto bukti wajib diunggah untuk status ini.");
      return;
    }

    try {
      setActionLoading(true);
      let photoUrl = "";
      if (pendingProgress.photoRequired && progressPhoto) {
        photoUrl = "https://via.placeholder.com/600x400.png?text=Progress+Photo";
      }

      const result = await updateBookingProgress(id, { 
        status: pendingProgress.status, 
        latitude: -6.200000, 
        longitude: 106.816666, 
        note: progressNote,
        ...(photoUrl && { photoUrl })
      });
      
      const newStatus = pendingProgress.status === "completed" ? "completed" : "in_progress";
      setBooking({ ...booking, status: newStatus });
      setProgressHistory([...progressHistory, result]);
      setPendingProgress(null);
      setIsCameraOpen(false);
    } catch (e: any) {
      alert(e.message || "Gagal update progress");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNotes || !reportSummary) {
      alert("Harap isi semua field laporan");
      return;
    }
    try {
      setActionLoading(true);
      await submitReport(booking.id, { conditionSummary: reportSummary, notes: reportNotes });
      setBooking({ ...booking, status: "reported" });
      alert("Laporan berhasil dikirim!");
    } catch (e: any) {
      alert(e.message || "Gagal mengirim laporan");
    } finally {
      setActionLoading(false);
    }
  };

  const isGuidebookAcknowledged = Boolean(booking?.guidebookAcknowledged ?? guidebook?.acknowledgedByCaregiver);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--color-primary)" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageHeader}>
          <button className={styles.backButton} onClick={() => router.push("/caregiver")} aria-label="Kembali">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className={styles.pageTitle}>Booking Tidak Ditemukan</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={() => router.push("/caregiver")} aria-label="Kembali">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.pageTitle} style={{ flex: 1 }}>Detail Pesanan</h1>
        {booking.status === "in_progress" && (
          <button 
            className={styles.backButton} 
            onClick={() => setShowChat(true)} 
            aria-label="Chat"
            style={{ color: "var(--color-primary)" }}
          >
            <FontAwesomeIcon icon={faComments} />
          </button>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Status Pesanan
        </div>
        <div className={styles.dataRow}>
          <span className={styles.dataLabel}>Status</span>
          <span className={styles.dataValue}>{BOOKING_STATUS_LABELS[booking.status] || booking.status}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.dataLabel}>Tipe</span>
          <span className={styles.dataValue}>{booking.bookingType === "immediate" ? "Segera (Immediate)" : "Terjadwal (Scheduled)"}</span>
        </div>
      </div>

      {/* ── Data Pasien ── */}
      {patient && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <FontAwesomeIcon icon={faUserInjured} /> Profil Pasien
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Nama</span>
            <span className={styles.dataValue}>{patient.name}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Kondisi (Mobilitas)</span>
            <span className={styles.dataValue}>{patient.mobilityStatus}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Alergi</span>
            <span className={styles.dataValue}>
              {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(", ") : "Tidak ada"}
            </span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Catatan Medis</span>
            <span className={styles.dataValue}>{patient.medicalNotes || "-"}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Lokasi</span>
            <span className={styles.dataValue}>{patient.address}</span>
          </div>
        </div>
      )}

      {/* ── AI Guidebook ── */}
      {guidebook ? (
        <div className={styles.guidebookSection}>
          <div className={styles.guidebookTitle}>
            <FontAwesomeIcon icon={faBookOpen} /> AI Guidebook
          </div>
          <p style={{ fontSize: "var(--font-size-sm)", marginBottom: "var(--space-3)", opacity: 0.9 }}>
            {guidebook.quickSummary}
          </p>
          
          <div style={{ marginBottom: "var(--space-2)" }}><strong>Do (Harus Dilakukan):</strong></div>
          <ul className={styles.guideList}>
            {guidebook.do?.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <div style={{ marginBottom: "var(--space-2)", marginTop: "var(--space-3)" }}><strong>Don&apos;t (Dilarang):</strong></div>
          <ul className={`${styles.guideList} ${styles.dontList}`}>
            {guidebook.dont?.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <div style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "rgba(0,0,0,0.1)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
              <FontAwesomeIcon icon={faTriangleExclamation} color="#fca5a5" /> 
              <strong>Warning Signs</strong>
            </div>
            {guidebook.warningSigns?.map((ws: string, idx: number) => (
              <div key={idx} style={{ fontSize: "var(--font-size-xs)", marginBottom: "var(--space-1)" }}>• {ws}</div>
            ))}
          </div>

          <div style={{ marginTop: "var(--space-4)", fontSize: "var(--font-size-xs)" }}>
            <strong>Kontak Darurat: </strong> {guidebook.emergencyContact?.name} ({guidebook.emergencyContact?.phone})
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
            {guidebookError || "Guidebook belum tersedia."}
          </span>
        </div>
      )}

      {/* ── Actions (Accept / Acknowledge) ── */}
      {guidebook && !isGuidebookAcknowledged && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <div className={styles.warningAlert}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>Anda wajib membaca dan memahami Guidebook di atas sebelum dapat melanjutkan.</span>
          </div>
          <button 
            className={styles.primaryAction} 
            onClick={handleAcknowledge}
            disabled={actionLoading}
          >
            <FontAwesomeIcon icon={faCheckCircle} /> Saya Telah Membaca & Paham
          </button>
        </div>
      )}

      {/* Accept Pending Booking (only if acknowledged) */}
      {booking.status === "pending_matching" && isGuidebookAcknowledged && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <button 
            className={styles.primaryAction} 
            onClick={handleAccept}
            disabled={actionLoading}
          >
            <FontAwesomeIcon icon={actionLoading ? faSpinner : faCheckCircle} spin={actionLoading} /> 
            {actionLoading ? "Memproses..." : "Terima Pesanan"}
          </button>
          <button className={styles.secondaryAction} onClick={() => router.back()}>
            Kembali
          </button>
        </div>
      )}

      {/* ── Actions (In Progress) ── */}
      {(booking.status === "in_progress" || booking.status === "paid" || booking.status === "scheduled") && 
       isGuidebookAcknowledged && (
        <div style={{ marginTop: "var(--space-4)" }} className={styles.card}>
          <div className={styles.cardTitle}>Update Progress</div>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-3)" }}>
            Status Terakhir: <strong>{progressHistory.length > 0 ? PROGRESS_LABELS[progressHistory[progressHistory.length - 1].status] : "Belum Mulai"}</strong>
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {PROGRESS_ORDER.map((status, index) => {
              const currentProgressIdx = progressHistory.length > 0 
                  ? PROGRESS_ORDER.indexOf(progressHistory[progressHistory.length - 1].status) 
                  : -1;
              const isNext = index === currentProgressIdx + 1;
              const isDone = index <= currentProgressIdx;
              
              if (isDone) return null; // Don't show past actions
              
              if (isNext) {
                return (
                  <button 
                    key={status}
                    className={styles.primaryAction}
                    onClick={() => handleUpdateProgressClick(status)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />} 
                    Tandai: {PROGRESS_LABELS[status] || status}
                  </button>
                );
              }
              return null;
            })}
          </div>

          {/* Pending Progress Upload Form */}
          {pendingProgress && (
            <div style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-md)" }}>
              <h4 style={{ marginBottom: "var(--space-2)" }}>Update: {PROGRESS_LABELS[pendingProgress.status]}</h4>
              
              {pendingProgress.photoRequired && (
                <div style={{ marginBottom: "var(--space-3)" }}>
                  <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", display: "block", marginBottom: "var(--space-2)" }}>
                    Foto Bukti (Wajib)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={(e) => setProgressPhoto(e.target.files?.[0] || null)}
                    style={{ width: "100%", padding: "var(--space-2)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}
                  />
                  {progressPhoto && (
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-success)", display: "block", marginTop: "var(--space-1)" }}>
                      ✓ Foto dipilih
                    </span>
                  )}
                </div>
              )}

              <div style={{ marginBottom: "var(--space-3)" }}>
                <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", display: "block", marginBottom: "var(--space-2)" }}>
                  Catatan (Opsional)
                </label>
                <input 
                  type="text" 
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  placeholder="Cth: Sedang di perjalanan..."
                  style={{ width: "100%", padding: "var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button 
                  className={styles.primaryAction} 
                  style={{ flex: 1 }} 
                  onClick={submitUpdateProgress}
                  disabled={actionLoading}
                >
                  {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Kirim Update"}
                </button>
                <button 
                  className={styles.secondaryAction} 
                  style={{ flex: 1 }}
                  onClick={() => setPendingProgress(null)}
                  disabled={actionLoading}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Actions (Completed) ── */}
      {booking.status === "completed" && (
        <div style={{ marginTop: "var(--space-4)" }} className={styles.card}>
          <div className={styles.cardTitle}>Laporan Layanan</div>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-3)" }}>
            Isi laporan ini agar keluarga pasien mengetahui detail kondisi pasien selama layanan berlangsung.
          </p>
          <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", display: "block", marginBottom: "var(--space-2)" }}>Ringkasan Kondisi</label>
              <input 
                type="text" 
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
                placeholder="Cth: Pasien stabil, tekanan darah normal"
                style={{ width: "100%", padding: "var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", fontSize: "var(--font-size-base)" }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", display: "block", marginBottom: "var(--space-2)" }}>Catatan Tambahan</label>
              <textarea 
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Cth: Obat siang sudah diminum setelah makan..."
                style={{ width: "100%", padding: "var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", fontSize: "var(--font-size-base)", minHeight: "100px", fontFamily: "inherit" }}
                required
              />
            </div>
            <button type="submit" className={styles.primaryAction} disabled={actionLoading}>
              {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Kirim Laporan"}
            </button>
          </form>
        </div>
      )}

      {booking.status === "reported" && (
        <div style={{ marginTop: "var(--space-4)" }} className={styles.card}>
          <div style={{ textAlign: "center", color: "#10b981", fontSize: "40px", marginBottom: "var(--space-3)" }}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.cardTitle} style={{ justifyContent: "center" }}>Layanan Telah Selesai</div>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", textAlign: "center" }}>
            Laporan Anda telah berhasil dikirim ke keluarga pasien. Terima kasih atas kerja keras Anda hari ini!
          </p>
        </div>
      )}

      {showChat && (
        <ChatModal bookingId={id} onClose={() => setShowChat(false)} />
      )}

    </div>
  );
}
