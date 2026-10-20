-- Álbum privado: ejecuta este archivo completo en Supabase > SQL Editor.
-- Solo estas dos cuentas de Google podrán ver, subir o borrar fotos.

create table if not exists public.allowed_emails (
  email text primary key
);

alter table public.allowed_emails enable row level security;

insert into public.allowed_emails (email)
values
  ('alexmorenon8@gmail.com'),
  ('mireyavm06@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_allowed_user() from public;
grant execute on function public.is_allowed_user() to authenticated;

-- Quita las reglas abiertas que se crearon cuando el álbum era público.
do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'gallery_photos'
  loop
    execute format('drop policy if exists %I on public.gallery_photos', policy_name);
  end loop;

  for policy_name in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (qual like '%gordita-photos%' or with_check like '%gordita-photos%')
  loop
    execute format('drop policy if exists %I on storage.objects', policy_name);
  end loop;
end;
$$;

alter table public.gallery_photos enable row level security;

create policy "Usuarios permitidos ven el album"
on public.gallery_photos for select to authenticated
using ((select public.is_allowed_user()));

create policy "Usuarios permitidos anaden fotos"
on public.gallery_photos for insert to authenticated
with check ((select public.is_allowed_user()));

create policy "Usuarios permitidos borran fotos"
on public.gallery_photos for delete to authenticated
using ((select public.is_allowed_user()));

-- Convierte el bucket existente en privado; las URLs firmadas las crea la web.
update storage.buckets set public = false where id = 'gordita-photos';

create policy "Usuarios permitidos ven archivos"
on storage.objects for select to authenticated
using (bucket_id = 'gordita-photos' and (select public.is_allowed_user()));

create policy "Usuarios permitidos suben archivos"
on storage.objects for insert to authenticated
with check (bucket_id = 'gordita-photos' and (select public.is_allowed_user()));

create policy "Usuarios permitidos borran archivos"
on storage.objects for delete to authenticated
using (bucket_id = 'gordita-photos' and (select public.is_allowed_user()));
