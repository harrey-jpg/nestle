import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getRoomCycle } from '../public/room-time.mjs';

const at = (hour, minute=0, second=0) => new Date(2026, 9, 25, hour, minute, second);

test('room follows local morning, afternoon, evening and night boundaries', () => {
  for (const [hour, minute, phase] of [[0,0,'night'],[5,59,'night'],[6,0,'morning'],[10,59,'morning'],[11,0,'afternoon'],[16,59,'afternoon'],[17,0,'evening'],[19,59,'evening'],[20,0,'night'],[23,59,'night']]) {
    assert.equal(getRoomCycle(at(hour,minute)).phase,phase,`${hour}:${minute}`);
  }
  assert.equal(getRoomCycle(at(6)).nightMix,1);
  assert.equal(getRoomCycle(at(7)).nightMix,0);
  assert.equal(getRoomCycle(at(12)).nightMix,0);
  assert.equal(getRoomCycle(at(20)).nightMix,1);
  assert.equal(getRoomCycle(at(6,30)).nightMix,.5);
  assert.equal(getRoomCycle(at(18,30)).nightMix,.5);
});

test('lighting is continuous across boundaries and remains bounded for a full day', () => {
  for(let minute=0;minute<1440;minute++) {
    const mix=getRoomCycle(at(0,minute)).nightMix;
    assert.ok(Number.isFinite(mix)&&mix>=0&&mix<=1);
  }
  for(const hour of [6,7,11,17,20,24]) {
    assert.ok(Math.abs(getRoomCycle(at(hour,0,-1)).nightMix-getRoomCycle(at(hour)).nightMix)<.001);
  }
  assert.throws(()=>getRoomCycle(new Date('invalid')),TypeError);
});

test('the room uses exact copies of the approved character assets', async () => {
  for(const id of ['long_hair','short_hair']) {
    for(const [source,runtime] of [
      [`sprites/portrait_${id}_neutral.png`,`portrait_${id}_neutral.png`]
    ]) {
      const [approved,shipped]=await Promise.all([
        readFile(new URL(`../output/pixel-art/exports/${source}`,import.meta.url)),
        readFile(new URL(`../public/assets/couple/${runtime}`,import.meta.url))
      ]);
      assert.deepEqual(shipped,approved,runtime);
    }
    for(const [source,runtime]of [
      [`sprites/homebody_${id}_neutral.png`,`homebody_${id}_neutral.png`],
      [`anims/homebody_idle_${id}.png`,`homebody_idle_${id}.png`]
    ]) {
      const [approved,shipped]=await Promise.all([
        readFile(new URL(`../output/pixel-art/home-body-exports/${source}`,import.meta.url)),
        readFile(new URL(`../public/assets/couple/${runtime}`,import.meta.url))
      ]);
      assert.deepEqual(shipped,approved,runtime);
    }
  }
});
