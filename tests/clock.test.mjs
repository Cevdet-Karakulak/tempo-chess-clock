import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createClock,tap,advance,pause,resume,adjust,restore,formatTime,validConfig,stageIndex,currentBonus,nextStage,allocatedTime,undo,formatPrecise,TOURNAMENT_PRESETS} from '../src/clock.mjs';
const config = (overrides={}) => ({kind:'standard',label:'Test',baseMs:[60000,60000],bonusMs:[2000,2000],mode:'fischer',...overrides});
test('second player starts first player; no increment or move is granted at startup',()=>{
  const s=tap(createClock(config()),1,500);
  assert.equal(s.active,0); assert.equal(s.status,'running');
  assert.deepEqual(s.left,[60000,60000]);assert.deepEqual(s.moves,[0,0]);
});
test('40th move adds the new period independently to each player and carries unused time',()=>{
  const conf=config({kind:'tournament',mode:'none',bonusMs:[0,0],baseMs:[5400000,5400000],stages:[{afterMoves:40,addMs:[1800000,1800000],bonusMs:[0,0]}]});
  let s=tap(createClock(conf),1,0);
  for(let move=1;move<=39;move++){s=tap(s,0,move*2-1);s=tap(s,1,move*2);}
  assert.deepEqual(s.moves,[39,39]);assert.deepEqual([stageIndex(s,0),stageIndex(s,1)],[0,0]);
  s=tap(s,0,79);assert.equal(s.left[0],7200000-40);assert.equal(s.left[1],5400000-39);
  assert.deepEqual([stageIndex(s,0),stageIndex(s,1)],[1,0]);assert.equal(nextStage(s,0),undefined);assert.equal(nextStage(s,1).afterMoves,40);
  s=tap(s,1,80);assert.equal(s.left[1],7200000-40);assert.equal(allocatedTime(s,0),7200000);
});
test('period time is not granted merely because minutes pass',()=>{
  const s=advance(tap(createClock(config({stages:[{afterMoves:40,addMs:[1800000,1800000],bonusMs:[0,0]}]})),1,0),60000);
  assert.equal(s.status,'finished');assert.deepEqual(s.moves,[0,0]);assert.equal(s.left[0],0);
});
test('expired clock cannot be rescued by pressing the threshold move too late',()=>{
  const started=tap(createClock(config({stages:[{afterMoves:40,addMs:[1800000,1800000],bonusMs:[0,0]}]})),1,0);
  const s=tap({...started,moves:[39,39]},0,60000);
  assert.equal(s.status,'finished');assert.equal(stageIndex(s,0),0);assert.equal(s.left[0],0);assert.equal(s.moves[0],39);
});
test('stage bonus starts after threshold and does not replace previous-stage final increment',()=>{
  let s=tap(createClock(config({bonusMs:[1000,1000],stages:[{afterMoves:2,addMs:[60000,60000],bonusMs:[5000,5000]}]})),1,0);
  s=tap(s,0,1000);s=tap(s,1,2000);s=tap(s,0,3000);
  assert.equal(s.left[0],120000);assert.equal(currentBonus(s,0),5000);assert.equal(currentBonus(s,1),1000);
  s=tap(s,1,4000);s=tap(s,0,5000);assert.equal(s.left[0],124000);
});
test('three stages trigger at cumulative thresholds, exactly once across a saved match',()=>{
  const conf=config({mode:'none',bonusMs:[0,0],stages:[{afterMoves:2,addMs:[60000,60000],bonusMs:[0,0]},{afterMoves:3,addMs:[30000,30000],bonusMs:[0,0]}]});
  let s=tap(createClock(conf),1,0);
  for(let i=0;i<2;i++){s=tap(s,0,0);s=tap(s,1,0);}
  s=resume(restore(JSON.parse(JSON.stringify(s)),0),0);
  s=tap(s,0,0);assert.equal(s.left[0],150000);assert.equal(s.left[1],120000);
  s=tap(s,1,0);s=tap(s,0,0);assert.equal(s.left[0],150000);assert.equal(stageIndex(s,0),2);
});
test('new-period delay is used on the next turn of that player',()=>{
  let s=tap(createClock(config({mode:'delay',bonusMs:[1000,1000],stages:[{afterMoves:1,addMs:[60000,60000],bonusMs:[5000,5000]}]})),1,0);
  s=tap(s,0,0);assert.equal(s.delayLeft,1000);s=tap(s,1,0);assert.equal(s.delayLeft,5000);
  s=advance(s,4000);assert.equal(s.left[0],120000);assert.equal(s.delayLeft,1000);
});
test('invalid, unordered or fractional stage definitions are rejected',()=>{
  assert.equal(validConfig(config({stages:[{afterMoves:0,addMs:[60000,60000],bonusMs:[0,0]}]})),false);
  assert.equal(validConfig(config({stages:[{afterMoves:40.5,addMs:[60000,60000],bonusMs:[0,0]}]})),false);
  const stage={afterMoves:40,addMs:[60000,60000],bonusMs:[0,0]};
  assert.equal(validConfig(config({stages:[stage,stage]})),false);
  assert.equal(validConfig(config({stages:[{...stage,addMs:[-1,1000]}]})),false);
});
test('clock owns a deep copy of stage settings',()=>{
  const conf=config({stages:[{afterMoves:40,addMs:[60000,60000],bonusMs:[0,0]}]});
  const s=createClock(conf);conf.stages[0].addMs[0]=1;
  assert.equal(s.config.stages[0].addMs[0],60000);
});
test('elapsed time is correct even if interval callbacks are delayed',()=>{
  const s=advance(tap(createClock(config()),1,100),20100);
  assert.deepEqual(s.left,[40000,60000]);
});
test('completed move adds Fischer increment to the correct player and switches',()=>{
  const s=tap(tap(createClock(config()),1,100),0,5100);
  assert.deepEqual(s.left,[57000,60000]);assert.deepEqual(s.moves,[1,0]);assert.equal(s.active,1);
});
test('pressing inactive player does not switch or grant time',()=>{
  const s=tap(tap(createClock(config()),1,100),1,1100);
  assert.equal(s.active,0);assert.deepEqual(s.moves,[0,0]);assert.deepEqual(s.left,[59000,60000]);
});
test('zero is terminal; late press cannot gain increment or switch',()=>{
  const s=tap(tap(createClock(config()),1,100),0,60100);
  assert.equal(s.status,'finished');assert.equal(s.flagged,0);assert.equal(s.left[0],0);
  assert.deepEqual(s.moves,[0,0]);assert.deepEqual(tap(s,0,70000),s);
});
test('pause includes elapsed time, resume ignores time spent paused',()=>{
  const s=pause(tap(createClock(config()),1,100),5100);
  assert.equal(s.status,'paused');assert.equal(s.left[0],55000);
  const r=advance(resume(s,100000),101000);
  assert.equal(r.left[0],54000);
});
test('delay survives partial updates and a pause, renews once on a new turn',()=>{
  const conf=config({mode:'delay',bonusMs:[5000,3000]});
  let s=advance(tap(createClock(conf),1,0),2000);
  assert.equal(s.delayLeft,3000);assert.equal(s.left[0],60000);
  s=pause(s,3000);s=resume(s,10000);s=advance(s,14000);
  assert.equal(s.left[0],58000);assert.equal(s.delayLeft,0);
  s=tap(s,0,14000);assert.equal(s.active,1);assert.equal(s.delayLeft,3000);
});
test('simultaneous configuration has independent base time and independent increment',()=>{
  const conf=config({kind:'simul',baseMs:[3600000,1200000],bonusMs:[5000,2000]});
  let s=tap(createClock(conf),1,0);s=tap(s,0,10000);s=tap(s,1,30000);
  assert.deepEqual(s.left,[3595000,1182000]);assert.deepEqual(s.moves,[1,1]);
});
test('simultaneous delay uses each player own delay',()=>{
  let s=tap(createClock(config({kind:'simul',mode:'delay',bonusMs:[10000,3000]})),1,0);
  s=tap(s,0,11000);assert.equal(s.left[0],59000);assert.equal(s.delayLeft,3000);
  s=advance(s,15000);assert.equal(s.left[1],59000);
});
test('adjustments are allowed only when paused and never produce a negative clock',()=>{
  const started=tap(createClock(config()),1,0);
  assert.deepEqual(adjust(started,0,-60000),started);
  assert.equal(adjust(pause(started,100),0,-60000).left[0],1000);
});
test('restoring a running match pauses it and resets the monotonic anchor',()=>{
  const started=tap(createClock(config()),1,90000);
  const restored=restore(JSON.parse(JSON.stringify(started)),5);
  assert.equal(restored.status,'paused');assert.equal(restored.anchor,5);
  assert.equal(restored.left[0],60000);
});
test('rejects corrupt storage and invalid time inputs',()=>{
  assert.equal(restore({status:'running'},0),null);
  assert.equal(validConfig(config({baseMs:[NaN,0]})),false);
  assert.equal(validConfig(config({bonusMs:[-1,0]})),false);
  assert.throws(()=>createClock(config({baseMs:[0,60000]})));
  assert.equal(restore({...createClock(config()),status:'paused',active:0,left:[0,60000]},0),null);
});
test('monotonic clock never refunds time when timestamp goes backwards',()=>{
  const s=tap(createClock(config()),1,1000);
  const a=advance(s,500);const b=advance(a,2000);
  assert.equal(b.left[0],59000);
});
test('display rounds remaining time up and handles hour boundary',()=>{
  assert.equal(formatTime(59001),'01:00');assert.equal(formatTime(1),'00:01');
  assert.equal(formatTime(0),'00:00');assert.equal(formatTime(3600000),'1:00:00');
});
test('international Fischer preset credits the first increment before move one',()=>{
  const s=createClock(TOURNAMENT_PRESETS[0]);
  assert.deepEqual(s.left,[5430000,5430000]);
  const started=tap(s,1,0);assert.deepEqual(started.left,s.left);
});
test('41st move increment is prepared at the 40th-move transition, independently',()=>{
  let s=tap(createClock(TOURNAMENT_PRESETS[1]),1,0);
  assert.deepEqual(s.left,[7200000,7200000]);
  for(let i=0;i<39;i++){s=tap(s,0,0);s=tap(s,1,0);}
  s=tap(s,0,0);assert.equal(s.left[0],9030000);assert.equal(s.left[1],7200000);
  s=tap(s,1,0);assert.equal(s.left[1],9030000);
});
test('custom three-period control starts the first increment at move 61',()=>{
  const threePeriod={...TOURNAMENT_PRESETS[1],stages:[{afterMoves:40,addMs:[3600000,3600000],bonusMs:[0,0]},{afterMoves:60,addMs:[900000,900000],bonusMs:[30000,30000]}]};
  let s=tap(createClock(threePeriod),1,0);
  for(let i=0;i<40;i++){s=tap(s,0,0);s=tap(s,1,0);}
  assert.deepEqual(s.left,[10800000,10800000]);
  for(let i=40;i<60;i++){s=tap(s,0,0);s=tap(s,1,0);}
  assert.deepEqual(s.left,[11730000,11730000]);
});
test('undo removes mistaken increment and period bonus, preserves time spent and pauses',()=>{
  let s=tap(createClock(config({stages:[{afterMoves:1,addMs:[60000,60000],bonusMs:[5000,5000]}]})),1,0);
  s=tap(s,0,5000);assert.equal(s.moves[0],1);assert.equal(s.history.length,1);
  s=advance(s,8000);s=undo(s,8000);
  assert.equal(s.status,'paused');assert.equal(s.active,0);assert.deepEqual(s.left,[55000,60000]);assert.deepEqual(s.moves,[0,0]);assert.equal(s.history.length,0);assert.equal(s.turnElapsed,5000);
  s=tap(resume(s,9000),0,10000);assert.equal(s.history[0].spentMs,6000);assert.equal(s.left[0],116000);
});
test('history records thinking time across pause without counting the pause',()=>{
  let s=tap(createClock(config()),1,0);s=pause(s,2000);s=resume(s,10000);s=tap(s,0,11000);
  assert.equal(s.history[0].spentMs,3000);assert.equal(s.history[0].move,1);
  assert.equal(s.history[0].leftMs,59000);assert.equal(s.history[0].stage,1);
  assert.equal(undo({...s,status:'finished'},12000).status,'finished');
});
test('tenths never display zero before actual expiration',()=>{
  assert.equal(formatPrecise(1),'00:00.1');assert.equal(formatPrecise(9800),'00:09.8');assert.equal(formatPrecise(0),'00:00.0');
});

test('rapid and blitz tournament controls retain increments without period bonuses',()=>{
  for(const [index,base,bonus] of [[2,900000,10000],[3,180000,2000]]){
    let s=tap(createClock(TOURNAMENT_PRESETS[index]),1,0);
    assert.deepEqual(s.left,[base+bonus,base+bonus]);
    s=tap(s,0,1000);assert.equal(s.left[0],base+bonus*2-1000);assert.equal(nextStage(s,0),undefined);
  }
});
