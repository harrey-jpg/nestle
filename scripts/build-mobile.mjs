import {mkdir,copyFile,cp,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),target=new URL('dist-mobile/',root);
await mkdir(target,{recursive:true});
for(const file of await readdir(new URL('public/',root))){
  if(['index.html','home.css','home.js','messages.css'].includes(file)||file.endsWith('.mjs')&&file!=='native-bridge.mjs')
    await copyFile(new URL(`public/${file}`,root),new URL(file,target));
}
for(const dir of ['activities','couple','home','vendor'])await cp(new URL(`public/assets/${dir}`,root),new URL(`assets/${dir}`,target),{recursive:true});
await copyFile(new URL('public/assets/nunito.ttf',root),new URL('assets/nunito.ttf',target));
console.log('Mobile app assets prepared.');
