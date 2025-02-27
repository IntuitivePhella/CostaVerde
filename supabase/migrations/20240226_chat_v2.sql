-- Tabela de mensagens do chat
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  type text not null check (type in ('text', 'image')),
  status text not null check (status in ('sent', 'delivered', 'read')),
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de participantes do chat
create table public.chat_participants (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  is_online boolean default false not null,
  last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(booking_id, user_id)
);

-- Índices para melhor performance
create index chat_messages_booking_id_idx on public.chat_messages(booking_id);
create index chat_messages_sender_id_idx on public.chat_messages(sender_id);
create index chat_messages_receiver_id_idx on public.chat_messages(receiver_id);
create index chat_participants_booking_id_idx on public.chat_participants(booking_id);
create index chat_participants_user_id_idx on public.chat_participants(user_id);

-- Políticas de segurança RLS
alter table public.chat_messages enable row level security;
alter table public.chat_participants enable row level security;

-- Política para mensagens
create policy "Usuários podem ver mensagens das suas reservas"
  on public.chat_messages for select
  using (
    auth.uid() in (
      select renter_id from bookings where id = booking_id
      union
      select owner_id from boats where id = (
        select boat_id from bookings where id = booking_id
      )
    )
  );

create policy "Usuários podem enviar mensagens nas suas reservas"
  on public.chat_messages for insert
  with check (
    auth.uid() in (
      select renter_id from bookings where id = booking_id
      union
      select owner_id from boats where id = (
        select boat_id from bookings where id = booking_id
      )
    )
  );

create policy "Usuários podem atualizar status das mensagens recebidas"
  on public.chat_messages for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- Política para participantes do chat
create policy "Usuários podem ver participantes das suas reservas"
  on public.chat_participants for select
  using (
    auth.uid() in (
      select renter_id from bookings where id = booking_id
      union
      select owner_id from boats where id = (
        select boat_id from bookings where id = booking_id
      )
    )
  );

create policy "Usuários podem atualizar seu próprio status"
  on public.chat_participants for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Função para atualizar o status online
create or replace function public.update_user_online_status()
returns trigger as $$
begin
  update public.chat_participants
  set is_online = true,
      last_seen_at = now()
  where user_id = auth.uid();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para atualizar status online
create trigger on_presence_change
  after insert or update
  on public.chat_participants
  for each row
  execute function public.update_user_online_status(); 