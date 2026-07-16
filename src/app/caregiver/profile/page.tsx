"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHouse, 
  faCalendarDays, 
  faComments, 
  faUserCircle, 
  faChevronRight, 
  faStar, 
  faShieldHalved,
  faCircleQuestion,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import { logout } from "@/lib/api"; // Note: Might need to implement logout in api.ts
import styles from "./profile.module.css";

export default function CaregiverProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    // Assuming simple local storage clear
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/role-pick");
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Profil</h1>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        
        {/* Profile Card */}
        <section className={styles.profileCard}>
          <div className={styles.avatarLarge}>
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
          <h2 className={styles.name}>Suster Rina</h2>
          <p className={styles.email}>rina.caregiver@example.com</p>
          
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
              <span className={styles.statValue}>4.9</span>
              <span className={styles.statLabel}>Rating</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>128</span>
              <span className={styles.statLabel}>Pesanan Selesai</span>
            </div>
          </div>
        </section>

        {/* Menu Options */}
        <section className={styles.menuSection}>
          <button className={styles.menuItem}>
            <div className={styles.menuIconWrapper}>
              <FontAwesomeIcon icon={faUserCircle} className={styles.menuIcon} />
            </div>
            <span className={styles.menuLabel}>Edit Profil</span>
            <FontAwesomeIcon icon={faChevronRight} className={styles.chevron} />
          </button>
          
          <button className={styles.menuItem}>
            <div className={styles.menuIconWrapper}>
              <FontAwesomeIcon icon={faShieldHalved} className={styles.menuIcon} />
            </div>
            <span className={styles.menuLabel}>Keamanan &amp; Kata Sandi</span>
            <FontAwesomeIcon icon={faChevronRight} className={styles.chevron} />
          </button>
          
          <button className={styles.menuItem}>
            <div className={styles.menuIconWrapper}>
              <FontAwesomeIcon icon={faCircleQuestion} className={styles.menuIcon} />
            </div>
            <span className={styles.menuLabel}>Bantuan &amp; FAQ</span>
            <FontAwesomeIcon icon={faChevronRight} className={styles.chevron} />
          </button>
        </section>

        {/* Logout */}
        <section className={styles.logoutSection}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            Keluar Akun
          </button>
        </section>

      </main>

      {/* Bottom Nav */}
      <nav className={styles.bottomNav}>
        <button className={styles.navItem} onClick={() => router.push("/caregiver")}>
          <FontAwesomeIcon icon={faHouse} className={styles.navIcon} />
          <span className={styles.navLabel}>Home</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push("/caregiver/schedule")}>
          <FontAwesomeIcon icon={faCalendarDays} className={styles.navIcon} />
          <span className={styles.navLabel}>Jadwal</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push("/caregiver/chat")}>
          <FontAwesomeIcon icon={faComments} className={styles.navIcon} />
          <span className={styles.navLabel}>Chat</span>
        </button>
        <button className={`${styles.navItem} ${styles.navItemActive}`}>
          <FontAwesomeIcon icon={faUserCircle} className={styles.navIcon} />
          <span className={styles.navLabel}>Profil</span>
        </button>
      </nav>
    </div>
  );
}
