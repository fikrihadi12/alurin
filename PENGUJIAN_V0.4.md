# Laporan Pengujian Internal ALURIN v0.4

**Tanggal pengujian:** 19 Oktober 2026  
**Lingkup:** fungsi perangkat lunak dan integrasi antarmuka prototipe. Tidak melibatkan murid dan tidak mengukur efektivitas pembelajaran.

## Hasil otomatis

| Bagian | Hasil | Catatan |
|---|---:|---|
| Mesin flowchart/tracing | 22/22 lulus | Enam skenario, validasi urutan/simbol/cabang, nilai batas dan input tidak valid |
| Mesin asesmen adaptif | 20/20 lulus | 12 soal, empat konsep, pemetaan kesalahan, validasi laporan, rekomendasi |
| Pemeriksaan interaksi UI | 50/50 lulus | Login demo, role guard, dashboard, filter, detail, ekspor CSV, konten, asesmen, latihan, persistensi lokal, sertifikat, pengaturan teks |
| Halaman desktop | 6/6 lulus | Beranda, diagnostik, materi, laboratorium, detektif, hasil |
| Halaman ponsel 390 px | 6/6 lulus | Tidak ada overflow horizontal |
| Halaman sempit 320 px | 6/6 lulus | Tidak ada overflow horizontal |
| Dashboard admin ponsel | Lulus | Tidak ada overflow horizontal |
| Galat JavaScript | 0 | Tidak ada `pageerror` pada skenario UI yang diuji |

**Total:** 92 pemeriksaan fungsional eksplisit lulus, ditambah 18 pemeriksaan rute/tampilan pada tiga ukuran layar. Hasil lengkap tersedia pada `test-v04-results.json`.

## Skenario utama yang diuji

1. Login murid dan admin demo, logout, serta pengalihan role agar murid tidak membuka halaman admin.
2. Pembuatan data simulasi, filter nama, tampilan detail murid, pratinjau konten, dan ekspor CSV.
3. Asesmen 12 soal: pilihan wajib sebelum lanjut, soal visual, penyelesaian, tinjauan jawaban, dan penyimpanan hasil pada browser yang sama.
4. Isolasi progres dua profil murid dalam browser yang sama.
5. Lima unit materi dapat dipilih.
6. Keenam skenario Laboratorium dapat diperbaiki dan ditelusuri sampai akhir.
7. Draft editor, tab laboratorium, pilihan dan umpan balik Detektif dapat dipulihkan pada browser yang sama.
8. Keenam kasus Detektif Logika memiliki jawaban benar dan memberikan umpan balik.
9. Pengiriman hasil demo muncul pada detail admin, dan lencana SVG dapat diunduh.
10. Pengaturan ukuran teks mengubah `font-size` dasar dari 16 px menjadi 18 px, kemudian dapat dikembalikan.
11. Tidak ditemukan pelebaran horizontal pada ukuran layar 1440 px, 390 px, dan 320 px.

## Cara menjalankan ulang

```bash
node tests/test_engine.cjs
node tests/test_adaptive.cjs
python tests/test_v04_ui.py
```

Tes UI menggunakan Playwright Chromium di lingkungan pengembangan. Jika menjalankan di laptop lain, instalasi Playwright/Chromium mungkin diperlukan.

## Batasan hasil

Penyimpanan yang diuji adalah `localStorage` simulasi/di perangkat yang sama. Pengujian ini **tidak** membuktikan autentikasi aman, sinkronisasi lintas perangkat, penyimpanan database terpusat, ketahanan backup, atau efektivitas pembelajaran. Semua itu memerlukan integrasi backend dan pengujian tambahan.
