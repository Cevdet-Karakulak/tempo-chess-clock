const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const mode = process.argv[2];
const root = path.resolve(process.argv[3] || '.');
function fail(message) { console.error('TEMPO B1: ' + message); process.exit(1); }
const appPath = path.join(root, 'app.json');
if (!fs.existsSync(appPath)) fail('app.json missing. Choose the existing tempo-animated folder.');
const config = JSON.parse(fs.readFileSync(appPath, 'utf8'));
const app = config.expo;
if (app?.ios?.bundleIdentifier !== 'com.floppachesscorp.tempo') fail('This is not the Tempo project.');
if (['app.config.js', 'app.config.ts', 'app.config.cjs', 'app.config.mjs'].some(f => fs.existsSync(path.join(root, f)))) fail('Dynamic Expo config found. Send the error before proceeding.');
if (fs.existsSync(path.join(root, 'ios'))) fail('Native ios folder found. Send the error before proceeding; app.json alone will not update this native project.');
if (mode === 'apply') {
  let index = app.plugins?.findIndex(p => p === 'expo-audio' || (Array.isArray(p) && p[0] === 'expo-audio')) ?? -1;
  if (index < 0) fail('expo-audio plugin missing. Send this error.');
  const old = app.plugins[index];
  const options = Array.isArray(old) ? { ...old[1] } : {};
  Object.assign(options, { microphonePermission: false, recordAudioAndroid: false, enableBackgroundPlayback: false, enableBackgroundRecording: false });
  app.plugins[index] = ['expo-audio', options];
  if (Array.isArray(app.ios.infoPlist?.UIBackgroundModes)) {
    app.ios.infoPlist.UIBackgroundModes = app.ios.infoPlist.UIBackgroundModes.filter(m => m !== 'audio');
    if (!app.ios.infoPlist.UIBackgroundModes.length) delete app.ios.infoPlist.UIBackgroundModes;
  }
  const backup = appPath + '.before-background-audio-fix';
  if (!fs.existsSync(backup)) fs.copyFileSync(appPath, backup);
  fs.writeFileSync(appPath, JSON.stringify(config, null, 2) + '\n');
  console.log('TEMPO B1 applied. Existing Expo owner, project ID and signing configuration preserved.');
} else if (mode === 'verify') {
  const expoCli = path.join(root, 'node_modules', 'expo', 'bin', 'cli');
  const output = execFileSync(process.execPath, [expoCli, 'config', '--type', 'introspect', '--json'], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, env: { ...process.env, CI: '1' } });
  const resolved = JSON.parse(output);
  const plist = resolved._internal?.modResults?.ios?.infoPlist;
  if (!plist) fail('Could not inspect the generated iOS Info.plist.');
  if (plist.UIBackgroundModes?.includes('audio')) fail('Generated Info.plist still contains background audio. Build blocked.');
  console.log('TEMPO B1 VERIFIED: generated iOS Info.plist has no audio background mode.');
} else if (mode === 'release') {
  if (!app.extra?.eas?.projectId) fail('Existing EAS project ID missing. Do not create a new project.');
  const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8'));
  if (eas.cli?.appVersionSource !== 'remote' || eas.build?.production?.autoIncrement !== true || eas.build.production.distribution !== 'store') fail('Production must use remote versions, autoIncrement=true and store distribution.');
  console.log('TEMPO B1 release configuration verified. EAS will increment the existing remote iOS build number.');
} else fail('Use apply, verify or release.');
