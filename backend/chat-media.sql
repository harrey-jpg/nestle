-- Private, immutable image/GIF attachments. Apply after messages.sql.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('nestle-chat','nestle-chat',false,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do nothing;
create policy "Linked devices view chat images" on storage.objects for select to authenticated
using(bucket_id='nestle-chat' and (select public.is_nestle_device()) and exists
 (select 1 from public.nestle_profile_devices where user_id=(select auth.uid())));
create policy "Upload own chat images" on storage.objects for insert to authenticated
with check(bucket_id='nestle-chat' and (select public.is_nestle_device()) and (storage.foldername(name))[1] in
 (select profile_id from public.nestle_profile_devices where user_id=(select auth.uid()))
 and name ~ '^(alexa|harry)/[0-9a-f-]{36}/image[.](png|jpg|gif|webp)$');
alter table public.nestle_messages add column attachment_path text;
alter table public.nestle_messages drop constraint nestle_messages_body_check;
alter table public.nestle_messages add constraint nestle_message_content_check check
 (char_length(body)<=4000 and (body ~ '[^[:space:]]' or attachment_path is not null));
alter table public.nestle_messages add constraint nestle_message_attachment_check check
 (attachment_path is null or attachment_path ~ ('^'||sender||'/'||id::text||'/image[.](png|jpg|gif|webp)$'));
grant insert(attachment_path) on public.nestle_messages to authenticated;
alter policy "Send only as own fixed profile" on public.nestle_messages with check
 ((select public.is_nestle_device()) and sender in
 (select profile_id from public.nestle_profile_devices where user_id=(select auth.uid()))
 and (attachment_path is null or exists(select 1 from storage.objects where bucket_id='nestle-chat' and name=attachment_path)));
create function public.send_nestle_media_message(p_id uuid,p_body text,p_path text)
returns setof public.nestle_messages language plpgsql security invoker set search_path='' as $$
declare profile text; existing public.nestle_messages; caption text:=btrim(coalesce(p_body,''));
begin
 if not public.is_nestle_device() then raise exception 'Connected device required' using errcode='42501'; end if;
 select profile_id into profile from public.nestle_profile_devices where user_id=auth.uid();
 if profile is null or p_path is null then raise exception 'Profile and image required' using errcode='22023'; end if;
 insert into public.nestle_messages(id,sender,body,attachment_path) values(p_id,profile,caption,p_path) on conflict(id) do nothing;
 select * into existing from public.nestle_messages where id=p_id;
 if existing.sender<>profile or existing.body<>caption or existing.attachment_path is distinct from p_path then
 raise exception 'That message ID has already been used' using errcode='22023'; end if;
 return next existing;
end $$;
revoke all on function public.send_nestle_media_message(uuid,text,text) from public,anon;
grant execute on function public.send_nestle_media_message(uuid,text,text) to authenticated;
alter publication supabase_realtime add table public.nestle_messages;

-- Tokens are installation-owned, never visible to the partner.
create table public.nestle_push_devices (
 user_id uuid primary key references auth.users(id) on delete cascade,
 token text not null unique check(char_length(token) between 20 and 4096),
 platform text not null check(platform in ('android','ios')),
 updated_at timestamptz not null default now()
);
alter table public.nestle_push_devices enable row level security;
revoke all on public.nestle_push_devices from public,anon,authenticated;
grant select,insert,update,delete on public.nestle_push_devices to authenticated;
create policy "Own notification registration" on public.nestle_push_devices for all to authenticated
using(user_id=(select auth.uid()) and (select public.is_nestle_device()))
with check(user_id=(select auth.uid()) and (select public.is_nestle_device()) and exists
 (select 1 from public.nestle_profile_devices where user_id=(select auth.uid())));

