---
name: Nestle
description: A quiet illustrated home for two approved pixel characters.
colors:
  day-background: "#fce8ec"
  day-surface: "#fff7ee"
  day-text: "#5a1e3c"
  day-secondary: "#7a4b60"
  day-accent: "#a9365b"
  day-border: "#dfbdc8"
  day-focus: "#90274c"
  day-sage: "#4b694b"
  day-room-fallback: "#e6c8aa"
  night-background: "#251c2b"
  night-surface: "#322637"
  night-text: "#f5e6e1"
  night-secondary: "#cdb7c4"
  night-accent: "#e6a1b6"
  night-border: "#574356"
  night-focus: "#f3bdd0"
  night-sage: "#aec1a0"
  night-room-fallback: "#3e3447"
typography:
  wordmark:
    fontFamily: "Nunito, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "32px"
    fontWeight: 950
    lineHeight: 1
    letterSpacing: "-1px"
  headline:
    fontFamily: "Nunito, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "32px"
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "-0.8px"
  body:
    fontFamily: "Nunito, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  label:
    fontFamily: "Nunito, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 750
rounded:
  portrait-control: "8px"
  room-mobile: "12px"
  room: "14px"
spacing:
  tight: "4px"
  compact: "8px"
  small: "12px"
  medium: "16px"
  roomy: "18px"
  large: "24px"
components:
  room-control:
    backgroundColor: "transparent"
    rounded: "{rounded.portrait-control}"
    padding: "8px 10px"
    typography: "{typography.label}"
  room-control-hover:
    backgroundColor: "{colors.day-background}"
  room-control-night-hover:
    backgroundColor: "{colors.night-background}"
  retry-button:
    backgroundColor: "{colors.day-background}"
    rounded: "{rounded.portrait-control}"
    padding: "9px 20px"
  room-container:
    backgroundColor: "{colors.day-surface}"
    rounded: "{rounded.room}"
---

# Design System: Nestle

## Overview

**Creative North Star: "Our little home"**

A quiet fixed-view home pairs an original soft illustrated room with the user's approved pixel characters. Domestic life games, including the user-named Adorable Home reference, inform the calm atmosphere; the room artwork is original. Dusty rose, sage, cream, and honey wood give way to plum ambient light and warm lamps as device-local time changes.

The main preview replaces the rejected 3D direction. Rounded, legible controls sit outside the illustration, leaving the room and two personal characters as the focus. Approved faces, hairstyles, outfits, colors, expressions, and mole placements remain intact.

**Key Characteristics:**
- Original illustrated room with crisp pixel characters.
- Fixed composition with automatic local-time lighting.
- Restrained Nunito interface and rounded controls outside the art.
- Subtle blinking, with pause and reduced-motion support.

## Colors

The interface moves between a rose-and-cream day palette and a plum-and-blush night palette. Frontmatter records implemented values from public/home.css.

### Primary
- **Rose accent:** day-accent and night-accent identify the wordmark detail, icons, and links.
- **Focus rose:** day-focus and night-focus keep keyboard focus distinct in each theme.

### Secondary
- **Sage:** day-sage and night-sage color the home and mood indicators.

### Neutral
- **Background and surface:** the page and room frame use their respective day/night tokens.
- **Text and secondary:** strong headings and clock digits contrast with quieter supporting copy.
- **Border:** a single muted edge separates the header, room frame, and portrait tiles.
- **Room fallback:** a warm day or muted night backing supports the image stage while assets load.

**The Local Light Rule.** The interface switches to night colors when the calculated night blend exceeds one half; it does not offer a manual theme selector.

## Typography

Self-hosted Nunito uses the rounded system and Segoe UI fallbacks recorded above. Heavy, compact headings carry the affectionate tone; small supporting text stays calm and readable.

- **Wordmark:** desktop token above; decreases to 29px on smaller screens.
- **Headline:** desktop token above; decreases to 29px at 760px and 26px at 360px.
- **Body:** introductory copy; decreases to 14px on smaller screens.
- **Label:** room controls. Room title uses 15px/800; clock uses tabular numerals at 13px/800. Mobile room title and clock decrease to 13px and 12px respectively.
- **Footer:** 12px with a 1.6 line height.

## Layout

The compact header precedes the title and paired neutral portraits, one dominant room, and the lighting explanation. There is no customization sidebar in the current surface. Main content is centered within 1040px; the header within 1360px. Desktop main padding is 24px 32px 28px, with 26px top padding from 1100px.

The stage keeps a fixed 4:3 ratio. Desktop frame width is min(100%, 960px, calc((100svh - 270px)*1.333333)). At widths of 760px or less the frame fills the content width and main padding becomes 23px 18px. At 360px or less horizontal padding becomes 12px. A desktop viewport at most 580px high uses a maximum 760px frame width. Fullscreen preserves 4:3 within the available viewport.

Character sizing follows the room height rather than fixed desktop/mobile pixels, including fullscreen. Standing positions are 23% and 79% across the room; sofa activities use 31% and 47%, with closer cuddle positions at 35% and 44%. Floor-study positions flank the table at 19% and 81%. Preserve pixelated rendering. Portrait tiles are 48px, 36px on mobile, and 30px on the narrowest screens.

## Elevation & Depth

The interface uses flat surfaces and thin borders, with no card shadow stacks. Depth belongs to the illustration and contact shadows under the characters. Sofa poses have a soft cushion shadow at 57% of the sprite canvas plus the existing foot shadow; floor-study poses have a wider rug-contact shadow. These use warm brown at low opacity, a 2px blur and a 2px downward offset, with slightly deeper opacity at night. Standing retains its foot shadow. Shadows stay behind sprites and never intercept input. Lighting darkens characters by up to 25% with the room's night blend. Room images crossfade over one second during clock updates.

## Shapes

The room uses the room radius, becoming room-mobile on smaller screens. Portraits and controls share the portrait-control radius. Small circular sage dots communicate presence and mood. Crisp pixel edges remain visible against the softly illustrated environment.

## Components

### Room frame and clock

The frame groups a compact room title and phase/time strip above the image, and a mood line plus controls below. The device-local clock refreshes every 15 seconds while visible and immediately on focus or visibility return. Morning starts at 06:00, afternoon at 11:00, evening at 17:00, and night at 20:00. Night artwork fades out from 06:00–07:00 and back in from 17:00–20:00 with smoothstep blending. No location access is used.

### Portrait pair and characters

Neutral portraits and full-body character PNGs are exact copies of approved exports. Portraits are static identity cues, not selectors. Full-body idle strips add a brief closed-eye blink to the approved neutral pose on a 4.8-second cycle, with the second character offset by -1.9 seconds. Pausing returns both sprites to their first frame; the preference persists locally where storage is available. Hidden pages stop blinking. Reduced motion disables animation and transitions and labels the movement control “Still”.

### Fixed profiles and shared expressions

First launch centers two approved portrait buttons: Alexa and Harry, with no email/password fields. The room stays hidden until the device connects. Known devices restore their fixed profile; new devices redeem a private one-use setup link. Choice is enforced through a server device binding, not the old browser preference.

Alexa owns long_hair; Harry owns short_hair. Only the owned character opens the sixteen-expression picker. Partner expressions sync through the shared backend. Changes are decoded and confirmed by the server before the UI reports sharing. Concurrent writes use revisions. Offline mode retains the room but disables expression controls until automatic reconnection.

A small status line below the home identifies the connected profile. A disclosure creates a private own-profile link for another device. Shared routine decisions come from the server in Manila time; lighting still follows device-local time. Activities stay settled while watched, and there is no moment picker.

### Room control behavior

Sofa pose grounding uses a 38% bottom anchor with 43%-height 128×208 sprite canvases. Their feet end at native y=178, with shadows 14% above the canvas bottom and the cuddle pivot at 85% of canvas height. Bent thighs and knees meet the cushion front; shorter shins drop to the floor. This applies equally to sitting, reading, gaming and cuddling, including every expression.

Sitting has a four-frame hand overlay: 8.5 seconds at rest, then three 500 ms frames, with a -4.3-second partner offset. Cuddling uses a synchronized 14-second one-degree lean toward each other. Standing uses an 11-second ±0.6-degree weight shift with a -4.7-second partner offset. Both transforms pivot at the feet and use step-end timing. Expressive sprites keep the body motion without the neutral blink. Pause, page hiding and reduced motion stop every loop and return to rest.

Gaming uses a shared four-frame transparent overlay confined to the handheld screen and thumbs. A 5.2-second step-end cycle rests for four seconds before three 400 ms tap frames; the second character starts 2.1 seconds out of phase. The screen uses the existing muted palette. Pause, page hiding and reduced motion restore the transparent resting frame, and other activities hide the overlay.

Studying uses four-frame notebook/laptop overlays confined to native x=28–101, y=99–141. A six-second step-end cycle rests for 80% of its duration, then moves through three writing/typing frames; the second character starts 2.4 seconds out of phase. Existing Pause, hidden-page and reduced-motion rules apply. Face pixels and expression ownership are unchanged.

Reading has a transparent five-frame book overlay on a 12-second step-end loop. The turn occupies the final 12% of the cycle; the second character starts 5.2 seconds out of phase. Only the page and fingertips change, preserving all face/expression assets. Pause, page hiding and reduced motion return it to the transparent resting frame. Other activities hide the overlay.

Standing characters occupy 50% of the room height; activity sprites occupy 43%, with sofa and rug anchors. Scaling continues in fullscreen. Sitting, reading, gaming and cuddling use sofa positions; cross-legged study poses flank the coffee table. Every activity has all 16 approved face variants.

The scene stays settled while visible. Returning after 60 seconds away selects another time-appropriate pair of activities: study/reading in the morning, study/games during the day, games/cuddles in the evening, quiet poses late at night. No foreground activity timer runs. Characters choose among fourteen shared/mixed combinations through their local-time routines. There is no moment or activity selection control; only the owned character’s expression is user-selected. Each character carries its own activity attribute, so its position, shadow and motion match its own task. Cuddling is paired. Pause blocks automatic return changes; reduced motion keeps sprites still but allows unseen pose updates. Both characters' sprite and motion images decode before switching, and failure retains the whole prior scene. Expressions remain independent and the partner stays read-only.

Transparent controls use at least 44×44px targets, a background-colored hover state, and a 1px downward press. Visible keyboard focus is a 3px focus-token outline with a 4px offset. Mobile controls keep accessible labels while hiding visible text. Fullscreen appears only when supported.

### Loading, error, and lighting explanation

A surface-colored loading layer hides characters until both room images and idle strips load. Failure presents a short message and a bordered retry button. The native disclosure below the frame explains the clock schedule.

## Do's and Don'ts

### Messages surface

Home / Messages navigation appears after private device connection. The messages view preserves the same Nunito, dusty rose/day and plum/night tokens. A partner portrait and clear Messages title lead into a bounded conversation with a scrolling log and persistent composer. Own bubbles use the accent with background-colored text; partner bubbles use the tinted page background. Timestamps and Sent / Delivered / Seen labels remain secondary. Incoming text preserves line breaks and wraps long words safely. The unread count stays beside Messages in navigation.

History loads in pages without losing scroll position. New messages follow the bottom only when already there; receipts mark Seen only for messages actually intersecting the visible conversation. Empty, loading, connection loss, failed-send Retry and offline-draft states are implemented. Retry targets are at least 44px. Navigation preserves keyboard focus, and user text never becomes HTML. The main home artwork and autonomous actions remain unchanged.

### Do:
- **Do** preserve the approved pixel designs and exact mole placements.
- **Do** keep the two original room images in matching fixed compositions.
- **Do** keep the expression picker and room controls outside the illustration; the owned character itself is a clearly named scene button. Respect reduced motion.
- **Do** derive lighting from device-local time without location access.

### Don't:
- **Don't** restore the rejected 3D preview as the main experience.
- **Don't** smooth pixel sprites or replace the room with copied game artwork.
- **Don't** imply furnishing edits, weather, verified human identity, camera/map features, end-to-end encryption, active device push notifications, or a published mobile app exists. Native notification setup is prepared but requires credentials, signing and real-phone validation.
