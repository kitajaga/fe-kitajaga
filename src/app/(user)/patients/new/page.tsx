"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import styles from "../patients.module.css";

interface FormErrors {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  patientNote?: string;
  ecName?: string;
  ecPhone?: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = useCallback((): boolean => {
    const ne: FormErrors = {};
    if (!name.trim()) ne.name = "Nama pasien wajib diisi";
    if (!dateOfBirth) ne.dateOfBirth = "Tanggal lahir wajib diisi";
    if (!gender) ne.gender = "Jenis kelamin wajib dipilih";
    if (!ecName.trim()) ne.ecName = "Nama kontak darurat wajib diisi";
    if (!ecPhone.trim()) ne.ecPhone = "Telepon kontak darurat wajib diisi";
    setErrors(ne);
    return Object.keys(ne).length === 0;
  }, [name, dateOfBirth, gender, ecName, ecPhone]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    // Simulated API call — POST /patients
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    router.push("/patients");
  }, [validate, router]);

  const clearErr = useCallback((f: keyof FormErrors) => {
    setErrors((p) => ({ ...p, [f]: undefined }));
  }, []);

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={() => router.push("/patients")} aria-label="Kembali" id="new-patient-back">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className={styles.pageTitle}>Tambah Pasien</h1>
      </div>

      <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>
        {/* ── Data Pasien ── */}
        <span className={styles.formSectionLabel}>Data Pasien</span>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="patient-name">Nama Lengkap</label>
          <input id="patient-name" type="text" className={`${styles.input} ${errors.name ? styles.inputError : ""}`} placeholder="Nama pasien" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) clearErr("name"); }} disabled={isLoading} />
          {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="patient-dob">Tanggal Lahir</label>
          <input id="patient-dob" type="date" className={`${styles.input} ${errors.dateOfBirth ? styles.inputError : ""}`} value={dateOfBirth} onChange={(e) => { setDateOfBirth(e.target.value); if (errors.dateOfBirth) clearErr("dateOfBirth"); }} disabled={isLoading} />
          {errors.dateOfBirth && <span className={styles.fieldError}>{errors.dateOfBirth}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="patient-gender">Jenis Kelamin</label>
          <select id="patient-gender" className={`${styles.input} ${styles.select} ${errors.gender ? styles.inputError : ""}`} value={gender} onChange={(e) => { setGender(e.target.value); if (errors.gender) clearErr("gender"); }} disabled={isLoading}>
            <option value="">Pilih jenis kelamin</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
          {errors.gender && <span className={styles.fieldError}>{errors.gender}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="patient-note">Catatan Medis</label>
          <textarea id="patient-note" className={`${styles.input} ${styles.textarea}`} placeholder="Kondisi medis, kebiasaan, dll." value={patientNote} onChange={(e) => setPatientNote(e.target.value)} disabled={isLoading} />
        </div>

        <div className={styles.formDivider} />

        {/* ── Kontak Darurat ── */}
        <span className={styles.formSectionLabel}>Kontak Darurat</span>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="ec-name">Nama</label>
          <input id="ec-name" type="text" className={`${styles.input} ${errors.ecName ? styles.inputError : ""}`} placeholder="Nama kontak darurat" value={ecName} onChange={(e) => { setEcName(e.target.value); if (errors.ecName) clearErr("ecName"); }} disabled={isLoading} />
          {errors.ecName && <span className={styles.fieldError}>{errors.ecName}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="ec-phone">Nomor Telepon</label>
          <input id="ec-phone" type="tel" className={`${styles.input} ${errors.ecPhone ? styles.inputError : ""}`} placeholder="081234567890" value={ecPhone} onChange={(e) => { setEcPhone(e.target.value); if (errors.ecPhone) clearErr("ecPhone"); }} disabled={isLoading} />
          {errors.ecPhone && <span className={styles.fieldError}>{errors.ecPhone}</span>}
        </div>

        <button type="submit" className={styles.submitButton} disabled={isLoading} id="new-patient-submit">
          {isLoading ? (<><span className={styles.spinner} />Menyimpan...</>) : "Simpan Pasien"}
        </button>
      </form>
    </>
  );
}
