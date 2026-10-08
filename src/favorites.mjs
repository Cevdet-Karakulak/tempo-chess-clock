import {validConfig} from './clock.mjs';
/** @typedef {{id:string,name:string,config:import('./clock.mjs').Config}} Favorite */
/** @param {unknown} value @returns {Favorite[]} */
export function readFavorites(value) {
  if(!Array.isArray(value))return [];
  const ids=new Set();
  return value.filter(v=>v && typeof v.id==='string' && v.id.length<=80 && !ids.has(v.id) && typeof v.name==='string' && v.name.trim().length>0 && v.name.length<=40 && validConfig(v.config) && ids.add(v.id)).slice(0,12).map(v=>({id:v.id,name:v.name.trim(),config:JSON.parse(JSON.stringify(v.config))}));
}
