import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {selectBuild,verifyApk,parseEasBuildList}=createRequire(import.meta.url)('../scripts/android-apk.cjs');
const request={projectId:'our-project',package:'com.floppachesscorp.tempo',message:'unique-request'};
const build={id:'our-build',message:request.message,app:{id:request.projectId},appIdentifier:request.package,platform:'ANDROID',buildProfile:'android-apk',status:'FINISHED',artifacts:{applicationArchiveUrl:'https://example.com/app.apk'}};

test('APK download selects this request even when a newer unrelated build exists',()=>{
  assert.equal(selectBuild([{...build,id:'other-build',message:'another-request'},build],request).build.id,'our-build');
});
test('wrong project, platform, profile, package and unfinished builds cannot be downloaded',()=>{
  for(const change of [{app:{id:'wrong-project'}},{platform:'IOS'},{buildProfile:'production'},{appIdentifier:'com.other.app'},{status:'ERRORED'}])assert.throws(()=>selectBuild([{...build,...change}],request),/not found uniquely/);
  assert.throws(()=>selectBuild([build,{...build,id:'duplicate'}],request),/not found uniquely/);
});
test('APK download refuses a missing or insecure artifact URL',()=>{
  assert.throws(()=>selectBuild([{...build,artifacts:{}}],request),/not ready/);
  assert.throws(()=>selectBuild([{...build,artifacts:{applicationArchiveUrl:'http://example.com/app.apk'}}],request),/not ready/);
});
// Small archive fixture with normal local headers and central-directory entries.
function zip(names){
  const local=[],central=[];let offset=0;
  for(const name of names){const n=Buffer.from(name),l=Buffer.alloc(30),c=Buffer.alloc(46);l.writeUInt32LE(0x04034b50);l.writeUInt16LE(n.length,26);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);local.push(l,n);central.push(c,n);offset+=30+n.length;}
  const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(Buffer.concat(central).length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,...central,end]);
}
test('APK structure check accepts a manifest and dex, rejects AAB, HTML and interrupted downloads',()=>{
  assert.doesNotThrow(()=>verifyApk(zip(['AndroidManifest.xml','classes.dex','assets/index.android.bundle'])));
  assert.throws(()=>verifyApk(zip(['base/manifest/AndroidManifest.xml','base/dex/classes.dex'])),/not an installable APK/);
  assert.throws(()=>verifyApk(Buffer.from('<html>Download denied</html>')),/not an APK/);
  assert.throws(()=>verifyApk(zip(['AndroidManifest.xml','classes.dex']).subarray(0,-12)),/incomplete/);
});

test('EAS build list tolerates context diagnostics before JSON but still selects the exact request',()=>{
 const output='Failed to read git metadata. Continuing without it.\r\n'+JSON.stringify([build],null,2)+'\r\n';
 assert.equal(selectBuild(parseEasBuildList(output),request).build.id,build.id);
 assert.deepEqual(parseEasBuildList('\uFEFF'+JSON.stringify([build])),[build]);
 assert.deepEqual(parseEasBuildList('\u001b[33mDiagnostic\u001b[0m\n[]'),[]);
});
test('EAS text errors and malformed or wrong-shaped JSON are refused',()=>{
 for(const output of ['Failed to get builds','Failed to get builds [error]','{}','null','[{','[]\nFailed to get builds'])assert.throws(()=>parseEasBuildList(output),/valid build list/);
 assert.throws(()=>selectBuild(parseEasBuildList('Diagnostic\n'+JSON.stringify([{...build,message:'unrelated'}])),request),/not found uniquely/);
});
