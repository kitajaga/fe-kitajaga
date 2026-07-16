/**
 * Kitajaga Mock Data
 * Simulated backend data following PRD & API Contract specs.
 * Used for frontend development before backend integration.
 */

// ── Types ──

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "caregiver";
}

export interface MockPatient {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  address: string;
  latitude: number;
  longitude: number;
  allergies: string[];
  medications: string[];
  mobility: string;
  patientNote: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  riskLevel: "low" | "medium" | "high";
}

export interface MockCaregiver {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalReviews: number;
  photoUrl: string;
  online: boolean;
  latitude: number;
  longitude: number;
  workingRadiusKm: number;
  specializations: string[];
}

export type BookingStatus =
  | "pending_matching"
  | "matched"
  | "paid"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "reported"
  | "rescheduling"
  | "reschedule_failed"
  | "payment_failed";

export type ProgressStatus =
  | "heading_to_patient"
  | "picked_up_patient"
  | "heading_to_facility"
  | "arrived_registration"
  | "waiting_in_queue"
  | "in_consultation"
  | "heading_back"
  | "completed";

export interface MockBooking {
  id: string;
  patientId: string;
  caregiverId: string | null;
  bookingType: "immediate" | "scheduled";
  status: BookingStatus;
  scheduledAt: string | null;
  facilityName: string;
  facilityAddress: string;
  facilityLatitude: number;
  facilityLongitude: number;
  guidebookId: string | null;
  payment: {
    status: "pending" | "held" | "released" | "failed";
    amount: number;
    paidAt: string | null;
  };
  createdAt: string;
}

export interface MockProgress {
  id: string;
  bookingId: string;
  status: ProgressStatus;
  latitude: number;
  longitude: number;
  note: string;
  createdAt: string;
}

export interface MockGuidebook {
  id: string;
  bookingId: string;
  quickSummary: string;
  do: string[];
  dont: string[];
  warningSigns: string[];
  emergencyContact: { name: string; phone: string };
  acknowledgedByCaregiver: boolean;
  acknowledgedAt: string | null;
}

export interface MockReport {
  id: string;
  bookingId: string;
  notes: string;
  conditionSummary: string;
  createdAt: string;
}

export interface MockRating {
  bookingId: string;
  rating: number;
  review: string;
}

export interface MockChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: "user" | "caregiver" | "system";
  message: string;
  sentAt: string;
  type: "text" | "progress_update";
}

// ── Seed Data ──

export const MOCK_USER: MockUser = {
  id: "usr-001",
  name: "Zaki Ibrahim",
  email: "zaki@mail.com",
  phone: "081234567890",
  role: "user",
};

export const MOCK_PATIENTS: MockPatient[] = [
  {
    id: "pat-001",
    userId: "usr-001",
    name: "Budi Santoso",
    dateOfBirth: "1958-03-12",
    gender: "male",
    address: "Jl. Menteng Raya No.10, Jakarta Pusat",
    latitude: -6.195,
    longitude: 106.832,
    allergies: ["Penisilin", "Sulfa"],
    medications: ["Metformin 500mg", "Amlodipine 5mg"],
    mobility: "Bisa berjalan dengan bantuan tongkat",
    patientNote: "Mengidap diabetes tipe 2, hipertensi, sering lupa minum obat sore. Perlu diingatkan minum obat setelah makan.",
    emergencyContact: { name: "Rina Santoso", phone: "081298765432" },
    riskLevel: "medium",
  },
  {
    id: "pat-002",
    userId: "usr-001",
    name: "Siti Aminah",
    dateOfBirth: "1952-07-25",
    gender: "female",
    address: "Jl. Cikini Raya No.45, Jakarta Pusat",
    latitude: -6.188,
    longitude: 106.839,
    allergies: [],
    medications: ["Donepezil 10mg"],
    mobility: "Menggunakan kursi roda",
    patientNote: "Mengidap demensia ringan. Perlu pendampingan ekstra saat di rumah sakit. Mudah bingung di tempat baru.",
    emergencyContact: { name: "Ahmad Fauzi", phone: "081387654321" },
    riskLevel: "high",
  },
];

export const MOCK_CAREGIVERS: MockCaregiver[] = [
  {
    id: "cg-001",
    name: "Suster Rina",
    email: "rina@caregiver.com",
    phone: "082111222333",
    rating: 4.8,
    totalReviews: 52,
    photoUrl: "/mock/caregiver-1.png",
    online: true,
    latitude: -6.192,
    longitude: 106.835,
    workingRadiusKm: 15,
    specializations: ["Pendampingan RS", "Perawatan Diabetes"],
  },
  {
    id: "cg-002",
    name: "Joko Prasetyo",
    email: "joko@caregiver.com",
    phone: "082144455566",
    rating: 4.9,
    totalReviews: 78,
    photoUrl: "/mock/caregiver-2.png",
    online: true,
    latitude: -6.198,
    longitude: 106.84,
    workingRadiusKm: 10,
    specializations: ["Pendampingan RS", "Geriatri"],
  },
  {
    id: "cg-003",
    name: "Dewi Lestari",
    email: "dewi@caregiver.com",
    phone: "082177788899",
    rating: 4.6,
    totalReviews: 35,
    photoUrl: "/mock/caregiver-3.png",
    online: false,
    latitude: -6.185,
    longitude: 106.825,
    workingRadiusKm: 12,
    specializations: ["Perawatan Demensia"],
  },
  {
    id: "cg-004",
    name: "Agus Setiawan",
    email: "agus@caregiver.com",
    phone: "082133344455",
    rating: 4.7,
    totalReviews: 41,
    photoUrl: "/mock/caregiver-4.png",
    online: true,
    latitude: -6.2,
    longitude: 106.845,
    workingRadiusKm: 15,
    specializations: ["Fisioterapi", "Pendampingan RS"],
  },
  {
    id: "cg-005",
    name: "Fitri Handayani",
    email: "fitri@caregiver.com",
    phone: "082155566677",
    rating: 4.5,
    totalReviews: 22,
    photoUrl: "/mock/caregiver-5.png",
    online: true,
    latitude: -6.19,
    longitude: 106.83,
    workingRadiusKm: 20,
    specializations: ["Pendampingan RS", "Perawatan Lansia"],
  },
];

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: "bk-001",
    patientId: "pat-001",
    caregiverId: "cg-002",
    bookingType: "scheduled",
    status: "in_progress",
    scheduledAt: "2026-07-16T09:00:00Z",
    facilityName: "RSCM Jakarta",
    facilityAddress: "Jl. Diponegoro No.71, Jakarta Pusat",
    facilityLatitude: -6.1865,
    facilityLongitude: 106.8442,
    guidebookId: "gb-001",
    payment: { status: "held", amount: 150000, paidAt: "2026-07-16T08:40:00Z" },
    createdAt: "2026-07-15T20:00:00Z",
  },
  {
    id: "bk-002",
    patientId: "pat-002",
    caregiverId: "cg-001",
    bookingType: "scheduled",
    status: "completed",
    scheduledAt: "2026-07-14T10:00:00Z",
    facilityName: "RS Cipto Mangunkusumo",
    facilityAddress: "Jl. Salemba Raya No.6, Jakarta Pusat",
    facilityLatitude: -6.1945,
    facilityLongitude: 106.8505,
    guidebookId: "gb-002",
    payment: { status: "released", amount: 175000, paidAt: "2026-07-14T09:30:00Z" },
    createdAt: "2026-07-13T18:00:00Z",
  },
  {
    id: "bk-003",
    patientId: "pat-001",
    caregiverId: null,
    bookingType: "immediate",
    status: "pending_matching",
    scheduledAt: null,
    facilityName: "RS Persahabatan",
    facilityAddress: "Jl. Persahabatan Raya No.1, Jakarta Timur",
    facilityLatitude: -6.2065,
    facilityLongitude: 106.886,
    guidebookId: null,
    payment: { status: "pending", amount: 120000, paidAt: null },
    createdAt: "2026-07-16T13:00:00Z",
  },
];

export const MOCK_PROGRESS: MockProgress[] = [
  {
    id: "pg-001",
    bookingId: "bk-001",
    status: "heading_to_patient",
    latitude: -6.198,
    longitude: 106.84,
    note: "Sedang menuju lokasi pasien",
    createdAt: "2026-07-16T08:50:00Z",
  },
  {
    id: "pg-002",
    bookingId: "bk-001",
    status: "picked_up_patient",
    latitude: -6.195,
    longitude: 106.832,
    note: "Pasien sudah dijemput, kondisi stabil",
    createdAt: "2026-07-16T09:05:00Z",
  },
  {
    id: "pg-003",
    bookingId: "bk-001",
    status: "heading_to_facility",
    latitude: -6.19,
    longitude: 106.838,
    note: "Dalam perjalanan ke RSCM",
    createdAt: "2026-07-16T09:12:00Z",
  },
  {
    id: "pg-004",
    bookingId: "bk-001",
    status: "arrived_registration",
    latitude: -6.1865,
    longitude: 106.8442,
    note: "Sudah sampai RSCM, sedang registrasi",
    createdAt: "2026-07-16T09:25:00Z",
  },
];

export const MOCK_GUIDEBOOKS: MockGuidebook[] = [
  {
    id: "gb-001",
    bookingId: "bk-001",
    quickSummary: "Pasien diabetes tipe 2 dengan hipertensi. Butuh tongkat saat berjalan. Alergi penisilin.",
    do: [
      "Ingatkan minum Metformin setelah makan siang",
      "Bantu berjalan dengan tongkat, pegang lengan kiri",
      "Bawa botol air minum dan camilan rendah gula",
      "Cek tekanan darah sebelum konsultasi",
    ],
    dont: [
      "Jangan berikan makanan atau obat yang mengandung penisilin",
      "Jangan biarkan pasien berjalan sendiri di tangga",
      "Hindari minuman manis atau bersoda",
    ],
    warningSigns: [
      "Pasien merasa pusing, lemas, atau berkeringat dingin (gejala hipoglikemia)",
      "Tekanan darah di atas 180/120 mmHg",
      "Pasien mengeluh nyeri dada atau sesak napas",
    ],
    emergencyContact: { name: "Rina Santoso", phone: "081298765432" },
    acknowledgedByCaregiver: true,
    acknowledgedAt: "2026-07-16T08:45:00Z",
  },
  {
    id: "gb-002",
    bookingId: "bk-002",
    quickSummary: "Pasien demensia ringan, menggunakan kursi roda. Mudah bingung di tempat baru.",
    do: [
      "Selalu dampingi dan bicara dengan tenang",
      "Gunakan kursi roda, pastikan sabuk pengaman terpasang",
      "Bawa kartu identitas dan catatan medis",
    ],
    dont: [
      "Jangan tinggalkan pasien sendirian",
      "Jangan terburu-buru, pasien butuh waktu lebih",
      "Jangan memaksa pasien mengingat sesuatu",
    ],
    warningSigns: [
      "Pasien menjadi sangat gelisah atau agresif",
      "Pasien tidak mengenali lingkungan sama sekali",
    ],
    emergencyContact: { name: "Ahmad Fauzi", phone: "081387654321" },
    acknowledgedByCaregiver: true,
    acknowledgedAt: "2026-07-14T09:40:00Z",
  },
];

export const MOCK_REPORTS: MockReport[] = [
  {
    id: "rp-002",
    bookingId: "bk-002",
    notes: "Layanan pendampingan ke RS Cipto berjalan lancar. Pasien kooperatif selama konsultasi. Dokter menyarankan kontrol ulang 2 minggu lagi. Obat Donepezil dilanjutkan dengan dosis yang sama.",
    conditionSummary: "Pasien dalam kondisi stabil. Demensia masih tahap ringan. Mobilitas dengan kursi roda baik. Mood cenderung tenang sepanjang layanan.",
    createdAt: "2026-07-14T14:30:00Z",
  },
];

export const MOCK_CHAT_MESSAGES: MockChatMessage[] = [
  {
    id: "msg-001",
    bookingId: "bk-001",
    senderId: "cg-002",
    senderRole: "caregiver",
    message: "Selamat pagi Pak Zaki, saya Joko yang akan mendampingi Bapak Budi hari ini. Saya sedang menuju ke lokasi.",
    sentAt: "2026-07-16T08:50:00Z",
    type: "text",
  },
  {
    id: "msg-002",
    bookingId: "bk-001",
    senderId: "usr-001",
    senderRole: "user",
    message: "Terima kasih Pak Joko. Bapak sudah siap, menunggu di depan rumah.",
    sentAt: "2026-07-16T08:52:00Z",
    type: "text",
  },
  {
    id: "msg-003",
    bookingId: "bk-001",
    senderId: "system",
    senderRole: "system",
    message: "📍 Update: Caregiver telah menjemput pasien",
    sentAt: "2026-07-16T09:05:00Z",
    type: "progress_update",
  },
  {
    id: "msg-004",
    bookingId: "bk-001",
    senderId: "cg-002",
    senderRole: "caregiver",
    message: "Bapak Budi sudah di mobil. Kondisi baik, kita menuju ke RSCM sekarang.",
    sentAt: "2026-07-16T09:06:00Z",
    type: "text",
  },
  {
    id: "msg-005",
    bookingId: "bk-001",
    senderId: "usr-001",
    senderRole: "user",
    message: "Baik Pak, hati-hati di jalan ya. Tolong ingatkan Bapak minum obatnya.",
    sentAt: "2026-07-16T09:08:00Z",
    type: "text",
  },
];

// ── Progress Status Labels ──

export const PROGRESS_LABELS: Record<ProgressStatus, string> = {
  heading_to_patient: "Menuju lokasi pasien",
  picked_up_patient: "Jemput pasien",
  heading_to_facility: "Menuju fasilitas kesehatan",
  arrived_registration: "Registrasi di faskes",
  waiting_in_queue: "Menunggu antrean",
  in_consultation: "Konsultasi selesai",
  heading_back: "Perjalanan pulang",
  completed: "Selesai diantar",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_matching: "Mencari caregiver...",
  matched: "Caregiver ditemukan",
  paid: "Menunggu layanan",
  scheduled: "Menunggu jadwal",
  in_progress: "Sedang berlangsung",
  completed: "Layanan selesai",
  reported: "Laporan tersedia",
  rescheduling: "Mencari pengganti...",
  reschedule_failed: "Gagal cari pengganti",
  payment_failed: "Pembayaran gagal",
};

// ── Helper: find related data ──

export function getPatientById(id: string): MockPatient | undefined {
  return MOCK_PATIENTS.find((p) => p.id === id);
}

export function getCaregiverById(id: string): MockCaregiver | undefined {
  return MOCK_CAREGIVERS.find((c) => c.id === id);
}

export function getBookingById(id: string): MockBooking | undefined {
  return MOCK_BOOKINGS.find((b) => b.id === id);
}

export function getProgressForBooking(bookingId: string): MockProgress[] {
  return MOCK_PROGRESS.filter((p) => p.bookingId === bookingId);
}

export function getGuidebookForBooking(bookingId: string): MockGuidebook | undefined {
  return MOCK_GUIDEBOOKS.find((g) => g.bookingId === bookingId);
}

export function getReportForBooking(bookingId: string): MockReport | undefined {
  return MOCK_REPORTS.find((r) => r.bookingId === bookingId);
}

export function getChatForBooking(bookingId: string): MockChatMessage[] {
  return MOCK_CHAT_MESSAGES.filter((m) => m.bookingId === bookingId);
}
