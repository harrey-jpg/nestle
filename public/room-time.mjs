// Device-local wall-clock time, including timezone and daylight-saving changes.
export function getRoomCycle(date = new Date()) {
  if (!Number.isFinite(date.getTime())) throw new TypeError('A valid date is required');
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const smooth = value => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  if (hour < 6 || hour >= 20) return {phase:'night', label:'Night', nightMix:1, mood:'A quiet night in, together.'};
  if (hour < 11) return {phase:'morning', label:'Morning', nightMix:1-smooth(hour-6), mood:'A little morning light. A whole day together.'};
  if (hour < 17) return {phase:'afternoon', label:'Afternoon', nightMix:0, mood:'The loveliest part of an ordinary day.'};
  return {phase:'evening', label:'Evening', nightMix:smooth((hour-17)/3), mood:'The day slows down. The lights feel warmer.'};
}
