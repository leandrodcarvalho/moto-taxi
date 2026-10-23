import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { estimarCorrida } from "@/lib/estimativa";

export async function POST(request: Request) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { origem, destino } = await request.json();
  if (!origem?.trim() || !destino?.trim()) {
    return NextResponse.json({ erro: "Informe origem e destino" }, { status: 400 });
  }

  const { data: perfil } = await supabase.from("perfis").select("empresa_id").eq("id", user.id).single();
  if (!perfil) return NextResponse.json({ erro: "Perfil não encontrado" }, { status: 403 });

  try {
    return NextResponse.json(await estimarCorrida(supabase, perfil.empresa_id, origem, destino));
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 422 });
  }
}
