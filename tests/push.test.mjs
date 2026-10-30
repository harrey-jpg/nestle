import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
test('push authenticates the sender, sends private payloads, records success and keeps failures retryable',async()=>{
 const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const privateKey=Buffer.from(await crypto.subtle.exportKey('pkcs8',keys.privateKey)).toString('base64');
 const env={SUPABASE_URL:'https://local.test',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'service'};
 let handler,authorized=true,approved=true,sender='alexa',sent=false,fail=false,claims=0;const payloads=[],finishes=[];
 const originalFetch=globalThis.fetch;
 globalThis.Deno={env:{get:key=>env[key]},serve:fn=>handler=fn};
 globalThis.__pushClient=(url,key)=>key==='service'?{rpc:async(name,args)=>{
  if(name==='nestle_push_jobs'){claims++;return {data:sent?[]:[{message_id:args.p_message,user_id:'recipient',token:'private-recipient-token'}]};}
  finishes.push(args);if(args.p_sent)sent=true;return {data:null};
 }}:{auth:{getUser:async()=>({data:{user:authorized?{id:'sender'}:null},error:null})},rpc:async()=>({data:approved}),from:table=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:table==='nestle_profile_devices'?{profile_id:'alexa'}:{sender}})})})})};
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('oauth2.googleapis.com'))return Response.json({access_token:'fake-oauth-token',expires_in:3600});
  assert.equal(options.headers.Authorization,'Bearer fake-oauth-token');payloads.push(JSON.parse(options.body));return Response.json(fail?{error:'temporary'}:{name:'sent'},{status:fail?503:200});
 };
 const call=async body=>{const r=await handler(new Request('https://local.test/chat-push',{method:'POST',body:JSON.stringify(body)}));return {status:r.status,data:await r.json()};};
 try{
  const source=await readFile(new URL('../backend/functions/chat-push/index.ts',import.meta.url),'utf8');
  const {code}=await transform(source.replace(/^import .*createClient.*;\r?\n/,'const createClient=globalThis.__pushClient;\n'),{loader:'ts',format:'esm'});
  await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  assert.deepEqual((await call({action:'status'})).data,{configured:false});
  const message_id='00000000-1111-4111-8111-000000000001';
  authorized=false;assert.equal((await call({message_id})).status,401);authorized=true;
  approved=false;assert.equal((await call({message_id})).status,403);approved=true;
  sender='harry';assert.equal((await call({message_id})).status,403);sender='alexa';assert.equal(claims,0);
  env.FIREBASE_SERVICE_ACCOUNT=JSON.stringify({project_id:'test-project',client_email:'test@example.test',private_key:`-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`});
  fail=true;assert.equal((await call({message_id})).data.sent,0);assert.equal(finishes.at(-1).p_sent,false);
  fail=false;assert.equal((await call({message_id})).data.sent,1);assert.equal(finishes.at(-1).p_sent,true);
  assert.equal((await call({message_id})).data.sent,0);assert.equal(payloads.length,2);
  assert.deepEqual(payloads[0].message.notification,{title:'Nestle',body:'You have a new private message.'});
  assert.deepEqual(payloads[0].message.data,{message_id});assert.equal(payloads[0].message.token,'private-recipient-token');assert.equal(payloads[0].message.apns.payload.aps.sound,'default');
 }finally{globalThis.fetch=originalFetch;delete globalThis.Deno;delete globalThis.__pushClient;}
});
