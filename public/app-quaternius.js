import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const $ = (selector) => document.querySelector(selector);
const icons = {
  moon:'<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  drag:'<path d="M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4"/>',
  edit:'<path d="m14 5 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14Z"/>',
  idle:'<path d="M8 21v-7m8 7v-7M6 14l2-6h8l2 6M9 14h6"/><circle cx="12" cy="4" r="2"/>',
  walk:'<circle cx="14" cy="4" r="2"/><path d="m8 21 4-7 3 3v4M5 12l5-4 4 2 4 3h3m-9 1 2-6"/>',
  wave:'<path d="M8 21v-7l-3-3a2 2 0 0 1 3-2l2 2V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v9c0 3-1 5-2 7M3 4 1 3m3 4H1"/>',
  save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h10V3M7 21v-8h10v8"/>'
};
const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
$('#reset-view').innerHTML = svg('reset'); $('#drag-icon').innerHTML = svg('drag'); $('#save-icon').innerHTML = svg('save');
document.querySelectorAll('.edit-icon').forEach(el => el.innerHTML = svg('edit'));
document.querySelectorAll('.anim-icon').forEach(el => el.innerHTML = svg(el.dataset.icon));

const headOptions = ['Casual_Hoodie','Casual_2','Beach','Punk'];
const outfitOptions = ['Casual_Hoodie','Casual_2','Beach','Farmer','Suit'];
const defaults = [
  {name:'Mika',head:'Casual_Hoodie',outfit:'Casual_Hoodie',skin:'#dfac80',hair:'#3b2632',color:'#cf839b',animation:'Idle'},
  {name:'Jun',head:'Casual_2',outfit:'Casual_2',skin:'#be855d',hair:'#4c3024',color:'#89a484',animation:'Idle'}
];
const palettes = {
  skin:[['Porcelain','#f6d6bb'],['Peach','#dfac80'],['Honey','#be855d'],['Caramel','#995f40'],['Deep','#663f2d']],
  hair:[['Espresso','#3b2632'],['Chestnut','#4c3024'],['Golden','#c29a55'],['Rose','#bb6f89'],['Lavender','#82729b']],
  color:[['Rose','#cf839b'],['Sage','#89a484'],['Sky','#85a9be'],['Lavender','#a38cb8'],['Cream','#ddc8a2']]
};
let people = structuredClone(defaults), selected = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches, theme = 'pink';
try {
  const saved = JSON.parse(localStorage.getItem('nestle-avatars-v1'));
  if (saved?.people?.length === 2) people = saved.people.map((p,i) => ({
    name:typeof p.name==='string'?p.name.slice(0,20):defaults[i].name,
    head:headOptions.includes(p.head)?p.head:defaults[i].head,
    outfit:outfitOptions.includes(p.outfit)?p.outfit:defaults[i].outfit,
    ...Object.fromEntries(['skin','hair','color'].map(k=>[k,/^#[0-9a-f]{6}$/i.test(p[k])?p[k]:defaults[i][k]])),
    animation:'Idle'
  }));
  theme = localStorage.getItem('nestle-theme') === 'dark' ? 'dark' : 'pink';
} catch { /* Local storage may be unavailable; the preview still works. */ }

const assetCache = new Map(), characters = [null,null];
let scene, renderer, camera, controls, room, clock, accentMaterials = {}, ready = false;
const loader = new GLTFLoader();
const errors = [];
function loadAsset(name) {
  if (!assetCache.has(name)) assetCache.set(name, loader.loadAsync(`/assets/characters/${name}.gltf`));
  return assetCache.get(name);
}
function box(parent,w,h,d,color,x,y,z,r=.04) {
  const material = new THREE.MeshStandardMaterial({color,roughness:.85});
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),material);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(parent,top,bottom,height,color,x,y,z) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,24),new THREE.MeshStandardMaterial({color,roughness:.9}));
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function makeRoom() {
  room = new THREE.Group();scene.add(room);
  accentMaterials.floor=box(room,6.1,.23,4.8,'#d6bba6',0,-.14,0,.09).material;
  accentMaterials.wall=box(room,6.1,2.65,.12,'#eacbd0',0,1.25,-2.36).material;
  accentMaterials.side=box(room,.12,2.65,4.7,'#f1ddd4',-3,1.25,0).material;
  box(room,6,.08,.08,'#d3a99c',0,.01,-2.26);box(room,.08,.08,4.5,'#d3a99c',-2.9,.01,0);
  // Window and daylight: real geometry rather than a background illustration.
  box(room,1.7,1.5,.08,'#fff1da',-.8,1.55,-2.25);
  const glass=box(room,1.48,1.28,.06,'#b8d6dc',-.8,1.55,-2.19);
  glass.material.emissive.set('#b8d6dc');glass.material.emissiveIntensity=.16;
  box(room,.065,1.3,.08,'#fff1da',-.8,1.55,-2.13);box(room,1.5,.065,.08,'#fff1da',-.8,1.55,-2.12);
  box(room,1.95,.1,.32,'#fff1da',-.8,.78,-2.1);
  // Rose loveseat at the back.
  const sofa=new THREE.Group();room.add(sofa);sofa.position.set(.05,0,-1.45);
  box(sofa,2.45,.35,.93,'#c77e91',0,.42,0,.13);box(sofa,2.45,.75,.25,'#ca889b',0,.85,-.39,.12);
  box(sofa,.28,.55,.95,'#ba7086',-1.17,.64,0,.11);box(sofa,.28,.55,.95,'#ba7086',1.17,.64,0,.11);
  box(sofa,.98,.13,.72,'#db9eac',-.52,.65,.03,.06);box(sofa,.98,.13,.72,'#db9eac',.52,.65,.03,.06);
  for(const x of [-.9,.9]) for(const z of [-.3,.3]) cylinder(sofa,.045,.04,.25,'#78503f',x,.13,z);
  const pillow=box(sofa,.42,.4,.17,'#ecceb5',-.77,.98,-.18,.09);pillow.rotation.z=.2;
  // Woven oval rug.
  const rug = cylinder(room,1,1,.025,'#e9d5b3',0,.006,.55);rug.scale.set(1.82,1,1.1);
  const rugInset=cylinder(room,1,1,.027,'#efdcc2',0,.01,.55);rugInset.scale.set(1.66,1,.95);
  // Side table and warm lamp.
  cylinder(room,.37,.37,.11,'#b98968',2.15,.72,-1.65);cylinder(room,.08,.12,.65,'#9e6c50',2.15,.35,-1.65);
  cylinder(room,.17,.2,.07,'#f2d99d',2.15,.82,-1.65);cylinder(room,.025,.025,.53,'#a47a48',2.15,1.08,-1.65);
  const shade=cylinder(room,.24,.35,.4,'#f0d6a0',2.15,1.43,-1.65);shade.material.emissive.set('#eac18b');shade.material.emissiveIntensity=.2;
  // Plant and picture frame.
  cylinder(room,.28,.2,.45,'#c58e6c',-2.35,.23,-1.63);
  for(let i=0;i<7;i++){
    const a=i*2.4;const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color:i%2?'#648064':'#8aa17c',roughness:1}));
    leaf.scale.set(.17,.43,.12);leaf.position.set(-2.35+Math.sin(a)*.23,.74+(i%3)*.11,-1.63+Math.cos(a)*.19);leaf.rotation.z=Math.sin(a)*.65;leaf.castShadow=true;room.add(leaf);
  }
  box(room,.65,.82,.09,'#b78666',1.5,1.83,-2.23);box(room,.53,.7,.1,'#fff0d7',1.5,1.83,-2.17);
  const art=cylinder(room,.18,.18,.03,'#c68191',1.5,1.87,-2.1);art.rotation.x=Math.PI/2;
  const art2=cylinder(room,.16,.16,.03,'#9da77f',1.61,1.69,-2.09);art2.rotation.x=Math.PI/2;
}
function setTheme() {
  document.documentElement.dataset.theme=theme;
  $('#theme-icon').innerHTML=svg(theme==='pink'?'moon':'sun');
  $('#theme-label').textContent=theme==='pink'?'Dark mode':'Pink mode';
  $('#theme').setAttribute('aria-label',`Switch to ${theme==='pink'?'dark':'pink'} mode`);
  if(scene){
    scene.background=new THREE.Color(theme==='pink'?'#f8eee9':'#2a202c');
    accentMaterials.wall.color.set(theme==='pink'?'#eacbd0':'#694959');
    accentMaterials.side.color.set(theme==='pink'?'#f1ddd4':'#7d626b');
    accentMaterials.floor.color.set(theme==='pink'?'#d6bba6':'#9b7f73');
  }
  try{localStorage.setItem('nestle-theme',theme);}catch{}
}
function resetView(){camera.position.set(7,5.8,8.2);controls.target.set(0,.85,0);controls.update();}
const buildVersions=[0,0];
async function buildPerson(index) {
  const version=++buildVersions[index];const person=people[index];
  const [headAsset,bodyAsset]=await Promise.all([loadAsset(person.head),loadAsset(person.outfit)]);
  if(version!==buildVersions[index])return;
  const group=new THREE.Group(),mixers=[],actions=[];
  // Each modular part retains its original matching rig and plays the same clip.
  // This avoids unsafe rebinding between independently exported skeletons.
  for(const [role,asset] of [['Head',headAsset],['Body',bodyAsset],['Legs',bodyAsset],['Feet',bodyAsset]]){
    const part=clone(asset.scene);const kept=new Set();
    part.traverse(node=>{
      if(/_(Head|Body|Legs|Pants|Feet)$/.test(node.name)){
        const nodeRole=node.name.endsWith('_Pants')?'Legs':node.name.split('_').pop();
        node.visible=nodeRole===role;if(node.visible)kept.add(node);
      }
      if(/^(Pistol|Backpack)$/.test(node.name))node.visible=false;
    });
    part.traverse(node=>{if(node.isMesh){
      node.castShadow=true;node.receiveShadow=true;
      const materials=Array.isArray(node.material)?node.material:[node.material];
      node.material=materials.map(m=>{
        const mat=m.clone();mat.roughness=.9;mat.metalness=0;
        if(/^Skin/.test(mat.name))mat.color.set(person.skin).multiplyScalar(mat.name==='Skin_Darker'?.8:1);
        if(/^(Hair|Eyebrows)/.test(mat.name)||(role==='Head'&&person.head==='Punk'&&/^Red/.test(mat.name)))mat.color.set(person.hair);
        if(role==='Body'&&!/^(Skin|Eye|Hair|White|Black|Grey|Metal|Gold|Brown)/.test(mat.name))mat.color.set(person.color);
        return mat;
      });
      if(materials.length===1)node.material=node.material[0];
    }});
    group.add(part);
    const mixer=new THREE.AnimationMixer(part);mixers.push(mixer);
    const clip=asset.animations.find(a=>a.name===person.animation);
    if(clip){const action=mixer.clipAction(clip);action.play();actions.push(action);}
  }
  group.updateMatrixWorld(true);
  // Exported characters use Blender meters; normalize them to the shared room.
  const bounds=new THREE.Box3().setFromObject(group);const height=bounds.max.y-bounds.min.y;
  const scale=1.65/height;group.scale.setScalar(scale);group.position.y=-bounds.min.y*scale+.03;
  group.position.x=index===0?-.68:.72;group.position.z=index===0?.48:.85;group.rotation.y=index===0?.22:-.22;
  if(characters[index]){
    const old=characters[index];scene.remove(old.group);old.mixers.forEach(m=>m.stopAllAction());
    old.group.traverse(n=>{if(n.isMesh)for(const m of Array.isArray(n.material)?n.material:[n.material])m.dispose();});
  }
  characters[index]={group,mixers,actions};scene.add(group);
  mixers.forEach(m=>m.update(0));
}
function updateLabels(){
  people.forEach((p,i)=>{
    const key=i===0?'a':'b',name=p.name.trim()||`Partner ${i+1}`;
    $(`#tab-name-${key}`).textContent=name;
    document.querySelector(`[data-person="${i}"] .initial`).textContent=Array.from(name)[0].toUpperCase();
    $(`#caption-${key}`).textContent=`${name} · ${p.animation==='Idle'?'At home':p.animation==='Walk'?'Walking':'Waving'}`;
  });
  $('#room-title').textContent=`${people[0].name.trim()||'Partner 1'} & ${people[1].name.trim()||'Partner 2'}’s place`;
  $('#motion-note').textContent=`Changes apply to ${people[selected].name.trim()||'this character'}. Each keeps their own look.`;
}
function updateControls(){
  const p=people[selected];$('#name').value=p.name;$('#head').value=p.head;$('#outfit').value=p.outfit;
  document.querySelectorAll('[data-person]').forEach(el=>{const on=Number(el.dataset.person)===selected;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',on);});
  for(const [key,id]of [['skin','skin-colors'],['hair','hair-colors'],['color','outfit-colors']]){
    const container=$(`#${id}`);container.replaceChildren();
    for(const [name,color]of palettes[key]){
      const b=document.createElement('button');b.className='swatch';b.style.setProperty('--swatch',color);b.style.setProperty('--check',['#f6d6bb','#dfac80','#ddc8a2'].includes(color)?'#5a1e3c':'#fff7ee');
      b.setAttribute('aria-label',`${name} ${key==='color'?'outfit':key}`);b.title=name;b.setAttribute('aria-pressed',p[key]===color);
      b.addEventListener('click',()=>changePerson(key,color));container.append(b);
    }
  }
  document.querySelectorAll('[data-animation]').forEach(b=>{const on=b.dataset.animation===p.animation;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});
  $('#pause').textContent=paused?'Play':'Pause';$('#pause').setAttribute('aria-pressed',paused);
  updateLabels();
}
function reportError(error){errors.push(String(error));console.error(error);$('#save-status').textContent='Couldn’t update the character. Try reloading the preview.';}
async function changePerson(key,value){
  const index=selected;people[index][key]=value;updateControls();$('#save-status').textContent='Unsaved changes · saved only when you choose.';
  if(ready)try{await buildPerson(index);}catch(error){reportError(error);}
}
document.querySelectorAll('[data-person]').forEach(b=>b.addEventListener('click',()=>{selected=Number(b.dataset.person);updateControls();}));
$('#name').addEventListener('input',e=>{people[selected].name=e.target.value;updateLabels();$('#save-status').textContent='Unsaved changes · saved only when you choose.';});
$('#head').addEventListener('change',e=>changePerson('head',e.target.value));$('#outfit').addEventListener('change',e=>changePerson('outfit',e.target.value));
document.querySelectorAll('[data-animation]').forEach(b=>b.addEventListener('click',()=>changePerson('animation',b.dataset.animation)));
$('#pause').addEventListener('click',()=>{paused=!paused;updateControls();});
$('#theme').addEventListener('click',()=>{theme=theme==='pink'?'dark':'pink';setTheme();});
$('#save').addEventListener('click',()=>{try{localStorage.setItem('nestle-avatars-v1',JSON.stringify({people}));$('#save-status').textContent='Your looks are saved on this device.';}catch{$('#save-status').textContent='Your browser couldn’t save these looks. Keep this tab open.';}});
$('#reset-view').addEventListener('click',()=>{if(ready)resetView();});
for(const [id,factor]of [['zoom-in',.85],['zoom-out',1.18]])$( `#${id}`).addEventListener('click',()=>{
  if(!ready)return;const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();
});
setTheme();updateControls();
async function init(){
  try{
    scene=new THREE.Scene();
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    $('#scene').append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#loading').hidden=false;$('#loading').innerHTML='<strong>The 3D view was interrupted.</strong><span>Reload this page to restore your room.</span>';});
    camera=new THREE.PerspectiveCamera(34,1,.1,100);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=6;controls.maxDistance=17;controls.minPolarAngle=.4;controls.maxPolarAngle=1.37;controls.minAzimuthAngle=-.25;controls.maxAzimuthAngle=1.4;
    scene.add(new THREE.HemisphereLight('#fff2df','#b9a2b3',2.6));
    const key=new THREE.DirectionalLight('#fff0d9',3.6);key.position.set(3,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.025;key.shadow.bias=-.0001;scene.add(key);
    const fill=new THREE.DirectionalLight('#e4e8ff',1);fill.position.set(-3,3,3);scene.add(fill);
    makeRoom();setTheme();resetView();
    const resize=()=>{const w=$('#scene').clientWidth,h=$('#scene').clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe($('#scene'));resize();
    await Promise.all([buildPerson(0),buildPerson(1)]);ready=true;$('#loading').hidden=true;clock=new THREE.Clock();
    renderer.setAnimationLoop(()=>{
      const delta=Math.min(clock.getDelta(),.05);
      if(!paused&&!document.hidden)characters.forEach(c=>c?.mixers.forEach(m=>m.update(delta)));
      controls.update();renderer.render(scene,camera);
    });
    // Small diagnostics surface for asset/interaction verification, no user data sent.
    window.nestlePreview={getState:()=>({ready,theme,selected,paused,people:structuredClone(people),errors:[...errors],characters:characters.map(c=>({meshes:countVisibleMeshes(c.group),mixers:c.mixers.length}))})};
  }catch(error){reportError(error);$('#loading').innerHTML='<strong>We couldn’t open your room.</strong><span>Please reload in a browser with WebGL enabled.</span><button class="quiet-button" onclick="location.reload()">Try again</button>';}
}
function countVisibleMeshes(root){let count=0;root.traverseVisible(n=>{if(n.isMesh)count++;});return count;}
init();
