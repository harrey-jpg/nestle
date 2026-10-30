# Nestle · Our little home

Run `npm install`, then `npm start`. Open [the local app](http://localhost:5173).

Nestle is a shared home for Alexa and Harry. First launch asks “Is this Harry or Alexa?” with two portrait choices and no email, password or setup-link fields. Connected devices remember their fixed profile. Only the owner’s expression can be edited; both expressions sync through the live Supabase backend about every five seconds while visible and immediately on returning.

## Connect your devices

Choose Harry or Alexa once; the browser remembers that profile. No setup link or previously connected device is needed. Clearing browser storage returns to the name choice. This is self-selected identity: anyone who can reach the app can choose either profile.

Apply `backend/simple-profile-choice.sql` in the existing Supabase project's SQL editor before using the new connection flow. It replaces invite-gated connection with self-service profile binding, keeps current bindings and revocations, and retires link creation. This session has not applied that migration. The frontend still runs on localhost on this computer; phones need a hosted HTTPS app address.

## Life at home

The original illustrated room and approved pixel characters are preserved, including all sixteen expressions and the corrected hair, cross-legged study, sofa and cuddle poses. Device-local time controls morning/night lighting. A shared server routine follows Manila time and chooses among fourteen combinations of six activities. No activity picker exists. Poses stay settled while watched; returning after a minute away refreshes the routine, subject to a one-minute server cooldown. Partner expressions sync independently. Pause, reduced motion and fullscreen remain supported.

Network loss keeps the last room visible and disables expression changes until reconnection. Writes are confirmed by the server before being labelled shared. Revision checks protect simultaneous edits; older polls cannot roll back confirmed changes.

## Private messages

Home and Messages navigation opens one saved conversation for Alexa and Harry. Chat supports text, emoji, private photos and animated GIF uploads, optional captions, unread counts, history and Sent / Delivered / Seen receipts. Realtime changes refresh chat immediately, with a 2.5-second visible-app fallback. Native Android/iPhone projects and the push pipeline are prepared; background alerts still require Firebase/APNs configuration, signing and physical-phone checks. See [mobile setup](MOBILE.md).

Drafts and failed sends are retained in local browser storage where available. Failed messages have an explicit Retry action; retries reuse the same ID to prevent duplicates. Message bodies render as text, including HTML-looking content. Only linked, non-revoked devices can access the conversation, and the server derives the sender from the fixed profile binding. Messages cannot be edited or deleted by clients.

## Implementation and checks

Main app: `public/index.html`, `home.css`, `home.js`, `shared-home.mjs`, `character-state.mjs`, `room-activities.mjs` and `room-time.mjs`. Messages use `messages.mjs`, `message-store.mjs` and `messages.css`. Original schema sources include `backend/private-home.sql` and `backend/messages.sql`; `backend/simple-profile-choice.sql` updates connection behavior without changing legacy Home entries or notes. Only a publishable key ships in the client. Database rules enforce fixed device ownership and own-expression writes after the self-service choice.

Supabase client 2.118.0 is pinned. The postinstall script copies its browser build and MIT license into `public/assets/vendor/`; no external JavaScript CDN is used. Editable artwork and approval records remain in `output/pixel-art/`, with runtime copies under `public/assets/`. No Adorable Home game artwork is bundled.

Run `npm test` for automated checks, including first connection and session restoration without an invite. Earlier live checks verified two-profile sync, the former invite-gated access controls, persistence and recovery; they do not validate the new migration. Temporary verification devices remain revoked. Media browser checks use an isolated mocked backend; notification tests use mocked FCM delivery. Captures include `.impeccable/review/chat-media/`. Native builds and physical phones remain unverified. See `backend/README.md` and `MOBILE.md` for details.

## Retained work

Legacy 3D assets, Blender sources and scripts remain separate; the main app does not load them. The Quaternius preview at `/quaternius.html` retains its CC0 license. Nunito retains its SIL Open Font License. Original room prompts and pixel approval records are retained. Caches, setup links, session data, dependencies, environment files and Blender backups are excluded from Git.
