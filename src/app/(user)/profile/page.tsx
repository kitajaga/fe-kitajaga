"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons/faUserCircle";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons/faCircleQuestion";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons/faSignOutAlt";
import { faFileLines } from "@fortawesome/free-solid-svg-icons/faFileLines";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { clearAuth, fetchProfile } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, loading } = useApi(fetchProfile);

  const handleLogout = () => {
    clearAuth();
    router.push("/role-pick");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--color-primary)" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profil</h1>
      </div>

      {/* ── Profile Card ── */}
      <div className={styles.profileCard}>
        <div className={styles.avatarContainer}>
          <FontAwesomeIcon icon={faUserCircle} />
        </div>
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>{user?.name || "Pengguna"}</h2>
          <p className={styles.userEmail}>{user?.email || "-"}</p>
          <p className={styles.userPhone}>{user?.phone || "-"}</p>
        </div>
      </div>

      {/* ── Menu List ── */}
      <div className={styles.menuList}>
        <button className={styles.menuItem}>
          <div className={styles.menuIcon}>
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
          <span className={styles.menuText}>Ubah Profil</span>
          <FontAwesomeIcon icon={faChevronRight} className={styles.menuChevron} />
        </button>

        <button className={styles.menuItem}>
          <div className={styles.menuIcon}>
            <FontAwesomeIcon icon={faCog} />
          </div>
          <span className={styles.menuText}>Pengaturan</span>
          <FontAwesomeIcon icon={faChevronRight} className={styles.menuChevron} />
        </button>

        <button className={styles.menuItem}>
          <div className={styles.menuIcon}>
            <FontAwesomeIcon icon={faFileLines} />
          </div>
          <span className={styles.menuText}>Syarat & Ketentuan</span>
          <FontAwesomeIcon icon={faChevronRight} className={styles.menuChevron} />
        </button>

        <button className={styles.menuItem}>
          <div className={styles.menuIcon}>
            <FontAwesomeIcon icon={faCircleQuestion} />
          </div>
          <span className={styles.menuText}>Pusat Bantuan</span>
          <FontAwesomeIcon icon={faChevronRight} className={styles.menuChevron} />
        </button>
      </div>

      {/* ── Logout Button ── */}
      <div className={styles.menuList}>
        <button className={`${styles.menuItem} ${styles.logoutButton}`} onClick={handleLogout} id="logout-btn">
          <div className={styles.menuIcon}>
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div>
          <span className={styles.menuText}>Keluar</span>
        </button>
      </div>

      <div className={styles.versionText}>
        Kitajaga v1.0.0
      </div>
    </div>
  );
}
