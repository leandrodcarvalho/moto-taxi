"use client";

import { useCallback, useEffect, useState } from "react";
import { Avaliacao } from "@/components/Avaliacao";
import { MediaNota } from "@/components/Estrelas";
import { StatusCorridaSelo } from "@/components/StatusCorrida";
import { Trajeto } from "@/components/Trajeto";
import { useTempoRealCorridas } from "@/hooks/useTempoReal";
import { criarClienteNavegador } from "@/lib/supabase/client";
import type { Corrida } from "@/lib/tipos";

type Cliente = { nome_completo: string; telefone: string | null; rua: string | null; numero: string | null; bairro: string | null };
type CorridaMotorista = Corrida & { cliente: Cliente | null; mediaCliente: number | null; avaliada: boolean };

export function PainelMotorista({ motoristaId }: { motoristaId: string }) {
  const supabase = criarClienteNavegador();
  const [corridas, setCorridas] = useState<CorridaMotorista[]>([]);

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("corridas")
      .select("*, cliente:perfis!corridas_cliente_id_fkey(nome_completo, telefone, rua, numero, bairro)")
      .eq("motorista_id", motoristaId)
      .in("status", ["atribuida", "em_andamento", "concluida"])
      .order("solicitada_em", { ascending: false })
      .limit(20);

    const { data: feitas } = await supabase
      .from("avaliacoes").select("corrida_id").eq("avaliador_id", motoristaId);
    const avaliadas = new Set((feitas ?? []).map((a) => a.corrida_id));

    const lista = (data ?? []) as (Corrida & { cliente: Cliente | null })[];
    const comMedia = await Promise.all(
      lista
        .filter((c) => c.status !== "concluida" || !avaliadas.has(c.id))
        .map(async (c) => {
          const { data: media } = await supabase.rpc("media_avaliacao", { p_perfil: c.cliente_id });
          return { ...c, mediaCliente: media, avaliada: avaliadas.has(c.id) };
        }),
    );
    setCorridas(comMedia);
  }, [supabase, motoristaId]);

  useEffect(() => { carregar(); }, [carregar]);
  useTempoRealCorridas(`motorista-${motoristaId}`, `motorista_id=eq.${motoristaId}`, carregar);

  async function acao(fn: "iniciar_corrida" | "finalizar_corrida", id: string) {
    const { error } = await supabase.rpc(fn, { p_corrida: id });
    if (error) alert(error.message);
    carregar();
  }

  return (
    <div className="space-y-4">
      <h1 className="titulo-marca text-3xl text-verde">Minhas corridas</h1>
      {corridas.length === 0 && (
        <p className="cartao text-center text-gray-600">Nenhuma corrida no momento. Aguarde o administrador.</p>
      )}

      {corridas.map((c) => (
        <article key={c.id} className="cartao space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">{c.cliente?.nome_completo}</p>
            <StatusCorridaSelo status={c.status} />
          </div>
          <MediaNota media={c.mediaCliente} />
          {c.cliente?.telefone && (
            <a href={`https://wa.me/${c.cliente.telefone.replace(/\D/g, "")}`} className="block text-sm font-bold text-verde underline">
              {c.cliente.telefone} (WhatsApp)
            </a>
          )}
          <Trajeto corrida={c} />

          {c.status === "atribuida" && (
            <button className="botao-destaque w-full" onClick={() => acao("iniciar_corrida", c.id)}>
              Iniciar atendimento
            </button>
          )}
          {c.status === "em_andamento" && (
            <button className="botao w-full" onClick={() => acao("finalizar_corrida", c.id)}>
              Finalizar atendimento
            </button>
          )}
          {c.status === "concluida" && !c.avaliada && (
            <Avaliacao corridaId={c.id} titulo="Avalie o cliente" aoAvaliar={carregar} />
          )}
        </article>
      ))}
    </div>
  );
}
