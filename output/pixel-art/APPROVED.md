# Approved Nestle pixel portraits

## Current approved home-body style

On 2026-10-25 (Asia/Manila), the user approved the fuller Adorable Home-inspired
pixel body proposal with “lock it and go”. This supersedes the earlier 64×128
body design for the current room. Keep the relaxed poses, broader silhouettes,
slightly shorter body proportions, outfits, and all 16 expressions for each person.
The approved portrait head pixels and mole positions are unchanged, placed at
offset (8, 0) on each transparent 80×208 character canvas.

Source: `home-body.px.js`. Exports: `home-body-exports/`.
The room now uses these approved character PNGs and neutral blinking strips;
own-character expression selection and browser-local ownership are retained.
The earlier full-body and small-character designs remain historical assets.

## Earlier approved full-body designs

The user approved full-body revision 02 on 2026-10-25 (Asia/Manila): “Its good”.
This locks the long-haired character's refined waist, shoulders and skirt silhouette,
the short-haired character's leaner torso and arms, and all 16 full-body expressions
for each character. Preserve the approved portrait faces and mole placements.

Source: `full-body.px.js`. Review: `full-body-exports/_preview/fullbody_preview.png`.
Transparent 64×128 characters and packed expression sheets are in `full-body-exports/`.
This earlier body design has been superseded in the room by the current
home-body style above. Its source and exports remain as a historical record.

## Approved portrait designs

Approved by the user on 2026-10-25 (Asia/Manila): “Lets lock that, I like that”.

Both portrait designs and all 16 expressions in review 02 are locked:
neutral, happy, affectionate, sad, surprised, sleepy, laughing, angry,
worried, shy, confused, annoyed, crying, excited, winking, and kissing.

Preserve the current face shapes, hairstyles, colors, outfits, and mole placements.
Portrait mole coordinates on the native 64×64 canvas are (39, 34) for the
long-haired partner and (37, 34) for the short-haired partner. Do not revise
these approved designs unless the user requests a change.

Editable source: `couple-study.px.js`.
Approved review sheets: `exports/_preview/review_long_hair.png` and
`exports/_preview/review_short_hair.png`.
Individual transparent portraits: `exports/sprites/portrait_*.png`.
Packed portrait sheet and frame metadata: `exports/couple_portraits.png` and
`exports/couple_portraits.json`.

This approval covers the portraits and expressions. The main web preview now
uses the approved neutral portrait tiles from `exports/` and the full-body
characters and idle strips from `home-body-exports/` in `public/assets/couple/`,
alongside an original illustrated room.
All 16 approved full-body expressions are now available through the room's
own-character picker. A one-time browser-local identity choice enables only
that character's expression controls; the partner remains read-only. This
preview does not yet have signed-in ownership or cross-device synchronization.

The main page no longer loads the previous 3D preview. Its source and assets
are retained as legacy work, and the separate Quaternius preview remains at
`/quaternius.html`. This integration changes no portrait approval or design.
