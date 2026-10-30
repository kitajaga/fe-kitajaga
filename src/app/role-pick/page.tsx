import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faUserNurse } from "@fortawesome/free-solid-svg-icons/faUserNurse";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import styles from "./role-pick.module.css";

export const metadata = {
  title: "Pilih Peran — Kitajaga",
  description: "Pilih peran Anda sebagai Keluarga Pasien atau Caregiver di Kitajaga.",
};

export default function RolePickPage() {
  return (
    <main id="role-pick-screen" className={styles.page}>
      {/* Back button */}
      <Link
        href="/onboarding"
        className={styles.backBtn}
        aria-label="Kembali ke halaman onboarding"
        id="role-pick-back-btn"
      >
        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
      </Link>

      {/* Brand */}
      <div className={styles.brand}>
        <Image
          src="/icons/kitajaga-logo.png"
          alt="Logo Kitajaga"
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
        <section
          className={styles.roleCard}
          id="role-card-user"
          aria-labelledby="role-title-user"
        >
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIconWrap} ${styles.cardIconUser}`} aria-hidden="true">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className={styles.cardInfo}>
              <h2 className={styles.cardTitle} id="role-title-user">
                Keluarga Pasien
              </h2>
              <p className={styles.cardDesc}>
                Pesan caregiver untuk mendampingi orang tua Anda
              </p>
            </div>
          </div>
          <div className={styles.cardActions}>
            <Link
              href="/auth/user/login"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              id="role-pick-user-login"
              aria-label="Masuk sebagai Keluarga Pasien"
            >
              <span>Masuk</span>
              <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
            <Link
              href="/auth/user/register"
              className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              id="role-pick-user-register"
              aria-label="Daftar sebagai Keluarga Pasien"
            >
              Daftar
            </Link>
          </div>
        </section>

        {/* ── Caregiver ── */}
        <section
          className={styles.roleCard}
          id="role-card-caregiver"
          aria-labelledby="role-title-caregiver"
        >
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIconWrap} ${styles.cardIconCaregiver}`} aria-hidden="true">
              <FontAwesomeIcon icon={faUserNurse} />
            </div>
            <div className={styles.cardInfo}>
              <h2 className={styles.cardTitle} id="role-title-caregiver">
                Caregiver
              </h2>
              <p className={styles.cardDesc}>
                Bergabung dan mulai terima pesanan pendampingan
              </p>
            </div>
          </div>
          <div className={styles.cardActions}>
            <Link
              href="/auth/caregiver/login"
              className={`${styles.actionBtn} ${styles.actionBtnGreen}`}
              id="role-pick-caregiver-login"
              aria-label="Masuk sebagai Caregiver"
            >
              <span>Masuk</span>
              <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
            <Link
              href="/auth/caregiver/register"
              className={`${styles.actionBtn} ${styles.actionBtnOutlineGreen}`}
              id="role-pick-caregiver-register"
              aria-label="Daftar sebagai Caregiver"
            >
              Daftar
            </Link>
          </div>
        </section>
      </div>

      <p className={styles.footer}>
        Dengan melanjutkan, Anda menyetujui{" "}
        <Link href="/terms" className={styles.footerLink}>
          Syarat &amp; Ketentuan
        </Link>{" "}
        Kitajaga
      </p>
    </main>
  );
}
