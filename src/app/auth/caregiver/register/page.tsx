"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { register, saveAuth } from "@/lib/api";
import styles from "../../auth.module.css";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function CaregiverRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    } else if (name.trim().length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Format nomor telepon tidak valid";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, phone, password, confirmPassword]);

  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setApiError("");

      if (!validate()) return;

      setIsLoading(true);

      try {
        const data = await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.replace(/[\s-]/g, ""),
          password,
          role: "caregiver",
        });
        saveAuth(data);
        router.push("/caregiver");
      } catch (err) {
        setApiError(
          err instanceof Error
            ? err.message
            : "Registrasi gagal. Silakan coba lagi."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [name, email, phone, password, validate, router]
  );

  return (
    <main id="caregiver-register" className={styles.authContainer}>
      {/* Brand Bar */}
      <div className={styles.brandBar}>
        <div className={styles.brandBarOrbs} aria-hidden="true" />
        <button
          className={styles.backButton}
          onClick={() => router.push("/auth/caregiver/login")}
          aria-label="Kembali ke halaman login"
          id="register-back-btn"
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
            <h1 className={styles.formTitle}>Daftar Caregiver</h1>
            <p className={styles.formSubtitle}>
              Buat akun caregiver dan mulai membantu keluarga yang membutuhkan
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
            {/* Name */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="register-name">
                Nama Lengkap
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  👤
                </span>
                <input
                  id="register-name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) clearFieldError("name");
                  }}
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <span className={styles.fieldError}>{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="register-email">
                Email
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  ✉️
                </span>
                <input
                  id="register-email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) clearFieldError("email");
                  }}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <span className={styles.fieldError}>{errors.email}</span>
              )}
            </div>

            {/* Phone */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="register-phone">
                Nomor Telepon
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  📱
                </span>
                <input
                  id="register-phone"
                  type="tel"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) clearFieldError("phone");
                  }}
                  autoComplete="tel"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <span className={styles.fieldError}>{errors.phone}</span>
              )}
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="register-password">
                Password
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  🔒
                </span>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) clearFieldError("password");
                  }}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="register-confirm">
                Konfirmasi Password
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  🔒
                </span>
                <input
                  id="register-confirm"
                  type={showConfirm ? "text" : "password"}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                  placeholder="Ketik ulang password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) clearFieldError("confirmPassword");
                  }}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.fieldError}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
              id="register-submit-btn"
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  Memproses...
                </>
              ) : (
                "Buat Akun"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className={styles.footerLink}>
            Sudah punya akun?{" "}
            <Link href="/auth/caregiver/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
