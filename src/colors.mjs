export const DEFAULT_COLORS = ['#CDEFAA','#8CD5E7'];
export const PALETTES = [
  {name:'Neon',colors:['#CDEFAA','#8CD5E7']},
  {name:'Porselen',colors:['#EBDDC7','#CDBBDD']},
  {name:'Gün batımı',colors:['#E8B28F','#CE92A7']},
  {name:'Okyanus',colors:['#95D3C8','#94B9E4']}
];
export const SWATCHES = ['#CDEFAA','#8CD5E7','#EBDDC7','#CDBBDD','#E8B28F','#CE92A7','#95D3C8','#94B9E4','#3F5263','#524263'];
/** @param {unknown} value */
export function normalizeHex(value) {
  if(typeof value!=='string')return null;
  const hex=value.trim().replace(/^#/,'');
  if(/^[0-9a-f]{3}$/i.test(hex))return '#'+hex.split('').map(c=>c+c).join('').toUpperCase();
  return /^[0-9a-f]{6}$/i.test(hex)?'#'+hex.toUpperCase():null;
}
/** @param {unknown} value */
export function readPlayerColors(value) {
  if(!Array.isArray(value)||value.length!==2)return [...DEFAULT_COLORS];
  return value.map((v,i)=>normalizeHex(v)||DEFAULT_COLORS[i]);
}
/** @param {string} color */
function rgb(color){return (color.slice(1).match(/../g)||[]).map(v=>parseInt(v,16));}
/** @param {string} a @param {string} b @param {number} weightA */
export function blendHex(a,b,weightA) {
  const first=rgb(a),second=rgb(b);
  return '#'+first.map((v,i)=>Math.round(v*weightA+second[i]*(1-weightA)).toString(16).padStart(2,'0')).join('').toUpperCase();
}
/** @param {string} color */
export function luminance(color){return rgb(color).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
/** @param {string} color */
export function contrastText(color){const l=luminance(color);return (l+.05)/.05>=1.05/(l+.05)?'#000000':'#FFFFFF';}
