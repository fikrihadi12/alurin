/**
 * ALURIN 0.2 — inti logika latihan yang bisa diuji tanpa browser.
 * Cakupan editor TERPANDU: empat langkah utama, dua keluaran, dan satu keputusan.
 * Bukan compiler atau pemeriksa flowchart bebas.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ALURIN_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SCENARIOS = {
    nilai: {key:'nilai',name:'Ketuntasan nilai',subtitle:'Menentukan apakah nilai mencapai batas 75.',context:'Sistem menerima nilai ujian, kemudian memeriksa apakah nilai mencapai 75 untuk menampilkan status ketuntasan.',labels:{start:'Mulai',input:'Input nilai',decision:'Nilai ≥ 75?',end:'Selesai'},fields:[{key:'nilai',label:'Nilai yang diuji',min:0,max:100,defaultValue:80}],yes:'Tuntas',no:'Belum Tuntas',compute:v=>v.nilai>=75,explanation:v=>`Karena ${v.nilai} ${v.nilai>=75?'≥':'<'} 75, kondisi bernilai ${v.nilai>=75?'Ya':'Tidak'}.`,examples:[{label:'Nilai 80 (Ya)',values:{nilai:80}},{label:'Nilai 60 (Tidak)',values:{nilai:60}}]},
    saldo: {key:'saldo',name:'Pemeriksaan saldo',subtitle:'Mengecek kecukupan saldo untuk nominal yang diminta.',context:'Simulasi logika saldo, tidak melakukan transaksi atau memeriksa PIN.',labels:{start:'Mulai',input:'Input saldo dan nominal',decision:'Saldo ≥ nominal?',end:'Selesai'},fields:[{key:'saldo',label:'Saldo tersedia (Rp)',min:0,max:1000000000,defaultValue:200000},{key:'nominal',label:'Nominal transfer (Rp)',min:0,max:1000000000,defaultValue:150000}],yes:'Saldo cukup',no:'Saldo tidak cukup',compute:v=>v.saldo>=v.nominal,explanation:v=>`Karena saldo Rp${v.saldo.toLocaleString('id-ID')} ${v.saldo>=v.nominal?'≥':'<'} nominal Rp${v.nominal.toLocaleString('id-ID')}, kondisi bernilai ${v.saldo>=v.nominal?'Ya':'Tidak'}.`,examples:[{label:'Saldo cukup (Ya)',values:{saldo:200000,nominal:150000}},{label:'Saldo kurang (Tidak)',values:{saldo:80000,nominal:150000}}]},
    diskon: {key:'diskon',name:'Gratis ongkir belanja',subtitle:'Menguji batas minimum transaksi untuk gratis ongkir.',context:'Toko memberi gratis ongkir jika total belanja minimal Rp100.000. Simulasi ini hanya memeriksa syarat.',labels:{start:'Mulai',input:'Input total belanja',decision:'Total ≥ Rp100.000?',end:'Selesai'},fields:[{key:'total',label:'Total belanja (Rp)',min:0,max:100000000,defaultValue:120000}],yes:'Gratis ongkir',no:'Ongkir normal',compute:v=>v.total>=100000,explanation:v=>`Total Rp${v.total.toLocaleString('id-ID')} ${v.total>=100000?'memenuhi':'belum memenuhi'} batas Rp100.000.`,examples:[{label:'Rp120.000 (Ya)',values:{total:120000}},{label:'Rp75.000 (Tidak)',values:{total:75000}}]},
    buku: {key:'buku',name:'Ketersediaan buku',subtitle:'Memilih tindakan berdasarkan status ketersediaan buku.',context:'Sistem perpustakaan menerima status buku, kemudian menentukan apakah proses peminjaman dapat dilanjutkan.',labels:{start:'Mulai',input:'Input status buku',decision:'Buku tersedia?',end:'Selesai'},fields:[{key:'tersedia',label:'Status buku (1 tersedia, 0 tidak)',min:0,max:1,defaultValue:1}],yes:'Lanjut peminjaman',no:'Pilih buku lain',compute:v=>v.tersedia===1,explanation:v=>`Status buku ${v.tersedia===1?'tersedia':'tidak tersedia'}, sehingga jalur ${v.tersedia===1?'Ya':'Tidak'} dipilih.`,examples:[{label:'Buku tersedia (Ya)',values:{tersedia:1}},{label:'Buku tidak tersedia (Tidak)',values:{tersedia:0}}]},
    tugas: {key:'tugas',name:'Pemeriksaan unggahan LMS',subtitle:'Memastikan file dipilih sebelum proses unggah.',context:'Sistem memeriksa apakah murid sudah memilih file tugas. Simulasi tidak benar-benar mengunggah berkas.',labels:{start:'Mulai',input:'Input status file',decision:'File sudah dipilih?',end:'Selesai'},fields:[{key:'fileDipilih',label:'Status file (1 sudah dipilih, 0 belum)',min:0,max:1,defaultValue:1}],yes:'Lanjut unggah',no:'Pilih file terlebih dahulu',compute:v=>v.fileDipilih===1,explanation:v=>`Status file ${v.fileDipilih===1?'sudah dipilih':'belum dipilih'}, sehingga jalur ${v.fileDipilih===1?'Ya':'Tidak'} dipilih.`,examples:[{label:'File dipilih (Ya)',values:{fileDipilih:1}},{label:'Belum pilih file (Tidak)',values:{fileDipilih:0}}]},
    antrean: {key:'antrean',name:'Antrean layanan',subtitle:'Memeriksa apakah nomor antrean sedang dipanggil.',context:'Simulasi menentukan apakah nomor murid sama dengan nomor yang sedang dipanggil.',labels:{start:'Mulai',input:'Input nomor antrean',decision:'Nomor sedang dipanggil?',end:'Selesai'},fields:[{key:'nomorMurid',label:'Nomor antrean murid',min:1,max:999,defaultValue:12},{key:'nomorDipanggil',label:'Nomor yang dipanggil',min:1,max:999,defaultValue:12}],yes:'Silakan menuju loket',no:'Tunggu giliran',compute:v=>v.nomorMurid===v.nomorDipanggil,explanation:v=>`Nomor murid ${v.nomorMurid} ${v.nomorMurid===v.nomorDipanggil?'sama dengan':'berbeda dari'} nomor yang dipanggil (${v.nomorDipanggil}).`,examples:[{label:'Nomor sesuai (Ya)',values:{nomorMurid:12,nomorDipanggil:12}},{label:'Belum giliran (Tidak)',values:{nomorMurid:14,nomorDipanggil:12}}]}
  };
  const TYPES = {terminator:'Terminator',io:'Input/Output',process:'Process',decision:'Decision'};
  const EXPECTED_ORDER=['start','input','decision','end'];
  const EXPECTED_TYPES={start:'terminator',input:'io',decision:'decision',end:'terminator'};
  const DETECTIVE=[
    {id:'order',title:'Kondisi diperiksa sebelum input',question:'Perbaikan apa yang paling tepat?',choices:[{id:'swap',label:'Pindahkan Input nilai sebelum pemeriksaan kondisi'},{id:'ignore',label:'Hapus input dan periksa nilai saja'},{id:'end',label:'Pindahkan Selesai ke awal'}],correct:'swap',explanation:'Nilai harus tersedia sebelum diuji. Urutan yang benar adalah Mulai → Input → Decision → keluaran → Selesai.',hint:'Dari mana nilai yang dibandingkan diperoleh?'},
    {id:'symbol',title:'Simbol keputusan salah',question:'Simbol apa yang tepat untuk “Apakah saldo cukup?”',choices:[{id:'process',label:'Process, persegi panjang'},{id:'decision',label:'Decision, belah ketupat'},{id:'terminator',label:'Terminator, oval'}],correct:'decision',explanation:'Kondisi yang menghasilkan dua jalur menggunakan Decision.',hint:'Simbol apa yang digunakan jika ada jalur Ya dan Tidak?'},
    {id:'branch',title:'Cabang Ya dan Tidak tertukar',question:'Untuk kondisi Nilai ≥ 75, keluaran cabang Ya adalah ...',choices:[{id:'belum',label:'Belum Tuntas'},{id:'tuntas',label:'Tuntas'},{id:'input',label:'Input nilai lagi tanpa alasan'}],correct:'tuntas',explanation:'Nilai 80 memenuhi kondisi ≥ 75, sehingga jalur Ya menuju Tuntas.',hint:'Uji dengan nilai 80.'},
    {id:'terminal',title:'Alur tidak mencapai Selesai',question:'Diagram berhenti setelah menampilkan hasil dan tidak memiliki akhir. Perbaikan yang tepat?',choices:[{id:'finish',label:'Tambahkan Terminator Selesai pada akhir alur'},{id:'decision',label:'Ganti semua langkah menjadi Decision'},{id:'delete',label:'Hapus keluaran hasil'}],correct:'finish',explanation:'Alur perlu memiliki titik akhir yang jelas setelah keluaran.',hint:'Simbol apa yang menandai berakhirnya algoritma?'},
    {id:'boundary',title:'Operator batas tidak tepat',question:'Syarat gratis ongkir adalah total ≥ Rp100.000. Total tepat Rp100.000. Apa yang harus diperbaiki jika sistem menolak gratis ongkir?',choices:[{id:'inclusive',label:'Pastikan operator mencakup nilai yang sama dengan Rp100.000'},{id:'raise',label:'Naikkan batas menjadi Rp150.000'},{id:'remove',label:'Hapus pemeriksaan total'}],correct:'inclusive',explanation:'Operator ≥ mencakup nilai yang sama dengan batas. Nilai tepat Rp100.000 harus memenuhi kondisi.',hint:'Apa perbedaan > dan ≥?'},
    {id:'trace',title:'Hasil tracing tidak konsisten',question:'Nilai 68 diuji dengan kondisi nilai ≥ 70. Sistem menampilkan Lulus. Apa perbaikan yang benar?',choices:[{id:'no-branch',label:'Arahkan nilai 68 ke cabang Tidak dan keluaran Perlu latihan'},{id:'always-yes',label:'Jadikan semua nilai cabang Ya'},{id:'remove-input',label:'Hapus masukan nilai'}],correct:'no-branch',explanation:'Karena 68 lebih kecil dari 70, kondisi salah dan jalur Tidak harus dipilih.',hint:'Hitung apakah 68 ≥ 70 benar atau salah.'}
  ];
  function initialLab(key='nilai') {
    if (!SCENARIOS[key]) key='nilai';
    return {scenario:key,order:['start','decision','input','end'],types:{start:'terminator',input:'process',decision:'process',end:'terminator'},branches:{yes:'no',no:'yes'},hintLevel:0,checked:false,feedback:null,trace:null};
  }
  function copyLab(lab) {return {...lab,order:lab.order.slice(),types:{...lab.types},branches:{...lab.branches},trace:lab.trace?{...lab.trace,values:{...lab.trace.values}}:null};}
  function validate(lab) {
    const issues=[];
    if (!lab || !SCENARIOS[lab.scenario])return {ok:false,issues:[{kind:'scenario',message:'Kasus latihan tidak dikenal.'}]};
    const order=lab.order||[];
    if (order.length!==4 || new Set(order).size!==4 || EXPECTED_ORDER.some(x=>!order.includes(x))) {
      issues.push({kind:'order',message:'Empat langkah utama harus memuat Mulai, Input, Decision, dan Selesai tepat satu kali.'});
    } else if (order.some((x,i)=>x!==EXPECTED_ORDER[i])) {
      issues.push({kind:'order',message:'Urutan belum logis. Data harus dimasukkan sebelum keputusan diperiksa. Mulai dan Selesai juga harus berada di ujung alur.'});
    }
    for (const [step,expected] of Object.entries(EXPECTED_TYPES)) {
      if (lab.types?.[step]!==expected) {
        issues.push({kind:'type',step,message:`Simbol untuk “${SCENARIOS[lab.scenario].labels[step]}” belum tepat. Periksa apakah fungsinya awal/akhir, masukan, atau keputusan.`});
      }
    }
    if(lab.branches?.yes!=='yes')issues.push({kind:'branch',step:'yes',message:'Cabang Ya belum menuju keluaran yang sesuai saat kondisi terpenuhi.'});
    if(lab.branches?.no!=='no')issues.push({kind:'branch',step:'no',message:'Cabang Tidak belum menuju keluaran saat kondisi tidak terpenuhi.'});
    return {ok:issues.length===0,issues};
  }
  function readValues(scenarioKey, raw) {
    const scenario=SCENARIOS[scenarioKey];
    if (!scenario) return {ok:false,error:'Kasus tidak ditemukan.'};
    const values={};
    for(const field of scenario.fields){
      const val=raw?.[field.key];
      if(val===null || val===undefined || String(val).trim()==='')return {ok:false,error:`Isi ${field.label.toLowerCase()} terlebih dahulu.`};
      const n=Number(val);
      if(!Number.isFinite(n) || !Number.isInteger(n) || n<field.min || n>field.max)return {ok:false,error:`${field.label} harus berupa bilangan bulat antara ${field.min} dan ${field.max}.`};
      values[field.key]=n;
    }
    return {ok:true,values};
  }
  function trace(lab,raw){
    const checked=validate(lab);
    if(!checked.ok)return {ok:false,error:'Perbaiki alur dan tekan Periksa diagram sebelum melakukan tracing.'};
    const inputs=readValues(lab.scenario,raw);
    if(!inputs.ok)return inputs;
    const s=SCENARIOS[lab.scenario],yes=s.compute(inputs.values);
    const outcome=yes?'yes':'no';
    const events=[
      {node:'start',title:'Mulai',explanation:'Algoritma dimulai.'},
      {node:'input',title:s.labels.input,explanation:s.fields.map(f=>`${f.label}: ${inputs.values[f.key].toLocaleString('id-ID')}`).join(', ')},
      {node:'decision',title:s.labels.decision,explanation:s.explanation(inputs.values)},
      {node:outcome,title:yes?'Cabang Ya':'Cabang Tidak',explanation:`Keluaran: ${yes?s.yes:s.no}.`},
      {node:'end',title:'Selesai',explanation:'Algoritma telah mencapai akhir.'}
    ];
    return {ok:true,values:inputs.values,yes,outcome,events};
  }
  return Object.freeze({SCENARIOS,TYPES,DETECTIVE,EXPECTED_ORDER,EXPECTED_TYPES,initialLab,copyLab,validate,readValues,trace});
});
