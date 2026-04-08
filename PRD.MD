# Product Requirements Document (PRD): Personal Finance Tracker

**Version:** 1.0  
**Owner:** Akbar  
**Status:** Live / Production

## 1. Project Overview
Aplikasi dashboard keuangan pribadi minimalis yang dirancang untuk mencatat, mengkategorikan, dan memvisualisasikan data transaksi (pemasukan & pengeluaran) secara real-time dengan fokus pada keamanan data dan antarmuka yang bersih.

## 2. Core Features (MVP)
* **Authentication:** Sistem login tertutup menggunakan Supabase Auth. Hanya user terdaftar yang dapat mengakses dashboard.
* **Transaction Management (CRUD):** 
  * Menambah transaksi (pemasukan/pengeluaran) dengan atribut: Tanggal, Keterangan, Kategori, Nominal, dan Tipe.
  * *Input Masking* input nominal: Pemisah ribuan dinamis terpasang visual (*on-the-fly*) guna mencegah salah ketik.
  * Menampilkan daftar transaksi dalam format tabel bertingkat dengan max-height dan independen scrolling.
  * Menghapus *(Delete)* transaksi langsung dari tabel dengan aksi antarmuka secara instan.
* **Financial Summary:** Kalkulasi otomatis untuk Total Saldo, Total Pemasukan, dan Total Pengeluaran.
* **Data Visualization & Analytics:** 
  * Grafik donat (Donut Chart) terintegrasi untuk merepresentasikan proporsi pengeluaran berdasarkan kategori.
  * Grafik Trend Keuangan (Bar/Line Chart Time-series) interaktif untuk tren pemasukan dan pengeluaran harian.
  * Filter Waktu Global tersentralisasi (Single Source of Truth) untuk menyinkronkan metrik, tabel, dan grafik secara langsung.
* **UI/UX Enhancements:**
  * **System Dark Mode**: Melibatkan `next-themes` dan Tailwind v4 class-variant penyesuaian khusus elemen SVG diagram.
  * **Sticky Glassmorphism Header**: Navigasi selalu terlihat (*backdrop-blur*) saat melintasi data transaksi padat.
  * **Lokalisasi**: Keseluruhan Antarmuka Pengguna (*UI*) ditranslasikan komprehensif ke Bahasa Indonesia dengan mengisolasi logik inti dari database via Konstan Objek (*Mapping Obj*).
* **Data Security:** Implementasi Row Level Security (RLS) di level database untuk memastikan isolasi data per pengguna.

## 3. Tech Stack & Architecture
* **Frontend:** Next.js (App Router), TypeScript.
* **Styling:** Tailwind CSS (Konsep Minimalis).
* **Icons:** Lucide React (Digunakan secara minimalis dan fungsional).
* **Charts:** Recharts.
* **Backend/Database:** Supabase (PostgreSQL).
* **Deployment:** Vercel.

## 4. Design Guidelines (The "Clean" Rule)
* **Color Palette (Terintegrasi System Dark Mode dengan next-themes):**
  * Background Utama (Light / Dark): `#F3F4F6` (Gray 100) / Tailwind `gray-900`.
  * Cangkang Cards & Modal: Putih / Tailwind `gray-800`.
  * Teks & Tombol Utama: `#1F2937` (Gray 800) / Tailwind `gray-100`.
* **Typography:** Tipografi yang jelas dan proporsional. Hindari penggunaan ikon jika teks sudah cukup menjelaskan fungsi.
* **UI Philosophy:** Utamakan fungsionalitas dan kejelasan data. Tanpa border atau bayangan (shadow) berlebih. Jarak antar elemen (spacing) konsisten untuk menjaga tampilan tetap terstruktur.

## 5. Database Schema (PostgreSQL)
**Table Name:** `transactions`

| Column        | Type          | Constraints                               | Description                          |
| :------------ | :------------ | :---------------------------------------- | :----------------------------------- |
| `id`          | `uuid`        | Primary Key, Default: `gen_random_uuid()` | ID unik transaksi.                   |
| `user_id`     | `uuid`        | Foreign Key, Default: `auth.uid()`        | Relasi ke tabel Supabase Auth.       |
| `date`        | `timestamptz` | Not Null, Default: `now()`                | Tanggal transaksi.                   |
| `amount`      | `int8`        | Not Null, Default: `0`                    | Nilai transaksi dalam Rupiah.        |
| `description` | `text`        | -                                         | Penjelasan singkat transaksi.        |
| `category`    | `text`        | -                                         | Kategori (Utility, Food, etc).       |
| `type`        | `text`        | -                                         | 'income' atau 'expense'.             |

## 6. Security & Logic Rules
* **RLS Policy:** Setiap kueri (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) wajib menyertakan filter `user_id = auth.uid()`.
* **State Management:** Data transaksi harus di-fetch ulang setiap kali ada perubahan (insert/delete) untuk menjaga sinkronisasi grafik dan ringkasan saldo.
* **Environment Variables:** Semua kunci API (`URL` dan `ANON_KEY`) harus melalui `.env.local` pada tahap *development* dan dipasang di pengaturan Vercel pada tahap *production* dengan awalan `NEXT_PUBLIC_`.

## 7. Future Roadmap (Backlog)
* Filter transaksi berdasarkan rentang bulan/tahun.
* Fitur ekspor data ke format CSV untuk kebutuhan analisis Data Science.
* Implementasi sistem budgeting (target pengeluaran per kategori).
* Integrasi analisis prediktif pengeluaran berbasis data historis.