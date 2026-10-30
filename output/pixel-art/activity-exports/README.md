# Everyday moments

Cuddle correction after user review: his arm now passes behind her upper back, with the hand resting on her outside shoulder instead of crossing her neck. Cuddle legs tuck inward so all four feet remain visible. Her sprite keeps the foreground layer for either ownership choice; the disabled partner remains transparent to pointer input. All 32 cuddle expression variants and both neutral blink strips were rebuilt. Approved head and mole pixels remain unchanged. Paired source preview: `_preview/cuddle_pair_review.png`; browser rest/lean captures: `.impeccable/review/cuddle/`.

Sofa posture correction: sitting, reading, gaming and cuddling now have forward-projecting thighs, rounded bent knees, shorter shins and lap-shaped skirt/shorts. Shoes end at native y=178 instead of y=206. Room placement uses a 38% bottom anchor; sofa shadows and the cuddle pivot follow the new foot position. All 128 sofa expression variants and eight neutral strips were rebuilt, along with both sitting hand overlays. The floor-study and standing poses are unchanged.

Hair alignment correction after user review: the long-haired character's seated hair now joins the portrait silhouette at the shoulders and tapers over the chest, replacing the detached square shoulder extensions. Applied to all five seated activities and all sixteen expressions; sitting/study overlays were rebuilt to match. Portrait pixels, moles and standing assets are unchanged.

New activity artwork for user review; this does not change or extend the existing face/body approval record.

Editable source: `../activities.px.js`, including the approved portrait and body sources. Native activity frames are 128×208; idle PNG strips contain three horizontal frames. Five poses (sitting, reading, studying, gaming, cuddling), two characters, all sixteen approved expressions. Standing continues to use the approved 80×208 home-body artwork.

The approved heads are stamped at x=32, y=0. Cuddling offsets them to x=42 for the long-haired character and x=22 for the short-haired character. Every opaque original portrait pixel in rows 0–46 was compared against all 160 exported pose variants: identical, including both moles.

Runtime copies: `public/assets/activities/`. Browser review and behavioral results: `.impeccable/review/activities/`.
