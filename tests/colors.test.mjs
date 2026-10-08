import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeHex,readPlayerColors,DEFAULT_COLORS,contrastText,luminance} from '../src/colors.mjs';
test('custom and persisted colors normalize safely; malformed values fall back independently',()=>{
  assert.equal(normalizeHex(' abc '),'#AABBCC');assert.equal(normalizeHex('#a1b2c3'),'#A1B2C3');
  for(const value of [null,42,'#ABCDEF00','red','12<script>'])assert.equal(normalizeHex(value),null);
  assert.deepEqual(readPlayerColors(['#123','oops']),['#112233',DEFAULT_COLORS[1]]);
  assert.deepEqual(readPlayerColors(null),DEFAULT_COLORS);
});
test('automatic text choice meets 4.5 contrast across a representative RGB grid',()=>{
  for(const r of [0,51,102,153,204,255])for(const g of [0,51,102,153,204,255])for(const b of [0,51,102,153,204,255]){
    const color='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
    const a=luminance(color),c=luminance(contrastText(color));assert.ok((Math.max(a,c)+.05)/(Math.min(a,c)+.05)>=4.5);
  }
});
