"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons/faEnvelope";
import { faPhone } from "@fortawesome/free-solid-svg-icons/faPhone";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";
import { faEye } from "@fortawesome/free-solid-svg-icons/faEye";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons/faTriangleExclamation";
import { register, saveAuth } from "@/lib/api";
import styles from "../../auth.module.css";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function UserRegisterPage() {
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
    const ne: FormErrors = {};
    if (!name.trim()) ne.name = "Nama lengkap wajib diisi";
    else if (name.trim().length < 3) ne.name = "Nama minimal 3 karakter";
    if (!email.trim()) ne.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ne.email = "Format email tidak valid";
    if (!phone.trim()) ne.phone = "Nomor telepon wajib diisi";
    else if (!/^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(phone.replace(/[\s-]/g, ""))) ne.phone = "Format nomor telepon tidak valid";
    if (!password) ne.password = "Password wajib diisi";
    else if (password.length < 6) ne.password = "Password minimal 6 karakter";
    if (!confirmPassword) ne.confirmPassword = "Konfirmasi password wajib diisi";
    else if (confirmPassword !== password) ne.confirmPassword = "Password tidak cocok";
    setErrors(ne);
    return Object.keys(ne).length === 0;
  }, [name, email, phone, password, confirmPassword]);

  const clearErr = useCallback((f: keyof FormErrors) => {
    setErrors((p) => ({ ...p, [f]: undefined }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      const data = await register({ name: name.trim(), email: email.trim(), phone: phone.replace(/[\s-]/g, ""), password, role: "user" });
      saveAuth(data);
      router.push("/dashboard");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [name, email, phone, password, validate, router]);

  return (
    <main id="user-register" className={styles.authContainer}>
      <div className={styles.brandBar}>
        <div className={styles.brandBarOrbs} aria-hidden="true" />
        <button className={styles.backButton} onClick={() => router.push("/role-pick")} aria-label="Kembali" id="user-register-back-btn">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <Image src="/icons/kitajaga-logo.png" alt="Kitajaga" width={48} height={48} className={styles.brandLogo} priority />
        <span className={styles.brandTitle}>Kitajaga</span>
      </div>
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Daftar Keluarga</h1>
            <p className={styles.formSubtitle}>Buat akun untuk menemukan caregiver terpercaya bagi orang tua Anda</p>
          </div>
          {apiError && (
            <div className={styles.errorBanner} role="alert">
              <span className={styles.errorIcon}><FontAwesomeIcon icon={faTriangleExclamation} /></span>
              <span className={styles.errorText}>{apiError}</span>
            </div>
          )}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="user-register-name">Nama Lengkap</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true"><FontAwesomeIcon icon={faUser} /></span>
                <input id="user-register-name" type="text" className={`${styles.input} ${errors.name ? styles.inputError : ""}`} placeholder="Masukkan nama lengkap" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) clearErr("name"); }} autoComplete="name" disabled={isLoading} />
              </div>
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="user-register-email">Email</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true"><FontAwesomeIcon icon={faEnvelope} /></span>
                <input id="user-register-email" type="email" className={`${styles.input} ${errors.email ? styles.inputError : ""}`} placeholder="nama@email.com" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) clearErr("email"); }} autoComplete="email" disabled={isLoading} />
              </div>
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="user-register-phone">Nomor Telepon</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true"><FontAwesomeIcon icon={faPhone} /></span>
                <input id="user-register-phone" type="tel" className={`${styles.input} ${errors.phone ? styles.inputError : ""}`} placeholder="081234567890" value={phone} onChange={(e) => { setPhone(e.target.value); if (errors.phone) clearErr("phone"); }} autoComplete="tel" disabled={isLoading} />
              </div>
              {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="user-register-password">Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true"><FontAwesomeIcon icon={faLock} /></span>
                <input id="user-register-password" type={showPassword ? "text" : "password"} className={`${styles.input} ${errors.password ? styles.inputError : ""}`} placeholder="Minimal 6 karakter" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) clearErr("password"); }} autoComplete="new-password" disabled={isLoading} />
                <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="user-register-confirm">Konfirmasi Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true"><FontAwesomeIcon icon={faLock} /></span>
                <input id="user-register-confirm" type={showConfirm ? "text" : "password"} className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`} placeholder="Ketik ulang password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) clearErr("confirmPassword"); }} autoComplete="new-password" disabled={isLoading} />
                <button type="button" className={styles.passwordToggle} onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}>
                  <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
            </div>
            <button type="submit" className={styles.submitButton} disabled={isLoading} id="user-register-submit-btn">
              {isLoading ? (<><span className={styles.spinner} />Memproses...</>) : "Buat Akun"}
            </button>
          </form>
          <p className={styles.footerLink}>Sudah punya akun?{" "}<Link href="/auth/user/login">Masuk di sini</Link></p>
        </div>
      </div>
    </main>
  );
}
