import './build-mobile.mjs';
import {spawnSync} from 'node:child_process';
const commands=process.platform==='win32'?[['sync','android'],['copy','ios']]:[['sync']];
for(const args of commands){
 const result=spawnSync(process.execPath,['node_modules/@capacitor/cli/bin/capacitor',...args],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
if(process.platform==='win32')console.log('iOS assets copied. Run mobile:sync on the Mac before building in Xcode.');
