-- No outbound requests occur until nestle_push_dispatch_secret exists in Vault.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
create function nestle_private.wake_chat_push(p_message uuid) returns void language plpgsql security definer set search_path='' as $$
declare secret text;
begin
 select decrypted_secret into secret from vault.decrypted_secrets where name='nestle_push_dispatch_secret' limit 1;
 if secret is null then return; end if;
 perform net.http_post(
  url:='https://nvokjxwkqtgwdsyozspz.supabase.co/functions/v1/chat-push',
  headers:=jsonb_build_object('Content-Type','application/json','x-nestle-push-secret',secret),
  body:=jsonb_build_object('message_id',p_message),timeout_milliseconds:=10000);
exception when others then
 raise log 'Nestle push wakeup deferred; the delivery job remains queued';
end $$;
create function nestle_private.wake_new_chat_push() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform nestle_private.wake_chat_push(new.message_id);return new;
end $$;
create trigger wake_new_chat_push after insert on nestle_private.push_jobs for each row execute function nestle_private.wake_new_chat_push();
create function nestle_private.retry_chat_push() returns void language plpgsql security definer set search_path='' as $$
declare item record;
begin
 for item in select distinct j.message_id from nestle_private.push_jobs j
 join public.nestle_messages m on m.id=j.message_id
 where j.sent_at is null and j.attempts<10 and m.created_at>now()-interval '24 hours'
 and (j.claimed_at is null or j.claimed_at<now()-interval '2 minutes') limit 20 loop
 perform nestle_private.wake_chat_push(item.message_id);
 end loop;
end $$;
revoke all on function nestle_private.wake_chat_push(uuid),nestle_private.wake_new_chat_push(),nestle_private.retry_chat_push() from public,anon,authenticated;
select cron.schedule('nestle-chat-push-retry','* * * * *','select nestle_private.retry_chat_push()');
