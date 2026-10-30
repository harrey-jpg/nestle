export const characterIds = Object.freeze(['long_hair', 'short_hair']);
export const expressions = Object.freeze([
  'neutral','happy','affectionate','sad','surprised','sleepy','laughing','angry',
  'worried','shy','confused','annoyed','crying','excited','winking','kissing'
]);
export const expressionLabel = mood => mood.charAt(0).toUpperCase() + mood.slice(1);

// UI guard; shared-home ownership is also enforced by the server's device binding and RLS.
export function createCharacterState(ownerId, saved = {}) {
  if (!characterIds.includes(ownerId)) throw new TypeError('Choose a valid character');
  const moods = Object.fromEntries(characterIds.map(id => [id,
    expressions.includes(saved?.[id]) ? saved[id] : 'neutral'
  ]));
  return Object.freeze({
    ownerId,
    snapshot: () => ({...moods}),
    setExpression(characterId, mood) {
      if (characterId !== ownerId || !expressions.includes(mood)) return false;
      moods[characterId] = mood;
      return true;
    }
  });
}
