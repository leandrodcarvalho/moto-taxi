import { NextResponse } from "next/server";
import { criarClienteAdmin, criarClienteServidor } from "@/lib/supabase/server";
import { normalizarCelular, celularValido } from "@/lib/contato";

/** Cadastro de motorista feito pelo administrador. */
export async function POST(request: Request) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { data: admin } = await supabase
    .from("perfis").select("empresa_id, papel").eq("id", user.id).single();
  if (admin?.papel !== "admin") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const b = await request.json();
  const obrigatorios = ["nome", "telefone", "senha", "marca", "modelo", "cor", "placa"];
  if (obrigatorios.some((k) => !String(b[k] ?? "").trim())) {
    return NextResponse.json({ erro: "Preencha todos os campos" }, { status: 400 });
  }
  if (!celularValido(b.telefone)) {
    return NextResponse.json({ erro: "Telefone inválido" }, { status: 400 });
  }

  const service = criarClienteAdmin();
  const { data: empresa } = await service
    .from("empresas").select("slug").eq("id", admin.empresa_id).single();

  // O gatilho cria o perfil como 'cliente'; em seguida promovemos para motorista.
  const { data: criado, error } = await service.auth.admin.createUser({
    phone: normalizarCelular(b.telefone),
    password: b.senha,
    phone_confirm: true,
    user_metadata: { empresa: empresa?.slug, nome_completo: b.nome.trim() },
  });
  if (error || !criado.user) {
    return NextResponse.json({ erro: error?.message ?? "Falha ao criar usuário" }, { status: 422 });
  }

  const id = criado.user.id;
  const { error: erroPerfil } = await service.from("perfis").update({ papel: "motorista" }).eq("id", id);
  const { error: erroMoto } = await service.from("motoristas").insert({
    perfil_id: id,
    empresa_id: admin.empresa_id,
    marca: b.marca.trim(),
    modelo: b.modelo.trim(),
    cor: b.cor.trim(),
    placa: b.placa.trim().toUpperCase(),
  });

  if (erroPerfil || erroMoto) {
    await service.auth.admin.deleteUser(id);
    return NextResponse.json({ erro: (erroPerfil ?? erroMoto)!.message }, { status: 422 });
  }
  return NextResponse.json({ id }, { status: 201 });
}
