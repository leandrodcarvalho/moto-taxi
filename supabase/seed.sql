-- Primeira empresa cliente
insert into empresas (slug, nome, cidade_padrao, uf_padrao, tarifa_base, tarifa_km, tarifa_minima)
values ('millenio', 'Moto Táxi Millênio', 'Avaré', 'SP', 5.00, 2.00, 8.00)
on conflict (slug) do nothing;

-- Para tornar alguém administrador (após o cadastro dessa pessoa):
-- update perfis set papel = 'admin' where email = 'admin@exemplo.com';
