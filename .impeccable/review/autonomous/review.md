# Autonomous activities

Removed the Next moment button and manual cycling helper. No activity picker was added. Characters choose time-appropriate shared/mixed activities when the user returns after at least one minute away, preserving the quiet foreground scene. Own-character expression controls, Pause, reduced motion and saved mixed poses remain supported.

Failed scene loading keeps the prior moment and retries through a later return; error copy no longer points to a removed manual control.

All 21 automated tests passed. Desktop/mobile day/night browser checks passed: no activity controls, stable foreground, expression selection does not change activities, brief absences preserve the scene, longer absences choose a routine, late-night activities stay calm, Pause holds the scene, and reload retains the saved pair. The expression regression checks also passed for both character choices, persistence, rapid changes, image failure and unavailable storage. Earlier reviews describing manual cycling are historical.
