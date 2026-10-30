import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

async function load(){
  const bytes=await readFile(new URL('../public/assets/original/nestle-original-v1.glb',import.meta.url));
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);
  assert.equal(bytes.readUInt32LE(8),bytes.length);
  const jsonLength=bytes.readUInt32LE(12);
  const gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8'));
  return {gltf,bytes,binOffset:28+jsonLength};
}

test('original GLB contains interchangeable modules, one shared rig, and facial targets',async()=>{
  const {gltf:g}=await load();
  assert.equal(g.skins.length,1,'All modules share one skeleton');
  for(const hair of ['SoftCrop','SideSwept','Bob','LongFringe','CurlyPuff','LowPonytail'])assert.ok(g.nodes.some(n=>n.name==='Hair_'+hair),hair);
  for(const outfit of ['Hoodie','TShirt','Sweater','Dress'])assert.ok(g.nodes.some(n=>n.name==='Outfit_'+outfit),outfit);
  const mouth=g.meshes.find(m=>m.name==='Mouth');assert.ok(mouth);
  for(const expression of ['Happy','Sad','Sleepy','Surprised','Affectionate'])assert.ok(mouth.extras.targetNames.includes(expression),expression);
  for(const n of g.nodes.filter(n=>n.mesh!==undefined))assert.equal(n.skin,0,`${n.name} must use shared skin`);
  assert.ok(g.skins[0].joints.length>=16);
  assert.ok(!JSON.stringify(g).includes('Quaternius'),'No source assets reused');
});

test('starter clips animate only valid skeleton targets and all buffers stay in range',async()=>{
  const {gltf:g,bytes,binOffset}=await load();
  for(const name of ['Idle','Walk','Wave','Sit','Dance','Hug']){
    const clip=g.animations.find(a=>a.name===name);assert.ok(clip,`Missing ${name}`);
    assert.ok(clip.channels.length>0);
    for(const ch of clip.channels)assert.ok(g.nodes[ch.target.node]);
  }
  for(const view of g.bufferViews)assert.ok(binOffset+(view.byteOffset||0)+view.byteLength<=bytes.length);
  for(const a of g.accessors)for(const value of [...(a.min||[]),...(a.max||[])])assert.ok(Number.isFinite(value));
  assert.ok(bytes.length<8*1024*1024,'Mobile bundle should stay below 8 MB for this base');
});

test('Three.js loads the exported rig and evaluates each animation without exploding geometry',async()=>{
  const {bytes}=await load();
  const data=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
  const asset=await new GLTFLoader().parseAsync(data,'');
  const mixer=new THREE.AnimationMixer(asset.scene);
  for(const clip of asset.animations){
    mixer.stopAllAction();const action=mixer.clipAction(clip);action.play();
    for(const time of [0,.5,1.8]){
      mixer.setTime(time);asset.scene.updateMatrixWorld(true);
      const bounds=new THREE.Box3().setFromObject(asset.scene);
      for(const value of [...bounds.min.toArray(),...bounds.max.toArray()])assert.ok(Number.isFinite(value),clip.name);
      assert.ok(bounds.getSize(new THREE.Vector3()).length()<5,`${clip.name}: deformation stays within character scale`);
    }
  }
});

test('wave raises a hand, sitting lowers the pelvis with feet forward, and hug reaches forward',async()=>{
  const {bytes}=await load();
  const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const mixer=new THREE.AnimationMixer(asset.scene);
  const position=(clip,bone)=>{
    mixer.stopAllAction();mixer.clipAction(asset.animations.find(c=>c.name===clip)).play();mixer.setTime(1);asset.scene.updateMatrixWorld(true);
    return asset.scene.getObjectByName(bone).getWorldPosition(new THREE.Vector3());
  };
  assert.ok(position('Wave','Hand_R').y>position('Idle','Hand_R').y+.4);
  assert.ok(position('Sit','Root').y<-.15);
  const foot=position('Sit','Foot_R');assert.ok(foot.z>.15&&foot.y>.05&&foot.y<.2);
  assert.ok(position('Hug','Hand_R').z>.2);
});

test('continuous sleeves and trousers blend across elbow and knee bones with normalized weights',async()=>{
  const {bytes}=await load();
  const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const joints=new Set();
  asset.scene.getObjectByName('Outfit_Hoodie').traverse(node=>{
    if(!node.isSkinnedMesh)return;
    const indices=node.geometry.attributes.skinIndex,weights=node.geometry.attributes.skinWeight;
    for(let v=0;v<weights.count;v++){
      let total=0;const blended=[];
      for(let i=0;i<4;i++){
        const weight=weights.getComponent(v,i);total+=weight;
        if(weight>.01&&weight<.99)blended.push(node.skeleton.bones[indices.getComponent(v,i)].name);
      }
      assert.ok(Math.abs(total-1)<.0001,'Skin weights must sum to one');
      for(const side of ['L','R'])for(const pair of [[`UpperArm_${side}`,`Forearm_${side}`],[`Thigh_${side}`,`Shin_${side}`]]){
        if(pair.every(b=>blended.includes(b)))joints.add(pair.join('/'));
      }
    }
  });
  assert.equal(joints.size,4,'Both sleeves and trouser legs need blended joints');
});
