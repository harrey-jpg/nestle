-- One private conversation for the already-linked Alexa/Harry devices.
create table public.nestle_messages (
  id uuid primary key,
  seq bigint generated always as identity unique,
  sender text not null references public.nestle_profiles(profile_id),
  body text not null check (char_length(btrim(body)) between 1 and 4000 and body ~ '[^[:space:]]'),
  created_at timestamptz not null default clock_timestamp(),
  delivered_at timestamptz,
  read_at timestamptz,
  check (delivered_at is null or delivered_at>=created_at),
  check (read_at is null or (delivered_at is not null and read_at>=delivered_at))
);
create index nestle_messages_sender_seq_idx on public.nestle_messages(sender,seq);
create index nestle_messages_unread_idx on public.nestle_messages(sender) where read_at is null;
alter table public.nestle_messages enable row level security;
revoke all on public.nestle_messages from public,anon,authenticated;
grant select on public.nestle_messages to authenticated;
grant insert(id,sender,body) on public.nestle_messages to authenticated;
grant usage on sequence public.nestle_messages_seq_seq to authenticated;
create policy "Linked devices read the private conversation" on public.nestle_messages
for select to authenticated using ((select public.is_nestle_device()) and exists
  (select 1 from public.nestle_profile_devices where user_id=(select auth.uid())));
create policy "Send only as own fixed profile" on public.nestle_messages
for insert to authenticated with check ((select public.is_nestle_device()) and sender in
  (select profile_id from public.nestle_profile_devices where user_id=(select auth.uid())));

create function public.send_nestle_message(p_id uuid,p_body text)
returns setof public.nestle_messages language plpgsql security invoker set search_path='' as $$
declare profile text; text_body text; existing public.nestle_messages;
begin
  if auth.uid() is null or not public.is_nestle_device() then
    raise exception 'Connected device required' using errcode='42501';
  end if;
  select profile_id into profile from public.nestle_profile_devices where user_id=auth.uid();
  if profile is null then raise exception 'Choose your profile first' using errcode='42501'; end if;
  text_body:=regexp_replace(p_body,'^[[:space:]]+|[[:space:]]+$','','g');
  if p_id is null or text_body is null or char_length(text_body) not between 1 and 4000 then
    raise exception 'Messages must contain 1 to 4000 characters' using errcode='22023';
  end if;
  insert into public.nestle_messages(id,sender,body) values(p_id,profile,text_body)
    on conflict(id) do nothing;
  select * into existing from public.nestle_messages where id=p_id;
  if existing.sender<>profile or existing.body<>text_body then
    raise exception 'That message ID has already been used' using errcode='22023';
  end if;
  return next existing;
end $$;

create function nestle_private.ack_messages(p_ids uuid[],p_read boolean default false)
returns setof public.nestle_messages language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); profile text; stamp timestamptz:=clock_timestamp();
begin
  if uid is null or not exists(select 1 from public.nestle_devices where user_id=uid and revoked_at is null) then
    raise exception 'Connected device required' using errcode='42501';
  end if;
  select profile_id into profile from public.nestle_profile_devices where user_id=uid;
  if profile is null then raise exception 'Choose your profile first' using errcode='42501'; end if;
  if p_ids is null or cardinality(p_ids)>100 or p_read is null then
    raise exception 'Invalid receipt batch' using errcode='22023';
  end if;
  update public.nestle_messages
    set delivered_at=coalesce(delivered_at,stamp),
        read_at=case when p_read then coalesce(read_at,stamp) else read_at end
    where id=any(p_ids) and sender<>profile
      and (delivered_at is null or (p_read and read_at is null));
  return query select * from public.nestle_messages where id=any(p_ids) and sender<>profile;
end $$;
create function public.ack_nestle_messages(p_ids uuid[],p_read boolean default false)
returns setof public.nestle_messages language sql security invoker set search_path='' as $$
  select * from nestle_private.ack_messages(p_ids,p_read);
$$;
revoke all on function public.send_nestle_message(uuid,text),
  nestle_private.ack_messages(uuid[],boolean),public.ack_nestle_messages(uuid[],boolean)
  from public,anon,authenticated;
grant execute on function public.send_nestle_message(uuid,text),
  nestle_private.ack_messages(uuid[],boolean),public.ack_nestle_messages(uuid[],boolean)
  to authenticated;
comment on table public.nestle_messages is 'One private Alexa/Harry conversation. Bodies are immutable, sender is device-bound, receipts are server-stamped by the recipient.';
