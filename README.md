# Kitajaga Frontend

Repositori ini berisi kode sumber frontend untuk aplikasi **Kitajaga**. Aplikasi ini dibangun menggunakan Next.js (App Router) dan React, dirancang untuk memfasilitasi interaksi antara pengguna (user) dan perawat/pendamping (caregiver).

## 🚀 Teknologi Utama

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library UI:** [React 19](https://react.dev/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Real-time Communication:** [Socket.IO Client](https://socket.io/)
- **Ikon:** [FontAwesome](https://fontawesome.com/)

## 📂 Struktur Proyek

Struktur utama direktori proyek ini berada di dalam `src/app/`:

- `/auth` - Halaman autentikasi (Login/Register)
- `/(user)` - Halaman dan fitur dasbor khusus untuk peran pengguna umum
- `/caregiver` - Halaman dan dasbor khusus untuk peran perawat (caregiver)
- `/onboarding` - Alur orientasi (onboarding) untuk pengguna baru
- `/role-pick` - Halaman pemilihan peran (User atau Caregiver)

## 🛠️ Persyaratan (Prerequisites)

Pastikan Anda telah menginstal perangkat lunak berikut di mesin Anda:

- [Node.js](https://nodejs.org/) (versi 20 atau lebih baru)
- Package manager seperti `npm`, `yarn`, `pnpm`, atau `bun`.

## 💻 Cara Menjalankan Server Lokal (Getting Started)

1. Clone repositori ini dan masuk ke direktori proyek (`fe-kitajaga`).
2. Instal semua dependensi yang dibutuhkan:

   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. Jalankan server pengembangan (development server):

   ```bash
   npm run dev
   # atau
   yarn dev
   # atau
   pnpm dev
   ```

4. Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

Halaman akan diperbarui secara otomatis setiap kali Anda menyimpan perubahan pada file proyek.
