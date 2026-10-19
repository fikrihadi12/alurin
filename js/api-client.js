/**
 * ALURIN API Client
 * Mengelola komunikasi asinkron antara browser dan server backend.
 * Mendukung auto-resume progres belajar murid, heartbeat, dan live-feed guru.
 */
(() => {
  'use strict';

  let saveTimer = null;
  let heartbeatTimer = null;

  const ALURIN_API = {
    // Autentikasi Murid (Auto-Resume)
    async studentLogin(name, className, attendance) {
      const res = await fetch('/api/auth/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, className, attendance }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal masuk sebagai murid');
      
      // Simpan backup session lokal
      localStorage.setItem('alurin_session', JSON.stringify({
        role: 'student',
        ...data.student
      }));

      this.startHeartbeat();
      return data;
    },

    // Autosave Progres Belajar Murid ke Server (Debounced)
    saveStudentState(stateData, immediate = false) {
      if (saveTimer) clearTimeout(saveTimer);

      const doSave = async () => {
        try {
          await fetch('/api/student/state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stateData),
            credentials: 'include'
          });
        } catch (e) {
          console.warn('[ALURIN API] Gagal sync state ke server (mungkin offline):', e.message);
        }
      };

      if (immediate) {
        return doSave();
      } else {
        saveTimer = setTimeout(doSave, 800);
      }
    },

    // Simpan Skor Akhir Murid
    async submitStudentScore(totalCorrect, totalQuestions, concepts) {
      const res = await fetch('/api/student/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalCorrect, totalQuestions, concepts }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan skor');
      return data;
    },

    // Heartbeat rutin agar murid terdeteksi online di portal guru
    startHeartbeat() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(async () => {
        try {
          await fetch('/api/student/heartbeat', {
            method: 'POST',
            credentials: 'include'
          });
        } catch {}
      }, 25000);
    },

    // Autentikasi Guru
    async teacherLogin(username, password) {
      const res = await fetch('/api/auth/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal login guru');
      
      localStorage.setItem('alurin_session', JSON.stringify({
        role: 'teacher',
        ...data.teacher
      }));
      return data;
    },

    // Mengambil Live Feed Real-time untuk Dashboard Guru
    async teacherGetLiveFeed() {
      const res = await fetch('/api/teacher/live-feed', {
        method: 'GET',
        credentials: 'include'
      });
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat live feed');
      return data;
    },

    // Memeriksa Sesi Aktif
    async checkSession() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            if (data.user.role === 'student') this.startHeartbeat();
            return data.user;
          }
        }
      } catch {}

      // Fallback ke localStorage
      try {
        const local = JSON.parse(localStorage.getItem('alurin_session') || 'null');
        return local;
      } catch {
        return null;
      }
    },

    // Logout
    async logout() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch {}
      localStorage.removeItem('alurin_session');
      localStorage.removeItem('alurin-v04-demo-session');
    }
  };

  globalThis.ALURIN_API = ALURIN_API;
})();
