# private-home.sql

> 47 nodes · cohesion 0.08

## Key Concepts

- **private-home.sql** (15 connections) — `backend/private-home.sql`
- **public.nestle_messages** (10 connections) — `backend/messages.sql`
- **public.nestle_profile_devices** (10 connections) — `backend/private-home.sql`
- **public.nestle_devices** (8 connections)
- **nestle_private.push_jobs** (7 connections) — `backend/chat-push.sql`
- **public.send_nestle_media_message()** (6 connections) — `backend/chat-media.sql`
- **chat-push.sql** (6 connections) — `backend/chat-push.sql`
- **messages.sql** (6 connections) — `backend/messages.sql`
- **nestle_private.queue_chat_push()** (5 connections) — `backend/chat-push.sql`
- **nestle_private.ack_messages()** (5 connections) — `backend/messages.sql`
- **nestle_private.profile_invites** (5 connections) — `backend/private-home.sql`
- **public.nestle_profiles** (5 connections) — `backend/private-home.sql`
- **nestle_private.connect_profile()** (5 connections) — `backend/simple-profile-choice.sql`
- **public.nestle_push_jobs()** (4 connections) — `backend/chat-push.sql`
- **chat-push-wakeup.sql** (4 connections) — `backend/chat-push-wakeup.sql`
- **nestle_private.retry_chat_push()** (4 connections) — `backend/chat-push-wakeup.sql`
- **nestle_private.advance_room()** (4 connections) — `backend/private-home.sql`
- **public.nestle_push_devices** (3 connections) — `backend/chat-media.sql`
- **public** (3 connections)
- **queue_chat_push** (3 connections) — `backend/chat-push.sql`
- **auth.users** (3 connections)
- **wake_new_chat_push** (3 connections) — `backend/chat-push-wakeup.sql`
- **public.send_nestle_message()** (3 connections) — `backend/messages.sql`
- **nestle_private.connect_profile()** (3 connections) — `backend/private-home.sql`
- **stamp_nestle_profile** (3 connections) — `backend/private-home.sql`
- *... and 22 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/chat-media.sql`
- `backend/chat-push-wakeup.sql`
- `backend/chat-push.sql`
- `backend/messages.sql`
- `backend/private-home.sql`
- `backend/simple-profile-choice.sql`

## Audit Trail

- EXTRACTED: 84 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*