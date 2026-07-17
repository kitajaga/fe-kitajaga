/**
 * Kitajaga API Helper
 * Base configuration and fetch utility for backend API calls.
 */

const DEFAULT_API_BASE = "http://localhost:4000/api";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE;
}

export function getSocketBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || "/api";

  if (typeof window !== "undefined" && !configured.startsWith("http")) {
    return window.location.origin;
  }

  if (configured.startsWith("http")) {
    return configured.replace(/\/api(?:\/v1)?\/?$/, "");
  }

  return "https://be-kitajaga-production.up.railway.app";
}

const BASE_URL = getApiBaseUrl();

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

  let json;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    json = await res.json();
  } else {
    // If not JSON, it might be a 404 HTML page or something else
    const text = await res.text();
    throw new Error(`API returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
  }

  if (!res.ok || json.success === false) {
    console.error("API Error Response:", json);
    const errorMessage =
      json.message || `Request failed with status ${res.status}`;
    // Attach original json as well if possible, or just log it
    throw new Error(errorMessage);
  }

  return json.data as T;
}

// ── Auth API ──

export async function register(
  payload: RegisterPayload
): Promise<AuthData> {
  return await apiFetch<AuthData>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  return await apiFetch<AuthData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export async function getBookingDetail(id: string) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch booking detail");
  }
  return json.data;
}

export async function updateBookingProgress(id: string, progressData: Record<string, unknown>) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  
  const res = await fetch(`${BASE_URL}/bookings/${id}/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(progressData)
  });
  
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update progress");
  }
  return json.data;
}

export interface BookingProgressEntry {
  status: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string | null;
  note?: string | null;
  createdAt?: string;
}

export interface BookingProgressData {
  latest: BookingProgressEntry | null;
  history: BookingProgressEntry[];
}

/** Checkpoints that require photoUrl per backend contract */
export const PHOTO_REQUIRED_STATUSES = [
  "picked_up_patient",
  "arrived_registration",
  "in_consultation",
  "completed",
] as const;

export function normalizeProgressData(data: unknown): BookingProgressData {
  if (Array.isArray(data)) {
    return { latest: data[data.length - 1] ?? null, history: data };
  }
  if (data && typeof data === "object" && "history" in data) {
    const obj = data as BookingProgressData;
    return {
      latest: obj.latest ?? obj.history[obj.history.length - 1] ?? null,
      history: Array.isArray(obj.history) ? obj.history : [],
    };
  }
  return { latest: null, history: [] };
}

export async function getBookingProgress(id: string): Promise<BookingProgressData> {
  const data = await apiFetch<unknown>(`/bookings/${id}/progress`);
  return normalizeProgressData(data);
}

export async function submitReport(id: string, reportData: { notes: string; conditionSummary: string }) {
  const token = getToken();
  if (!token) throw new Error("No token found");

  const res = await fetch(`${BASE_URL}/bookings/${id}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(reportData)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to submit report");
  }
  return json.data;
}

// ── Generic Data Fetchers ──

export async function fetchProfile(): Promise<any> {
  return await apiFetch<any>("/users/me-user");
}

export async function fetchCaregiverProfile(): Promise<any> {
  return await apiFetch<any>("/caregivers/me");
}

export async function fetchPatients(): Promise<any> {
  return await apiFetch<any>("/patients");
}

export interface CreatePatientPayload {
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  latitude: number;
  longitude: number;
  mobilityStatus?: string;
  allergies?: string[];
  currentMedications?: string[];
  patientNote: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

export async function createPatient(payload: CreatePatientPayload): Promise<any> {
  return await apiFetch<any>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchPatientById(id: string): Promise<any> {
  return await apiFetch<any>(`/patients/${id}`);
}

export async function deletePatient(id: string): Promise<any> {
  return await apiFetch<any>(`/patients/${id}`, {
    method: "DELETE",
  });
}

export async function fetchBookings(): Promise<any[]> {
  return await apiFetch<any[]>("/bookings");
}

export async function fetchCaregivers(): Promise<any[]> {
  return await apiFetch<any[]>("/caregivers");
}

export interface CreateBookingPayload {
  patientId: string;
  bookingType: "immediate" | "scheduled";
  scheduledAt?: string;
  facilityName: string;
  facilityAddress: string;
  facilityLatitude: number;
  facilityLongitude: number;
}

export async function createBooking(payload: CreateBookingPayload): Promise<any> {
  return await apiFetch<any>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Caregiver Status Toggle ──

export async function updateCaregiverStatus(status: "online" | "offline"): Promise<any> {
  return await apiFetch<any>("/caregivers/me/status", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ── Caregiver Location Update ──

export async function updateCaregiverLocation(latitude: number, longitude: number): Promise<any> {
  return await apiFetch<any>("/caregivers/me/location", {
    method: "PATCH",
    body: JSON.stringify({ latitude, longitude }),
  });
}

// ── Payments ──

export async function chargePayment(bookingId: string): Promise<any> {
  return await apiFetch<any>("/payments/charge", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function mockSettlePayment(bookingId: string): Promise<any> {
  return await apiFetch<any>("/payments/mock-settle", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function fetchPaymentStatus(bookingId: string): Promise<any> {
  return await apiFetch<any>(`/payments/${bookingId}/status`);
}

// ── Guidebook API ──

export interface GuidebookData {
  id: string;
  quickSummary: string;
  do: string[];
  dont: string[];
  warningSigns: string[];
  emergencyContact: { name: string; phone: string };
  acknowledgedByCaregiver: boolean;
}

export async function fetchGuidebook(bookingId: string): Promise<GuidebookData> {
  return await apiFetch<GuidebookData>(`/guidebooks/${bookingId}`);
}

export async function acknowledgeGuidebook(guidebookId: string): Promise<any> {
  return await apiFetch<any>(`/guidebooks/${guidebookId}/acknowledge`, {
    method: "POST",
    body: JSON.stringify({ acknowledged: true }),
  });
}

// ── Accept / Cancel / Rate Booking ──

export async function acceptBooking(bookingId: string): Promise<any> {
  return await apiFetch<any>(`/bookings/${bookingId}/accept`, {
    method: "POST",
  });
}

export async function cancelBooking(bookingId: string): Promise<any> {
  return await apiFetch<any>(`/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}

export async function rescheduleBooking(bookingId: string, reason: string): Promise<any> {
  return await apiFetch<any>(`/bookings/${bookingId}/reschedule`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function rateBooking(bookingId: string, rating: number, review?: string): Promise<any> {
  return await apiFetch<any>(`/bookings/${bookingId}/rate`, {
    method: "POST",
    body: JSON.stringify({ rating, review }),
  });
}

// ── Chat API ──

export async function fetchChatHistory(bookingId: string): Promise<any[]> {
  return await apiFetch<any[]>(`/bookings/${bookingId}/chats`);
}

// ── User Profile ──



export async function updateUserProfile(data: { name?: string; phone?: string; photoUrl?: string }): Promise<any> {
  return await apiFetch<any>("/users/me-user", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCaregiverProfile(data: { name?: string; phone?: string; photoUrl?: string }): Promise<any> {
  return await apiFetch<any>("/users/me-caregiver", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Payment API ──

export async function requestPayment(bookingId: string): Promise<any> {
  return await apiFetch<any>("/payments/charge", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function getPaymentStatus(bookingId: string): Promise<any> {
  return await apiFetch<any>(`/payments/${bookingId}/status`);
}

