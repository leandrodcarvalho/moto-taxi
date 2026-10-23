import "server-only";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Papel, Perfil } from "@/lib/tipos";

export const PAGINA_INICIAL: Record<Papel, string> = {
  cliente: "/solicitar",
  admin: "/admin",
  motorista: "/motorista",
};

/** Garante que há alguém logado com o papel esperado; senão redireciona. */
export async function exigirPapel(papel: Papel): Promise<Perfil> {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, empresa_id, papel, nome_completo, telefone, email")
    .eq("id", user.id)
    .single<Perfil>();

  if (!perfil) redirect("/entrar");
  if (perfil.papel !== papel) redirect(PAGINA_INICIAL[perfil.papel]);
  return perfil;
}
