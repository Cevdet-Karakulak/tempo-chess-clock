import {Text,Pressable,TextInput,View,useTranslation} from './i18n';
import React, {useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,StyleSheet} from 'react-native';

// Enclosed analogue flag: a horizontal metal blade pivots down into its recessed stop.
export function MechanicalFlag({dropped,player,metal,muted,compact=false}:{dropped:boolean;player:number;metal:string;muted:string;compact?:boolean}) {
  const position=useRef(new Animated.Value(dropped?1:0)).current;
  const [reduceMotion,setReduceMotion]=useState(false);
  useEffect(()=>{
    let live=true;
    AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(live)setReduceMotion(value);}).catch(()=>{});
    const listener=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduceMotion);
    return()=>{live=false;listener.remove();};
  },[]);
  useEffect(()=>{
    position.stopAnimation();
    if(reduceMotion){position.setValue(dropped?1:0);return;}
    const animation=dropped ? Animated.sequence([
      Animated.timing(position,{toValue:1.04,duration:270,useNativeDriver:true}),
      Animated.spring(position,{toValue:1,friction:8,tension:160,useNativeDriver:true})
    ]):Animated.timing(position,{toValue:0,duration:200,useNativeDriver:true});
    animation.start();return()=>animation.stop();
  },[dropped,reduceMotion,position]);
  return <View testID={`flag-${player}`} accessibilityLabel={dropped?'Bayrak düştü':'Bayrak yukarıda'} style={compact?{width:54,height:42}:flagStyles.frame} pointerEvents="none"><View style={[flagStyles.frame,compact && {position:'absolute',left:-10,top:-8,transform:[{scale:.72}]}]}>
    <View style={[flagStyles.housing,{borderColor:metal+'70',backgroundColor:'#1013220D'}]}>
      <View style={[flagStyles.aperture,{borderColor:metal+'35'}]}>
        {[0,1,2,3].map(i=><View key={i} style={[flagStyles.tick,{top:10+i*7,width:i===0||i===3?6:3,backgroundColor:metal,opacity:.55}]} />)}
        <View style={[flagStyles.stop,{backgroundColor:metal+'55'}]} />
        <Animated.View testID={`flag-arm-${player}`} style={[flagStyles.arm,{transform:[{rotate:position.interpolate({inputRange:[0,1],outputRange:['-6deg','76deg']})}]}]}>
          <View style={[flagStyles.stem,{backgroundColor:metal}]} />
          <View style={[flagStyles.blade,{backgroundColor:dropped?'#D7493D':'#AD3F36'}]}><View style={flagStyles.highlight}/><View style={flagStyles.tip}/></View>
        </Animated.View>
        <View style={[flagStyles.pin,{backgroundColor:metal,borderColor:'#FFFFFF55'}]}><View style={flagStyles.pinSlot}/></View>
      </View>
      {[3,66].map(left=><View key={left} style={[flagStyles.screw,{left,backgroundColor:metal+'80'}]} />)}
    </View>
    <Text testID={`flag-label-${player}`} style={[flagStyles.caption,{color:dropped?'#D7493D':muted}]}>{dropped?'DÜŞTÜ':'BAYRAK'}</Text>
  </View></View>;
}
const flagStyles=StyleSheet.create({
  frame:{width:74,height:60},housing:{width:74,height:50,borderRadius:9,borderWidth:1,padding:4},aperture:{flex:1,borderRadius:5,borderWidth:1,overflow:'hidden',backgroundColor:'#1013220A'},
  arm:{position:'absolute',left:-16,top:-20,width:60,height:60},stem:{position:'absolute',left:30,top:28,width:11,height:3},blade:{position:'absolute',left:37,top:25,width:20,height:9,borderRadius:2,borderWidth:1,borderColor:'#681E2440',overflow:'hidden'},highlight:{height:1,backgroundColor:'#FFFFFF55'},tip:{position:'absolute',right:2,top:1,bottom:1,width:1,backgroundColor:'#00000018'},
  pin:{position:'absolute',left:10,top:6,width:8,height:8,borderRadius:4,borderWidth:1,alignItems:'center',justifyContent:'center'},pinSlot:{width:4,height:1,transform:[{rotate:'-35deg'}],backgroundColor:'#101322A0'},
  tick:{position:'absolute',right:4,height:1},stop:{position:'absolute',left:11,bottom:3,width:8,height:2,borderRadius:1},screw:{position:'absolute',top:21,width:2,height:2,borderRadius:1},
  caption:{position:'absolute',bottom:0,left:0,right:0,textAlign:'center',fontSize:8,letterSpacing:1.4,fontWeight:'600'}
});
