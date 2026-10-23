import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calcularRota } from "@/lib/mapas";
import { calcularValor, type Tarifa } from "@/lib/preco";

export type Estimativa = {
  origem: string;
  destino: string;
  distanciaKm: number;
  duracaoMin: number;
  valor: number;
};

/** Completa o endereço com cidade/UF da empresa e calcula rota e valor. */
export async function estimarCorrida(
  supabase: SupabaseClient,
  empresaId: string,
  origem: string,
  destino: string,
): Promise<Estimativa> {
  const { data: empresa, error } = await supabase
    .from("empresas")
    .select("cidade_padrao, uf_padrao, tarifa_base, tarifa_km, tarifa_minima")
    .eq("id", empresaId)
    .single<Tarifa & { cidade_padrao: string; uf_padrao: string }>();
  if (error || !empresa) throw new Error("Empresa não encontrada");

  const sufixo = `, ${empresa.cidade_padrao} - ${empresa.uf_padrao}, Brasil`;
  const completar = (e: string) => (/avar[eé]/i.test(e) ? e : e + sufixo);

  const rota = await calcularRota(completar(origem), completar(destino));
  return {
    origem: origem.trim(),
    destino: destino.trim(),
    distanciaKm: rota.distanciaKm,
    duracaoMin: rota.duracaoMin,
    valor: calcularValor(rota.distanciaKm, empresa),
  };
}
