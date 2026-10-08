import React,{createContext,useContext,forwardRef} from 'react';
import {Text as NativeText,Pressable as NativePressable,TextInput as NativeTextInput,Switch as NativeSwitch,View as NativeView} from 'react-native';
import {translate} from './translations.mjs';
import type {Locale} from './translations.mjs';
const Context=createContext<Locale>('tr');
export function I18nProvider({locale,children}:{locale:Locale;children:React.ReactNode}){return <Context.Provider value={locale}>{children}</Context.Provider>;}
export function useTranslation(){const locale=useContext(Context);return {locale,t:(text:string)=>translate(text,locale)};}
function translatedChildren(children:React.ReactNode,locale:Locale):React.ReactNode {
  const values=React.Children.toArray(children);
  if(values.every(v=>typeof v==='string'||typeof v==='number'))return translate(values.join(''),locale);
  return values.map(v=>typeof v==='string'?translate(v,locale):v);
}
export const Text=forwardRef<React.ElementRef<typeof NativeText>,React.ComponentProps<typeof NativeText>&{translate?:boolean}>(({children,translate:enabled=true,...props},ref)=>{
  const {locale,t}=useTranslation();return <NativeText {...props} ref={ref} accessibilityLabel={props.accessibilityLabel?t(props.accessibilityLabel):undefined}>{enabled?translatedChildren(children,locale):children}</NativeText>;
});
export const Pressable=forwardRef<React.ElementRef<typeof NativePressable>,React.ComponentProps<typeof NativePressable>>((props,ref)=>{const {t}=useTranslation();return <NativePressable {...props} ref={ref} accessibilityLabel={props.accessibilityLabel?t(props.accessibilityLabel):undefined} accessibilityHint={props.accessibilityHint?t(props.accessibilityHint):undefined}/>;});
export const TextInput=forwardRef<React.ElementRef<typeof NativeTextInput>,React.ComponentProps<typeof NativeTextInput>>((props,ref)=>{const {t}=useTranslation();return <NativeTextInput {...props} ref={ref} accessibilityLabel={props.accessibilityLabel?t(props.accessibilityLabel):undefined} placeholder={props.placeholder?t(props.placeholder):undefined}/>;});
export const Switch=forwardRef<React.ElementRef<typeof NativeSwitch>,React.ComponentProps<typeof NativeSwitch>>((props,ref)=>{const {t}=useTranslation();return <NativeSwitch {...props} ref={ref} accessibilityLabel={props.accessibilityLabel?t(props.accessibilityLabel):undefined}/>;});
export const View=forwardRef<React.ElementRef<typeof NativeView>,React.ComponentProps<typeof NativeView>>((props,ref)=>{const {t}=useTranslation();return <NativeView {...props} ref={ref} accessibilityLabel={props.accessibilityLabel?t(props.accessibilityLabel):undefined}/>;});
