/**
 * Kitajaga API Helper
 * Base configuration and fetch utility for backend API calls.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ── Types ──

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

export interface AuthData {
  id: string;
  name?: string;
  role: "user" | "caregiver";
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user" | "caregiver";
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── Token Management ──

const TOKEN_KEY = "kitajaga_token";
const USER_KEY = "kitajaga_user";

export function saveAuth(data: AuthData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthData;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── API Fetch Utility ──

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    const errorMessage =
      json.message || `Request failed with status ${res.status}`;
    throw new Error(errorMessage);
  }

  return json.data as T;
}

// ── Auth API ──

export async function register(
  payload: RegisterPayload
): Promise<AuthData> {
  return apiFetch<AuthData>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  return apiFetch<AuthData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
