-- ============================================================
-- MiSalud — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (synced from auth.users via trigger)
-- ============================================================
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  role             text not null default 'user' check (role in ('admin', 'user')),
  created_at       timestamptz not null default now(),
  last_sign_in_at  timestamptz
);

alter table public.profiles enable row level security;

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Trigger: auto-insert profile on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: update last_sign_in_at on login
create or replace function public.handle_user_login()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles
  set last_sign_in_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_login on auth.users;
create trigger on_auth_user_login
  after update of last_sign_in_at on auth.users
  for each row execute function public.handle_user_login();

-- ============================================================
-- SPECIALISTS
-- ============================================================
create table if not exists public.specialists (
  id                 uuid primary key default uuid_generate_v4(),
  name               text not null,
  title              text not null,
  bio                text,
  photo_url          text,
  instagram_url      text,
  wellhub_url        text,
  google_reviews_url text,
  display_order      integer not null default 0,
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.specialists enable row level security;

create policy "Public read specialists"
  on public.specialists for select using (true);

create policy "Admins manage specialists"
  on public.specialists for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- SERVICES
-- ============================================================
create table if not exists public.services (
  id               uuid primary key default uuid_generate_v4(),
  specialist_id    uuid not null references public.specialists(id) on delete cascade,
  name             text not null,
  description      text,
  duration_minutes integer,
  price_eur        numeric(8,2),
  display_order    integer not null default 0,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Public read services"
  on public.services for select using (true);

create policy "Admins manage services"
  on public.services for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- CENTROS
-- ============================================================
create table if not exists public.centros (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  address       text not null,
  district      text,
  city          text not null default 'Madrid',
  maps_url      text,
  phone         text,
  description   text,
  photo_url     text,
  display_order integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.centros enable row level security;

create policy "Public read centros"
  on public.centros for select using (true);

create policy "Admins manage centros"
  on public.centros for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- DOMICILIO ZONES
-- ============================================================
create table if not exists public.domicilio_zones (
  id            uuid primary key default uuid_generate_v4(),
  region        text not null,
  districts     text[] not null default '{}',
  display_order integer not null default 0
);

alter table public.domicilio_zones enable row level security;

create policy "Public read zones"
  on public.domicilio_zones for select using (true);

create policy "Admins manage zones"
  on public.domicilio_zones for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  specialist_id   uuid references public.specialists(id) on delete set null,
  author_name     text not null,
  author_location text,
  rating          smallint not null default 5 check (rating between 1 and 5),
  content         text not null,
  source          text not null default 'google' check (source in ('google', 'wellhub', 'manual')),
  verified        boolean not null default false,
  display_order   integer not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Public read active reviews"
  on public.reviews for select using (active = true);

create policy "Admins manage reviews"
  on public.reviews for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- FAQS
-- ============================================================
create table if not exists public.faqs (
  id            uuid primary key default uuid_generate_v4(),
  question      text not null,
  answer        text not null,
  category      text not null default 'general',
  display_order integer not null default 0,
  active        boolean not null default true
);

alter table public.faqs enable row level security;

create policy "Public read active faqs"
  on public.faqs for select using (active = true);

create policy "Admins manage faqs"
  on public.faqs for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- SITE SETTINGS
-- ============================================================
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Public read settings"
  on public.site_settings for select using (true);

create policy "Admins manage settings"
  on public.site_settings for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- SEED DATA — Specialists
-- ============================================================
insert into public.specialists (id, name, title, bio, wellhub_url, google_reviews_url, display_order, active)
values
(
  '11111111-1111-1111-1111-111111111111',
  'Iván Leptach',
  'Osteópata',
  'Especialista en osteopatía estructural y funcional. Iván combina técnicas clásicas con terapias complementarias naturales para un tratamiento integral, abordando siempre la causa raíz de cada problema musculoesquelético.',
  'https://wellhub.com/es-es/search/partners/ivan-leptach-masaje-osteopatia-salamanca/',
  null,
  1,
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Matteo',
  'Masajista Terapéutico',
  'Masajista profesional especializado en técnicas terapéuticas y de bienestar. Integra disciplinas orientales y occidentales para una experiencia única, adaptada a cada persona.',
  null,
  'https://www.google.com/maps/place//data=!4m3!3m2!1s0xd418beaef00d16b:0x7949382245d8d14d!12e1?source=g.page.m.ia._&laa=nmx-review-solicitation-ia2',
  2,
  true
)
on conflict (id) do nothing;

-- ============================================================
-- SEED DATA — Services (Iván)
-- ============================================================
insert into public.services (specialist_id, name, display_order) values
('11111111-1111-1111-1111-111111111111', 'Osteopatía de columna y articulaciones', 1),
('11111111-1111-1111-1111-111111111111', 'Liberación de cuello y cintura escapular', 2),
('11111111-1111-1111-1111-111111111111', 'Alineación de cadera', 3),
('11111111-1111-1111-1111-111111111111', 'Desbloqueos vertebrales', 4),
('11111111-1111-1111-1111-111111111111', 'Asesoramiento postural y de movimiento', 5),
('11111111-1111-1111-1111-111111111111', 'Terapias complementarias naturales', 6),
('11111111-1111-1111-1111-111111111111', 'Ventosas', 7);

-- ============================================================
-- SEED DATA — Services (Matteo)
-- ============================================================
insert into public.services (specialist_id, name, display_order) values
('22222222-2222-2222-2222-222222222222', 'Masaje relajante', 1),
('22222222-2222-2222-2222-222222222222', 'Masaje descontracturante y deportivo', 2),
('22222222-2222-2222-2222-222222222222', 'Drenaje linfático y reflexología podal', 3),
('22222222-2222-2222-2222-222222222222', 'Masaje facial Kobido', 4),
('22222222-2222-2222-2222-222222222222', 'Vendaje neuromuscular, ventosas y Cross Tape', 5);

-- ============================================================
-- SEED DATA — Centros
-- ============================================================
insert into public.centros (name, address, district, city, maps_url, display_order) values
('ARomaMatSens',                 'Plaza de la Inmaculada, 30 – 28911 Leganés, Madrid', 'Leganés',       'Madrid', 'https://share.google/O24gJkBBIMOQuacHw',    1),
('Box Morales Salamanca',        'Calle de Hermosilla, 56 – Salamanca, 28001 Madrid',  'Salamanca',     'Madrid', 'https://share.google/1V3gCc6sdecmDKAHe',    2),
('Box Morales Alcalá',           'Calle Alcalá, 507, planta baja, puerta 1 – 28027 Madrid', 'Ciudad Lineal', 'Madrid', 'https://share.google/8EXggdz1zzLa1IcAd', 3),
('Fight Club Madrid Crosstraining', 'Calle de Mejorana, 23 – Puente de Vallecas, 28053 Madrid', 'Vallecas', 'Madrid', 'https://share.google/PO7C9ZgJiliKqoPOZ', 4),
('Belu''s Centro Estético',      'Calle de Ntra. Sra. de Guadalupe, N2 – 28911 Leganés, Madrid', 'Leganés', 'Madrid', 'https://share.google/5QTgP27vWXmWYZgYk', 5);

-- ============================================================
-- SEED DATA — Domicilio Zones
-- ============================================================
insert into public.domicilio_zones (region, districts, display_order) values
('Norte',      ARRAY['Chamartín','Tetuán','Fuencarral-El Pardo','Hortaleza','La Moraleja','Alcobendas','San Sebastián de los Reyes'], 1),
('Centro',     ARRAY['Salamanca','Chamberí','Retiro','Centro','Argüelles','Moncloa','Chamartín'], 2),
('Sur',        ARRAY['Leganés','Vallecas','Usera','Villaverde','Getafe','Fuenlabrada','Alcorcón'], 3),
('Este y Oeste', ARRAY['Hortaleza','Vicálvaro','Moratalaz','Carabanchel','Pozuelo','Majadahonda','Las Rozas'], 4);

-- ============================================================
-- SEED DATA — Reviews
-- ============================================================
insert into public.reviews (specialist_id, author_name, author_location, rating, content, source, verified, display_order) values
('11111111-1111-1111-1111-111111111111', 'María García',    'Salamanca, Madrid', 5, 'Iván es increíble. Llevo meses con dolor de espalda y tras tres sesiones me siento como nueva. Su forma de trabajar es muy profesional y detallada. Totalmente recomendable.', 'wellhub', true, 1),
('11111111-1111-1111-1111-111111111111', 'Carlos Fernández', 'Chamberí, Madrid', 5, 'Acudí a Iván con una contractura cervical muy fuerte y en dos sesiones ya estaba perfecto. Conoce muy bien el cuerpo humano y sabe exactamente dónde tocar. Excelente profesional.', 'wellhub', true, 2),
('11111111-1111-1111-1111-111111111111', 'Patricia Solana',  'Retiro, Madrid',   5, 'Llevo años buscando un buen osteópata y por fin lo encontré. Iván tiene una capacidad de diagnóstico impresionante. La contractura desapareció en una sola sesión.', 'wellhub', true, 3),
('22222222-2222-2222-2222-222222222222', 'Laura Martínez',  'Leganés, Madrid',  5, 'El masaje con Matteo fue simplemente espectacular. El Kobido facial me dejó con una piel increíble y una sensación de bienestar total. Volveré sin duda.', 'google', true, 4),
('22222222-2222-2222-2222-222222222222', 'Sergio López',    'Vallecas, Madrid', 5, 'Matteo tiene manos mágicas. El masaje deportivo después de mis entrenos me ha cambiado la vida. Muy recomendable para deportistas que necesitan recuperación muscular.', 'google', true, 5),
(null, 'Ana Rodríguez',  'Pozuelo, Madrid',    5, 'Servicio a domicilio impecable. Puntualidad absoluta y una calidad de tratamiento que no esperaba. El equipo de MiSalud es de los mejores de Madrid.', 'google', true, 6),
(null, 'Javier Ruiz',    'Alcobendas, Madrid', 5, 'Muy agradecido con todo el equipo. Tuve una lesión de hombro y gracias al tratamiento he recuperado la movilidad completamente. Profesionalidad y cercanía a partes iguales.', 'google', true, 7);

-- ============================================================
-- SEED DATA — FAQs
-- ============================================================
insert into public.faqs (question, answer, category, display_order) values
('¿Ofrecéis servicio a domicilio?', 'Sí, realizamos sesiones en tu domicilio en las principales zonas de Madrid y municipios cercanos: Norte, Centro, Sur, Este y Oeste. Cubrimos desde Alcobendas y San Sebastián de los Reyes hasta Leganés, Getafe o Las Rozas.', 'servicio', 1),
('¿Cómo reservo una cita?', 'Puedes reservar a través de Wellhub para sesiones con Iván, o mediante Google Maps para sesiones con Matteo. También puedes contactarnos por WhatsApp o email.', 'reservas', 2),
('¿Cuántas sesiones necesito?', 'Para dolores agudos suelen ser suficientes 2-3 sesiones. Para procesos crónicos recomendamos sesiones periódicas. En la primera visita evaluamos tu caso y hacemos una propuesta personalizada.', 'tratamiento', 3),
('¿Qué diferencia hay entre osteopatía y masaje?', 'La osteopatía trabaja sobre el sistema musculoesquelético buscando restaurar movilidad y función. El masaje actúa sobre tejidos blandos para aliviar tensión y mejorar la circulación. En muchos casos son complementarios.', 'tratamiento', 4),
('¿Aceptáis Wellhub / Gympass?', 'Sí, Iván Leptach está dado de alta en Wellhub. Puedes reservar sesiones de osteopatía directamente desde la app.', 'pagos', 5),
('¿Cuánto dura cada sesión?', 'Las sesiones duran entre 45 y 60 minutos. Los masajes pueden ser de 30 a 90 minutos según tu preferencia. Las sesiones de osteopatía incluyen evaluación inicial y pueden alargarse en la primera visita.', 'tratamiento', 6);

-- ============================================================
-- SEED DATA — Site Settings
-- ============================================================
insert into public.site_settings (key, value) values
('general', '{
  "site_name": "MiSalud",
  "tagline": "Salud que viene a ti",
  "description": "Osteopatía, masajes y terapias de bienestar en Madrid. Servicio en centros asociados y a domicilio.",
  "phone": "+34 600 000 000",
  "email": "hola@misalud.es",
  "instagram": "https://instagram.com/misalud.es"
}'),
('hero', '{
  "heading": "Tu salud,\nen tus manos",
  "subheading": "Osteopatía y masajes terapéuticos en Madrid. En centro o a domicilio.",
  "cta_primary": "Reservar cita",
  "cta_secondary": "Conoce al equipo"
}'),
('contact', '{
  "whatsapp": "https://wa.me/34600000000",
  "email": "hola@misalud.es",
  "address": "Madrid y área metropolitana"
}')
on conflict (key) do nothing;

-- ============================================================
-- HELPER: promote a user to admin (run manually after first login)
-- Usage: select promote_to_admin('user@email.com');
-- ============================================================
create or replace function public.promote_to_admin(target_email text)
returns text language plpgsql security definer as $$
declare
  uid uuid;
begin
  select id into uid from public.profiles where email = target_email limit 1;
  if uid is null then
    return 'User not found: ' || target_email;
  end if;
  update public.profiles set role = 'admin' where id = uid;
  return 'Promoted to admin: ' || target_email;
end;
$$;
