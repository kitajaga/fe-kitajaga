import Link from "next/link";
import Image from "next/image";
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
        prefetch={false}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 512 512"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
        </svg>
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 640 512"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z" />
              </svg>
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
              prefetch={false}
            >
              <span>Masuk</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 512 512"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </svg>
            </Link>
            <Link
              href="/auth/user/register"
              className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              id="role-pick-user-register"
              aria-label="Daftar sebagai Keluarga Pasien"
              prefetch={false}
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
              <svg
                width="22"
                height="24"
                viewBox="0 0 448 512"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M96 44.9c0-12.7 7.5-24.2 19.2-29.3l96-42c8.2-3.6 17.5-3.6 25.7 0l96 42C344.5 20.7 352 32.2 352 44.9l0 99.1c0 70.7-57.3 128-128 128S96 214.7 96 144l0-99.1zM304 128l-111.6 0-.4 0-48 0 0 16c0 44.2 35.8 80 80 80s80-35.8 80-80l0-16zM208 16l0 16-16 0c-4.4 0-8 3.6-8 8l0 16c0 4.4 3.6 8 8 8l16 0 0 16c0 4.4 3.6 8 8 8l16 0c4.4 0 8-3.6 8-8l0-16 16 0c4.4 0 8-3.6 8-8l0-16c0-4.4-3.6-8-8-8l-16 0 0-16c0-4.4-3.6-8-8-8L216 8c-4.4 0-8 3.6-8 8zM142.6 323c-6.5-4.9-15.2-6.2-22.6-2.8-61.4 28.2-104.1 90.2-104.1 162.1 0 16.4 13.3 29.7 29.7 29.7l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-72-42.7-134-104.1-162.1-7.4-3.4-16.1-2.1-22.6 2.8l-67 50.2c-8.5 6.4-20.3 6.4-28.8 0l-67-50.2z" />
              </svg>
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
              prefetch={false}
            >
              <span>Masuk</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 512 512"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </svg>
            </Link>
            <Link
              href="/auth/caregiver/register"
              className={`${styles.actionBtn} ${styles.actionBtnOutlineGreen}`}
              id="role-pick-caregiver-register"
              aria-label="Daftar sebagai Caregiver"
              prefetch={false}
            >
              Daftar
            </Link>
          </div>
        </section>
      </div>

      <p className={styles.footer}>
        Dengan melanjutkan, Anda menyetujui{" "}
        <Link href="/terms" className={styles.footerLink} prefetch={false}>
          Syarat &amp; Ketentuan
        </Link>{" "}
        Kitajaga
      </p>
    </main>
  );
}
