"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faClipboardCheck, faNotesMedical } from "@fortawesome/free-solid-svg-icons";
import { submitReport } from "@/lib/api";
import styles from "./report.module.css";

export default function GiveReportPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [conditionSummary, setConditionSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionSummary.trim() || !notes.trim()) return;

    setLoading(true);
    setError("");
    
    try {
      await submitReport(bookingId, { conditionSummary, notes });
      setSuccess(true);
      setTimeout(() => {
        // After successful report, redirect back to home or schedule
        router.push("/caregiver");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Gagal mengirim laporan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCircle}>
          <FontAwesomeIcon icon={faClipboardCheck} />
        </div>
        <h2 className={styles.successTitle}>Laporan Berhasil Dikirim</h2>
        <p className={styles.successText}>Sesi layanan telah selesai. Terima kasih atas kerja keras Anda hari ini!</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.title}>Laporan Sesi</h1>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        
        <div className={styles.infoBanner}>
          <FontAwesomeIcon icon={faNotesMedical} className={styles.bannerIcon} />
          <p>Laporan ini penting untuk histori kesehatan pasien dan penilaian kualitas layanan Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="conditionSummary" className={styles.label}>
              Ringkasan Kondisi Pasien
            </label>
            <textarea
              id="conditionSummary"
              className={styles.textarea}
              placeholder="Contoh: Pasien dalam keadaan stabil, tekanan darah normal..."
              value={conditionSummary}
              onChange={(e) => setConditionSummary(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="notes" className={styles.label}>
              Catatan &amp; Tindakan (Opsional)
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              placeholder="Tindakan apa saja yang telah dilakukan selama sesi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              required
            />
          </div>

          {error && <div className={styles.errorText}>{error}</div>}

          <div className={styles.footer}>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading || !conditionSummary.trim() || !notes.trim()}
            >
              {loading ? "Mengirim..." : "Kirim Laporan & Selesai"}
            </button>
          </div>
        </form>

      </main>
    </div>
  );
}
