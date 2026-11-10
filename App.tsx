import React, { useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import {ScreenModal} from './src/ScreenModal';
import {PreparationLogo} from './src/PreparationLogo';
import {SplashScreen} from './src/SplashScreen';
import {createControlConfirmation} from './src/control-confirmation.mjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useAudioPlayer } from 'expo-audio';
import { adjust, advance, createClock, formatTime, pause, PRESETS, EXTRA_PRESETS, restore, resume, tap, TOURNAMENT_PRESETS, stageIndex, currentBonus, nextStage, allocatedTime, displayTime, modeDetail, formatPrecise, undo, TOURNAMENT_INFO } from './src/clock.mjs';
import {View as NativeView} from 'react-native';
import {createReport,reportHtml,reportSvg} from './src/report.mjs';
import type {Report} from './src/report.mjs';
import {ReportCard} from './src/ReportCard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library/legacy';
import {createExportGate,savePhoto,PhotoPermissionError,requiresPhotoPermission} from './src/photo-export.mjs';
import {captureRef,releaseCapture} from 'react-native-view-shot';
import {MechanicalFlag} from './src/MechanicalFlag';
import {FlagFinale} from './src/FlagFinale';
import {ThemePicker} from './src/ThemePicker';
import {DEFAULT_COLORS,readPlayerColors,contrastText,blendHex} from './src/colors.mjs';
import {translate} from './src/translations.mjs';
import {readFavorites} from './src/favorites.mjs';
import type {Favorite} from './src/favorites.mjs';
import {I18nProvider,Text,Pressable,TextInput,Switch,View} from './src/i18n';
import type { Clock, Config, Mode, Player, Stage } from './src/clock.mjs';

type Preferences = { dark: boolean; sound: boolean; haptics: boolean; flat: boolean; precision: boolean; finale: boolean; playerColors:[string,string];language:'tr'|'en' };
type Tab = 'presets' | 'simul' | 'tournament' | 'appearance';
const STORAGE = 'tempo-clock-animated-v1';
const LIGHT = { bg:'#F1ECE4', ink:'#282C41', muted:'#7B7480', surface:'#FAF7F2', line:'#D9CDCA', live:'#44374F', liveInk:'#FFF4E5', liveMuted:'#D4C5D9', liveMetal:'#ECB887', idle:'#E8E4F0', danger:'#A73135', dangerBg:'#F3DBD6', accent:'#9A583F', metal:'#BD805B', panel0:'#F4E9DC', panel1:'#E9E6F2' };
const DARK = { bg:'#0C1418', ink:'#F2E9DD', muted:'#A09AAB', surface:'#18262C', line:'#30414A', live:'#EBDDC7', liveInk:'#292233', liveMuted:'#675974', liveMetal:'#9A6045', idle:'#222339', danger:'#FFAB98', dangerBg:'#402330', accent:'#9DE34E', metal:'#4BBEE4', panel0:'#18262C', panel1:'#16232B' };
const MONO = Platform.OS==='ios'?'Menlo':Platform.OS==='android'?'monospace':'Courier New';
const SERIF = Platform.OS==='android'?'serif':'Georgia';
const now = () => performance.now();

export default function App() {
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><ClockApp /></SafeAreaProvider>;
}

function ClockApp() {
  useKeepAwake();
  const [clock, setClock] = useState<Clock>(() => createClock(PRESETS[3]));
  const clockRef = useRef(clock);
  const controlConfirmation = useRef(createControlConfirmation());
  const [faceSizes,setFaceSizes]=useState([{width:0,height:0},{width:0,height:0}]);
  const [prefs, setPrefs] = useState<Preferences>({dark:true,sound:true,haptics:true,flat:false,precision:true,finale:true,playerColors:DEFAULT_COLORS as [string,string],language:'tr'});
  const prefsRef = useRef(prefs);
  const [animateFinish,setAnimateFinish]=useState(false);
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(true);
  const [initialSetup, setInitialSetup] = useState(true);
  const [tab, setTab] = useState<Tab>('presets');
  const [resetDialog, setResetDialog] = useState(false);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [splashDone,setSplashDone]=useState(false);
  const [photoReport,setPhotoReport]=useState<Report|null>(null);
  const [exportMessage,setExportMessage]=useState('');
  const exportGate=useRef(createExportGate());
  const reportLayout=useRef<((size:{width:number;height:number})=>void)|null>(null);
  const [exportBusy,setExportBusy]=useState(false);
  const [exportError,setExportError]=useState('');
  const [privacyOpen,setPrivacyOpen]=useState(false);
  const [policyOpen,setPolicyOpen]=useState(false);
  const reportRef=useRef<NativeView>(null);
  const settingsScrollRef=useRef<ScrollView>(null);
  const tournamentY=useRef(0);
  const [favorites,setFavorites]=useState<Favorite[]>([]);
  const favoritesRef=useRef<Favorite[]>([]);
  const [favoriteName,setFavoriteName]=useState('');
  const [favoriteMessage,setFavoriteMessage]=useState('');
  const [periods,setPeriods]=useState('5');
  const [blockMoves,setBlockMoves]=useState('25');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [minutes0, setMinutes0] = useState('60');
  const [minutes1, setMinutes1] = useState('20');
  const [bonus0, setBonus0] = useState('0');
  const [bonus1, setBonus1] = useState('0');
  const [mode, setMode] = useState<Mode>('fischer');
  const [customStandard, setCustomStandard] = useState(false);
  const [tBase,setTBase]=useState('90');
  const [tBonus,setTBonus]=useState('30');
  const [tMove,setTMove]=useState('40');
  const [tAdd,setTAdd]=useState('30');
  const [tNextBonus,setTNextBonus]=useState('30');
  const [third,setThird]=useState(false);
  const [tMove3,setTMove3]=useState('60');
  const [tAdd3,setTAdd3]=useState('15');
  const [tBonus3,setTBonus3]=useState('30');
  const lastTap = useRef(-Infinity);
  const lastCheckpoint = useRef(0);
  const writes = useRef<Promise<unknown>>(Promise.resolve());
  const click = useAudioPlayer(require('./assets/click.wav'));
  const flag = useAudioPlayer(require('./assets/flag.wav'));
  const {width,height} = useWindowDimensions();
  const landscape = width > height;
  const c = prefs.dark ? DARK : LIGHT;

  function save(s = clockRef.current, p = prefsRef.current) {
    const payload = JSON.stringify({version:1,clock:s,prefs:p,favorites:favoritesRef.current});
    writes.current = writes.current.then(() => AsyncStorage.setItem(STORAGE,payload)).catch(() => {
      setNotice('Bu cihazda kayıt yapılamadı. Saat çalışmaya devam ediyor.');
    });
  }
  function commit(s: Clock, persist = true) {
    const old = clockRef.current;
    clockRef.current = s;
    if(s.status!=='running')controlConfirmation.current.reset();
    setClock(s);
    if(s.status!=='finished' && old.status==='finished')setAnimateFinish(false);
    if (s.status === 'finished' && old.status !== 'finished') {
      setAnimateFinish(true);
      if (prefsRef.current.haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(()=>{});
      if (prefsRef.current.sound) void flag.seekTo(0).then(()=>flag.play()).catch(()=>{});
      save(s);
    } else {
      for(const player of [0,1] as Player[]) {
        if(stageIndex(s,player)>stageIndex(old,player) && s.config === old.config) {
          const stage=s.config.stages?.[stageIndex(s,player)-1];
          if(stage) setNotice(`${player===0?'Beyaz':'Siyah'} ${stage.afterMoves}. hamleyi tamamladı. +${stage.addMs[player]/60000} dakika eklendi.`);
        }
      }
      if(persist) save(s);
    }
  }

  useEffect(()=>{if(Platform.OS==='web' && typeof document!=='undefined'){document.documentElement.lang=prefs.language;document.title=prefs.language==='en'?'Tempo · Chess Clock':'Tempo · Satranç Saati';}},[prefs.language]);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE).then(raw => {
      if (!alive || !raw) return;
      try {
        const data = JSON.parse(raw);
        if (data.version !== 1) return;
        const loadedFavorites=readFavorites(data.favorites);favoritesRef.current=loadedFavorites;setFavorites(loadedFavorites);
        const restored = restore(data.clock,now());
        if (restored) {
          clockRef.current = restored; setClock(restored);
          if (restored.status === 'paused') setNotice('Önceki maç duraklatılmış olarak açıldı.');
        }
        if (data.prefs && ['dark','sound','haptics'].every(k => typeof data.prefs[k] === 'boolean')) {
          const loaded={...prefsRef.current,...data.prefs,flat:typeof data.prefs.flat==='boolean'?data.prefs.flat:false,precision:typeof data.prefs.precision==='boolean'?data.prefs.precision:true,finale:typeof data.prefs.finale==='boolean'?data.prefs.finale:true,playerColors:readPlayerColors(data.prefs.playerColors) as [string,string],language:data.prefs.language==='en'?'en':'tr'};
          prefsRef.current = loaded; setPrefs(loaded);
        }
      } catch { setNotice('Kayıt okunamadı. Yeni bir saat hazır.'); }
    }).catch(() => { if(alive) setNotice('Kayıt açılamadı. Yeni bir saat hazır.'); }).finally(() => { if(alive) setReady(true); });
    return () => { alive = false; };
  },[]);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      if(clockRef.current.status === 'running') {
        const t = now();
        const checkpoint = t-lastCheckpoint.current >= 1000;
        if(checkpoint) lastCheckpoint.current=t;
        commit(advance(clockRef.current,t),checkpoint);
      }
    },50);
    const listener = AppState.addEventListener('change',state => {
      if (state !== 'active') {
        const s = pause(clockRef.current,now());
        if (clockRef.current.status === 'running' && s.status === 'paused') setNotice('Uygulamadan çıkıldığı için saat duraklatıldı.');
        commit(s);
      }
    });
    return () => {clearInterval(timer); listener.remove();};
  },[ready,flag]);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress',() => {
      if (settings || historyOpen) {closeOverlay();return true;}
      if (clockRef.current.status === 'running') {commit(pause(clockRef.current,now()));return true;}
      return false;
    });
    return () => listener.remove();
  },[settings,historyOpen,privacyOpen,policyOpen,exportBusy,flag]);

  function pressClock(player: Player) {
    if (!ready) return;
    const t = now();
    if (t-lastTap.current < 180) return;
    const old = clockRef.current;
    const s = tap(old,player,t);
    if (s.active !== old.active || s.status !== old.status) {
      controlConfirmation.current.reset();
      lastTap.current=t; setNotice(''); commit(s);
      if(prefsRef.current.haptics) void Haptics.selectionAsync().catch(()=>{});
      if(prefsRef.current.sound && s.status !== 'finished') void click.seekTo(0).then(()=>click.play()).catch(()=>{});
    } else commit(s,false);
  }
  function togglePause() {
    const s = clockRef.current;
    if(s.status === 'running') commit(pause(s,now()));
    else if(s.status === 'paused') {setNotice('');commit(resume(s,now()));}
    else if(s.status === 'idle') pressClock(1);
  }
  function guardedControl(id:string, action:()=>void) {
    if(controlConfirmation.current.accept(clockRef.current.status,id,now()))action();
  }
  function openSettings() {
    commit(pause(clockRef.current,now()));
    const config = clockRef.current.config;
    setTab(config.kind === 'simul' ? 'simul':config.kind==='tournament'?'tournament':'presets');
    if(config.kind==='tournament' && config.stages?.length) {
      setTBase(String(config.baseMs[0]/60000));setTBonus(String(config.bonusMs[0]/1000));
      setTMove(String(config.stages[0].afterMoves));setTAdd(String(config.stages[0].addMs[0]/60000));setTNextBonus(String(config.stages[0].bonusMs[0]/1000));
      setThird(config.stages.length>1);
      if(config.stages[1]){setTMove3(String(config.stages[1].afterMoves));setTAdd3(String(config.stages[1].addMs[0]/60000));setTBonus3(String(config.stages[1].bonusMs[0]/1000));}
    }
    if(config.kind === 'simul') {
      setMinutes0(String(config.baseMs[0]/60000));setMinutes1(String(config.baseMs[1]/60000));
      setBonus0(String(config.bonusMs[0]/1000));setBonus1(String(config.bonusMs[1]/1000));setMode(config.mode);
    }
    const advanced=['bronstein','hourglass','byoyomi','canadian'].includes(config.mode);
    if(advanced){setMinutes0(String(config.baseMs[0]/60000));setMinutes1(String(config.baseMs[1]/60000));setBonus0(String((config.overtime?.periodMs[0] ?? config.bonusMs[0])/1000));setBonus1(String((config.overtime?.periodMs[1] ?? config.bonusMs[1])/1000));setMode(config.mode);setPeriods(String(config.overtime?.periods ?? 5));setBlockMoves(String(config.overtime?.moves ?? 25));}
    setFavoriteMessage('');setError(''); setCustomStandard(advanced);setSettings(true);
  }
  function closeSettings() {
    setInitialSetup(false);setSettings(false);setPrivacyOpen(false);setPolicyOpen(false);
  }
  function closeOverlay() {
    if(exportBusy)return;
    if(policyOpen){setPolicyOpen(false);return;}
    if(privacyOpen){setPrivacyOpen(false);return;}
    if(historyOpen){setHistoryOpen(false);return;}
    closeSettings();
  }
  function apply(config: Config) {
    setNotice('');lastTap.current=-Infinity;commit(createClock(config,now()));closeSettings();setError('');
  }
  function updatePrefs(key: Exclude<keyof Preferences,'playerColors'|'language'>, value: boolean) {
    const p = {...prefsRef.current,[key]:value};
    prefsRef.current=p;setPrefs(p);save(clockRef.current,p);
  }
  function updateColors(playerColors:[string,string]) {
    const next={...prefsRef.current,playerColors};prefsRef.current=next;setPrefs(next);save(clockRef.current,next);
  }
  function makeCustom(kind:'standard'|'simul'):Config|null {
    const go=mode==='byoyomi'||mode==='canadian';
    const values=[minutes0,minutes1,...(mode==='none'||mode==='hourglass'?['0','0']:[bonus0,bonus1]),...(mode==='byoyomi'?[periods]:mode==='canadian'?[blockMoves]:[])].map(v=>v.trim().replace(',','.'));
    if(values.some(v=>!/^\d+(\.\d+)?$/.test(v))) {setError('Süreleri sayı olarak gir. Örnek: 20 veya 2,5.');return null;}
    const [m0,m1,b0,b1,count]=values.map(Number);
    if(m0<(go?0:1/60)||m0>1440||m1<(go?0:1/60)||m1>1440||b0>(go?3600:600)||b1>(go?3600:600)||
      (go && (b0<1||b1<1||!Number.isInteger(count)||count<1||count>(mode==='byoyomi'?99:999)))) {
      setError(go?'Ana süre 0–1440 dakika; periyot 1–3600 saniye. Periyot sayısı 1–99, blok hamlesi 1–999 olmalı.':'Ana süre 1 saniye–1440 dakika; ek süre 0–600 saniye olmalı.');return null;
    }
    const labels:Record<Mode,string>={none:'Özel',fischer:'Fischer',delay:'Gecikme',bronstein:'Bronstein',hourglass:'Kum saati',byoyomi:'Byo-yomi',canadian:'Kanada'};
    setError('');
    return {kind,label:`${kind==='simul'?'Simültane':labels[mode]} · ${formatTime(Math.round(m0*60000))} / ${formatTime(Math.round(m1*60000))}`,
      baseMs:[Math.round(m0*60000),Math.round(m1*60000)],bonusMs:go||mode==='none'||mode==='hourglass'?[0,0]:[Math.round(b0*1000),Math.round(b1*1000)],mode,incrementTiming:'before',
      ...(go?{overtime:{periodMs:[Math.round(b0*1000),Math.round(b1*1000)] as [number,number],periods:mode==='byoyomi'?count:1,moves:mode==='canadian'?count:1}}:{})};
  }
  function applyCustom(kind:'standard'|'simul'){const config=makeCustom(kind);if(config)apply(config);}
  function saveFavorite(config:Config){
    const name=favoriteName.trim();
    if(!name){setFavoriteMessage('Önce favorine bir ad ver.');return;}
    if(favoritesRef.current.length>=12){setFavoriteMessage('En fazla 12 favori. Yeni kayıt için birini kaldır.');return;}
    if(favoritesRef.current.some(f=>f.name.toLocaleLowerCase('tr')===name.toLocaleLowerCase('tr'))){setFavoriteMessage('Bu ad zaten kullanılıyor. Başka bir ad seç.');return;}
    const next=[...favoritesRef.current,{id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,name,config:JSON.parse(JSON.stringify(config))}];favoritesRef.current=next;setFavorites(next);setFavoriteName('');setFavoriteMessage('Favori kaydedildi.');save();
  }
  function removeFavorite(id:string){const next=favoritesRef.current.filter(f=>f.id!==id);favoritesRef.current=next;setFavorites(next);setFavoriteMessage('Favori kaldırıldı.');save();}
  function favoriteForm(config?:Config,kind?:'standard'|'simul'){
    return <View style={{gap:10,marginTop:18,marginBottom:14}}><Text style={{color:c.muted,fontSize:12}}>Favori adı</Text><TextInput testID={kind?'custom-favorite-name':'favorite-name'} accessibilityLabel="Favori adı" value={favoriteName} onChangeText={v=>{setFavoriteName(v);setFavoriteMessage('');}} maxLength={40} placeholder="Örn. Kulüp akşamı" placeholderTextColor={c.muted} style={[styles.input,{color:c.ink,backgroundColor:c.surface,borderColor:c.line,fontSize:16}]}/>{button('Favorilere kaydet',()=>{const conf=config ?? (kind?makeCustom(kind):null);if(conf)saveFavorite(conf);},false,false,kind?'save-custom-favorite':'save-favorite')}{!!favoriteMessage&&<Text testID="favorite-message" accessibilityLiveRegion="polite" style={{color:c.metal,fontSize:12}}>{favoriteMessage}</Text>}</View>;
  }
  function changeLanguage(language:'tr'|'en'){const p={...prefsRef.current,language};prefsRef.current=p;setPrefs(p);save(clockRef.current,p);}
  function applyTournament() {
    const values=[tBase,tBonus,tMove,tAdd,tNextBonus,...(third?[tMove3,tAdd3,tBonus3]:[])].map(v=>v.trim().replace(',','.'));
    if(values.some(v=>!/^\d+(\.\d+)?$/.test(v))) {setError('Bütün aşamaları sayıyla doldur.');return;}
    const [base,bonus,move,add,nextBonus,move3,add3,bonus3]=values.map(Number);
    if(base<1/60 || base>1440 || add<1/60 || add>1440 || bonus>600 || nextBonus>600 || !Number.isInteger(move) || move<1 || move>999 ||
      (third && (!Number.isInteger(move3) || move3<=move || move3>999 || add3<1/60 || add3>1440 || bonus3>600))) {
      setError('Ana süre ve ek dakika 1 saniye–1440 dakika olmalı. Hamleler 1–999 arasında ve artan sırada; ek saniye 0–600 olmalı.');return;
    }
    const stages:Stage[]=[{afterMoves:move,addMs:[Math.round(add*60000),Math.round(add*60000)],bonusMs:[Math.round(nextBonus*1000),Math.round(nextBonus*1000)]}];
    if(third) stages.push({afterMoves:move3,addMs:[Math.round(add3*60000),Math.round(add3*60000)],bonusMs:[Math.round(bonus3*1000),Math.round(bonus3*1000)]});
    apply({kind:'tournament',label:`${base} dk · ${move} → +${add}${third?` · ${move3} → +${add3}`:''}`,baseMs:[Math.round(base*60000),Math.round(base*60000)],bonusMs:[Math.round(bonus*1000),Math.round(bonus*1000)],mode:'fischer',incrementTiming:'before',stages});
  }
  function editTournament(config:Config) {
    if(!config.stages?.length){
      setTab('presets');setCustomStandard(true);setMinutes0(String(config.baseMs[0]/60000));setMinutes1(String(config.baseMs[1]/60000));setBonus0(String(config.bonusMs[0]/1000));setBonus1(String(config.bonusMs[1]/1000));setMode(config.mode);setError('');settingsScrollRef.current?.scrollTo({y:0,animated:true});return;
    }
    const first=config.stages![0],second=config.stages?.[1];
    setTBase(String(config.baseMs[0]/60000));setTBonus(String(config.bonusMs[0]/1000));setTMove(String(first.afterMoves));setTAdd(String(first.addMs[0]/60000));setTNextBonus(String(first.bonusMs[0]/1000));
    setThird(Boolean(second));if(second){setTMove3(String(second.afterMoves));setTAdd3(String(second.addMs[0]/60000));setTBonus3(String(second.bonusMs[0]/1000));}
    setError('');settingsScrollRef.current?.scrollTo({y:tournamentY.current,animated:true});
  }
  async function exportPdf() {
    await exportGate.current.run(async()=>{
    setExportError('');setExportMessage('');
    const report=createReport(clockRef.current,prefs.language);
    if(Platform.OS==='web') {
      const popup=window.open('','_blank');
      if(!popup){setExportError('Yazdırma penceresi açılamadı. Açılır pencerelere izin ver.');return;}
      popup.document.write(reportHtml(report));popup.document.close();
      await popup.document.fonts.ready;
      popup.focus();popup.print();
      setNotice('Yazdırma ekranında PDF olarak kaydet seçeneğini kullan.');return;
    }
    setExportBusy(true);
    try {
      if(!await Sharing.isAvailableAsync())throw new Error('sharing unavailable');
      const {uri}=await Print.printToFileAsync({html:reportHtml(report)});
      await Sharing.shareAsync(uri,{mimeType:'application/pdf',UTI:'com.adobe.pdf',dialogTitle:translate('PDF raporu',prefs.language),anchor:{x:width/2,y:height/2,width:1,height:1}});
    } catch {setExportError('Dışa aktarma açılamadı. Tekrar dene.');}
    finally {setExportBusy(false);}
    });
  }
  async function exportImage() {
    await exportGate.current.run(async()=>{
      const report=createReport(clockRef.current,prefs.language);
      setExportError('');setExportMessage('');setExportBusy(true);
      try {
        if(Platform.OS==='web') {
          const url=URL.createObjectURL(new Blob([reportSvg(report)],{type:'image/svg+xml'}));
          try {
            const image=new window.Image();image.src=url;await image.decode();
            const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
            const context=canvas.getContext('2d');if(!context)throw new Error('canvas unavailable');context.drawImage(image,0,0);
            const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('png unavailable')),'image/png'));
            const pngUrl=URL.createObjectURL(blob);const link=document.createElement('a');link.href=pngUrl;link.download='Tempo-Mac-Ozeti.png';link.click();setTimeout(()=>URL.revokeObjectURL(pngUrl),1000);
          } finally {URL.revokeObjectURL(url);}
          setExportMessage('Resim indirildi.');
        } else {
          await savePhoto({
            permission:async()=>{
              if(!requiresPhotoPermission(Platform.OS,Number(Platform.Version)))return true;
              const permissions=Platform.OS==='ios'?['photo' as const]:[];
              const permission=await MediaLibrary.getPermissionsAsync(true,permissions);
              if(permission.granted)return true;
              if(!permission.canAskAgain)return false;
              return (await MediaLibrary.requestPermissionsAsync(true,permissions)).granted;
            },
            capture:async()=>{
              // Mount the card in the existing history window, behind its opaque content.
              // Wait for native layout, then allow the updated text to paint before capturing.
              await new Promise<{width:number;height:number}>((resolve,reject)=>{
                const timeout=setTimeout(()=>{reportLayout.current=null;reject(new Error('Report layout timed out'));},5000);
                reportLayout.current=size=>{clearTimeout(timeout);reportLayout.current=null;resolve(size);};
                setPhotoReport(report);
              });
              await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
              if(!reportRef.current)throw new Error('Report unavailable');
              // renderInContext captures natural bounds at the device pixel scale.
              // Explicit dimensions would enlarge the canvas without scaling this iOS layer.
              return captureRef(reportRef,{format:'png',quality:1,result:'tmpfile',useRenderInContext:Platform.OS==='ios'});
            },
            save:async uri=>{
              if(Platform.OS==='android'&&!requiresPhotoPermission('android',Number(Platform.Version))) {
                // SDK 57's modern Android API writes our own image with scoped storage.
                const {Asset}=await import('expo-media-library');
                await Asset.create(uri);
              } else await MediaLibrary.saveToLibraryAsync(uri);
            },
            release:releaseCapture
          });
          setExportMessage(Platform.OS==='android'?'Resim galeriye kaydedildi.':'Resim Fotoğraflar’a kaydedildi.');
        }
      } catch(error) {
        setExportError(error instanceof PhotoPermissionError?(Platform.OS==='android'?'Kaydetmek için depolama izni gerekiyor. Cihaz Ayarlar > Tempo > İzinler bölümünden izin verebilirsin.':'Kaydetmek için Fotoğraflar’a ekleme izni gerekiyor. iPhone Ayarlar > Tempo > Fotoğraflar bölümünden izin verebilirsin.'):'Resim kaydedilemedi. Tekrar dene.');
      } finally {setPhotoReport(null);setExportBusy(false);}
    });
  }
  const roles = clock.config.kind === 'simul' ? ['Gösterici','Rakip']:['Beyaz','Siyah'];
  const controlsDisabled = !ready || clock.status === 'finished';
  const timeFont = Math.max(40,Math.min(landscape ? height*.24:width*.23,Math.min(width,height)>=600?180:110));

  const widePrepareHeader = width >= 680;
  const prepareLogoWidth = widePrepareHeader ? 288 : Math.min(220,Math.max(100,(width-44)*.4));

  function languagePicker(){
    return <View testID="language-picker" style={{flexDirection:'row',alignItems:'stretch',alignSelf:'stretch',gap:widePrepareHeader?6:4,flexShrink:0}}>
      {(['tr','en'] as const).map(language=><Pressable key={language} testID={`language-${language}`} accessibilityRole="button" accessibilityLabel={language==='tr'?'Türkçe':'English'} accessibilityState={{selected:prefs.language===language}} onPress={()=>changeLanguage(language)} style={{minHeight:44,minWidth:44,paddingHorizontal:widePrepareHeader?12:5,paddingVertical:7,borderRadius:8,borderWidth:1,borderColor:prefs.language===language?c.ink:c.line,backgroundColor:prefs.language===language?c.ink:c.surface,justifyContent:'center',alignItems:'center'}}><Text style={{fontSize:widePrepareHeader?11:9,fontWeight:'600',color:prefs.language===language?c.bg:c.ink}}>{language==='tr'?'Türkçe':'English'}</Text></Pressable>)}
    </View>;
  }

  function panel(player: Player) {
    const availableWidth = faceSizes[player].width ? faceSizes[player].width-36:(landscape ? (width-220)/2 : width-24)-44;
    const remaining=displayTime(clock,player);
    const display=prefs.precision && remaining<=20000 ? formatPrecise(remaining):formatTime(remaining);
    const halfHeight=faceSizes[player].height || (landscape ? height-160:(height-190)/2);
    const compact=halfHeight<310;
    const panelTimeFont = Math.max(20,Math.min(timeFont, availableWidth/(display.length*.62),Math.max(20,halfHeight-(compact?120:165))));
    const active = clock.active === player && clock.status === 'running';
    const flagged = clock.flagged === player;
    const background = flagged ? c.dangerBg:active || clock.status==='idle'?prefs.playerColors[player]:blendHex(prefs.playerColors[player],c.bg,prefs.dark?.18:.27);
    const ink = flagged ? c.danger:contrastText(background);
    const faceMetal=active || clock.status==='idle'?blendHex(ink,background,.6):c.metal;
    const faceMuted=blendHex(ink,background,.65);
    const next=nextStage(clock,player);
    const stageCount=(clock.config.stages?.length ?? 0)+1;
    const canTap = ready && (clock.status === 'idle' || (clock.status === 'running' && clock.active === player));
    const label = flagged ? 'BAYRAK DÜŞTÜ':clock.status === 'finished' ? 'RAKİBİN SÜRESİ DOLDU':clock.status === 'paused' ? 'DURAKLATILDI':active ? 'SIRA SENDE':clock.status === 'idle' ? 'BAŞLAMAYA HAZIR':'RAKİP OYNUYOR';
    return <Pressable testID={`clock-${player}`} onLayout={({nativeEvent:{layout}})=>setFaceSizes(old=>{if(old[player].width===layout.width && old[player].height===layout.height)return old;const next=[...old];next[player]={width:layout.width,height:layout.height};return next;})} accessibilityRole="button" accessibilityLabel={`${roles[player]}, ${formatTime(remaining)}. ${label}`} accessibilityState={{disabled:!canTap}} disabled={!canTap} onPress={()=>pressClock(player)} onPressIn={Platform.OS==='web'?undefined:()=>pressClock(player)} style={({pressed})=>[styles.panel,{backgroundColor:background,borderColor:active?faceMetal:c.line,boxShadow:active?`0 0 18px ${c.metal}30`:'none',opacity:pressed?.9:1}]}>
      <View style={[styles.panelContent,{padding:compact?12:18,minHeight:compact?145:185},flagged && prefs.finale && {padding:0}, player===1 && !prefs.flat && {transform:[{rotate:'180deg'}]}]}>
        {flagged && prefs.finale ? <FlagFinale player={player} role={roles[player]} otherRole={roles[1-player]} width={faceSizes[player].width || availableWidth+36} height={halfHeight} animate={animateFinish} /> : <><View style={styles.panelTop}><View style={styles.roleGroup}><View style={[styles.roleNumber,{borderColor:faceMetal,backgroundColor:active?faceMetal:'transparent'}]}><Text style={{color:active?background:faceMetal,fontFamily:MONO,fontSize:14}}>{player===0?'01':'02'}</Text></View><View><Text style={[styles.role,{color:ink}]}>{roles[player]}</Text><Text style={[styles.moves,{color:faceMuted}]}>{clock.moves[player]} hamle · {stageCount>1?`Aşama ${stageIndex(clock,player)+1}/${stageCount}`:'Tek süre'}</Text></View></View><MechanicalFlag dropped={flagged} compact={compact} player={player} metal={faceMetal} muted={faceMuted}/></View>
        <View style={styles.timeBlock}><Text testID={`time-${player}`} adjustsFontSizeToFit numberOfLines={1} style={[styles.time,{color:clock.status==='running'&&!active?faceMuted:ink,fontSize:panelTimeFont,fontWeight:active?'500':'400',letterSpacing:-panelTimeFont*.02}]}>{display}</Text>
          <View testID={`turn-state-${player}`} style={[styles.turnBadge,{backgroundColor:active?ink:'transparent',paddingVertical:compact?4:6}]}>{active && <View style={[styles.turnDot,{backgroundColor:background}]} />}<Text style={[styles.stateLabel,{color:active?background:ink,fontSize:compact?8:10}]}>{label}</Text></View>
          {(!compact || clock.overtime || clock.config.mode==='bronstein' || clock.config.mode==='hourglass') && <Text testID={`mode-detail-${player}`} numberOfLines={1} adjustsFontSizeToFit style={[styles.detail,{color:ink,fontSize:compact?9:12}]}>{modeDetail(clock,player)}</Text>}
        </View>
        <View style={styles.faceFooter}>{!compact && <View style={styles.scaleTicks}>{Array.from({length:17},(_,i)=><View key={i} style={{width:1,height:i%4===0?9:4,backgroundColor:faceMetal,opacity:i%4===0?.8:.35}} />)}</View>}
          <View style={[styles.progressTrack,{backgroundColor:active?faceMetal+'35':c.line}]}><View style={[styles.progress,{backgroundColor:faceMetal,width:`${Math.min(100,remaining/Math.max(1,allocatedTime(clock,player))*100)}%`}]} /></View>
          <Text testID={`phase-${player}`} style={[styles.phaseHint,{color:faceMuted}]}>{next?`${next.afterMoves}. hamleye ${next.afterMoves-clock.moves[player]} hamle · +${next.addMs[player]/60000} dk`:stageCount>1?'Son aşama · maç sonuna kadar':active?'● Saat çalışıyor':'TEMPO / SATRANÇ SAATİ'}</Text>
        </View></>}
      </View>
    </Pressable>;
  }
  function button(label:string, onPress:()=>void, primary=false, disabled=false, id?:string) {
    return <Pressable testID={id} accessibilityRole="button" accessibilityHint={clock.status==='running'&&id&&['reset','pause','settings'].includes(id)?'Saat çalışırken bu düğmeye iki kez hızlıca dokun.':undefined} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.button,{backgroundColor:primary?c.ink:c.surface,borderColor:c.line,opacity:disabled?.4:pressed?.75:1}]}><Text style={[styles.buttonText,{color:primary?c.bg:c.ink}]}>{label}</Text></Pressable>;
  }
  function numeric(label:string, value:string, setter:(s:string)=>void, id:string) {
    return <View style={styles.field}><Text style={[styles.fieldLabel,{color:c.muted}]}>{label}</Text><TextInput testID={id} accessibilityLabel={label} value={value} onChangeText={setter} keyboardType="decimal-pad" selectTextOnFocus maxLength={8} style={[styles.input,{color:c.ink,backgroundColor:c.surface,borderColor:c.line}]} /></View>;
  }
  function customForm(kind:'standard'|'simul') {
    return <View style={styles.custom}>
      <Text style={[styles.sectionTitle,{color:c.ink}]}>{kind==='simul'?'Her masaya kendi dengesi.':'Kendi zaman kontrolün.'}</Text>
      <Text style={[styles.explanation,{color:c.muted}]}>{kind==='simul'?'Her masada bir telefon. Gösterici ve rakip için ana süreyi ve hamle başına süreyi ayrı seç.':'İki oyuncuya eşit veya farklı süre ver.'}</Text>
      <View style={styles.formRow}>{numeric(`${kind==='simul'?'Gösterici':'Beyaz'} · dakika`,minutes0,setMinutes0,'minutes-0')}{numeric(`${kind==='simul'?'Rakip':'Siyah'} · dakika`,minutes1,setMinutes1,'minutes-1')}</View>
      <Text style={[styles.fieldLabel,{color:c.muted}]}>Zaman kontrolü</Text>
      <View style={[styles.formRow,{flexWrap:'wrap'}]}>{(['none','fischer','delay','bronstein','hourglass','byoyomi','canadian'] as Mode[]).map(m=><Pressable key={m} testID={`mode-${m}`} onPress={()=>{setMode(m);setError('');if(m==='byoyomi'||m==='canadian'){if(Number(bonus0)<1)setBonus0(m==='byoyomi'?'30':'300');if(Number(bonus1)<1)setBonus1(m==='byoyomi'?'30':'300');}else if(m==='bronstein' && Number(bonus0)===0){setBonus0('3');setBonus1('3');}}} accessibilityRole="button" accessibilityState={{selected:mode===m}} style={[styles.mode,{minWidth:90,flexBasis:'29%',backgroundColor:mode===m?c.ink:c.surface,borderColor:c.line}]}><Text style={{color:mode===m?c.bg:c.ink,fontSize:12,fontWeight:'600'}}>{{none:'Ek süresiz',fischer:'Fischer',delay:'Gecikme',bronstein:'Bronstein',hourglass:'Kum saati',byoyomi:'Byo-yomi',canadian:'Kanada'}[m]}</Text></Pressable>)}</View>
      {mode!=='none' && mode!=='hourglass' && <View style={styles.formRow}>{numeric(`${kind==='simul'?'Gösterici':'Beyaz'} · ${mode==='byoyomi'||mode==='canadian'?'periyot saniye':'ek saniye'}`,bonus0,setBonus0,'bonus-0')}{numeric(`${kind==='simul'?'Rakip':'Siyah'} · ${mode==='byoyomi'||mode==='canadian'?'periyot saniye':'ek saniye'}`,bonus1,setBonus1,'bonus-1')}</View>}
      {mode==='byoyomi'&&numeric('Periyot sayısı',periods,setPeriods,'period-count')}
      {mode==='canadian'&&numeric('Her blokta tamamlanacak hamle',blockMoves,setBlockMoves,'block-moves')}
      <Text style={[styles.explanation,{color:c.muted}]}>{{none:'Ana süreye ekleme yapılmaz.',fischer:'Fischer: Ek saniye her hamle başlamadan önce saatine eklenir.',delay:'Gecikme: Her hamlenin başında bu kadar saniye ana süreden düşmez.',bronstein:'Bronstein: Geçen sürenin en fazla gecikme kadarı hamle sonunda iade edilir. Kullanılmayan gecikme birikmez; ilk gecikme saatte baştan bulunur.',hourglass:'Kum saati: Bir oyuncunun harcadığı süre rakibine aktarılır. Toplam süre değişmez.',byoyomi:'Byo-yomi: Ana süre bitince periyotlar başlar. Her tamamlanan hamlede mevcut periyot yenilenir; kaybedilen periyot geri gelmez. Ana süreyi 0 seçebilirsin.',canadian:'Kanada: Ana süre bitince belirtilen hamle sayısını periyot süresinde tamamla. Blok tamamlanınca süre ve hamle sayısı yenilenir. Ana süreyi 0 seçebilirsin.'}[mode]}</Text>
      {!!error && <Text accessibilityRole="alert" style={{color:c.danger,marginBottom:12}}>{error}</Text>}
      {button(kind==='simul'?'Simültane saatini hazırla':'Özel saati hazırla',()=>applyCustom(kind),true,false,'apply-custom')}{favoriteForm(undefined,kind)}
    </View>;
  }

  if (!ready) return <I18nProvider locale={prefs.language}><SafeAreaView style={[styles.root,{backgroundColor:c.bg,justifyContent:'center',alignItems:'center'}]}>
    <StatusBar barStyle={prefs.dark?'light-content':'dark-content'} />
    <Text style={{color:c.muted,fontSize:16}}>Hazırlanıyor…</Text>
  </SafeAreaView></I18nProvider>;

  return <I18nProvider locale={prefs.language}><SafeAreaView style={[styles.root,{backgroundColor:c.bg}]}>
    <StatusBar barStyle={prefs.dark?'light-content':'dark-content'} />
    <View style={[styles.header,{paddingVertical:landscape?5:8},width<360 && {paddingHorizontal:16}]}><Text style={{color:c.muted,fontSize:10,letterSpacing:1.6}}>ZAMAN KONTROLÜ</Text><Pressable onPress={openSettings} disabled={!ready} accessibilityRole="button" accessibilityLabel="Süre ayarlarını aç" style={[styles.presetBadge,{borderColor:c.line}]}><Text numberOfLines={2} style={{color:c.ink,fontWeight:'600',fontSize:width<360?11:13}}>{clock.config.label}  ⌄</Text></Pressable></View>
    {!!notice && <Pressable onPress={()=>setNotice('')} style={[styles.notice,{backgroundColor:c.surface}]}><Text numberOfLines={2} style={{color:c.muted,fontSize:12}}>{notice}  ×</Text></Pressable>}
    <View style={[styles.board,landscape && styles.landscape]}>
      {panel(1)}
      <View style={[styles.controls,landscape && styles.controlsVertical]}>
        {button('↺',()=>guardedControl('reset',()=>{commit(pause(clockRef.current,now()));setResetDialog(true);}),false,!ready,'reset')}
        {button(!ready?'Hazırlanıyor…':clock.status==='idle'?`${roles[0]} başlasın`:clock.status==='running'?'Ⅱ  Duraklat':clock.status==='paused'?'▶  Devam':'Süre doldu',()=>guardedControl('pause',togglePause),true,controlsDisabled,'pause')}
        {button('Ayarlar',()=>guardedControl('settings',openSettings),false,!ready,'settings')}
      </View>
      {panel(0)}
    </View>
    <Pressable testID="history" accessibilityRole="button" onPress={()=>{commit(pause(clockRef.current,now()));setExportError('');setExportMessage('');setHistoryOpen(true);}} style={styles.historyLink}><Text style={{color:c.metal,fontSize:11,letterSpacing:1}}>HAMLE DEFTERİ  /  {(clock.history ?? []).length} KAYIT</Text></Pressable>
    <Text style={[styles.footer,{color:c.muted}]}>{clock.status==='idle'?'İkinci oynayan kendi alanına dokunarak saati başlatır.':clock.status==='running'?'Saat alanları tek dokunuşla, ortadaki düğmeler çift dokunuşla çalışır.':clock.status==='paused'?'Devam’a dokunarak kaldığın yerden sürdür.':'Yeni maç için ↺ düğmesine dokun.'}</Text>

    <ScreenModal testID={historyOpen?"history-modal":privacyOpen?"privacy-modal":"settings-modal"} backgroundColor={c.bg} visible={settings || historyOpen} animationType={initialSetup?'none':'slide'} onRequestClose={closeOverlay}>
      {settings && !privacyOpen && <>
        <View testID="prepare-header" style={{width:'100%',maxWidth:1040,alignSelf:'center',paddingHorizontal:width<360?14:22,paddingTop:landscape?10:18,paddingBottom:18}}>
          <View testID="prepare-header-layout" style={{flexDirection:'row',alignItems:'stretch',gap:widePrepareHeader?20:width<360?10:12}}>
            <PreparationLogo width={prepareLogoWidth} compact={!widePrepareHeader}/>
            <View testID="prepare-heading" style={{flex:1,minWidth:0,gap:8}}>
              <View testID="prepare-title-row" style={{minHeight:44,flexDirection:'row',alignItems:'stretch',gap:widePrepareHeader?12:6}}>
                <Text testID="prepare-title" numberOfLines={1} adjustsFontSizeToFit style={[styles.pageTitle,{flex:1,minWidth:0,alignSelf:'center',color:c.ink,fontSize:widePrepareHeader?28:width<360?17:20,lineHeight:widePrepareHeader?36:28,letterSpacing:-.6}]}>Saati Hazırla</Text>
                <Pressable testID="close-settings" accessibilityRole="button" onPress={closeSettings} style={[styles.button,{minHeight:44,minWidth:widePrepareHeader?78:44,paddingVertical:10,paddingHorizontal:widePrepareHeader?16:6,backgroundColor:c.surface,borderColor:c.line}]}><Text style={[styles.buttonText,{color:c.ink,fontSize:widePrepareHeader?13:11}]}>Kapat</Text></Pressable>
              </View>
              <View testID="prepare-subtitle-row" style={{minHeight:44,flexDirection:'row',alignItems:'stretch',gap:widePrepareHeader?12:6}}>
                <Text testID="prepare-subtitle" style={{flex:1,minWidth:0,alignSelf:'center',color:c.muted,fontSize:widePrepareHeader?12:10,lineHeight:widePrepareHeader?18:14}}>Bir sonraki maçın ritmi.</Text>
                {languagePicker()}
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.tabs,{width:'100%',maxWidth:1040,alignSelf:'center'}]}>{([['presets','Süreler'],['simul','Simültane'],['tournament','Turnuva'],['appearance','Tema']] as [Tab,string][]).map(([t,label])=><Pressable key={t} testID={`tab-${t}`} accessibilityRole="button" accessibilityState={{selected:tab===t}} onPress={()=>{setTab(t);setError('');}} style={[styles.tab,{backgroundColor:tab===t?c.ink:c.surface}]}><Text style={{color:tab===t?c.bg:c.ink,fontWeight:'600',fontSize:width<360?10:12}} numberOfLines={1}>{label}</Text></Pressable>)}</View>
        <ScrollView ref={settingsScrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.settingsBody,{width:'100%',maxWidth:1040,alignSelf:'center'}]}>
          {clock.status!=='idle' && <Text style={[styles.explanation,{color:c.danger}]}>Yeni süre seçmek mevcut maçı sıfırlar. Kapat ile maça dönebilirsin.</Text>}
          {tab==='presets' && <>{favorites.length>0&&<View style={{marginBottom:20,gap:10}}><Text style={[styles.sectionTitle,{color:c.ink}]}>Favori tempolar</Text>{favorites.map(f=><View key={f.id} style={{flexDirection:'row',gap:8,alignItems:'center'}}><Pressable testID={`favorite-use-${f.id}`} accessibilityRole="button" onPress={()=>apply(f.config)} style={{flex:1,padding:14,backgroundColor:c.surface,borderRadius:10,borderWidth:1,borderColor:c.line}}><Text translate={false} style={{color:c.ink,fontWeight:'600'}}>{f.name}</Text><Text style={{color:c.muted,fontSize:11,marginTop:4}}>{f.config.label}</Text></Pressable><Pressable testID={`favorite-remove-${f.id}`} accessibilityRole="button" accessibilityLabel="Favoriyi kaldır" onPress={()=>removeFavorite(f.id)} style={{width:48,height:48,alignItems:'center',justifyContent:'center',borderRadius:8,backgroundColor:c.surface}}><Text style={{color:c.danger,fontSize:20}}>×</Text></Pressable></View>)}</View>}<Text style={[styles.sectionTitle,{color:c.ink}]}>Tahtaya otur. Başla.</Text><Text style={[styles.explanation,{color:c.muted}]}>Dakika + hamle başına saniye</Text><View style={styles.grid}>{PRESETS.map((p,index)=><Pressable key={p.label} testID={`preset-${index}`} onPress={()=>apply(p)} accessibilityRole="button" accessibilityLabel={`${p.label} zaman kontrolü`} style={({pressed})=>[styles.presetTile,{width:width<420?'47%':'31%',backgroundColor:c.surface,borderColor:c.line,opacity:pressed?.7:1}]}><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.presetNumber,{color:c.ink,fontSize:width<420?24:22}]}>{p.label}</Text><Text style={[styles.presetType,{color:c.muted}]}>{index<2?'Bullet':index<6?'Blitz':index<8?'Hızlı':'Uzun'}</Text></Pressable>)}</View><View style={{gap:8,marginBottom:20}}><Text style={[styles.sectionTitle,{color:c.ink}]}>Diğer oyun saatleri</Text>{EXTRA_PRESETS.map((p,index)=><Pressable testID={`extra-preset-${index}`} key={p.mode} accessibilityRole="button" onPress={()=>apply(p)} style={{padding:14,borderRadius:10,borderWidth:1,borderColor:c.line,backgroundColor:c.surface}}><Text style={{color:c.ink,fontSize:14,fontWeight:'600'}}>{p.label}</Text></Pressable>)}<Text style={[styles.explanation,{color:c.muted,marginBottom:0}]}>Başlangıç örnekleri. Özel süre oluştur ile bütün değerleri değiştirebilirsin.</Text></View>{button('Özel süre oluştur',()=>{setCustomStandard(!customStandard);setMinutes0('5');setMinutes1('5');setBonus0('0');setBonus1('0');setMode('fischer');setFavoriteMessage('');})}{customStandard ? customForm('standard'):<View style={[styles.infoCard,{backgroundColor:c.surface}]}><Text style={{color:c.ink,fontWeight:'600'}}>Bu tempoyu kaydet</Text><Text style={[styles.explanation,{color:c.muted,marginBottom:0}]}>{clock.config.label}</Text>{favoriteForm(clock.config)}</View>}</>}
          {tab==='simul' && <><View style={[styles.simulCard,{backgroundColor:c.live}]}><Text style={[styles.simulEyebrow,{color:c.liveInk}]}>SİMÜLTANE GÖSTERİ</Text><Text style={[styles.simulHeadline,{color:c.liveInk}]}>{'Farklı roller.\nFarklı süreler.'}</Text><Text style={{color:c.liveInk,fontSize:14,lineHeight:21}}>Gösterici birden fazla masada oynarken, her masa kendi saatini kullanır.</Text></View><View style={styles.formRow}>{button('60 / 20 dk',()=>{setMinutes0('60');setMinutes1('20');setBonus0('0');setBonus1('0');setMode('none');})}{button('90 / 30 dk',()=>{setMinutes0('90');setMinutes1('30');setBonus0('0');setBonus1('0');setMode('none');})}</View>{customForm('simul')}</>}
          {tab==='tournament' && <>
            <Text style={[styles.sectionTitle,{color:c.ink}]}>Turnuva tempoları.</Text><Text style={[styles.explanation,{color:c.muted}]}>Süre dakika dolunca değil, her oyuncu kendi hamle eşiğini tamamladığında eklenir. Kalan süre korunur.</Text>
            {TOURNAMENT_PRESETS.map((preset,index)=><View key={preset.label} style={[styles.tournamentTile,{backgroundColor:c.surface,borderColor:c.line}]}>
              <Text style={{color:c.metal,fontSize:10,letterSpacing:1}}>{TOURNAMENT_INFO[index].name.toLocaleUpperCase('tr')}</Text><Text style={[styles.tournamentName,{color:c.ink}]}>{preset.label}</Text><Text style={[styles.explanation,{color:c.muted,marginBottom:0}]}>{TOURNAMENT_INFO[index].detail}</Text>
              <View style={[styles.formRow,{marginTop:8,marginBottom:0,flexWrap:'wrap'}]}>{button('Kullan',()=>apply(preset),true,false,`tournament-preset-${index}`)}{button('Düzenle',()=>editTournament(preset),false,false,`edit-tournament-${index}`)}{button('Kaynak',()=>{void Linking.openURL(TOURNAMENT_INFO[index].source).catch(()=>{});})}</View>
            </View>)}
            <Text style={[styles.explanation,{color:c.muted}]}>Resmî yönergelere dayanan dört hazır tempo. Süreleri ve ek saniyeleri Düzenle ile değiştirebilirsin.</Text>
            <View onLayout={({nativeEvent:{layout}})=>{tournamentY.current=layout.y;}} style={[styles.infoCard,{backgroundColor:c.surface}]}><Text style={[styles.sectionTitle,{color:c.ink}]}>Kendi turnuva saatin</Text>
              <Text style={[styles.stageHeading,{color:c.metal}]}>01 / BAŞLANGIÇ</Text><View style={styles.formRow}>{numeric('İlk süre · dakika',tBase,setTBase,'t-base')}{numeric('Hamle başına · saniye',tBonus,setTBonus,'t-bonus')}</View>
              <Text style={[styles.stageHeading,{color:c.metal}]}>02 / İLK SÜRE EKLEMESİ</Text><View style={styles.formRow}>{numeric('Tamamlanacak hamle',tMove,setTMove,'t-move')}{numeric('Eklenecek · dakika',tAdd,setTAdd,'t-add')}</View>{numeric('Bu aşamada hamle başına · saniye',tNextBonus,setTNextBonus,'t-next-bonus')}
              <View style={styles.preferenceRow}><Text style={{color:c.ink,flex:1}}>Üçüncü aşama</Text><Switch testID="third-stage" accessibilityLabel="Üçüncü aşama" value={third} onValueChange={setThird} trackColor={{false:c.line,true:c.accent}} /></View>
              {third && <><Text style={[styles.stageHeading,{color:c.metal}]}>03 / İKİNCİ SÜRE EKLEMESİ</Text><View style={styles.formRow}>{numeric('Toplam hamle eşiği',tMove3,setTMove3,'t-move-3')}{numeric('Eklenecek · dakika',tAdd3,setTAdd3,'t-add-3')}</View>{numeric('Son aşamada hamle başına · saniye',tBonus3,setTBonus3,'t-bonus-3')}</>}
              <Text style={[styles.explanation,{color:c.muted}]}>Örnek: 40 ve 60 eşikleri, önce 40 hamle; ardından 20 hamle daha demektir. Fischer ek saniyesi ilgili hamle başlamadan önce saatinde hazır olur.</Text>
              {!!error && <Text accessibilityRole="alert" style={{color:c.danger,marginBottom:12}}>{error}</Text>}{button('Turnuva saatini hazırla',applyTournament,true,false,'apply-tournament')}
            </View>
          </>}
          {tab==='appearance' && <><Text style={[styles.sectionTitle,{color:c.ink}]}>Masana uygun.</Text><ThemePicker colors={prefs.playerColors} roles={roles} surface={c.surface} ink={c.ink} muted={c.muted} line={c.line} onChange={updateColors}/>{([['dark','Gece görünümü','Koyu grafit zemin; seçtiğin taraf renkleri korunur.'],['finale','Bitiş animasyonu','Kaybeden oyuncunun saat alanında büyük bayrak ve sonuç sahnesi.'],['flat','Masaüstü düz modu','İki saati de aynı yönde göster.'],['precision','Son 20 saniyede onda birlik gösterim','Zaman sıkışmasında 00:09.8 gibi göster.'],['sound','Dokunma ve süre sonu sesi','Telefonun sessiz ayarına uyar.'],['haptics','Dokunsal geri bildirim','Destekleyen cihazlarda kısa titreşim.']] as [Exclude<keyof Preferences,'playerColors'|'language'>,string,string][]).map(([key,title,detail])=><View key={key} style={[styles.preferenceRow,{borderBottomColor:c.line}]}><View style={{flex:1,paddingRight:16}}><Text style={{color:c.ink,fontWeight:'600',fontSize:16}}>{title}</Text><Text style={[styles.explanation,{color:c.muted,marginBottom:0}]}>{detail}</Text></View><Switch accessibilityLabel={title} value={prefs[key]} onValueChange={v=>updatePrefs(key,v)} trackColor={{false:c.line,true:c.accent}} /></View>)}{button('Gizlilik ve destek',()=>setPrivacyOpen(true),false,false,'privacy')}<View style={[styles.infoCard,{backgroundColor:c.surface}]}><Text style={{color:c.ink,fontWeight:'600',marginBottom:8}}>Oyun sırasında</Text><Text style={{color:c.muted,lineHeight:22}}>Ekran açık kalır. Uygulamadan çıkıldığında saat duraklar. Ayarlar ve son maç bu cihazda saklanır. İnternet veya hesap gerekmez.</Text></View></>}
          {clock.status==='paused' && <View style={[styles.infoCard,{backgroundColor:c.surface}]}><Text style={[styles.sectionTitle,{color:c.ink}]}>Hakem düzeltmesi</Text>{([0,1] as Player[]).map(p=><View key={p} style={styles.adjustRow}><Text style={{color:c.ink,flex:1}}>{roles[p]} · {formatTime(displayTime(clock,p))}</Text>{button('−1 dk',()=>commit(adjust(clockRef.current,p,-60000)))}{button('+1 dk',()=>commit(adjust(clockRef.current,p,60000)))}</View>)}</View>}
        </ScrollView>
      </>}
      {historyOpen && <View style={{flex:1}}>
        {photoReport && <NativeView pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{position:'absolute',top:0,left:0}}><ReportCard ref={reportRef} report={photoReport} width={360} onLayout={({nativeEvent:{layout}})=>{if(layout.width>0&&layout.height>0)reportLayout.current?.(layout);}}/></NativeView>}
        <View style={{flex:1,backgroundColor:c.bg}}>
      <View style={styles.settingsHeader}><View><Text style={[styles.pageTitle,{color:c.ink}]}>Hamle defteri</Text><Text style={[styles.explanation,{color:c.muted}]}>Her düşüncenin bir süresi var.</Text></View>{button('Kapat',closeOverlay,false,exportBusy,'close-history')}</View>
      <ScrollView contentContainerStyle={[styles.settingsBody,{width:'100%',maxWidth:1040,alignSelf:'center'}]}>
        <View style={styles.formRow}>{button('Son basmayı geri al',()=>{commit(undo(clockRef.current,now()));setNotice('Son basma geri alındı. Saat duraklatıldı.');},false,!clock.history?.length || clock.status==='finished' || exportBusy,'undo')}</View>
        <View style={[styles.formRow,{flexDirection:width<380?'column':'row'}]}>{button(exportBusy?'Hazırlanıyor…':'PDF olarak aktar',()=>{void exportPdf();},false,!clock.history?.length || exportBusy,'export-pdf')}{button(exportBusy?'Hazırlanıyor…':'Resim olarak aktar',()=>{void exportImage();},false,!clock.history?.length || exportBusy,'export-image')}</View>
        {!!exportError&&<Text accessibilityRole="alert" style={{color:c.danger,marginBottom:12}}>{exportError}</Text>}
        {!!exportMessage&&<Text testID="export-success" accessibilityLiveRegion="polite" style={{color:c.accent,marginBottom:12}}>{exportMessage}</Text>}
        <Text style={[styles.explanation,{color:c.muted}]}>PDF bütün kayıtları içerir. Resim, maç özetini ve son 20 basmayı gösterir.</Text>
        {([0,1] as Player[]).map(player=>{const rows=(clock.history ?? []).filter(r=>r.player===player);const total=rows.reduce((sum,r)=>sum+r.spentMs,0);const longest=rows.reduce((max,r)=>Math.max(max,r.spentMs),0);return <View key={player} style={[styles.summaryRow,{backgroundColor:c.surface}]}><Text style={{color:c.metal,fontWeight:'600',marginBottom:8}}>{roles[player]}</Text><Text style={{color:c.ink,fontSize:12}}>Toplam {(total/1000).toFixed(1)} sn  /  Ort. {(rows.length?total/rows.length/1000:0).toFixed(1)} sn  /  En uzun {(longest/1000).toFixed(1)} sn</Text></View>;})}
        <View style={[styles.logHead,{borderBottomColor:c.line}]}><Text style={{color:c.muted,width:110}}>Oyuncu / hamle</Text><Text style={{color:c.muted,flex:1,textAlign:'right'}}>Düşünme</Text><Text style={{color:c.muted,width:100,textAlign:'right'}}>Kalan</Text></View>
        {[...(clock.history ?? [])].reverse().map((r,i)=><View key={i} style={[styles.logRow,{borderBottomColor:c.line}]}><Text style={{color:c.ink,width:110,fontSize:12}}>{roles[r.player]} · {r.move}</Text><Text style={{color:c.metal,flex:1,textAlign:'right',fontFamily:MONO,fontSize:12}}>{(r.spentMs/1000).toFixed(1)} sn</Text><Text style={{color:c.ink,width:100,textAlign:'right',fontFamily:MONO,fontSize:12}}>{formatTime(r.leftMs)}</Text></View>)}
        {!clock.history?.length && <Text style={[styles.explanation,{color:c.muted,marginTop:24}]}>İlk hamleden sonra süre kayıtları burada görünür.</Text>}
      </ScrollView>
        </View>
      </View>}
      {settings && privacyOpen && <>
        <View style={[styles.settingsHeader,{gap:12}]}><Text numberOfLines={2} style={[styles.sectionTitle,{color:c.ink,flex:1}]}>{policyOpen?'Gizlilik politikası':'Gizlilik ve destek'}</Text>{button('Geri',closeOverlay,false,false,'privacy-back')}</View>
        <ScrollView key={policyOpen?'policy':'support'} testID={policyOpen?'privacy-policy':'privacy-support'} contentContainerStyle={[styles.settingsBody,{width:'100%',maxWidth:1040,alignSelf:'center'}]}>
          <Text style={[styles.sectionTitle,{color:c.ink}]}>Verilerin cihazında.</Text>
          <Text style={[styles.explanation,{color:c.muted}]}>Tempo hesap açmanı istemez. Reklam ve analiz takibi içermez. Ayarlar, favoriler ve son maç bu cihazda saklanır; sunucuya gönderilmez. Uygulamayı silmek bu yerel kayıtları kaldırır.</Text>
          {policyOpen ? <>
            <Text style={[styles.sectionTitle,{color:c.ink}]}>Fotoğraflar’a kaydetme</Text>
            <Text style={[styles.explanation,{color:c.muted}]}>Resim olarak aktar, maç özetini ve son 20 basmayı cihazında bir PNG resmine dönüştürür ve Fotoğraflar’a kaydeder. iPhone’da yalnızca fotoğraf ekleme izni ister; mevcut fotoğraflarını okumaz. İzni cihazının Ayarlar bölümünden değiştirebilirsin. Kaydettiğin resimleri Fotoğraflar’dan silebilirsin. iCloud Fotoğrafları açıksa Apple’ın eşzamanlama ayarları geçerlidir.</Text>
            <Text style={[styles.explanation,{color:c.muted}]}>Android’de resim galeriye kaydedilir. Android 11 ve sonrasında mevcut fotoğraflarına erişim izni istemez. Daha eski cihazlarda kaydetmek için depolama izni gerekebilir.</Text>
            <Text style={[styles.sectionTitle,{color:c.ink}]}>PDF ve paylaşım</Text>
            <Text style={[styles.explanation,{color:c.muted}]}>PDF raporu cihazında hazırlanır. Paylaşmayı seçersen dosya, seçtiğin uygulamaya gönderilir. Paylaştığın dosyayı alıcıdan geri silmek Tempo üzerinden mümkün değildir. Dış bağlantılar ve e-posta hizmetlerinde ilgili hizmetin gizlilik kuralları geçerlidir.</Text>
            <Text style={[styles.sectionTitle,{color:c.ink}]}>Destek ve iletişim</Text>
            <Text style={[styles.explanation,{color:c.muted}]}>Destek e-postası gönderirsen mesajın ve eklediğin bilgiler yalnızca talebini yanıtlamak için kullanılır. Destek yazışmalarının silinmesini aynı e-posta adresinden isteyebilirsin. Tempo maç verilerini otomatik olarak destek ekibine göndermez.</Text>
            <Text style={[styles.explanation,{color:c.muted}]}>Bu gizlilik politikası uygulamanın içinde saklanır ve internet olmadan okunabilir. Web sürümü ayrıca tarayıcıda açılır.</Text>
            {button('Web sürümünü aç',()=>{void Linking.openURL(prefs.language==='tr'?'https://tempo-satranc-saati-destek.efekaankarakulak.chatgpt.site/#privacy':'https://tempo-satranc-saati-destek.efekaankarakulak.chatgpt.site/en/#privacy').catch(()=>setNotice('Bağlantı açılamadı.'));},false,false,'privacy-web')}
            <Text style={[styles.explanation,{color:c.muted}]}>Son güncelleme: 4 Ekim 2026</Text>
          </> : <>
            <Text style={[styles.explanation,{color:c.muted}]}>Resimleri Fotoğraflar’a kaydedebilir, PDF raporunu paylaşabilirsin. Gizlilik politikası bu uygulamada, internet olmadan açılır.</Text>
            {button('Gizlilik politikası',()=>setPolicyOpen(true),false,false,'privacy-policy-open')}
            <Text style={[styles.sectionTitle,{color:c.ink,marginTop:24}]}>Destek ve iletişim</Text>
            <Text style={[styles.explanation,{color:c.muted}]}>Bir sorun bildirirken cihaz modelini ve uygulama sürümünü yazabilirsin. Ekran görüntüsü eklemek isteğe bağlıdır. Maç kayıtların otomatik gönderilmez.</Text>
          </>}
          {button('Destek e-postası',()=>{void Linking.openURL('mailto:floppatechcorp@gmail.com?subject=Tempo').catch(()=>setNotice('Bağlantı açılamadı.'));})}
          <Text translate={false} selectable style={[styles.explanation,{color:c.muted}]}>floppatechcorp@gmail.com</Text>
        </ScrollView>
      </>}
    </ScreenModal>
    <Modal visible={resetDialog} transparent animationType="fade" onRequestClose={()=>setResetDialog(false)}><View style={styles.scrim}><View style={[styles.dialog,{backgroundColor:c.bg}]}><Text style={[styles.pageTitle,{color:c.ink}]}>Yeni maç?</Text><Text style={[styles.explanation,{color:c.muted}]}>Süreler ve hamle sayıları sıfırlanacak.</Text><View style={styles.formRow}>{button('Vazgeç',()=>setResetDialog(false))}{button('Sıfırla',()=>{apply(clockRef.current.config);setResetDialog(false);},true,false,'confirm-reset')}</View></View></View></Modal>
    {!splashDone && <SplashScreen language={prefs.language} onFinish={()=>setSplashDone(true)} />}
  </SafeAreaView></I18nProvider>;
}

const styles = StyleSheet.create({
  logoLockup:{flexDirection:'row',gap:10,alignItems:'center',flexShrink:0},turnBadge:{flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:12,borderRadius:20},turnDot:{width:5,height:5,borderRadius:3},roleGroup:{flexDirection:'row',gap:10,alignItems:'center'},roleNumber:{width:31,height:31,borderRadius:6,borderWidth:1,alignItems:'center',justifyContent:'center'},faceFooter:{gap:2},scaleTicks:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',height:10},phaseHint:{fontSize:9,letterSpacing:.3,marginTop:8,textAlign:'center'},stageHeading:{fontSize:10,letterSpacing:1.3,marginTop:20,marginBottom:14,fontWeight:'700'},tournamentTile:{padding:18,borderWidth:1,borderRadius:12,marginBottom:10,gap:7},tournamentName:{fontFamily:SERIF,fontSize:23},historyLink:{alignItems:'center',paddingTop:10,paddingBottom:2},summaryRow:{padding:15,borderRadius:10,marginBottom:10},logHead:{flexDirection:'row',paddingVertical:15,borderBottomWidth:1,fontSize:11},logRow:{flexDirection:'row',paddingVertical:15,borderBottomWidth:1},root:{flex:1},header:{paddingHorizontal:22,paddingVertical:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},brandRow:{gap:2},brand:{fontSize:32,fontFamily:SERIF,fontWeight:'400',letterSpacing:-1.5},brandCaption:{fontSize:9,letterSpacing:2.1,fontWeight:'600'},presetBadge:{flexShrink:1,paddingHorizontal:10,paddingVertical:10,borderWidth:1,borderRadius:20,maxWidth:'52%'},notice:{padding:12,marginHorizontal:14,borderRadius:12,marginBottom:8},board:{flex:1,paddingHorizontal:12,gap:8},landscape:{flexDirection:'row'},panel:{flex:1,borderRadius:12,borderWidth:2,overflow:'hidden'},panelContent:{flex:1,padding:18,justifyContent:'space-between',minHeight:185},panelTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},role:{fontSize:17,fontWeight:'600'},moves:{fontSize:10,fontWeight:'500',marginTop:4},timeBlock:{alignItems:'center',justifyContent:'center',gap:6,flex:1},time:{width:'100%',textAlign:'center',fontFamily:MONO,fontWeight:'400',fontVariant:['tabular-nums'],letterSpacing:-4,includeFontPadding:false},stateLabel:{fontSize:10,letterSpacing:2,fontWeight:'700'},detail:{fontSize:12,opacity:.72},progressTrack:{height:2,overflow:'hidden',marginTop:5},progress:{height:2,opacity:.8},controls:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:3},controlsVertical:{flexDirection:'column',maxWidth:180},button:{borderWidth:1,paddingHorizontal:17,paddingVertical:14,borderRadius:8,minHeight:48,justifyContent:'center',alignItems:'center'},buttonText:{fontWeight:'600',fontSize:14},footer:{fontSize:10,textAlign:'center',padding:8},settingsHeader:{padding:22,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},pageTitle:{fontFamily:SERIF,fontSize:30,fontWeight:'400',letterSpacing:-.8},tabs:{flexDirection:'row',paddingHorizontal:16,gap:6,marginBottom:16},tab:{flex:1,paddingVertical:13,alignItems:'center',borderRadius:13},settingsBody:{paddingHorizontal:22,paddingBottom:40},sectionTitle:{fontFamily:SERIF,fontSize:23,fontWeight:'400',letterSpacing:-.5,marginBottom:8},explanation:{fontSize:13,lineHeight:20,marginTop:5,marginBottom:16},grid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:16},presetTile:{width:'31%',flexGrow:1,borderWidth:1,borderRadius:10,padding:14,gap:10},presetNumber:{fontSize:24,fontWeight:'600',fontVariant:['tabular-nums'],letterSpacing:-.5},presetType:{fontSize:11},custom:{marginTop:22},formRow:{flexDirection:'row',gap:10,marginBottom:16},field:{flex:1},fieldLabel:{fontSize:12,marginBottom:8},input:{fontSize:23,fontWeight:'500',borderWidth:1,borderRadius:14,padding:14,minHeight:56},mode:{flex:1,paddingVertical:14,borderRadius:13,borderWidth:1,alignItems:'center'},simulCard:{padding:23,borderRadius:12,marginBottom:18,gap:12},simulEyebrow:{fontSize:10,letterSpacing:2,fontWeight:'700'},simulHeadline:{fontSize:32,fontWeight:'600',letterSpacing:-1,lineHeight:38},preferenceRow:{paddingVertical:20,borderBottomWidth:1,flexDirection:'row',alignItems:'center'},infoCard:{borderRadius:19,padding:20,marginTop:24},adjustRow:{flexDirection:'row',alignItems:'center',gap:8,marginTop:12},scrim:{flex:1,backgroundColor:'#00000070',justifyContent:'center',padding:24},dialog:{padding:24,borderRadius:24}
});
