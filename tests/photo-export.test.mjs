import test from 'node:test';
import assert from 'node:assert/strict';
import {createExportGate,savePhoto,PhotoPermissionError,requiresPhotoPermission} from '../src/photo-export.mjs';

test('modern Android saves its own image without read permissions; iOS and old Android request write permission',()=>{
  assert.equal(requiresPhotoPermission('android',29),true);
  for(const api of [30,31,32,33,34,35,36,37])assert.equal(requiresPhotoPermission('android',api),false);
  assert.equal(requiresPhotoPermission('ios',26),true);
  assert.equal(requiresPhotoPermission('android',NaN),true);
  assert.equal(requiresPhotoPermission('web'),false);
});

test('direct photo export saves before deleting the temporary PNG',async()=>{
  const events=[];
  await savePhoto({permission:async()=>{events.push('permission');return true;},capture:async()=>{events.push('capture');return 'file:///report.png';},save:async uri=>{assert.equal(uri,'file:///report.png');events.push('save');},release:uri=>{assert.equal(uri,'file:///report.png');events.push('release');}});
  assert.deepEqual(events,['permission','capture','save','release']);
});
test('permission refusal leaves the report and photo library untouched',async()=>{
  let touched=false;
  await assert.rejects(savePhoto({permission:async()=>false,capture:async()=>{touched=true;return '';},save:async()=>{touched=true;},release:()=>{touched=true;}}),PhotoPermissionError);
  assert.equal(touched,false);
});
test('a failed Photos import cleans up its temporary file and reports failure',async()=>{
  let released='';
  await assert.rejects(savePhoto({permission:async()=>true,capture:async()=>'file:///report.png',save:async()=>{throw new Error('storage full');},release:uri=>{released=uri;}}),/storage full/);
  assert.equal(released,'file:///report.png');
});
test('capture failures do not attempt a Photos import',async()=>{
  let saved=false;
  await assert.rejects(savePhoto({permission:async()=>true,capture:async()=>{throw new Error('no layout');},save:async()=>{saved=true;},release:()=>{throw new Error('unexpected release');}}),/no layout/);
  assert.equal(saved,false);
});
test('iOS absolute capture paths become file URLs; cleanup keeps the original path',async()=>{
  let saved='',released='';
  await savePhoto({permission:async()=>true,capture:async()=>'/private/tmp/report.png',save:async uri=>{saved=uri;},release:uri=>{released=uri;}});
  assert.equal(saved,'file:///private/tmp/report.png');
  assert.equal(released,'/private/tmp/report.png');
});
test('repeated taps create one export; another export is allowed after completion',async()=>{
  const gate=createExportGate();let release;
  const first=gate.run(()=>new Promise(resolve=>{release=resolve;}));
  assert.equal(await gate.run(async()=>{throw new Error('duplicate');}),false);
  release();assert.equal(await first,true);
  assert.equal(await gate.run(async()=>{}),true);
});
test('a failed export does not lock future exports',async()=>{
  const gate=createExportGate();
  await assert.rejects(gate.run(async()=>{throw new Error('failed');}),/failed/);
  assert.equal(await gate.run(async()=>{}),true);
});
