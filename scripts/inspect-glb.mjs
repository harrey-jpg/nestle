import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const b=await readFile('public/assets/original/nestle-original-v1.glb');
const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
const mixer=new THREE.AnimationMixer(g.scene);
for(const clip of g.animations){
 mixer.stopAllAction();mixer.clipAction(clip).play();mixer.setTime(1);g.scene.updateMatrixWorld(true);
 console.log(clip.name,JSON.stringify(Object.fromEntries(['Root','Hand_R','Thigh_R','Shin_R','Foot_R'].map(name=>[name,g.scene.getObjectByName(name).getWorldPosition(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3))]))));
}
