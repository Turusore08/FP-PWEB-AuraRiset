# SPESIFIKASI LENGKAP APLIKASI WEB AuraRiset

# 1\. PENDAHULUAN

## 1.1 Nama Aplikasi

AuraRiset: Automated Research Gap Analysis

## 1.2 Deskripsi Aplikasi

AuraRiset adalah website yang bertujuan

Aplikasi dirancang menggunakan:

* Front End: HTML, CSS, JavaScript

* Back End: PHP

* Database: MySQL

Sistem hanya memiliki satu role utama yaitu peneliti

---

# 2\. TUJUAN APLIKASI

Tujuan utama aplikasi:

* Mempermudah proses studi literatur oleh peneliti

* Mengautomatisasi proses pencarian gap melalui beberapa metode yang bisa dipilih

* Mengautomatisasi proses pencarian paper berdasarkan judul, tema, dll

---

# 3\. TARGET PENGGUNA

## 3.1 Peneliti

Digunakan untuk:

* Mengelola studi literatur

* Memudahkan proses review paper

* Memudahkan membandingkan beberapa paper

* Memudahkan pencarian gap paper

* Mempercepat proses penelitian

---

# 4\. PLATFORM DAN TEKNOLOGI

## 4.1 Front End

Menggunakan:

* HTML
* CSS
* JavaScript

## 4.2 Back End

Menggunakan:

* PHP

## 4.3 Database

Menggunakan:

* MySQL

## 4.4 Tools Pendukung

* Visual Studio Code

* GitHub

* Font Awesome

* Google Fonts

* OPEN AI

---

# 5\. SPESIFIKASI HARDWARE

## 5.1 Minimum Server

* Processor: Intel i3

* RAM: 4 GB

* Storage: 120 GB SSD

* OS: Windows/Linux

## 5.2 Minimum Client

* Browser Chrome/Edge/Firefox

* RAM: 2 GB

* Koneksi internet stabil

---

# 6\. FITUR UTAMA APLIKASI

# 6.1 LANDING PAGE

## Deskripsi

Halaman depan yang memperkenalkan AuraRiset secara ringkas dan mengundang pengguna untuk memulai studi literatur.

## Fitur:

* Hero section dengan nilai tambah aplikasi
* Ringkasan kemampuan pencarian gap riset
* Demo alur penggunaan singkat
* Frequently Asked Questions (FAQ)
* CTA untuk daftar / login
* Footer dengan kontak dan informasi singkat

## Komponen UI:

* Navbar sederhana
* Button CTA
* Card informasi
* Layout responsif untuk desktop dan mobile

---

# 6.2 REGISTRASI AKUN

## Deskripsi

Formulir pendaftaran untuk peneliti membuat akun dengan validasi yang jelas.

## Field Input

* Username
* Email
* Password
* Konfirmasi password

## Validasi

* Email harus unik dan valid
* Password minimal 8 karakter dengan kombinasi huruf dan angka
* Username unik

---

# 6.3 LOGIN SISTEM

## Fitur

* Login aman dengan sesi pengguna
* Logout
* Forgot password
* Validasi kredensial

## Keamanan

* Password hashing
* Session timeout
* Perlindungan terhadap brute force

---

# 6.4 DASHBOARD

## Deskripsi

Halaman utama setelah login yang memudahkan peneliti mengelola dan melanjutkan riset.

## Informasi Ditampilkan

* Search bar untuk memulai pencarian paper atau gap
* Ringkasan riwayat penelitian terbaru
* Tombol cepat untuk upload dokumen dan mulai analisis
* Statistik kecil tentang jumlah riset dan hasil

## Menu

* Dashboard
* Pengaturan Akun
* Mulai Penelitian
* Histori
* Logout

---

# 6.5 HISTORY

## Deskripsi

Menampilkan riwayat penelitian pengguna dengan status dan akses cepat ke hasil sebelumnya.

## Detail

* Daftar aktivitas penelitian
* Tanggal dan status analisis
* Aksi untuk melihat ulang atau menghapus riwayat

---

# 6.6 MULAI PENELITIAN

## Fitur Utama

* Search bar untuk keyword, judul, atau link
* Upload file PDF sebagai alternatif input
* Pengaturan jumlah paper yang akan dianalisis
* Mulai proses analisis untuk menemukan gap riset

## Batasan dan Validasi

* Upload PDF maksimum 10 MB per file
* Validasi format file dan ukuran
* Pengecekan dasar keamanan upload

---

# 7\. DESAIN UI/UX

## Konsep Desain

* Modern

* Clean

* Professional

* Minimalis

* Responsive

## Warna Utama

* Hitam

* emas

* Biru Dongker

## Komponen UI

* Card layout

* Sidebar dashboard

* Navbar modern

* Statistik card

* Modern form

* Data table

## Responsive Design

* Desktop

---

# 8\. STRUKTUR DATABASE

# 8.1 Tabel users

| Field | Type |
| :---- | :---- |
| id | INT |
| username | VARCHAR |
| email | VARCHAR |
| password | VARCHAR |
|  |  |
| created\_at | TIMESTAMP |

---

# 8.2 chat

| Field | Type |
| :---- | :---- |
| id\_chat | INT |
| user\_id | INT |
| History chat | varchat |

---

# 8.3 Tabel dokumen

| Field | Type |
| :---- | :---- |
| id\_dokumen | INT |
| user\_id | INT |
| isi\_dokumen | VARCHAR |

---

# 9\. STRUKTUR FOLDER PROJECT

/AuraRiset  
│  
├── app.tsx  
├── login.tsx  
├── register.tsx  
├── logout.tsx  
├── koneksi.tsx  
├── user/  
├── uploads/  
├── assets/  
│   ├── css/  
│   ├── js/  
│   ├── img/  
│  
├── config/  
├── templates/

---

# 10\. SISTEM KEAMANAN

## Implementasi Keamanan

* Password hashing

* SQL Injection protection

* Session validation

* File upload validation

* CSRF protection

* XSS filtering

* Input sanitization

* Login limiter

* Prompt injection

---

# 11\. ALUR SISTEM

## Alur User

1. Registrasi akun

2. Login

3. Search paper atau upload paper

   

4. Sistem menampilkan tabel berisi perbandingan

---

# 12\. API DAN INTEGRASI (OPSIONAL)

Integrasi:

* Email notification

* WhatsApp gateway

* QR Code generator

* PDF generator

* REST API

* OPENAI

---

# 13\. FITUR TAMBAHAN

## Future Development

* Dark mode

---

# 14\. PENGUJIAN SISTEM

## Jenis Testing

* Unit testing

* Integration testing

* User acceptance testing

* Blackbox testing

* Responsive testing

---

# 15\. OUTPUT APLIKASI

Aplikasi menghasilkan:

* Alat pembantu peneliti untuk Studi literatur

* Dashboard modern

* Web terintegrasi AI

* Data management system

* Sistem upload dokumen

* Sistem search paper

* Responsive UI

* Database MySQL murni

* Sistem siap deploy

---

# 16\. KESIMPULAN

AuraRiset merupakan web yang bertujuan membantu peneliti dalam studi literatur. Dengan beberapa pilihan metode perbandingan paper, diharapkan peneliti mampu memanfaatkan web ini untuk mencari gap antar paper.