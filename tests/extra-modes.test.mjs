import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createClock,tap,advance,pause,resume,restore,undo,displayTime,validConfig,EXTRA_PRESETS} from '../src/clock.mjs';
import {createReport} from '../src/report.mjs';
import {readFavorites} from '../src/favorites.mjs';
import {EN,translate} from '../src/translations.mjs';
const cfg=(mode,extra={})=>({mode,kind:'standard',label:'Extra',baseMs:[60000,60000],bonusMs:[0,0],...extra});
const go=(mode,extra={})=>cfg(mode,{baseMs:[1000,2000],overtime:{periodMs:[3000,4000],periods:3,moves:2},...extra});
test('Bronstein refunds only time actually used, never accumulates unused delay',()=>{
 let s=tap(createClock(cfg('bronstein',{bonusMs:[5000,3000]})),1,0);assert.deepEqual(s.left,[65000,63000]);
 s=tap(s,0,2000);assert.equal(s.left[0],65000);s=tap(s,1,3000);assert.equal(s.left[1],63000);
 s=tap(s,0,11000);assert.equal(s.left[0],62000);assert.equal(s.history[2].spentMs,8000);
});
test('Bronstein includes its free time in the deadline and remains terminal after expiry',()=>{
 let s=tap(createClock(cfg('bronstein',{baseMs:[1000,1000],bonusMs:[5000,5000]})),1,0);
 assert.equal(advance(s,5999).status,'running');s=tap(s,0,6000);assert.equal(s.flagged,0);assert.deepEqual(s.moves,[0,0]);
});
test('Bronstein pause and undo preserve elapsed refund budget',()=>{
 let s=tap(createClock(cfg('bronstein',{bonusMs:[5000,5000]})),1,0);s=pause(s,3000);s=resume(s,10000);s=tap(s,0,14000);
 assert.equal(s.left[0],63000);s=undo(s,14000);assert.equal(s.turnElapsed,7000);s=tap(resume(s,20000),0,21000);assert.equal(s.left[0],62000);
});
test('hourglass transfers only elapsed available time and conserves the total at expiry',()=>{
 let s=tap(createClock(cfg('hourglass',{baseMs:[2000,5000]})),1,0);s=advance(s,1000);assert.deepEqual(s.left,[1000,6000]);
 s=advance(s,20000);assert.deepEqual(s.left,[0,7000]);assert.equal(s.flagged,0);
});
test('hourglass switching, pause and undo restore both clocks',()=>{
 let s=tap(createClock(cfg('hourglass')),1,0);s=tap(s,0,5000);assert.deepEqual(s.left,[55000,65000]);
 s=pause(s,6000);s=resume(s,100000);s=advance(s,101000);assert.deepEqual(s.left,[57000,63000]);s=undo(s,101000);assert.deepEqual(s.left,[55000,65000]);
});
test('byo-yomi crosses main-time zero independently without falling a flag',()=>{
 let s=advance(tap(createClock(go('byoyomi')),1,0),1000);assert.deepEqual(s.overtime.active,[true,false]);assert.equal(displayTime(s,0),3000);assert.equal(s.status,'running');
 s=advance(s,2000);assert.equal(displayTime(s,0),2000);s=tap(s,0,2000);assert.equal(displayTime(s,0),3000);assert.equal(displayTime(s,1),2000);
});
test('byo-yomi burns multiple periods in one delayed update and only resets the current period',()=>{
 let s=advance(tap(createClock(go('byoyomi')),1,0),7500);assert.equal(s.overtime.periodsLeft[0],1);assert.equal(displayTime(s,0),2500);
 s=tap(s,0,7500);assert.equal(displayTime(s,0),3000);assert.equal(s.overtime.periodsLeft[0],1);
});
test('byo-yomi exact final-period boundary is terminal and cannot be rescued by a late tap',()=>{
 const s=tap(tap(createClock(go('byoyomi')),1,0),0,10000);assert.equal(s.status,'finished');assert.equal(s.flagged,0);assert.equal(displayTime(s,0),0);assert.equal(s.moves[0],0);
 assert.equal(restore(JSON.parse(JSON.stringify(s)),0).status,'finished');
});
test('byo-yomi zero main time, pause and restore retain period budget',()=>{
 let s=tap(createClock(go('byoyomi',{baseMs:[0,0]})),1,0);s=pause(s,3500);assert.equal(s.overtime.periodsLeft[0],2);assert.equal(displayTime(s,0),2500);
 s=restore(JSON.parse(JSON.stringify(s)),1);s=advance(resume(s,10000),11000);assert.equal(displayTime(s,0),1500);assert.equal(s.overtime.periodsLeft[0],2);
});
test('byo-yomi undo restores overtime counters without refunding earlier thinking',()=>{
 let s=tap(tap(createClock(go('byoyomi',{baseMs:[0,0]})),1,0),0,3500);assert.equal(displayTime(s,0),3000);
 s=undo(s,3500);assert.equal(displayTime(s,0),2500);assert.equal(s.overtime.periodsLeft[0],2);assert.equal(s.status,'paused');
 assert.equal(restore(JSON.parse(JSON.stringify(s)),0).status,'paused');
});
test('Canadian counts each player’s own overtime moves and reloads complete blocks without carrying time',()=>{
 let s=tap(createClock(go('canadian',{baseMs:[0,0]})),1,0);s=tap(s,0,1000);assert.equal(displayTime(s,0),2000);assert.equal(s.overtime.movesLeft[0],1);
 s=tap(s,1,1500);assert.equal(s.overtime.movesLeft[1],1);s=tap(s,0,2000);assert.equal(displayTime(s,0),3000);assert.equal(s.overtime.movesLeft[0],2);assert.equal(displayTime(s,1),3500);
});
test('Canadian counts the move that enters overtime, rejects late block completion, and supports undo',()=>{
 let s=tap(tap(createClock(go('canadian')),1,0),0,1500);assert.equal(s.overtime.movesLeft[0],1);assert.equal(displayTime(s,0),2500);
 const restored=undo(s,1500);assert.equal(restored.overtime.movesLeft[0],2);assert.equal(displayTime(restored,0),2500);
 s=tap(s,1,1500);s=tap(s,0,4000);assert.equal(s.status,'finished');assert.equal(s.moves[0],1);
});
test('overtime chunked and delayed advances produce the same deadline and counters',()=>{
 for(const mode of ['byoyomi','canadian']){const initial=tap(createClock(go(mode)),1,0);let stepped=initial;for(let t=100;t<=8000;t+=100)stepped=advance(stepped,t);const delayed=advance(initial,8000);assert.deepEqual(stepped.left,delayed.left);assert.deepEqual(stepped.overtime,delayed.overtime);assert.equal(stepped.flagged,delayed.flagged);}
});
test('new modes reject invalid options and damaged persisted overtime',()=>{
 assert.equal(validConfig(go('byoyomi',{overtime:{periodMs:[0,3000],periods:3,moves:2}})),false);
 for(const preset of EXTRA_PRESETS)assert.equal(validConfig(preset),true);
 assert.equal(validConfig(cfg('fischer',{overtime:{periodMs:[1000,1000],periods:1,moves:1}})),false);
 assert.equal(validConfig(cfg('hourglass',{bonusMs:[1000,1000]})),false);
 assert.equal(validConfig(cfg('none',{baseMs:[0,0]})),false);
 const s=createClock(go('byoyomi'));assert.equal(restore({...s,overtime:undefined},0),null);assert.equal(restore({...s,overtime:{...s.overtime,left:[NaN,3000]}},0),null);
 assert.equal(restore({...createClock(cfg('none')),overtime:{bad:true}},0),null);
});
test('favorites recover valid records independently, cap count, reject duplicates and own their data',()=>{
 const entry={id:'one',name:' Club ',config:cfg('hourglass')};const list=readFavorites([null,entry,{...entry},{id:'bad',name:'bad',config:{}}]);assert.equal(list.length,1);assert.equal(list[0].name,'Club');entry.config.baseMs[0]=1;assert.equal(list[0].config.baseMs[0],60000);
 assert.equal(readFavorites(Array.from({length:30},(_,i)=>({id:String(i),name:'n',config:cfg('none')}))).length,12);
});
test('English translates dynamic results, counters, instructions and leaves the Turkish language intact',()=>{
 const played=tap(tap(createClock(cfg('none')),1,0),0,1000);const report=createReport(played,'en');assert.equal(report.rows[0].player,'White');assert.equal(report.rows[0].move,1);
 const simul=tap(tap(createClock(cfg('none',{kind:'simul'})),1,0),0,1000);assert.equal(createReport(simul,'en').rows[0].player,'Exhibitor');
 assert.equal(translate('Saati Hazırla','en'),'Prepare Clock');assert.equal(translate('Farklı roller.\nFarklı süreler.','en'),'Different roles.\nDifferent times.');
 assert.equal(translate('Beyaz kaybetti','en'),'White lost');assert.equal(translate('Siyahın saati durduruldu.','en'),'Black’s clock stopped.');
 assert.equal(translate('Byo-yomi · 2 periyot','en'),'Byo-yomi · 2 periods');assert.equal(translate('Kanada · 25 hamle kaldı','en'),'Canadian · 25 moves left');
 assert.equal(translate('Beyaz · periyot saniye','en'),'White · period seconds');assert.equal(translate('Beyaz kaybetti','tr'),'Beyaz kaybetti');assert.ok(Object.keys(EN).length>120);
});
