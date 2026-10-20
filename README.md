# Nestle avatar preview

Run `npm install` once, then `npm start`. Open http://localhost:5173.

Two original Nestle characters share a furnished room. Customize each partner independently with six hairstyles, four outfits, five skin tones, hair/clothing colors, and five facial expressions plus neutral. Starter clips include Idle, Walk (in place), Wave, Sit, Dance, and a synchronized Hug pose. Drag to orbit, use zoom controls, switch pink/dark themes, and save appearances to this browser's local storage.

This is an editable first modeling pass based on the approved concept, not the production mobile app. Rounded primitive-derived geometry, mostly rigid weights, and starter animations still need art refinement, clothing/contact polish, and physical-phone performance validation. Location sharing, chat, camera, widgets, and AI are not connected.

## Original assets
- Approved concept: `output/concepts/nestle-original-characters-v1.png`.
- Editable Blender source: `output/models/nestle-original-v1.blend`.
- Runtime model: `public/assets/original/nestle-original-v1.glb`.
- Variant/animation manifest: `public/assets/original/manifest.json`.
- Reproducible Blender authoring script: `scripts/build-original-avatars.py`.

The GLB contains one shared skeleton and all hair/outfit modules; choose exactly one of each. Facial expressions use morph targets. See `output/models/README.md` for assembly and rebuild instructions. Blender 4.5 LTS is required only to rebuild/edit the source, not to run the preview.

The earlier Quaternius preview remains at http://localhost:5173/quaternius.html with separate saved appearances.

## Assets and attribution
Nestle's new geometry, rig, facial targets, animations, and room are authored in project source. The concept image was generated with imagegen; its exact prompt is included. No Quaternius geometry or motion data is reused in the original model.

The earlier preview includes Quaternius Ultimate Modular Men (February 2022), supplied by the user, with its original CC0 license preserved at `public/assets/characters/License.txt`. The self-hosted Nunito font includes its SIL Open Font License. No project-wide license is assigned to the original work yet.

## Checks
`npm test` checks the earlier assets plus original modules, shared rig, morph targets, buffer bounds, Three.js animation evaluation, and key gesture/seat positions. Browser captures are under `.impeccable/review/`; the original-model captures are a work-in-progress visual record. The complete new UI/asset combination has not yet finished its desktop/phone review.

Dependencies, Blender's portable runtime, download caches, environment files, and Blender backup copies are excluded from Git. The original `.blend` and GLB are included.
