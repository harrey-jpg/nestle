-- Durable per-recipient jobs; only the server can read or dispatch these.
create table nestle_private.push_jobs (
 message_id uuid not null references public.nestle_messages(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 sent_at timestamptz,
 claimed_at timestamptz,
 attempts integer not null default 0,
 primary key(message_id,user_id)
);
alter table nestle_private.push_jobs enable row level security;
create index push_jobs_user_idx on nestle_private.push_jobs(user_id);
revoke all on nestle_private.push_jobs from public,anon,authenticated;
create function nestle_private.queue_chat_push() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into nestle_private.push_jobs(message_id,user_id)
 select new.id,p.user_id from public.nestle_push_devices p
 join public.nestle_profile_devices b on b.user_id=p.user_id
 join public.nestle_devices d on d.user_id=p.user_id
 where b.profile_id<>new.sender and d.revoked_at is null;
 return new;
end $$;
revoke all on function nestle_private.queue_chat_push() from public,anon,authenticated;
create trigger queue_chat_push after insert on public.nestle_messages for each row execute function nestle_private.queue_chat_push();
-- Service-only RPCs keep the private schema out of the Data API.
create function public.nestle_push_jobs(p_message uuid)
returns table(message_id uuid,user_id uuid,token text) language sql security invoker set search_path='' as $$
 with picked as (select j.message_id,j.user_id,p.token from nestle_private.push_jobs j
 join public.nestle_push_devices p on p.user_id=j.user_id
 join public.nestle_devices d on d.user_id=j.user_id
 where j.sent_at is null and (j.claimed_at is null or j.claimed_at<now()-interval '2 minutes') and j.message_id=p_message and d.revoked_at is null
 for update of j skip locked), claimed as (
 update nestle_private.push_jobs j set claimed_at=now() from picked p
 where j.message_id=p.message_id and j.user_id=p.user_id returning j.message_id,j.user_id)
 select c.message_id,c.user_id,p.token from claimed c join picked p using(message_id,user_id);
$$;
create function public.finish_nestle_push(p_message uuid,p_user uuid,p_sent boolean)
returns void language sql security invoker set search_path='' as $$
 update nestle_private.push_jobs set attempts=attempts+1,claimed_at=null,sent_at=case when p_sent then now() else sent_at end
 where message_id=p_message and user_id=p_user;
$$;
grant usage on schema nestle_private to service_role;
grant select,update on nestle_private.push_jobs to service_role;
revoke all on function public.nestle_push_jobs(uuid),public.finish_nestle_push(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.nestle_push_jobs(uuid),public.finish_nestle_push(uuid,uuid,boolean) to service_role;
