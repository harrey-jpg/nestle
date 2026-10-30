# public.nestle_profile_devices

> God node · 10 connections · `backend/private-home.sql`

**Community:** [private-home.sql](private-home.sql.md)

## Connections by Relation

### contains
- [private-home.sql](private-home.sql.md) `EXTRACTED`

### indexes
- nestle_profile_devices_profile_idx `EXTRACTED`

### reads_from
- public.send_nestle_media_message() `EXTRACTED`
- nestle_private.queue_chat_push() `EXTRACTED`
- nestle_private.ack_messages() `EXTRACTED`
- nestle_private.advance_room() `EXTRACTED`
- nestle_private.connect_profile() `EXTRACTED`

### references
- public.nestle_profiles `EXTRACTED`
- auth.users `EXTRACTED`

### writes_to
- nestle_private.connect_profile() `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*