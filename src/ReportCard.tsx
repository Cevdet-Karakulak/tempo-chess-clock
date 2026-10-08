import React,{forwardRef} from 'react';
import {View as NativeView} from 'react-native';
import type {ViewProps} from 'react-native';
import {Text,View} from './i18n';
import type {Report} from './report.mjs';
export const ReportCard=forwardRef<NativeView,{report:Report;width:number;onLayout?:ViewProps['onLayout']}>(({report,width,onLayout},ref)=>{
 const l=report.labels,rows=report.rows.slice(-20);
 return <NativeView ref={ref} onLayout={onLayout} collapsable={false} style={{width,backgroundColor:'#11171d',padding:20,gap:16}}>
  <Text translate={false} style={{fontSize:42,fontWeight:'900',color:'#f8fafc'}}>tempo<Text style={{color:'#84e347'}}>.</Text></Text>
  <View style={{gap:6}}><Text translate={false} style={{fontSize:23,color:'#f8fafc'}}>{report.title}</Text><Text translate={false} style={{fontSize:13,color:'#b7c5cf'}}>{report.label}</Text><Text translate={false} style={{fontSize:11,color:'#94a3b8'}}>{report.date} · {report.status}</Text></View>
  <View style={{flexDirection:'row',gap:10}}>{report.summaries.map((s,i)=><View key={i} style={{flex:1,backgroundColor:'#1c2931',padding:12,borderRadius:10,gap:7}}><Text translate={false} style={{fontSize:13,color:i?'#38bdf8':'#84e347',fontWeight:'700'}}>{s.name} · {s.moves} {l.moves}</Text><Text translate={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={{fontSize:28,color:'#f8fafc'}}>{s.left}</Text><Text translate={false} style={{fontSize:11,color:'#b7c5cf'}}>{l.total} {s.total} {l.seconds}</Text><Text translate={false} style={{fontSize:11,color:'#b7c5cf'}}>{l.average} {s.average} {l.seconds}</Text></View>)}</View>
  <Text translate={false} style={{fontSize:11,color:'#94a3b8'}}>{l.image} / {report.rows.length}</Text>
  <View style={{flexDirection:'row',gap:8}}><Text translate={false} style={{flex:1,fontSize:11,color:'#94a3b8'}}>{l.player}</Text><Text translate={false} style={{width:72,fontSize:11,color:'#94a3b8'}}>{l.spent} (s)</Text><Text translate={false} style={{width:60,fontSize:11,color:'#94a3b8'}}>{l.left}</Text></View>
  {rows.map((r,i)=><View key={i} style={{flexDirection:'row',gap:8,paddingBottom:10,borderBottomWidth:1,borderBottomColor:'#30414a'}}><Text translate={false} style={{flex:1,fontSize:12,color:'#f8fafc'}}>{r.player} · {r.move}</Text><Text translate={false} style={{width:72,fontSize:12,color:'#38bdf8'}}>{r.spent}</Text><Text translate={false} style={{width:60,fontSize:12,color:'#f8fafc'}}>{r.left}</Text></View>)}
 </NativeView>;
});
