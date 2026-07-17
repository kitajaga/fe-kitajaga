"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { createPatient } from "@/lib/api";
import styles from "../patients.module.css";

interface FormErrors {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  patientNote?: string;
  ecName?: string;
  ecPhone?: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [mobilityStatus, setMobilityStatus] = useState("ambulatory");
  const [allergies, setAllergies] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = useCallback((): boolean => {
    const ne: FormErrors = {};
    if (!name.trim()) ne.name = "Nama pasien wajib diisi";
    if (!dateOfBirth) ne.dateOfBirth = "Tanggal lahir wajib diisi";
    if (!gender) ne.gender = "Jenis kelamin wajib dipilih";
    if (!address.trim()) ne.address = "Alamat wajib diisi";
    if (!ecName.trim()) ne.ecName = "Nama kontak darurat wajib diisi";
    if (!ecPhone.trim()) ne.ecPhone = "Telepon kontak darurat wajib diisi";
    setErrors(ne);
    return Object.keys(ne).length === 0;
  }, [name, dateOfBirth, gender, address, ecName, ecPhone]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      let lat = -6.195;
      let lng = 106.832;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (e) {
          console.warn("Geolocation failed, using default coordinates");
        }
      }

      await createPatient({
        name,
        dateOfBirth,
        gender,
        address,
        latitude: lat,
        longitude: lng,
        mobilityStatus,
        allergies: allergies ? allergies.split(",").map(a => a.trim()) : [],
        currentMedications: currentMedications ? currentMedications.split(",").map(m => m.trim()) : [],
        patientNote,
        emergencyContact: {
          name: ecName,
          phone: ecPhone,
        }
      });
      router.push("/patients");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal menyimpan data pasien.");
    } finally {
      setIsLoading(false);
    }
  }, [validate, router, name, dateOfBirth, gender, address, mobilityStatus, allergies, currentMedications, patientNote, ecName, ecPhone]);

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
          <label className={styles.inputLabel} htmlFor="patient-address">Alamat Domisili</label>
          <textarea id="patient-address" className={`${styles.input} ${styles.textarea} ${errors.address ? styles.inputError : ""}`} placeholder="Alamat lengkap" value={address} onChange={(e) => { setAddress(e.target.value); if (errors.address) clearErr("address"); }} disabled={isLoading} />
          {errors.address && <span className={styles.fieldError}>{errors.address}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="patient-mobility">Status Mobilitas</label>
          <select id="patient-mobility" className={`${styles.input} ${styles.select}`} value={mobilityStatus} onChange={(e) => setMobilityStatus(e.target.value)} disabled={isLoading}>
            <option value="ambulatory">Mandiri (Ambulatory)</option>
            <option value="wheelchair">Kursi Roda</option>
            <option value="bedbound">Bedbound / Tidak Bisa Bergerak</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="patient-allergies">Alergi</label>
          <input id="patient-allergies" type="text" className={styles.input} placeholder="Pisahkan dengan koma (contoh: Debu, Udang)" value={allergies} onChange={(e) => setAllergies(e.target.value)} disabled={isLoading} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="patient-medications">Pengobatan Saat Ini</label>
          <input id="patient-medications" type="text" className={styles.input} placeholder="Pisahkan dengan koma (contoh: Metformin 500mg)" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} disabled={isLoading} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="patient-note">Catatan Medis & Kondisi</label>
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
