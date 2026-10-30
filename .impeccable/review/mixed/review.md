# Independent character activities

Fourteen shared/mixed moments now combine six activities. Each character has its own activity attribute, artwork, position, shadow and animation. Cuddling is valid only as a pair. Next moment visits every combination; returning after at least one minute away picks a different local-time-appropriate pair. The foreground scene remains stable.

Existing single-activity saves migrate to paired state under the same storage key. Character ownership and expression preferences are retained. Both characters' sprite and motion assets decode before a scene changes; asset failure keeps the entire previous moment, and retry recovers.

Validation: all 21 automated tests passed. Browser checks passed for all fourteen moments across desktop/mobile and day/night (56 cases), both ownership choices, independent expressions/animations, correct placements, no overflow, saved mixed-state reload, foreground stability, short/long absences, pause and reduced motion. The expression regression suite passed, including fullscreen exit, rapid changes, failure retention and storage fallback. A separate scene asset-failure/retry check passed.

Visual inspection covered desktop reading/gaming, desktop night study/relaxing, mobile relaxing/study and mobile night stretching/gaming. Earlier shared-only review captures are historical; current combination captures and checks are in this directory. Physical-phone validation and connected partner synchronization remain outside the local preview.
