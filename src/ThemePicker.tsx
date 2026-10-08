import {Text,Pressable,TextInput,View,useTranslation} from './i18n';
import React,{useState} from 'react';
import {StyleSheet} from 'react-native';
import {PALETTES,SWATCHES,normalizeHex,contrastText} from './colors.mjs';

type Props={colors:[string,string];roles:string[];surface:string;ink:string;muted:string;line:string;onChange:(colors:[string,string])=>void};
export function ThemePicker({colors,roles,surface,ink,muted,line,onChange}:Props) {
  const [player,setPlayer]=useState<0|1>(0);
  const [hex,setHex]=useState(colors[0]);
  const [error,setError]=useState('');
  function selectPlayer(value:0|1){setPlayer(value);setHex(colors[value]);setError('');}
  function choose(value:string){const next:[string,string]=[...colors];next[player]=value;setHex(value);setError('');onChange(next);}
  function palette(values:string[]){onChange(values as [string,string]);setHex(values[player]);setError('');}
  function apply(){const color=normalizeHex(hex);if(!color){setError('Örnek: #8CD5E7 veya #ABC.');return;}choose(color);setError('');}
  return <View style={s.root}>
    <Text style={[s.title,{color:ink}]}>Taraf renkleri</Text><Text style={[s.explanation,{color:muted}]}>Aktif saatin dolgu rengini seç. Bekleyen taraf kararır; yazılar zemine göre ayarlanır.</Text>
    <View style={s.previewRow}>{colors.map((color,i)=><Pressable key={i} testID={`theme-player-${i}`} accessibilityRole="button" accessibilityLabel={`${roles[i]} rengini düzenle`} accessibilityState={{selected:player===i}} onPress={()=>selectPlayer(i as 0|1)} style={[s.preview,{backgroundColor:color,borderColor:player===i?ink:line,borderWidth:player===i?2:1}]}><Text style={{color:contrastText(color),fontSize:11,fontWeight:'600'}}>{roles[i]} {player===i?'✓':''}</Text><Text style={{color:contrastText(color),fontSize:28,fontWeight:'500',fontVariant:['tabular-nums']}}>05:00</Text><Text style={{color:contrastText(color),fontSize:9,letterSpacing:1}}>AKTİF RENK</Text></Pressable>)}</View>
    <Text style={[s.caption,{color:muted}]}>HAZIR PALETLER</Text><View style={s.palettes}>{PALETTES.map((p,i)=><Pressable key={p.name} testID={`theme-palette-${i}`} accessibilityRole="button" accessibilityLabel={`${p.name} paletini uygula`} onPress={()=>palette(p.colors)} style={[s.palette,{backgroundColor:surface,borderColor:line}]}><View style={s.pair}>{p.colors.map(color=><View key={color} style={{flex:1,height:21,backgroundColor:color}}/>)}</View><Text style={{color:ink,fontSize:11,fontWeight:'600'}}>{p.name}</Text></Pressable>)}</View>
    <Text style={[s.caption,{color:muted}]}>{roles[player].toLocaleUpperCase('tr')} İÇİN RENK</Text><View style={s.swatches}>{SWATCHES.map((color,i)=><Pressable key={color} testID={`theme-swatch-${i}`} accessibilityRole="button" accessibilityLabel={`${color} rengini seç`} accessibilityState={{selected:colors[player]===color}} onPress={()=>choose(color)} style={[s.swatch,{backgroundColor:color,borderColor:colors[player]===color?ink:line,borderWidth:colors[player]===color?3:1}]}>{colors[player]===color&&<Text style={{color:contrastText(color),fontSize:16,fontWeight:'700'}}>✓</Text>}</Pressable>)}</View>
    <View style={s.hexRow}><TextInput testID="theme-hex" accessibilityLabel="Özel HEX renk kodu" value={hex} onChangeText={setHex} autoCapitalize="characters" autoCorrect={false} maxLength={7} placeholder="#8CD5E7" placeholderTextColor={muted} style={[s.input,{borderColor:line,color:ink,backgroundColor:surface}]}/><Pressable testID="theme-apply" accessibilityRole="button" onPress={apply} style={[s.apply,{backgroundColor:ink}]}><Text style={{color:surface,fontWeight:'600',fontSize:13}}>Uygula</Text></Pressable></View>
    {!!error&&<Text testID="theme-error" accessibilityRole="alert" style={{color:'#DE8172',fontSize:12,marginTop:8}}>{error}</Text>}
    <Pressable accessibilityRole="button" onPress={()=>palette(PALETTES[0].colors)} style={{paddingVertical:13}}><Text style={{color:muted,fontSize:12}}>Varsayılan renkleri geri getir</Text></Pressable>
  </View>;
}
const s=StyleSheet.create({root:{marginBottom:22},title:{fontSize:22,fontWeight:'600'},explanation:{fontSize:13,lineHeight:20,marginTop:7,marginBottom:16},previewRow:{flexDirection:'row',gap:10},preview:{flex:1,padding:14,borderRadius:13,gap:5},caption:{fontSize:9,letterSpacing:1.5,marginTop:20,marginBottom:10,fontWeight:'600'},palettes:{flexDirection:'row',flexWrap:'wrap',gap:8},palette:{width:'47%',flexGrow:1,padding:10,borderRadius:10,borderWidth:1,gap:7},pair:{flexDirection:'row',overflow:'hidden',borderRadius:4},swatches:{flexDirection:'row',flexWrap:'wrap',gap:10},swatch:{width:38,height:38,borderRadius:19,alignItems:'center',justifyContent:'center'},hexRow:{flexDirection:'row',gap:8,marginTop:16},input:{flex:1,borderWidth:1,borderRadius:9,padding:13,fontSize:16},apply:{borderRadius:9,paddingHorizontal:18,justifyContent:'center'}});
