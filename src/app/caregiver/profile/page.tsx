"use client";

import { useState, useEffect } from "react";
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
import { clearAuth, fetchCaregiverProfile, fetchBookings } from "@/lib/api";
import styles from "./profile.module.css";

export default function CaregiverProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, bookingsData] = await Promise.all([
          fetchCaregiverProfile().catch(() => null),
          fetchBookings().catch(() => [])
        ]);
        
        if (profileData) {
          setProfile(profileData);
        }
        
        if (bookingsData) {
          setCompletedCount(bookingsData.filter((b: any) => b.status === "completed" || b.status === "reported").length);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleLogout = () => {
    clearAuth();
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
          <h2 className={styles.name}>{loading ? "Memuat..." : (profile?.name || "Suster")}</h2>
          <p className={styles.email}>{loading ? "-" : (profile?.email || "caregiver@kitajaga.com")}</p>
          
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
              <span className={styles.statValue}>4.9</span>
              <span className={styles.statLabel}>Rating</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>{loading ? "-" : completedCount}</span>
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
