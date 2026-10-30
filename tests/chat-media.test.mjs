import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectImage,validMediaPath,uploadImage,mediaLimit} from '../public/chat-media.mjs';
import {MessageStore} from '../public/message-store.mjs';
test('images use file signatures; SVG, disguised files and oversize uploads are rejected',async()=>{
 for(const [bytes,ext] of [[Buffer.from([255,216,255,224]),'jpg'],[Buffer.from('\x89PNG\r\n\x1a\n','binary'),'png'],[Buffer.from('GIF89a'),'gif'],[Buffer.from('RIFFxxxxWEBP'),'webp']]){
  assert.equal((await inspectImage(new Blob([bytes],{type:'text/plain'}))).ext,ext);
 }
 for(const file of [new Blob(['<svg/>'],{type:'image/png'}),new Blob([]),{size:mediaLimit+1}])await assert.rejects(()=>inspectImage(file));
 assert.equal(validMediaPath('alexa/01234567-0123-0123-0123-0123456789ab/image.gif'),true);
 for(const path of ['https://evil/image.png','harry/../image.png','alexa/id/image.svg'])assert.equal(validMediaPath(path),false);
});
test('a lost upload response reuses the immutable path; a missing object fails',async()=>{
 let path,options;const bucket={upload:async(p,file,o)=>{path=p;options=o;return {error:new Error('lost response')};},createSignedUrl:async()=>({data:{signedUrl:'private-url'}})};
 const client={storage:{from:()=>bucket}},id='01234567-0123-0123-0123-0123456789ab';
 assert.equal(await uploadImage(client,'alexa',id,new Blob(['GIF89a'])),`alexa/${id}/image.gif`);
 assert.equal(options.upsert,false);assert.equal(options.contentType,'image/gif');
 bucket.createSignedUrl=async()=>({error:new Error('missing')});await assert.rejects(()=>uploadImage(client,'alexa',id,new Blob(['GIF89a'])));
});
test('photo-only messages use the media RPC and confirmed writes keep the catchup cursor',async()=>{
 let call;const client={rpc:async(name,args)=>{call={name,args};return {data:[{id:args.p_id,seq:10,body:args.p_body,attachment_path:args.p_path}]};}};
 const store=new MessageStore(client,'alexa');store.cursor=3;
 await store.send('id','','alexa/id/image.gif');assert.equal(call.name,'send_nestle_media_message');assert.equal(call.args.p_body,'');assert.equal(store.cursor,3);
 await assert.rejects(()=>store.send('id','🙂'.repeat(4001),'path'));
});
