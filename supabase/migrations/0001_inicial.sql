-- Moto Táxi: estrutura inicial (multi-empresa)
-- Toda tabela de negócio carrega empresa_id e é isolada por RLS.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type papel_usuario as enum ('cliente', 'admin', 'motorista');
create type status_corrida as enum ('solicitada', 'atribuida', 'em_andamento', 'concluida', 'cancelada');

-- ---------------------------------------------------------------------------
-- Empresas (cada moto-táxi cliente do sistema)
-- ---------------------------------------------------------------------------
create table empresas (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  nome            text not null,
  cidade_padrao   text not null,
  uf_padrao       char(2) not null,
  tarifa_base     numeric(10,2) not null default 5.00,   -- bandeirada (R$)
  tarifa_km       numeric(10,2) not null default 2.00,   -- R$ por km
  tarifa_minima   numeric(10,2) not null default 8.00,   -- valor mínimo da corrida
  cor_primaria    text not null default '#0B5D1E',
  cor_destaque    text not null default '#8EE000',
  criado_em       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table perfis (
  id               uuid primary key references auth.users(id) on delete cascade,
  empresa_id       uuid not null references empresas(id),
  papel            papel_usuario not null default 'cliente',
  nome_completo    text not null,
  telefone         text,
  email            text,
  data_nascimento  date,
  rua              text,
  numero           text,
  bairro           text,
  cidade           text,
  uf               char(2),
  criado_em        timestamptz not null default now()
);
create index perfis_empresa_papel_idx on perfis (empresa_id, papel);

-- ---------------------------------------------------------------------------
-- Motoristas (dados do veículo)
-- ---------------------------------------------------------------------------
create table motoristas (
  perfil_id   uuid primary key references perfis(id) on delete cascade,
  empresa_id  uuid not null references empresas(id),
  marca       text not null,
  modelo      text not null,
  cor         text not null,
  placa       text not null,
  ativo       boolean not null default true,
  unique (empresa_id, placa)
);

-- ---------------------------------------------------------------------------
-- Corridas
-- ---------------------------------------------------------------------------
create table corridas (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references empresas(id),
  cliente_id        uuid not null references perfis(id),
  motorista_id      uuid references perfis(id),
  origem_endereco   text not null,
  destino_endereco  text not null,
  distancia_km      numeric(8,2) not null,
  duracao_min       integer,
  valor_estimado    numeric(10,2) not null,
  status            status_corrida not null default 'solicitada',
  solicitada_em     timestamptz not null default now(),
  atribuida_em      timestamptz,
  iniciada_em       timestamptz,
  concluida_em      timestamptz
);
create index corridas_empresa_status_idx on corridas (empresa_id, status);
create index corridas_cliente_idx on corridas (cliente_id);
create index corridas_motorista_idx on corridas (motorista_id);

-- ---------------------------------------------------------------------------
-- Avaliações (1 a 5 estrelas, cliente -> motorista e motorista -> cliente)
-- ---------------------------------------------------------------------------
create table avaliacoes (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresas(id),
  corrida_id    uuid not null references corridas(id) on delete cascade,
  avaliador_id  uuid not null references perfis(id),
  avaliado_id   uuid not null references perfis(id),
  nota          smallint not null check (nota between 1 and 5),
  comentario    text,
  criado_em     timestamptz not null default now(),
  unique (corrida_id, avaliador_id)
);
create index avaliacoes_avaliado_idx on avaliacoes (avaliado_id);

-- ---------------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------------
create or replace function minha_empresa() returns uuid
language sql stable security definer set search_path = public as $$
  select empresa_id from perfis where id = auth.uid()
$$;

create or replace function meu_papel() returns papel_usuario
language sql stable security definer set search_path = public as $$
  select papel from perfis where id = auth.uid()
$$;

create or replace function media_avaliacao(p_perfil uuid) returns numeric
language sql stable security definer set search_path = public as $$
  select round(avg(nota)::numeric, 1) from avaliacoes
  where avaliado_id = p_perfil and empresa_id = minha_empresa()
$$;

-- Cria o perfil de cliente quando alguém se cadastra.
-- O papel é sempre 'cliente': admin e motorista são definidos pelo servidor.
create or replace function criar_perfil_cliente() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_empresa uuid;
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  select id into v_empresa from empresas
  where slug = coalesce(v_meta->>'empresa', 'millenio');

  if v_empresa is null then
    raise exception 'Empresa não encontrada';
  end if;

  insert into perfis (id, empresa_id, papel, nome_completo, telefone, email,
                      data_nascimento, rua, numero, bairro, cidade, uf)
  values (
    new.id, v_empresa, 'cliente',
    coalesce(v_meta->>'nome_completo', ''),
    new.phone, new.email,
    nullif(v_meta->>'data_nascimento', '')::date,
    v_meta->>'rua', v_meta->>'numero', v_meta->>'bairro',
    v_meta->>'cidade', v_meta->>'uf'
  );
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function criar_perfil_cliente();

-- ---------------------------------------------------------------------------
-- Ações sobre corridas (regras de transição de status ficam no banco)
-- ---------------------------------------------------------------------------
create or replace function atribuir_corrida(p_corrida uuid, p_motorista uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if meu_papel() <> 'admin' then raise exception 'Apenas o administrador'; end if;
  if not exists (select 1 from motoristas
                 where perfil_id = p_motorista and empresa_id = minha_empresa() and ativo) then
    raise exception 'Motorista inválido';
  end if;
  update corridas set motorista_id = p_motorista, status = 'atribuida', atribuida_em = now()
  where id = p_corrida and empresa_id = minha_empresa()
    and status in ('solicitada', 'atribuida');
  if not found then raise exception 'Corrida não pode ser atribuída'; end if;
end;
$$;

create or replace function iniciar_corrida(p_corrida uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update corridas set status = 'em_andamento', iniciada_em = now()
  where id = p_corrida and motorista_id = auth.uid() and status = 'atribuida';
  if not found then raise exception 'Corrida não pode ser iniciada'; end if;
end;
$$;

create or replace function finalizar_corrida(p_corrida uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update corridas set status = 'concluida', concluida_em = now()
  where id = p_corrida and motorista_id = auth.uid() and status = 'em_andamento';
  if not found then raise exception 'Corrida não pode ser finalizada'; end if;
end;
$$;

create or replace function cancelar_corrida(p_corrida uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update corridas set status = 'cancelada'
  where id = p_corrida and empresa_id = minha_empresa()
    and status in ('solicitada', 'atribuida')
    and (cliente_id = auth.uid() or meu_papel() = 'admin');
  if not found then raise exception 'Corrida não pode ser cancelada'; end if;
end;
$$;

create or replace function avaliar_corrida(p_corrida uuid, p_nota smallint, p_comentario text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  c corridas%rowtype;
  v_avaliado uuid;
begin
  select * into c from corridas where id = p_corrida and status = 'concluida';
  if not found then raise exception 'Corrida não concluída'; end if;

  if auth.uid() = c.cliente_id then v_avaliado := c.motorista_id;
  elsif auth.uid() = c.motorista_id then v_avaliado := c.cliente_id;
  else raise exception 'Sem permissão para avaliar';
  end if;

  insert into avaliacoes (empresa_id, corrida_id, avaliador_id, avaliado_id, nota, comentario)
  values (c.empresa_id, c.id, auth.uid(), v_avaliado, p_nota, p_comentario);
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table empresas   enable row level security;
alter table perfis     enable row level security;
alter table motoristas enable row level security;
alter table corridas   enable row level security;
alter table avaliacoes enable row level security;

-- Empresas: dados públicos de marca e tarifa (necessários antes do login).
create policy empresas_leitura on empresas for select using (true);

-- Perfis
create policy perfis_proprio on perfis for select using (id = auth.uid());
create policy perfis_admin on perfis for select
  using (empresa_id = minha_empresa() and meu_papel() = 'admin');
create policy perfis_da_corrida on perfis for select using (
  exists (select 1 from corridas c
          where (c.cliente_id = auth.uid() and c.motorista_id = perfis.id)
             or (c.motorista_id = auth.uid() and c.cliente_id = perfis.id))
);
create policy perfis_atualiza_proprio on perfis for update
  using (id = auth.uid())
  with check (id = auth.uid() and papel = meu_papel() and empresa_id = minha_empresa());

-- Motoristas
create policy motoristas_leitura on motoristas for select using (
  empresa_id = minha_empresa() and (
    meu_papel() = 'admin' or perfil_id = auth.uid()
    or exists (select 1 from corridas c
               where c.motorista_id = motoristas.perfil_id and c.cliente_id = auth.uid())
  )
);

-- Corridas
create policy corridas_leitura on corridas for select using (
  empresa_id = minha_empresa() and (
    meu_papel() = 'admin' or cliente_id = auth.uid() or motorista_id = auth.uid()
  )
);
create policy corridas_cliente_cria on corridas for insert with check (
  cliente_id = auth.uid() and empresa_id = minha_empresa()
  and meu_papel() = 'cliente' and status = 'solicitada' and motorista_id is null
);

-- Avaliações: cada um vê as que fez e as que recebeu; admin vê todas.
create policy avaliacoes_leitura on avaliacoes for select using (
  empresa_id = minha_empresa() and (
    meu_papel() = 'admin' or avaliador_id = auth.uid() or avaliado_id = auth.uid()
  )
);

-- Funções só para usuários logados
revoke execute on function atribuir_corrida, iniciar_corrida, finalizar_corrida,
  cancelar_corrida, avaliar_corrida, media_avaliacao from public, anon;
grant execute on function atribuir_corrida, iniciar_corrida, finalizar_corrida,
  cancelar_corrida, avaliar_corrida, media_avaliacao to authenticated;

-- ---------------------------------------------------------------------------
-- Tempo real: mudanças em corridas chegam às telas abertas
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table corridas;
