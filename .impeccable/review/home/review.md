# Illustrated home review

Scope: the main living-room preview, approved pixel characters, device-local day/night lighting, pause and fullscreen. Furniture editing and character interactions remain outside this step.

Independent finish review: **Ship**. Inspected desktop/mobile morning/night captures and implementation; no blocking usability or visual findings. Optional accessibility wording improvement was applied, then the complete browser checks and same capture matrix passed again.

Nine Node tests pass, including local-time phase boundaries, continuous bounded lighting for a full day, invalid dates, and exact approved-character file integrity. Browser checks verify day/night rendering at 1440×1000 and 390×844 in Asia/Manila, no overflow or browser errors, automatic transition on an already-open page, reduced-motion handling, pause persistence, and the lighting details control.

The mechanical detector flagged the initially transparent night layer, a pulsing loading indicator, and tokens differing from the old 3D design record. The first two are functional behaviors, not decorative concealment/liveness; documentation now describes the replacement world. No second detector was run.

Accepted limits: two fixed illustrations blend at fixed local-clock times; seasonal sunrise and weather are not simulated. Physical-phone testing has not been performed. Fullscreen is capability-gated. The earlier 3D code/assets remain as historical development material and are not loaded by the main route.

Room art was created with built-in image_gen. Exact prompts are in `output/pixel-art/room-art-prompts.json` and embedded in each shipping room PNG. Character assets are byte-for-byte copies of the locally authored approved pxl exports.
