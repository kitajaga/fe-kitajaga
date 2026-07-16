"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { login, saveAuth } from "@/lib/api";
import styles from "../../auth.module.css";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function CaregiverLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setApiError("");

      if (!validate()) return;

      setIsLoading(true);

      try {
        const data = await login({ email, password });
        saveAuth(data);
        router.push("/caregiver");
      } catch (err) {
        setApiError(
          err instanceof Error ? err.message : "Login gagal. Silakan coba lagi."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, validate, router]
  );

  return (
    <main id="caregiver-login" className={styles.authContainer}>
      {/* Brand Bar */}
      <div className={styles.brandBar}>
        <div className={styles.brandBarOrbs} aria-hidden="true" />
        <button
          className={styles.backButton}
          onClick={() => router.push("/role-pick")}
          aria-label="Kembali ke pilih peran"
          id="login-back-btn"
        >
          ←
        </button>
        <Image
          src="/icons/kitajaga-logo.png"
          alt="Kitajaga"
          width={48}
          height={48}
          className={styles.brandLogo}
          priority
        />
        <span className={styles.brandTitle}>Kitajaga</span>
      </div>

      {/* Form */}
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Masuk Caregiver</h1>
            <p className={styles.formSubtitle}>
              Masukkan email dan password untuk mulai membantu keluarga
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className={styles.errorBanner} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorText}>{apiError}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="login-email">
                Email
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  ✉️
                </span>
                <input
                  id="login-email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <span className={styles.fieldError}>{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="login-password">
                Password
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  🔒
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <span className={styles.fieldError}>{errors.password}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className={styles.footerLink}>
            Belum punya akun?{" "}
            <Link href="/auth/caregiver/register">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
