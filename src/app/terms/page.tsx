import Link from "next/link";
import styles from "./terms.module.css";

export const metadata = {
  title: "Syarat & Ketentuan — Kitajaga",
  description:
    "Syarat dan ketentuan penggunaan platform Kitajaga bagi Keluarga Pasien dan Caregiver.",
};

export default function TermsPage() {
  return (
    <main id="terms-page" className={styles.container}>
      <header className={styles.header}>
        <Link
          href="/role-pick"
          className={styles.backBtn}
          aria-label="Kembali ke halaman pemilihan peran"
          id="terms-back-btn"
          prefetch={false}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 512 512"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
          </svg>
        </Link>
        <h1 className={styles.title}>Syarat &amp; Ketentuan</h1>
      </header>

      <article className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Ketentuan Umum</h2>
          <p className={styles.text}>
            Selamat datang di Kitajaga. Dengan mengakses atau menggunakan platform
            Kitajaga, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini.
            Kitajaga adalah platform yang menghubungkan keluarga yang membutuhkan
            pendampingan lansia dengan tenaga caregiver profesional terverifikasi.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Akun &amp; Verifikasi</h2>
          <p className={styles.text}>
            Pengguna (Keluarga Pasien) dan Caregiver wajib memberikan informasi yang
            akurat dan terkini saat pendaftaran. Setiap akun bersifat pribadi dan
            tidak dapat dipindahtangankan. Caregiver wajib melewati proses verifikasi
            identitas dan kualifikasi sebelum menerima pemesanan.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Pemesanan &amp; Pembatalan</h2>
          <p className={styles.text}>
            Pemesanan layanan pendampingan dilakukan melalui aplikasi dengan rincian
            jadwal, lokasi, dan kebutuhan pasien. Pembatalan pemesanan tunduk pada
            kebijakan pengembalian dana yang berlaku di Kitajaga.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Keamanan &amp; Privasi</h2>
          <p className={styles.text}>
            Kitajaga berkomitmen melindungi data pribadi seluruh pengguna sesuai
            peraturan perlindungan data yang berlaku. Data medis dan kondisi pasien
            hanya digunakan untuk keperluan pendampingan secara aman dan rahasia.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Hubungi Kami</h2>
          <p className={styles.text}>
            Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan
            menghubungi tim bantuan Kitajaga melalui email dukungan resmi kami.
          </p>
        </section>
      </article>

      <footer className={styles.footer}>
        <Link
          href="/role-pick"
          className={styles.agreeBtn}
          id="terms-agree-btn"
          prefetch={false}
        >
          Saya Mengerti
        </Link>
      </footer>
    </main>
  );
}
