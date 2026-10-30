# Nestle original character base v1, refinement 2

Original geometry, rig, facial targets, and starter animations authored for Nestle from the approved concept sheet. No Quaternius model or animation data is reused.

## Files
- `nestle-original-v1.blend`: editable source. A clean default outfit/hair combination is visible; other modules are hidden in the Outliner.
- `../../public/assets/original/nestle-original-v1.glb`: all modules, one shared skeleton, facial shape targets, and starter clips.
- `../../public/assets/original/manifest.json`: machine-readable variant and animation names.
- `../../scripts/build-original-avatars.py`: reproducible authoring source, executed with Blender 4.5 LTS.

## Rebuild
Run Blender in background mode: `blender --background --python scripts/build-original-avatars.py` from the project. The portable build used here lives under `.cache/blender` and is not a project dependency to commit or distribute.

## Assembly
Keep `BaseSkinAndShoes` and face meshes visible. Choose exactly one `Hair_*` module and one `Outfit_*` module. Every module is weighted to `NestleSharedSkeleton`. They are gender unrestricted. The GLB includes every module so applications must set visibility explicitly.

Material names: Skin, Nose, Blush, Hair, HairRidge, Outfit, Trim, Trousers, Shoes, Sole, FaceDark, EyeGlint. Hair and clothing colors are changed through those materials. Facial morph targets: Happy, Sad, Sleepy, Surprised, Affectionate; all zero is Neutral.

Starter clips: Idle, Walk (in place), Wave, Sit (transition into held pose), Dance, Hug (partner arm pose). A synchronized hug requires the scene to position and orient both partners. These are authored starter clips, not captured performance animation.

## Refinement 2
Swept, tapered locks replace the separate fringe ellipsoids. Bob, long fringe, curls, and ponytail retain their own silhouettes. The base has smaller ears, inset ear detail, smaller mittens, and continuous arms. Clothing uses continuous sleeves and trouser legs with blended elbow and knee weights, shaped torsos, cuffs, hems, hoodie cords, and a softly fluted dress with a waist ribbon. Expressions follow the head surface; Happy and Affectionate use smiling eyes, and Sleepy has closed eyes and a small yawning mouth.

Asset paths, variant names, materials, skeleton, and clip names remain compatible with the existing preview and saved appearances. The manifest records `revision: 2`.

## Visual review
Run `blender --background output/models/nestle-original-v1.blend --python scripts/render-original-review.py` for the hairstyle, outfit, and expression sheet. Append `-- .impeccable/review/original/refined-turnaround.png --turnaround` for front, three-quarter, side, and rear views. These renders inspect the actual model; they are not browser screenshots. Review images are under `.impeccable/review/original/`.

## Review limits
This remains a procedural modeling pass, not exact sculpted equivalence to the concept. Head and hair attachments are rigid; garment elbows, knees, and waists use blended weights. Animation contact, extreme-pose clipping, sculpted hair detail, and physical-phone performance still need dedicated review. Facial shape targets are editable. Browser control was unavailable during this refinement, so the new export was verified with offline renders and Three.js asset/animation checks.

The earlier asset preview is retained at `/quaternius.html` and its saved appearances remain separate.
