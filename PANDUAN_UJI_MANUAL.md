# Panduan Uji Manual ALURIN v0.4

## A. Login dan role

1. Buka ALURIN, pastikan halaman Masuk tampil.
2. Login sebagai murid menggunakan nama, kelas, dan nomor absen.
3. Coba membuka `#/admin`; murid harus diarahkan kembali ke beranda.
4. Keluar, lalu login sebagai admin dengan `admin` / `alurin-demo`.
5. Pastikan admin masuk ke Dashboard Admin. Catatan: kredensial ini hanya untuk demo lokal.

## B. Dashboard admin

1. Pada Ringkasan, tekan **Isi data simulasi** jika belum ada data.
2. Buka Daftar murid, cari nama `Alya Putri`, lalu pastikan filter bekerja.
3. Pilih Detail untuk melihat status diagnostik, aktivitas, dan status pengiriman hasil.
4. Ekspor CSV dan periksa file yang diunduh.
5. Buka Materi & asesmen, pastikan ada 5 unit, 12 soal, 6 kasus laboratorium, dan 6 kasus detektif.
6. Coba pratinjau unit materi, kasus lab, dan kasus detektif.
7. Hapus data simulasi; profil murid non-simulasi seharusnya dipertahankan.

## C. Asesmen diagnostik

1. Login sebagai murid.
2. Pastikan asesmen berisi 12 soal dan beberapa soal menampilkan diagram SVG.
3. Tombol Lanjutkan tidak aktif sebelum pilihan dipilih.
4. Jawab semua soal dan pastikan ringkasan muncul.
5. Tinjau jawaban, ulangi asesmen, lalu pindah ke halaman lain dan kembali.
6. Tutup/muat ulang halaman. Pada browser yang sama, draf/hasil seharusnya dapat dilanjutkan.

## D. Materi dan Laboratorium

1. Pastikan 5 unit materi dapat dipilih.
2. Buka Laboratorium, lalu uji keenam kasus: ketuntasan nilai, saldo, gratis ongkir, ketersediaan buku, unggahan LMS, dan antrean.
3. Susun langkah, ubah simbol Input/Output dan Decision, periksa diagram, kemudian jalankan tracing.
4. Uji nilai/cabang Ya dan Tidak serta periksa keluaran.
5. Ubah urutan atau cabang, lalu muat ulang. Draft editor dan tab yang dipilih harus dipulihkan pada browser yang sama.

## E. Detektif Logika

1. Buka keenam kasus.
2. Pilih jawaban salah, periksa umpan balik dan petunjuk.
3. Pilih jawaban benar, pastikan kasus ditandai selesai.
4. Muat ulang halaman dan pastikan pilihan terakhir dipulihkan.

## F. Hasil, ekspor, dan aksesibilitas

1. Buka Hasil Belajar, pilih Kirim ringkasan ke admin, lalu login admin pada browser yang sama. Status harus terlihat sebagai sudah dikirim.
2. Unduh lencana SVG dan buka file untuk memeriksa nama.
3. Buka Pengaturan, aktifkan ukuran teks besar. Ukuran dasar dokumen harus berubah dari 16 px menjadi 18 px. Nonaktifkan kembali dan pastikan kembali ke 16 px.
4. Uji desktop, lebar 390 px, dan lebar 320 px. Tidak boleh ada pelebaran horizontal dokumen.

## Batasan interpretasi

Penyimpanan pada v0.4 hanya pada browser yang sama. Hasil uji manual ini tidak membuktikan sinkronisasi antardevice, keamanan autentikasi, atau efektivitas pembelajaran. Hal-hal tersebut menunggu integrasi backend dan pengujian penggunaan nyata.
