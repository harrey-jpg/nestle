import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Content-Type':'application/json'};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:cors});
const base64=(data:string|Uint8Array)=>btoa(typeof data==='string'?unescape(encodeURIComponent(data)):String.fromCharCode(...data)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
let cached:{token:string,expires:number}|null=null;
async function googleToken(account:any){
 if(cached&&cached.expires>Date.now()+60000)return cached.token;
 const now=Math.floor(Date.now()/1000),head=base64(JSON.stringify({alg:'RS256',typ:'JWT'})),body=base64(JSON.stringify({iss:account.client_email,scope:'https://www.googleapis.com/auth/firebase.messaging',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
 const pem=account.private_key.replace(/-----[^-]+-----|\s/g,''),key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(`${head}.${body}`));
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:`${head}.${body}.${base64(new Uint8Array(signature))}`})});
 const data=await response.json();if(!response.ok||!data.access_token)throw new Error('Push authorization failed');
 cached={token:data.access_token,expires:Date.now()+data.expires_in*1000};return cached.token;
}
Deno.serve(async request=>{
 if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(request.method!=='POST')return reply({error:'POST required'},405);
 try{
  const body=await request.json(),secret=Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
  if(body.action==='status')return reply({configured:Boolean(secret)});
  const url=Deno.env.get('SUPABASE_URL')!,admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const dispatchSecret=Deno.env.get('PUSH_DISPATCH_SECRET'),dispatch=Boolean(dispatchSecret&&request.headers.get('x-nestle-push-secret')===dispatchSecret);
  const header=request.headers.get('Authorization')||'',client=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:header}}});
  if(!dispatch){
  const {data:{user},error}=await client.auth.getUser();if(error||!user)return reply({error:'Sign in required'},401);
  const {data:device}=await client.from('nestle_profile_devices').select('profile_id').eq('user_id',user.id).maybeSingle();
  const {data:approved}=await client.rpc('is_nestle_device');
  if(!device||!approved)return reply({error:'Connected device required'},403);
  if(!/^[a-f0-9-]{36}$/i.test(body.message_id||''))return reply({error:'Message required'},400);
  const {data:message}=await client.from('nestle_messages').select('sender').eq('id',body.message_id).maybeSingle();
  if(message?.sender!==device.profile_id)return reply({error:'Own message required'},403);
  }
  if(!/^[a-f0-9-]{36}$/i.test(body.message_id||''))return reply({error:'Message required'},400);
  if(!secret)return reply({configured:false,sent:0});
  const account=JSON.parse(secret),token=await googleToken(account);
  const {data:jobs,error:jobsError}=await admin.rpc('nestle_push_jobs',{p_message:body.message_id});if(jobsError)throw jobsError;
  let sent=0;
  for(const job of jobs||[]){
   const response=await fetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(account.project_id)}/messages:send`,{method:'POST',signal:AbortSignal.timeout(30000),headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({message:{token:job.token,notification:{title:'Nestle',body:'You have a new private message.'},data:{message_id:job.message_id},android:{priority:'high',collapse_key:job.message_id},apns:{headers:{'apns-collapse-id':job.message_id},payload:{aps:{sound:'default'}}}}})});
   await admin.rpc('finish_nestle_push',{p_message:job.message_id,p_user:job.user_id,p_sent:response.ok});if(response.ok)sent++;
  }
  return reply({configured:true,sent});
 }catch{return reply({error:'Notification delivery paused. The message remains saved.'},503);}
});
