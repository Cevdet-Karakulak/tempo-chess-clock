import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';

const logo = require('../assets/tempo-logo.png');
const emblem = {x:90,y:80,width:470,height:440};
const wordmark = {x:600,y:130,width:1000,height:380};

// Reuse the original artwork at its original proportions. Only the arrangement
// changes on a phone, where the full 3:1 lockup cannot fit beside two button rows.
function Artwork({crop,width,height}:{crop:typeof emblem;width:number;height:number}) {
  const scale=Math.min(width/crop.width,height/crop.height);
  return <View style={{width:crop.width*scale,height:crop.height*scale,overflow:'hidden'}}>
    <Image source={logo} accessible={false} resizeMode="stretch" style={{position:'absolute',width:1800*scale,height:600*scale,left:-crop.x*scale,top:-crop.y*scale}}/>
  </View>;
}

export function PreparationLogo({width,compact}:{width:number;compact:boolean}) {
  const [height,setHeight]=useState(96);
  return <View testID="prepare-logo" accessible accessibilityRole="image" accessibilityLabel="Tempo · Satranç Saati"
    onLayout={event=>setHeight(event.nativeEvent.layout.height)}
    style={{width,flexShrink:0,alignSelf:'stretch',overflow:'hidden',borderRadius:12,backgroundColor:'#101c23'}}>
    {compact ? <View pointerEvents="none" style={[StyleSheet.absoluteFill,{alignItems:'center',justifyContent:'center',gap:2}]}>
      <Artwork crop={emblem} width={width-16} height={(height-10)*.5}/>
      <Artwork crop={wordmark} width={width-12} height={(height-10)*.5}/>
    </View> : <View pointerEvents="none" style={[StyleSheet.absoluteFill,{alignItems:'center',justifyContent:'center'}]}>
      <Artwork crop={{x:0,y:0,width:1800,height:600}} width={width} height={height}/>
    </View>}
  </View>;
}
