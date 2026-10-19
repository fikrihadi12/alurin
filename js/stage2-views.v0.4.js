/** ALURIN Tahap 2 | Komponen UI latihan interaktif, tanpa framework atau jaringan. */
(function(root){
  'use strict';
  const E=root.ALURIN_ENGINE;
  const ESC=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ICON=(name)=>`<svg class="ico" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const opts=(array,chosen)=>array.map(({value,label})=>`<option value="${ESC(value)}" ${chosen===value?'selected':''}>${ESC(label)}</option>`).join('');
  const TYPE_OPTIONS=Object.entries(E.TYPES).map(([value,label])=>({value,label}));
  const isActive=(trace,node)=>trace?.data?.events?.[trace.index]?.node===node;
  const C={blue:'#3773df',blueFill:'#e8f1ff',teal:'#0b9486',tealFill:'#e6f8f4',amber:'#cf8e2b',amberFill:'#fff4df',ink:'#234468',muted:'#67809e'};
  function shape(role,type,x,y,label,active){
    const selected=active?' class="flow-node-active"':'';
    const colors=role==='decision'? [C.amber,C.amberFill]:role==='input'?[C.teal,C.tealFill]:[C.blue,C.blueFill];
    const [stroke,fill]=colors;
    let shapeMarkup='';
    if(type==='terminator')shapeMarkup=`<rect x="${x-100}" y="${y-24}" width="200" height="48" rx="23"/>`;
    else if(type==='decision')shapeMarkup=`<path d="M${x} ${y-42} L${x+112} ${y} L${x} ${y+42} L${x-112} ${y} Z"/>`;
    else if(type==='io')shapeMarkup=`<path d="M${x-95} ${y-26} H${x+111} L${x+95} ${y+26} H${x-111} Z"/>`;
    else shapeMarkup=`<rect x="${x-112}" y="${y-28}" width="224" height="56" rx="8"/>`;
    const words=label.split(' '),lines=[];
    let line='';
    for(const word of words){if((line+' '+word).trim().length>19&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}
    if(line)lines.push(line);
    let texts=lines.map((l,i)=>`<tspan x="${x}" dy="${i===0?0:18}">${ESC(l)}</tspan>`).join('');
    return `<g data-node-id="${role}" ${selected} aria-label="${ESC(role)}: ${ESC(label)}" stroke="${stroke}" fill="${fill}" stroke-width="2.5">${shapeMarkup}<text x="${x}" y="${y-(lines.length-1)*9+5}" text-anchor="middle" font-size="15" font-weight="730" stroke="none" fill="${C.ink}">${texts}</text></g>`;
  }
  function branchShape(branch,label,x,active){
    const y=397,fill=branch==='yes'?'#e4f8f2':'#fff3e3',stroke=branch==='yes'?C.teal:C.amber;
    const lines=label.length>18 ? label.split(' ').reduce((a,w)=>{if(!a.length||a[a.length-1].length+w.length>16)a.push(w);else a[a.length-1]+=' '+w;return a;},[]):[label];
    return `<g data-node-id="${branch}" class="${active?'flow-node-active':''}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"><path d="M${x-111} ${y-30} H${x+103} L${x+111} ${y+30} H${x-103} Z"/><text x="${x}" y="${y-((lines.length-1)*9)+6}" text-anchor="middle" font-size="14" font-weight="750" stroke="none" fill="${C.ink}">${lines.map((line,i)=>`<tspan x="${x}" dy="${i===0?0:18}">${ESC(line)}</tspan>`).join('')}</text></g>`;
  }
  function diagram(lab){
    const s=E.SCENARIOS[lab.scenario], trace=lab.trace;
    const y=[59,159,259,556],center=360,left=124,right=596,paths=[];
    const marker='url(#arrLab)';
    const order=lab.order;
    for(let i=0;i<2;i++){
      const y1=y[i]+(lab.types[order[i]]==='decision'?43:29),y2=y[i+1]-(lab.types[order[i+1]]==='decision'?43:29);
      paths.push(`<path d="M360 ${y1+4} V${y2-5}" stroke="${C.muted}" stroke-width="2.5" fill="none" marker-end="${marker}"/>`);
    }
    const conditionAt=order.indexOf('decision'),conditionY=y[conditionAt];
    if(conditionAt===2){ // alur bercabang dengan benar hanya jika keputusan mendahului dua keluaran
      paths.push(`<path d="M248 ${conditionY} H${left} V359" stroke="${C.muted}" stroke-width="2.5" fill="none" marker-end="${marker}"/>`);
      paths.push(`<path d="M472 ${conditionY} H${right} V359" stroke="${C.muted}" stroke-width="2.5" fill="none" marker-end="${marker}"/>`);
    } else {
      paths.push(`<path d="M248 ${conditionY} H${left} V359" stroke="#d48b45" stroke-width="2.5" stroke-dasharray="7 5" fill="none" marker-end="${marker}"/>`);
      paths.push(`<path d="M472 ${conditionY} H${right} V359" stroke="#d48b45" stroke-width="2.5" stroke-dasharray="7 5" fill="none" marker-end="${marker}"/>`);
      paths.push(`<path d="M360 ${y[2]+32} V${y[3]-30}" stroke="#d48b45" stroke-width="2.5" stroke-dasharray="7 5" fill="none" marker-end="${marker}"/>`);
    }
    paths.push(`<path d="M${left} 427 V493 H360 V526" stroke="${C.muted}" stroke-width="2.5" fill="none"/>`);
    paths.push(`<path d="M${right} 427 V493 H360" stroke="${C.muted}" stroke-width="2.5" fill="none"/>`);
    paths.push(`<path d="M360 493 V525" stroke="${C.muted}" stroke-width="2.5" fill="none" marker-end="${marker}"/>`);
    const labels=order.map((role,i)=>shape(role,lab.types[role],center,y[i],s.labels[role],isActive(trace,role)));
    const leftLabel=s[lab.branches.yes]||'Belum dipilih',rightLabel=s[lab.branches.no]||'Belum dipilih';
    return `<svg class="interactive-diagram" viewBox="0 0 720 630" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram flowchart berdasarkan susunan langkah dan percabangan yang sedang dipilih. ${lab.checked?'Hasil pemeriksaan tersedia di panel petunjuk.':'Belum diperiksa.'}">
      <defs><marker id="arrLab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="${C.muted}"/></marker></defs>
      <text x="360" y="17" text-anchor="middle" fill="${C.muted}" font-size="14" font-weight="650">Urutan utama dan dua cabang keputusan</text>
      ${paths.join('')}
      ${labels.join('')}
      <text x="196" y="${Math.max(105,Math.min(347,conditionY-12))}" text-anchor="middle" fill="${C.teal}" font-size="13" font-weight="800">Ya</text>
      <text x="530" y="${Math.max(105,Math.min(347,conditionY-12))}" text-anchor="middle" fill="${C.amber}" font-size="13" font-weight="800">Tidak</text>
      ${branchShape('yes',leftLabel,left,isActive(trace,'yes'))}${branchShape('no',rightLabel,right,isActive(trace,'no'))}
      ${lab.checked&&E.validate(lab).ok?'<text x="360" y="617" text-anchor="middle" fill="#0a8e7a" font-size="13" font-weight="700">Alur terverifikasi, siap menjalankan tracing</text>':'<text x="360" y="617" text-anchor="middle" fill="#71839b" font-size="13">Sesuaikan langkah dan simbol, lalu tekan Periksa diagram</text>'}
    </svg>`;
  }
  const guide=(tab,scenario)=>tab===0?`<div class="lab-guide-intro"><h3>Susun urutan dan simbol</h3><p>Gunakan tombol panah pada daftar untuk mengatur urutan. Pilih bentuk simbol sesuai fungsi setiap langkah, kemudian periksa keseluruhan diagram.</p></div>`:
    tab===1?`<div class="lab-guide-intro"><h3>Tentukan keluaran dua cabang</h3><p>Untuk kondisi <strong>${ESC(scenario.labels.decision)}</strong>, tentukan hasil yang sesuai saat kondisi benar (Ya) dan salah (Tidak).</p></div>`:
    `<div class="lab-guide-intro"><h3>Jalankan tracing bertahap</h3><p>Tracing hanya dapat dimulai setelah diagram lolos pemeriksaan. Isi nilai, kemudian ikuti langkah yang disorot pada diagram.</p></div>`;
  const labHints=[
    'Perhatikan apakah data sudah dimasukkan sebelum kondisi diperiksa. Pikirkan juga fungsi simbol yang digunakan.',
    'Urutan yang diharapkan adalah Mulai, Input, Decision, lalu Selesai. Jangan lupa bahwa Decision bercabang menjadi Ya dan Tidak.',
    'Petunjuk lengkap: urutkan Mulai → Input → Decision → Selesai. Gunakan Terminator untuk Mulai/Selesai, Input/Output untuk masukan, Decision untuk kondisi. Hubungkan Ya ke keluaran saat syarat terpenuhi, Tidak ke keluaran lainnya.'
  ];
  function feedbackView(lab){
    if(!lab.feedback)return `<div class="lab-feedback neutral" role="status"><strong>${ICON('info')} Belum diperiksa</strong><p>Setelah mengubah diagram, tekan Periksa diagram untuk melihat apa yang sudah benar dan apa yang masih perlu diperbaiki.</p></div>`;
    if(lab.feedback.ok)return `<div class="lab-feedback good" role="status"><strong>${ICON('check-circle')} Alur sudah sesuai</strong><p>Urutan, jenis simbol, dan keluaran kedua cabang sudah konsisten. Sekarang buka tab Tracing untuk menguji alur dengan nilai berbeda.</p></div>`;
    const a=lab.feedback.issues;
    return `<div class="lab-feedback needs-work" role="status"><strong>${ICON('alert')} Ada ${a.length} hal yang perlu diperbaiki</strong><ul>${a.map(x=>`<li>${ESC(x.message)}</li>`).join('')}</ul></div>`;
  }
  function renderLab(lab,tab,zoom=false){
    const s=E.SCENARIOS[lab.scenario];
    const canTrace=lab.checked&&E.validate(lab).ok;
    const trace=lab.trace;
    const stepRows=lab.order.map((role,i)=>`<li class="step-editor-row" data-step-row="${role}">
       <span class="editor-position">${i+1}</span><div class="editor-step-main"><strong>${ESC(s.labels[role])}</strong><label class="field-caption" for="shape-${role}">Simbol</label><select id="shape-${role}" data-lab-shape="${role}" aria-label="Simbol untuk ${ESC(s.labels[role])}">${opts(TYPE_OPTIONS,lab.types[role])}</select></div>
       <div class="move-controls"><button type="button" data-lab-move="${role}" data-dir="up" aria-label="Naikkan langkah ${ESC(s.labels[role])}" ${i===0?'disabled':''}>↑</button><button type="button" data-lab-move="${role}" data-dir="down" aria-label="Turunkan langkah ${ESC(s.labels[role])}" ${i===lab.order.length-1?'disabled':''}>↓</button></div>
       </li>`).join('');
    const branches=`<div class="branch-editor"><label for="branch-yes">Jika kondisi benar (Ya)</label><select id="branch-yes" data-lab-branch="yes">${opts([{value:'yes',label:s.yes},{value:'no',label:s.no}],lab.branches.yes)}</select><label for="branch-no">Jika kondisi salah (Tidak)</label><select id="branch-no" data-lab-branch="no">${opts([{value:'yes',label:s.yes},{value:'no',label:s.no}],lab.branches.no)}</select><p class="tiny muted">Kedua jalur menuju simbol Selesai setelah menampilkan keluaran masing-masing.</p></div>`;
    const inputs=s.fields.map(f=>`<label class="trace-field" for="trace-${f.key}"><span>${ESC(f.label)}</span><input type="number" inputmode="numeric" id="trace-${f.key}" data-trace-field="${f.key}" value="${lab.draft?.[f.key]??trace?.values?.[f.key]??f.defaultValue}" min="${f.min}" max="${f.max}" step="1"></label>`).join('');
    const examples=s.examples.map((o,i)=>`<button class="btn btn-outline btn-sm" type="button" data-trace-example="${i}">${ESC(o.label)}</button>`).join('');
    const traceBody=`<div class="trace-form"><div class="trace-inputs">${inputs}</div><div class="btn-group trace-examples">${examples}</div><div class="trace-actions"><button class="btn btn-primary" type="button" data-action="trace-start" ${canTrace?'':'disabled'}>${ICON('play')} Mulai tracing</button><button class="btn btn-outline" type="button" data-action="trace-prev" ${trace?.index>0?'':'disabled'}>← Sebelumnya</button><button class="btn btn-outline" type="button" data-action="trace-next" ${trace&&trace.index<trace.data.events.length-1?'':'disabled'}>Berikutnya →</button></div><div class="trace-state" role="status">${trace?`<span class="small-label">LANGKAH ${trace.index+1} DARI ${trace.data.events.length}</span><strong>${ESC(trace.data.events[trace.index].title)}</strong><p>${ESC(trace.data.events[trace.index].explanation)}</p><div class="trace-dots">${trace.data.events.map((ev,i)=>`<span class="${i===trace.index?'active':i<trace.index?'visited':''}" title="Langkah ${i+1}: ${ESC(ev.title)}"></span>`).join('')}</div>`:`<strong>${canTrace?'Siap diuji':'Selesaikan pemeriksaan diagram terlebih dahulu'}</strong><p>${canTrace?'Masukkan contoh nilai atau gunakan tombol contoh, kemudian jalankan tracing.':'Tracing akan aktif setelah urutan, simbol, dan kedua keluaran benar.'}</p>`}</div></div>`;
    const tabInner=tab===1?branches:tab===2?traceBody:`<div class="lab-guide-steps"><div class="mini-check">${ICON('route')} Atur urutan langkah di panel kiri</div><div class="mini-check">${ICON('blocks')} Periksa simbol pada setiap langkah</div><div class="mini-check">${ICON('check-circle')} Periksa seluruh diagram</div></div>`;
    return `<div class="lab-overview"><label for="lab-scenario" class="small-label">PILIH KASUS LATIHAN</label><select id="lab-scenario" data-lab-scenario>${opts(Object.values(E.SCENARIOS).map(o=>({value:o.key,label:o.name})),lab.scenario)}</select><p>${ESC(s.context)}</p></div>
      <div class="lab-grid lab-interactive"><aside class="card lab-editor"><div class="lab-panel-header"><span class="small-label">LANGKAH 1</span><h2>Susun langkah utama</h2><p>Pindahkan langkah agar urut, kemudian tentukan jenis simbol yang tepat.</p></div><ol class="step-editor">${stepRows}</ol><div class="lab-small-note">${ICON('info')} Jalur Ya dan Tidak dapat diatur pada tab Cabang.</div><button class="btn btn-outline" type="button" data-action="lab-reset" style="width:100%;margin-top:14px">${ICON('rotate')} Atur ulang latihan</button></aside>
      <section class="card lab-canvas-panel ${zoom?'zoomed':''}" aria-label="Diagram hasil susunan"><div class="lab-panel-header"><span class="small-label">PRATINJAU LANGSUNG</span><h2>Diagram yang kamu susun</h2><p>Perubahan urutan, simbol, dan cabang langsung terlihat.</p><button type="button" class="btn btn-outline btn-sm lab-zoom" data-action="lab-zoom" aria-pressed="${zoom}">${ICON('search')} ${zoom?'Kembali ke ukuran normal':'Perbesar diagram'}</button></div><div class="interactive-canvas">${diagram(lab)}</div>${zoom?'<p class="diagram-scroll-note">Geser diagram ke kanan atau kiri untuk melihat keseluruhan alur.</p>':''}<div class="diagram-legend"><span><i class="legend-square blue"></i>Mulai / Selesai</span><span><i class="legend-square teal"></i>Masukan / Keluaran</span><span><i class="legend-square amber"></i>Keputusan</span></div></section>
      <aside class="card lab-tool-panel"><div class="lab-panel-header"><span class="small-label">LANGKAH 2</span><h2>Atur, periksa, dan uji</h2></div><div class="lab-tabs stage2-tabs" role="group" aria-label="Tahap latihan">${['Susun','Cabang','Tracing'].map((x,i)=>`<button type="button" data-lab-tab="${i}" class="${tab===i?'active':''}" aria-pressed="${tab===i}">${i+1}. ${x}</button>`).join('')}</div>${guide(tab,s)}${tabInner}${tab!==2?`<div class="lab-control-buttons"><button class="btn btn-primary" type="button" data-action="lab-check">${ICON('check-circle')} Periksa diagram</button><button class="btn btn-light" type="button" data-action="lab-hint">${ICON('lightbulb')} Petunjuk ${lab.hintLevel?lab.hintLevel+'/3':''}</button></div>`:''}${lab.hintLevel&&tab!==2?`<div class="lab-hint"><strong>${ICON('lightbulb')} Petunjuk ${lab.hintLevel}</strong><p>${ESC(labHints[lab.hintLevel-1])}</p></div>`:''}${tab!==2?feedbackView(lab):''}${tab===2?`<button class="btn btn-outline" type="button" data-lab-tab="1" style="width:100%;margin-top:10px">← Kembali ke percabangan</button>`:''}</aside></div>
      <div class="lab-after"><span>${ICON('info')} Kegiatan ini merupakan latihan terpandu. ALURIN belum menyediakan editor flowchart bebas.</span><a href="/detektif" class="btn btn-outline">Coba Detektif Logika ${ICON('arrow-right')}</a></div>`;
  }
  function renderDetective(index,selection,feedback,completed,hintShown){
    const case_=E.DETECTIVE[index];
    return `<div class="detective-tools"><div class="detective-question"><span class="small-label">BUKTI KESALAHAN PADA DIAGRAM</span><h3>${ESC(case_.question)}</h3><fieldset class="detective-options"><legend class="sr-only">Pilih perbaikan untuk kasus ${index+1}</legend>${case_.choices.map(x=>`<label class="detective-option"><input type="radio" name="detective-answer" value="${ESC(x.id)}" ${selection===x.id?'checked':''}><span>${ESC(x.label)}</span></label>`).join('')}</fieldset><div class="btn-group"><button class="btn btn-primary" data-action="detective-check" type="button">${ICON('check')} Periksa perbaikan</button><button class="btn btn-outline" type="button" data-action="detective-hint">${ICON('lightbulb')} ${hintShown?'Sembunyikan':'Lihat'} petunjuk</button></div>${hintShown?`<div class="lab-hint"><strong>Petunjuk</strong><p>${ESC(case_.hint)}</p></div>`:''}${feedback?`<div class="lab-feedback ${feedback.ok?'good':'needs-work'}" role="status"><strong>${feedback.ok?'Perbaikan tepat!':'Belum tepat, coba lagi.'}</strong><p>${ESC(feedback.message)}</p></div>`:''}</div><div class="detective-mini-summary"><span class="small-label">PROGRES DETEKTIF LOGIKA</span><div class="detective-badges">${E.DETECTIVE.map((c,i)=>`<span class="badge badge-${completed.includes(c.id)?'teal':'neutral'}">Kasus ${i+1} ${completed.includes(c.id)?'✓':'·'}</span>`).join('')}</div><p class="tiny muted">Setiap kasus memeriksa satu jenis kesalahan. Pilih perbaikan dan periksa hasilnya.</p></div></div>`;
  }
  function results(progress){
    const solved=progress.lab||[],detective=progress.detective||[];
    const rows=[...Object.values(E.SCENARIOS).map(x=>({title:x.name,ok:solved.includes(x.key),tag:'Lab'})),...E.DETECTIVE.map((x)=>({title:x.title,ok:detective.includes(x.id),tag:'Detektif'}))];
    const finished=rows.filter(x=>x.ok).length;
    return `<div class="results-grid"><section class="card card-pad"><div class="result-top"><div><span class="small-label">HASIL LATIHAN FLOWCHART</span><h2>${finished===0?'Belum ada latihan yang diselesaikan':finished===rows.length?'Semua latihan tersedia selesai':'Teruskan latihanmu'}</h2><p>${finished===0?'Mulai dari Laboratorium atau Detektif Logika.':'Yang ditampilkan adalah aktivitas yang benar-benar berhasil diperiksa dalam peramban ini.'}</p></div><div class="result-donut" style="--pct:${(finished/rows.length*100).toFixed(1)}%" aria-label="${finished} dari ${rows.length} aktivitas selesai"><strong>${finished}/${rows.length}</strong><span>aktivitas</span></div></div><div class="divider"></div><h3 class="card-title">Rincian latihan</h3><div class="results-activities">${rows.map(x=>`<div class="result-activity"><span class="result-activity-icon ${x.ok?'done':''}">${ICON(x.ok?'check-circle':'clock')}</span><div><strong>${ESC(x.title)}</strong><small>${x.tag==='Lab'?'Laboratorium Flowchart':'Detektif Logika'}</small></div><span class="badge badge-${x.ok?'teal':'neutral'}">${x.ok?'Selesai':'Belum selesai'}</span></div>`).join('')}</div><div class="btn-group" style="margin-top:20px;"><a class="btn btn-primary" href="/laboratorium">Buka laboratorium ${ICON('arrow-right')}</a><a class="btn btn-outline" href="/detektif">Detektif Logika ${ICON('bug')}</a></div></section><aside class="result-side">${ICON('target')}<h3>Makna progres ini</h3><p>Hasil menunjukkan kasus yang berhasil diperiksa pada latihan terpandu. Ini belum merupakan nilai pengetahuan, kemampuan umum, atau bukti peningkatan hasil belajar murid.</p><div class="divider"></div><h3>Saran kegiatan berikutnya</h3><p>${solved.length<Object.keys(E.SCENARIOS).length?'Pilih kasus Laboratorium yang belum selesai dan uji dua contoh masukan, termasuk nilai batas.':detective.length<E.DETECTIVE.length?'Lanjutkan ke kasus Detektif Logika yang belum selesai dan jelaskan alasan perbaikannya.':'Coba ulang kasus dengan masukan berbeda untuk memperkuat pemahaman.'}</p><div class="divider"></div><h3>Asesmen adaptif</h3><p>Rekomendasi berdasarkan 12 soal dan kesalahan latihan sudah aktif. Lihat peta kebutuhan di atas.</p></aside></div>`;
  }
  root.ALURIN_STAGE2_VIEWS=Object.freeze({renderLab,renderDetective,results});
})(globalThis);
