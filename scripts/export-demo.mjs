import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
let html=fs.readFileSync(path.join(dist,'index.html'),'utf8').replace('lang="en"','lang="tr"')
  .replace('You need to enable JavaScript to run this app.','Bu saati kullanmak için JavaScript açık olmalı.');
const src=html.match(/<script src="([^"]+)" defer><\/script>/)?.[1];
if(!src) throw new Error('Web export entry not found. Run npm run export:web first.');
let js=fs.readFileSync(path.join(dist,src.replace(/^\//,'')),'utf8');
const assets=path.join(dist,'assets','assets');
for(const name of fs.readdirSync(assets).filter(x=>/\.(wav|png)$/.test(x))) {
  const mime=name.endsWith('.wav')?'audio/wav':'image/png';
  js=js.replaceAll('/assets/assets/'+name,'data:'+mime+';base64,'+fs.readFileSync(path.join(assets,name)).toString('base64'));
}
html=html.replace('</head>','<link rel="icon" type="image/png" href="data:image/png;base64,'+fs.readFileSync(path.join(root,'assets','tempo-icon.png')).toString('base64')+'"/></head>');
html=html.replace(/<script src="[^"]+" defer><\/script>/,()=>'<script>'+js.replaceAll('</script','<\\/script')+'</script>');
fs.writeFileSync(path.join(root,'Tempo-Animasyon-Demo.html'),html);
console.log('Tempo-Animasyon-Demo.html hazır. Tarayıcıda açabilirsin.');
