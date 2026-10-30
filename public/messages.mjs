import {profiles} from './shared-home.mjs';
import {MessageStore,messageText,messageStatus,messageLimit} from './message-store.mjs';
import {inspectImage,uploadImage,showMedia,validMediaPath} from './chat-media.mjs';
import {startNotifications} from './notifications.mjs';

export function startMessages(shared){
  const $=selector=>document.querySelector(selector),profile=shared.profile;
  const store=new MessageStore(shared.client,profile),partner=profile==='alexa'?'harry':'alexa';
  const list=$('#message-list'),input=$('#message-body'),nodes=new Map();
  const files=new Map();let attachment=null,previewUrl=null,toastTimer,followLatest=true;
  const timeFormat=new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const draftKey=`nestle-message-draft-${profile}`,outboxKey=`nestle-message-outbox-${profile}`;
  let active=false,connected=false,initialized=false,polling=false,reading=false,sending=Promise.resolve();
  function saved(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
  function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Keep this visit's draft/outbox in memory. */}}
  const stored=saved(outboxKey,[]);
  let outbox=(Array.isArray(stored)?stored:[]).filter(row=>{
    try{return row.sender===profile&&/^[a-f0-9-]{36}$/i.test(row.id)&&(validMediaPath(row.attachment_path)||Boolean(messageText(row.body)));}catch{return false;}
  }).map(row=>({...row,local:'failed'}));
  input.value=String(saved(draftKey,''));
  $('#messages-subtitle').textContent=`Just you and ${profiles[partner].name}.`;
  $('#messages-portrait').src=`/assets/couple/portrait_${profiles[partner].character}_neutral.png`;
  $('#app-navigation').hidden=false;
  function say(node,text){if(node.textContent!==text)node.textContent=text;}
  function controls(){
    const length=Array.from(input.value.trim()).length;
    $('#send-message').disabled=!connected||!initialized||(!attachment&&length===0)||length>messageLimit;
  }
  function connection(ok){
    connected=ok;controls();$('#messages-refresh').hidden=ok;
    say($('#messages-connection'),ok?'Your private conversation':'Connection paused · Reconnecting…');
  }
  async function unread(){
    const count=await store.unread();$('#messages-badge').hidden=count===0;
    say($('#messages-badge'),count>99?'99+':String(count));
    $('#nav-messages').setAttribute('aria-label',count?`Messages, ${count} unread`:'Messages');
  }
  function render(forceBottom=false,keepPosition=false){
    const nearBottom=list.scrollHeight-list.scrollTop-list.clientHeight<48;
    const confirmed=store.snapshot(),known=new Set(confirmed.map(row=>row.id));
    const remaining=outbox.filter(row=>!known.has(row.id));
    if(remaining.length!==outbox.length){outbox=remaining;persist(outboxKey,outbox);}
    const rows=[...confirmed,...outbox],keep=new Set();
    rows.forEach((row,index)=>{
      let node=nodes.get(row.id);
      if(!node){
        node=document.createElement('article');node.className='message-item';node.dataset.messageId=row.id;
        node.innerHTML='<div class="message-meta"><span></span><time></time></div><img class="message-image" alt="" hidden><p class="message-body"></p><div class="message-footer"><span class="message-status"></span><button type="button" class="message-retry" hidden>Retry</button><button type="button" class="message-discard message-retry" hidden>Remove</button></div>';
        node.querySelector('.message-retry').addEventListener('click',()=>retry(row.id));nodes.set(row.id,node);
        node.querySelector('.message-image').addEventListener('load',()=>{if(active&&followLatest)list.scrollTop=list.scrollHeight;});
        node.querySelector('.message-discard').addEventListener('click',()=>{outbox=outbox.filter(item=>item.id!==row.id);files.delete(row.id);persist(outboxKey,outbox);render();});
      }
      const own=row.sender===profile;node.classList.toggle('own',own);
      say(node.querySelector('.message-meta span'),own?'You':profiles[partner].name);
      const time=node.querySelector('time'),date=new Date(row.created_at);
      time.dateTime=Number.isFinite(date.getTime())?date.toISOString():'';
      say(time,Number.isFinite(date.getTime())?timeFormat.format(date):'Just now');
      say(node.querySelector('.message-body'),row.body);
      if(row.attachment_path&&!row.local)showMedia(shared.client,node.querySelector('.message-image'),row.attachment_path);
      say(node.querySelector('.message-status'),own?messageStatus(row):'');
      node.querySelector('.message-retry').hidden=row.local!=='failed';
      node.querySelector('.message-discard').hidden=row.local!=='failed';
      if(list.children[index]!==node)list.insertBefore(node,list.children[index]||null);
      keep.add(row.id);
    });
    for(const [id,node]of nodes)if(!keep.has(id)){node.remove();nodes.delete(id);}
    $('#messages-empty').hidden=!initialized||rows.length>0;
    $('#load-older-messages').hidden=!store.hasOlder;
    if(active&&!keepPosition&&(forceBottom||nearBottom)){followLatest=true;list.scrollTop=list.scrollHeight;}
    controls();if(active)requestAnimationFrame(markVisible);
  }
  async function markVisible(){
    if(!active||document.hidden||reading||!connected)return;
    const bounds=list.getBoundingClientRect();
    const ids=store.snapshot().filter(row=>{
      if(row.sender===profile||row.read_at)return false;
      const node=nodes.get(row.id);if(!node)return false;
      const rect=node.getBoundingClientRect();return rect.bottom>bounds.top+8&&rect.top<bounds.bottom-8;
    }).slice(0,100).map(row=>row.id);
    if(!ids.length)return;reading=true;
    try{await store.acknowledge(ids,true);await unread();render();}
    catch{connection(false);}finally{reading=false;}
  }
  async function refresh(){
    if(polling||document.hidden)return;polling=true;
    try{
      await store.poll();initialized=true;
      const incoming=store.snapshot().filter(row=>row.sender!==profile&&!row.delivered_at).map(row=>row.id);
      if(incoming.length)await store.acknowledge(incoming);
      await unread();connection(true);render();
    }catch{connection(false);}finally{polling=false;}
  }
  function retry(id){
    const row=outbox.find(row=>row.id===id);if(!row)return;
    if(!connected){say($('#message-hint'),'Reconnect before retrying. Your message is kept here.');return;}
    row.local='sending';persist(outboxKey,outbox);render(true);
    const write=sending.then(async()=>{
      try{
        if(files.has(row.id)){row.attachment_path=await uploadImage(shared.client,profile,row.id,files.get(row.id));persist(outboxKey,outbox);}
        await store.send(row.id,row.body,row.attachment_path);files.delete(row.id);say($('#message-hint'),'Message sent.');
        shared.client.functions.invoke('chat-push',{body:{message_id:row.id}}).catch(()=>{});
      }
      catch{if(!store.messages.has(row.id)){row.local='failed';say($('#message-hint'),row.attachment_path?'Photo not sent. Retry, or remove it and attach the photo again.':'Message not sent. Use Retry to send it once you’re connected.');}}
      finally{persist(outboxKey,outbox);render();}
    });sending=write.catch(()=>{});
  }
  input.addEventListener('input',()=>{persist(draftKey,input.value);controls();
    const length=Array.from(input.value.trim()).length;
    say($('#message-hint'),length>messageLimit?'Keep your message within 4,000 characters.':'Only Alexa and Harry can open this conversation.');
  });
  $('#message-form').addEventListener('submit',event=>{
    event.preventDefault();
    if(!connected||!initialized){say($('#message-hint'),'You’re offline. Your draft stays here while you reconnect.');return;}
    let body;try{body=attachment?input.value.trim():messageText(input.value);if(Array.from(body).length>messageLimit)throw new Error('Keep your caption within 4,000 characters.');}catch(error){say($('#message-hint'),error.message);return;}
    const row={id:crypto.randomUUID(),sender:profile,body,created_at:new Date().toISOString(),local:'sending'};
    if(attachment){files.set(row.id,attachment.file);row.attachment_path=`${profile}/${row.id}/image.${attachment.ext}`;clearAttachment();}
    outbox.push(row);persist(outboxKey,outbox);input.value='';persist(draftKey,'');retry(row.id);
  });
  input.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('#message-form').requestSubmit();}
  });
  $('#load-older-messages').addEventListener('click',async()=>{
    $('#load-older-messages').disabled=true;const height=list.scrollHeight;
    try{await store.older();render(false,true);list.scrollTop+=list.scrollHeight-height;}
    catch{say($('#messages-connection'),'Earlier messages couldn’t load. Please try again.');}
    finally{$('#load-older-messages').disabled=false;}
  });
  async function view(messages){
    if(document.fullscreenElement){try{await document.exitFullscreen();}catch{return;}}
    if(!$('#expression-panel').hidden)$('#expression-close').click();
    active=messages;document.body.dataset.view=messages?'messages':'home';
    $('#messages-panel').hidden=!messages;
    $('#nav-home').setAttribute('aria-pressed',String(!messages));$('#nav-messages').setAttribute('aria-pressed',String(messages));
    $(messages?'#nav-messages':'#nav-home').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});if(messages){render(true);refresh();markVisible();}
  }
  $('#nav-home').addEventListener('click',()=>view(false));$('#nav-messages').addEventListener('click',()=>view(true));
  $('#message-toast').addEventListener('click',()=>{clearTimeout(toastTimer);$('#message-toast').hidden=true;view(true);});
  function notify(){if(!active&&!document.hidden){say($('#message-toast'),`${profiles[partner].name} sent you a message · Open chat`);$('#message-toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#message-toast').hidden=true,8000);}}
  shared.client.channel(`messages-${profile}`).on('postgres_changes',{event:'*',schema:'public',table:'nestle_messages'},event=>{
    if(event.eventType==='INSERT'&&event.new.sender===partner)notify();refresh();
  }).subscribe();
  startNotifications(shared,{refresh,open:()=>view(true)});
  function clearAttachment(){attachment=null;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;$('#attachment-preview').hidden=true;$('#message-photo').value='';controls();}
  $('#attach-photo').addEventListener('click',()=>$('#message-photo').click());
  $('#remove-attachment').addEventListener('click',clearAttachment);
  $('#message-photo').addEventListener('change',async()=>{
    const file=$('#message-photo').files[0];if(!file)return;
    try{const info=await inspectImage(file);clearAttachment();attachment={file,...info};previewUrl=URL.createObjectURL(file);$('#attachment-image').src=previewUrl;$('#attachment-name').textContent=file.name;$('#attachment-preview').hidden=false;say($('#message-hint'),'Ready to send. Add a caption if you like.');controls();}
    catch(error){say($('#message-hint'),error.message);$('#message-photo').value='';}
  });
  const picker=$('#emoji-picker'),emojiButton=$('#pick-emoji');
  for(const emoji of ['❤️','🥰','😘','😂','🥹','😊','😍','🤗','💕','🌙','☀️','✨','😭','😤','👍','🎮']){
    const button=document.createElement('button');button.type='button';button.textContent=emoji;button.setAttribute('aria-label',`Insert ${emoji}`);
    button.addEventListener('click',()=>{input.setRangeText(emoji,input.selectionStart,input.selectionEnd,'end');input.dispatchEvent(new Event('input'));input.focus();});picker.append(button);
  }
  emojiButton.addEventListener('click',()=>{picker.hidden=!picker.hidden;emojiButton.setAttribute('aria-expanded',String(!picker.hidden));});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!picker.hidden){picker.hidden=true;emojiButton.setAttribute('aria-expanded','false');emojiButton.focus();}});
  $('#messages-refresh').addEventListener('click',refresh);list.addEventListener('scroll',()=>{followLatest=list.scrollHeight-list.scrollTop-list.clientHeight<48;markVisible();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){refresh();markVisible();}});
  window.addEventListener('focus',()=>{refresh();markVisible();});
  window.addEventListener('online',refresh);window.addEventListener('offline',()=>{connection(false);say($('#message-hint'),'Offline · Your draft stays here while you reconnect.');});
  setInterval(refresh,2500);refresh();
  return {refresh};
}
