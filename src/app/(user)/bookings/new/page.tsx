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
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { useApi } from "@/hooks/useApi";
import { fetchPatients, createBooking, deletePatient } from "@/lib/api";
import dynamic from "next/dynamic";
import styles from "../bookings.module.css";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>
});

import { Suspense } from "react";

const TOTAL_STEPS = 4;

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatient = searchParams.get("patientId") || "";

  const [step, setStep] = useState(preselectedPatient ? 2 : 1);
  const [patientId, setPatientId] = useState(preselectedPatient);
  const [bookingType, setBookingType] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [facilityLatitude, setFacilityLatitude] = useState<number | null>(null);
  const [facilityLongitude, setFacilityLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  const { data: patients, loading: loadingPatients } = useApi(fetchPatients);
  const selectedPatient = (patients || []).find((p: any) => p.id === patientId);

  const canNext = useCallback((): boolean => {
    switch (step) {
      case 1: return !!patientId;
      case 2: return bookingType === "immediate" || (bookingType === "scheduled" && !!scheduledDate && !!scheduledTime);
      case 3: return !!facilityName.trim() && !!facilityAddress.trim() && facilityLatitude !== null && facilityLongitude !== null;
      case 4: return true;
      default: return false;
    }
  }, [step, patientId, bookingType, scheduledDate, scheduledTime, facilityName, facilityAddress, facilityLatitude, facilityLongitude]);

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
          facilityAddress,
          facilityLatitude,
          facilityLongitude
        };
        
        if (bookingType === "scheduled") {
          const datetimeStr = `${scheduledDate}T${scheduledTime}:00`;
          payload.scheduledAt = new Date(datetimeStr).toISOString();
        }

        const result = await createBooking(payload);
        router.push(`/bookings/${result.id}`);
      } catch (error: any) {
        console.error(error);
        alert(error.message || "Gagal membuat pesanan.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [step, router, patientId, bookingType, scheduledDate, scheduledTime, facilityName, facilityAddress, facilityLatitude, facilityLongitude]);

  const handlePrev = useCallback(() => {
    if (step > 1) setStep(step - 1);
    else router.push("/dashboard");
  }, [step, router]);

  const handleDeletePatient = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus data pasien ini?")) return;
    try {
      await deletePatient(id);
      window.location.reload();
    } catch (err: any) {
      alert("Gagal menghapus pasien: " + err.message);
    }
  };

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
                <div
                  key={p.id}
                  className={`${styles.selectionCard} ${patientId === p.id ? styles.selectionCardActive : ""}`}
                  onClick={() => setPatientId(p.id)}
                  id={`select-patient-${p.id}`}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <div className={`${styles.selectionCardIcon} ${p.gender === "male" ? styles.iconBlue : styles.iconPink}`}>
                    <FontAwesomeIcon icon={faUserInjured} />
                  </div>
                  <div className={styles.selectionCardText}>
                    <span className={styles.selectionCardTitle}>{p.name}</span>
                    <span className={styles.selectionCardSub}>{p.address}</span>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button 
                    onClick={(e) => handleDeletePatient(e, p.id)}
                    style={{ background: "transparent", border: "none", color: "var(--color-danger, #e74c3c)", cursor: "pointer", padding: "8px", marginRight: "10px" }}
                    aria-label="Hapus Pasien"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <div className={`${styles.selectionRadio} ${patientId === p.id ? styles.selectionRadioActive : ""}`} />
                </div>
              ))}
              <button 
                className={styles.addPatientButton} 
                onClick={() => router.push("/patients/new")}
                style={{ marginTop: "1rem", width: "100%", padding: "12px", borderRadius: "8px", border: "1px dashed var(--color-primary)", color: "var(--color-primary)", background: "transparent", fontWeight: 600, cursor: "pointer" }}
              >
                + Tambah Pasien Baru
              </button>
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
              <label className={styles.inputLabel} htmlFor="schedule-date">Tanggal Pendampingan</label>
              <input
                id="schedule-date"
                type="date"
                className={styles.input}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <label className={styles.inputLabel} htmlFor="schedule-time" style={{ marginTop: "1rem" }}>Waktu Pendampingan</label>
              <input
                id="schedule-time"
                type="time"
                className={styles.input}
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
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
          <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
            <label className={styles.inputLabel}>Titik Lokasi Peta</label>
            <p className={styles.emptyText} style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>Sentuh/klik peta untuk menentukan titik koordinat fasilitas</p>
            <div style={{ height: "250px", borderRadius: "8px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
              <MapPicker 
                initialLatitude={facilityLatitude || undefined} 
                initialLongitude={facilityLongitude || undefined}
                onLocationSelect={(lat, lng) => {
                  setFacilityLatitude(lat);
                  setFacilityLongitude(lng);
                }}
              />
            </div>
            {facilityLatitude && facilityLongitude && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--color-primary)" }}>
                Titik terpilih: {facilityLatitude.toFixed(4)}, {facilityLongitude.toFixed(4)}
              </p>
            )}
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
            {bookingType === "scheduled" && scheduledDate && scheduledTime && (
              <>
                <div className={styles.confirmDivider} />
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Waktu</span>
                  <span className={styles.confirmValue}>{new Date(`${scheduledDate}T${scheduledTime}:00`).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
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
