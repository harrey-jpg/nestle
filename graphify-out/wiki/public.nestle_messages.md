# public.nestle_messages

> God node · 10 connections · `backend/messages.sql`

**Community:** [private-home.sql](private-home.sql.md)

## Connections by Relation

### contains
- messages.sql `EXTRACTED`

### indexes
- nestle_messages_sender_seq_idx `EXTRACTED`
- nestle_messages_unread_idx `EXTRACTED`

### reads_from
- nestle_private.retry_chat_push() `EXTRACTED`
- public.send_nestle_message() `EXTRACTED`

### references
- nestle_private.push_jobs `EXTRACTED`
- public.nestle_profiles `EXTRACTED`

### triggers
- queue_chat_push `EXTRACTED`

### writes_to
- public.send_nestle_media_message() `EXTRACTED`
- nestle_private.ack_messages() `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*