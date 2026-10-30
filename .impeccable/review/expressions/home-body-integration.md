# Approved home-body integration

The user approved the fuller home-body style and requested integration on 2026-10-25 (Asia/Manila). The main room now loads the 80×208 body assets from `home-body-exports/`, including all 16 expressions per character and a three-frame neutral blink. Portraits, mole placements, browser ownership, saved mood keys, and the lighting schedule are preserved.

Runtime size is 100×260 on desktop, 50×130 on mobile and shorter desktop screens. Both characters retain the existing floor anchors at 25%/77% horizontally and 21% above the image bottom.

Validation: all 12 Node tests pass, including exact runtime/export matching and ownership guards. The native asset check verifies all 32 proposed-then-approved body variants retain every opaque approved head pixel at offset (8,0). Browser checks pass for both owners on desktop/mobile, morning/night, reload persistence, rapid selection, failed-image recovery, storage fallback, and fullscreen. The separate room suite also passes automatic clock transition, pause persistence, and reduced-motion checks.

The inspected images in this directory now show the approved home-body style. Account-based authorization and cross-device partner syncing remain outside the local preview.
