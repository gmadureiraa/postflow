-- Atomic check-and-increment pra usage_count.
-- Substitui a combinação check (node) + RPC increment que tinha TOCTOU:
-- duas requests simultâneas com count = limit - 1 passavam ambas no check
-- e incrementavam pra limit + 1. Aqui o UPDATE condicional garante que só
-- uma ganha, e retornamos o resultado pro caller decidir.

create or replace function public.try_increment_usage_count(uid uuid)
returns table(allowed boolean, new_count int, usage_limit int, plan text)
language plpgsql
security definer set search_path = ''
as $$
declare
  row_limit int;
  row_plan text;
  row_count int;
begin
  update public.profiles
     set usage_count = usage_count + 1,
         updated_at = now()
   where id = uid
     and usage_count < usage_limit
  returning usage_count, usage_limit, plan
    into row_count, row_limit, row_plan;

  if found then
    allowed := true;
    new_count := row_count;
    usage_limit := row_limit;
    plan := row_plan;
    return next;
  else
    select p.usage_count, p.usage_limit, p.plan
      into row_count, row_limit, row_plan
      from public.profiles p
     where p.id = uid;
    allowed := false;
    new_count := coalesce(row_count, 0);
    usage_limit := coalesce(row_limit, 5);
    plan := coalesce(row_plan, 'free');
    return next;
  end if;
end;
$$;

grant execute on function public.try_increment_usage_count(uuid) to authenticated, service_role;
