"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { faUserInjured } from "@fortawesome/free-solid-svg-icons/faUserInjured";
import { faBolt } from "@fortawesome/free-solid-svg-icons/faBolt";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import { faHospital } from "@fortawesome/free-solid-svg-icons/faHospital";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { MOCK_PATIENTS } from "@/lib/mockData";
import styles from "../bookings.module.css";

import { Suspense } from "react";

const TOTAL_STEPS = 4;

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatient = searchParams.get("patientId") || "";
  const preselectedType = searchParams.get("type") as "immediate" | "scheduled" | null;

  const [step, setStep] = useState(preselectedPatient ? 2 : 1);
  const [patientId, setPatientId] = useState(preselectedPatient);
  const [bookingType, setBookingType] = useState<"immediate" | "scheduled" | "">(preselectedType || "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedPatient = MOCK_PATIENTS.find((p) => p.id === patientId);

  const canNext = useCallback((): boolean => {
    switch (step) {
      case 1: return !!patientId;
      case 2: return !!bookingType && (bookingType === "immediate" || !!scheduledAt);
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
      await new Promise((r) => setTimeout(r, 1500));
      setIsLoading(false);
      router.push("/dashboard");
    }
  }, [step, router]);

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
          <div className={styles.selectionList}>
            {MOCK_PATIENTS.map((p) => (
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
        </div>
      )}

      {/* ── Step 2: Tipe Layanan ── */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Tipe Layanan</h2>
          <p className={styles.stepSubtitle}>Pilih jenis layanan yang dibutuhkan</p>
          <div className={styles.selectionList}>
            <button
              className={`${styles.selectionCard} ${bookingType === "immediate" ? styles.selectionCardActive : ""}`}
              onClick={() => setBookingType("immediate")}
              id="select-type-immediate"
            >
              <div className={`${styles.selectionCardIcon} ${styles.iconAmber}`}>
                <FontAwesomeIcon icon={faBolt} />
              </div>
              <div className={styles.selectionCardText}>
                <span className={styles.selectionCardTitle}>Sekarang</span>
                <span className={styles.selectionCardSub}>Caregiver segera menuju lokasi pasien</span>
              </div>
              <div className={`${styles.selectionRadio} ${bookingType === "immediate" ? styles.selectionRadioActive : ""}`} />
            </button>
            <button
              className={`${styles.selectionCard} ${bookingType === "scheduled" ? styles.selectionCardActive : ""}`}
              onClick={() => setBookingType("scheduled")}
              id="select-type-scheduled"
            >
              <div className={`${styles.selectionCardIcon} ${styles.iconGreen}`}>
                <FontAwesomeIcon icon={faCalendarDays} />
              </div>
              <div className={styles.selectionCardText}>
                <span className={styles.selectionCardTitle}>Terjadwal</span>
                <span className={styles.selectionCardSub}>Jadwalkan layanan di hari & jam tertentu</span>
              </div>
              <div className={`${styles.selectionRadio} ${bookingType === "scheduled" ? styles.selectionRadioActive : ""}`} />
            </button>
          </div>
          {bookingType === "scheduled" && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="schedule-datetime">Tanggal & Waktu</label>
              <input
                id="schedule-datetime"
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
              placeholder="Contoh: RSCM Jakarta"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="facility-address">Alamat Fasilitas</label>
            <input
              id="facility-address"
              type="text"
              className={styles.input}
              placeholder="Contoh: Jl. Diponegoro No.71, Jakarta"
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
          <div className={styles.confirmCard}>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Pasien</span>
              <span className={styles.confirmValue}>{selectedPatient?.name}</span>
            </div>
            <div className={styles.confirmDivider} />
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Tipe Layanan</span>
              <span className={styles.confirmValue}>{bookingType === "immediate" ? "Sekarang" : "Terjadwal"}</span>
            </div>
            {bookingType === "scheduled" && scheduledAt && (
              <>
                <div className={styles.confirmDivider} />
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Jadwal</span>
                  <span className={styles.confirmValue}>
                    {new Date(scheduledAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </>
            )}
            <div className={styles.confirmDivider} />
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Fasilitas</span>
              <span className={styles.confirmValue}>{facilityName}</span>
            </div>
            <div className={styles.confirmDivider} />
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Alamat</span>
              <span className={styles.confirmValue}>{facilityAddress}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Buttons ── */}
      <div className={styles.stepNav}>
        {step > 1 && (
          <button className={styles.prevButton} onClick={handlePrev} id="booking-prev-btn">
            Kembali
          </button>
        )}
        <button
          className={styles.nextButton}
          onClick={handleNext}
          disabled={!canNext() || isLoading}
          id="booking-next-btn"
        >
          {isLoading ? (
            <><span className={styles.spinner} />Memproses...</>
          ) : step === TOTAL_STEPS ? (
            <><FontAwesomeIcon icon={faCheck} /> Pesan Sekarang</>
          ) : step === 3 ? (
            <><FontAwesomeIcon icon={faHospital} /> Lanjut ke Konfirmasi</>
          ) : (
            "Lanjut"
          )}
        </button>
      </div>
    </>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewBookingContent />
    </Suspense>
  );
}
