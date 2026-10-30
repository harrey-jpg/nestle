export const messageLimit=4000;
const fields='id,seq,sender,body,attachment_path,created_at,delivered_at,read_at';
export function messageText(value){
  const body=String(value??'').trim();
  if(!body)throw new Error('Write a message first.');
  if(Array.from(body).length>messageLimit)throw new Error('Keep your message within 4,000 characters.');
  return body;
}
export function mergeMessage(previous,next){
  if(!previous)return {...next};
  return {...previous,...next,delivered_at:next.delivered_at||previous.delivered_at||null,read_at:next.read_at||previous.read_at||null};
}
export function messageStatus(message){
  return message.local==='failed'?'Not sent':message.local==='sending'?'Sending…':message.read_at?'Seen':message.delivered_at?'Delivered':'Sent';
}
function checked(result){if(result.error)throw new Error(result.error.message||'Couldn’t connect to your messages.');return result.data;}
export class MessageStore {
  constructor(client,profile){this.client=client;this.profile=profile;this.messages=new Map();this.cursor=null;this.hasOlder=false;}
  merge(rows){for(const row of rows||[])this.messages.set(row.id,mergeMessage(this.messages.get(row.id),row));}
  snapshot(){return [...this.messages.values()].sort((a,b)=>a.seq-b.seq);}
  async poll(){
    if(this.cursor===null){
      const rows=checked(await this.client.from('nestle_messages').select(fields).order('seq',{ascending:false}).limit(50));
      this.merge(rows);this.hasOlder=rows.length===50;this.cursor=rows.length?Math.max(...rows.map(row=>row.seq)):0;
    }else{
      // Fetch cursor is independent of local sends, which may confirm ahead of unseen incoming rows.
      for(let page=0;page<5;page++){
        const rows=checked(await this.client.from('nestle_messages').select(fields).gt('seq',this.cursor).order('seq',{ascending:true}).limit(100));
        this.merge(rows);if(rows.length)this.cursor=Math.max(...rows.map(row=>row.seq));if(rows.length<100)break;
      }
    }
    const pending=this.snapshot().filter(row=>row.sender===this.profile&&!row.read_at).map(row=>row.id);
    for(let offset=0;offset<pending.length;offset+=100)
      this.merge(checked(await this.client.from('nestle_messages').select(fields).in('id',pending.slice(offset,offset+100))));
    return this.snapshot();
  }
  async older(){
    const first=this.snapshot()[0];if(!first){this.hasOlder=false;return;}
    const rows=checked(await this.client.from('nestle_messages').select(fields).lt('seq',first.seq).order('seq',{ascending:false}).limit(50));
    this.merge(rows);this.hasOlder=rows.length===50;
  }
  async send(id,body,path=null){
    if(path&&Array.from(String(body).trim()).length>messageLimit)throw new Error('Keep your caption within 4,000 characters.');
    const rows=checked(await this.client.rpc(path?'send_nestle_media_message':'send_nestle_message',path?{p_id:id,p_body:String(body).trim(),p_path:path}:{p_id:id,p_body:messageText(body)}));
    if(!rows?.[0])throw new Error('Your message wasn’t saved. Please retry.');this.merge(rows);return rows[0];
  }
  async acknowledge(ids,read=false){
    for(let offset=0;offset<ids.length;offset+=100)
      this.merge(checked(await this.client.rpc('ack_nestle_messages',{p_ids:ids.slice(offset,offset+100),p_read:read})));
  }
  async unread(){
    const result=await this.client.from('nestle_messages').select('id',{head:true,count:'exact'}).neq('sender',this.profile).is('read_at',null);
    checked(result);return result.count||0;
  }
}
