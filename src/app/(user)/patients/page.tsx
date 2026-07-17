"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faUserInjured } from "@fortawesome/free-solid-svg-icons/faUserInjured";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { useApi } from "@/hooks/useApi";
import { fetchPatients } from "@/lib/api";

import styles from "./patients.module.css";

function getRiskClass(risk: string) {
  switch (risk) {
    case "low": return styles.riskLow;
    case "medium": return styles.riskMedium;
    case "high": return styles.riskHigh;
    default: return styles.riskLow;
  }
}

function getRiskLabel(risk: string) {
  switch (risk) {
    case "low": return "Risiko Rendah";
    case "medium": return "Risiko Sedang";
    case "high": return "Risiko Tinggi";
    default: return risk;
  }
}

export default function PatientsListPage() {
  const router = useRouter();
  const { data: patients, loading } = useApi(fetchPatients);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--color-primary)" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={() => router.push("/dashboard")} aria-label="Kembali" id="patients-back-btn">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.pageTitle}>Daftar Pasien</h1>
      </div>

      {/* ── List ── */}
      <div className={styles.listContainer}>
        {patients && patients.length > 0 ? (
          patients.map((patient: any) => (
            <button
              key={patient.id}
              className={styles.patientCard}
              onClick={() => router.push(`/patients/${patient.id}`)}
              id={`patient-card-${patient.id}`}
            >
              <div className={`${styles.cardAvatar} ${patient.gender === "male" ? styles.cardAvatarMale : styles.cardAvatarFemale}`}>
                <FontAwesomeIcon icon={faUserInjured} />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardName}>{patient.name}</span>
                <span className={styles.cardSub}>{patient.address}</span>
                <span className={`${styles.cardRisk} ${getRiskClass(patient.riskLevel)}`}>
                  {getRiskLabel(patient.riskLevel)}
                </span>
              </div>
              <FontAwesomeIcon icon={faChevronRight} className={styles.cardArrow} />
            </button>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FontAwesomeIcon icon={faUserInjured} />
            </div>
            <span className={styles.emptyTitle}>Belum Ada Pasien</span>
            <p className={styles.emptyText}>Silakan tambahkan data pasien terlebih dahulu untuk mulai memesan layanan caregiver.</p>
            <button className={styles.addButton} onClick={() => router.push("/patients/new")} aria-label="Tambah Pasien" id="patients-add-btn">
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "6px" }} /> Tambah Pasien
        </button>
          </div>
          
        )}
      </div>
    </>
  );
}
