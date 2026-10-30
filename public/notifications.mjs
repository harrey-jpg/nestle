import {native,platform,messaging} from './assets/vendor/native-bridge.mjs';
export async function startNotifications(shared,{refresh,open}){
  const button=document.querySelector('#enable-notifications'),hint=document.querySelector('#message-hint');
  const say=text=>hint.textContent=text;
  let enabled=false;
  const user=(await shared.client.auth.getUser()).data.user;
  if(!user)return;
  async function save(token){
    const {error}=await shared.client.from('nestle_push_devices').upsert({user_id:user.id,token,platform,updated_at:new Date().toISOString()});
    if(error)throw error;enabled=true;button.textContent='Turn notifications off';
  }
  if(native){
    await messaging.addListener('tokenReceived',event=>{if(enabled)save(event.token).catch(()=>say('Notification registration failed. Enable notifications again.'));});
    await messaging.addListener('notificationReceived',()=>refresh());
    await messaging.addListener('notificationActionPerformed',()=>{open();refresh();});
    try{
      const {data}=await shared.client.from('nestle_push_devices').select('user_id').eq('user_id',user.id).maybeSingle();
      if(data&&(await messaging.checkPermissions()).receive==='granted')await save((await messaging.getToken()).token);
    }catch{say('Notifications need to be enabled again on this phone.');}
  }
  button.addEventListener('click',async()=>{
    if(!native){say('Device alerts are available in the Android and iPhone app. This preview shows new messages while open.');return;}
    button.disabled=true;
    try{
      if(enabled){
        const {error}=await shared.client.from('nestle_push_devices').delete().eq('user_id',user.id);if(error)throw error;
        enabled=false;button.textContent='Enable notifications';await messaging.deleteToken();say('Notifications are off for this phone.');return;
      }
      const {data,error}=await shared.client.functions.invoke('chat-push',{body:{action:'status'}});
      if(error||!data?.configured){say('Device notifications are waiting for the Firebase and Apple setup.');return;}
      if((await messaging.requestPermissions()).receive!=='granted'){say('Notifications are off. You can allow them in your phone settings.');return;}
      await save((await messaging.getToken()).token);say('Notifications are on for this phone.');
    }catch{say('Notifications couldn’t be enabled. Check your connection and try again.');}
    finally{button.disabled=false;}
  });
}
