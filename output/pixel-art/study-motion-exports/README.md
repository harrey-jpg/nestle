# Studying motion

Cross-legged posture corrected after user review: separate bent thighs and rounded knees, overlapping shins and inward-tucked shoes replace the previous filled triangular leg shape. The skirt and shorts now drape over the seated thighs. All 32 studying expression variants, both neutral blink strips and both study motion strips were rebuilt together. Approved head/mole pixels remain identical. Desktop/mobile study checks and all 18 automated tests passed.

Editable source: `../study-motion.px.js`, using the existing activity artwork. Each transparent strip has four 128×208 frames: rest, then three short writing/typing movements. Rest lasts 4.8 seconds, followed by three 400 ms frames. Runtime CSS uses matching six-second timing with a -2.4 second offset for the second character.

The overlay is confined to the notebook/laptop area; approved faces and expression sprites remain untouched. Runtime copies live in `public/assets/activities/`. Pause, hidden pages and reduced motion return to the resting frame. Source exports match shipped files byte for byte.

Desktop/mobile browser checks passed for animation frames, staggered timing, expression changes, Pause, hidden-page handling, reduced motion, and hiding when leaving studying. Reading regression checks also passed. Captures: `.impeccable/review/studying/`.
