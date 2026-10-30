# Alexa/Harry opening screen and shared home

Implemented two first-launch portrait choices with no email/password fields. Unknown devices need a private one-use setup link; known devices restore their identity. The room stays hidden before connection. Existing art, expressions and autonomous actions are preserved. Status and own-profile device linking sit below the home.

Live desktop/mobile browser checks passed: first launch, rejection of name-only access, real setup-link redemption, both fixed profiles, own-only controls, cross-session expression sync, rapid changes, persisted identity, quiet foreground poses, offline read-only behavior and automatic reconnection. Visual review covered both welcome screens and the connected desktop Alexa/mobile Harry home. No overflow or page errors were found.

All 24 automated tests passed. Live API checks passed for stranger denial, partner writes, rebinding, setup-link scope/single use, concurrent revisions, server-only routines and revocation. All four test devices were revoked and denied access afterward. Two unused initial owner links remain in the ignored private setup file.

The backend is live; the frontend remains local. Hosted HTTPS and physical-phone validation remain outstanding. Earlier browser-only ownership reviews are historical.
