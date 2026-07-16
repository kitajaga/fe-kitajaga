"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faUserNurse } from "@fortawesome/free-solid-svg-icons/faUserNurse";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import styles from "./role-pick.module.css";

export default function RolePickPage() {
  const router = useRouter();

  return (
    <main id="role-pick-screen" className={styles.page}>
      {/* Back button */}
      <button
        className={styles.backBtn}
        onClick={() => router.push("/onboarding")}
        aria-label="Kembali ke onboarding"
        id="role-pick-back-btn"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      {/* Brand */}
      <div className={styles.brand}>
        <Image
          src="/icons/kitajaga-logo.png"
          alt="Kitajaga"
          width={52}
          height={52}
          className={styles.logo}
          priority
        />
        <span className={styles.brandName}>Kitajaga</span>
      </div>

      {/* Heading */}
      <div className={styles.heading}>
        <h1 className={styles.title}>Siapa Anda?</h1>
        <p className={styles.subtitle}>
          Pilih peran Anda untuk melanjutkan ke aplikasi
        </p>
      </div>

      {/* Role Cards */}
      <div className={styles.cards}>
        {/* ── User / Keluarga Pasien ── */}
        <div className={styles.roleCard} id="role-card-user">
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIconWrap} ${styles.cardIconUser}`}>
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.cardTitle}>Keluarga Pasien</span>
              <span className={styles.cardDesc}>
                Pesan caregiver untuk mendampingi orang tua Anda
              </span>
            </div>
          </div>
          <div className={styles.cardActions}>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={() => router.push("/auth/user/login")}
              id="role-pick-user-login"
            >
              Masuk <FontAwesomeIcon icon={faArrowRight} />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              onClick={() => router.push("/auth/user/register")}
              id="role-pick-user-register"
            >
              Daftar
            </button>
          </div>
        </div>

        {/* ── Caregiver ── */}
        <div className={styles.roleCard} id="role-card-caregiver">
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIconWrap} ${styles.cardIconCaregiver}`}>
              <FontAwesomeIcon icon={faUserNurse} />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.cardTitle}>Caregiver</span>
              <span className={styles.cardDesc}>
                Bergabung dan mulai terima pesanan pendampingan
              </span>
            </div>
          </div>
          <div className={styles.cardActions}>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnGreen}`}
              onClick={() => router.push("/auth/caregiver/login")}
              id="role-pick-caregiver-login"
            >
              Masuk <FontAwesomeIcon icon={faArrowRight} />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnOutlineGreen}`}
              onClick={() => router.push("/auth/caregiver/register")}
              id="role-pick-caregiver-register"
            >
              Daftar
            </button>
          </div>
        </div>
      </div>

      <p className={styles.footer}>
        Dengan melanjutkan, Anda menyetujui{" "}
        <span className={styles.footerLink}>Syarat &amp; Ketentuan</span> Kitajaga
      </p>
    </main>
  );
}
