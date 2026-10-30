# Character contact shadows

Added soft cushion shadows for sitting, reading, gaming and cuddling, and a wider contact shadow for cross-legged studying on the rug. Existing shoe shadows and standing sprites are preserved. Shadows follow the room's night blend and do not intercept pointer input.

Batched browser checks passed at desktop/mobile sizes in morning/night: both contact shadows render behind the characters, no horizontal overflow, own-character expression controls remain usable, and the partner stays read-only. Visual inspection covered desktop daytime sitting and mobile nighttime studying. No sprite pixels, expression state or activity scheduling changed.
