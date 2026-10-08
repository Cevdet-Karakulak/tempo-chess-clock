const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.dirname(__dirname);
const expected={
  "App.tsx": "01b1085165402c76e380fcbebd7bffe74a5e82bafade489c447a522ae71e11a8",
  "src/PreparationLogo.tsx": "2a98985d4f53ff85872db0816591cd4f599eaa1240b1de3747b328b78aec2044",
  "src/ScreenModal.tsx": "f53b75b7e5284741df95093a97c3a9802f7cbd33f419e20b9e7d2c90649aaf54",
  "src/ReportCard.tsx": "0a9793738b46a08f77affed5a0ea990cf760e27ac7c4bd634b11dfa064c3c762",
  "src/photo-export.mjs": "ba54a41dcfa404a16094e72fdc1ee25efdfce2975a262f01f206ea467b6fdac2",
  "src/control-confirmation.mjs": "3258a265abd5ae5124b35a5ae712b5d2d33bb58c2514b1edbd75f04933685eef",
  "src/translations.mjs": "ef75d0bc86ba79fb7cc38852d1e2df1242a35a18393689cdd359d777d49fa326",
  "scripts/check-release.mjs": "455f5b1d5a40021dc6ca8f4b77757ad06ac7871807ef6e2831545cf176b96ee5",
  "tests/control-confirmation.test.mjs": "b5d071c7e40601228f89bc95817ce3d5ec6a4540a4b0247f87351c09b1db81da",
  "tests/photo-export.test.mjs": "e05d82fb794f3e93b2f9493daedb585b41425fb3f8449cba7995de88c9deb656",
  "index.js": "af10e01cf5fa6d399a83829926cc80d935c1dca8fb01313ab7cb54aab84c028b",
  "assets/tempo-logo.png": "f78b53f841e7b58e450a08023a0bb5530db2b63c8e92bbe28e79516f8982a8a6",
  "package-lock.json": "ee282f517e6afa0297ef1ed3f552a61a5a393cf77c3ee011a4860c26634adf16",
  "src/FlagFinale.tsx": "4ba4b8e109d9ae43da4184913d3dadd7e6ba8f4141e30c0aa393f0087115f248",
  "assets/finale-blade.png": "a9b1d883be195ade39c0d7f66e350bf746a4d3e2b5c706969c79b182099981c5",
  "assets/finale-dial.png": "214540d0326f475a53e09ae01f0def0ecda6f2a1aaab9c1e98ef127a75a11d61",
  "assets/finale-pivot.png": "034cf7ffa1df38ac96986a6bac7cda78e1ffb3095f29735c14deca36a1b2b8b7",
  "scripts/android-apk.cjs": "f6d33b44356dd5393416465dbbe3ac7803246d947274f156c7a043ac49a72291",
  "tests/android-apk.test.mjs": "fdd438039e8a9799b2603a205000d4239e97ffdb5526e4dd0a003a2d9faa5dc8",
  "Android-APK-Windows.bat": "7bb4379faca28d37b9eb631cbe9aa9945a650718e30502cd274b574619756245",
  "Tempo-APK-Indir.bat": "5a5a19b75b51019c6456105180e4871db912db5ca460d1021b303699bdab4a69",
  "tests/native-locales.test.mjs": "7909bc7245a5e7ca2050175c9b9e021766373700e28d689df78bf4fbd0e1b44f"
};
function fail(message){console.error('TEMPO A1: '+message);process.exit(1);}
for(const [name,hash] of Object.entries(expected)){
 const file=path.join(root,name);
 if(!fs.existsSync(file)||crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==hash)fail('Source missing or different: '+name+'. Apply Tempo-Android-APK.bat.');
}
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(pkg.main!=='index.js'||pkg.dependencies['expo-media-library']!=='~57.0.5')fail('Photos dependency or entry is missing.');
for(const h of ['eas-build-pre-install','eas-build-post-install'])if(pkg.scripts[h]!=='node scripts/verify-release-a1.cjs')fail('A1 source hook missing: '+h);
const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo;
const plugin=app.plugins?.find(p=>Array.isArray(p)&&p[0]==='expo-media-library');
if(!plugin||plugin[1].photosPermission!==false||plugin[1].savePhotosPermission!=="Tempo maç özetini Fotoğraflar’a kaydetmek için fotoğraf ekleme izni ister.")fail('iOS add-only Photos permission configuration is missing.');
for(const lang of ['tr','en']){
 const locale=app.locales?.[lang];
 const data=typeof locale==='string'?JSON.parse(fs.readFileSync(path.resolve(root,locale),'utf8')):locale;
 if(!data?.ios?.NSPhotoLibraryAddUsageDescription||data?.NSPhotoLibraryAddUsageDescription||data?.android?.NSPhotoLibraryAddUsageDescription)fail('Photos permission translation must be iOS-only: '+lang);
}
const alternatives=fs.readdirSync(root).filter(n=>/^App\.(ios\.|native\.)?(js|jsx|ts|tsx)$/.test(n)&&n!=='App.tsx');
if(alternatives.length)fail('Unexpected entry: '+alternatives.join(', '));
console.log('TEMPO A1 VERIFIED - direct Photos save / in-app privacy / persistent flag / aligned H2 header.');

const eas=JSON.parse(fs.readFileSync(path.join(root,'eas.json'),'utf8'));
if(eas.build?.['android-apk']?.android?.buildType!=='apk'||eas.build['android-apk'].distribution!=='internal')fail('APK build profile missing.');
if(plugin[1].granularPermissions?.length!==0||!app.android?.blockedPermissions?.includes('android.permission.READ_MEDIA_IMAGES'))fail('Android gallery permission configuration missing.');
