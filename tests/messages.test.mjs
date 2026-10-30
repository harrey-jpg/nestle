import test from 'node:test';
import assert from 'node:assert/strict';
import {messageText,messageStatus,mergeMessage,MessageStore} from '../public/message-store.mjs';
test('message validation preserves multiline text and limits Unicode characters',()=>{
  assert.equal(messageText('  hello\nthere  '),'hello\nthere');
  assert.equal(messageText('🙂'.repeat(4000)).length,8000);
  for(const value of ['',null,' \n\t','a'.repeat(4001),'🙂'.repeat(4001)])assert.throws(()=>messageText(value));
});
test('message receipts never regress when a stale poll arrives',()=>{
  const seen={id:'one',delivered_at:'2026-10-26T00:00:01Z',read_at:'2026-10-26T00:00:02Z'};
  assert.deepEqual(mergeMessage(seen,{id:'one',delivered_at:null,read_at:null}),seen);
  assert.equal(messageStatus(seen),'Seen');assert.equal(messageStatus({delivered_at:'stamp'}),'Delivered');
  assert.equal(messageStatus({}),'Sent');assert.equal(messageStatus({local:'sending'}),'Sending…');assert.equal(messageStatus({local:'failed'}),'Not sent');
});
test('confirming an outgoing message cannot skip earlier unseen incoming messages',async()=>{
  const row=(seq,sender)=>({id:String(seq),seq,sender,body:String(seq),created_at:'2026-10-26T00:00:00Z'});
  let cursor;
  const client={rpc:async()=>({data:[row(13,'alexa')]}),from(){let ids;const query={
    select(){return query;},gt(key,value){cursor=value;return query;},order(){return query;},limit(){return query;},in(key,value){ids=value;return query;},
    then(resolve,reject){return Promise.resolve({data:ids?[row(13,'alexa')]:[row(11,'harry'),row(12,'harry'),row(13,'alexa')]}).then(resolve,reject);}
  };return query;}};
  const store=new MessageStore(client,'alexa');store.cursor=10;
  await store.send('13','hello');assert.equal(store.cursor,10);
  await store.poll();assert.equal(cursor,10);assert.deepEqual(store.snapshot().map(row=>row.seq),[11,12,13]);assert.equal(store.cursor,13);
});
