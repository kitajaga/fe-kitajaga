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
  try {
    return await apiFetch<AuthData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true") {
      throw error;
    }
    console.warn("API Error, using mock register:", error);
    return {
      id: "mock-new-user",
      name: payload.name,
      role: payload.role,
      token: "mock-jwt-token-12345",
    };
  }
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  try {
    return await apiFetch<AuthData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true") {
      throw error;
    }
    console.warn("API Error, using mock login:", error);
    const isCaregiver = payload.email.includes("caregiver");
    return {
      id: isCaregiver ? "cg-001" : "usr-001",
      name: isCaregiver ? "Suster Rina" : "Budi Santoso",
      role: isCaregiver ? "caregiver" : "user",
      token: "mock-jwt-token-12345",
    };
  }
}
export async function getBookingDetail(id: string) {
  const token = localStorage.getItem("token");
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
  const token = localStorage.getItem("token");
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

export async function getBookingProgress(id: string) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  
  const res = await fetch(`${BASE_URL}/bookings/${id}/progress`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch progress");
  }
  return json.data;
}

export async function submitReport(id: string, reportData: { notes: string; conditionSummary: string }) {
  const token = localStorage.getItem("token");
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

// ── Generic Data Fetchers (Replacing Mock Data) ──
import type { MockUser, MockPatient, MockBooking, MockCaregiver } from "./mockData";

export async function fetchProfile(): Promise<MockUser> {
  return await apiFetch<MockUser>("/users/profile");
}

export async function fetchCaregiverProfile(): Promise<any> {
  return await apiFetch<any>("/caregivers/me");
}

export async function fetchPatients(): Promise<MockPatient[]> {
  return await apiFetch<MockPatient[]>("/patients");
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

export async function createPatient(payload: CreatePatientPayload): Promise<MockPatient> {
  return await apiFetch<MockPatient>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchPatientById(id: string): Promise<MockPatient> {
  return await apiFetch<MockPatient>(`/patients/${id}`);
}

export async function fetchBookings(): Promise<MockBooking[]> {
  return await apiFetch<MockBooking[]>("/bookings");
}

export async function fetchCaregivers(): Promise<MockCaregiver[]> {
  return await apiFetch<MockCaregiver[]>("/caregivers");
}

export interface CreateBookingPayload {
  patientId: string;
  bookingType: "immediate" | "scheduled";
  scheduledAt?: string;
  facilityName: string;
  facilityAddress: string;
}

export async function createBooking(payload: CreateBookingPayload): Promise<MockBooking> {
  return await apiFetch<MockBooking>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
