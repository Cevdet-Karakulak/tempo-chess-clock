const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.dirname(__dirname);
const expected={
  "App.tsx": "39218f3069da733ce55a8655cf4f86a4f81658b768e6cac5a18fd45d8f55e09a",
  "src/PreparationLogo.tsx": "2a98985d4f53ff85872db0816591cd4f599eaa1240b1de3747b328b78aec2044",
  "src/ScreenModal.tsx": "f53b75b7e5284741df95093a97c3a9802f7cbd33f419e20b9e7d2c90649aaf54",
  "src/ReportCard.tsx": "0a9793738b46a08f77affed5a0ea990cf760e27ac7c4bd634b11dfa064c3c762",
  "src/photo-export.mjs": "6a6c0ce34f09b861947ff5c6261a545d2225f228812d937f4d4d9c61730bd781",
  "src/control-confirmation.mjs": "3258a265abd5ae5124b35a5ae712b5d2d33bb58c2514b1edbd75f04933685eef",
  "src/translations.mjs": "a6e956c4a07bd49f6fe87094c68cb4bb0eebb860394d0f9dab599184675cf19e",
  "scripts/check-release.mjs": "8cbd8eb2611ce4c1d3486da44f99a1ac3252d68e5705dd35657e91463822915e",
  "tests/control-confirmation.test.mjs": "b5d071c7e40601228f89bc95817ce3d5ec6a4540a4b0247f87351c09b1db81da",
  "tests/photo-export.test.mjs": "b3b11e1b534e0885820e61c267af5a44b29aa7bfe93e6e8d8df759604955d36d",
  "index.js": "af10e01cf5fa6d399a83829926cc80d935c1dca8fb01313ab7cb54aab84c028b",
  "assets/tempo-logo.png": "f78b53f841e7b58e450a08023a0bb5530db2b63c8e92bbe28e79516f8982a8a6",
  "package-lock.json": "ee282f517e6afa0297ef1ed3f552a61a5a393cf77c3ee011a4860c26634adf16",
  "src/FlagFinale.tsx": "8ee2ffd34c725108c4f6329d68506fe26183d720031219abd339d742625a08d5",
  "assets/finale-blade.png": "a9b1d883be195ade39c0d7f66e350bf746a4d3e2b5c706969c79b182099981c5",
  "assets/finale-dial.png": "214540d0326f475a53e09ae01f0def0ecda6f2a1aaab9c1e98ef127a75a11d61",
  "assets/finale-pivot.png": "034cf7ffa1df38ac96986a6bac7cda78e1ffb3095f29735c14deca36a1b2b8b7"
};
function fail(message){console.error('TEMPO P1: '+message);process.exit(1);}
for(const [name,hash] of Object.entries(expected)){
 const file=path.join(root,name);
 if(!fs.existsSync(file)||crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==hash)fail('Source missing or different: '+name+'. Apply Tempo-P1-Guncelle-TestFlight.bat.');
}
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(pkg.main!=='index.js'||pkg.dependencies['expo-media-library']!=='~57.0.5')fail('Photos dependency or entry is missing.');
for(const h of ['eas-build-pre-install','eas-build-post-install'])if(pkg.scripts[h]!=='node scripts/verify-release-p1.cjs')fail('P1 source hook missing: '+h);
const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo;
const plugin=app.plugins?.find(p=>Array.isArray(p)&&p[0]==='expo-media-library');
if(!plugin||plugin[1].photosPermission!==false||plugin[1].savePhotosPermission!=="Tempo maç özetini Fotoğraflar’a kaydetmek için fotoğraf ekleme izni ister.")fail('iOS add-only Photos permission configuration is missing.');
for(const lang of ['tr','en']){
 const locale=app.locales?.[lang];
 const data=typeof locale==='string'?JSON.parse(fs.readFileSync(path.resolve(root,locale),'utf8')):locale;
 if(!(data?.ios?.NSPhotoLibraryAddUsageDescription||data?.NSPhotoLibraryAddUsageDescription))fail('Photos permission translation missing: '+lang);
}
const alternatives=fs.readdirSync(root).filter(n=>/^App\.(ios\.|native\.)?(js|jsx|ts|tsx)$/.test(n)&&n!=='App.tsx');
if(alternatives.length)fail('Unexpected entry: '+alternatives.join(', '));
console.log('TEMPO P1 VERIFIED - direct Photos save / in-app privacy / persistent flag / aligned H2 header.');
