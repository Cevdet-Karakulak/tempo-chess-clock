import {Text,Pressable,TextInput,View,useTranslation} from './i18n';
import React,{useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,Easing,Image,StyleSheet} from 'react-native';

type Props={player:number;role:string;otherRole:string;width:number;height:number;animate:boolean};
export function FlagFinale({player,role,otherRole,width,height,animate}:Props) {
  const {t}=useTranslation();
  const possessive:Record<string,string>={Beyaz:'Beyazın',Siyah:'Siyahın',Gösterici:'Göstericinin',Rakip:'Rakibin'};
  const compact=height<280;
  const dialSize=Math.max(56,Math.min(width*.50,height*(compact?.38:.47),210));
  const scale=dialSize/190;
  const reveal=useRef(new Animated.Value(animate?0:1)).current;
  const blade=useRef(new Animated.Value(animate?0:1)).current;
  const ripple=useRef(new Animated.Value(animate?0:1)).current;
  const copy=useRef(new Animated.Value(animate?0:1)).current;
  const [settled,setSettled]=useState(!animate);
  const [reduced,setReduced]=useState<boolean|null>(null);
  useEffect(()=>{
    let alive=true;
    AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(alive)setReduced(v);}).catch(()=>setReduced(true));
    const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);
    return()=>{alive=false;sub.remove();};
  },[]);
  useEffect(()=>{
    if(reduced===null)return;
    if(!animate || reduced){for(const v of [reveal,blade,ripple,copy]){v.stopAnimation();v.setValue(1);}setSettled(true);return;}
    setSettled(false);
    for(const v of [reveal,blade,ripple,copy])v.setValue(0);
    const sequence=Animated.parallel([
      Animated.timing(reveal,{toValue:1,duration:280,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
      Animated.sequence([Animated.delay(170),Animated.timing(blade,{toValue:1.035,duration:520,easing:Easing.in(Easing.quad),useNativeDriver:true}),Animated.spring(blade,{toValue:1,friction:9,tension:150,useNativeDriver:true})]),
      Animated.sequence([Animated.delay(570),Animated.timing(ripple,{toValue:1,duration:720,easing:Easing.out(Easing.cubic),useNativeDriver:true})]),
      Animated.sequence([Animated.delay(550),Animated.timing(copy,{toValue:1,duration:420,easing:Easing.out(Easing.cubic),useNativeDriver:true})])
    ]);
    sequence.start(({finished})=>{if(finished)setSettled(true);});return()=>sequence.stop();
  },[animate,reduced,reveal,blade,ripple,copy]);

  // Keep the same flag image mounted throughout the fall and final pose.
  // Pure 2D transforms prevent the dial from occluding it in native 3D composition.
  return <Animated.View testID={`finale-${player}`} accessibilityRole="alert" accessibilityLiveRegion="assertive" accessibilityLabel={t(`Bayrak düştü. ${role} kaybetti. Süre doldu.`)} style={[s.root,{opacity:settled?1:reveal,paddingVertical:compact?9:16,transform:[{scale:settled?1:reveal.interpolate({inputRange:[0,1],outputRange:[.96,1]})}]}]}>
    <View pointerEvents="none" style={s.ambient}/><View pointerEvents="none" style={s.edge}/>
    <View style={s.topLine}><View style={s.redDot}/><Text style={s.eyebrow}>SÜRE DOLDU</Text><Text style={s.number}>{player===0?'01':'02'}</Text></View>
    <View style={[s.hero,{width:dialSize,height:dialSize,marginVertical:compact?3:9}]} pointerEvents="none">
      <Animated.View testID={`finale-ripple-${player}`} style={[s.ripple,{opacity:ripple.interpolate({inputRange:[0,.05,1],outputRange:[0,.45,0]}),transform:[{scale:ripple.interpolate({inputRange:[0,1],outputRange:[1,1.7]})}]}]}/>
      <View style={[s.camera,{width:190,height:190,left:(dialSize-190)/2,top:(dialSize-190)/2,transform:[{scale}]}]}>
        <View style={s.caseDepth}/>
        <Image source={require('../assets/finale-dial.png')} style={s.dial} resizeMode="contain"/>
        <Animated.View testID={`finale-flag-${player}`} style={[s.flagRotor,{transform:[{rotateZ:blade.interpolate({inputRange:[0,1],outputRange:['-26deg','72deg']})}]}]}>
          <Image source={require('../assets/finale-blade.png')} style={s.flagImage} resizeMode="contain"/>
        </Animated.View>
        <Image source={require('../assets/finale-pivot.png')} style={s.pivot} resizeMode="contain"/>
        <View style={s.lensRim}/>
      </View>
    </View>
    <Animated.View style={[s.copy,{gap:compact?4:7,opacity:settled?1:copy,transform:[{translateY:settled?0:copy.interpolate({inputRange:[0,1],outputRange:[12,0]})}]}]}>
      <View style={s.badge}><Text style={[s.badgeText,{fontSize:compact?8:9}]}>BAYRAK DÜŞTÜ</Text></View>
      <Text testID={`finale-result-${player}`} adjustsFontSizeToFit numberOfLines={1} style={[s.result,{fontSize:compact?Math.min(26,width*.074):Math.min(36,width*.09)}]}>{role} kaybetti</Text>
      <Text numberOfLines={1} style={[s.subtitle,{fontSize:compact?10:12}]}>{possessive[otherRole] || otherRole} saati durduruldu.</Text>
    </Animated.View>
    {!compact && <View style={s.bottomLine}><View style={s.hairline}/><Text style={s.bottomText}>TEMPO · SATRANÇ SAATİ</Text><View style={s.hairline}/></View>}
  </Animated.View>;
}
const s=StyleSheet.create({
  root:{flex:1,width:'100%',backgroundColor:'#131A22',alignItems:'center',justifyContent:'space-between',paddingHorizontal:15,overflow:'hidden'},
  ambient:{position:'absolute',width:350,height:350,borderRadius:175,backgroundColor:'#AC362315',top:-100,right:-110},edge:{position:'absolute',top:0,left:0,right:0,height:2,backgroundColor:'#D55B49'},
  topLine:{width:'100%',flexDirection:'row',alignItems:'center',gap:7},redDot:{width:5,height:5,borderRadius:3,backgroundColor:'#F46E5F'},eyebrow:{fontSize:9,fontWeight:'600',color:'#CFB5A7',letterSpacing:2},number:{marginLeft:'auto',fontSize:10,color:'#73808F',letterSpacing:1},hero:{alignItems:'center',justifyContent:'center'},
  ripple:{position:'absolute',top:0,right:0,bottom:0,left:0,borderRadius:150,borderWidth:1,borderColor:'#D76746'},camera:{position:'absolute'},caseDepth:{position:'absolute',top:10,left:4,width:182,height:181,borderRadius:95,backgroundColor:'#03070C',borderWidth:2,borderColor:'#36434E',boxShadow:'0px 10px 16px #00000070'},dial:{position:'absolute',width:190,height:190,zIndex:1},
  flagRotor:{position:'absolute',width:190,height:190,left:-30,top:-35,zIndex:2,opacity:1},flagImage:{width:190,height:190},pivot:{position:'absolute',left:49,top:44,width:32,height:32,zIndex:3},lensRim:{position:'absolute',zIndex:4,left:6,top:4,width:178,height:178,borderRadius:90,borderWidth:.5,borderTopColor:'#FFFFFF70',borderLeftColor:'#FFFFFF28',borderRightColor:'transparent',borderBottomColor:'transparent'},
  copy:{width:'100%',alignItems:'center',gap:7},badge:{paddingHorizontal:10,paddingVertical:4,borderRadius:20,borderWidth:1,borderColor:'#F46E5F55',backgroundColor:'#F46E5F12'},badgeText:{fontWeight:'700',color:'#FFAA8D',letterSpacing:1.7},result:{width:'100%',textAlign:'center',fontWeight:'700',letterSpacing:-.8,color:'#FFF1E6'},subtitle:{color:'#AAB4BD',letterSpacing:.1},bottomLine:{flexDirection:'row',alignItems:'center',gap:10,width:'100%',marginTop:10},hairline:{height:1,flex:1,backgroundColor:'#83919C30'},bottomText:{fontSize:7,letterSpacing:1.5,color:'#8995A2'}
});
