"use client";

import { useRouter } from "next/navigation";
import styles from "./role-pick.module.css";

export default function RolePickPage() {
  const router = useRouter();

  return (
    <main id="role-pick-screen" className={styles.rolePickContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <span role="img" aria-hidden="true">👋</span>
        </div>
        <h1 className={styles.headerTitle}>Pilih Peran Anda</h1>
        <p className={styles.headerSubtitle}>
          Masuk sebagai keluarga pasien yang mencari caregiver, atau sebagai caregiver yang siap membantu.
        </p>
      </div>

      {/* Role Cards */}
      <div className={styles.cardsSection}>
        {/* User Card */}
        <button
          className={styles.roleCard}
          onClick={() => router.push("/auth/user/login")}
          id="role-pick-user"
        >
          <div className={`${styles.cardIcon} ${styles.cardIconUser}`}>
            <span role="img" aria-hidden="true">👨‍👩‍👧</span>
          </div>
          <div className={styles.cardText}>
            <span className={styles.cardTitle}>Keluarga Pasien</span>
            <span className={styles.cardDescription}>
              Cari caregiver terpercaya untuk mendampingi orang tua Anda
            </span>
          </div>
          <span className={styles.cardArrow} aria-hidden="true">→</span>
        </button>

        {/* Caregiver Card */}
        <button
          className={styles.roleCard}
          onClick={() => router.push("/auth/caregiver/login")}
          id="role-pick-caregiver"
        >
          <div className={`${styles.cardIcon} ${styles.cardIconCaregiver}`}>
            <span role="img" aria-hidden="true">🩺</span>
          </div>
          <div className={styles.cardText}>
            <span className={styles.cardTitle}>Caregiver</span>
            <span className={styles.cardDescription}>
              Bergabung sebagai caregiver dan mulai membantu keluarga
            </span>
          </div>
          <span className={styles.cardArrow} aria-hidden="true">→</span>
        </button>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Anda bisa mengubah peran ini kapan saja di pengaturan akun
        </p>
      </div>
    </main>
  );
}
