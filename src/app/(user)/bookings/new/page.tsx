"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { faUserInjured } from "@fortawesome/free-solid-svg-icons/faUserInjured";
import { faHospital } from "@fortawesome/free-solid-svg-icons/faHospital";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { useApi } from "@/hooks/useApi";
import { fetchPatients, createBooking } from "@/lib/api";
import styles from "../bookings.module.css";

import { Suspense } from "react";

const TOTAL_STEPS = 4;

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatient = searchParams.get("patientId") || "";

  const [step, setStep] = useState(preselectedPatient ? 2 : 1);
  const [patientId, setPatientId] = useState(preselectedPatient);
  const [bookingType, setBookingType] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledAt, setScheduledAt] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: patients, loading: loadingPatients } = useApi(fetchPatients);
  const selectedPatient = (patients || []).find((p: any) => p.id === patientId);

  const canNext = useCallback((): boolean => {
    switch (step) {
      case 1: return !!patientId;
      case 2: return bookingType === "immediate" || (bookingType === "scheduled" && !!scheduledAt);
      case 3: return !!facilityName.trim() && !!facilityAddress.trim();
      case 4: return true;
      default: return false;
    }
  }, [step, patientId, bookingType, scheduledAt, facilityName, facilityAddress]);

  const handleNext = useCallback(async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      // Submit — POST /bookings
      setIsLoading(true);
      try {
        const payload: any = {
          patientId,
          bookingType,
          facilityName,
          facilityAddress
        };
        
        if (bookingType === "scheduled") {
          // Konversi ke format ISO jika diperlukan oleh backend
          payload.scheduledAt = new Date(scheduledAt).toISOString();
        }

        await createBooking(payload);
        router.push("/schedule");
      } catch (error: any) {
        console.error(error);
        alert(error.message || "Gagal membuat pesanan.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [step, router, patientId, bookingType, scheduledAt, facilityName, facilityAddress]);

  const handlePrev = useCallback(() => {
    if (step > 1) setStep(step - 1);
    else router.push("/dashboard");
  }, [step, router]);

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={handlePrev} aria-label="Kembali" id="new-booking-back">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.pageTitle}>Pesan Caregiver</h1>
      </div>

      {/* ── Step Indicator ── */}
      <div className={styles.stepIndicator}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const s = i + 1;
          const isDone = s < step;
          const isActive = s === step;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className={`${styles.stepDot} ${isDone ? styles.stepDotDone : ""} ${isActive ? styles.stepDotActive : ""}`} />
              {s < TOTAL_STEPS && <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ""}`} />}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Pilih Pasien ── */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Pilih Pasien</h2>
          <p className={styles.stepSubtitle}>Siapa yang akan didampingi?</p>
          {loadingPatients ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            </div>
          ) : patients && patients.length > 0 ? (
            <div className={styles.selectionList}>
              {patients.map((p: any) => (
                <button
                  key={p.id}
                  className={`${styles.selectionCard} ${patientId === p.id ? styles.selectionCardActive : ""}`}
                  onClick={() => setPatientId(p.id)}
                  id={`select-patient-${p.id}`}
                >
                  <div className={`${styles.selectionCardIcon} ${p.gender === "male" ? styles.iconBlue : styles.iconPink}`}>
                    <FontAwesomeIcon icon={faUserInjured} />
                  </div>
                  <div className={styles.selectionCardText}>
                    <span className={styles.selectionCardTitle}>{p.name}</span>
                    <span className={styles.selectionCardSub}>{p.address}</span>
                  </div>
                  <div className={`${styles.selectionRadio} ${patientId === p.id ? styles.selectionRadioActive : ""}`} />
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faUserInjured} />
              </div>
              <span className={styles.emptyTitle}>Belum Ada Pasien</span>
              <p className={styles.emptyText}>Silakan tambahkan data pasien terlebih dahulu untuk memesan caregiver.</p>
              <button 
                className={styles.addPatientButton} 
                onClick={() => router.push("/patients/new")}
              >
                Tambah Pasien
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Tipe Layanan ── */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Tipe Layanan</h2>
          <p className={styles.stepSubtitle}>Kapan Anda membutuhkan caregiver?</p>
          
          <div className={styles.selectionList}>
            <button
              className={`${styles.selectionCard} ${bookingType === "immediate" ? styles.selectionCardActive : ""}`}
              onClick={() => setBookingType("immediate")}
              id="booking-type-immediate"
            >
              <div className={`${styles.selectionCardIcon} ${styles.iconBlue}`}>
                <FontAwesomeIcon icon={faHospital} />
              </div>
              <div className={styles.selectionCardText}>
                <span className={styles.selectionCardTitle}>Pesan Sekarang</span>
                <span className={styles.selectionCardSub}>Caregiver akan dicarikan saat ini juga</span>
              </div>
              <div className={`${styles.selectionRadio} ${bookingType === "immediate" ? styles.selectionRadioActive : ""}`} />
            </button>

            <button
              className={`${styles.selectionCard} ${bookingType === "scheduled" ? styles.selectionCardActive : ""}`}
              onClick={() => setBookingType("scheduled")}
              id="booking-type-scheduled"
            >
              <div className={`${styles.selectionCardIcon} ${styles.iconPink}`}>
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <div className={styles.selectionCardText}>
                <span className={styles.selectionCardTitle}>Terjadwal</span>
                <span className={styles.selectionCardSub}>Pilih waktu untuk jadwal mendatang</span>
              </div>
              <div className={`${styles.selectionRadio} ${bookingType === "scheduled" ? styles.selectionRadioActive : ""}`} />
            </button>
          </div>

          {bookingType === "scheduled" && (
            <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
              <label className={styles.inputLabel} htmlFor="schedule-time">Waktu Pendampingan</label>
              <input
                id="schedule-time"
                type="datetime-local"
                className={styles.input}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Fasilitas Kesehatan ── */}
      {step === 3 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Fasilitas Kesehatan</h2>
          <p className={styles.stepSubtitle}>Rumah sakit atau klinik tujuan</p>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="facility-name">Nama Fasilitas</label>
            <input
              id="facility-name"
              type="text"
              className={styles.input}
              placeholder="Contoh: RSCM Kencana"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="facility-address">Alamat Lengkap</label>
            <textarea
              id="facility-address"
              className={styles.textarea}
              placeholder="Jalan, RT/RW, Kecamatan, Kota..."
              value={facilityAddress}
              onChange={(e) => setFacilityAddress(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── Step 4: Konfirmasi ── */}
      {step === 4 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Konfirmasi Pemesanan</h2>
          <p className={styles.stepSubtitle}>Pastikan semua data sudah benar</p>
          <div className={styles.confirmBox}>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Pasien</span>
              <span className={styles.confirmValue}>{selectedPatient?.name}</span>
            </div>
            <div className={styles.confirmDivider} />
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Tipe Layanan</span>
              <span className={styles.confirmValue}>
                {bookingType === "immediate" ? "Pesan Sekarang" : "Terjadwal"}
              </span>
            </div>
            {bookingType === "scheduled" && scheduledAt && (
              <>
                <div className={styles.confirmDivider} />
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Waktu</span>
                  <span className={styles.confirmValue}>{new Date(scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
              </>
            )}
            <div className={styles.confirmDivider} />
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Fasilitas</span>
              <span className={styles.confirmValue}>{facilityName || "-"}</span>
            </div>
            <div className={styles.confirmDivider} />
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Alamat Fasilitas</span>
              <span className={styles.confirmValue}>{facilityAddress || "-"}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className={styles.stepNav}>
        <button
          className={styles.nextButton}
          onClick={handleNext}
          disabled={!canNext() || isLoading}
          id="new-booking-next"
        >
          {isLoading ? (
            <><span className={styles.spinner} />Memproses...</>
          ) : step === TOTAL_STEPS ? (
            <><FontAwesomeIcon icon={faCheck} /> Konfirmasi Pesanan</>
          ) : step === 3 ? (
            <>Lanjut ke Konfirmasi <FontAwesomeIcon icon={faChevronRight} /></>
          ) : (
            <>Lanjut <FontAwesomeIcon icon={faChevronRight} /></>
          )}

        </button>
      </div>
    </>
  );
}

export default function NewBookingPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <Suspense fallback={<div>Memuat form pemesanan...</div>}>
          <NewBookingContent />
        </Suspense>
      </div>
    </div>
  );
}
