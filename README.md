# AuraRiset — Automated Research Gap Analysis

[![PHP Version](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**AuraRiset** adalah platform web inovatif yang dirancang khusus untuk mendeteksi kesenjangan riset (*research gaps*) dan merumuskan celah kebaruan ilmiah (*novelty*) secara otomatis. Aplikasi ini memadukan pemrosesan dokumen, pemetaan graf keterkaitan kausal, dan asisten AI canggih menggunakan integrasi OpenAI GPT-4o-mini untuk mempercepat proses studi literatur bagi peneliti, dosen, dan mahasiswa.

---

## 🌟 Fitur Utama

1. **AI-Powered Gap Analyzer**  
   Melakukan analisis komparatif *State-of-the-Art* (SOTA) secara otomatis dari paper/keyword pencarian menggunakan model bahasa `gpt-4o-mini` lewat koneksi backend PHP yang aman.
2. **Live PDF Uploader & Metadata Extraction**  
   Mengunggah draf paper penelitian (maksimal 10 MB) menggunakan AJAX dengan pelacakan kemajuan (*progress bar*) secara *real-time*. File yang diunggah disimpan dengan enkripsi nama acak (*hashed*) dan didaftarkan langsung ke database.
3. **Interactive Visual Spectrum**  
   Visualisasi pemetaan spasial 3D / graf hubungan kausal pustaka untuk membedakan antara topik riset jenuh (*red ocean*) dan celah riset kosong potensial (*golden gap*).
4. **Research History & CRUD Dashboard**  
   Dashboard modern untuk mengelola riset pustaka. Pengguna dapat menyimpan hasil pencarian/analisis, memuat ulang (*load*) data secara dinamis, melihat metrik statistik riset terbaru, dan menghapus riwayat analisis.
5. **Secure Authentication & RBAC**  
   Sistem login dan registrasi berbasis sesi (*session-based*) dengan *password hashing* menggunakan algoritma `PASSWORD_BCRYPT` dan Role-Based Access Control (RBAC) untuk admin, dosen, dan mahasiswa.
6. **Ekspor Repositori Cerdas**  
   Mendukung konversi hasil perbandingan analisis SOTA langsung ke dalam format PDF laporan yang rapi dan profesional.

---

## 🛠️ Platform & Arsitektur Teknologi

### Front End
- **HTML5 & Vanilla CSS3**: Memanfaatkan variabel CSS (*custom properties*), *glassmorphism*, partikel interaktif, efek transisi halus, serta tata letak responsif (*mobile-friendly*).
- **Modern JavaScript (ES6 Modules)**: Mengadopsi modularitas untuk efisiensi kode, arsitektur *event emitter* mandiri, dan integrasi *State Store Management* terpadu (`store.js`).

### Back End
- **PHP 8.2**: Digunakan untuk mengelola logika aplikasi, sesi pengguna, validasi input, sanitasi unggahan dokumen, dan pembungkus API (*cURL OpenAI integration*).

### Database
- **PostgreSQL**: Manajemen basis data relasional berkinerja tinggi menggunakan driver PHP PDO. 

### DevOps & Infrastruktur
- **Docker**: Containerization menggunakan PHP Apache base image yang dilengkapi dengan ekstensi database (`pdo_pgsql`, `pdo_mysql`) dan manajemen hak akses folder `/uploads`.
- **GitHub Actions (CI/CD)**: 
  - Otomatis melakukan pengujian sintaksis PHP (*linting*) pada setiap *push* di branch `main`.
  - Membangun dan merilis Docker image ke GitHub Container Registry (GHCR).
  - Menyinkronkan proses deployment otomatis ke VPS via SSH atau melalui Render Blueprint (`render.yaml`).

---

## 📂 Struktur Folder Proyek

```text
FP-PWEB-AuraRiset/
│
├── api/                           # Endpoint API Backend (PHP)
│   ├── admin_users.php            # Manajemen pengguna khusus admin
│   ├── delete_history.php         # Penghapusan riwayat penelitian
│   ├── get_research.php           # Pengambilan riwayat riset & metrik dashboard
│   ├── openai_analyze.php         # Analisis SOTA dan gap menggunakan GPT-4o-mini
│   ├── openai_chat.php            # Chat asisten AI pendukung riset
│   ├── save_research.php          # Penyimpanan hasil analisis ke database
│   └── update_profile.php         # Pembaruan profil peneliti
│
├── assets/                        # Statis Aset Aplikasi
│   ├── css/                       # Stylesheets (style.css, variables, dll.)
│   ├── img/                       # Gambar ilustrasi dan diagram
│   └── js/                        # Modul Javascript ES6
│       ├── components/            # Komponen UI (accordion.js, toast.js)
│       ├── core/                  # Logika inti (store.js, events.js)
│       └── modules/               # Modul fitur (navigation.js, research.js, pdfExport.js)
│
├── uploads/                       # Folder penyimpanan fisik dokumen PDF (hasil hash)
├── .env.example                   # Contoh konfigurasi environment variabel
├── Dockerfile                     # Konfigurasi containerization Docker
├── render.yaml                    # Konfigurasi deploy otomatis di platform Render
├── database.sql                   # Schema & seed database PostgreSQL
├── index.html                     # Halaman depan (Landing Page) AuraRiset
├── dashboard.php                  # Dashboard utama peneliti (Session-Gated)
├── login.php                      # Halaman login peneliti
├── register.php                   # Halaman pendaftaran peneliti
├── logout.php                     # Proses logout untuk menghancurkan session
└── koneksi.php                    # Integrasi PDO PostgreSQL & env parser
```

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- **PHP** versi 8.0 atau lebih baru (direkomendasikan 8.2).
- **PostgreSQL** versi 15 atau lebih baru.
- Web server seperti Apache/Nginx, atau Anda dapat menggunakan PHP built-in web server.
- API Key dari **OpenAI** (untuk mengaktifkan fungsionalitas analisis otomatis).

### Langkah-Langkah

1. **Clone Repositori**
   ```bash
   git clone https://github.com/username/FP-PWEB-AuraRiset.git
   cd FP-PWEB-AuraRiset
   ```

2. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan perbarui kredensial PostgreSQL serta OpenAI API Key Anda:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aurariset_db
   DB_USER=postgres
   DB_PASS=password_anda
   OPENAI_API_KEY=sk-proj-...
   ```

3. **Inisialisasi Database**
   Masuk ke PostgreSQL CLI atau tool administrasi (seperti pgAdmin / DBeaver), kemudian jalankan perintah SQL dari file `database.sql` untuk membuat tabel dan data uji awal:
   ```bash
   psql -U postgres -f database.sql
   ```
   *Catatan: Secara default, script seed database akan membuat 3 akun bawaan dengan password:*
   - Admin: `admin` / password: `admin123`
   - Dosen: `dosen` / password: `dosen123`
   - Mahasiswa: `mahasiswa` / password: `mahasiswa123`

4. **Jalankan Server Lokal**
   Gunakan server internal PHP di direktori proyek:
   ```bash
   php -S localhost:8000
   ```
   Buka peramban browser Anda di alamat `http://localhost:8000`.

---

## 🔒 Sistem Keamanan Aplikasi

AuraRiset mengimplementasikan berbagai lapisan perlindungan berstandar profesional:
- **Hashing Sandi Kuat**: Menggunakan algoritma BCRYPT untuk mengamankan data rahasia pengguna.
- **SQL Injection Prevention**: Menggunakan Prepared Statements di setiap query PDO backend.
- **Validasi Unggahan Dokumen**: Membatasi ukuran maksimal file (10 MB), memvalidasi ekstensi file harus bertipe PDF, serta merandomisasi nama file di server untuk mencegah eksekusi skrip berbahaya.
- **Session Security**: Melakukan *gatekeeping* otorisasi di tingkat server (`dashboard.php`) untuk menolak akses tanpa sesi yang sah.
- **Pencegahan Kebocoran Data**: Konfigurasi file `.gitignore` memastikan kredensial sensitif dalam `.env` dan dokumen yang diunggah ke folder `uploads/` tidak pernah terunggah ke repositori publik.