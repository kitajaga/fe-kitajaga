"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { faUserInjured } from "@fortawesome/free-solid-svg-icons/faUserInjured";
import { faHeart } from "@fortawesome/free-solid-svg-icons/faHeart";
import { faNotesMedical } from "@fortawesome/free-solid-svg-icons/faNotesMedical";
import { faPhone } from "@fortawesome/free-solid-svg-icons/faPhone";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons/faLocationDot";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons/faCalendarPlus";
import { getPatientById } from "@/lib/mockData";
import styles from "../patients.module.css";

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

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

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = getPatientById(id);

  if (!patient) {
    return (
      <>
        <div className={styles.pageHeader}>
          <button className={styles.backButton} onClick={() => router.push("/patients")} aria-label="Kembali">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className={styles.pageTitle}>Pasien Tidak Ditemukan</h1>
        </div>
      </>
    );
  }

  const age = calculateAge(patient.dateOfBirth);

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={() => router.push("/patients")} aria-label="Kembali" id="patient-detail-back">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.pageTitle}>Detail Pasien</h1>
      </div>

      <div className={styles.detailContainer}>
        {/* ── Profile Header ── */}
        <div className={styles.profileHeader}>
          <div className={`${styles.profileAvatar} ${patient.gender === "male" ? styles.cardAvatarMale : styles.cardAvatarFemale}`}>
            <FontAwesomeIcon icon={faUserInjured} />
          </div>
          <h2 className={styles.profileName}>{patient.name}</h2>
          <span className={styles.profileAge}>{age} tahun · {patient.gender === "male" ? "Laki-laki" : "Perempuan"}</span>
          <span className={`${styles.cardRisk} ${getRiskClass(patient.riskLevel)}`}>
            {getRiskLabel(patient.riskLevel)}
          </span>
        </div>

        {/* ── Biodata ── */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faUserInjured} /></span>
            Biodata
          </h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tanggal Lahir</span>
            <span className={styles.infoValue}>{new Date(patient.dateOfBirth).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Mobilitas</span>
            <span className={styles.infoValue}>{patient.mobility}</span>
          </div>
        </div>

        {/* ── Alamat ── */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faLocationDot} /></span>
            Alamat
          </h3>
          <p className={styles.noteText}>{patient.address}</p>
        </div>

        {/* ── Medis ── */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faHeart} /></span>
            Informasi Medis
          </h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Alergi</span>
            <div className={styles.tagList}>
              {patient.allergies.length > 0
                ? patient.allergies.map((a) => <span key={a} className={`${styles.tag} ${styles.tagAlert}`}>{a}</span>)
                : <span className={styles.infoValue}>Tidak ada</span>}
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Obat-obatan</span>
            <div className={styles.tagList}>
              {patient.medications.map((m) => <span key={m} className={styles.tag}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* ── Catatan ── */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faNotesMedical} /></span>
            Catatan Medis
          </h3>
          <p className={styles.noteText}>{patient.patientNote}</p>
        </div>

        {/* ── Emergency Contact ── */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <span className={styles.infoCardTitleIcon}><FontAwesomeIcon icon={faPhone} /></span>
            Kontak Darurat
          </h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nama</span>
            <span className={styles.infoValue}>{patient.emergencyContact.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Telepon</span>
            <span className={styles.infoValue}>{patient.emergencyContact.phone}</span>
          </div>
        </div>

        {/* ── Book Now ── */}
        <button
          className={styles.bookNowButton}
          onClick={() => router.push(`/bookings/new?patientId=${patient.id}`)}
          id="patient-detail-book-btn"
        >
          <FontAwesomeIcon icon={faCalendarPlus} />
          Pesan Caregiver untuk {patient.name}
        </button>
      </div>
    </>
  );
}
