create or replace function public.get_admin_ai_usage()
returns table (
  id uuid,
  user_id uuid,
  user_email text,
  feature text,
  success boolean,
  error_message text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_email text := lower(coalesce(current_setting('request.jwt.claim.email', true), ''));
begin
  if requester_email is distinct from 'cnrhee@gmail.com' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
    select
      e.id,
      e.user_id,
      e.user_email,
      e.feature,
      e.success,
      e.error_message,
      e.metadata,
      e.created_at
    from public.ai_usage_events e
    order by e.created_at desc
    limit 1000;
end;
$$;

revoke all on function public.get_admin_ai_usage() from public;
grant execute on function public.get_admin_ai_usage() to authenticated;
