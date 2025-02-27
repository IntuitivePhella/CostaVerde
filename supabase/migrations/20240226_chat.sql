-- Tabela de mensagens
create table public.mensagens (
  id uuid default gen_random_uuid() primary key,
  reserva_id uuid references public.reservas(id) on delete cascade not null,
  remetente_id uuid references auth.users(id) on delete cascade not null,
  destinatario_id uuid references auth.users(id) on delete cascade not null,
  conteudo text not null,
  tipo text not null check (tipo in ('texto', 'imagem')),
  status text not null check (status in ('enviada', 'entregue', 'lida')),
  data_envio timestamp with time zone default timezone('utc'::text, now()) not null,
  data_entrega timestamp with time zone,
  data_leitura timestamp with time zone,
  arquivo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de participantes do chat
create table public.chat_participantes (
  id uuid default gen_random_uuid() primary key,
  reserva_id uuid references public.reservas(id) on delete cascade not null,
  usuario_id uuid references auth.users(id) on delete cascade not null,
  online boolean default false not null,
  ultima_vez_online timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(reserva_id, usuario_id)
);

-- Índices para melhor performance
create index mensagens_reserva_id_idx on public.mensagens(reserva_id);
create index mensagens_remetente_id_idx on public.mensagens(remetente_id);
create index mensagens_destinatario_id_idx on public.mensagens(destinatario_id);
create index chat_participantes_reserva_id_idx on public.chat_participantes(reserva_id);
create index chat_participantes_usuario_id_idx on public.chat_participantes(usuario_id);

-- Políticas de segurança RLS
alter table public.mensagens enable row level security;
alter table public.chat_participantes enable row level security;

-- Política para mensagens
create policy "Usuários podem ver mensagens das suas reservas"
  on public.mensagens for select
  using (
    auth.uid() in (
      select usuario_id from reservas where id = reserva_id
      union
      select proprietario_id from barcos where id = (
        select barco_id from reservas where id = reserva_id
      )
    )
  );

create policy "Usuários podem enviar mensagens nas suas reservas"
  on public.mensagens for insert
  with check (
    auth.uid() in (
      select usuario_id from reservas where id = reserva_id
      union
      select proprietario_id from barcos where id = (
        select barco_id from reservas where id = reserva_id
      )
    )
  );

create policy "Usuários podem atualizar status das mensagens recebidas"
  on public.mensagens for update
  using (auth.uid() = destinatario_id)
  with check (
    old.destinatario_id = auth.uid() and
    new.id = old.id and
    new.reserva_id = old.reserva_id and
    new.remetente_id = old.remetente_id and
    new.destinatario_id = old.destinatario_id and
    new.conteudo = old.conteudo and
    new.tipo = old.tipo and
    new.arquivo_url = old.arquivo_url
  );

-- Política para participantes do chat
create policy "Usuários podem ver participantes das suas reservas"
  on public.chat_participantes for select
  using (
    auth.uid() in (
      select usuario_id from reservas where id = reserva_id
      union
      select proprietario_id from barcos where id = (
        select barco_id from reservas where id = reserva_id
      )
    )
  );

create policy "Usuários podem atualizar seu próprio status"
  on public.chat_participantes for update
  using (auth.uid() = usuario_id)
  with check (
    old.usuario_id = auth.uid() and
    new.id = old.id and
    new.reserva_id = old.reserva_id and
    new.usuario_id = old.usuario_id
  );

-- Função para atualizar o status online
create or replace function public.update_user_online_status()
returns trigger as $$
begin
  update public.chat_participantes
  set online = true,
      ultima_vez_online = now()
  where usuario_id = auth.uid();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para atualizar status online
create trigger on_presence_change
  after insert or update
  on public.chat_participantes
  for each row
  execute function public.update_user_online_status(); 