import {formatTime,displayTime} from './clock.mjs';
import {translate} from './translations.mjs';

/** @param {unknown} value */
export const escapeMarkup=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c));
/** @param {import('./clock.mjs').Clock} clock @param {import('./translations.mjs').Locale} locale @param {Date} [date] */
export function createReport(clock,locale,date=new Date()){
 const t=/** @param {string} s */s=>translate(s,locale);
 const roles=(clock.config.kind==='simul'?['Gösterici','Rakip']:['Beyaz','Siyah']).map(t);
 const history=clock.history || [];
 const summaries=roles.map((name,player)=>{const rows=history.filter(r=>r.player===player);const total=rows.reduce((n,r)=>n+r.spentMs,0);return {name,moves:clock.moves[player],total:(total/1000).toFixed(1),average:(rows.length?total/rows.length/1000:0).toFixed(1),longest:(rows.reduce((n,r)=>Math.max(n,r.spentMs),0)/1000).toFixed(1),left:formatTime(displayTime(clock,/** @type {import('./clock.mjs').Player} */(player)))};});
 const rows=history.map(r=>({player:roles[r.player],move:r.move,spent:(r.spentMs/1000).toFixed(1),left:formatTime(r.leftMs),stage:r.stage}));
 const title=t('Hamle defteri');
 const status=clock.flagged!==null?`${roles[clock.flagged]} · ${t('Süre doldu')}`:t(clock.status==='paused'?'DURAKLATILDI':clock.status==='running'?'Saat çalışıyor':'BAŞLAMAYA HAZIR');
 return {locale,title,label:t(clock.config.label),date:date.toLocaleString(locale==='tr'?'tr-TR':'en-GB'),status,summaries,rows,labels:{player:t('Oyuncu / hamle'),spent:t('Düşünme'),left:t('Kalan'),stage:t('Aşama'),total:t('Toplam'),average:t('Ortalama'),longest:t('En uzun'),seconds:t('saniye'),moves:t('Hamle'),all:t('Kaydedilen bütün basmalar'),image:t('Paylaşım özeti · son 20 basma'),privacy:t('Bu rapor cihazında oluşturuldu.')}};
}
/** @typedef {ReturnType<typeof createReport>} Report */
/** @param {Report} report */
export function reportHtml(report){
 const e=escapeMarkup,l=report.labels;
 const summaries=report.summaries.map(s=>`<section><h2>${e(s.name)}</h2><b>${e(s.left)}</b><p>${s.moves} ${e(l.moves)} · ${e(l.total)} ${s.total} ${e(l.seconds)}<br>${e(l.average)} ${s.average} · ${e(l.longest)} ${s.longest} ${e(l.seconds)}</p></section>`).join('');
 const rows=report.rows.map(r=>`<tr><td>${e(r.player)} · ${r.move}</td><td>${r.spent} ${e(l.seconds)}</td><td>${e(r.left)}</td><td>${r.stage}</td></tr>`).join('');
 return `<!doctype html><html lang="${report.locale}"><head><meta charset="utf-8"><title>Tempo - ${e(report.title)}</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#18262c;margin:0}header{border-bottom:3px solid #67ad30;padding-bottom:18px;margin-bottom:20px}.brand{font-size:36px;font-weight:800;letter-spacing:-1px}h1{font-size:24px;margin:10px 0}header p{line-height:1.5;margin:5px 0;color:#54616a}.summary{display:flex;gap:16px;margin:20px 0}.summary section{flex:1;padding:16px;border:1px solid #cad5d9;border-radius:8px;break-inside:avoid}h2{font-size:16px;margin:0 0 10px}.summary b{font-size:28px}.summary p{line-height:1.6;margin-bottom:0}table{width:100%;border-collapse:collapse}thead{display:table-header-group}th{text-align:left;font-size:11px;background:#e9eff1}td,th{padding:9px 7px;border-bottom:1px solid #d8e0e3}tr{break-inside:avoid}td:nth-child(n+2){font-variant-numeric:tabular-nums}footer{margin-top:20px;font-size:10px;color:#64717a}</style></head><body><header><div class="brand">tempo<span style="color:#67ad30">.</span></div><h1>${e(report.title)}</h1><p>${e(report.label)}</p><p>${e(report.date)} · ${e(report.status)}</p></header><div class="summary">${summaries}</div><h2>${e(l.all)} · ${report.rows.length}</h2><table><thead><tr><th>${e(l.player)}</th><th>${e(l.spent)}</th><th>${e(l.left)}</th><th>${e(l.stage)}</th></tr></thead><tbody>${rows}</tbody></table><footer>${e(l.privacy)} · Tempo</footer></body></html>`;
}
/** @param {Report} report */
export function reportSvg(report){
 const e=escapeMarkup,l=report.labels,rows=report.rows.slice(-20),height=580+rows.length*48;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}"><rect width="1080" height="${height}" fill="#11171d"/><g font-family="Arial,sans-serif" fill="#f8fafc"><text x="56" y="94" font-size="64" font-weight="800">tempo<tspan fill="#84e347">.</tspan></text><text x="56" y="150" font-size="32">${e(report.title)}</text><text x="56" y="194" font-size="24" fill="#b7c5cf">${e(report.label)}</text><text x="56" y="232" font-size="20" fill="#94a3b8">${e(report.date)} · ${e(report.status)}</text>`;
 report.summaries.forEach((s,i)=>{const x=56+i*496;svg+=`<rect x="${x}" y="266" width="472" height="166" rx="16" fill="#1c2931"/><text x="${x+24}" y="305" font-size="24" fill="${i?'#38bdf8':'#84e347'}">${e(s.name)} · ${s.moves} ${e(l.moves)}</text><text x="${x+24}" y="362" font-size="42">${e(s.left)}</text><text x="${x+24}" y="404" font-size="20" fill="#b7c5cf">${e(l.total)} ${s.total} ${e(l.seconds)} · ${e(l.average)} ${s.average}</text>`;});
 svg+=`<text x="56" y="477" font-size="21" fill="#94a3b8">${e(l.image)} / ${report.rows.length}</text><text x="56" y="514" font-size="19">${e(l.player)}</text><text x="600" y="514" font-size="19">${e(l.spent)}</text><text x="890" y="514" font-size="19">${e(l.left)}</text>`;
 rows.forEach((r,i)=>{const y=554+i*48;svg+=`<path d="M56 ${y+15}H1024" stroke="#30414a"/><text x="56" y="${y}" font-size="22">${e(r.player)} · ${r.move}</text><text x="600" y="${y}" font-size="22" fill="#38bdf8">${r.spent} ${e(l.seconds)}</text><text x="890" y="${y}" font-size="22">${e(r.left)}</text>`;});
 return svg+'</g></svg>';
}
