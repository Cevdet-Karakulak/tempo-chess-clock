const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.dirname(__dirname);
const expected={
  "App.tsx": "c5cb7df83bf65c89c7450adde98fc376aa891eabfc8c419c696d234e11c1093b",
  "src/PreparationLogo.tsx": "2a98985d4f53ff85872db0816591cd4f599eaa1240b1de3747b328b78aec2044",
  "src/ScreenModal.tsx": "f53b75b7e5284741df95093a97c3a9802f7cbd33f419e20b9e7d2c90649aaf54",
  "src/control-confirmation.mjs": "3258a265abd5ae5124b35a5ae712b5d2d33bb58c2514b1edbd75f04933685eef",
  "src/translations.mjs": "a60191983f4d790485011ba5dc24f11971b3dc2802337d233c11cbe0da94e16b",
  "scripts/check-release.mjs": "91a12febe59765674b2dc287b1a024ed7e60197520933c5b516f492c62167eff",
  "tests/control-confirmation.test.mjs": "b5d071c7e40601228f89bc95817ce3d5ec6a4540a4b0247f87351c09b1db81da",
  "index.js": "af10e01cf5fa6d399a83829926cc80d935c1dca8fb01313ab7cb54aab84c028b",
  "assets/tempo-logo.png": "f78b53f841e7b58e450a08023a0bb5530db2b63c8e92bbe28e79516f8982a8a6"
};
let failed=false;
for(const [name,hash] of Object.entries(expected)){
 const file=path.join(root,name);
 if(!fs.existsSync(file)){console.error('HEADER H2 MISSING: '+name);failed=true;continue;}
 const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(actual!==hash){console.error('HEADER H2 DIFFERENT: '+name);failed=true;}
}
const alternatives=fs.readdirSync(root).filter(name=>/^App\.(ios\.|native\.)?(js|jsx|ts|tsx)$/.test(name)&&name!=='App.tsx');
if(alternatives.length){console.error('HEADER H2 unexpected App entry: '+alternatives.join(', '));failed=true;}
if(failed){console.error('Build blocked: current aligned logo source is not present. Apply Tempo-Logo-Duzelt-TestFlight.bat.');process.exit(1);}
console.log('HEADER H2 VERIFIED - App.tsx and PreparationLogo.tsx match the aligned logo release.');
