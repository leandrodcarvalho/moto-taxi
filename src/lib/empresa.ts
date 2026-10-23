// Enquanto houver uma só empresa, o slug vem do ambiente.
// Na fase multi-empresa ele passa a vir do domínio/subdomínio.
export const EMPRESA_SLUG = process.env.NEXT_PUBLIC_EMPRESA_SLUG ?? "millenio";
export const EMPRESA_NOME = "Moto Táxi Millênio";
export const CIDADE_PADRAO = "Avaré";
export const UF_PADRAO = "SP";
