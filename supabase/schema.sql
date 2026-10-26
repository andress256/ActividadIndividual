-- Incidencias360 · Esquema de la base de datos relacional (Supabase / PostgreSQL)
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run.
-- Después ejecutar seed.sql para cargar los datos sintéticos.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table if not exists public.departments (
  id   integer primary key,
  name text    not null unique
);

create table if not exists public.incidents (
  id            text        primary key,
  title         text        not null check (char_length(title) between 5 and 80),
  description   text        not null check (char_length(description) >= 10),
  status        text        not null default 'open'
                            check (status in ('open', 'in-progress', 'closed')),
  priority      text        not null default 'medium'
                            check (priority in ('low', 'medium', 'high')),
  department_id integer     not null references public.departments (id),
  created_at    timestamptz not null default now(),
  created_by    text        not null
);

-- El título es único sin distinguir mayúsculas (lo comprueba también la validación asíncrona).
create unique index if not exists incidents_title_unique on public.incidents (lower(title));
create index if not exists incidents_department_idx on public.incidents (department_id);
create index if not exists incidents_created_at_idx on public.incidents (created_at desc);

-- ---------------------------------------------------------------------------
-- Seguridad: Row Level Security
-- ---------------------------------------------------------------------------
-- La app usa la clave pública (anon). La autenticación de la demo es simulada en
-- el cliente, así que el rol anónimo puede leer, crear y actualizar incidencias,
-- pero NO borrarlas ni modificar los departamentos. Los datos son sintéticos.

alter table public.departments enable row level security;
alter table public.incidents   enable row level security;

drop policy if exists "departments_select" on public.departments;
create policy "departments_select" on public.departments
  for select to anon, authenticated using (true);

drop policy if exists "incidents_select" on public.incidents;
create policy "incidents_select" on public.incidents
  for select to anon, authenticated using (true);

drop policy if exists "incidents_insert" on public.incidents;
create policy "incidents_insert" on public.incidents
  for insert to anon, authenticated with check (status = 'open');

drop policy if exists "incidents_update" on public.incidents;
create policy "incidents_update" on public.incidents
  for update to anon, authenticated using (true) with check (true);
