"use client";

import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons/faHouse";
import { faUserInjured } from "@fortawesome/free-solid-svg-icons/faUserInjured";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons/faClockRotateLeft";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons/faUserCircle";
import styles from "./user-layout.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", icon: faHouse, label: "Home" },
  { href: "/patients", icon: faUserInjured, label: "Pasien" },
  { href: "/activity", icon: faClockRotateLeft, label: "Aktivitas" },
  { href: "/profile", icon: faUserCircle, label: "Profil" },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>{children}</main>

      {/* ── Bottom Navigation ── */}
      <nav className={styles.bottomNav} aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <button
              key={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              onClick={() => router.push(item.href)}
              id={`user-nav-${item.label.toLowerCase()}`}
            >
              <FontAwesomeIcon icon={item.icon} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
