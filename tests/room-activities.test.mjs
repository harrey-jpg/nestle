import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {activities, activityForTime, characterAsset, awayThreshold, moments, normalizeMoment, momentKey, momentForTime, motionAsset} from '../public/room-activities.mjs';
import {characterIds, expressions} from '../public/character-state.mjs';

test('mixed moments migrate saved poses and keep cuddling paired', () => {
  assert.deepEqual(normalizeMoment('reading'),{long_hair:'reading',short_hair:'reading'});
  const pair={long_hair:'studying',short_hair:'sitting'};
  assert.deepEqual(normalizeMoment(pair),pair);
  assert.notEqual(normalizeMoment(pair),pair);
  for(const invalid of [null,'invalid',{},[],{long_hair:'cuddling',short_hair:'reading'},
    {long_hair:'gaming',short_hair:'cuddling'},{long_hair:'reading',short_hair:'unknown'}])assert.equal(normalizeMoment(invalid),null);
  const seen=new Set(moments.map(moment=>{assert.ok(normalizeMoment(moment));return momentKey(moment);}));
  assert.equal(seen.size,moments.length);
  assert.ok(moments.some(pair=>pair.long_hair==='reading'&&pair.short_hair==='gaming'));
  assert.ok(moments.some(pair=>pair.long_hair==='studying'&&pair.short_hair==='sitting'));
});

test('time-based mixed moments change after an absence and keep both routines appropriate', () => {
  for(let hour=0;hour<24;hour++)for(let minute=0;minute<60;minute+=15)for(const previous of moments) {
    const date=new Date(2026,9,25,hour,minute),next=momentForTime(date,previous);
    assert.notEqual(momentKey(next),momentKey(previous));assert.ok(normalizeMoment(next));
    assert.deepEqual(momentForTime(date,previous),next);
    for(const action of Object.values(next)) {
      if(hour<6||hour>=21)assert.ok(['reading','sitting','cuddling'].includes(action));
      if(hour>=6&&hour<11)assert.ok(['studying','reading','sitting','standing'].includes(action));
    }
  }
  assert.throws(()=>momentForTime(new Date('invalid')),TypeError);
});

test('every action preloads an existing motion asset when required', async () => {
  for(const id of characterIds)for(const activity of activities) {
    const asset=motionAsset(id,activity);
    if(['standing','cuddling'].includes(activity)){assert.equal(asset,null);continue;}
    assert.ok((await readFile(new URL(`../public${asset}`,import.meta.url))).length>0);
  }
});

test('local time suggests appropriate activities and a return changes the previous moment', () => {
  assert.equal(awayThreshold, 60000);
  for(let hour=0;hour<24;hour++)for(let minute=0;minute<60;minute+=15) {
    const date=new Date(2026,9,25,hour,minute);
    for(const previous of activities) {
      const next=activityForTime(date,previous);
      assert.ok(activities.includes(next)); assert.notEqual(next,previous);
      if(hour>=21||hour<6) assert.ok(['reading','cuddling','sitting'].includes(next));
      if(hour>=6&&hour<11) assert.ok(['studying','reading','sitting','standing'].includes(next));
      assert.equal(activityForTime(date,previous),next);
    }
  }
  assert.throws(()=>activityForTime(new Date('invalid')),TypeError);
});

test('every pose ships all sixteen expressions and a three-frame neutral blink strip', async () => {
  for(const activity of activities)for(const id of characterIds)for(const mood of expressions) {
    const path=characterAsset(id,mood,activity);
    const png=await readFile(new URL(`../public${path}`,import.meta.url));
    const width=activity==='standing'?80:128;
    assert.equal(png.readUInt32BE(16),mood==='neutral'?width*3:width,path);
    assert.equal(png.readUInt32BE(20),208,path);
  }
});

test('reading page overlay ships the exact five-frame source export', async () => {
  const name='reading_page_turn.png';
  const runtime=await readFile(new URL(`../public/assets/activities/${name}`,import.meta.url));
  const source=await readFile(new URL(`../output/pixel-art/reading-motion-exports/anims/${name}`,import.meta.url));
  assert.deepEqual(runtime,source);
  assert.equal(runtime.readUInt32BE(16),128*5);
  assert.equal(runtime.readUInt32BE(20),208);
});

test('both study overlays ship exact four-frame source exports', async () => {
  for(const id of characterIds) {
    const name=`study_motion_${id}.png`;
    const runtime=await readFile(new URL(`../public/assets/activities/${name}`,import.meta.url));
    const source=await readFile(new URL(`../output/pixel-art/study-motion-exports/anims/${name}`,import.meta.url));
    assert.deepEqual(runtime,source);
    assert.equal(runtime.readUInt32BE(16),128*4);
    assert.equal(runtime.readUInt32BE(20),208);
  }
});

test('gaming controller overlay ships the exact four-frame source export', async () => {
  const name='gaming_thumb_taps.png';
  const runtime=await readFile(new URL(`../public/assets/activities/${name}`,import.meta.url));
  const source=await readFile(new URL(`../output/pixel-art/gaming-motion-exports/anims/${name}`,import.meta.url));
  assert.deepEqual(runtime,source);
  assert.equal(runtime.readUInt32BE(16),128*4);
  assert.equal(runtime.readUInt32BE(20),208);
});

test('both sitting hand overlays ship exact four-frame source exports', async () => {
  for(const id of characterIds) {
    const name=`sitting_hand_shift_${id}.png`;
    const runtime=await readFile(new URL(`../public/assets/activities/${name}`,import.meta.url));
    const source=await readFile(new URL(`../output/pixel-art/sitting-motion-exports/anims/${name}`,import.meta.url));
    assert.deepEqual(runtime,source);
    assert.equal(runtime.readUInt32BE(16),128*4);
    assert.equal(runtime.readUInt32BE(20),208);
  }
});
