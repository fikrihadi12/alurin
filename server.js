const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_jwt_alurin_panjang_dan_aman_2026';

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper: Seed Default Teacher jika belum ada
async function ensureDefaultTeacher() {
  try {
    const count = await prisma.teacher.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('alurin2026', 10);
      await prisma.teacher.create({
        data: {
          username: 'guru',
          password: hashedPassword,
          name: 'Guru Informatika ALURIN'
        }
      });
      console.log('==> Akun default guru berhasil dibuat: username "guru" / password "alurin2026"');
    }
  } catch (err) {
    console.error('Peringatan: Gagal memeriksa/membuat akun default guru:', err.message);
  }
}

// Token Helpers
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyTokenFromReq(req) {
  let token = req.cookies?.alurin_token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function authStudentMiddleware(req, res, next) {
  const user = verifyTokenFromReq(req);
  if (!user || user.role !== 'student') {
    return res.status(401).json({ error: 'Sesi murid tidak valid atau telah berakhir' });
  }
  req.user = user;
  next();
}

function authTeacherMiddleware(req, res, next) {
  const user = verifyTokenFromReq(req);
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return res.status(401).json({ error: 'Akses khusus guru. Silakan login terlebih dahulu.' });
  }
  req.user = user;
  next();
}

// ==========================================
// API ROUTES: AUTENTIKASI & MURID
// ==========================================

// Login Murid (Auto-Resume: Kembalikan data lama jika sudah pernah masuk)
app.post('/api/auth/student', async (req, res) => {
  try {
    const { name, className, attendance } = req.body;
    if (!name || !className || attendance === undefined || attendance === null) {
      return res.status(400).json({ error: 'Nama lengkap, kelas, dan nomor absen wajib diisi.' });
    }

    const cleanName = String(name).trim();
    const cleanClass = String(className).trim().toUpperCase();
    const absentNo = parseInt(attendance, 10);

    if (!cleanName || !cleanClass || isNaN(absentNo) || absentNo < 1 || absentNo > 99) {
      return res.status(400).json({ error: 'Format data murid tidak valid (Absen 1-99).' });
    }

    // Cari atau buat Session untuk kelas ini
    let session = await prisma.session.findUnique({
      where: { code: cleanClass }
    });
    if (!session) {
      session = await prisma.session.create({
        data: {
          code: cleanClass,
          className: cleanClass,
          isActive: true
        }
      });
    }

    // Cari murid berdasarkan sessionId dan absentNo
    let student = await prisma.student.findUnique({
      where: {
        sessionId_absentNo: {
          sessionId: session.id,
          absentNo: absentNo
        }
      },
      include: {
        state: true,
        scores: true
      }
    });

    let isResume = false;
    const now = new Date();

    if (student) {
      // Murid sudah ada: Perbarui nama (jika ada typo) dan lastActiveAt
      isResume = true;
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          name: cleanName,
          lastActiveAt: now
        },
        include: {
          state: true,
          scores: true
        }
      });
    } else {
      // Murid baru pertama kali masuk: Buat record Student dan inisialisasi LearningState
      student = await prisma.student.create({
        data: {
          sessionId: session.id,
          name: cleanName,
          absentNo: absentNo,
          currentRoute: 'beranda',
          currentStep: 'Mulai Belajar',
          lastActiveAt: now,
          state: {
            create: {
              diagnosticAnswers: '{}',
              diagnosticStep: 0
            }
          }
        },
        include: {
          state: true,
          scores: true
        }
      });
    }

    const payload = {
      role: 'student',
      id: student.id,
      name: student.name,
      className: cleanClass,
      attendance: student.absentNo
    };

    const token = generateToken(payload);

    res.cookie('alurin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token,
      isResume,
      student: {
        id: student.id,
        name: student.name,
        className: cleanClass,
        attendance: student.absentNo,
        currentRoute: student.currentRoute,
        currentStep: student.currentStep,
        isFinished: student.isFinished
      },
      state: student.state,
      scores: student.scores
    });
  } catch (err) {
    console.error('Error /api/auth/student:', err);
    return res.status(500).json({ error: 'Gagal memproses masuk murid.' });
  }
});

// Update State Murid secara Real-Time (Autosave saat menjawab / ganti aktivitas)
const handleStudentStateUpdate = async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      currentRoute,
      currentStep,
      diagnosticAnswers,
      diagnosticStep,
      diagnosticReport,
      labStateJson,
      detectiveStateJson,
      isFinished
    } = req.body;

    const now = new Date();

    // Update Student data
    const studentUpdate = { lastActiveAt: now };
    if (typeof currentRoute === 'string') studentUpdate.currentRoute = currentRoute;
    if (typeof currentStep === 'string') studentUpdate.currentStep = currentStep;
    if (typeof isFinished === 'boolean') studentUpdate.isFinished = isFinished;

    await prisma.student.update({
      where: { id: studentId },
      data: studentUpdate
    });

    // Update LearningState
    const stateUpdate = {};
    if (diagnosticAnswers !== undefined) {
      stateUpdate.diagnosticAnswers = typeof diagnosticAnswers === 'string' ? diagnosticAnswers : JSON.stringify(diagnosticAnswers);
    }
    if (Number.isInteger(diagnosticStep)) {
      stateUpdate.diagnosticStep = diagnosticStep;
    }
    if (diagnosticReport !== undefined) {
      stateUpdate.diagnosticReport = typeof diagnosticReport === 'string' ? diagnosticReport : (diagnosticReport ? JSON.stringify(diagnosticReport) : null);
    }
    if (labStateJson !== undefined) {
      stateUpdate.labStateJson = typeof labStateJson === 'string' ? labStateJson : (labStateJson ? JSON.stringify(labStateJson) : null);
    }
    if (detectiveStateJson !== undefined) {
      stateUpdate.detectiveStateJson = typeof detectiveStateJson === 'string' ? detectiveStateJson : (detectiveStateJson ? JSON.stringify(detectiveStateJson) : null);
    }

    const updatedState = await prisma.learningState.upsert({
      where: { studentId },
      update: stateUpdate,
      create: {
        studentId,
        diagnosticAnswers: stateUpdate.diagnosticAnswers || '{}',
        diagnosticStep: stateUpdate.diagnosticStep || 0,
        diagnosticReport: stateUpdate.diagnosticReport || null,
        labStateJson: stateUpdate.labStateJson || null,
        detectiveStateJson: stateUpdate.detectiveStateJson || null
      }
    });

    return res.json({
      success: true,
      savedAt: now.toISOString(),
      state: updatedState
    });
  } catch (err) {
    console.error('Error /api/student/state:', err);
    return res.status(500).json({ error: 'Gagal menyimpan progres belajar.' });
  }
};
app.put('/api/student/state', authStudentMiddleware, handleStudentStateUpdate);
app.post('/api/student/state', authStudentMiddleware, handleStudentStateUpdate);

// Heartbeat Murid (Ping agar tetap terdeteksi online di portal guru)
app.post('/api/student/heartbeat', authStudentMiddleware, async (req, res) => {
  try {
    await prisma.student.update({
      where: { id: req.user.id },
      data: { lastActiveAt: new Date() }
    });
    return res.json({ success: true, timestamp: Date.now() });
  } catch (err) {
    return res.status(500).json({ error: 'Heartbeat error' });
  }
});

// Simpan Skor Diagnostik Final Murid
app.post('/api/student/score', authStudentMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { totalCorrect, totalQuestions, concepts } = req.body;

    const percentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    // Simpan skor final
    await prisma.score.upsert({
      where: {
        studentId_conceptType: {
          studentId,
          conceptType: 'FINAL'
        }
      },
      update: {
        correct: totalCorrect,
        total: totalQuestions,
        percentage
      },
      create: {
        studentId,
        conceptType: 'FINAL',
        correct: totalCorrect,
        total: totalQuestions,
        percentage
      }
    });

    // Simpan rincian skor per konsep
    if (concepts && typeof concepts === 'object') {
      for (const [conceptKey, data] of Object.entries(concepts)) {
        const cTotal = data.total || 3;
        const cCorrect = data.correct || 0;
        const cPercent = cTotal > 0 ? (cCorrect / cTotal) * 100 : 0;
        await prisma.score.upsert({
          where: {
            studentId_conceptType: {
              studentId,
              conceptType: conceptKey.toUpperCase()
            }
          },
          update: { correct: cCorrect, total: cTotal, percentage: cPercent },
          create: { studentId, conceptType: conceptKey.toUpperCase(), correct: cCorrect, total: cTotal, percentage: cPercent }
        });
      }
    }

    await prisma.student.update({
      where: { id: studentId },
      data: {
        isFinished: true,
        currentStep: `Selesai Diagnostik (${totalCorrect}/${totalQuestions})`,
        lastActiveAt: new Date()
      }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Error /api/student/score:', err);
    return res.status(500).json({ error: 'Gagal menyimpan skor.' });
  }
});

// ==========================================
// API ROUTES: GURU / ADMIN & REALTIME
// ==========================================

// Login Guru
app.post('/api/auth/teacher', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Nama pengguna dan kata sandi wajib diisi.' });
    }

    const cleanUser = String(username).trim();
    let teacher = await prisma.teacher.findUnique({
      where: { username: cleanUser }
    });

    // Auto-create jika akun guru belum ada dan menggunakan default
    if (!teacher && (cleanUser === 'guru' || cleanUser === 'admin') && password === 'alurin2026') {
      const hashedPassword = await bcrypt.hash('alurin2026', 10);
      teacher = await prisma.teacher.create({
        data: {
          username: cleanUser,
          password: hashedPassword,
          name: 'Guru Informatika ALURIN'
        }
      });
    }

    if (!teacher) {
      return res.status(401).json({ error: 'Nama pengguna atau kata sandi salah.' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nama pengguna atau kata sandi salah.' });
    }

    const token = generateToken({
      role: 'teacher',
      id: teacher.id,
      username: teacher.username,
      name: teacher.name
    });

    res.cookie('alurin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token,
      teacher: {
        id: teacher.id,
        username: teacher.username,
        name: teacher.name
      }
    });
  } catch (err) {
    console.error('Error /api/auth/teacher:', err);
    return res.status(500).json({ error: 'Gagal login guru.' });
  }
});

// Check Session Aktif
app.get('/api/auth/me', (req, res) => {
  const user = verifyTokenFromReq(req);
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({ authenticated: true, user });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('alurin_token');
  return res.json({ success: true });
});

// Real-Time Live Feed untuk Portal Guru
app.get('/api/teacher/live-feed', authTeacherMiddleware, async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        session: true,
        state: true,
        scores: true
      },
      orderBy: [
        { session: { className: 'asc' } },
        { absentNo: 'asc' }
      ]
    });

    const now = Date.now();
    let onlineCount = 0;

    const data = students.map((s) => {
      const lastActive = new Date(s.lastActiveAt).getTime();
      const diffMs = now - lastActive;
      const isOnline = diffMs < 45000; // Aktif dalam 45 detik terakhir
      if (isOnline) onlineCount++;

      const finalScore = s.scores.find((sc) => sc.conceptType === 'FINAL');
      let diagnosticAnswers = {};
      try {
        if (s.state?.diagnosticAnswers) diagnosticAnswers = JSON.parse(s.state.diagnosticAnswers);
      } catch {}

      const answeredCount = Object.keys(diagnosticAnswers).length;

      return {
        id: s.id,
        name: s.name,
        className: s.session.className,
        attendance: s.absentNo,
        currentRoute: s.currentRoute,
        currentStep: s.currentStep,
        isOnline,
        isFinished: s.isFinished,
        answeredCount,
        diagnosticStep: s.state?.diagnosticStep || 0,
        diagnosticComplete: !!finalScore || s.isFinished,
        scoreString: finalScore ? `${finalScore.correct}/${finalScore.total}` : (answeredCount > 0 ? `${answeredCount}/12 dijawab` : 'Belum mulai'),
        lastActiveAt: s.lastActiveAt,
        updatedAt: s.updatedAt
      };
    });

    const classes = [...new Set(data.map((d) => d.className))].sort();

    return res.json({
      success: true,
      timestamp: now,
      summary: {
        totalStudents: data.length,
        onlineCount,
        finishedCount: data.filter((d) => d.isFinished).length,
        classes
      },
      students: data
    });
  } catch (err) {
    console.error('Error /api/teacher/live-feed:', err);
    return res.status(500).json({ error: 'Gagal mengambil data real-time guru.' });
  }
});

// Ekspor Rekapan Nilai ke CSV
app.get('/api/teacher/export.csv', authTeacherMiddleware, async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        session: true,
        scores: true
      },
      orderBy: [
        { session: { className: 'asc' } },
        { absentNo: 'asc' }
      ]
    });

    let csv = 'Nama Lengkap,Kelas,Nomor Absen,Status Asesmen,Skor Akhir,Persentase,Terakhir Aktif\n';

    for (const s of students) {
      const finalScore = s.scores.find((sc) => sc.conceptType === 'FINAL');
      const scoreStr = finalScore ? `${finalScore.correct}/${finalScore.total}` : '0/12';
      const percentStr = finalScore ? `${finalScore.percentage.toFixed(1)}%` : '0%';
      const statusStr = s.isFinished ? 'Selesai' : 'Sedang Belajar';
      const dt = new Date(s.lastActiveAt).toLocaleString('id-ID');

      csv += `"${s.name.replace(/"/g, '""')}","${s.session.className}",${s.absentNo},"${statusStr}","${scoreStr}","${percentStr}","${dt}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="alurin_rekap_nilai_kelas.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('Error export csv:', err);
    return res.status(500).send('Gagal mengekspor CSV.');
  }
});

// ==========================================
// STATIC FILES & CLEAN HTML5 SPA ROUTING
// ==========================================

// 404 Handler untuk rute API yang tidak dikenal
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint API tidak ditemukan' });
});

// Sajikan file statis (css, js, assets, dll)
app.use(express.static(path.join(__dirname)));

// Clean Routing Fallback: Setiap rute non-API dialihkan ke index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Jalankan Server & Pastikan Akun Guru Siap
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 ALURIN Server aktif di http://localhost:${PORT}`);
  console.log(`📱 Portal Murid: http://localhost:${PORT}/`);
  console.log(`👨‍🏫 Portal Guru : http://localhost:${PORT}/guru/login`);
  console.log(`=======================================================`);
  await ensureDefaultTeacher();
});
