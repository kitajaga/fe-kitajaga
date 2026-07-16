# Kitajaga — Project Context (Single Source of Truth)

> **Purpose**
>
> This document is the single source of truth for the Kitajaga project.
> All frontend, backend, database, and AI-generated code must follow this document.
> Do not assume features that are not explicitly described here.
> Any feature listed under **Out of Scope** must not be implemented unless explicitly requested.

---

# 1. Product Overview

## Product

Kitajaga adalah aplikasi marketplace caregiver berbasis lokasi yang mempertemukan keluarga pasien lansia dengan caregiver yang siap memberikan layanan pendampingan.

Model bisnis mirip layanan on-demand seperti Gojek atau Grab, namun berfokus pada layanan kesehatan dan pendampingan lansia.

---

## Problem

Banyak keluarga berada pada kondisi *sandwich generation* sehingga kesulitan mendampingi orang tua ke rumah sakit atau memberikan pendampingan harian.

Pilihan caregiver profesional juga masih terbatas, mahal, dan sulit ditemukan secara cepat.

---

## Solution

Kitajaga menyediakan:

- On-demand caregiver
- Scheduled caregiver
- AI-generated guidebook untuk caregiver
- Escrow payment
- Progress tracking
- Realtime chat

---

## Target Users

### User

Keluarga pasien yang melakukan booking caregiver.

### Caregiver

Tenaga pendamping lansia, baik profesional maupun non-profesional (misalnya mahasiswa kesehatan).

---

## Core Value

- Fast booking
- Trusted caregiver
- Safe patient handling
- Transparent tracking
- Affordable caregiver

---

# 2. MVP Scope

## Included

- Authentication
- Patient Management
- Booking Immediate
- Booking Scheduled
- Rule-based Matching
- Payment (Midtrans Sandbox)
- Escrow Simulation
- AI Guidebook
- Guidebook Acknowledgement
- Progress Tracking
- Last Location Tracking
- Realtime Chat
- Caregiver Report
- Rating
- Installable PWA

---

## Excluded

- Push Notification
- Caregiver Tier
- OCR Verification
- Admin Panel
- Dynamic Pricing
- SOS Feature
- Caregiver No Show Handling
- Refund Automation
- Dispute Management

---

# 3. User Roles

## User

Can:

- Register
- Login
- Manage Patients
- Create Booking
- Pay Booking
- View Caregiver
- Track Progress
- Chat
- View Report
- Give Rating

---

## Caregiver

Can:

- Register
- Login
- Toggle Online
- Accept Booking
- Read Guidebook
- Update Progress
- Send Chat
- Submit Report

---

# 4. Core Features

## Authentication

JWT Authentication.

Roles:

- user
- caregiver

---

## Patient Management

User dapat memiliki lebih dari satu pasien.

Data pasien meliputi:

- biodata
- alamat
- lokasi
- alergi
- mobility status
- medical notes
- emergency contact
---

## Booking

Booking memiliki dua tipe:

### Immediate

Digunakan untuk kebutuhan saat ini.

Matching berjalan langsung.

Timeout accept caregiver adalah **30 detik**.

---

### Scheduled

Booking dijadwalkan pada tanggal tertentu.

Caregiver dapat menerima booking sebelum waktu layanan.

---

## Matching

Rule-based matching.

Tidak menggunakan Machine Learning.

---

## Payment

Menggunakan Midtrans Sandbox.

Dana ditahan sebagai escrow.

Dana dilepas setelah layanan selesai.

---

## AI Guidebook

Guidebook dibuat berdasarkan kondisi pasien.

Guidebook wajib di-acknowledge sebelum caregiver dapat menerima booking.

Jika LLM gagal, gunakan template statis.

---

## Progress Tracking

Tracking menggunakan checkpoint.

Bukan GPS realtime streaming.

Setiap checkpoint mengirim:

- status
- latitude
- longitude
- timestamp

---

## Chat

Realtime chat menggunakan Socket.IO.

Chat hanya tersedia setelah booking berhasil matched.
Dapat mengupload foto di chat 

---

## Report

Caregiver wajib mengirim laporan manual baru setelah itu klik button layanan selesai.

---

## Rating

User memberikan rating dan catatan setelah membaca laporan caregiver.


---

# 5. Business Rules

## Immediate Booking

- Matching langsung berjalan
- Timeout caregiver adalah 30 detik
- Menggunakan radius lebih besar dibanding scheduled booking

---

## Scheduled Booking

- Booking memiliki waktu layanan
- Matching dilakukan sebelum waktu layanan

---

## Guidebook

Guidebook harus dibaca caregiver.

Tanpa acknowledgement, tombol Accept tidak boleh aktif.

---

## Escrow

Status pembayaran:

Pending

↓

Held

↓

Released

---

## Matching

Score dihitung berdasarkan:

- Distance
- Rating
- Reschedule History

---

## Reschedule

Jika user membatalkan booking:

Booking

↓

Rescheduling

↓

Matching ulang


---

# 6. State Machine

## Booking Status

```
pending_matching

↓

matched

↓

paid

↓

scheduled (scheduled only)

↓

in_progress

↓

completed

↓

reported
```

Alternative Flow

```
matched

↓

rescheduling

↓

matched
```

atau

```
rescheduling

↓

reschedule_failed
```

---

## Progress Status

```
heading_to_patient

↓

picked_up_patient

↓

heading_to_facility

↓

arrived_registration

↓

waiting_in_queue

↓

in_consultation

↓

heading_back

↓

completed
```

---

## Payment Status

```
pending

↓

held

↓

released
```

atau

```
pending

↓

failed
```

---

# 7. Matching Algorithm

## Candidate Filter

Caregiver harus:

- Online
- Dalam radius
- Tidak sedang mengerjakan booking
- Tidak termasuk previous caregiver

---

## Scoring

Distance = 50%

Rating = 40%

Reschedule Penalty = 10%

---

## Radius

Default:

15 KM

---

## Timeout

Immediate Booking

30 detik

---

# 8. Data Model

## User

- id
- name
- email
- phone
- password
- role

---

## Patient

- id
- user
- biodata
- address
- latitude
- longitude
- allergies
- medications
- mobility
- notes
- emergency contact
- risk level

---

## Caregiver

- id
- profile
- rating
- online status
- location
- working radius

---

## Booking

- patient
- caregiver
- booking type
- status
- schedule
- payment
- guidebook

---

## Guidebook

- content
- generatedAt
- acknowledged

---

## Payment

- amount
- status
- midtrans id

---

## Report

- notes
- condition summary

---

## Chat

- sender
- booking
- message
- timestamp

---

## Progress

- booking
- status
- latitude
- longitude
- photo
- timestamp

---

# 9. REST API

Authentication
- POST /auth/register
- POST /auth/login

Caregiver Profile      
- GET   /caregivers/me
- PATCH /caregivers/me/status
- PATCH /caregivers/me/location

Patients
- GET  /patients
- POST /patients
- GET  /patients/:id
- PATCH /patients/:id    

Booking
- POST /bookings
- GET  /bookings              
- GET  /bookings/:id
- POST /bookings/:id/accept
- POST /bookings/:id/reschedule
- POST /bookings/:id/cancel   

Progress
- GET  /bookings/:id/progress
- POST /bookings/:id/progress

Payment
- POST /payments/charge
- GET  /payments/:bookingId/status
- POST /payments/webhook     

Guidebook
- GET  /guidebooks/:bookingId
- POST /guidebooks/:id/acknowledge

Report & Rating
- POST /bookings/:id/report
- GET  /bookings/:id/report   
- POST /bookings/:id/rate


---

# 10. WebSocket Events

Client → Server

- join_booking
- send_message

Server → Client

- new_message
- progress_update
- booking_status_changed

---

# 11. Frontend State Mapping

| Booking Status | UI |
|----------------|----|
| pending_matching | Searching caregiver |
| matched | Show caregiver profile |
| paid | Waiting service |
| scheduled | Waiting schedule |
| in_progress | Tracking + Chat |
| completed | Waiting report |
| reported | Rating |
| rescheduling | Searching replacement caregiver |
| reschedule_failed | Retry / Refund |

---

# 12. Technical Constraints

Frontend

- Next.js App Router
- TypeScript
- PWA

Backend

- Express.js
- Prisma ORM
- Typescript

Database

- PostgreSQL

Realtime

- Socket.IO

Payment

- Midtrans Sandbox

Map

- Leaflet
- OpenStreetMap

AI

- OpenAI / Anthropic / Gemini
- Static fallback template

Deployment

- Docker
- Docker Compose

---

# 13. Demo Seed

Minimal seed:

- 1 User
- 2 Patients
- 5 Caregivers
- Booking pada berbagai status
- Sample Guidebook
- Sample Chat
- Sample Progress
- Sample Report

---

# 14. Acceptance Criteria

MVP dianggap selesai apabila:

- User dapat membuat booking.
- Matching berhasil mendapatkan caregiver.
- Payment berhasil menjadi Held.
- Guidebook berhasil dibuat.
- Caregiver dapat acknowledge guidebook.
- Caregiver dapat update progress.
- User menerima progress secara realtime.
- Chat realtime berjalan.
- Caregiver mengirim report.
- User memberi rating.
- Payment berubah menjadi Released.

---

# 15. Out of Scope

Fitur berikut tidak boleh diimplementasikan pada MVP:

- Push Notification
- Caregiver Tier
- Caregiver No Show
- Admin Dashboard
- OCR Verification
- Dynamic Pricing
- SOS
- Refund Automation
- Dispute Management
- Analytics
- Recommendation System

