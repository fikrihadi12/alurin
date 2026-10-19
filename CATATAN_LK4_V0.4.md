# Catatan Pendukung LK 4 — ALURIN v0.4

## Identitas karya

**Nama karya:** ALURIN, Media Pembelajaran Informatika Interaktif untuk Algoritma dan Flowchart.

**Sasaran:** Peserta didik kelas X/Fase E yang mempelajari algoritma, simbol flowchart, percabangan, dan tracing. Prototipe juga menyediakan mode admin demo untuk meninjau progres.

## Pengembangan pada versi ini

ALURIN v0.4 mengembangkan prototipe dari sisi alur penggunaan dan variasi konten. Perubahan meliputi login demo berdasarkan role murid/admin, dashboard admin dengan ringkasan, daftar profil, detail aktivitas, filter dan ekspor CSV, lima unit materi, asesmen 12 soal dengan diagram SVG, enam kasus Laboratorium Flowchart, dan enam kasus Detektif Logika. Draft asesmen, aktivitas, serta pilihan kasus disimpan di browser untuk menunjukkan konsep persistence pada tingkat prototipe.

## Uji internal

Mesin flowchart dan tracing diuji melalui unit test, mesin adaptif diuji pada 12 soal, dan interaksi UI diuji dengan Chromium pada desktop, ponsel, dan layar sempit. Skenario mencakup login demo, pembatasan navigasi berbasis role, filter dan ekspor admin, pengerjaan diagnostik, seluruh skenario lab, semua kasus detektif, penyimpanan lokal, unduhan lencana, serta pengaturan ukuran teks.

**Hasil ini adalah uji fungsi perangkat lunak, bukan uji efektivitas belajar.** Belum ada data dari murid sungguhan atau penelitian peningkatan hasil belajar.

## Batasan yang harus dituliskan secara jujur

Login dan role masih berjalan di frontend, sehingga tidak aman untuk deployment publik. Dashboard hanya melihat data yang tersimpan di browser yang sama. Tombol pengiriman hasil hanya menandai status lokal. Database terpusat, sinkronisasi lintas perangkat, dan autentikasi aman menunggu integrasi backend dari rekan pengembang. Implementasi pada kelas nyata dan telaah sejawat menjadi tindak lanjut.

## Rencana tindak lanjut

1. Integrasikan frontend dengan API dan database terpusat.
2. Ganti login demo dengan autentikasi server, sesi aman, dan otorisasi pada setiap endpoint.
3. Uji autosave, pemulihan sesi, sinkronisasi, dan backup.
4. Minta rekan PPG menelaah kesesuaian materi, kualitas umpan balik, dan kemudahan penggunaan.
5. Lakukan uji coba terbatas setelah persetujuan dan pengamanan data tersedia.
