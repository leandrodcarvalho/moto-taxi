# Moto Táxi Millênio

Sistema web para pedir e gerenciar corridas de moto-táxi em Avaré/SP.
Primeiro cliente: **Moto Táxi Millênio**. A base já é multi-empresa para atender outros moto-táxis no futuro.

## Stack

- **Next.js 15 + TypeScript + Tailwind CSS** (front e back no mesmo projeto)
- **Supabase**: PostgreSQL, autenticação (senha + código por WhatsApp ou e-mail) e tempo real
- **Google Maps Routes API**: distância real para calcular o valor previsto
- Hospedagem sugerida: **Vercel** (app) + **Supabase** (banco)

## Perfis

| Perfil | Tela | O que faz |
|---|---|---|
| Cliente | `/solicitar` | Cadastra-se, pede corrida, acompanha em tempo real, avalia o motorista |
| Administrador | `/admin` | Vê todas as corridas, direciona para motoristas, cadastra motoristas |
| Motorista | `/motorista` | Recebe corridas, vê dados e nota do cliente, inicia e finaliza, avalia o cliente |

Status da corrida: `solicitada` → `atribuida` → `em_andamento` → `concluida` (ou `cancelada`).

## Estrutura

```
supabase/
  migrations/0001_inicial.sql   tabelas, regras de acesso (RLS), funções e tempo real
  seed.sql                      empresa Moto Táxi Millênio e tarifas iniciais
src/
  app/                          páginas e rotas de API
  components/                   marca, estrelas, status, trajeto
  hooks/useTempoReal.ts         assinatura de mudanças nas corridas
  lib/                          Supabase, preço, mapas, perfis
```

## Como rodar

1. Crie um projeto no [Supabase](https://supabase.com) e rode `supabase/migrations/0001_inicial.sql` e depois `supabase/seed.sql` no SQL Editor.
2. Em **Authentication > Providers**:
   - **Email**: ative "Confirm email" e, em **Email Templates > Confirm signup**, use `{{ .Token }}` para enviar o código de 6 dígitos.
   - **Phone**: ative com o provedor **Twilio** (ou Twilio Verify) e habilite o canal WhatsApp.
3. Crie uma chave no Google Cloud com a **Routes API** ativada.
4. Copie `.env.example` para `.env.local` e preencha.
5. `npm install` e `npm run dev`.
6. Cadastre-se pelo site e torne-se administrador no SQL Editor:
   `update perfis set papel = 'admin' where email = 'seu@email.com';`
   Os motoristas são cadastrados pelo administrador na tela `/admin`.

## Tarifa

`valor = max(tarifa_minima, tarifa_base + km × tarifa_km)`, configurável por empresa na tabela `empresas`.
O valor é sempre recalculado no servidor ao criar a corrida.

## Segurança

- Todas as tabelas usam RLS e são isoladas por `empresa_id`.
- O cadastro público sempre cria perfil de **cliente**; só o servidor promove para motorista ou administrador.
- Mudanças de status passam por funções no banco que validam quem pode fazer cada transição.
