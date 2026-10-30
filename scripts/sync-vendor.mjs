import {mkdir,copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir(new URL('../public/assets/vendor/',import.meta.url),{recursive:true});
await copyFile(new URL('../node_modules/@supabase/supabase-js/dist/umd/supabase.js',import.meta.url),new URL('../public/assets/vendor/supabase.js',import.meta.url));
await copyFile(new URL('../node_modules/@supabase/supabase-js/LICENSE',import.meta.url),new URL('../public/assets/vendor/supabase-LICENSE',import.meta.url));
await build({entryPoints:[new URL('../public/native-bridge.mjs',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')],outfile:new URL('../public/assets/vendor/native-bridge.mjs',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),bundle:true,format:'esm',platform:'browser',minify:true});
