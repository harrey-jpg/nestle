# Nestle

A private couples app for exactly Alexa and Harry. Intended platforms are iOS/Android; this workspace currently delivers a local web app connected to a live Supabase shared-home backend. It is not yet hosted or validated on physical phones.

## Identity and shared home

First launch asks “Is this Harry or Alexa?” Choosing a name connects the installation and remembers its fixed profile, without an email, password, setup code or link. Clearing storage returns to the name choice. This is self-selected identity, not verified personal identity: anyone who can reach the app can choose either name. Existing bindings, revocations and own-expression restrictions remain enforced. The live backend requires `backend/simple-profile-choice.sql` to enable this behavior; this session has not deployed that migration.

Alexa owns the long-haired character; Harry owns the short-haired character. Only the owner’s expression is writable. Both expressions sync through five-second visible-page polling and a focus refresh. Failed writes are not presented as shared. Offline rooms remain visible with expression controls disabled; reconnection is automatic. Revision checks protect concurrent edits.

## Home experience

The approved illustrated 4:3 room, pixel faces, precise moles and sixteen expressions remain intact. The improved hair, cross-legged study pose, seated sofa anatomy and cuddle layering remain current. Each activity has subtle motion, respecting Pause and reduced motion. Fullscreen, responsive layouts and keyboard focus are supported.

Device-local time controls lighting. Shared routines are computed on the server using Manila time. Fourteen combinations cover six activities; no activity picker exists. Cuddling is paired. Poses remain settled while watched and refresh after returning from a minute away, with a server-side cooldown. Partner expressions sync without moving the current scene.

## Private conversation

One saved conversation for Alexa and Harry, with text, an emoji picker, private photo and animated GIF uploads, optional captions, unread counts, history, delivery/seen receipts, offline drafts and explicit retry. Realtime updates have a polling fallback. Only approved linked devices can read or send; sender identity comes from the fixed server binding. User text stays text; images use signed private-storage URLs. Android/iPhone projects and opt-in push delivery are prepared but require Firebase/APNs configuration, signing and physical-phone validation. Camera capture and map remain future work.

## Scope and validation

Exactly two fixed profiles and one home. No public signup, email login, partner search, furnishing editor, weather, location sharing, camera, widgets or AI. Existing legacy Home entries and notes were preserved; they are not newly implemented features. Former 3D previews remain historical.

All 31 automated tests pass. Earlier live checks verify profile sync, ownership, private links, persistence and recovery. Isolated mobile/desktop checks cover media composition, rendering and reload/retry; dispatcher tests mock FCM. Read-only backend checks verify the new access rules and inactive push configuration. Verification devices remain revoked. Native builds and physical-phone delivery remain unverified; see MOBILE.md.
