"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandSparkles } from "@fortawesome/free-solid-svg-icons/faHandSparkles";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faUserNurse } from "@fortawesome/free-solid-svg-icons/faUserNurse";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import styles from "./role-pick.module.css";

export default function RolePickPage() {
  // Removed useRouter since we use Link now

  return (
    <main id="role-pick-screen" className={styles.rolePickContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FontAwesomeIcon icon={faHandSparkles} style={{ color: "#FFF" }} />
        </div>
        <h1 className={styles.headerTitle}>Pilih Peran Anda</h1>
        <p className={styles.headerSubtitle}>
          Daftar sebagai keluarga pasien yang mencari caregiver, atau sebagai caregiver yang siap membantu.
        </p>
      </div>

      {/* Role Cards */}
      <div className={styles.cardsSection}>
        {/* User Card */}
        <Link
          href="/auth/user/register"
          className={styles.roleCard}
          id="role-pick-user"
        >
          <div className={`${styles.cardIcon} ${styles.cardIconUser}`}>
            <FontAwesomeIcon icon={faUsers} style={{ color: "var(--color-primary)" }} />
          </div>
          <div className={styles.cardText}>
            <span className={styles.cardTitle}>Keluarga Pasien</span>
            <span className={styles.cardDescription}>
              Cari caregiver terpercaya untuk mendampingi orang tua Anda
            </span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className={styles.cardArrow} />
        </Link>

        {/* Caregiver Card */}
        <Link
          href="/auth/caregiver/register"
          className={styles.roleCard}
          id="role-pick-caregiver"
        >
          <div className={`${styles.cardIcon} ${styles.cardIconCaregiver}`}>
            <FontAwesomeIcon icon={faUserNurse} style={{ color: "#16A34A" }} />
          </div>
          <div className={styles.cardText}>
            <span className={styles.cardTitle}>Caregiver</span>
            <span className={styles.cardDescription}>
              Bergabung sebagai caregiver dan mulai membantu keluarga
            </span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className={styles.cardArrow} />
        </Link>
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
