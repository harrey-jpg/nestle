import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const assets=['Casual_Hoodie','Casual_2','Beach','Punk','Farmer','Suit'];
test('customizable parts and required animation clips exist in every selectable asset',async()=>{
  for(const name of assets){
    const g=JSON.parse(await readFile(new URL(`../public/assets/characters/${name}.gltf`,import.meta.url)));
    for(const suffix of ['Head','Body','Feet'])assert.ok(g.nodes.some(n=>n.name?.endsWith('_'+suffix)),`${name}: ${suffix}`);
    assert.ok(g.nodes.some(n=>/_(Legs|Pants)$/.test(n.name)),`${name}: legs`);
    for(const clip of ['Idle','Walk','Wave'])assert.ok(g.animations.some(a=>a.name===clip),`${name}: ${clip}`);
    for(const b of g.buffers)assert.ok(b.uri.startsWith('data:'),`${name}: no missing external buffers`);
    assert.ok(g.skins?.length,`${name}: rig exists`);
  }
});
