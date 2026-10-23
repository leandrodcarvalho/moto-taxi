import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { estimarCorrida } from "@/lib/estimativa";

/** Cria a corrida recalculando o valor no servidor (o cliente não define o preço). */
export async function POST(request: Request) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { origem, destino } = await request.json();
  const { data: perfil } = await supabase
    .from("perfis").select("empresa_id, papel").eq("id", user.id).single();
  if (perfil?.papel !== "cliente") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const { count } = await supabase
    .from("corridas")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", user.id)
    .in("status", ["solicitada", "atribuida", "em_andamento"]);
  if (count) return NextResponse.json({ erro: "Você já tem uma corrida ativa" }, { status: 409 });

  try {
    const est = await estimarCorrida(supabase, perfil.empresa_id, origem ?? "", destino ?? "");
    const { data, error } = await supabase
      .from("corridas")
      .insert({
        empresa_id: perfil.empresa_id,
        cliente_id: user.id,
        origem_endereco: est.origem,
        destino_endereco: est.destino,
        distancia_km: est.distanciaKm,
        duracao_min: est.duracaoMin,
        valor_estimado: est.valor,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 422 });
  }
}
