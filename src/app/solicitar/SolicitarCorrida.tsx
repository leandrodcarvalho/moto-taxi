"use client";

import { useCallback, useEffect, useState } from "react";
import { IlustracaoMoto } from "@/components/IlustracaoMoto";
import { Avaliacao } from "@/components/Avaliacao";
import { MediaNota } from "@/components/Estrelas";
import { Trajeto } from "@/components/Trajeto";
import { StatusCorridaSelo } from "@/components/StatusCorrida";
import { useTempoRealCorridas } from "@/hooks/useTempoReal";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { formatarReais } from "@/lib/preco";
import type { Corrida } from "@/lib/tipos";

type Estimativa = { origem: string; destino: string; distanciaKm: number; duracaoMin: number; valor: number };

type DadosMotorista = {
  nome: string;
  telefone: string | null;
  veiculo: string;
  placa: string;
  media: number | null;
};

const ATIVAS = ["solicitada", "atribuida", "em_andamento"];

export function SolicitarCorrida({ clienteId }: { clienteId: string }) {
  const supabase = criarClienteNavegador();
  const [corrida, setCorrida] = useState<Corrida | null>(null);
  const [avaliar, setAvaliar] = useState(false);
  const [motorista, setMotorista] = useState<DadosMotorista | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("corridas")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("solicitada_em", { ascending: false })
      .limit(1)
      .maybeSingle<Corrida>();

    let precisaAvaliar = false;
    if (data?.status === "concluida") {
      const { count } = await supabase
        .from("avaliacoes")
        .select("id", { count: "exact", head: true })
        .eq("corrida_id", data.id)
        .eq("avaliador_id", clienteId);
      precisaAvaliar = !count;
    }

    const mostrar = data && (ATIVAS.includes(data.status) || precisaAvaliar) ? data : null;
    setCorrida(mostrar);
    setAvaliar(precisaAvaliar);

    if (mostrar?.motorista_id) {
      const [{ data: m }, { data: media }] = await Promise.all([
        supabase
          .from("motoristas")
          .select("marca, modelo, cor, placa, perfis(nome_completo, telefone)")
          .eq("perfil_id", mostrar.motorista_id)
          .single(),
        supabase.rpc("media_avaliacao", { p_perfil: mostrar.motorista_id }),
      ]);
      const p = (m?.perfis ?? null) as unknown as { nome_completo: string; telefone: string | null } | null;
      setMotorista(
        m && p
          ? { nome: p.nome_completo, telefone: p.telefone, veiculo: `${m.marca} ${m.modelo} · ${m.cor}`, placa: m.placa, media }
          : null,
      );
    } else {
      setMotorista(null);
    }
    setCarregando(false);
  }, [supabase, clienteId]);

  useEffect(() => { carregar(); }, [carregar]);
  useTempoRealCorridas(`cliente-${clienteId}`, `cliente_id=eq.${clienteId}`, carregar);

  if (carregando) return <p className="text-center">Carregando...</p>;
  if (!corrida) return <NovaCorrida aoCriar={carregar} />;

  return (
    <div className="space-y-4">
      <div className="cartao space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="titulo-marca text-2xl text-verde">Sua corrida</h1>
          <StatusCorridaSelo status={corrida.status} />
        </div>
        <Trajeto corrida={corrida} />
      </div>

      {motorista && (
        <div className="cartao space-y-1">
          <p className="rotulo">Seu motorista</p>
          <p className="text-lg font-bold">{motorista.nome}</p>
          <MediaNota media={motorista.media} />
          <p>{motorista.veiculo}</p>
          <p className="inline-block rounded border-2 border-preto bg-white px-2 font-mono font-bold">{motorista.placa}</p>
        </div>
      )}

      {corrida.status === "solicitada" && (
        <button
          className="botao-contorno w-full border-red-700 text-red-700 hover:bg-red-700"
          onClick={async () => { await supabase.rpc("cancelar_corrida", { p_corrida: corrida.id }); carregar(); }}
        >
          Cancelar solicitação
        </button>
      )}

      {avaliar && <Avaliacao corridaId={corrida.id} titulo="Como foi sua corrida?" aoAvaliar={carregar} />}
    </div>
  );
}

function NovaCorrida({ aoCriar }: { aoCriar: () => void }) {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [estimativa, setEstimativa] = useState<Estimativa | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function chamar(url: string) {
    setErro(null);
    setOcupado(true);
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origem, destino }),
    });
    const corpo = await r.json();
    setOcupado(false);
    if (!r.ok) { setErro(corpo.erro ?? "Não foi possível calcular"); return null; }
    return corpo;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-preto via-verde-escuro to-verde p-5 text-white">
        <h1 className="titulo-marca text-4xl">
          Chame um <span className="text-limao">moto-táxi</span>
        </h1>
        <p className="mt-1 opacity-90">Rápido, seguro e de confiança em Avaré.</p>
        <IlustracaoMoto className="ml-auto mt-2 w-44" />
      </div>

      <form
        className="cartao space-y-4"
        onSubmit={async (e) => { e.preventDefault(); setEstimativa(await chamar("/api/estimativa")); }}
      >
        <div>
          <label className="rotulo" htmlFor="origem">De onde você sai?</label>
          <input id="origem" className="campo" required placeholder="Rua e número" value={origem}
            onChange={(e) => { setOrigem(e.target.value); setEstimativa(null); }} />
        </div>
        <div>
          <label className="rotulo" htmlFor="destino">Para onde vai?</label>
          <input id="destino" className="campo" required placeholder="Rua e número" value={destino}
            onChange={(e) => { setDestino(e.target.value); setEstimativa(null); }} />
        </div>

        {!estimativa && (
          <button className="botao w-full" disabled={ocupado}>
            {ocupado ? "Calculando..." : "Ver valor"}
          </button>
        )}

        {estimativa && (
          <div className="space-y-3 rounded-xl bg-fundo p-4 text-center">
            <p className="text-sm text-gray-600">
              {estimativa.distanciaKm.toFixed(1)} km · cerca de {estimativa.duracaoMin} min
            </p>
            <p className="titulo-marca text-5xl text-verde">{formatarReais(estimativa.valor)}</p>
            <p className="text-xs text-gray-600">Valor previsto. Pagamento direto ao motorista.</p>
            <button
              type="button"
              className="botao-destaque w-full text-lg"
              disabled={ocupado}
              onClick={async () => { if (await chamar("/api/corridas")) aoCriar(); }}
            >
              Confirmar corrida
            </button>
          </div>
        )}

        {erro && <p className="text-sm font-semibold text-red-700">{erro}</p>}
      </form>
    </div>
  );
}
