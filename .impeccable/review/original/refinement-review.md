# Original avatars — refinement 2

## Changes
- Slightly slimmer head, smaller ears with inset detail, smaller mittens, and continuous bare arms.
- Tapered swept locks, layered bob/long hair, smaller curl clumps, and a curved low ponytail.
- Continuous sleeves and trousers, blended elbow/knee weights, shaped torso and shoulder joins, cuffs, hems, hoodie pocket seam/cord tips, and fluted dress with ribbon.
- Surface-fitted facial details, smiling eyes for Happy/Affectionate, and closed eyes with a small yawn for Sleepy.

## Verification
- Rebuilt the editable Blender source and runtime GLB with Blender 4.5 LTS.
- Six Node/Three.js checks pass, including normalized, blended elbow/knee weights on both sides.
- Inspected `before-sheet.png` and `refined-sheet.png` under identical lighting, plus `refined-turnaround.png` for front, three-quarter, profile, and rear silhouettes. The first render revealed a shoulder gap; the final export corrects it.
- Runtime GLB: 2,359,924 bytes. Variant, skeleton, animation, and material names remain compatible.

## Limits
These are renders of the actual model, not browser captures. Browser automation could not attach to the in-app browser; native browser control stopped because it could not confidently determine the current URL. No browser interactions were performed after that stop. Live UI appearance and physical-phone performance remain unverified. Sculpted detail and paired animation contact remain future work.
