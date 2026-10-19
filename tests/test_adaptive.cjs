/** Uji mesin asesmen ALURIN v0.4. Jalankan: node tests/test_adaptive.cjs */
'use strict';
const assert=require('node:assert/strict');
const A=require('../js/adaptive-engine.v0.4.js');
let passed=0;function test(name,fn){fn();passed++;console.log('✓ '+name)}
const correct=Object.fromEntries(A.QUESTIONS.map(q=>[q.id,q.choices.find(c=>c.correct).id]));
const wrong=Object.fromEntries(A.QUESTIONS.map(q=>[q.id,q.choices.find(c=>!c.correct).id]));
test('Terdapat 12 soal diagnostik',()=>assert.equal(A.QUESTIONS.length,12));
test('Empat konsep masing-masing memiliki tiga soal',()=>Object.keys(A.CONCEPTS).forEach(k=>assert.equal(A.QUESTIONS.filter(q=>q.concept===k).length,3,k)));
test('Sekurangnya delapan soal menggunakan ilustrasi visual',()=>assert.ok(A.QUESTIONS.filter(q=>q.visual).length>=8));
test('Setiap soal mempunyai empat pilihan dan tepat satu kunci',()=>A.QUESTIONS.forEach(q=>{assert.equal(q.choices.length,4);assert.equal(q.choices.filter(c=>c.correct).length,1);assert.equal(new Set(q.choices.map(c=>c.id)).size,4)}));
test('Setiap pengecoh menjelaskan miskonsepsi',()=>A.QUESTIONS.forEach(q=>q.choices.filter(c=>!c.correct).forEach(c=>assert.ok(c.mistake))));
test('Jawaban kosong ditolak',()=>assert.equal(A.evaluate({}).ok,false));
test('Jawaban kurang satu ditolak dengan ID yang tepat',()=>{const a={...correct};delete a.q12;assert.deepEqual(A.evaluate(a).missing,['q12'])});
test('Jawaban invalid dihapus',()=>assert.deepEqual(A.sanitizeAnswers({q01:'<script>',q02:correct.q02}),{q02:correct.q02}));
test('Semua jawaban benar mendapat skor 12',()=>assert.equal(A.evaluate(correct).correct,12));
test('Semua jawaban salah mendapat skor nol',()=>assert.equal(A.evaluate(wrong).correct,0));
test('Tiap konsep memiliki tiga butir dalam laporan',()=>Object.values(A.evaluate(correct).concepts).forEach(c=>assert.equal(c.total,3)));
test('Laporan dihitung ulang untuk mencegah manipulasi skor',()=>{const r=A.evaluate(correct);r.correct=999;assert.equal(A.validateReport(r).correct,12)});
test('Laporan versi lama ditolak',()=>{const r=A.evaluate(correct);r.version=1;assert.equal(A.validateReport(r),null)});
test('Laporan tidak lengkap ditolak',()=>assert.equal(A.validateReport({version:2,ok:true,answers:{q01:'a'}}),null));
test('Kesalahan yang sama tidak dicatat dua kali',()=>{const a=A.register(null,'symbol','same');const b=A.register(a.practice,'symbol','same');assert.equal(a.added,true);assert.equal(b.added,false);assert.equal(b.practice.mistakes.symbol,1)});
test('Petunjuk dan kesalahan dicatat terpisah',()=>{const a=A.register(null,'trace','hint-1','hint');assert.equal(a.practice.hints.trace,1);assert.equal(a.practice.mistakes.trace,0)});
test('Pemetaan jenis kesalahan benar',()=>{assert.equal(A.conceptForIssue('type'),'symbol');assert.equal(A.conceptForIssue('branch'),'branch');assert.equal(A.conceptForIssue('order'),'order')});
test('Rekomendasi memprioritaskan konsep dengan kesalahan terbanyak',()=>{const a={...correct,q01:wrong.q01,q02:wrong.q02,q03:wrong.q03};assert.equal(A.recommendation(A.evaluate(a),null).priority.id,'order')});
test('Rekomendasi tetap tersedia sebelum diagnostik',()=>assert.equal(A.recommendation(null,null).hasDiagnostic,false));
test('Rekomendasi mencakup empat konsep',()=>assert.equal(A.recommendation(A.evaluate(correct),null).entries.length,4));
console.log(`LULUS: ${passed} uji mesin adaptif.`);
