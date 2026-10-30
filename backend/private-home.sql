-- Additive schema for the two fixed profiles. Existing Home entries are untouched.
create schema if not exists nestle_private;
revoke all on schema nestle_private from public, anon, authenticated;
grant usage on schema nestle_private to authenticated;

create table public.nestle_profiles (
  profile_id text primary key check (profile_id in ('alexa','harry')),
  character_id text not null unique,
  expression text not null default 'neutral' check (expression in
    ('neutral','happy','affectionate','sad','surprised','sleepy','laughing','angry',
     'worried','shy','confused','annoyed','crying','excited','winking','kissing')),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  check ((profile_id='alexa' and character_id='long_hair') or
         (profile_id='harry' and character_id='short_hair'))
);
insert into public.nestle_profiles(profile_id,character_id) values
  ('alexa','long_hair'),('harry','short_hair');

create table public.nestle_profile_devices (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_id text not null references public.nestle_profiles(profile_id),
  linked_at timestamptz not null default now()
);
create table nestle_private.profile_invites (
  code_hash text primary key,
  profile_id text not null references public.nestle_profiles(profile_id),
  expires_at timestamptz not null default now()+interval '7 days',
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz
);
create table public.nestle_room (
  id integer primary key check (id=1),
  poses jsonb not null default '{"long_hair":"sitting","short_hair":"sitting"}',
  revision bigint not null default 0,
  updated_at timestamptz not null default '-infinity'
);
insert into public.nestle_room(id) values(1);
create index nestle_profile_devices_profile_idx on public.nestle_profile_devices(profile_id);
create index nestle_invites_profile_idx on nestle_private.profile_invites(profile_id);
create index nestle_invites_redeemed_idx on nestle_private.profile_invites(redeemed_by);
alter table public.nestle_profiles enable row level security;
alter table public.nestle_profile_devices enable row level security;
alter table public.nestle_room enable row level security;
alter table nestle_private.profile_invites enable row level security;
revoke all on public.nestle_profiles,public.nestle_profile_devices,public.nestle_room from anon,authenticated;
revoke all on nestle_private.profile_invites from public,anon,authenticated;
grant select on public.nestle_profiles,public.nestle_profile_devices,public.nestle_room to authenticated;
grant update(expression) on public.nestle_profiles to authenticated;

create policy "Read own fixed profile binding" on public.nestle_profile_devices for select to authenticated
using (user_id=(select auth.uid()));
create policy "Linked approved devices read both profiles" on public.nestle_profiles for select to authenticated
using ((select public.is_nestle_device()) and exists
  (select 1 from public.nestle_profile_devices where user_id=(select auth.uid())));
create policy "Change only own expression" on public.nestle_profiles for update to authenticated
using ((select public.is_nestle_device()) and profile_id in
  (select profile_id from public.nestle_profile_devices where user_id=(select auth.uid())))
with check ((select public.is_nestle_device()) and profile_id in
  (select profile_id from public.nestle_profile_devices where user_id=(select auth.uid())));
create policy "Linked approved devices read shared room" on public.nestle_room for select to authenticated
using ((select public.is_nestle_device()) and exists
  (select 1 from public.nestle_profile_devices where user_id=(select auth.uid())));

create function nestle_private.stamp_profile() returns trigger language plpgsql set search_path='' as $$
begin
  new.revision:=old.revision+1;
  new.updated_at:=clock_timestamp();
  return new;
end $$;
create trigger stamp_nestle_profile before update on public.nestle_profiles
for each row execute function nestle_private.stamp_profile();

create function nestle_private.connect_profile(p_profile text,p_invite text default null)
returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); linked text; redeemed text;
begin
  if uid is null then raise exception 'Device session required' using errcode='42501'; end if;
  if p_profile not in ('alexa','harry') or p_profile is null then
    raise exception 'Choose Alexa or Harry' using errcode='22023';
  end if;
  -- Serialize claims for one installation; a device cannot race to claim both identities.
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select profile_id into linked from public.nestle_profile_devices where user_id=uid;
  if linked is not null then
    if not exists(select 1 from public.nestle_devices where user_id=uid and revoked_at is null) then
      raise exception 'This device is no longer connected' using errcode='42501';
    end if;
    if linked<>p_profile then raise exception 'This device already belongs to the other profile' using errcode='42501'; end if;
    return linked;
  end if;
  if exists(select 1 from public.nestle_devices where user_id=uid and revoked_at is not null) then
    raise exception 'This device is no longer connected' using errcode='42501';
  end if;
  if not exists(select 1 from public.nestle_devices where user_id=uid and revoked_at is null) then
    if p_invite is null or length(p_invite)<>64 then
      raise exception 'Open your private setup link to connect this device' using errcode='42501';
    end if;
    update nestle_private.profile_invites set redeemed_by=uid,redeemed_at=now()
      where code_hash=encode(extensions.digest(p_invite,'sha256'),'hex')
      and profile_id=p_profile and redeemed_at is null and expires_at>now()
      returning profile_id into redeemed;
    if redeemed is null then raise exception 'This setup link is invalid, expired, used, or belongs to the other profile' using errcode='42501'; end if;
    insert into public.nestle_devices(user_id,label) values(uid,'Nestle '||p_profile||' device');
  end if;
  insert into public.nestle_profile_devices(user_id,profile_id) values(uid,p_profile);
  return p_profile;
end $$;
create function public.connect_nestle(p_profile text,p_invite text default null)
returns text language sql security invoker set search_path='' as $$
  select nestle_private.connect_profile(p_profile,p_invite);
$$;

create function nestle_private.create_profile_invite() returns text
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); profile text; code text;
begin
  if uid is null or not exists(select 1 from public.nestle_devices where user_id=uid and revoked_at is null) then
    raise exception 'Connected device required' using errcode='42501';
  end if;
  select profile_id into profile from public.nestle_profile_devices where user_id=uid;
  if profile is null then raise exception 'Choose your profile first' using errcode='42501'; end if;
  code:=encode(extensions.gen_random_bytes(32),'hex');
  insert into nestle_private.profile_invites(code_hash,profile_id)
    values(encode(extensions.digest(code,'sha256'),'hex'),profile);
  return code;
end $$;
create function public.create_nestle_setup_link() returns text
language sql security invoker set search_path='' as $$ select nestle_private.create_profile_invite(); $$;

create function nestle_private.advance_room() returns setof public.nestle_room
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); room public.nestle_room; local_time timestamp;
  allowed text[]; hour integer; minute integer; choices jsonb[]; chosen jsonb;
begin
  if uid is null or not exists(select 1 from public.nestle_devices where user_id=uid and revoked_at is null)
    or not exists(select 1 from public.nestle_profile_devices where user_id=uid) then
    raise exception 'Connected device required' using errcode='42501';
  end if;
  select * into room from public.nestle_room where id=1 for update;
  if room.updated_at<=now()-interval '60 seconds' then
    local_time:=now() at time zone 'Asia/Manila';
    hour:=extract(hour from local_time)::integer; minute:=extract(minute from local_time)::integer;
    allowed:=case when hour<6 then array['cuddling','sitting','reading']
      when hour<11 then array['studying','reading','sitting','standing']
      when hour<17 then array['studying','gaming','reading','standing']
      when hour<21 then array['gaming','cuddling','sitting','reading']
      else array['reading','cuddling','sitting'] end;
    select array_agg(jsonb_build_object('long_hair',a,'short_hair',b) order by ord)
      into choices from (values
      (1,'sitting','sitting'),(2,'reading','gaming'),(3,'reading','reading'),
      (4,'studying','sitting'),(5,'studying','studying'),(6,'gaming','reading'),
      (7,'gaming','gaming'),(8,'sitting','studying'),(9,'cuddling','cuddling'),
      (10,'reading','sitting'),(11,'standing','standing'),(12,'sitting','reading'),
      (13,'standing','gaming'),(14,'gaming','standing')) as m(ord,a,b)
      where a=any(allowed) and b=any(allowed)
      and jsonb_build_object('long_hair',a,'short_hair',b)<>room.poses;
    chosen:=choices[1+mod(hour*4+minute/15,array_length(choices,1))];
    update public.nestle_room set poses=chosen,revision=revision+1,updated_at=clock_timestamp()
      where id=1;
  end if;
  return query select * from public.nestle_room where id=1;
end $$;
create function public.advance_nestle_room() returns setof public.nestle_room
language sql security invoker set search_path='' as $$ select * from nestle_private.advance_room(); $$;

revoke all on function nestle_private.stamp_profile(),nestle_private.connect_profile(text,text),
  nestle_private.create_profile_invite(),nestle_private.advance_room(),
  public.connect_nestle(text,text),public.create_nestle_setup_link(),public.advance_nestle_room()
  from public,anon,authenticated;
grant execute on function nestle_private.connect_profile(text,text),nestle_private.create_profile_invite(),
  nestle_private.advance_room(),public.connect_nestle(text,text),
  public.create_nestle_setup_link(),public.advance_nestle_room() to authenticated;
comment on table public.nestle_profiles is 'Exactly Alexa and Harry. Expressions writable only by the linked profile devices.';
comment on table public.nestle_room is 'One private home; routine decisions are server-side and never chosen in the UI.';
