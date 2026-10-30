# Gaming motion

Source: `../gaming-motion.px.js`. Shared transparent four-frame overlay, each frame 128×208. The resting frame is transparent; the next three frames animate thumb taps and the handheld screen. Four seconds of rest plus three 400 ms frames produce a 5.2-second cycle. The second character's CSS offset is -2.1 seconds.

Only the controller area changes. All approved bodies, faces, moles and expressions remain untouched. Runtime copy: `public/assets/activities/gaming_thumb_taps.png`. Pause, hidden pages and reduced motion restore rest. Other activities hide the overlay.

Desktop/mobile browser checks passed for the animation frame, staggered timing, expression compatibility, Pause, hidden-page handling, reduced motion and activity-only visibility. Reading and studying regression checks also passed. Captures and results: `.impeccable/review/gaming/`.
