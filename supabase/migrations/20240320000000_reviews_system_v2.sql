-- Criar tipos enums
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.user_role as enum ('user', 'owner', 'admin');

-- Adicionar coluna role na tabela profiles
alter table public.profiles
add column if not exists role user_role default 'user'::user_role;

-- Backup dos dados existentes
create temp table reviews_backup as
select * from public.reviews;

-- Dropar a tabela existente
drop table if exists public.reviews cascade;

-- Recriar a tabela reviews com a nova estrutura
create table public.reviews (
    id uuid default uuid_generate_v4() primary key,
    boat_id uuid references public.boats(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    booking_id uuid references public.bookings(id) on delete set null not null,
    rating decimal(2,1) not null check (rating >= 0 and rating <= 5),
    cleanliness_rating integer check (cleanliness_rating >= 1 and cleanliness_rating <= 5),
    communication_rating integer check (communication_rating >= 1 and communication_rating <= 5),
    accuracy_rating integer check (accuracy_rating >= 1 and accuracy_rating <= 5),
    value_rating integer check (value_rating >= 1 and value_rating <= 5),
    comment text,
    status review_status default 'pending'::review_status,
    rejection_reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Restaurar os dados
insert into public.reviews (
    id, boat_id, user_id, booking_id, rating, 
    created_at, updated_at
)
select 
    id, boat_id, reviewer_id, booking_id, rating::decimal(2,1),
    created_at, created_at
from reviews_backup;

-- Dropar a tabela temporária
drop table reviews_backup;

-- Criar tabela de mídias das avaliações
create table if not exists public.review_media (
    id uuid default uuid_generate_v4() primary key,
    review_id uuid references public.reviews(id) on delete cascade not null,
    url text not null,
    type text check (type in ('image', 'video')),
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Configurar armazenamento para mídias
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('review-videos', 'review-videos', true)
on conflict (id) do nothing;

-- Criar função para atualizar média das avaliações
create or replace function update_boat_ratings()
returns trigger as $$
begin
    update public.boats
    set rating = (
        select avg(rating)
        from public.reviews
        where boat_id = new.boat_id
        and status = 'approved'
    )
    where id = new.boat_id;
    return new;
end;
$$ language plpgsql;

-- Criar função para atualizar timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Criar os triggers
create trigger update_boat_ratings_trigger
after insert or update of status on public.reviews
for each row
execute function update_boat_ratings();

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
        and renter_id = auth.uid()
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