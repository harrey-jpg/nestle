export const activities = Object.freeze(['sitting', 'reading', 'studying', 'gaming', 'cuddling', 'standing']);
export const activityLabels = Object.freeze({
  sitting: 'Taking a little break together.', reading: 'A quiet chapter together.',
  studying: 'Keeping each other company while studying.', gaming: 'One more game together.',
  cuddling: 'A little closer on the sofa.', standing: 'A moment to stretch.'
});
export const awayThreshold = 60_000;
export const moments = Object.freeze([
  ['sitting','sitting'], ['reading','gaming'], ['reading','reading'],
  ['studying','sitting'], ['studying','studying'], ['gaming','reading'],
  ['gaming','gaming'], ['sitting','studying'], ['cuddling','cuddling'],
  ['reading','sitting'], ['standing','standing'], ['sitting','reading'],
  ['standing','gaming'], ['gaming','standing']
].map(([long_hair,short_hair])=>Object.freeze({long_hair,short_hair})));
export const actionLabels = Object.freeze({sitting:'Relaxing on the sofa',reading:'Reading on the sofa',
  studying:'Studying on the rug',gaming:'Playing a game',cuddling:'Cuddling on the sofa',standing:'Stretching'});
export const momentKey = moment => `${moment.long_hair}:${moment.short_hair}`;
export function normalizeMoment(value) {
  if (typeof value === 'string') value = {long_hair:value,short_hair:value};
  if (!value || !activities.includes(value.long_hair) || !activities.includes(value.short_hair)) return null;
  if ((value.long_hair === 'cuddling') !== (value.short_hair === 'cuddling')) return null;
  return {long_hair:value.long_hair,short_hair:value.short_hair};
}
export function momentLabel(moment) {
  return moment.long_hair === moment.short_hair ? activityLabels[moment.long_hair]
    : `${actionLabels[moment.long_hair]} · ${actionLabels[moment.short_hair]}`;
}
function choicesForHour(hour) {
  return hour < 6 ? ['cuddling', 'sitting', 'reading']
    : hour < 11 ? ['studying', 'reading', 'sitting', 'standing']
    : hour < 17 ? ['studying', 'gaming', 'reading', 'standing']
    : hour < 21 ? ['gaming', 'cuddling', 'sitting', 'reading']
    : ['reading', 'cuddling', 'sitting'];
}
export function momentForTime(date, previous) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw new TypeError('Invalid local time');
  const allowed = choicesForHour(date.getHours());
  const available = moments.filter(moment=>allowed.includes(moment.long_hair)&&allowed.includes(moment.short_hair)
    && (!previous || momentKey(moment)!==momentKey(previous)));
  return available[(date.getHours()*4+Math.floor(date.getMinutes()/15))%available.length];
}
export function motionAsset(id, activity) {
  const file = {reading:'reading_page_turn',gaming:'gaming_thumb_taps',studying:`study_motion_${id}`,sitting:`sitting_hand_shift_${id}`}[activity];
  return file ? `/assets/activities/${file}.png` : null;
}

// Local time suggests the activity; returning after a minute away advances the scene.
export function activityForTime(date, previous) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw new TypeError('Invalid local time');
  const hour = date.getHours();
  const choices = choicesForHour(hour);
  const available = choices.filter(activity => activity !== previous);
  return available[(hour * 4 + Math.floor(date.getMinutes() / 15)) % available.length];
}

export function characterAsset(id, mood, activity) {
  if (activity === 'standing') return mood === 'neutral'
    ? `/assets/couple/homebody_idle_${id}.png` : `/assets/couple/homebody_${id}_${mood}.png`;
  return mood === 'neutral' ? `/assets/activities/${activity}_idle_${id}.png`
    : `/assets/activities/${activity}_homebody_${id}_${mood}.png`;
}
