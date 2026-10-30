import { getRoomCycle } from './room-time.mjs';
import { characterIds, expressions, expressionLabel, createCharacterState } from './character-state.mjs';
import { awayThreshold, momentForTime, normalizeMoment, momentKey, momentLabel, actionLabels, motionAsset, characterAsset as poseAsset } from './room-activities.mjs';
import {SharedHome,profiles,sharedConfig} from './shared-home.mjs';
import {startMessages} from './messages.mjs';

const $ = selector => document.querySelector(selector);
const stage = $('#room-stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const shared = new SharedHome(globalThis.supabase.createClient(sharedConfig.url,sharedConfig.key));
let selectedProfile=null;
let sharedReady=false;
let pollBusy=false;
let ownWrites=0;
let messages=null;
const icons = {
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  moon:'<path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z"/>',
  sunset:'<path d="M3 17h18M6 17a6 6 0 0 1 12 0M12 3v4M3 9l3 3m15-3-3 3M6 21h12"/>'
};
let paused = false;
try { paused = localStorage.getItem('nestle-home-paused') === 'true'; } catch { /* Optional preference. */ }
const savedMoment = readSaved('nestle-home-moment-v1');
const previousMoment = normalizeMoment(savedMoment?.poses || savedMoment?.activity);
let currentMoment = previousMoment && (paused || Date.now() - savedMoment.at < awayThreshold)
  ? previousMoment : momentForTime(new Date(), previousMoment);
let awaySince = null;
let activityRequest = 0;
function syncMoment() {
  stage.dataset.activity = currentMoment.long_hair === currentMoment.short_hair ? currentMoment.long_hair : 'mixed';
  stage.dataset.moment = momentKey(currentMoment);
  for (const id of characterIds) $(`[data-character="${id}"]`).dataset.activity = currentMoment[id];
}
syncMoment();

function syncClock() {
  const now = new Date();
  const cycle = getRoomCycle(now);
  document.documentElement.dataset.time = cycle.phase;
  document.documentElement.dataset.light = cycle.nightMix > .5 ? 'dark' : 'light';
  stage.style.setProperty('--night-mix', cycle.nightMix.toFixed(5));
  stage.style.setProperty('--character-light', (1 - cycle.nightMix * .25).toFixed(4));
  $('#phase-name').textContent = cycle.label;
  $('#phase-icon').innerHTML = `<svg viewBox="0 0 24 24">${icons[cycle.phase === 'night' ? 'moon' : cycle.phase === 'evening' ? 'sunset' : 'sun']}</svg>`;
  $('#local-time').textContent = new Intl.DateTimeFormat(undefined, {hour:'numeric', minute:'2-digit'}).format(now);
  $('#local-time').dateTime = now.toISOString();
  $('#room-mood').textContent = momentLabel(currentMoment);
  stage.setAttribute('aria-label', `${momentLabel(currentMoment)}. ${cycle.label} lighting follows your device’s local time.`);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  $('#time-zone').textContent = zone ? ` (${zone.split('/').pop().replaceAll('_', ' ')})` : '';
  $('meta[name="theme-color"]').content = cycle.nightMix > .5 ? '#251c2b' : '#fce8ec';
}

function syncMotion() {
  const stopped = paused || reducedMotion.matches;
  stage.classList.toggle('motion-paused', stopped);
  $('#motion-toggle').setAttribute('aria-pressed', String(stopped));
  $('#motion-toggle').disabled = reducedMotion.matches;
  $('#motion-label').textContent = reducedMotion.matches ? 'Still' : stopped ? 'Play' : 'Pause';
  const label = reducedMotion.matches ? 'Movement off: reduced motion is enabled on this device' : stopped ? 'Play character movement' : 'Pause character movement';
  $('#motion-toggle').setAttribute('aria-label', label);
  $('#motion-toggle').title = label;
  $('#motion-toggle svg').innerHTML = stopped ? '<path d="m9 5 10 7-10 7Z"/>' : '<path d="M8 5v14M16 5v14"/>';
}
$('#motion-toggle').addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem('nestle-home-paused', String(paused)); } catch { /* Keep session preference. */ }
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);

const home = $('.home');
$('#fullscreen').hidden = !home.requestFullscreen || !document.fullscreenEnabled;
$('#fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await home.requestFullscreen();
  } catch { $('#fullscreen').hidden = true; }
});
document.addEventListener('fullscreenchange', () => {
  const label = document.fullscreenElement ? 'Exit room fullscreen' : 'View room fullscreen';
  $('#fullscreen').setAttribute('aria-label', label);
  $('#fullscreen').title = label;
});
$('#retry').addEventListener('click', () => location.reload());

syncClock();
syncMotion();
setInterval(() => { if (!document.hidden) syncClock(); }, 15000);
document.addEventListener('visibilitychange', () => {
  stage.classList.toggle('page-hidden', document.hidden);
  if (document.hidden) markAway();
  else returnHome();
});
window.addEventListener('blur', markAway);
window.addEventListener('focus', returnHome);
window.addEventListener('pagehide', markAway);
window.addEventListener('pageshow', () => { if (!document.hidden) returnHome(); });

let characterState = null;
let requestVersion = 0;
let pickerTrigger = null;
let canSave = true;
function readSaved(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function saveLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { canSave = false; return false; }
}
function characterAsset(id, mood) {
  return poseAsset(id, mood, currentMoment[id]);
}
function renderCharacters() {
  const moods = characterState?.snapshot() || {long_hair:'neutral', short_hair:'neutral'};
  for (const id of characterIds) {
    const person = $(`[data-character="${id}"]`);
    const own = id === characterState?.ownerId;
    const body = person.querySelector('.sprite-body');
    person.disabled = !own || !sharedReady;
    person.classList.toggle('own-character', own);
    person.querySelector('.character-tag').hidden = !own;
    person.setAttribute('aria-label', `${own ? 'Your character' : 'Your partner’s character'}, ${expressionLabel(moods[id])}. ${actionLabels[currentMoment[id]]}. ${own ? 'Change your expression' : 'Read-only'}`);
    person.title = own ? 'Change your expression' : 'Your partner chooses their own expression';
    body.classList.toggle('has-expression', moods[id] !== 'neutral');
    body.style.backgroundImage = `url("${characterAsset(id, moods[id])}")`;
    $(`.couple-portraits img:nth-of-type(${id === 'long_hair' ? 1 : 2})`).src = `/assets/couple/portrait_${id}_${moods[id]}.png`;
  }
  $('#expression-open').hidden = !characterState;
  if (!characterState) return;
  $('#expression-open').setAttribute('aria-label', `Change your expression, currently ${expressionLabel(moods[characterState.ownerId])}`);
}
function rememberMoment() {
  saveLocal('nestle-home-moment-v1', {poses:currentMoment, at:Date.now()});
}
function markAway() {
  if (awaySince === null) awaySince = Date.now();
  // Save the departure time too, so closing and reopening the tab behaves like returning.
  rememberMoment();
}
async function returnHome() {
  syncClock();
  const elapsed = awaySince === null ? 0 : Date.now() - awaySince;
  awaySince = null;
  if(shared.profile)refreshShared();
  if (elapsed >= awayThreshold && !paused && $('#expression-panel').hidden && sharedReady) {
    try {await changeMoment(await shared.advance());}
    catch {$('#connection-status').textContent='Couldn’t refresh the routine. Keeping your last moment.';}
  }
}
function currentMoods() {
  return characterState?.snapshot() || {long_hair:'neutral',short_hair:'neutral'};
}
async function loadMoment(moment, moods) {
  const urls = characterIds.flatMap(id=>[poseAsset(id,moods[id],moment[id]),motionAsset(id,moment[id])]).filter(Boolean);
  await Promise.all([...new Set(urls)].map(async src=>{const image=new Image();image.src=src;await image.decode();}));
}
async function changeMoment(moment) {
  const version = ++activityRequest;
  try {
    let moods;
    do {
      moods=currentMoods(); await loadMoment(moment,moods);
      if (version !== activityRequest) return;
    } while (JSON.stringify(moods)!==JSON.stringify(currentMoods()));
    currentMoment = moment;
    syncMoment();
    renderCharacters(); syncClock(); rememberMoment();
  } catch {
    if (version === activityRequest) $('#room-mood').textContent = 'Keeping this moment for now. We’ll try again when you return.';
  }
}
function renderChoices() {
  const current = characterState.snapshot()[characterState.ownerId];
  for (const button of $('#expression-grid').children) {
    button.setAttribute('aria-pressed', String(button.dataset.expression === current));
    button.disabled=!sharedReady;
  }
}
function closePicker() {
  $('#expression-panel').hidden = true;
  $('#expression-open').setAttribute('aria-expanded', 'false');
  pickerTrigger?.focus({preventScroll:true});
  pickerTrigger?.scrollIntoView({block:'nearest', behavior:reducedMotion.matches ? 'instant' : 'smooth'});
}
async function openPicker(trigger) {
  if (!characterState) return;
  if (document.fullscreenElement) {
    try { await document.exitFullscreen(); } catch { return; }
  }
  pickerTrigger = trigger;
  ++activityRequest;
  $('#expression-panel').hidden = false;
  $('#expression-open').setAttribute('aria-expanded', 'true');
  renderChoices();
  $('#expression-panel').scrollIntoView({block:'nearest', behavior:reducedMotion.matches ? 'instant' : 'smooth'});
  $('#expression-grid [aria-pressed="true"]').focus({preventScroll:true});
}
async function chooseExpression(mood) {
  if (!characterState || !sharedReady || !expressions.includes(mood)) return;
  const owner = characterState.ownerId;
  const version = ++requestVersion;
  $('#expression-status').textContent = 'Changing your expression…';
  ++ownWrites;
  try {
    let moment;
    do {
      moment=currentMoment;
      const image = new Image(); image.src = poseAsset(owner,mood,moment[owner]); await image.decode();
      if (version !== requestVersion) return;
    } while (moment!==currentMoment);
    await shared.saveExpression(mood);
    if(version!==requestVersion)return;
    if (!characterState.setExpression(owner, mood)) return;
    saveLocal('nestle-home-expressions-v1', characterState.snapshot());
    renderCharacters(); renderChoices();
    $('#expression-status').textContent = `${expressionLabel(mood)} · Shared with ${shared.profile==='harry'?'Alexa':'Harry'}`;
  } catch {
    if (version === requestVersion) $('#expression-status').textContent = 'Your expression wasn’t shared. Check your connection and choose again.';
  } finally {--ownWrites;}
}
function setUpCharacter(owner,moods) {
  characterState = createCharacterState(owner,moods);
  $('#character-setup').hidden = true;
  const grid = $('#expression-grid'); grid.replaceChildren();
  for (const mood of expressions) {
    const button = document.createElement('button'); button.type = 'button';
    button.dataset.expression = mood; button.setAttribute('aria-pressed', 'false');
    const image = new Image(64,64); image.alt = ''; image.src = `/assets/couple/portrait_${owner}_${mood}.png`;
    const label = document.createElement('span'); label.textContent = expressionLabel(mood);
    button.append(image,label); button.addEventListener('click',()=>chooseExpression(mood)); grid.append(button);
  }
  renderCharacters(); renderChoices();
  $('#expression-status').textContent = 'Only your character’s expression changes. Your partner chooses their own.';
}
function setConnecting(busy) {
  $('#character-setup').setAttribute('aria-busy',String(busy));
  for(const button of document.querySelectorAll('[data-choose-profile],#connection-retry'))button.disabled=busy;
}
async function startConnected() {
  await shared.advance();
  const state=await shared.read();
  await Promise.all([$('#morning-art').decode(),$('#night-art').decode(),loadMoment(state.poses,state.moods)]);
  currentMoment=state.poses;syncMoment();syncClock();
  sharedReady=true;
  setUpCharacter(profiles[shared.profile].character,state.moods);
  saveLocal('nestle-home-character-v1',profiles[shared.profile].character);
  saveLocal('nestle-home-expressions-v1',state.moods);rememberMoment();
  $('.page-intro').hidden=false;home.hidden=false;$('.page-footer').hidden=false;
  $('#shared-connection').hidden=false;$('#character-setup').hidden=true;
  $('#room-loading').hidden=true;stage.classList.add('ready');
  $('#connection-status').textContent=`You’re ${profiles[shared.profile].name} · Connected to your shared home`;
  if(!messages)messages=startMessages(shared);
}
async function connectChoice(profile) {
  if(characterState)return;
  selectedProfile=profile;setConnecting(true);$('#connection-retry').hidden=true;
  $('#setup-status').textContent=`Opening ${profiles[profile].name}’s home…`;
  try {await shared.connect(profile);await startConnected();}
  catch(error){
    $('#setup-status').textContent=error.message;
    $('#connection-retry').hidden=false;
  }finally{setConnecting(false);}
}
for(const button of document.querySelectorAll('[data-choose-profile]'))button.addEventListener('click',()=>connectChoice(button.dataset.chooseProfile));
$('#connection-retry').addEventListener('click',()=>selectedProfile?connectChoice(selectedProfile):boot());
async function boot() {
  setConnecting(true);
  try {const profile=await shared.restore();if(profile)await startConnected();else $('#setup-status').textContent='Your choice will be remembered on this device.';}
  catch {$('#setup-status').textContent='Couldn’t open your home. Check your connection and try again.';$('#connection-retry').hidden=false;}
  finally{setConnecting(false);}
}
async function refreshShared() {
  if(!characterState||pollBusy||ownWrites||document.hidden)return;
  pollBusy=true;
  try {
    const moment=currentMoment,state=await shared.read();
    await loadMoment(moment,state.moods);
    if(ownWrites||moment!==currentMoment)return;
    characterState=createCharacterState(characterState.ownerId,state.moods);
    sharedReady=true;renderCharacters();if(!$('#expression-panel').hidden)renderChoices();
    $('#expression-open').disabled=false;
    saveLocal('nestle-home-expressions-v1',state.moods);
    $('#connection-status').textContent=`You’re ${profiles[shared.profile].name} · Connected to your shared home`;
  }catch{
    sharedReady=false;$('#expression-open').disabled=true;
    renderCharacters();if(!$('#expression-panel').hidden)renderChoices();
    $('#connection-status').textContent='Connection paused · Showing your last shared home. We’ll reconnect automatically.';
  }finally{pollBusy=false;}
}
setInterval(refreshShared,5000);
for (const button of document.querySelectorAll('[data-character]')) {
  button.addEventListener('click',()=>{
    if (button.dataset.character === characterState?.ownerId) openPicker(button);
  });
}
$('#expression-open').addEventListener('click',event=>openPicker(event.currentTarget));
$('#expression-close').addEventListener('click',closePicker);
document.addEventListener('keydown',event=>{
  if (event.key === 'Escape' && !$('#expression-panel').hidden) { event.preventDefault(); closePicker(); }
});
boot();
