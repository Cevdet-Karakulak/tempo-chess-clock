import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {getResolvedLocalesAsync}=require(path.join(path.dirname(require.resolve('@expo/config-plugins')),'utils/locales.js'));
const root=path.resolve(import.meta.dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo;
for(const lang of ['tr','en'])test(`${lang}: Photos add permission reaches iOS and never Android resources`,async()=>{
 const input={[lang]:config.locales[lang]};
 const ios=await getResolvedLocalesAsync(root,input,'ios');
 const android=await getResolvedLocalesAsync(root,input,'android');
 assert.match(ios.localesMap[lang].NSPhotoLibraryAddUsageDescription,/Tempo/);
 assert.equal(android.localesMap[lang].NSPhotoLibraryAddUsageDescription,undefined);
});
