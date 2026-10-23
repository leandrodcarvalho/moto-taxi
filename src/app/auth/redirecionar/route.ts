import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { PAGINA_INICIAL } from "@/lib/perfil";
import type { Papel } from "@/lib/tipos";

/** Após o login, leva cada perfil para a sua tela. */
export async function GET(request: NextRequest) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/entrar", request.url));

  const { data } = await supabase.from("perfis").select("papel").eq("id", user.id).single();
  const papel = (data?.papel ?? "cliente") as Papel;
  return NextResponse.redirect(new URL(PAGINA_INICIAL[papel], request.url));
}
