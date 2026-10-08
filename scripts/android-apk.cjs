const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {Readable}=require('node:stream');const {pipeline}=require('node:stream/promises');
const root=path.dirname(__dirname),profile='android-apk',cli='eas-cli@24.10.0';
function eas(args,capture=false){
 const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',['--yes',cli,...args],{cwd:root,shell:process.platform==='win32',stdio:capture?['inherit','pipe','inherit']:'inherit',encoding:'utf8',maxBuffer:16*1024*1024});
 if(result.error||result.status!==0)throw new Error('Expo command failed. Keep the message above.');
 return capture?parseEasBuildList(result.stdout):undefined;
}
// EAS context setup can print diagnostics to stdout before --json is enabled.
// Only accept a complete trailing JSON array; build identity is still checked below.
function parseEasBuildList(stdout){
 const clean=String(stdout||'').replace(/\u001b\[[0-?]*[ -/]*[@-~]/g,'').replace(/^\uFEFF/,'').trim();
 const starts=[0];for(const match of clean.matchAll(/(?:^|\n)[ \t]*(?=\[)/g))starts.push(match.index+match[0].length);
 for(const offset of [...new Set(starts)]){
  try{const data=JSON.parse(clean.slice(offset));if(Array.isArray(data))return data;}catch{}
 }
 throw new Error('Expo did not return a valid build list. Open the completed build link and use Install / Download; no new build is needed.');
}
function selectBuild(builds,request){
 const matches=builds.filter(b=>b.message===request.message&&b.platform==='ANDROID'&&b.buildProfile===profile&&b.status==='FINISHED'&&b.app?.id===request.projectId&&b.appIdentifier===request.package);
 if(matches.length!==1)throw new Error('This APK build was not found uniquely. No other build will be downloaded.');
 const build=matches[0],url=build.artifacts?.applicationArchiveUrl||build.artifacts?.buildUrl;
 if(!url||new URL(url).protocol!=='https:')throw new Error('APK artifact is not ready.');
 return {build,url};
}
function verifyApk(buffer){
 if(buffer.length<22||buffer.readUInt32LE(0)!==0x04034b50)throw new Error('Downloaded file is not an APK ZIP.');
 let end=-1;
 for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--){if(buffer.readUInt32LE(i)===0x06054b50&&i+22+buffer.readUInt16LE(i+20)===buffer.length){end=i;break;}}
 if(end<0)throw new Error('APK download is incomplete.');
 const count=buffer.readUInt16LE(end+10);let offset=buffer.readUInt32LE(end+16);const names=[];
 for(let i=0;i<count;i++){
  if(offset+46>buffer.length||buffer.readUInt32LE(offset)!==0x02014b50)throw new Error('APK directory is damaged.');
  const len=buffer.readUInt16LE(offset+28),extra=buffer.readUInt16LE(offset+30),comment=buffer.readUInt16LE(offset+32);
  names.push(buffer.toString('utf8',offset+46,offset+46+len));offset+=46+len+extra+comment;
 }
 if(!names.includes('AndroidManifest.xml')||!names.some(n=>/^classes\d*\.dex$/.test(n)))throw new Error('Artifact is not an installable APK (AAB/HTML refused).');
}
async function download(request){
 const builds=eas(['build:list','--platform','android','--build-profile',profile,'--status','finished','--limit','50','--json','--non-interactive'],true);
 const {build,url}=selectBuild(builds,request);
 const version=String(build.appVersion||'1.0.0').replace(/[^0-9.]/g,''),number=String(build.appBuildVersion||'').replace(/[^0-9]/g,'');
 const name='Tempo-'+version+'-Android-'+(number||build.id.slice(0,8))+'.apk';
 const output=path.join(root,name),temporary=output+'.'+crypto.randomUUID()+'.part';
 console.log('Downloading your completed Android APK...');
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(300000)});
  if(!response.ok||!response.body)throw new Error('APK download failed.');
  await pipeline(Readable.fromWeb(response.body),fs.createWriteStream(temporary,{flags:'wx'}));
  const bytes=fs.readFileSync(temporary);verifyApk(bytes);
  const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  if(fs.existsSync(output)&&crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex')!==sha256)throw new Error('A different APK with this filename already exists. It was preserved.');
  if(fs.existsSync(output))fs.unlinkSync(temporary);else fs.renameSync(temporary,output);
  fs.writeFileSync(path.join(root,'Tempo-APK-Kayit.json'),JSON.stringify({buildId:build.id,package:request.package,profile,version,versionCode:build.appBuildVersion,apkFile:name,sha256,downloadedAt:new Date().toISOString()},null,2)+'\n');
  console.log('APK READY: '+output);console.log('Send this APK to your Android phone and open it to install Tempo.');
 }finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
}
async function main(){
 const config=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo;
 if(!config.extra?.eas?.projectId||config.android?.package!=='com.floppachesscorp.tempo')throw new Error('Use your existing linked Tempo project folder. No new Expo project is created.');
 const requestPath=path.join(root,'Tempo-APK-Istek.json');
 if(process.argv[2]==='download'){
  const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
  if(request.projectId!==config.extra.eas.projectId)throw new Error('APK request belongs to a different project.');
  await download(request);return;
 }
 const guard=spawnSync(process.execPath,[path.join(root,'scripts/verify-release-a1.cjs')],{cwd:root,stdio:'inherit'});
 if(guard.status!==0)throw new Error('Android A1 source check failed.');
 const request={projectId:config.extra.eas.projectId,package:config.android.package,message:'Tempo-APK-A1-'+crypto.randomUUID(),createdAt:new Date().toISOString()};
 fs.writeFileSync(requestPath,JSON.stringify(request,null,2)+'\n');
 eas(['build','--platform','android','--profile',profile,'--wait','--message',request.message]);
 try{await download(request);}catch(error){console.error('Build completed, but download did not finish. Run Tempo-APK-Indir.bat to retry without rebuilding.');throw error;}
}
module.exports={selectBuild,verifyApk,parseEasBuildList};
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
