-- Criar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Configurar armazenamento para mídias
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true);

insert into storage.buckets (id, name, public)
values ('review-videos', 'review-videos', true);

-- Criar tipos enums
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.user_role as enum ('user', 'owner', 'admin');
create type public.user_status as enum ('active', 'inactive', 'suspended');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.boat_status as enum ('available', 'maintenance', 'rented');
create type public.boat_type as enum ('yacht', 'speedboat', 'sailboat', 'catamaran');
create type public.reservation_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type public.payment_status as enum ('pending', 'paid', 'refunded');

-- Atualizar tabela de perfis
alter table public.profiles
add column if not exists role user_role default 'user'::user_role;

-- Criar tabela de perfis
create table public.profiles (
  id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  avatar_url text,
  email text not null,
  phone text not null,
  role user_role default 'user'::user_role not null,
  status user_status default 'active'::user_status not null,
  verification_status verification_status default 'pending'::verification_status not null,
  primary key (id)
);

-- Criar tabela de embarcações
create table public.boats (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text not null,
  daily_rate numeric not null,
  capacity integer not null,
  location text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  status boat_status default 'available'::boat_status not null,
  type boat_type not null,
  images text[] not null,
  specifications jsonb not null,
  features text[] not null,
  rating numeric default 0,
  reviews_count integer default 0
);

-- Criar tabela de reservas
create table public.reservations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  boat_id uuid references public.boats(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  total_amount numeric not null,
  status reservation_status default 'pending'::reservation_status not null,
  payment_status payment_status default 'pending'::payment_status not null,
  payment_intent_id text
);

-- Criar tabela de avaliações
create table if not exists public.reviews (
    id uuid default uuid_generate_v4() primary key,
    boat_id uuid references public.boats(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    booking_id uuid references public.bookings(id) on delete set null,
    rating decimal(2,1) not null check (rating >= 0 and rating <= 5),
    cleanliness_rating int check (cleanliness_rating >= 1 and cleanliness_rating <= 5),
    communication_rating int check (communication_rating >= 1 and communication_rating <= 5),
    accuracy_rating int check (accuracy_rating >= 1 and accuracy_rating <= 5),
    value_rating int check (value_rating >= 1 and value_rating <= 5),
    comment text,
    status review_status default 'pending'::review_status,
    rejection_reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Criar tabela de mídias das avaliações
create table if not exists public.review_media (
    id uuid default uuid_generate_v4() primary key,
    review_id uuid references public.reviews(id) on delete cascade not null,
    url text not null,
    type text check (type in ('image', 'video')),
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Criar função para atualizar média das avaliações
create or replace function update_boat_ratings()
returns trigger as $$
begin
    update public.boats
    set average_rating = (
        select avg(rating)
        from public.reviews
        where boat_id = new.boat_id
        and status = 'approved'
    )
    where id = new.boat_id;
    return new;
end;
$$ language plpgsql;

-- Criar trigger para atualizar média das avaliações
create trigger update_boat_ratings_trigger
after insert or update of status on public.reviews
for each row
execute function update_boat_ratings();

-- Criar função para atualizar timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Criar trigger para atualizar timestamp
create trigger update_reviews_updated_at
before update on public.reviews
for each row
execute function update_updated_at_column();

-- Habilitar RLS
alter table public.reviews enable row level security;
alter table public.review_media enable row level security;

-- Políticas para reviews
create policy "Reviews são visíveis para todos quando aprovadas"
on public.reviews for select
using (status = 'approved');

create policy "Admins podem ver todas as reviews"
on public.reviews for select
using (
    exists (
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'admin'
    )
);

create policy "Usuários podem ver suas próprias reviews"
on public.reviews for select
using (user_id = auth.uid());

create policy "Proprietários podem ver reviews de seus barcos"
on public.reviews for select
using (
    exists (
        select 1 from public.boats
        where id = boat_id
        and owner_id = auth.uid()
    )
);

create policy "Usuários podem criar reviews após reserva"
on public.reviews for insert
with check (
    exists (
        select 1 from public.bookings
        where id = booking_id
        and user_id = auth.uid()
        and status = 'completed'
        and not exists (
            select 1 from public.reviews
            where booking_id = bookings.id
        )
    )
);

create policy "Usuários podem editar suas próprias reviews pendentes"
on public.reviews for update
using (
    user_id = auth.uid()
    and status = 'pending'
);

create policy "Admins podem moderar reviews"
on public.reviews for update
using (
    exists (
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'admin'
    )
);

-- Políticas para review_media
create policy "Mídias são visíveis para todos"
on public.review_media for select
using (true);

create policy "Usuários podem adicionar mídia às suas reviews"
on public.review_media for insert
with check (
    exists (
        select 1 from public.reviews
        where id = review_id
        and user_id = auth.uid()
    )
);

create policy "Usuários podem remover mídia das suas reviews"
on public.review_media for delete
using (
    exists (
        select 1 from public.reviews
        where id = review_id
        and user_id = auth.uid()
        and status = 'pending'
    )
);

create policy "Admins podem remover qualquer mídia"
on public.review_media for delete
using (
    exists (
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'admin'
    )
);

-- Políticas para storage
create policy "Qualquer um pode ler mídias públicas"
on storage.objects for select
using (bucket_id in ('review-images', 'review-videos'));

create policy "Usuários autenticados podem fazer upload"
on storage.objects for insert
with check (
    auth.role() = 'authenticated'
    and bucket_id in ('review-images', 'review-videos')
);

create policy "Usuários podem deletar suas próprias mídias"
on storage.objects for delete
using (
    auth.uid() = owner
    and bucket_id in ('review-images', 'review-videos')
);

-- Índices para melhor performance
create index if not exists reviews_boat_id_idx on public.reviews(boat_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
create index if not exists reviews_booking_id_idx on public.reviews(booking_id);
create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists review_media_review_id_idx on public.review_media(review_id);

-- Habilitar RLS para todas as tabelas
alter table public.profiles enable row level security;
alter table public.boats enable row level security;
alter table public.reservations enable row level security;
alter table public.reviews enable row level security;

-- Políticas para perfis
create policy "Perfis são visíveis para todos os usuários autenticados"
on public.profiles for select
to authenticated
using (true);

create policy "Usuários podem atualizar seus próprios perfis"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Políticas para embarcações
create policy "Embarcações são visíveis para todos"
on public.boats for select
to authenticated
using (true);

create policy "Proprietários podem criar embarcações"
on public.boats for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and (role = 'owner' or role = 'admin')
  )
);

create policy "Proprietários podem atualizar suas próprias embarcações"
on public.boats for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Proprietários podem deletar suas próprias embarcações"
on public.boats for delete
to authenticated
using (owner_id = auth.uid());

-- Políticas para reservas
create policy "Usuários podem ver suas próprias reservas"
on public.reservations for select
to authenticated
using (
  user_id = auth.uid() or
  exists (
    select 1 from public.boats
    where boats.id = boat_id
    and boats.owner_id = auth.uid()
  )
);

create policy "Usuários autenticados podem criar reservas"
on public.reservations for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias reservas"
on public.reservations for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Políticas para avaliações
create policy "Avaliações são visíveis para todos"
on public.reviews for select
to authenticated
using (true);

create policy "Usuários podem criar avaliações para suas reservas"
on public.reviews for insert
to authenticated
with check (
  exists (
    select 1 from public.reservations
    where reservations.id = reservation_id
    and reservations.user_id = auth.uid()
    and reservations.status = 'completed'
  )
);

create policy "Usuários podem atualizar suas próprias avaliações"
on public.reviews for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Usuários podem deletar suas próprias avaliações"
on public.reviews for delete
to authenticated
using (user_id = auth.uid());

-- Funções auxiliares

-- Função para verificar disponibilidade de embarcação
create or replace function public.check_boat_availability(
  p_boat_id uuid,
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone
)
returns boolean
language plpgsql
security definer
as $$
begin
  return not exists (
    select 1
    from public.reservations
    where boat_id = p_boat_id
    and status != 'cancelled'
    and (
      (start_date <= p_end_date and end_date >= p_start_date)
      or (start_date >= p_start_date and start_date <= p_end_date)
      or (end_date >= p_start_date and end_date <= p_end_date)
    )
  );
end;
$$; 