# Catatan Integrasi Backend untuk ALURIN v0.4

Dokumen ini menjelaskan batas antara frontend demo saat ini dan backend yang akan dikerjakan terpisah. Endpoint di bawah adalah **usulan kontrak API**, belum diimplementasikan atau dipanggil oleh frontend v0.4.

## Keadaan frontend saat ini

- Login murid: nama lengkap + kelas + nomor absen, disimpan pada `localStorage`.
- Login admin: kode demo yang ada di source frontend. Tidak aman untuk produksi.
- Penyimpanan progres: kunci lokal per profil seperti `alurin-stage2-progress::<studentId>`, `alurin-stage3-diagnostic::<studentId>`, `alurin-stage3-practice::<studentId>`, dan `alurin-v04-activity-state::<studentId>`.
- Registry admin demo: `alurin-v04-demo-students`.
- Sesi demo: `alurin-v04-demo-session`.
- Pengiriman hasil saat ini hanya mengisi `submittedAt` pada registry lokal.

Backend produksi perlu mengganti akses di atas dengan API. Jangan membaca atau menerima nilai skor yang dikirim frontend sebagai fakta yang sudah tepercaya. Server harus memvalidasi identitas, jawaban, hak akses, dan perhitungan skor.

## Usulan endpoint

| Method | Endpoint | Peran | Tujuan |
|---|---|---|---|
| POST | `/api/auth/student` | Murid | Login memakai identitas kelas + nomor absen serta PIN/kode akses yang disepakati |
| POST | `/api/auth/admin` | Admin | Login admin dengan password yang di-hash di server dan sesi aman |
| POST | `/api/auth/logout` | Semua | Mengakhiri sesi |
| GET | `/api/me` | Semua | Memulihkan sesi dan role |
| GET | `/api/learning-state` | Murid | Mengambil progres terakhir |
| PUT | `/api/learning-state` | Murid | Menyimpan progres asesmen/latihan secara idempoten |
| POST | `/api/assessments/attempts` | Murid | Mengirim percobaan asesmen dan jawaban untuk diverifikasi server |
| POST | `/api/results/submit` | Murid | Mengirim ringkasan hasil final |
| GET | `/api/admin/dashboard` | Admin | Mengambil ringkasan kelas dan metrik agregat |
| GET | `/api/admin/students` | Admin | Mencari/filter daftar murid |
| GET | `/api/admin/students/{id}` | Admin | Melihat detail progres satu murid |
| GET | `/api/admin/export.csv` | Admin | Mengunduh laporan yang dihasilkan server |
| GET | `/api/achievements/{id}` | Murid/Admin | Mengambil status pencapaian dan metadata lencana |

## Rancangan tabel data

Minimal, pertimbangkan tabel `users`, `sessions` atau penyimpanan sesi server, `learning_progress`, `assessment_attempts`, `assessment_answers`, `activity_results`, dan `achievements`. Kelas + nomor absen perlu memiliki constraint unik dalam lingkup kelas, bukan secara global. Simpan hash password admin, bukan teks biasa.

## Integrasi front-end yang disarankan

1. Buat `api-client.js` yang menyediakan fungsi login, logout, pemulihan sesi, simpan progres, kirim hasil, dan endpoint admin.
2. Pilih mode `demo` atau `api` melalui konfigurasi. Mode `api` tidak boleh diam-diam kembali ke `localStorage` jika API gagal; tampilkan status belum tersinkronisasi.
3. Saat login API berhasil, server menentukan role. Frontend hanya menggunakan role untuk tampilan; server tetap memeriksa izin pada setiap endpoint.
4. Gunakan autosave dengan debounce, ID operasi/idempotency key, status `Menyimpan/Tersimpan/Belum tersinkronisasi`, dan mekanisme retry.
5. Simpan database pada persistent storage dan lakukan backup terjadwal. Untuk SQLite, mulai dari satu proses backend/instance, gunakan transaksi singkat, dan uji konkurensi. Jika beban meningkat, pertimbangkan PostgreSQL.
6. Tambahkan HTTPS, proteksi CSRF bila menggunakan cookie, cookie `HttpOnly`, `Secure`, `SameSite`, validasi input, rate limit login, dan logging yang tidak membocorkan data murid.

## Catatan privasi

Sebelum menggunakan nama lengkap, kelas, nomor absen, atau hasil belajar sungguhan, tetapkan siapa yang boleh mengakses data, durasi retensi, mekanisme backup/penghapusan, dan pemberitahuan kepada sekolah/murid sesuai aturan yang berlaku. Gunakan data fiktif selama integrasi.
