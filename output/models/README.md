# Nestle original character base v1

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

## Review limits
This is a first editable modeling pass, not a promise of exact sculpted equivalence to the generated concept. Modules use rounded primitive-derived topology and mostly rigid bone weights. Clothing deformation, paired-contact polish, hair silhouettes and strand detail can be refined in Blender. Facial shape targets are editable. Validate on physical phones before production use; browser rendering is not a mobile performance certification.

The earlier asset preview is retained at `/quaternius.html` and its saved appearances remain separate.
