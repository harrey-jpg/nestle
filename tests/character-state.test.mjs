import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { characterIds, expressions, createCharacterState } from '../public/character-state.mjs';

test('each profile can change only its own character through all sixteen expressions',()=>{
  for(const owner of characterIds) {
    const partner=characterIds.find(id=>id!==owner);
    const state=createCharacterState(owner,{[partner]:'happy'});
    for(const mood of expressions) {
      assert.equal(state.setExpression(owner,mood),true);
      assert.equal(state.snapshot()[owner],mood);
      assert.equal(state.setExpression(partner,mood),false);
      assert.equal(state.snapshot()[partner],'happy');
    }
    assert.equal(state.setExpression(owner,'unknown'),false);
    assert.equal(state.snapshot()[owner],'kissing');
  }
});

test('ownership and expression state cannot change through input/snapshot mutation',()=>{
  const saved={long_hair:'shy',short_hair:'invalid'};
  const state=createCharacterState('long_hair',saved);
  saved.long_hair='sad';
  state.snapshot().short_hair='angry';
  assert.deepEqual(state.snapshot(),{long_hair:'shy',short_hair:'neutral'});
  assert.throws(()=>{state.ownerId='short_hair'},TypeError);
  assert.throws(()=>createCharacterState('unknown'),TypeError);
  assert.deepEqual(createCharacterState('short_hair',null).snapshot(),{long_hair:'neutral',short_hair:'neutral'});
});

test('all selectable expressions ship the exact approved portrait and full-body PNGs',async()=>{
  for(const id of characterIds)for(const mood of expressions) {
    for(const [source,file]of [
      [`exports/sprites/portrait_${id}_${mood}.png`,`portrait_${id}_${mood}.png`],
      [`home-body-exports/sprites/homebody_${id}_${mood}.png`,`homebody_${id}_${mood}.png`]
    ]) {
      const [approved,runtime]=await Promise.all([
        readFile(new URL(`../output/pixel-art/${source}`,import.meta.url)),
        readFile(new URL(`../public/assets/couple/${file}`,import.meta.url))
      ]);
      assert.deepEqual(runtime,approved,file);
    }
  }
});
