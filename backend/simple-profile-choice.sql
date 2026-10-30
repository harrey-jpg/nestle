-- Apply after the existing private-home migrations.
-- Profile selection is intentionally self-service: a name choice is not identity verification.
begin;

-- Keep the existing signature for older clients; p_invite is no longer required or used.
create or replace function nestle_private.connect_profile(p_profile text,p_invite text default null)
returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); linked text;
begin
  if uid is null then raise exception 'Device session required' using errcode='42501'; end if;
  if p_profile not in ('alexa','harry') or p_profile is null then
    raise exception 'Choose Alexa or Harry' using errcode='22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  if exists(select 1 from public.nestle_devices where user_id=uid and revoked_at is not null) then
    raise exception 'This device is no longer connected' using errcode='42501';
  end if;
  select profile_id into linked from public.nestle_profile_devices where user_id=uid;
  if linked is not null then
    if linked<>p_profile then
      raise exception 'This device already belongs to the other profile' using errcode='42501';
    end if;
    if not exists(select 1 from public.nestle_devices where user_id=uid and revoked_at is null) then
      raise exception 'This device is no longer connected' using errcode='42501';
    end if;
    return linked;
  end if;
  insert into public.nestle_devices(user_id,label)
    values(uid,'Nestle '||p_profile||' device') on conflict(user_id) do nothing;
  insert into public.nestle_profile_devices(user_id,profile_id) values(uid,p_profile);
  return p_profile;
end $$;
revoke all on function nestle_private.connect_profile(text,text) from public,anon;
grant execute on function nestle_private.connect_profile(text,text) to authenticated;

-- Retire link creation without deleting historical invite records or existing device bindings.
drop function if exists public.create_nestle_setup_link();
drop function if exists nestle_private.create_profile_invite();

commit;
