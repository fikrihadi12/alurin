/**
 * ALURIN | Tahap 3 — Laboratorium interaktif dan Detektif Logika
 * Vanilla JavaScript, tanpa framework, tanpa fetch, tanpa server aplikasi.
 * Editor terpandu, tracing, asesmen 12 soal, role demo, dan bantuan adaptif aktif.
 */
(() => {
  'use strict';

  const BUILD_VERSION='v0.4.0';
  const PAGES = {
    beranda: { label: 'Beranda', sub: 'Tempat memulai perjalanan belajar', icon: 'home' },
    diagnostik: { label: 'Asesmen Diagnostik', sub: 'Mengenali kesiapan awal', icon: 'clipboard' },
    materi: { label: 'Jelajah Konsep', sub: 'Materi algoritma dan flowchart', icon: 'book' },
    laboratorium: { label: 'Laboratorium Flowchart', sub: 'Mencoba dan menelusuri alur', icon: 'blocks' },
    detektif: { label: 'Detektif Logika', sub: 'Belajar dari kesalahan alur', icon: 'bug' },
    hasil: { label: 'Hasil Belajar', sub: 'Refleksi dan perkembangan', icon: 'chart' },
    login: { label: 'Masuk ALURIN', sub: 'Portal Masuk Siswa', icon: 'lock' },
    'guru-login': { label: 'Portal Guru', sub: 'Masuk Guru Informatika', icon: 'lock' },
    admin: { label: 'Dashboard Guru', sub: 'Pemantauan pembelajaran kelas', icon: 'chart' },
  };
  const NAV = ['beranda','diagnostik','materi','laboratorium','detektif','hasil'];
  const MOBILE_NAV = ['beranda','materi','laboratorium','detektif','hasil'];
  const SESSION_KEY='alurin_session';
  const STUDENTS_KEY='alurin-v04-demo-students';
  const ICON = (name, className='') => `<svg class="ico ${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const btn = (url, label, type='primary', icon='arrow-right') => `<a class="btn btn-${type}" href="/${url.replace(/^#\/?/, '')}">${label} ${icon ? ICON(icon) : ''}</a>`;
  const pill = (text='Prototipe Tahap 3', type='blue') => `<span class="badge badge-${type}">${text}</span>`;
  const pageHead = (kicker, title, desc, badge='') => `<header class="page-head"><div><span class="kicker">${kicker}</span><h1>${title}</h1><p>${desc}</p></div>${badge ? `<div>${badge}</div>` : ''}</header>`;
  let activeRoute = 'beranda';
  let selectedUnit = 0;
  let selectedCase = 0;
  let selectedLabTab = 0;
  let diagramZoom = false;
  let modalName = null;
  let previousFocus = null;
  const app = document.getElementById('app');
  const dialogRoot = document.getElementById('dialog-root');
  let currentSession = loadSession();
  let adminTab='overview';
  let adminSearch='';
  let adminClassFilter='all';
  let adminStatusFilter='all';
  let selectedAdminStudentId=null;
  let adminPreview=null;

  const unitData = [
    {
      title: 'Algoritma dalam Kehidupan',
      subtitle: 'Belajar menyusun langkah yang jelas dan runtut.',
      bigIdea: 'Algoritma yang baik dapat dipahami dan diikuti orang lain tanpa harus menebak langkah berikutnya.',
      body: 'Algoritma adalah rangkaian langkah yang logis, sistematis, terbatas, dan berorientasi tujuan. Kita menggunakan algoritma ketika mengirim tugas, membeli makanan, atau menggunakan aplikasi. Hal yang perlu diperiksa bukan hanya apakah hasilnya benar, tetapi juga apakah setiap langkah sudah jelas.',
      exampleTitle: 'Contoh kontekstual: Mengirim tugas melalui LMS',
      steps: ['Masuk ke aplikasi atau situs LMS menggunakan akun.', 'Pilih mata pelajaran dan tugas yang sesuai.', 'Baca instruksi, kemudian pilih file tugas.', 'Unggah file dan periksa apakah proses berhasil.', 'Tekan tombol kumpulkan dan pastikan status terkirim.'],
      question: 'Bagaimana jika langkah memeriksa unggahan dihilangkan? Apa risikonya?',
    },
    {
      title: 'Membaca Simbol Flowchart',
      subtitle: 'Kenali fungsi simbol, bukan sekadar bentuknya.',
      bigIdea: 'Flowchart memperlihatkan alur algoritma secara visual. Simbol yang berbeda menyampaikan fungsi langkah yang berbeda.',
      body: 'Terminator digunakan untuk mulai dan selesai, Input/Output untuk menerima atau menampilkan data, Process untuk mengolah data, Decision untuk memeriksa kondisi, dan Flowline untuk menunjukkan arah alur. Pada keputusan, cabang Ya dan Tidak harus sesuai dengan makna kondisi.',
      exampleTitle: 'Simbol inti yang dipelajari',
      question: 'Kapan sebuah langkah perlu menggunakan simbol Decision dan bukan Process?',
    },
    {
      title: 'Dari Flowchart ke Pseudocode',
      subtitle: 'Tiga bentuk, satu logika yang konsisten.',
      bigIdea: 'Algoritma naratif, flowchart, dan pseudocode dapat berbeda bentuk tetapi harus menggambarkan langkah dan keputusan yang sama.',
      body: 'Pseudocode menggunakan instruksi terstruktur yang mendekati bentuk pemrograman, tetapi tidak terikat sintaks satu bahasa tertentu. Jika sebuah flowchart memiliki keputusan berdasarkan batas nilai 75, pseudocode harus mempertahankan kondisi dan keluaran yang sama.',
      exampleTitle: 'Contoh pseudocode sederhana',
      steps: ['Mulai', 'Masukkan nilai', 'Jika nilai ≥ 75, tampilkan “Tuntas”', 'Jika tidak, tampilkan “Belum Tuntas”', 'Selesai'],
      question: 'Jika cabang Ya dan Tidak tertukar pada flowchart, apakah pseudocode masih setara?',
    },
    {
      title: 'Percabangan dan Kondisi Batas', subtitle: 'Memahami syarat, operator, dan jalur Ya atau Tidak.',
      bigIdea: 'Operator perbandingan menentukan siapa yang masuk ke setiap cabang. Perbedaan satu simbol dapat mengubah hasil pada nilai batas.',
      body: 'Percabangan memilih tindakan berdasarkan kondisi. Operator > berarti lebih besar dari, sedangkan ≥ berarti lebih besar dari atau sama dengan. Karena itu, kondisi nilai ≥ 75 menerima nilai 75, sementara nilai > 75 tidak menerima nilai yang tepat 75.',
      exampleTitle: 'Contoh: syarat gratis ongkir',
      steps: ['Mulai', 'Masukkan total belanja', 'Periksa apakah total ≥ Rp100.000', 'Jika Ya, tampilkan Gratis Ongkir', 'Jika Tidak, tampilkan Ongkir Normal', 'Selesai'],
      question: 'Apa perbedaan hasil ketika operator ≥ Rp100.000 diganti menjadi > Rp100.000 dan total belanja tepat Rp100.000?'
    },
    {
      title: 'Tracing dan Debugging', subtitle: 'Menelusuri langkah untuk menemukan sumber kesalahan.',
      bigIdea: 'Tracing membantu memeriksa nilai dan jalur yang dilewati. Debugging dimulai dengan menguji dugaan secara sistematis, bukan menebak-nebak.',
      body: 'Saat melakukan tracing, ikuti algoritma dari Mulai sampai Selesai sambil mencatat nilai masukan, kondisi, cabang yang dipilih, dan keluaran. Jika hasil berbeda dari harapan, periksa kembali urutan, operator kondisi, dan hubungan cabang. Uji juga nilai batas serta nilai yang berada di bawah dan di atas batas.',
      exampleTitle: 'Tiga pengujian sederhana untuk kondisi nilai ≥ 75',
      steps: ['Uji nilai 74, kondisi seharusnya Tidak.', 'Uji nilai 75, kondisi seharusnya Ya.', 'Uji nilai 76, kondisi seharusnya Ya.', 'Bandingkan keluaran aktual dengan keluaran yang diharapkan.', 'Perbaiki satu hal pada satu waktu, lalu jalankan pengujian ulang.'],
      question: 'Mengapa nilai yang tepat sama dengan batas penting untuk menguji logika percabangan?'
    }
  ];
  const caseData = [
    {name:'Kasus 1',short:'Urutan tidak logis',title:'Syarat diperiksa terlalu cepat',desc:'Sebuah flowchart memeriksa apakah nilai mencapai 75 sebelum data nilai dimasukkan. Masalahnya bukan pada angka 75, melainkan kapan kondisi itu diperiksa.',tasks:['Baca diagram dari Mulai sampai Selesai.','Temukan langkah yang diletakkan terlalu awal.','Jelaskan urutan yang benar dan alasannya.'],hint:'Dari mana sistem mendapatkan nilai yang akan diperiksa?'},
    {name:'Kasus 2',short:'Simbol tidak sesuai',title:'Proses atau keputusan?',desc:'Perintah “Apakah saldo mencukupi?” digambar sebagai Process. Padahal langkah tersebut menentukan dua kemungkinan alur.',tasks:['Kenali fungsi langkah yang diperiksa.','Bandingkan penggunaan Process dan Decision.','Tentukan simbol yang lebih tepat serta alasannya.'],hint:'Jika sebuah kondisi menghasilkan dua jalur, simbol apa yang diperlukan?'},
    {name:'Kasus 3',short:'Cabang tertukar',title:'Keluaran tidak sesuai kondisi',desc:'Pada pemeriksaan nilai ≥ 75, jalur Ya justru menuju keluaran “Belum Tuntas”. Periksa apakah hubungan kondisi dan keluaran sudah konsisten.',tasks:['Baca makna kondisi pada Decision.','Ikuti jalur Ya dan Tidak secara terpisah.','Tunjukkan jalur mana yang perlu diperbaiki.'],hint:'Untuk nilai 80, apakah keluaran yang diharapkan sudah sesuai?'},
    {name:'Kasus 4',short:'Akhir alur hilang',title:'Program tidak memiliki titik akhir',desc:'Sebuah flowchart menampilkan hasil, tetapi diagram tidak memiliki simbol Selesai. Pembaca tidak mengetahui dengan jelas di mana algoritma berakhir.',tasks:['Periksa bagian akhir alur.','Tentukan simbol yang perlu ditambahkan.','Jelaskan mengapa alur perlu berakhir secara eksplisit.'],hint:'Simbol apa yang menandai Mulai dan Selesai?'},
    {name:'Kasus 5',short:'Batas kondisi',title:'Nilai tepat di batas ditolak',desc:'Syarat gratis ongkir adalah total belanja ≥ Rp100.000, tetapi transaksi tepat Rp100.000 ditolak. Periksa operator yang digunakan.',tasks:['Bandingkan operator > dan ≥.','Uji kondisi dengan nilai Rp100.000.','Pilih perbaikan yang mempertahankan syarat awal.'],hint:'Apakah operator yang dipakai sudah menerima nilai yang sama dengan batas?'},
    {name:'Kasus 6',short:'Tracing keliru',title:'Keluaran tidak sesuai masukan',desc:'Sistem menerima nilai 68 dan memeriksa nilai ≥ 70, tetapi menampilkan “Lulus”. Telusuri hasil kondisi sebelum memilih perbaikan.',tasks:['Bandingkan 68 dengan 70.','Tentukan apakah kondisi benar atau salah.','Perbaiki jalur dan keluaran yang sesuai.'],hint:'Jika 68 lebih kecil dari 70, cabang mana yang harus dilewati?'}
  ];

  const engine = globalThis.ALURIN_ENGINE;
  const stage2 = globalThis.ALURIN_STAGE2_VIEWS;
  const adaptive = globalThis.ALURIN_ADAPTIVE;
  const stage3 = globalThis.ALURIN_STAGE3_VIEWS;
  let labState = engine.initialLab();
  let detectiveSelections = {};
  let detectiveFeedback = {};
  let detectiveHint = {};
  let progress = loadProgress();
  let practice = loadPractice();
  let diagnosticState = loadDiagnostic();
  let selectedConcept = null;
  restoreActivityState();
  function loadSession(){
    try { const x=JSON.parse(localStorage.getItem(SESSION_KEY)||'null'); return x&&['student','admin','teacher'].includes(x.role)&&typeof x.id==='string'?x:null; } catch { return null; }
  }
  function getStudentStepDesc() {
    if (activeRoute === 'diagnostik') {
      if (diagnosticState?.report) return 'Diagnostik Selesai';
      return `Diagnostik: Soal ${(diagnosticState?.step || 0) + 1}/12`;
    }
    if (activeRoute === 'laboratorium') return `Laboratorium: Kasus ${labState?.scenario || 1}`;
    if (activeRoute === 'detektif') return `Detektif: Kasus ${selectedCase + 1}`;
    if (activeRoute === 'materi') return `Materi: Unit ${selectedUnit + 1}`;
    if (activeRoute === 'hasil') return 'Melihat Hasil Belajar';
    return 'Di Beranda';
  }
  function triggerServerSync() {
    if (!currentSession || currentSession.role !== 'student' || !globalThis.ALURIN_API) return;
    globalThis.ALURIN_API.saveStudentState({
      currentRoute: activeRoute,
      currentStep: getStudentStepDesc(),
      diagnosticAnswers: diagnosticState?.answers || {},
      diagnosticStep: diagnosticState?.step || 0,
      diagnosticReport: diagnosticState?.report || null,
      labStateJson: labState,
      detectiveStateJson: detectiveSelections,
      isFinished: !!diagnosticState?.report
    });
  }
  function activeStorageKey(key){return currentSession?.role==='student'?`${key}::${currentSession.id}`:key;}
  function readStudentRecords(){try{const x=JSON.parse(localStorage.getItem(STUDENTS_KEY)||'[]');return Array.isArray(x)?x.filter(r=>r&&typeof r.id==='string'):[];}catch{return [];}}
  function writeStudentRecords(records){safeLocalSet(STUDENTS_KEY,JSON.stringify(records));}
  function studentRecordId(className,attendance){return `${String(className).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${String(attendance).trim()}`;}
  function syncStudentRecord(){
    if(!currentSession||currentSession.role!=='student')return;
    const records=readStudentRecords(),now=new Date().toISOString();
    const idx=records.findIndex(r=>r.id===currentSession.id);
    const old=idx>=0?records[idx]:{};
    const report=diagnosticState?.report;
    const rec={...old,id:currentSession.id,name:currentSession.name,className:currentSession.className,attendance:currentSession.attendance,isDemo:false,createdAt:old.createdAt||now,updatedAt:now,lastActivity:activeRoute||'login',diagnosticComplete:!!report,diagnosticCorrect:report?.correct??null,diagnosticTotal:report?.total??adaptive.QUESTIONS.length,labCompleted:progress?.lab?.length||0,labTotal:Object.keys(engine.SCENARIOS).length,detectiveCompleted:progress?.detective?.length||0,detectiveTotal:engine.DETECTIVE.length,practiceErrors:Object.values(practice?.mistakes||{}).reduce((a,b)=>a+b,0),submittedAt:old.submittedAt||null,concepts:report?.concepts||null};
    if(idx>=0)records[idx]=rec;else records.push(rec);writeStudentRecords(records);
  }
  function saveActivityState(){
    const snapshot={labState:{scenario:labState.scenario,order:labState.order,types:labState.types,branches:labState.branches,hintLevel:labState.hintLevel,draft:labState.draft||null},trace:labState.trace?{values:labState.trace.values,index:labState.trace.index}:null,selectedUnit,selectedCase,selectedLabTab,diagramZoom,detectiveSelections,detectiveHint};
    safeLocalSet(activeStorageKey('alurin-v04-activity-state'),JSON.stringify(snapshot));syncStudentRecord();triggerServerSync();
  }
  function restoreActivityState(){
    let x=null;try{x=JSON.parse(localStorage.getItem(activeStorageKey('alurin-v04-activity-state'))||'null');}catch{}
    if(!x||typeof x!=='object')return;
    if(x.labState&&Object.prototype.hasOwnProperty.call(engine.SCENARIOS,x.labState.scenario)){
      const raw=x.labState,base=engine.initialLab(raw.scenario),allowed=['start','input','decision','end'];
      if(Array.isArray(raw.order)&&raw.order.length===4&&new Set(raw.order).size===4&&raw.order.every(v=>allowed.includes(v)))base.order=raw.order.slice();
      if(raw.types&&typeof raw.types==='object')for(const key of Object.keys(engine.EXPECTED_TYPES))if(['terminator','io','process','decision'].includes(raw.types[key]))base.types[key]=raw.types[key];
      if(raw.branches&&typeof raw.branches==='object'){base.branches.yes=['yes','no'].includes(raw.branches.yes)?raw.branches.yes:'no';base.branches.no=['yes','no'].includes(raw.branches.no)?raw.branches.no:'yes';}
      base.hintLevel=Number.isInteger(raw.hintLevel)?Math.max(0,Math.min(3,raw.hintLevel)):0;base.draft=raw.draft&&typeof raw.draft==='object'?raw.draft:null;labState=base;
      if(x.trace&&x.trace.values&&engine.validate(base).ok){const traced=engine.trace(base,x.trace.values);if(traced.ok){base.checked=true;base.feedback=engine.validate(base);base.trace={data:traced,index:Math.max(0,Math.min(traced.events.length-1,Number.isInteger(x.trace.index)?x.trace.index:0)),values:traced.values};}}
    }
    if(Number.isInteger(x.selectedUnit))selectedUnit=Math.max(0,Math.min(unitData.length-1,x.selectedUnit));
    if(Number.isInteger(x.selectedCase))selectedCase=Math.max(0,Math.min(engine.DETECTIVE.length-1,x.selectedCase));
    if(Number.isInteger(x.selectedLabTab))selectedLabTab=Math.max(0,Math.min(2,x.selectedLabTab));
    diagramZoom=!!x.diagramZoom;
    if(x.detectiveSelections&&typeof x.detectiveSelections==='object')for(const [id,answer] of Object.entries(x.detectiveSelections)){const c=engine.DETECTIVE.find(d=>d.id===id);if(c&&c.choices.some(o=>o.id===answer)){detectiveSelections[id]=answer;const ok=answer===c.correct;detectiveFeedback[id]={ok,message:ok?c.explanation:'Perbaikan tersebut belum menyelesaikan kesalahan yang ditunjukkan. Periksa kembali kondisi dan jalurnya.'};}}
    if(x.detectiveHint&&typeof x.detectiveHint==='object')for(const [id,value] of Object.entries(x.detectiveHint))if(engine.DETECTIVE.some(d=>d.id===id))detectiveHint[id]=!!value;
  }
  function reloadUserState(){
    labState=engine.initialLab();detectiveSelections={};detectiveFeedback={};detectiveHint={};selectedConcept=null;selectedUnit=0;selectedCase=0;selectedLabTab=0;
    progress=loadProgress();practice=loadPractice();diagnosticState=loadDiagnostic();restoreActivityState();
  }
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function normalizedName(value){return String(value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('id-ID');}
  function initials(value){return String(value||'AL').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();}
  let liveFeedData = null;
  let adminLiveTimer = null;

  function studentLoginPage(){
    return `<div class="login-screen">
      <header class="login-brand">
        <span class="brand-logo">${ICON('workflow')}</span>
        <div><strong>ALURIN</strong><small>BELAJAR, PAHAMI ALURNYA</small></div>
        <span class="login-version">v0.4 · KELAS X</span>
      </header>
      <main class="login-layout">
        <section class="login-intro">
          <span class="kicker">MEDIA BELAJAR INFORMATIKA KELAS X</span>
          <h1>Belajar algoritma, <em>selangkah demi selangkah.</em></h1>
          <p>Kenali konsep, susun flowchart, telusuri logika, dan belajar dari setiap percobaan.</p>
          <div class="login-benefits">
            <div>${ICON('check-circle')} Progres belajar otomatis tersimpan ke server</div>
            <div>${ICON('blocks')} 6 kasus Laboratorium dan 6 kasus Detektif Logika</div>
            <div>${ICON('clipboard')} 12 soal asesmen diagnostik visual interaktif</div>
          </div>
        </section>
        <section class="login-panels">
          <article class="card login-card" style="max-width:440px;margin:0 auto;width:100%;">
            <span class="badge badge-blue">PORTAL MURID</span>
            <h2>Mulai Belajar</h2>
            <p>Masukkan identitas kelas. Jika HP Anda mati atau restart, progres belajar otomatis tersimpan dan dapat dilanjutkan.</p>
            <form data-form="student-login" class="login-form">
              <label>Nama Lengkap
                <input name="studentName" autocomplete="name" required maxlength="80" placeholder="Contoh: Andi Pratama">
              </label>
              <div class="login-two-col">
                <label>Kelas
                  <input name="className" required maxlength="24" placeholder="Contoh: X-1">
                </label>
                <label>Nomor Absen
                  <input name="attendance" type="number" min="1" max="99" required placeholder="12">
                </label>
              </div>
              <button class="btn btn-primary" type="submit">Mulai Belajar ${ICON('arrow-right')}</button>
              <p class="login-message" data-login-message="student" aria-live="polite"></p>
            </form>
          </article>
        </section>
      </main>
      <footer class="login-footer">ALURIN · Media Belajar Informatika Kelas X</footer>
    </div>`;
  }

  function teacherLoginPage(){
    return `<div class="login-screen">
      <header class="login-brand">
        <span class="brand-logo">${ICON('workflow')}</span>
        <div><strong>ALURIN</strong><small>PORTAL GURU INFORMATIKA</small></div>
        <span class="login-version">PANEL GURU</span>
      </header>
      <main class="login-layout">
        <section class="login-intro">
          <span class="kicker">DASHBOARD PEMANTAUAN KELAS</span>
          <h1>Pantau perkembangan siswa secara <em>real-time.</em></h1>
          <p>Lihat status siswa aktif, progres per soal, dan rekapan nilai kelas secara terpusat.</p>
          <div class="login-benefits">
            <div>${ICON('chart')} Pemantauan langsung murid online & proses berjalan</div>
            <div>${ICON('clipboard')} Rekap indikator 4 konsep logika otomatis</div>
            <div>${ICON('blocks')} Ekspor laporan nilai lengkap ke format CSV</div>
          </div>
        </section>
        <section class="login-panels">
          <article class="card login-card" style="max-width:420px;margin:0 auto;width:100%;">
            <span class="badge badge-teal">LOGIN GURU</span>
            <h2>Ruang Guru</h2>
            <p>Masuk menggunakan akun guru Anda untuk memantau aktivitas murid.</p>
            <form data-form="teacher-login" class="login-form">
              <label>Nama Pengguna
                <input name="teacherUser" autocomplete="username" required placeholder="guru">
              </label>
              <label>Kata Sandi
                <input name="teacherPass" type="password" autocomplete="current-password" required placeholder="Kata sandi">
              </label>
              <button class="btn btn-primary" type="submit">Buka Dashboard ${ICON('arrow-right')}</button>
              <p class="login-message" data-login-message="teacher" aria-live="polite"></p>
            </form>
          </article>
        </section>
      </main>
      <footer class="login-footer">ALURIN · Portal Khusus Guru Informatika</footer>
    </div>`;
  }

  function adminRecordsFiltered(){
    let records = (liveFeedData && liveFeedData.students) ? liveFeedData.students : readStudentRecords();
    if(adminSearch){const q=adminSearch.toLocaleLowerCase('id-ID');records=records.filter(r=>`${r.name} ${r.className} ${r.attendance}`.toLocaleLowerCase('id-ID').includes(q));}
    if(adminClassFilter!=='all')records=records.filter(r=>r.className===adminClassFilter);
    if(adminStatusFilter==='done')records=records.filter(r=>r.diagnosticComplete||r.isFinished);
    if(adminStatusFilter==='pending')records=records.filter(r=>!r.diagnosticComplete&&!r.isFinished);
    return records.sort((a,b)=>String(a.className).localeCompare(String(b.className),'id')||Number(a.attendance)-Number(b.attendance)||String(a.name).localeCompare(String(b.name),'id'));
  }

  function startAdminLiveFeed(){
    if(adminLiveTimer) return;
    const fetchFeed = async () => {
      if(!globalThis.ALURIN_API) return;
      try {
        const data = await globalThis.ALURIN_API.teacherGetLiveFeed();
        if(data && data.success){
          liveFeedData = data;
          if(activeRoute==='admin'){
            const tableWrap = document.querySelector('[data-admin-table-container]');
            if(tableWrap) tableWrap.innerHTML = adminTable(adminRecordsFiltered());
            const onlineBadge = document.querySelector('[data-metric-online]');
            if(onlineBadge && data.summary) onlineBadge.textContent = data.summary.onlineCount;
            const totalBadge = document.querySelector('[data-metric-total]');
            if(totalBadge && data.summary) totalBadge.textContent = data.summary.totalStudents;
          }
        }
      } catch(e) {
        if(e.message==='UNAUTHORIZED'){
          currentSession = null;
          navigateTo('/guru/login');
        }
      }
    };
    fetchFeed();
    adminLiveTimer = setInterval(fetchFeed, 3500);
  }

  function stopAdminLiveFeed(){
    if(adminLiveTimer){ clearInterval(adminLiveTimer); adminLiveTimer = null; }
  }

  function adminPage(){
    const all = (liveFeedData && liveFeedData.students) ? liveFeedData.students : readStudentRecords();
    const records = adminRecordsFiltered();
    const onlineCount = liveFeedData?.summary?.onlineCount ?? 0;
    const totalCount = liveFeedData?.summary?.totalStudents ?? all.length;
    const completed = all.filter(r=>r.diagnosticComplete||r.isFinished);
    const classes = liveFeedData?.summary?.classes || [...new Set(all.map(r=>r.className).filter(Boolean))].sort();
    const tab=(id,label)=>`<button class="admin-tab ${adminTab===id?'active':''}" type="button" data-admin-tab="${id}" aria-pressed="${adminTab===id}">${label}</button>`;
    let content='';
    if(adminTab==='overview'){
      content=`<div class="admin-metric-grid">
        <article class="admin-metric"><span>Murid terdaftar</span><strong data-metric-total>${totalCount}</strong><small>Total murid di database</small></article>
        <article class="admin-metric"><span style="color:#0ea5e9; font-weight:700;">🟢 Sedang Online</span><strong data-metric-online style="color:#0284c7;">${onlineCount}</strong><small>Aktif dalam 45 detik terakhir</small></article>
        <article class="admin-metric"><span>Diagnostik selesai</span><strong>${completed.length}</strong><small>${totalCount?Math.round(completed.length/totalCount*100):0}% dari total murid</small></article>
        <article class="admin-metric"><span>Mode Pemantauan</span><strong style="font-size:1.1rem; color:#10b981;">⚡ Live (3 detik)</strong><small>Sinkronisasi otomatis aktif</small></article>
      </div>
      <section class="card admin-panel">
        <div class="admin-panel-head">
          <div><h2>Aktivitas Siswa Saat Ini (Real-Time)</h2><p>Memantau murid mana saja yang aktif dan proses apa yang sedang dikerjakan.</p></div>
          <button class="btn btn-outline btn-sm" type="button" data-admin-tab="students">Lihat semua murid ${ICON('arrow-right')}</button>
        </div>
        <div data-admin-table-container>${adminTable(records)}</div>
      </section>
      <section class="card admin-panel"><div class="admin-panel-head"><div><h2>Ringkasan materi & aktivitas</h2><p>Materi dan aktivitas yang aktif pada kurikulum Fase E.</p></div><button class="btn btn-outline btn-sm" type="button" data-admin-tab="content">Lihat konten</button></div><div class="admin-content-summary"><div><strong>${unitData.length}</strong><span>Unit materi</span></div><div><strong>${adaptive.QUESTIONS.length}</strong><span>Soal diagnostik</span></div><div><strong>${Object.keys(engine.SCENARIOS).length}</strong><span>Kasus laboratorium</span></div><div><strong>${engine.DETECTIVE.length}</strong><span>Kasus detektif</span></div></div></section>`;
    } else if(adminTab==='students'){
      content=`<section class="card admin-panel">
        <div class="admin-panel-head">
          <div><h2>Daftar Murid & Progres Real-Time</h2><p>Pencarian, filter per kelas, dan status keaktifan siswa.</p></div>
          <button class="btn btn-primary btn-sm" type="button" data-action="admin-export">${ICON('chart')} Ekspor CSV Resmi</button>
        </div>
        <div class="admin-filters">
          <label>Cari murid<input data-admin-search value="${escapeHtml(adminSearch)}" placeholder="Nama, kelas, atau nomor absen"></label>
          <label>Kelas<select data-admin-class><option value="all">Semua kelas</option>${classes.map(c=>`<option value="${escapeHtml(c)}" ${adminClassFilter===c?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></label>
          <label>Status diagnostik<select data-admin-status><option value="all" ${adminStatusFilter==='all'?'selected':''}>Semua status</option><option value="done" ${adminStatusFilter==='done'?'selected':''}>Selesai</option><option value="pending" ${adminStatusFilter==='pending'?'selected':''}>Belum selesai</option></select></label>
        </div>
        <div data-admin-table-container>${adminTable(records)}</div>
        <p class="tiny muted">Menampilkan ${records.length} dari ${totalCount} murid di database server.</p>
      </section>`;
    } else if(adminTab==='preview'){
      const back=`<button class="btn btn-outline btn-sm" type="button" data-admin-tab="content">← Kembali ke konten</button>`;
      if(adminPreview?.type==='unit'){const u=unitData[adminPreview.value];content=`<section class="card admin-panel">${back}<span class="kicker">PRATINJAU MATERI 0${adminPreview.value+1}</span><h2>${escapeHtml(u.title)}</h2><p>${escapeHtml(u.body)}</p><div class="concept-emphasis"><strong>Inti konsep</strong><p>${escapeHtml(u.bigIdea)}</p></div><h3>${escapeHtml(u.exampleTitle)}</h3><ol class="admin-preview-steps">${u.steps.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol><div class="help-box"><strong>Pertanyaan refleksi</strong><p>${escapeHtml(u.question)}</p></div></section>`;}
      else if(adminPreview?.type==='lab'){const sc=engine.SCENARIOS[adminPreview.value];content=`<section class="card admin-panel">${back}<span class="kicker">PRATINJAU KASUS LABORATORIUM</span><h2>${escapeHtml(sc.name)}</h2><p>${escapeHtml(sc.context)}</p><div class="admin-detail-grid">${sc.fields.map(f=>`<div><span>Masukan</span><strong>${escapeHtml(f.label)}</strong></div>`).join('')}<div><span>Cabang Ya</span><strong>${escapeHtml(sc.yes)}</strong></div><div><span>Cabang Tidak</span><strong>${escapeHtml(sc.no)}</strong></div></div></section>`;}
      else {const d=engine.DETECTIVE[adminPreview?.value||0];content=`<section class="card admin-panel">${back}<span class="kicker">PRATINJAU DETEKTIF LOGIKA</span><h2>${escapeHtml(d.title)}</h2><p>${escapeHtml(d.question)}</p><div class="admin-content-list">${d.choices.map(c=>`<article><div><strong>${escapeHtml(c.label)}</strong><p>${c.id===d.correct?'Kunci jawaban (tersimpan pada mesin latihan)':'Pilihan pengecoh'}</p></div></article>`).join('')}</div><div class="help-box"><strong>Petunjuk</strong><p>${escapeHtml(d.hint)}</p></div></section>`;}
    } else if(adminTab==='detail'){
      const r=all.find(x=>x.id===selectedAdminStudentId);
      if(!r){adminTab='students';return adminPage();}
      const dt=r.lastActiveAt?new Date(r.lastActiveAt).toLocaleString('id-ID'):'Belum ada aktivitas';
      content=`<section class="card admin-panel"><div class="admin-panel-head"><div><button class="btn btn-outline btn-sm" type="button" data-admin-tab="students">${ICON('arrow-right')} Kembali ke daftar</button><h2 style="margin-top:14px">${escapeHtml(r.name)}</h2><p>Kelas ${escapeHtml(r.className)} · Nomor absen ${escapeHtml(r.attendance)} ${r.isOnline?'<span class="badge badge-teal">🟢 Online Sekarang</span>':'<span class="badge badge-neutral">Offline</span>'}</p></div></div><div class="admin-detail-grid"><div><span>Proses Terakhir</span><strong style="color:#1d4ed8;">${escapeHtml(r.currentStep||'Mulai Belajar')}</strong></div><div><span>Status diagnostik</span><strong>${r.diagnosticComplete||r.isFinished?'Selesai':'Sedang Mengerjakan'}</strong></div><div><span>Skor diagnostik</span><strong>${r.scoreString||'Belum selesai'}</strong></div><div><span>Terakhir aktif</span><strong>${escapeHtml(dt)}</strong></div></div></section>`;
    } else {
      content=`<section class="card admin-panel"><div class="admin-panel-head"><div><h2>Bank konten pembelajaran</h2><p>Ringkasan materi, asesmen visual, dan kasus praktik yang tersedia.</p></div></div><div class="admin-content-summary"><div><strong>${unitData.length}</strong><span>Unit materi</span></div><div><strong>${adaptive.QUESTIONS.length}</strong><span>Soal diagnostik</span></div><div><strong>${Object.keys(engine.SCENARIOS).length}</strong><span>Kasus laboratorium</span></div><div><strong>${engine.DETECTIVE.length}</strong><span>Kasus detektif</span></div></div><h3>Daftar materi</h3><div class="admin-content-list">${unitData.map((u,i)=>`<article><span class="unit-no">0${i+1}</span><div><strong>${escapeHtml(u.title)}</strong><p>${escapeHtml(u.subtitle)}</p></div><button class="btn btn-outline btn-sm" type="button" data-admin-preview-unit="${i}">Pratinjau</button></article>`).join('')}</div><h3>Bank soal diagnostik</h3><div class="admin-content-list">${adaptive.QUESTIONS.map((q,i)=>`<article><span class="unit-no">${String(i+1).padStart(2,'0')}</span><div><strong>${escapeHtml(q.stem)}</strong><p>${escapeHtml(adaptive.CONCEPTS[q.concept].label)}${q.visual?' · soal visual':''}</p></div><span class="badge badge-${q.visual?'teal':'neutral'}">${q.visual?'Visual':'Teks'}</span></article>`).join('')}</div><h3>Kasus Laboratorium</h3><div class="admin-case-grid">${Object.values(engine.SCENARIOS).map(s=>`<article><strong>${escapeHtml(s.name)}</strong><p>${escapeHtml(s.subtitle)}</p><button class="btn btn-outline btn-sm" type="button" data-admin-preview-lab="${s.key}">Buka kasus</button></article>`).join('')}</div><h3>Kasus Detektif Logika</h3><div class="admin-case-grid">${engine.DETECTIVE.map((d,i)=>`<article><strong>${i+1}. ${escapeHtml(d.title)}</strong><p>${escapeHtml(d.hint)}</p><button class="btn btn-outline btn-sm" type="button" data-admin-preview-case="${i}">Buka kasus</button></article>`).join('')}</div></section>`;
    }
    return `${pageHead('RUANG GURU · LIVE MONITORING','Dashboard Guru','Pantau aktivitas belajar siswa secara real-time dari database server.',pill('Live Feed Aktif','teal'))}<div class="admin-workspace"><nav class="admin-tabs" aria-label="Navigasi dashboard guru">${tab('overview','Ringkasan Live')}${tab('students','Daftar murid')}${tab('content','Materi & asesmen')}${adminTab==='preview'?tab('preview','Pratinjau'):''}</nav>${content}</div>`;
  }

  function adminTable(records){
    if(!records.length)return `<div class="admin-empty"><strong>Belum ada profil murid</strong><p>Murid yang masuk melalui alurin.fhadi.my.id akan langsung muncul di sini secara real-time.</p></div>`;
    return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Murid</th><th>Kelas / Absen</th><th>Proses Saat Ini</th><th>Diagnostik</th><th>Terakhir Aktif</th><th></th></tr></thead><tbody>${records.map(r=>`<tr><td><strong>${escapeHtml(r.name)}</strong> ${r.isOnline?'<span class="badge badge-teal" style="margin-left:6px; font-weight:700;">🟢 Online</span>':'<span class="badge badge-neutral" style="margin-left:6px;">⚪ Offline</span>'}</td><td>${escapeHtml(r.className)} / ${escapeHtml(r.attendance)}</td><td><span style="font-weight:600; color:#1d4ed8; font-size:0.875rem;">${escapeHtml(r.currentStep||'Mulai Belajar')}</span></td><td><span class="badge badge-${r.diagnosticComplete||r.isFinished?'teal':(r.answeredCount>0?'blue':'neutral')}">${r.scoreString||(r.diagnosticComplete?'Selesai':'Belum selesai')}</span></td><td>${r.lastActiveAt?escapeHtml(new Date(r.lastActiveAt).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'})):'—'}</td><td><button class="btn btn-outline btn-sm" type="button" data-admin-view="${escapeHtml(r.id)}">Detail</button></td></tr>`).join('')}</tbody></table></div>`;
  }

  function exportCSV(){
    window.location.href = '/api/teacher/export.csv';
  }
  function submitStudentResult(){
    if(!currentSession||currentSession.role!=='student'){toast('Masuk sebagai murid untuk mengirim ringkasan.');return;}
    const records=readStudentRecords(),idx=records.findIndex(r=>r.id===currentSession.id);if(idx<0){syncStudentRecord();return submitStudentResult();}
    records[idx]={...records[idx],submittedAt:new Date().toISOString(),updatedAt:new Date().toISOString()};writeStudentRecords(records);toast('Ringkasan hasil belajar berhasil dikirim.');triggerServerSync();render(false);
  }
  function downloadCertificate(){
    if(!currentSession||currentSession.role!=='student'){toast('Masuk sebagai murid untuk membuat lencana.');return;}
    const done=(progress.lab.length+progress.detective.length),svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="#f4f8ff"/><rect x="32" y="32" width="1136" height="786" rx="32" fill="#fff" stroke="#2459de" stroke-width="5"/><rect x="56" y="56" width="1088" height="738" rx="24" fill="none" stroke="#bfd3ff" stroke-width="2"/><circle cx="600" cy="175" r="64" fill="#e8f8f4" stroke="#159786" stroke-width="4"/><path d="M566 176l23 23 46-52" fill="none" stroke="#159786" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><text x="600" y="285" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="#2459de" letter-spacing="7">APRESIASI PEMBELAJARAN</text><text x="600" y="355" text-anchor="middle" font-family="Arial,sans-serif" font-size="58" font-weight="700" fill="#102847">Sertifikat Eksplorasi ALURIN</text><text x="600" y="425" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#62738b">Diberikan kepada</text><text x="600" y="490" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="#102847">${escapeHtml(currentSession.name)}</text><text x="600" y="545" text-anchor="middle" font-family="Arial,sans-serif" font-size="23" fill="#62738b">Kelas ${escapeHtml(currentSession.className)} · Nomor absen ${escapeHtml(currentSession.attendance)}</text><text x="600" y="605" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#102847">Telah menyelesaikan ${done} aktivitas latihan pada prototipe ALURIN.</text><text x="600" y="655" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#62738b">Apresiasi partisipasi belajar, bukan sertifikasi kompetensi resmi.</text><text x="600" y="740" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#2459de">ALURIN · Belajar, Pahami Alurnya</text></svg>`;
    const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Lencana-ALURIN-${String(currentSession.name).trim().replace(/[^a-z0-9]+/gi,'-')}.svg`;a.click();URL.revokeObjectURL(url);toast('Lencana SVG diunduh. Anda dapat membukanya atau mencetaknya sebagai PDF.');
  }

  function loadPractice(){
    try { return adaptive.cleanPractice(JSON.parse(localStorage.getItem(activeStorageKey('alurin-stage3-practice'))||'null')); }
    catch { return adaptive.cleanPractice(null); }
  }
  function savePractice(){safeLocalSet(activeStorageKey('alurin-stage3-practice'),JSON.stringify(practice));syncStudentRecord();}
  function loadDiagnostic(){
    let stored=null;
    try {stored=JSON.parse(localStorage.getItem(activeStorageKey('alurin-stage3-diagnostic'))||'null');}catch{}
    const report=adaptive.validateReport(stored?.report);
    const answers=adaptive.sanitizeAnswers(stored?.answers);
    const step=Number.isInteger(stored?.step)?Math.max(0,Math.min(adaptive.QUESTIONS.length-1,stored.step)):0;
    const mode=stored?.mode==='questions'?'questions':report?'summary':'questions';
    return {answers,step,report,mode};
  }
  function saveDiagnostic(){
    safeLocalSet(activeStorageKey('alurin-stage3-diagnostic'),JSON.stringify({answers:diagnosticState.answers,step:diagnosticState.step,report:diagnosticState.report,mode:diagnosticState.mode}));syncStudentRecord();triggerServerSync();
  }
  function issueFingerprint(value){
    const text=String(value);let hash=2166136261;
    for(let i=0;i<text.length;i++){hash=Math.imul(hash^text.charCodeAt(i),16777619);}
    return (hash>>>0).toString(36);
  }
  function notePractice(concept,signature,kind='mistake'){
    const result=adaptive.register(practice,concept,signature,kind);
    if(result.added){practice=result.practice;savePractice();}
    return result.added;
  }
  function goAdaptive(concept,goal){
    const config=adaptive.CONCEPTS[concept];
    if(!config)return;
    selectedConcept=concept;
    if(goal==='materi'){selectedUnit=config.unit;navigateTo('materi');return;}
    if(config.route==='detektif'){
      selectedCase=engine.DETECTIVE.findIndex(c=>c.id===config.det);
      if(selectedCase<0)selectedCase=0;
      navigateTo('detektif');
    }else{
      if(labState.scenario!==config.scenario)labState=engine.initialLab(config.scenario);
      selectedLabTab=config.id==='branch'?1:0;
      navigateTo('laboratorium');
    }
  }
  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(activeStorageKey('alurin-stage2-progress'))||'null');
      return {lab: (parsed?.lab||[]).filter(x=>Object.prototype.hasOwnProperty.call(engine.SCENARIOS,x)),
        detective:(parsed?.detective||[]).filter(x=>engine.DETECTIVE.some(c=>c.id===x))};
    } catch {return {lab:[],detective:[]};}
  }
  function saveProgress() {
    safeLocalSet(activeStorageKey('alurin-stage2-progress'), JSON.stringify(progress));syncStudentRecord();
  }
  function currentCase() {return engine.DETECTIVE[selectedCase];}
  function labChanged() {
    labState.checked=false;
    labState.feedback=null;
    labState.trace=null;
    saveActivityState();
  }
  function showLabFeedback() {
    const found=engine.validate(labState);
    labState.feedback=found;
    labState.checked=true;
    labState.trace=null;
    if(!found.ok){
      for(const issue of found.issues){
        const concept=adaptive.conceptForIssue(issue.kind);
        if(concept){
          const fingerprint=[labState.scenario,issue.kind,issue.step||'',issueFingerprint([labState.order,labState.types,labState.branches])].join(':');
          notePractice(concept,fingerprint);
        }
      }
    }
    if(found.ok){
      if(!progress.lab.includes(labState.scenario)){progress.lab.push(labState.scenario);saveProgress();}
      toast('Diagram sudah sesuai. Buka tab Tracing untuk menguji dua kondisi berbeda.');
    } else toast('Ditemukan '+found.issues.length+' bagian yang perlu diperiksa. Lihat penjelasan di panel kanan.');
    saveActivityState();render(false);
    return found;
  }
  function safeLocalGet(key, fallback='') {
    try {return localStorage.getItem(key) ?? fallback;} catch {return fallback;}
  }
  function safeLocalSet(key, value) {
    try {localStorage.setItem(key, value);} catch { /* Peramban dapat menolak penyimpanan, navigasi tetap berjalan. */ }
  }
  const preferences = {
    largeText: safeLocalGet('alurin-large-text') === 'true',
    reducedMotion: safeLocalGet('alurin-reduced-motion') === 'true',
  };
  function applyPreferences() {
    document.documentElement.classList.toggle('text-large', preferences.largeText);
    document.body.classList.toggle('reduced-motion', preferences.reducedMotion);
  }
  function getRoute() {
    let path = (window.location.pathname || '/').toLowerCase();
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      path = window.location.hash.replace(/^#\/?/, '/').toLowerCase();
      window.history.replaceState(null, '', path);
    }
    if (path === '/guru/login') return 'guru-login';
    if (path === '/guru' || path.startsWith('/guru')) return 'admin';
    const clean = path.replace(/^\//, '').split('/')[0] || '';
    if (!currentSession) {
      if (clean === 'guru-login' || path === '/guru/login') return 'guru-login';
      return 'login';
    }
    if (currentSession.role === 'teacher' || currentSession.role === 'admin') {
      return 'admin';
    }
    return Object.prototype.hasOwnProperty.call(PAGES, clean) ? clean : 'beranda';
  }
  function navigateTo(target) {
    let path = target;
    if (!path.startsWith('/')) {
      if (path === 'login') path = '/';
      else if (path === 'guru-login') path = '/guru/login';
      else if (path === 'admin' || path === 'guru') path = '/guru';
      else path = '/' + path;
    }
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    render(true);
  }
  function linkTo(slug, cls='nav-link') {
    const p=PAGES[slug];
    const targetPath = slug === 'admin' ? '/guru' : '/' + slug;
    return `<a class="${cls}${activeRoute===slug?' active':''}" href="${targetPath}" ${activeRoute===slug?'aria-current="page"':''} title="${p.label}">${ICON(p.icon)}<span>${p.label}</span></a>`;
  }
  function sidebar() {
    if(currentSession?.role==='admin'||currentSession?.role==='teacher')return `<aside class="sidebar admin-sidebar" aria-label="Navigasi admin"><a class="brand" href="/guru"><span class="brand-logo">${ICON('workflow')}</span><span><span class="brand-name">ALURIN</span><span class="brand-sub">RUANG GURU</span></span></a><div class="nav-section">Administrasi Kelas</div><nav class="sidebar-nav">${[['overview','Ringkasan Live'],['students','Daftar murid'],['content','Materi & asesmen']].map(([id,label])=>`<button class="nav-link ${adminTab===id?'active':''}" type="button" data-admin-tab="${id}">${ICON(id==='overview'?'chart':id==='students'?'clipboard':'book')}<span>${label}</span></button>`).join('')}</nav><div class="sidebar-bottom"><button type="button" data-modal="help">${ICON('help')}<span>Pusat Bantuan</span></button><button type="button" data-modal="settings">${ICON('settings')}<span>Pengaturan</span></button><button type="button" data-action="logout">${ICON('lock')}<span>Keluar</span></button></div><div class="sidebar-note"><strong>Portal Guru</strong>Terhubung ke database server secara real-time.</div></aside>`;
    return `<aside class="sidebar" aria-label="Navigasi samping"><a class="brand" href="/beranda" aria-label="ALURIN, kembali ke beranda"><span class="brand-logo">${ICON('workflow')}</span><span><span class="brand-name">ALURIN</span><span class="brand-sub">BELAJAR PAHAMI ALURNYA</span></span></a><div class="nav-section">Menu pembelajaran</div><nav class="sidebar-nav" aria-label="Navigasi utama">${NAV.map(k=>linkTo(k)).join('')}</nav><div class="sidebar-bottom"><button type="button" data-modal="help">${ICON('help')}<span>Pusat Bantuan</span></button><button type="button" data-modal="settings">${ICON('settings')}<span>Pengaturan</span></button><button type="button" data-action="logout">${ICON('lock')}<span>Keluar dari akun</span></button></div><div class="sidebar-note"><strong>Progres Tersimpan</strong>Data belajar Anda otomatis tersimpan di server.</div></aside>`;
  }
  function topbar() {
    const page=PAGES[activeRoute]||PAGES['beranda'],name=currentSession?.name||(currentSession?.role==='admin'||currentSession?.role==='teacher'?'Guru':'Siswa');
    const brandTarget = (currentSession?.role==='admin'||currentSession?.role==='teacher') ? '/guru' : '/beranda';
    return `<header class="topbar"><div class="topbar-left"><a href="${brandTarget}" class="mobile-brand"><span class="mini-mark">${ICON('workflow')}</span>ALURIN</a><div><div class="topbar-page">${page.label}</div><div class="topbar-meta">${page.sub}</div></div></div><div class="topbar-actions"><span class="stage-pill">${(currentSession?.role==='admin'||currentSession?.role==='teacher') ? 'PORTAL GURU' : 'MURID KELAS X'}</span><button class="icon-btn" type="button" data-modal="help" aria-label="Buka bantuan">${ICON('help')}</button><button class="icon-btn" type="button" data-modal="settings" aria-label="Buka pengaturan">${ICON('settings')}</button><span class="avatar" title="${name}">${initials(name)}</span><button class="btn btn-outline btn-sm topbar-logout" type="button" data-action="logout">Keluar</button></div></header>`;
  }
  function mobileNav() {
    if(currentSession?.role==='admin'||currentSession?.role==='teacher')return `<nav class="mobile-nav admin-mobile-nav" aria-label="Navigasi admin">${[['overview','Ringkasan'],['students','Murid'],['content','Konten']].map(([id,label])=>`<button type="button" data-admin-tab="${id}" class="${adminTab===id?'active':''}">${ICON(id==='overview'?'chart':id==='students'?'clipboard':'book')}<span>${label}</span></button>`).join('')}<button type="button" data-action="logout">${ICON('lock')}<span>Keluar</span></button></nav>`;
    return `<nav class="mobile-nav" aria-label="Navigasi ponsel">${MOBILE_NAV.map(k=>linkTo(k)).join('')}</nav>`;
  }
  function homeArt() {
    return `<svg viewBox="0 0 470 300" role="img" aria-label="Ilustrasi komputer dan susunan alur algoritma" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="heroG" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5088f4"/><stop offset="1" stop-color="#1e55cb"/></linearGradient></defs>
      <circle cx="240" cy="146" r="138" fill="#d5e5ff" opacity=".8"/><circle cx="365" cy="78" r="29" fill="#dff4f1"/>
      <rect x="125" y="125" width="244" height="141" rx="17" fill="#133e84"/><rect x="137" y="136" width="220" height="116" rx="9" fill="#fff"/>
      <rect x="156" y="156" width="59" height="15" rx="7.5" fill="#ddeaff"/><path d="M185 171v24" stroke="#4176e7" stroke-width="4"/>
      <rect x="143" y="197" width="86" height="33" rx="6" fill="#e3efff" stroke="#4f84eb" stroke-width="2"/><text x="186" y="217" text-anchor="middle" font-size="11" fill="#2458b2" font-weight="700">INPUT</text>
      <path d="M231 212h31" stroke="#4f84eb" stroke-width="3" stroke-linecap="round"/><path d="m256 206 9 6-9 6" stroke="#4f84eb" fill="none" stroke-width="3"/>
      <path d="M304 179 344 212 304 245 264 212Z" fill="#fff4df" stroke="#df9b39" stroke-width="2"/><text x="304" y="217" text-anchor="middle" font-size="11" fill="#95601b" font-weight="700">IF ?</text>
      <path d="M195 268v12h107v-12" fill="none" stroke="#1d4786" stroke-width="7" stroke-linecap="round"/><rect x="226" y="276" width="45" height="8" rx="4" fill="#1d4786"/>
      <rect x="35" y="62" width="126" height="64" rx="14" fill="#fff" stroke="#c2d6f7"/><rect x="52" y="78" width="68" height="8" rx="4" fill="#d0dfff"/><rect x="52" y="94" width="89" height="7" rx="3.5" fill="#e6efff"/><circle cx="133" cy="77" r="9" fill="#26b5a5"/>
      <path d="m129 77 3 3 5-6" stroke="#fff" stroke-width="2" fill="none"/>
      <circle cx="391" cy="139" r="32" fill="#fff2d9"/><path d="M391 121v17m-9-8 9 9 9-9" stroke="#d58a23" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="383" y="170" width="17" height="6" rx="3" fill="#d58a23"/><circle cx="76" cy="226" r="32" fill="#e6f7f4"/>
      <rect x="61" y="211" width="30" height="30" rx="7" fill="#27afa0"/><path d="m69 225 6 6 10-12" stroke="#fff" fill="none" stroke-width="3" stroke-linecap="round"/>
      <path d="M379 252h59" stroke="#aac7ef" stroke-width="4" stroke-linecap="round"/><path d="M400 239h38" stroke="#aac7ef" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }
  function dashboard() {
    const links=[
      ['materi','book','Jelajah Konsep','Pahami algoritma dan simbol lewat contoh sehari-hari.','blue'],
      ['laboratorium','blocks','Laboratorium','Susun, periksa, dan jalankan alur flowchart.','teal'],
      ['detektif','bug','Detektif Logika','Perbaiki kesalahan urutan, simbol, dan cabang.','amber'],
      ['hasil','chart','Hasil Belajar','Lihat hasil latihan yang sudah kamu selesaikan.','purple']
    ];
    const diagnostikNote=diagnosticState.report
      ?`<section class="card dashboard-adaptive"><span class="small-label">BERDASARKAN DIAGNOSTIK</span><h2>Mulai dari yang paling perlu kamu latih</h2><p>${adaptive.recommendation(diagnosticState.report,practice,progress).priority.label}. Kamu boleh memilih jalur lain kapan saja.</p><div class="btn-group"><button class="btn btn-primary" type="button" data-adaptive-go="latihan" data-concept="${adaptive.recommendation(diagnosticState.report,practice,progress).priority.id}">Coba latihan yang disarankan ${ICON('arrow-right')}</button><a class="btn btn-outline" href="/hasil">Lihat peta belajar</a></div></section>`:'';
    return `<section class="hero"><div><span class="kicker">${ICON('sparkle','sm')} MEDIA BELAJAR INFORMATIKA KELAS X</span><h1>${currentSession?.role==='student'?`Halo, ${escapeHtml(currentSession.name.split(' ')[0])}. `:''}Siap belajar berpikir <em>secara runtut?</em></h1><p>Dari masalah sederhana hingga diagram alir. Kenali konsepnya, pahami alasan di balik setiap langkah, dan bersiap mencoba sendiri.</p><div class="btn-group">${btn('diagnostik',diagnosticState.report?'Lihat diagnostik':'Mulai belajar')}${btn('materi','Jelajah materi','outline','book')}</div></div><div class="hero-art">${homeArt()}</div></section>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:28px 0 15px;"><h2 class="section-heading" style="margin:0;">Apa yang ingin kamu pelajari?</h2>${pill(diagnosticState.report?'Rekomendasi adaptif aktif':'Latihan interaktif aktif','teal')}</div>
      <section class="quick-grid" aria-label="Pintasan pembelajaran">${links.map(([url,icon,title,desc,c])=>`<a href="/${url}" class="quick-card"><span class="quick-icon ${c}">${ICON(icon,'lg')}</span><h3>${title}</h3><p>${desc}</p></a>`).join('')}</section>
      ${diagnostikNote}<section class="bottom-grid"><div class="card card-pad"><h2 class="card-title">Perjalanan belajar ALURIN</h2><p class="card-desc">Urutan aktivitas yang dirancang untuk mengembangkan pemahamanmu secara bertahap.</p><div style="margin-top:14px;">${[
        ['1','Kenali kesiapan awal','Jawab pertanyaan sederhana tentang algoritma.'],
        ['2','Pelajari dan amati contoh','Hubungkan langkah naratif dengan simbol flowchart.'],
        ['3','Susun, uji, dan perbaiki','Belajar dari kesalahan logika dan percabangan.']
      ].map(([n,t,d])=>`<div class="list-step"><div class="step-number">${n}</div><div><div class="step-title">${t}</div><div class="step-sub">${d}</div></div></div>`).join('')}</div></div>
      <div class="card card-pad"><div class="home-tip">${ICON('lightbulb','xl')}<h3>Belajar tidak harus langsung benar</h3><p>Ketika membuat flowchart, kesalahan bisa menjadi petunjuk untuk memperbaiki cara berpikir. ALURIN dirancang memberi kesempatan mencoba kembali tanpa takut salah.</p><div style="margin-top:21px;">${btn('laboratorium','Buka laboratorium','light','arrow-right')}</div></div></div></section>`;
  }
  function diagnostic() {
    return `${pageHead('LANGKAH 01 · KESIAPAN AWAL','Asesmen Diagnostik','Dua belas soal teks dan visual untuk mengenali konsep yang perlu penguatan. Tidak ada batas waktu atau peringkat.',pill('v0.4 · 12 soal aktif','teal'))}
      ${stage3.diagnostic({...diagnosticState,practice,completed:progress})}`;
  }
  function material() {
    const u=unitData[selectedUnit];
    const symbols=[['Mulai / Selesai','Terminator','terminal'],['Baca / Tampilkan','Input / Output','io'],['Hitung / Olah','Process','process'],['Kondisi?','Decision','decision'],['→','Flowline','process']];
    return `${pageHead('LANGKAH 02 · MEMAHAMI','Jelajah Konsep','Belajar dari contoh konkret, kemudian hubungkan algoritma naratif dengan simbol dan pseudocode. Pilih unit untuk melihat materi pengantarnya.',pill(`${unitData.length} unit konsep`,'blue'))}
    <div class="concept-layout"><aside class="card card-pad"><div class="small-label" style="margin-bottom:15px;">Pilih materi</div><div class="unit-list">${unitData.map((item,i)=>`<button type="button" class="unit-select${selectedUnit===i?' active':''}" data-unit="${i}" aria-pressed="${selectedUnit===i}"><span class="unit-no">0${i+1}</span><span><strong>${item.title}</strong><small>${item.subtitle}</small></span></button>`).join('')}</div><div class="divider"></div><p class="tiny muted" style="line-height:1.7;margin:0;">Materi ringkas ini menggunakan konteks dari bahan bacaan dan LKPD kelas X. Laboratorium dan Detektif Logika kini tersedia untuk latihan interaktif.</p></aside>
      <section class="card concept-content" aria-live="polite"><span class="kicker">UNIT ${String(selectedUnit+1).padStart(2,'0')} / ${String(unitData.length).padStart(2,'0')}</span><h2>${u.title}</h2><p>${u.body}</p><div class="concept-emphasis">${ICON('target','lg')}<div><strong>Inti yang perlu dipahami</strong><p>${u.bigIdea}</p></div></div><h3 class="card-title" style="margin-bottom:15px;">${u.exampleTitle}</h3>
      ${selectedUnit===1 ? `<div class="mini-symbol-grid">${symbols.map(([label,title,shape])=>`<div class="symbol-card"><div class="symbol-shape ${shape}"><span>${label}</span></div><strong>${title}</strong><small>${title==='Decision'?'Memilih cabang Ya/Tidak':title==='Flowline'?'Arah aliran langkah':title==='Process'?'Tindakan atau pengolahan':title==='Terminator'?'Awal atau akhir':'Masukan atau keluaran'}</small></div>`).join('')}</div>`: `<div class="example-steps">${u.steps.map((s,i)=>`<div class="example-step"><span class="step-number">${i+1}</span><span>${s}</span></div>`).join('')}</div>`}
      <div class="help-box" style="margin-top:23px;"><strong>${ICON('lightbulb','sm')} Pertanyaan untuk dipikirkan</strong><p>${u.question}</p></div><div class="divider"></div><div class="btn-group" style="justify-content:space-between;">${selectedUnit>0?`<button class="btn btn-outline" type="button" data-unit="${selectedUnit-1}">${ICON('arrow-left')} Unit sebelumnya</button>`:btn('beranda','Kembali ke beranda','outline','arrow-left')}${selectedUnit<unitData.length-1?`<button class="btn btn-primary" type="button" data-unit="${selectedUnit+1}">Unit berikutnya ${ICON('arrow-right')}</button>`:btn('laboratorium','Lihat laboratorium','primary','arrow-right')}</div></section></div>`;
  }
  function flowchartSVG(invalid=false,caseIndex=0) {
    if(invalid){
      if(caseIndex>=3){
        const titles=[['Akhir alur hilang','Keluaran'],['Batas kondisi','Total > 100 ribu?'],['Tracing keliru','Nilai ≥ 70?']];
        const t=titles[caseIndex-3];
        return `<svg viewBox="0 0 540 370" role="img" aria-label="Diagram latihan dengan kesalahan: ${t[0]}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrowExtra" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#607897"/></marker></defs><rect x="222" y="12" width="96" height="40" rx="20" fill="#eaf2ff" stroke="#376bda" stroke-width="2"/><text x="270" y="37" font-size="15" fill="#214d9b" text-anchor="middle">Mulai</text><path d="M270 52v35" stroke="#607897" stroke-width="2.5" marker-end="url(#arrowExtra)"/><polygon points="200,94 356,94 336,140 180,140" fill="#e8f8f4" stroke="#159786" stroke-width="2"/><text x="270" y="122" font-size="14" fill="#117568" text-anchor="middle">${caseIndex===5?'Input nilai 68':caseIndex===4?'Input total belanja':'Tampilkan hasil'}</text><path d="M270 140v29" stroke="#607897" stroke-width="2.5" marker-end="url(#arrowExtra)"/><path d="M270 173 350 215 270 257 190 215Z" fill="#fff3df" stroke="#d79a39" stroke-width="2.5"/><text x="270" y="220" font-size="13" fill="#875b1a" text-anchor="middle" font-weight="700">${t[1]}</text><path d="M190 215H105V278M350 215H435V278" stroke="#607897" stroke-width="2.5" fill="none" marker-end="url(#arrowExtra)"/><text x="142" y="205" font-size="12" fill="#117568">Ya</text><text x="385" y="205" font-size="12" fill="#a64550">Tidak</text><rect x="36" y="284" width="138" height="40" rx="7" fill="#fff0f1" stroke="#d65b64" stroke-width="2"/><text x="105" y="309" font-size="12" fill="#a64550" text-anchor="middle">${caseIndex===5?'Lulus':'Manfaat diterima'}</text>${caseIndex===3?'':`<rect x="366" y="284" width="138" height="40" rx="7" fill="#e7f8ef" stroke="#25a66a" stroke-width="2"/><text x="435" y="309" font-size="12" fill="#176c47" text-anchor="middle">${caseIndex===5?'Perlu latihan':'Ongkir normal'}</text>`}<circle cx="270" cy="304" r="18" fill="#d95365"/><text x="270" y="311" text-anchor="middle" font-size="21" fill="#fff" font-weight="800">!</text><text x="270" y="353" text-anchor="middle" font-size="12" fill="#8e6570">${t[0]}</text></svg>`;
      }
      if (caseIndex === 2) {
        return `<svg viewBox="0 0 540 370" role="img" aria-label="Contoh kesalahan: cabang Ya justru menuju Belum Tuntas dan cabang Tidak menuju Tuntas" xmlns="http://www.w3.org/2000/svg"><defs><marker id="wrongArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#607897"/></marker></defs>
        <rect x="224" y="11" width="92" height="35" rx="18" fill="#eaf2ff" stroke="#376bda" stroke-width="2"/><text x="270" y="33" text-anchor="middle" font-size="13" fill="#214d9b">Mulai</text><path d="M270 46v30" stroke="#607897" stroke-width="2.6" marker-end="url(#wrongArr)"/>
        <polygon points="215,82 341,82 325,119 199,119" fill="#ecf9f5" stroke="#24998a" stroke-width="2.5"/><text x="270" y="104" text-anchor="middle" font-size="13" fill="#167c73">Input nilai</text><path d="M270 119v25" stroke="#607897" stroke-width="2.6" marker-end="url(#wrongArr)"/>
        <path d="M270 149 348 192 270 235 192 192Z" fill="#fff2de" stroke="#dc902b" stroke-width="2.7"/><text x="270" y="197" text-anchor="middle" font-size="13" fill="#95621f" font-weight="700">Nilai ≥ 75?</text>
        <path d="M192 192H101V254" stroke="#607897" stroke-width="2.6" fill="none" marker-end="url(#wrongArr)"/><path d="M348 192H439V254" stroke="#607897" stroke-width="2.6" fill="none" marker-end="url(#wrongArr)"/><text x="143" y="180" font-size="12" fill="#0d9488" font-weight="700">Ya</text><text x="385" y="180" font-size="12" fill="#b77927" font-weight="700">Tidak</text>
        <rect x="34" y="263" width="132" height="39" rx="7" fill="#fff0f1" stroke="#d65b64" stroke-width="2"/><text x="100" y="287" text-anchor="middle" font-size="12" fill="#a64550" font-weight="700">Belum Tuntas</text><rect x="372" y="263" width="133" height="39" rx="7" fill="#fff0f1" stroke="#d65b64" stroke-width="2"/><text x="439" y="287" text-anchor="middle" font-size="12" fill="#a64550" font-weight="700">Tuntas</text>
        <circle cx="270" cy="287" r="18" fill="#d95365"/><text x="270" y="294" text-anchor="middle" font-size="21" fill="#fff" font-weight="800">!</text><text x="270" y="342" text-anchor="middle" font-size="12" fill="#8e6570">Perhatikan arah cabang dan keluarannya</text></svg>`;
      }
      const isProcess=caseIndex===1;
      return `<svg viewBox="0 0 540 370" role="img" aria-label="Diagram contoh dengan kesalahan ${isProcess?'penggunaan simbol proses untuk keputusan':'memeriksa kondisi sebelum memasukkan nilai'}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrowBad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#607897"/></marker></defs>
      <rect x="222" y="11" width="96" height="41" rx="20" fill="#eaf2ff" stroke="#376bda" stroke-width="2"/><text x="270" y="36" font-size="16" fill="#214d9b" text-anchor="middle" font-weight="650">Mulai</text><path d="M270 52 V95" stroke="#607897" stroke-width="2.8" marker-end="url(#arrowBad)"/>
      ${isProcess?`<polygon points="201,102 356,102 336,145 181,145" fill="#ecf9f5" stroke="#24998a" stroke-width="2.5"/><text x="270" y="128" font-size="14" fill="#167c73" text-anchor="middle">Input saldo</text><path d="M270 145 V185" stroke="#607897" stroke-width="2.8" marker-end="url(#arrowBad)"/><rect x="174" y="188" width="192" height="51" rx="6" fill="#fff0f1" stroke="#d65b64" stroke-width="2.5"/><text x="270" y="219" font-size="14" fill="#a64550" font-weight="700" text-anchor="middle">Apakah saldo cukup?</text><path d="M270 239 V296" stroke="#607897" stroke-width="2.8" marker-end="url(#arrowBad)"/>`:`<path d="M270 104 359 155 270 206 181 155Z" fill="#fff0f1" stroke="#d65b64" stroke-width="2.7"/><text x="270" y="161" font-size="14" fill="#9a4751" text-anchor="middle" font-weight="700">Nilai ≥ 75?</text><path d="M270 206 V241" stroke="#607897" stroke-width="2.8" marker-end="url(#arrowBad)"/><polygon points="201,244 356,244 336,289 181,289" fill="#ecf9f5" stroke="#24998a" stroke-width="2.5"/><text x="270" y="270" font-size="14" fill="#167c73" text-anchor="middle" font-weight="700">Masukkan nilai</text><path d="M270 289 V316" stroke="#607897" stroke-width="2.8" marker-end="url(#arrowBad)"/>`}
      <rect x="222" y="320" width="96" height="40" rx="20" fill="#eaf2ff" stroke="#376bda" stroke-width="2"/><text x="270" y="345" font-size="16" fill="#214d9b" text-anchor="middle" font-weight="650">Selesai</text><circle cx="390" cy="200" r="19" fill="#d95365"/><text x="390" y="207" font-size="23" text-anchor="middle" font-weight="800" fill="#fff">!</text></svg>`;
    }
    return `<svg class="flowchart-svg" viewBox="0 0 540 520" role="img" aria-label="Contoh flowchart ketuntasan: mulai, input nilai, periksa nilai minimal 75, Ya menuju Tuntas, Tidak menuju Belum Tuntas, lalu selesai" xmlns="http://www.w3.org/2000/svg"><defs><marker id="fArrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#5e7797"/></marker></defs>
      <rect x="210" y="26" width="120" height="43" rx="22" fill="#e8f1ff" stroke="#3773df" stroke-width="2.5"/><text x="270" y="52" fill="#2858b2" font-size="17" font-weight="750" text-anchor="middle">Mulai</text>
      <path d="M270 69V108" stroke="#5e7797" stroke-width="3" marker-end="url(#fArrow)"/>
      <polygon points="202,116 353,116 337,158 186,158" fill="#e8f8f3" stroke="#20a08d" stroke-width="2.5"/><text x="270" y="142" text-anchor="middle" fill="#147e72" font-size="16" font-weight="720">Input nilai</text>
      <path d="M270 158V200" stroke="#5e7797" stroke-width="3" marker-end="url(#fArrow)"/>
      <path d="M270 210 L363 258 L270 306 L177 258Z" fill="#fff4dc" stroke="#cf8e2b" stroke-width="2.5"/><text x="270" y="263" text-anchor="middle" fill="#8f5d1d" font-size="16" font-weight="750">Nilai ≥ 75?</text>
      <path d="M177 258H100V338" fill="none" stroke="#5e7797" stroke-width="3" marker-end="url(#fArrow)"/><path d="M363 258H440V338" fill="none" stroke="#5e7797" stroke-width="3" marker-end="url(#fArrow)"/>
      <text x="139" y="247" fill="#0c907f" font-size="14" font-weight="800">Ya</text><text x="390" y="247" fill="#b17524" font-size="14" font-weight="800">Tidak</text>
      <polygon points="48,349 173,349 157,391 32,391" fill="#e5f8f2" stroke="#15a18a" stroke-width="2.5"/><text x="103" y="374" text-anchor="middle" fill="#147c70" font-size="14" font-weight="750">Tuntas</text>
      <polygon points="383,349 514,349 498,391 367,391" fill="#fff3e0" stroke="#d49535" stroke-width="2.5"/><text x="441" y="375" text-anchor="middle" fill="#956123" font-size="13" font-weight="750">Belum Tuntas</text>
      <path d="M100 391V432H270" fill="none" stroke="#5e7797" stroke-width="3"/><path d="M440 391V432H270" fill="none" stroke="#5e7797" stroke-width="3"/><path d="M270 432V464" stroke="#5e7797" stroke-width="3" marker-end="url(#fArrow)"/>
      <rect x="210" y="471" width="120" height="42" rx="21" fill="#e8f1ff" stroke="#3773df" stroke-width="2.5"/><text x="270" y="497" text-anchor="middle" fill="#2858b2" font-size="17" font-weight="750">Selesai</text>
    </svg>`;
  }
  function lab() {
    return `${pageHead('LANGKAH 03 · PRAKTIK VISUAL','Laboratorium Flowchart','Pilih satu dari enam kasus kontekstual. Susun langkah, periksa simbol dan cabang, lalu telusuri hasil dengan nilai uji.',pill(`${Object.keys(engine.SCENARIOS).length} kasus aktif`,'teal'))}
      ${stage3.contextMessage(selectedConcept,diagnosticState.report,practice,progress)}${stage2.renderLab(labState,selectedLabTab,diagramZoom)}`;
  }
  function detective() {
    const current=caseData[selectedCase];
    const id=currentCase().id;
    return `${pageHead('LANGKAH 04 · BERPIKIR KRITIS','Detektif Logika','Amati diagram yang sengaja dibuat salah. Pilih perbaikan paling tepat, periksa jawabannya, dan pelajari alasannya.',pill(`${caseData.length} kasus interaktif`,'teal'))}
    ${stage3.contextMessage(selectedConcept,diagnosticState.report,practice,progress)}<div class="case-tabs" role="group" aria-label="Pilih jenis kasus">${caseData.map((c,i)=>`<button type="button" data-case="${i}" aria-pressed="${selectedCase===i}" class="case-tab${selectedCase===i?' active':''}"><strong>${c.name}${progress.detective.includes(engine.DETECTIVE[i].id)?' ✓':''}</strong><small>${c.short}</small></button>`).join('')}</div>
    <div class="detective-grid"><section class="card detective-art"><div style="width:100%;"><div class="small-label" style="margin:6px 14px 0;">Diagram dengan kesalahan, amati dahulu</div>${flowchartSVG(true,selectedCase)}</div></section>
      <aside class="card case-instructions"><span class="kicker">KASUS 0${selectedCase+1}</span><h2 class="case-title">${current.title}</h2><p class="small muted" style="line-height:1.82;">${current.desc}</p>${stage2.renderDetective(selectedCase,detectiveSelections[id],detectiveFeedback[id],progress.detective,detectiveHint[id])}</aside></div>`;
  }
  function results() {
    return `${pageHead('LANGKAH 05 · MEREFLEKSI','Hasil Belajar','Lihat rekomendasi berdasarkan diagnostik dan latihan yang telah dicoba. Semua data tetap tersimpan pada peramban ini saja.',pill(diagnosticState.report?'Peta adaptif aktif':'Mulai dari diagnostik','teal'))}
      ${stage3.learningPlan(diagnosticState.report,practice,progress)}${stage2.results(progress)}${currentSession?.role==='student'?`<section class="card card-pad result-export-card"><div><span class="small-label">RINGKASAN DAN APRESIASI</span><h2>Kirim hasil belajar</h2><p>Dalam versi demo, ringkasan akan ditandai pada dashboard admin di browser yang sama. Setelah backend terhubung, aksi ini akan dikirim ke server.</p></div><div class="btn-group"><button type="button" class="btn btn-primary" data-action="submit-result">Kirim ringkasan ke admin</button><button type="button" class="btn btn-outline" data-action="download-certificate">Unduh lencana SVG</button></div></section>`:''}`;
  }
  function viewFor(route) {
    switch(route) {
      case 'beranda':return dashboard();
      case 'diagnostik':return diagnostic();
      case 'materi':return material();
      case 'laboratorium':return lab();
      case 'detektif':return detective();
      case 'hasil':return results();
      case 'admin':return adminPage();
      case 'guru-login':return teacherLoginPage();
      default:return dashboard();
    }
  }
  function render(scroll=true) {
    let route=getRoute();
    if(!currentSession && route!=='login' && route!=='guru-login'){
      navigateTo('/');
      return;
    }
    else if(currentSession?.role==='student' && route==='admin'){
      navigateTo('/beranda');
      return;
    }
    else if((currentSession?.role==='admin'||currentSession?.role==='teacher') && route!=='admin'){
      navigateTo('/guru');
      return;
    }
    activeRoute=route;
    document.title=`${PAGES[activeRoute]?.label||'ALURIN'} | ALURIN v0.4`;
    if(activeRoute==='login'){
      if(window.location.pathname!=='/') window.history.replaceState(null,'','/');
      app.innerHTML=studentLoginPage();
      if(scroll)window.scrollTo(0,0);
      return;
    }
    if(activeRoute==='guru-login'){
      if(window.location.pathname!=='/guru/login') window.history.replaceState(null,'','/guru/login');
      app.innerHTML=teacherLoginPage();
      if(scroll)window.scrollTo(0,0);
      return;
    }
    if(activeRoute==='admin'){
      if(window.location.pathname!=='/guru') window.history.replaceState(null,'','/guru');
      startAdminLiveFeed();
    } else {
      stopAdminLiveFeed();
    }
    app.innerHTML=`<div class="shell">${sidebar()}<div class="main-shell">${topbar()}<main id="main-content" class="page" tabindex="-1">${viewFor(activeRoute)}</main><footer class="page-foot"><span>ALURIN · Media Belajar Informatika Kelas X</span><span>ALURIN v0.4 · Server PostgreSQL Terpusat</span></footer></div>${mobileNav()}</div>`;
    if(scroll) {window.scrollTo(0,0);document.getElementById('main-content')?.focus({preventScroll:true});}
    if(modalName) drawModal();
  }
  function toast(message) {
    const root=document.getElementById('toast-root');
    root.innerHTML=`<div class="toast" role="status">${ICON('info')}<span>${message}</span></div>`;
    if(window.__alurinToast) clearTimeout(window.__alurinToast);
    window.__alurinToast=setTimeout(()=>root.replaceChildren(),4300);
  }
  function drawModal() {
    if(!modalName) {dialogRoot.replaceChildren();return;}
    const help=modalName==='help';
    const content=help?`<p>ALURIN dirancang agar murid kelas X dapat memahami algoritma melalui urutan langkah, simbol, dan percabangan. Berikut cara menjelajahi prototipe.</p><div class="detail-list"><div>${ICON('home','sm')} <span><strong>Beranda</strong>, memulai dan memilih aktivitas.</span></div><div>${ICON('clipboard','sm')} <span><strong>Diagnostik</strong>, berisi dua belas soal visual dan teks serta rekomendasi latihan berdasarkan kesalahan.</span></div><div>${ICON('book','sm')} <span><strong>Jelajah Konsep</strong>, pilih lima unit materi yang tersedia.</span></div><div>${ICON('blocks','sm')} <span><strong>Laboratorium</strong>, susun langkah, pilih simbol, periksa cabang, lalu jalankan tracing.</span></div><div>${ICON('bug','sm')} <span><strong>Detektif Logika</strong>, pilih perbaikan dan periksa alasan pada enam kasus.</span></div><div>${ICON('chart','sm')} <span><strong>Hasil Belajar</strong>, lihat daftar kasus yang benar-benar sudah selesai.</span></div></div>`:
      `<p>Sesuaikan kenyamanan tampilan di perangkat yang sedang digunakan. Pilihan disimpan hanya di peramban ini.</p><label class="toggle-row"><span>Perbesar teks<small>Memudahkan pembacaan judul, instruksi, dan soal.</small></span><input type="checkbox" data-setting="large-text" ${preferences.largeText?'checked':''}></label><label class="toggle-row"><span>Kurangi animasi<small>Meminimalkan transisi gerak antarkomponen.</small></span><input type="checkbox" data-setting="reduced-motion" ${preferences.reducedMotion?'checked':''}></label><p style="font-size:.75rem;">Fitur aksesibilitas lain akan disempurnakan bersamaan dengan pengembangan editor dan tracing.</p>`;
    dialogRoot.innerHTML=`<div class="modal-scrim" data-scrim><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><header class="modal-head"><h2 id="modalTitle">${help?'Bantuan Menggunakan ALURIN':'Pengaturan Tampilan'}</h2><button class="icon-btn" aria-label="Tutup dialog" type="button" data-action="close-modal">${ICON('x')}</button></header><div class="modal-body">${content}</div></section></div>`;
    dialogRoot.querySelector('[data-action="close-modal"]').focus();
  }
  function openModal(name, trigger) {previousFocus=trigger||document.activeElement;modalName=name;drawModal();}
  function closeModal(){modalName=null;drawModal();if(previousFocus?.isConnected)previousFocus.focus();}
  document.addEventListener('submit',async (event)=>{
    const form=event.target.closest('form[data-form]');if(!form)return;event.preventDefault();
    if(form.dataset.form==='student-login'){
      const fd=new FormData(form),name=String(fd.get('studentName')||'').trim().replace(/\s+/g,' '),className=String(fd.get('className')||'').trim().toUpperCase(),attendance=String(fd.get('attendance')||'').trim();
      const msg=form.querySelector('[data-login-message="student"]');
      if(name.length<3||!className||!/^\d{1,2}$/.test(attendance)||Number(attendance)<1||Number(attendance)>99){if(msg)msg.textContent='Periksa nama, kelas, dan nomor absen (1–99).';return;}
      if(msg)msg.textContent='Menghubungkan ke server...';
      try {
        let res=null;
        if(globalThis.ALURIN_API){
          res = await globalThis.ALURIN_API.studentLogin(name, className, attendance);
        }
        const studentId = res?.student?.id || studentRecordId(className,attendance);
        currentSession={role:'student',id:studentId,name:res?.student?.name||name,className:res?.student?.className||className,attendance:res?.student?.attendance||attendance};
        safeLocalSet(SESSION_KEY,JSON.stringify(currentSession));
        
        // Auto-resume state dari database PostgreSQL
        if(res && res.state){
          if(res.state.diagnosticAnswers){
            try{ diagnosticState.answers=JSON.parse(res.state.diagnosticAnswers); }catch{}
          }
          if(Number.isInteger(res.state.diagnosticStep)){
            diagnosticState.step=res.state.diagnosticStep;
          }
          if(res.state.diagnosticReport){
            try{ diagnosticState.report=JSON.parse(res.state.diagnosticReport); diagnosticState.mode='summary'; }catch{}
          }
          if(res.state.labStateJson){
            try{ Object.assign(labState, JSON.parse(res.state.labStateJson)); }catch{}
          }
          if(res.state.detectiveStateJson){
            try{ Object.assign(detectiveSelections, JSON.parse(res.state.detectiveStateJson)); }catch{}
          }
        }
        reloadUserState();
        syncStudentRecord();
        if(res && res.isResume){
          toast(`Selamat datang kembali, ${currentSession.name}! Progres Anda dipulihkan.`);
        } else {
          toast(`Selamat datang, ${currentSession.name}!`);
        }
        navigateTo('/beranda');
      } catch(err) {
        if(msg) msg.textContent = err.message || 'Gagal masuk. Coba lagi.';
      }
      return;
    }
    if(form.dataset.form==='teacher-login'){
      const fd=new FormData(form),username=String(fd.get('teacherUser')||'').trim(),password=String(fd.get('teacherPass')||'');
      const msg=form.querySelector('[data-login-message="teacher"]');
      if(!username||!password){if(msg)msg.textContent='Nama pengguna dan kata sandi wajib diisi.';return;}
      if(msg)msg.textContent='Memeriksa kredensial...';
      try {
        let res=null;
        if(globalThis.ALURIN_API){
          res = await globalThis.ALURIN_API.teacherLogin(username, password);
        }
        currentSession={role:'teacher',id:res?.teacher?.id||'guru-1',name:res?.teacher?.name||'Guru Informatika',username};
        safeLocalSet(SESSION_KEY,JSON.stringify(currentSession));
        adminTab='overview';
        toast(`Selamat datang, ${currentSession.name}!`);
        navigateTo('/guru');
      } catch(err) {
        if(msg) msg.textContent = err.message || 'Nama pengguna atau kata sandi salah.';
      }
      return;
    }
  });
  document.addEventListener('click', async (event)=>{
    const link = event.target.closest('a[href]');
    if (link && !link.target && !link.hasAttribute('download')) {
      const rawHref = link.getAttribute('href');
      if (rawHref && (rawHref.startsWith('/') || rawHref.startsWith('#/'))) {
        event.preventDefault();
        navigateTo(rawHref.replace(/^#\/?/, '/'));
        return;
      }
    }
    const adminTabBtn=event.target.closest('[data-admin-tab]');
    if(adminTabBtn){adminTab=adminTabBtn.dataset.adminTab;selectedAdminStudentId=null;render(false);return;}
    const adminView=event.target.closest('[data-admin-view]');
    if(adminView){selectedAdminStudentId=adminView.dataset.adminView;adminTab='detail';render(false);return;}
    const adminPreviewUnit=event.target.closest('[data-admin-preview-unit]');
    if(adminPreviewUnit){adminPreview={type:'unit',value:Number(adminPreviewUnit.dataset.adminPreviewUnit)};adminTab='preview';render(false);return;}
    const adminPreviewLab=event.target.closest('[data-admin-preview-lab]');
    if(adminPreviewLab){adminPreview={type:'lab',value:adminPreviewLab.dataset.adminPreviewLab};adminTab='preview';render(false);return;}
    const adminPreviewCase=event.target.closest('[data-admin-preview-case]');
    if(adminPreviewCase){adminPreview={type:'case',value:Number(adminPreviewCase.dataset.adminPreviewCase)};adminTab='preview';render(false);return;}
    if(event.target.closest('[data-action="logout"]')){
      if (globalThis.ALURIN_API) {
        try { await globalThis.ALURIN_API.logout(); } catch(e){}
      }
      currentSession=null;
      safeLocalSet(SESSION_KEY,'');
      modalName=null;
      navigateTo('/');
      return;
    }
    if(event.target.closest('[data-action="admin-seed"]')){seedDemoStudents();render(false);toast('Data simulasi ditambahkan. Semua profil bertanda Data simulasi.');return;}
    if(event.target.closest('[data-action="admin-clear-samples"]')){writeStudentRecords(readStudentRecords().filter(r=>!r.isDemo));render(false);toast('Data simulasi dihapus. Profil murid non-simulasi dipertahankan.');return;}
    if(event.target.closest('[data-action="admin-export"]')){exportCSV(adminRecordsFiltered());return;}
    if(event.target.closest('[data-action="admin-export-one"]')){exportCSV(readStudentRecords().filter(r=>r.id===selectedAdminStudentId));return;}
    if(event.target.closest('[data-action="submit-result"]')){submitStudentResult();return;}
    if(event.target.closest('[data-action="download-certificate"]')){downloadCertificate();return;}
    const modalBtn=event.target.closest('[data-modal]');
    if(modalBtn){openModal(modalBtn.dataset.modal,modalBtn);return;}
    if(event.target.matches('[data-scrim]')){closeModal();return;}
    const close=event.target.closest('[data-action="close-modal"]');if(close){closeModal();return;}
    const adaptiveGo=event.target.closest('[data-adaptive-go]');
    if(adaptiveGo){goAdaptive(adaptiveGo.dataset.concept,adaptiveGo.dataset.adaptiveGo);return;}
    const diagnosticPrev=event.target.closest('[data-action="diagnostic-prev"]');
    if(diagnosticPrev){diagnosticState.step=Math.max(0,diagnosticState.step-1);saveDiagnostic();render(false);app.querySelector('#diagnostic-question-heading')?.focus();return;}
    const diagnosticNext=event.target.closest('[data-action="diagnostic-next"]');
    if(diagnosticNext){
      const question=adaptive.QUESTIONS[diagnosticState.step];
      if(!diagnosticState.answers[question.id]){toast('Pilih satu jawaban terlebih dahulu.');return;}
      if(diagnosticState.step<adaptive.QUESTIONS.length-1){diagnosticState.step++;}
      else{
        const result=adaptive.evaluate(diagnosticState.answers);
        if(!result.ok){toast(result.error);return;}
        diagnosticState.report=result;diagnosticState.mode='summary';
        selectedConcept=adaptive.recommendation(result,practice,progress).priority.id;
        toast('Asesmen selesai. Rekomendasi latihan sudah disiapkan.');
        if (globalThis.ALURIN_API && currentSession?.role === 'student') {
          globalThis.ALURIN_API.submitStudentScore(result.correct, adaptive.QUESTIONS.length, result.concepts).catch(console.error);
        }
      }
      saveDiagnostic();render(false);
      if(diagnosticState.mode==='questions')app.querySelector('#diagnostic-question-heading')?.focus();
      return;
    }
    if(event.target.closest('[data-action="diagnostic-review"]')){diagnosticState.mode='review';navigateTo('diagnostik');return;}
    if(event.target.closest('[data-action="diagnostic-summary"]')){diagnosticState.mode='summary';render(false);return;}
    if(event.target.closest('[data-action="diagnostic-retake"]')){
      diagnosticState={answers:{},step:0,report:diagnosticState.report,mode:'questions'};
      saveDiagnostic();navigateTo('diagnostik');return;
    }
    const unit=event.target.closest('[data-unit]');
    if(unit){selectedUnit=Number(unit.dataset.unit);saveActivityState();render(false);app.querySelector('.unit-select[data-unit="'+selectedUnit+'"]')?.focus();return;}
    const c=event.target.closest('[data-case]');
    if(c){selectedCase=Number(c.dataset.case);saveActivityState();render(false);app.querySelector('.case-tab[data-case="'+selectedCase+'"]')?.focus();return;}
    const lab=event.target.closest('[data-lab-tab]');
    if(lab){selectedLabTab=Number(lab.dataset.labTab);saveActivityState();render(false);app.querySelector('[data-lab-tab="'+selectedLabTab+'"]').focus();return;}
    const move=event.target.closest('[data-lab-move]');
    if(move){
      const index=labState.order.indexOf(move.dataset.labMove);
      const target=index+(move.dataset.dir==='up'?-1:1);
      if(index>=0 && target>=0 && target<labState.order.length){
        [labState.order[index],labState.order[target]]=[labState.order[target],labState.order[index]];
        labChanged();render(false);
        app.querySelector('[data-lab-move="'+move.dataset.labMove+'"][data-dir="'+move.dataset.dir+'"]')?.focus();
      }
      return;
    }
    if(event.target.closest('[data-action="lab-zoom"]')){
      diagramZoom=!diagramZoom;render(false);app.querySelector('[data-action="lab-zoom"]')?.focus();return;
    }
    if(event.target.closest('[data-action="lab-check"]')){showLabFeedback();return;}
    if(event.target.closest('[data-action="lab-hint"]')){
      const oldHint=labState.hintLevel;
      labState.hintLevel=Math.min(3,labState.hintLevel+1);
      if(labState.hintLevel>oldHint){
        const issue=labState.feedback?.issues?.[0];
        const target=adaptive.conceptForIssue(issue?.kind) || (selectedLabTab===1?'branch':'order');
        notePractice(target,`${labState.scenario}:lab-hint-${labState.hintLevel}`,'hint');
      }
      saveActivityState();render(false);
      app.querySelector('[data-action="lab-hint"]')?.focus();return;
    }
    if(event.target.closest('[data-action="lab-reset"]')){
      labState=engine.initialLab(labState.scenario);selectedLabTab=0;saveActivityState();render(false);toast('Latihan dikembalikan ke susunan awal. Riwayat penyelesaian tetap tersimpan.');return;
    }
    if(event.target.closest('[data-action="trace-start"]')){
      const raw={};
      app.querySelectorAll('[data-trace-field]').forEach(x=>raw[x.dataset.traceField]=x.value);
      labState.draft={...raw};
      const result=engine.trace(labState,raw);
      if(!result.ok){toast(result.error);return;}
      labState.trace={data:result,index:0,values:result.values};saveActivityState();render(false);
      app.querySelector('[data-action="trace-next"]')?.focus();return;
    }
    if(event.target.closest('[data-action="trace-next"]')){
      if(labState.trace && labState.trace.index<labState.trace.data.events.length-1){labState.trace.index++;saveActivityState();render(false);app.querySelector('[data-action="trace-next"]')?.focus();}
      return;
    }
    if(event.target.closest('[data-action="trace-prev"]')){
      if(labState.trace && labState.trace.index>0){labState.trace.index--;saveActivityState();render(false);app.querySelector('[data-action="trace-prev"]')?.focus();}
      return;
    }
    const example=event.target.closest('[data-trace-example]');
    if(example){
      const chosen=engine.SCENARIOS[labState.scenario].examples[Number(example.dataset.traceExample)];
      if(chosen){labState.draft={...chosen.values};labState.trace=null;saveActivityState();render(false);app.querySelector('[data-trace-example="'+example.dataset.traceExample+'"]')?.focus();}
      return;
    }
    if(event.target.closest('[data-action="detective-check"]')){
      const id=currentCase().id;
      const answer=detectiveSelections[id];
      if(!answer){toast('Pilih salah satu perbaikan terlebih dahulu.');return;}
      const ok=answer===currentCase().correct;
      detectiveFeedback[id]={ok,message:ok?currentCase().explanation:'Perbaikan tersebut belum menyelesaikan kesalahan yang ditunjukkan. Periksa lagi fungsi langkah atau kondisi pada diagram.'};
      if(!ok)notePractice(({order:'order',symbol:'symbol',branch:'branch',terminal:'order',boundary:'branch',trace:'trace'})[id]||'trace',`detective:${id}:${answer}`);
      if(ok&&!progress.detective.includes(id)){progress.detective.push(id);saveProgress();}
      saveActivityState();render(false);app.querySelector('[data-action="detective-check"]')?.focus();return;
    }
    if(event.target.closest('[data-action="detective-hint"]')){
      const id=currentCase().id;
      detectiveHint[id]=!detectiveHint[id];
      if(detectiveHint[id])notePractice(({order:'order',symbol:'symbol',branch:'branch',terminal:'order',boundary:'branch',trace:'trace'})[id]||'trace',`detective:${id}:hint`,'hint');
      saveActivityState();render(false);app.querySelector('[data-action="detective-hint"]')?.focus();return;
    }
  });
  document.addEventListener('input',(event)=>{
    const target=event.target;
    if(target.matches('[data-admin-search]')){const cursor=target.selectionStart;adminSearch=target.value.trim();render(false);const next=app.querySelector('[data-admin-search]');if(next){next.focus();try{next.setSelectionRange(cursor,cursor);}catch{}}return;}
  });
  document.addEventListener('change',(event)=>{
    const target=event.target;
    if(target.matches('[data-admin-class]')){adminClassFilter=target.value;render(false);return;}
    if(target.matches('[data-admin-status]')){adminStatusFilter=target.value;render(false);return;}
    if(target.matches('[data-lab-scenario]')){
      labState=engine.initialLab(target.value);selectedLabTab=0;saveActivityState();render(false);return;
    }
    if(target.matches('[data-lab-shape]')){
      labState.types[target.dataset.labShape]=target.value;
      labChanged();render(false);
      app.querySelector('[data-lab-shape="'+target.dataset.labShape+'"]').focus();return;
    }
    if(target.matches('[data-lab-branch]')){
      labState.branches[target.dataset.labBranch]=target.value;
      labChanged();render(false);
      app.querySelector('[data-lab-branch="'+target.dataset.labBranch+'"]').focus();return;
    }
    if(target.matches('input[name="detective-answer"]')){
      const id=currentCase().id;
      detectiveSelections[id]=target.value;
      detectiveFeedback[id]=null;
      saveActivityState();render(false);
      app.querySelector('input[name="detective-answer"][value="'+target.value+'"]').focus();return;
    }
    if(target.matches('[data-trace-field]')){
      labState.draft={...(labState.draft||{}),[target.dataset.traceField]:target.value};
      if(labState.trace){labState.trace=null;render(false);toast('Nilai input berubah. Jalankan ulang tracing untuk melihat jalur yang baru.');}
      saveActivityState();return;
    }
    if(event.target.matches('input[name="diagnostic-choice"]')){
      const q=adaptive.QUESTIONS[diagnosticState.step];
      diagnosticState.answers[q.id]=event.target.value;
      saveDiagnostic();
      const next=app.querySelector('[data-action="diagnostic-next"]');if(next)next.disabled=false;
      const status=app.querySelector('.diagnostic-hintline');
      if(status)status.textContent='Jawaban tersimpan sementara. Kamu dapat mengubahnya sebelum menyelesaikan asesmen.';
      return;
    }
    if(event.target.matches('[data-setting]')){
      const key='alurin-'+event.target.dataset.setting;
      if(event.target.dataset.setting==='large-text') preferences.largeText=event.target.checked;
      else if(event.target.dataset.setting==='reduced-motion') preferences.reducedMotion=event.target.checked;
      safeLocalSet(key,String(event.target.checked));
      applyPreferences();
      return;
    }
  });
  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape'&&modalName)closeModal();
    if(event.key==='Tab'&&modalName){
      const modal=dialogRoot.querySelector('.modal');
      const focusables=Array.from(modal.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]'));
      if(!focusables.length)return;
      const first=focusables[0],last=focusables[focusables.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  window.addEventListener('popstate',()=>{render(true);});
  window.addEventListener('hashchange',()=>{render(true);});
  applyPreferences();
  render(false);
})();
