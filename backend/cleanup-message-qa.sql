-- Optional administrator cleanup after the connector supports destructive requests again.
-- These are only the isolated verification objects created for the Messages feature.
-- Never change these names to the production nestle_messages table/functions.
drop function if exists public.ack_nestle_messages_qa(uuid[],boolean);
drop function if exists nestle_private.ack_messages_qa(uuid[],boolean);
drop function if exists public.send_nestle_message_qa(uuid,text);
drop table if exists public.nestle_messages_qa;
