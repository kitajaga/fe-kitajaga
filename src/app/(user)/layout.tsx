"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons/faHouse";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faComments } from "@fortawesome/free-solid-svg-icons/faComments";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons/faUserCircle";
import { getUser } from "@/lib/api";
import styles from "./user-layout.module.css";

const NAV_ITEMS = [
  { icon: faHouse, label: "Beranda", href: "/dashboard", id: "nav-home" },
  { icon: faCalendarDays, label: "Jadwal", href: "/schedule", id: "nav-schedule" },
  { icon: faPlus, label: "Pesan", href: "/bookings/new", id: "nav-add", isCenter: true },
  { icon: faComments, label: "Chat", href: "/chat", id: "nav-chat" },
  { icon: faUserCircle, label: "Profil", href: "/profile", id: "nav-profile" },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user || !user.token) {
      router.replace("/auth/user/login");
      return;
    }
    if (user.role !== "user") {
      // Caregiver trying to access user routes — redirect them home
      router.replace("/caregiver");
    }
  }, [router]);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>{children}</main>

      {/* ── Bottom Navigation ── */}
      <nav className={styles.bottomNav} aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          if (item.isCenter) {
            return (
              <button
                key={item.href}
                className={styles.centerNavBtn}
                onClick={() => router.push(item.href)}
                id={item.id}
                aria-label={item.label}
              >
                <div className={styles.centerIconWrapper}>
                  <FontAwesomeIcon icon={item.icon} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              onClick={() => router.push(item.href)}
              id={item.id}
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
