revoke execute on function public.is_admin(uuid) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
-- still callable internally by RLS policies (definer) and by the auth trigger.