import test from 'node:test';
import assert from 'node:assert/strict';
import {SharedHome,profiles} from '../public/shared-home.mjs';
test('first launch connects either fixed profile without a setup link and restores it',async()=>{
  assert.deepEqual(Object.keys(profiles),['alexa','harry']);
  assert.equal(profiles.alexa.character,'long_hair');assert.equal(profiles.harry.character,'short_hair');
  for(const profile of Object.keys(profiles)){
    let session=null,signIns=0,claims=0;
    const client={auth:{
      getSession:async()=>({data:{session}}),
      signInAnonymously:async()=>{signIns++;session={user:{id:'device'}};return {data:{session}};}
    },rpc:async(name,args)=>{
      claims++;assert.equal(name,'connect_nestle');assert.deepEqual(args,{p_profile:profile});
      assert.ok(session);return {data:profile};
    },from(table){const query={select(){return query;},eq(){return query;},is(){return query;},
      maybeSingle:async()=>({data:table==='nestle_profile_devices'?{profile_id:profile}:{user_id:'device'}})};return query;}};
    const home=new SharedHome(client);
    assert.equal(await home.connect(profile),profile);assert.equal(home.profile,profile);
    const reopened=new SharedHome(client);assert.equal(await reopened.restore(),profile);
    assert.equal(signIns,1);assert.equal(claims,1);
    await assert.rejects(()=>home.connect('stranger'),/Choose Alexa or Harry/);
    assert.equal(claims,1);
  }
});
test('connection failures never set a profile or continue after failed sign-in',async()=>{
  let claims=0;
  const client={auth:{getSession:async()=>({data:{session:null}}),signInAnonymously:async()=>({error:{message:'Offline'}})},rpc:async()=>{claims++;return {error:{message:'Unavailable'}};}};
  const home=new SharedHome(client);
  await assert.rejects(()=>home.connect('harry'),/Offline/);assert.equal(claims,0);assert.equal(home.profile,null);
  client.auth.getSession=async()=>({data:{session:{user:{id:'device'}}}});
  await assert.rejects(()=>home.connect('harry'),/Unavailable/);assert.equal(home.profile,null);
});
test('rapid own-expression writes serialize against the latest server revision',async()=>{
  let revision=0;const writes=[];
  const client={from(){let expression,expected;const query={
    update(value){expression=value.expression;return query;},eq(key,value){if(key==='revision')expected=value;return query;},select(){return query;},
    async maybeSingle(){assert.equal(expected,revision);writes.push(expression);return {data:{profile_id:'harry',character_id:'short_hair',expression,revision:++revision},error:null};}
  };return query;}};
  const home=new SharedHome(client);home.profile='harry';home.rows=[{profile_id:'harry',revision:0}];
  await Promise.all([home.saveExpression('sad'),home.saveExpression('happy'),home.saveExpression('kissing')]);
  assert.deepEqual(writes,['sad','happy','kissing']);assert.equal(home.rows[0].revision,3);
  await assert.rejects(()=>home.saveExpression('invalid'));
});
test('an older poll cannot roll back a confirmed expression revision',async()=>{
  const client={from(table){return {select(){return table==='nestle_profiles'?Promise.resolve({data:[
    {profile_id:'alexa',character_id:'long_hair',expression:'neutral',revision:1},
    {profile_id:'harry',character_id:'short_hair',expression:'neutral',revision:0}
  ]}):{eq(){return {single:async()=>({data:{poses:{long_hair:'reading',short_hair:'gaming'}}})};}};}};}};
  const home=new SharedHome(client);
  home.rows=[{profile_id:'alexa',character_id:'long_hair',expression:'happy',revision:2}];
  const read=await home.read();assert.equal(read.moods.long_hair,'happy');assert.equal(home.rows[0].revision,2);
});
