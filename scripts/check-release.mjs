import fs from 'node:fs';
import assert from 'node:assert/strict';
const config=JSON.parse(fs.readFileSync('app.json')).expo;
const pkg=JSON.parse(fs.readFileSync('package.json'));
const eas=JSON.parse(fs.readFileSync('eas.json'));
assert.equal(config.version,pkg.version);
assert.equal(config.ios.supportsTablet,true);
assert.equal(config.ios.requireFullScreen,false);
assert.equal(config.ios.config.usesNonExemptEncryption,false);
assert.equal(config.ios.privacyManifests.NSPrivacyTracking,false);
assert.match(config.ios.bundleIdentifier,/^[a-z][\w]*(\.[\w]+){2,}$/);
assert.equal(eas.build.production.ios.image,'sdk-57');
const icon=fs.readFileSync(config.icon);
assert.equal(icon.readUInt32BE(16),1024);assert.equal(icon.readUInt32BE(20),1024);
assert.equal(icon[25],2,'App icon must be opaque RGB PNG.');
for(const dep of ['expo-print','expo-sharing','react-native-view-shot','expo-media-library'])assert.ok(pkg.dependencies[dep]);
assert.ok(!pkg.dependencies['expo-updates'],'Recheck privacy declarations before introducing updates or telemetry.');
const source=fs.readFileSync('App.tsx','utf8');
assert.ok(!source.includes('export-csv')&&!source.includes('export-json'));
assert.ok(source.includes('export-pdf')&&source.includes('export-image'));
const logoSource=fs.readFileSync('src/PreparationLogo.tsx','utf8');
assert.ok(source.includes('<PreparationLogo')&&logoSource.includes("require('../assets/tempo-logo.png')"),'Preparation header reuses the original logo artwork.');
assert.ok(!source.includes('preview-finale')&&!source.includes('previewPlayer'),'Finish preview was removed.');
assert.ok(source.includes('const [settings, setSettings] = useState(true)'),'Launch opens the time selection screen.');
assert.equal((source.match(/<ScreenModal /g)??[]).length,1,'One native presentation hosts settings, history and privacy navigation.');
const modalSource=fs.readFileSync('src/ScreenModal.tsx','utf8');
assert.ok(modalSource.includes('<SafeAreaProvider')&&modalSource.includes('<SafeAreaView'),'Modals have their own safe-area provider.');
assert.equal(config.icon,'./assets/tempo-icon.png','Store icon remains separate from the header logo.');
assert.ok(source.includes('https://tempo-satranc-saati-destek.efekaankarakulak.chatgpt.site/#privacy'));
console.log('Release configuration: OK · 1.0.0 · iPhone/iPad · PDF/PNG · opaque 1024 icon');
if(!config.extra?.eas?.projectId)console.log('EAS project will be created by TestFlight-Windows.bat after login.');
console.log('Signed build, physical device tests and App Store submission require the developer account.');

const photosPlugin=config.plugins.find(p=>Array.isArray(p)&&p[0]==='expo-media-library');
assert.equal(photosPlugin[1].photosPermission,false);
assert.ok(photosPlugin[1].savePhotosPermission.includes('Tempo'));
assert.ok(source.includes("expo-media-library/legacy")&&source.includes('saveToLibraryAsync'));
assert.ok(!source.includes('setReportPreview')&&!source.includes("mimeType:'image/png'"),'PNG saves directly without a sharing modal.');
assert.ok(source.includes('privacy-policy-open')&&source.includes('setPolicyOpen(true)'),'Privacy policy is available inside the app.');

assert.equal(eas.build['android-apk'].android.buildType,'apk');
assert.equal(eas.build['android-apk'].distribution,'internal');
assert.equal(config.android.package,config.ios.bundleIdentifier);
assert.ok(config.android.blockedPermissions.includes('android.permission.READ_MEDIA_IMAGES'));
assert.deepEqual(photosPlugin[1].granularPermissions,[]);

for(const lang of ['tr','en']){
 const ref=config.locales[lang];
 const data=typeof ref==='string'?JSON.parse(fs.readFileSync(ref,'utf8')):ref;
 assert.ok(data.ios?.NSPhotoLibraryAddUsageDescription,'Photos permission translation must be iOS-only.');
 assert.ok(!data.NSPhotoLibraryAddUsageDescription&&!data.android?.NSPhotoLibraryAddUsageDescription,'Apple permission text must not become an Android string.');
}
