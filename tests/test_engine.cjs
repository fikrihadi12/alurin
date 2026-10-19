/** Uji mesin logika ALURIN v0.4. Jalankan: node tests/test_engine.cjs */
'use strict';
const assert=require('node:assert/strict');
const E=require('../js/engine.v0.4.js');
let passed=0;function test(name,fn){fn();passed++;console.log('✓ '+name)}
function correct(key){const l=E.initialLab(key);l.order=['start','input','decision','end'];l.types={...E.EXPECTED_TYPES};l.branches={yes:'yes',no:'no'};return l;}
test('Enam skenario Laboratorium tersedia',()=>assert.equal(Object.keys(E.SCENARIOS).length,6));
test('Enam kasus Detektif tersedia',()=>assert.equal(E.DETECTIVE.length,6));
test('Latihan awal sengaja memiliki kesalahan yang dapat diperiksa',()=>assert.equal(E.validate(E.initialLab()).ok,false));
test('Seluruh skenario menerima diagram benar',()=>Object.keys(E.SCENARIOS).forEach(k=>assert.equal(E.validate(correct(k)).ok,true,k)));
test('Skenario tidak dikenal ditolak',()=>assert.equal(E.validate({...correct('nilai'),scenario:'tidak-ada'}).ok,false));
test('Urutan salah terdeteksi',()=>{const l=correct('nilai');l.order=['start','decision','input','end'];assert.equal(E.validate(l).ok,false)});
test('Simbol keputusan salah terdeteksi',()=>{const l=correct('nilai');l.types.decision='process';assert.equal(E.validate(l).ok,false)});
test('Cabang tertukar terdeteksi',()=>{const l=correct('nilai');l.branches={yes:'no',no:'yes'};assert.equal(E.validate(l).ok,false)});
test('Nilai tepat batas 75 diterima sebagai Tuntas',()=>assert.equal(E.trace(correct('nilai'),{nilai:75}).yes,true));
test('Nilai 74 diterima sebagai Belum Tuntas',()=>assert.equal(E.trace(correct('nilai'),{nilai:74}).yes,false));
test('Saldo sama dengan nominal memenuhi syarat',()=>assert.equal(E.trace(correct('saldo'),{saldo:150000,nominal:150000}).yes,true));
test('Kasus diskon tepat batas memberi gratis ongkir',()=>assert.equal(E.trace(correct('diskon'),{total:100000}).yes,true));
test('Buku tersedia memilih jalur Ya',()=>assert.equal(E.trace(correct('buku'),{tersedia:1}).yes,true));
test('Buku tidak tersedia memilih jalur Tidak',()=>assert.equal(E.trace(correct('buku'),{tersedia:0}).yes,false));
test('File belum dipilih memilih jalur Tidak',()=>assert.equal(E.trace(correct('tugas'),{fileDipilih:0}).yes,false));
test('Nomor antrean yang sama memilih jalur Ya',()=>assert.equal(E.trace(correct('antrean'),{nomorMurid:12,nomorDipanggil:12}).yes,true));
test('Input negatif ditolak',()=>assert.equal(E.trace(correct('nilai'),{nilai:-1}).ok,false));
test('Input di luar rentang ditolak',()=>assert.equal(E.trace(correct('nilai'),{nilai:101}).ok,false));
test('Input kosong ditolak',()=>assert.equal(E.trace(correct('nilai'),{nilai:''}).ok,false));
test('Tracing hanya tersedia jika diagram benar',()=>assert.equal(E.trace(E.initialLab(),{nilai:80}).ok,false));
test('Tracing memiliki lima peristiwa terurut',()=>assert.deepEqual(E.trace(correct('nilai'),{nilai:80}).events.map(x=>x.node),['start','input','decision','yes','end']));
test('Semua kasus detektif memiliki satu kunci yang valid',()=>E.DETECTIVE.forEach(d=>assert.equal(d.choices.filter(c=>c.id===d.correct).length,1)));
console.log(`LULUS: ${passed} uji mesin flowchart.`);
