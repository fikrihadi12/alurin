# ALURIN v0.4 — Role Demo, Dashboard Admin, dan Pengayaan Konten

ALURIN adalah prototipe media pembelajaran Informatika kelas X/Fase E untuk algoritma, flowchart, percabangan, dan tracing. Frontend tetap menggunakan **HTML, CSS, dan JavaScript murni tanpa framework**. Versi ini menambahkan alur login demo untuk murid/admin, dashboard pemantauan, penyimpanan lokal per profil, bank soal visual, dan kasus praktik yang lebih beragam.

> **Penting:** v0.4 adalah prototipe frontend. Login dan role masih diperiksa di browser, sedangkan data disimpan pada `localStorage` di browser yang sama. Ini bukan autentikasi aman dan bukan database terpusat. Jangan memasukkan data pribadi atau hasil belajar murid sungguhan sebelum backend/API dan database dipasang.

## Jalankan secara lokal

1. Ekstrak ZIP ke folder kerja.
2. Pastikan Python terpasang.
3. Buka terminal pada folder `ALURIN_v0.4_Admin_Content`.
4. Jalankan di Windows:

   ```powershell
   py jalankan_alurin.py
   ```

   Di macOS/Linux:

   ```bash
   python3 jalankan_alurin.py
   ```

5. Buka URL yang dicetak di terminal. Peluncur memilih port lokal yang kosong dan menonaktifkan cache.

Alternatifnya, dari folder proyek jalankan `py -m http.server 8000`, lalu buka `http://localhost:8000`. Jika memakai cara ini, server akan menyajikan folder aktif pada port 8000, jadi pastikan foldernya benar.

## Login demo

### Murid

Masukkan nama lengkap, kelas, dan nomor absen (1–99). Data disimpan sebagai profil demo di browser saat ini. Nomor absen yang sama pada kelas berbeda dipisahkan.

### Admin

- Nama pengguna: `admin`
- Kode demo: `alurin-demo`

Kredensial ini memang tertulis di kode frontend dan hanya untuk pengujian lokal. Siapa pun yang dapat membuka source code bisa melihatnya. Backend harus mengganti mekanisme ini sebelum deployment publik.

## Fitur pada v0.4

### Role murid

- Login demo dengan nama lengkap, kelas, dan nomor absen.
- Progres diagnostik, aktivitas, pilihan kasus, tab laboratorium, dan pekerjaan flowchart disimpan per profil di browser yang sama.
- Hasil asesmen dan rekomendasi adaptif berdasarkan empat konsep: urutan, simbol, percabangan, dan tracing.
- Tombol kirim ringkasan menandai hasil sebagai terkirim pada dashboard demo lokal.
- Unduh lencana apresiasi sebagai SVG.
- Pengaturan ukuran teks benar-benar mengubah ukuran dasar dokumen dari 16 px menjadi 18 px dan dapat dikembalikan.

### Role admin

- Ringkasan jumlah profil, asesmen selesai, rata-rata skor diagnostik, dan aktivitas tuntas.
- Daftar murid dengan pencarian, filter kelas/status, dan detail individu.
- Ekspor CSV.
- Melihat status pengiriman hasil dan ringkasan konsep.
- Meninjau konten, bank soal, dan pratinjau unit/kasus.
- Tombol untuk membuat/menghapus data simulasi yang secara eksplisit ditandai sebagai data demo.

### Konten pembelajaran

- **5 unit materi:** algoritma, simbol flowchart, algoritma naratif/flowchart/pseudocode, kondisi batas, serta tracing dan debugging.
- **12 soal diagnostik:** tiga soal per konsep. Soal memakai ilustrasi SVG buatan lokal sehingga tidak memerlukan gambar eksternal.
- **6 kasus Laboratorium:** ketuntasan nilai, saldo, gratis ongkir, ketersediaan buku, unggahan LMS, dan antrean layanan.
- **6 kasus Detektif Logika:** urutan salah, simbol keputusan, cabang tertukar, akhir alur hilang, kondisi batas, dan tracing keliru.
- Editor flowchart masih terpandu dengan pola empat node, tetapi setiap kasus memiliki data masukan, kondisi, dan keluaran yang sesuai.

## Pengujian

Jalankan pengujian mesin logika dan asesmen:

```bash
node tests/test_engine.cjs
node tests/test_adaptive.cjs
```

Uji antarmuka end-to-end menggunakan Playwright Chromium:

```bash
python tests/test_v04_ui.py
```

Pengujian UI menggunakan browser headless yang tersedia di lingkungan pengembangan. Di perangkat lain, tes UI memerlukan instalasi Playwright dan Chromium. Ringkasan hasil terbaru ada pada `PENGUJIAN_V0.4.md` dan `test-v04-results.json`.

## Struktur proyek

```text
ALURIN_v0.4_Admin_Content/
├── index.html
├── css/style.v0.4.css
├── js/
│   ├── app.v0.4.js
│   ├── engine.v0.4.js
│   ├── stage2-views.v0.4.js
│   ├── adaptive-engine.v0.4.js
│   └── stage3-views.v0.4.js
├── assets/favicon.svg
├── tests/
├── previews/
├── jalankan_alurin.py
├── INTEGRASI_BACKEND.md
├── PENGUJIAN_V0.4.md
└── CATATAN_LK4_V0.4.md
```

## Batasan dan pekerjaan integrasi

- `localStorage` hanya tersedia untuk browser/perangkat yang sama. Admin tidak dapat melihat progres yang dikerjakan pada browser atau perangkat lain.
- Role dan login demo dapat dilewati atau dimanipulasi dari browser. Ini hanya alur UI untuk pengembangan.
- Ekspor CSV mengambil data lokal browser, bukan laporan kelas terpusat.
- Pengiriman hasil dan lencana hanya dicatat/dibuat secara lokal. Belum ada server yang memverifikasi atau menerbitkan sertifikat resmi.
- Database SQLite/Turso/PostgreSQL, autentikasi aman, sinkronisasi, backup, dan API belum termasuk pada paket ini. Kontrak integrasi yang diusulkan tersedia di `INTEGRASI_BACKEND.md`.
- Uji fungsi perangkat lunak tidak membuktikan efektivitas pembelajaran. Uji dengan murid dan telaah rekan/ahli tetap diperlukan.
