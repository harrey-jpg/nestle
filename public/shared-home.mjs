import {expressions} from './character-state.mjs';
import {normalizeMoment} from './room-activities.mjs';

export const profiles=Object.freeze({alexa:Object.freeze({name:'Alexa',character:'long_hair'}),harry:Object.freeze({name:'Harry',character:'short_hair'})});
export const sharedConfig=Object.freeze({url:'https://nvokjxwkqtgwdsyozspz.supabase.co',key:'sb_publishable_JnmLr8RPQRc1ydAzvNW9iQ_yL3xCEUN'});
function failure(error) {if(error)throw new Error(error.message||'Could not connect to your home');}
export class SharedHome {
  constructor(client){this.client=client;this.profile=null;this.rows=[];this.queue=Promise.resolve();}
  async restore(){
    const {data,error}=await this.client.auth.getSession();failure(error);
    if(!data.session)return null;
    const result=await this.client.from('nestle_profile_devices').select('profile_id').eq('user_id',data.session.user.id).maybeSingle();failure(result.error);
    if(!result.data)return null;
    const approval=await this.client.from('nestle_devices').select('user_id').eq('user_id',data.session.user.id).is('revoked_at',null).maybeSingle();failure(approval.error);
    if(!approval.data)throw new Error('This device is no longer connected to your home.');
    this.profile=result.data.profile_id;
    if(!profiles[this.profile])throw new Error('Unknown profile');return this.profile;
  }
  async connect(profile){
    if(!profiles[profile])throw new Error('Choose Alexa or Harry.');
    const session=await this.client.auth.getSession();failure(session.error);
    if(!session.data.session){const signed=await this.client.auth.signInAnonymously();failure(signed.error);}
    const result=await this.client.rpc('connect_nestle',{p_profile:profile});failure(result.error);
    if(!profiles[result.data])throw new Error('Could not connect this profile.');this.profile=result.data;return this.profile;
  }
  async read(){
    const [people,room]=await Promise.all([
      this.client.from('nestle_profiles').select('profile_id,character_id,expression,revision'),
      this.client.from('nestle_room').select('poses,revision').eq('id',1).single()
    ]);failure(people.error);failure(room.error);
    if(people.data?.length!==2)throw new Error('This device cannot open the private home.');
    // A poll that started before an expression write must not replace its newer revision.
    const rows=people.data.map(row=>{
      const cached=this.rows.find(item=>item.profile_id===row.profile_id);
      return cached&&cached.revision>row.revision?cached:row;
    });
    const moods={};for(const row of rows){
      if(!profiles[row.profile_id]||row.character_id!==profiles[row.profile_id].character||!expressions.includes(row.expression))throw new Error('Invalid shared character state.');
      moods[row.character_id]=row.expression;
    }
    const poses=normalizeMoment(room.data.poses);if(!poses)throw new Error('Invalid shared activity.');
    this.rows=rows;return {moods,poses};
  }
  saveExpression(mood){
    const write=this.queue.then(async()=>{
      if(!this.profile||!expressions.includes(mood))throw new Error('Choose a valid expression.');
      const row=this.rows.find(row=>row.profile_id===this.profile);if(!row)throw new Error('Reconnect to your home.');
      const result=await this.client.from('nestle_profiles').update({expression:mood})
        .eq('profile_id',this.profile).eq('revision',row.revision).select('profile_id,character_id,expression,revision').maybeSingle();
      failure(result.error);
      if(!result.data){await this.read();throw new Error('Your expression changed on another device. Please choose again.');}
      this.rows=this.rows.map(row=>row.profile_id===this.profile?result.data:row);return result.data;
    });this.queue=write.catch(()=>{});return write;
  }
  async advance(){const result=await this.client.rpc('advance_nestle_room');failure(result.error);const poses=normalizeMoment(result.data?.[0]?.poses);if(!poses)throw new Error('Could not load the shared routine.');return poses;}
}
