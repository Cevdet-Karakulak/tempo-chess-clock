/** @typedef {'none'|'fischer'|'delay'|'bronstein'|'hourglass'|'byoyomi'|'canadian'} Mode */
/** @typedef {0|1} Player */
/** @typedef {{afterMoves:number,addMs:[number,number],bonusMs:[number,number]}} Stage */
/** @typedef {{periodMs:[number,number],periods:number,moves:number}} OvertimeConfig */
/** @typedef {{active:[boolean,boolean],left:[number,number],periodsLeft:[number,number],movesLeft:[number,number]}} Overtime */
/** @typedef {{baseMs:[number,number],bonusMs:[number,number],mode:Mode,label:string,kind:'standard'|'simul'|'tournament',stages?:Stage[],incrementTiming?:'before'|'after',overtime?:OvertimeConfig}} Config */
/** @typedef {{left:[number,number],moves:[number,number],active:Player|null,status:'idle'|'running'|'paused'|'finished',delayLeft:number,flagged:Player|null,turnElapsed:number,overtime?:Overtime}} Snapshot */
/** @typedef {{player:Player,move:number,spentMs:number,leftMs:number,stage:number,before:Snapshot}} MoveRecord */
/** @typedef {{config:Config,left:[number,number],moves:[number,number],active:Player|null,status:'idle'|'running'|'paused'|'finished',anchor:number,delayLeft:number,flagged:Player|null,turnElapsed?:number,history?:MoveRecord[],overtime?:Overtime}} Clock */

/** @param {unknown} value @returns {value is Config} */
export function validConfig(value) {
  if (!value || typeof value !== 'object') return false;
  const c = /** @type {Config} */ (value);
  return Array.isArray(c.baseMs) && c.baseMs.length === 2 &&
    c.baseMs.every(n => Number.isFinite(n) && n >= (['byoyomi','canadian'].includes(c.mode)?0:1000) && n <= 86400000) &&
    Array.isArray(c.bonusMs) && c.bonusMs.length === 2 && c.bonusMs.every(n => Number.isFinite(n) && n >= 0 && n <= 600000) && ['standard','simul','tournament'].includes(c.kind) &&
    (c.incrementTiming === undefined || ['before','after'].includes(c.incrementTiming)) &&
    (c.stages === undefined || (Array.isArray(c.stages) && c.stages.length <= 3 && c.stages.every((stage,i,all) =>
      stage && Number.isInteger(stage.afterMoves) && stage.afterMoves >= 1 && stage.afterMoves <= 999 &&
      (i === 0 || stage.afterMoves > all[i-1].afterMoves) && Array.isArray(stage.addMs) && stage.addMs.length === 2 &&
      stage.addMs.every(n=>Number.isFinite(n) && n >= 1000 && n <= 86400000) &&
      Array.isArray(stage.bonusMs) && stage.bonusMs.length === 2 && stage.bonusMs.every(n=>Number.isFinite(n) && n >= 0 && n <= 600000)))) &&
    (!['hourglass','byoyomi','canadian'].includes(c.mode) || (!c.stages?.length && c.bonusMs.every(n=>n===0))) &&
    (['byoyomi','canadian'].includes(c.mode) || c.overtime===undefined) &&
    (!['byoyomi','canadian'].includes(c.mode) || Boolean(c.overtime && Array.isArray(c.overtime.periodMs) && c.overtime.periodMs.length===2 && c.overtime.periodMs.every(n=>Number.isFinite(n)&&n>=1000&&n<=3600000) && Number.isInteger(c.overtime.periods)&&c.overtime.periods>=1&&c.overtime.periods<=99 && Number.isInteger(c.overtime.moves)&&c.overtime.moves>=1&&c.overtime.moves<=999)) &&
    ['none','fischer','delay','bronstein','hourglass','byoyomi','canadian'].includes(c.mode) && typeof c.label === 'string' && c.label.length <= 100;
}

/** @param {Config} config @param {number} [now] @returns {Clock} */
export function createClock(config, now = 0) {
  if (!validConfig(config)) throw new Error('Geçersiz süre ayarı');
  const cloned = JSON.parse(JSON.stringify(config));
  const left = /** @type {[number,number]} */ (config.baseMs.map((n,i)=>n+((config.mode==='fischer' && config.incrementTiming==='before' || config.mode==='bronstein') ? config.bonusMs[i]:0)));
  return {config:cloned,left,moves:[0,0],
    active:null,status:'idle',anchor:now,delayLeft:0,flagged:null,turnElapsed:0,history:[],...(config.overtime && ['byoyomi','canadian'].includes(config.mode)?{overtime:{active:/** @type {[boolean,boolean]} */ (config.baseMs.map(n=>n===0)),left:/** @type {[number,number]} */ ([...config.overtime.periodMs]),periodsLeft:/** @type {[number,number]} */ ([config.overtime.periods,config.overtime.periods]),movesLeft:/** @type {[number,number]} */ ([config.overtime.moves,config.overtime.moves])}}:{})};
}

/** @param {Clock} state @param {Player} player @returns {number} */
export function stageIndex(state,player) {
  return (state.config.stages ?? []).filter(s=>state.moves[player] >= s.afterMoves).length;
}
/** @param {Clock} state @param {Player} player @returns {number} */
export function currentBonus(state,player) {
  const index = stageIndex(state,player);
  return index === 0 ? state.config.bonusMs[player] : /** @type {Stage[]} */ (state.config.stages)[index-1].bonusMs[player];
}
/** @param {Clock} state @param {Player} player @returns {Stage|undefined} */
export function nextStage(state,player) {
  return (state.config.stages ?? [])[stageIndex(state,player)];
}
/** @param {Clock} state @param {Player} player @returns {number} */
export function allocatedTime(state,player) {
  if(state.overtime?.active[player] && state.config.overtime)return state.config.overtime.periodMs[player];
  if(state.config.mode==='hourglass')return state.config.baseMs[0]+state.config.baseMs[1];
  return state.config.baseMs[player] + (state.config.stages ?? []).filter(s=>state.moves[player] >= s.afterMoves).reduce((sum,s)=>sum+s.addMs[player],0);
}

/** Advances using elapsed monotonic time, never by counting interval callbacks.
 * @param {Clock} state @param {number} now @returns {Clock} */
export function advance(state, now) {
  if (state.status !== 'running' || state.active === null) return state;
  const elapsed = Math.max(0, now - state.anchor);
  const player=state.active;
  const left = /** @type {[number,number]} */ ([...state.left]);
  let overtime=state.overtime ? cloneOvertime(state.overtime):undefined;
  let flagged=/** @type {Player|null} */ (null);
  let free=0;
  if(overtime && state.config.overtime) {
    let remaining=elapsed;
    if(!overtime.active[player]) {
      const used=Math.min(remaining,left[player]);left[player]-=used;remaining-=used;
      if(left[player]===0)overtime.active[player]=true;
    }
    if(overtime.active[player]) {
      if(state.config.mode==='byoyomi') {
        while(remaining>=overtime.left[player]) {
          remaining-=overtime.left[player];
          if(overtime.periodsLeft[player]<=1){overtime.left[player]=0;overtime.periodsLeft[player]=0;flagged=player;break;}
          overtime.periodsLeft[player]--;overtime.left[player]=state.config.overtime.periodMs[player];
        }
        if(flagged===null)overtime.left[player]-=remaining;
      } else {
        overtime.left[player]=Math.max(0,overtime.left[player]-remaining);
        if(overtime.left[player]===0)flagged=player;
      }
    }
  } else {
    free = state.config.mode === 'delay' ? Math.min(elapsed, state.delayLeft) : 0;
    const used=Math.min(left[player],elapsed-free);
    left[player]=Math.max(0,left[player]-used);
    if(state.config.mode==='hourglass')left[1-player]+=used;
    if(left[player]===0)flagged=player;
  }
  return {...state,left,...(overtime?{overtime}:{}),anchor:Math.max(now,state.anchor),delayLeft:Math.max(0,state.delayLeft-free),turnElapsed:(state.turnElapsed ?? 0)+elapsed,
    status:flagged === null ? 'running':'finished',flagged};
}

/** The player who moves second presses their panel to start the opponent's clock.
 * @param {Clock} state @param {Player} player @param {number} now @returns {Clock} */
export function tap(state, player, now) {
  if (state.status === 'idle') return {...state,active:/** @type {Player} */ (1-player),status:'running',anchor:now,
    delayLeft:state.config.mode === 'delay' ? currentBonus(state,/** @type {Player} */ (1-player)):0};
  const s = advance(state,now);
  if (s.status !== 'running' || s.active !== player) return s;
  const left = /** @type {[number,number]} */ ([...s.left]);
  const moves = /** @type {[number,number]} */ ([...s.moves]);
  const overtime=s.overtime?cloneOvertime(s.overtime):undefined;
  if(s.config.mode==='bronstein')left[player]+=Math.min(s.turnElapsed ?? 0,currentBonus(s,player));
  if(overtime?.active[player] && s.config.overtime){
    if(s.config.mode==='byoyomi')overtime.left[player]=s.config.overtime.periodMs[player];
    else if(--overtime.movesLeft[player]===0){overtime.left[player]=s.config.overtime.periodMs[player];overtime.movesLeft[player]=s.config.overtime.moves;}
  }
  if (s.config.mode === 'fischer' && s.config.incrementTiming !== 'before') left[player] += currentBonus(s,player);
  moves[player]++;
  const crossed = (s.config.stages ?? []).find(stage=>stage.afterMoves === moves[player]);
  if(crossed) left[player] += crossed.addMs[player];
  const next = {...s,left,moves,...(overtime?{overtime}:{})};
  if(crossed && s.config.mode==='bronstein')left[player]+=currentBonus(next,player)-currentBonus(s,player);
  if(s.config.mode === 'fischer' && s.config.incrementTiming === 'before') left[player] += currentBonus(next,player);
  const before = snapshot(s);
  const record = {player,move:moves[player],spentMs:s.turnElapsed ?? 0,leftMs:displayTime(next,player),stage:stageIndex(next,player)+1,before};
  return {...next,active:/** @type {Player} */ (1-player),anchor:now,
    history:[...(s.history ?? []).slice(-1999),record],turnElapsed:0,
    delayLeft:s.config.mode === 'delay' ? currentBonus(next,/** @type {Player} */ (1-player)):0};
}

/** @param {Clock} state @returns {Snapshot} */
function snapshot(state) {
  return {left:[...state.left],moves:[...state.moves],active:state.active,status:state.status,delayLeft:state.delayLeft,flagged:state.flagged,turnElapsed:state.turnElapsed ?? 0,...(state.overtime?{overtime:cloneOvertime(state.overtime)}:{})};
}
/** Undo preserves time already spent before the mistaken press and pauses for review.
 * @param {Clock} state @param {number} now @returns {Clock} */
export function undo(state,now) {
  const record=state.history?.at(-1);
  if(!record || state.status==='finished') return state;
  return {...state,...record.before,status:'paused',anchor:now,history:state.history?.slice(0,-1)};
}

/** @param {Clock} state @param {number} now @returns {Clock} */
export function pause(state, now) {
  const s = advance(state,now);
  return s.status === 'running' ? {...s,status:'paused'} : s;
}
/** @param {Clock} state @param {number} now @returns {Clock} */
export function resume(state, now) {
  return state.status === 'paused' && state.active !== null ? {...state,status:'running',anchor:now}:state;
}
/** @param {Clock} state @param {Player} player @param {number} deltaMs @returns {Clock} */
export function adjust(state, player, deltaMs) {
  if (state.status !== 'paused' || !Number.isFinite(deltaMs)) return state;
  if(state.overtime?.active[player] && state.config.overtime){const overtime=cloneOvertime(state.overtime);overtime.left[player]=Math.min(state.config.overtime.periodMs[player],Math.max(1000,overtime.left[player]+deltaMs));return {...state,overtime};}
  const left = /** @type {[number,number]} */ ([...state.left]);
  left[player] = Math.min(86400000, Math.max(1000,left[player]+deltaMs));
  return {...state,left};
}

/** Resume after process termination is deliberately paused. Never compare monotonic epochs.
 * @param {unknown} value @param {number} now @returns {Clock|null} */
export function restore(value, now) {
  if (!value || typeof value !== 'object') return null;
  const s = /** @type {Clock} */ (value);
  if (!validConfig(s.config) || !Array.isArray(s.left) || s.left.length !== 2 ||
      !s.left.every(n=>Number.isFinite(n) && n >= 0 && n <= 1e12) ||
      !Array.isArray(s.moves) || s.moves.length !== 2 ||
      !s.moves.every(n=>Number.isInteger(n) && n >= 0 && n < 1e9) ||
      !['idle','running','paused','finished'].includes(s.status) ||
      ![null,0,1].includes(s.active) || ![null,0,1].includes(s.flagged) ||
      !Number.isFinite(s.delayLeft) || s.delayLeft < 0 || s.delayLeft > Math.max(...s.config.bonusMs,...(s.config.stages ?? []).flatMap(stage=>stage.bonusMs))) return null;
  if(s.overtime!==undefined && !validOvertime(s.overtime,s.config))return null;
  if(['byoyomi','canadian'].includes(s.config.mode) && !validOvertime(s.overtime,s.config))return null;
  if(s.overtime && s.overtime.periodsLeft.some((n,i)=>n===0 && (s.status!=='finished'||s.flagged!==i)))return null;
  if(s.overtime && s.overtime.active.some((active,i)=>active?s.left[i]!==0:s.left[i]===0))return null;
  if ((s.status === 'running' || s.status === 'paused') && (s.active === null || displayTime(s,s.active) <= 0 || s.flagged !== null)) return null;
  if (s.status === 'idle' && (s.active !== null || s.flagged !== null)) return null;
  if (s.status === 'finished' && (s.flagged === null || displayTime(s,s.flagged) !== 0)) return null;
  const turnElapsed = typeof s.turnElapsed === 'number' && Number.isFinite(s.turnElapsed) && s.turnElapsed>=0 ? s.turnElapsed:0;
  const history = Array.isArray(s.history) ? s.history.filter(r=>r && [0,1].includes(r.player) && Number.isInteger(r.move) && r.move>0 && Number.isFinite(r.spentMs) && r.spentMs>=0 && r.before &&
    Array.isArray(r.before.left) && r.before.left.length===2 && r.before.left.every(n=>Number.isFinite(n)&&n>=0) && (!['byoyomi','canadian'].includes(s.config.mode) || validOvertime(r.before.overtime,s.config)) && Array.isArray(r.before.moves) && r.before.moves.length===2 && r.before.moves.every(n=>Number.isInteger(n)&&n>=0) &&
    r.before.active===r.player && r.before.status==='running' && r.before.flagged===null && Number.isFinite(r.before.delayLeft) && r.before.delayLeft>=0 && Number.isFinite(r.before.turnElapsed) && r.before.turnElapsed>=0).slice(-2000):[];
  return {...s,status:s.status === 'running' ? 'paused':s.status,anchor:now,turnElapsed,history,...(s.overtime?{overtime:cloneOvertime(s.overtime)}:{})};
}

/** @param {Overtime} value @returns {Overtime} */
function cloneOvertime(value) {return {active:[...value.active],left:[...value.left],periodsLeft:[...value.periodsLeft],movesLeft:[...value.movesLeft]};}
/** @param {Overtime|undefined} value @param {Config} config @returns {boolean} */
function validOvertime(value,config) {
  const c=config.overtime;
  return Boolean(c && value && Array.isArray(value.active)&&value.active.length===2&&value.active.every(n=>typeof n==='boolean') &&
    Array.isArray(value.left)&&value.left.length===2&&value.left.every((n,i)=>Number.isFinite(n)&&n>=0&&n<=c.periodMs[i]) &&
    Array.isArray(value.periodsLeft)&&value.periodsLeft.length===2&&value.periodsLeft.every(n=>Number.isInteger(n)&&n>=0&&n<=c.periods) &&
    Array.isArray(value.movesLeft)&&value.movesLeft.length===2&&value.movesLeft.every(n=>Number.isInteger(n)&&n>=1&&n<=c.moves));
}
/** @param {Clock} state @param {Player} player @returns {number} */
export function displayTime(state,player) {return state.overtime?.active[player]?state.overtime.left[player]:state.left[player];}
/** @param {Clock} state @param {Player} player @returns {string} */
export function modeDetail(state,player) {
  if(state.overtime?.active[player])return state.config.mode==='byoyomi'?`Byo-yomi · ${state.overtime.periodsLeft[player]} periyot`:`Kanada · ${state.overtime.movesLeft[player]} hamle kaldı`;
  if(state.config.mode==='byoyomi' && state.config.overtime)return `Ana süre · sonra ${state.config.overtime.periods} × ${state.config.overtime.periodMs[player]/1000} sn`;
  if(state.config.mode==='canadian' && state.config.overtime)return `Ana süre · sonra ${state.config.overtime.moves} hamle / ${formatTime(state.config.overtime.periodMs[player])}`;
  if(state.config.mode==='hourglass')return 'Kum saati · geçen süre rakibe aktarılır';
  if(state.config.mode==='bronstein')return `Bronstein · en çok ${currentBonus(state,player)/1000} sn iade`;
  if(state.config.mode==='delay' && state.active===player && state.status==='running' && state.delayLeft>0)return `Gecikme · ${(state.delayLeft/1000).toFixed(1)} sn`;
  return state.config.mode==='none'?'Ek süresiz':`${state.config.mode==='delay'?'Gecikme':'Hamle başına'} ${currentBonus(state,player)/1000} sn`;
}

/** @param {number} ms @returns {string} */
export function formatPrecise(ms) {
  const ticks=Math.max(0,Math.ceil(ms/100));
  return `${String(Math.floor(ticks/600)).padStart(2,'0')}:${String(Math.floor(ticks/10)%60).padStart(2,'0')}.${ticks%10}`;
}

/** @param {number} ms @returns {string} */
export function formatTime(ms) {
  const seconds = Math.max(0,Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds/60);
  if (minutes >= 60) return `${Math.floor(minutes/60)}:${String(minutes%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  return `${String(minutes).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}

/** @type {Config[]} */
export const PRESETS = [
  {label:'1 + 0',baseMs:[60000,60000],bonusMs:[0,0],kind:'standard',mode:'none'},
  {label:'2 + 1',baseMs:[120000,120000],bonusMs:[1000,1000],kind:'standard',incrementTiming:'before',mode:'fischer'},
  {label:'3 + 0',baseMs:[180000,180000],bonusMs:[0,0],kind:'standard',mode:'none'},
  {label:'3 + 2',baseMs:[180000,180000],bonusMs:[2000,2000],kind:'standard',incrementTiming:'before',mode:'fischer'},
  {label:'5 + 0',baseMs:[300000,300000],bonusMs:[0,0],kind:'standard',mode:'none'},
  {label:'5 + 3',baseMs:[300000,300000],bonusMs:[3000,3000],kind:'standard',incrementTiming:'before',mode:'fischer'},
  {label:'10 + 0',baseMs:[600000,600000],bonusMs:[0,0],kind:'standard',mode:'none'},
  {label:'15 + 10',baseMs:[900000,900000],bonusMs:[10000,10000],kind:'standard',incrementTiming:'before',mode:'fischer'},
  {label:'30 + 0',baseMs:[1800000,1800000],bonusMs:[0,0],kind:'standard',mode:'none'}
];

/** @type {Config[]} */
export const TOURNAMENT_PRESETS = [
  {kind:'tournament',incrementTiming:'before',label:'90 dk · 40 → +30',baseMs:[5400000,5400000],mode:'fischer',bonusMs:[30000,30000],stages:[{afterMoves:40,addMs:[1800000,1800000],bonusMs:[30000,30000]}]},
  {kind:'tournament',incrementTiming:'before',label:'120 dk · 40 → +30',baseMs:[7200000,7200000],mode:'fischer',bonusMs:[0,0],stages:[{afterMoves:40,addMs:[1800000,1800000],bonusMs:[30000,30000]}]},
  {kind:'tournament',incrementTiming:'before',label:'15 dk + 10 sn',baseMs:[900000,900000],mode:'fischer',bonusMs:[10000,10000]},
  {kind:'tournament',incrementTiming:'before',label:'3 dk + 2 sn',baseMs:[180000,180000],mode:'fischer',bonusMs:[2000,2000]}
];

export const TOURNAMENT_INFO = [
  {name:'Klasik · sürekli ekleme',detail:'90 dk / 40 hamle, ardından +30 dk. İlk hamleden itibaren +30 sn.',source:'https://handbook.fide.com/files/handbook/Olympiad2026MainCompetition.pdf'},
  {name:'Klasik · ikinci aşamada ekleme',detail:'120 dk / 40 hamle, ardından +30 dk. 41. hamleden itibaren +30 sn.',source:'https://handbook.fide.com/files/handbook/FWCM2026.pdf'},
  {name:'Hızlı',detail:'Tüm oyun için 15 dk. İlk hamleden itibaren +10 sn; aşama geçişi yok.',source:'https://handbook.fide.com/files/handbook/FWCM2026.pdf'},
  {name:'Yıldırım',detail:'Tüm oyun için 3 dk. İlk hamleden itibaren +2 sn; aşama geçişi yok.',source:'https://handbook.fide.com/files/handbook/FWCM2026.pdf'}
];

/** @type {Config[]} */
export const EXTRA_PRESETS=[
  {kind:'standard',label:'Bronstein · 5 dk / 3 sn',mode:'bronstein',baseMs:[300000,300000],bonusMs:[3000,3000]},
  {kind:'standard',label:'Kum saati · 1 dk',mode:'hourglass',baseMs:[60000,60000],bonusMs:[0,0]},
  {kind:'standard',label:'Byo-yomi · 20 dk / 5 × 30 sn',mode:'byoyomi',baseMs:[1200000,1200000],bonusMs:[0,0],overtime:{periodMs:[30000,30000],periods:5,moves:1}},
  {kind:'standard',label:'Kanada · 20 dk / 25 hamle / 5 dk',mode:'canadian',baseMs:[1200000,1200000],bonusMs:[0,0],overtime:{periodMs:[300000,300000],periods:1,moves:25}}
];
