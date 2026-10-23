"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusCorridaSelo } from "@/components/StatusCorrida";
import { Trajeto } from "@/components/Trajeto";
import { useTempoRealCorridas } from "@/hooks/useTempoReal";
import { criarClienteNavegador } from "@/lib/supabase/client";
import type { Corrida, StatusCorrida } from "@/lib/tipos";

type Pessoa = { nome_completo: string; telefone: string | null } | null;
type CorridaAdmin = Corrida & { cliente: Pessoa; motorista: Pessoa };
type MotoristaLista = {
  perfil_id: string;
  marca: string;
  modelo: string;
  cor: string;
  placa: string;
  ativo: boolean;
  perfis: { nome_completo: string; telefone: string | null } | null;
};

const ABAS: { rotulo: string; status: StatusCorrida[] }[] = [
  { rotulo: "Aguardando", status: ["solicitada"] },
  { rotulo: "Em atendimento", status: ["atribuida", "em_andamento"] },
  { rotulo: "Finalizadas", status: ["concluida", "cancelada"] },
];

export function PainelAdmin({ empresaId }: { empresaId: string }) {
  const supabase = criarClienteNavegador();
  const [aba, setAba] = useState(0);
  const [corridas, setCorridas] = useState<CorridaAdmin[]>([]);
  const [motoristas, setMotoristas] = useState<MotoristaLista[]>([]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("corridas")
      .select(
        "*, cliente:perfis!corridas_cliente_id_fkey(nome_completo, telefone), motorista:perfis!corridas_motorista_id_fkey(nome_completo, telefone)",
      )
      .eq("empresa_id", empresaId)
      .order("solicitada_em", { ascending: false })
      .limit(100);
    setCorridas((data ?? []) as CorridaAdmin[]);
  }, [supabase, empresaId]);

  const carregarMotoristas = useCallback(async () => {
    const { data } = await supabase
      .from("motoristas")
      .select("perfil_id, marca, modelo, cor, placa, ativo, perfis(nome_completo, telefone)")
      .eq("empresa_id", empresaId);
    setMotoristas((data ?? []) as unknown as MotoristaLista[]);
  }, [supabase, empresaId]);

  useEffect(() => { carregar(); carregarMotoristas(); }, [carregar, carregarMotoristas]);
  useTempoRealCorridas(`admin-${empresaId}`, `empresa_id=eq.${empresaId}`, carregar);

  const visiveis = corridas.filter((c) => ABAS[aba].status.includes(c.status));
  const ativos = motoristas.filter((m) => m.ativo);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <section className="space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {ABAS.map((a, i) => {
            const qtd = corridas.filter((c) => a.status.includes(c.status)).length;
            return (
              <button key={a.rotulo} onClick={() => setAba(i)} className={aba === i ? "botao" : "botao-contorno"}>
                {a.rotulo} ({qtd})
              </button>
            );
          })}
        </div>

        {visiveis.length === 0 && <p className="cartao text-center text-gray-600">Nenhuma corrida aqui.</p>}

        {visiveis.map((c) => (
          <article key={c.id} className="cartao space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-gray-600">
                {new Date(c.solicitada_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </span>
              <StatusCorridaSelo status={c.status} />
            </div>
            <Trajeto corrida={c} />
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><strong>Cliente:</strong> {c.cliente?.nome_completo} {c.cliente?.telefone && `· ${c.cliente.telefone}`}</p>
              {c.motorista && (
                <p><strong>Motorista:</strong> {c.motorista.nome_completo} {c.motorista.telefone && `· ${c.motorista.telefone}`}</p>
              )}
            </div>

            {(c.status === "solicitada" || c.status === "atribuida") && (
              <div className="flex flex-wrap gap-2">
                <select
                  className="campo flex-1"
                  value={c.motorista_id ?? ""}
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    const { error } = await supabase.rpc("atribuir_corrida", {
                      p_corrida: c.id,
                      p_motorista: e.target.value,
                    });
                    if (error) alert(error.message);
                    carregar();
                  }}
                >
                  <option value="">Direcionar para motorista...</option>
                  {ativos.map((m) => (
                    <option key={m.perfil_id} value={m.perfil_id}>
                      {m.perfis?.nome_completo} · {m.modelo} {m.placa}
                    </option>
                  ))}
                </select>
                <button
                  className="botao-contorno border-red-700 text-red-700 hover:bg-red-700"
                  onClick={async () => { await supabase.rpc("cancelar_corrida", { p_corrida: c.id }); carregar(); }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </article>
        ))}
      </section>

      <aside className="space-y-4">
        <div className="cartao space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="titulo-marca text-2xl text-verde">Motoristas</h2>
            <button className="botao-destaque px-3 py-1.5 text-sm" onClick={() => setMostrarCadastro((v) => !v)}>
              {mostrarCadastro ? "Fechar" : "+ Novo"}
            </button>
          </div>
          {mostrarCadastro && (
            <CadastroMotorista aoCadastrar={() => { setMostrarCadastro(false); carregarMotoristas(); }} />
          )}
          <ul className="divide-y divide-borda text-sm">
            {motoristas.map((m) => (
              <li key={m.perfil_id} className="py-2">
                <p className="font-bold">{m.perfis?.nome_completo}</p>
                <p className="text-gray-600">{m.marca} {m.modelo} · {m.cor} · {m.placa}</p>
              </li>
            ))}
            {motoristas.length === 0 && <li className="py-2 text-gray-600">Nenhum motorista cadastrado.</li>}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function CadastroMotorista({ aoCadastrar }: { aoCadastrar: () => void }) {
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const r = await fetch("/api/admin/motoristas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    setEnviando(false);
    if (!r.ok) return setErro((await r.json()).erro);
    aoCadastrar();
  }

  const campos: [string, string, string?][] = [
    ["nome", "Nome completo"],
    ["telefone", "Telefone (login)", "tel"],
    ["senha", "Senha inicial", "password"],
    ["marca", "Marca da moto"],
    ["modelo", "Modelo"],
    ["cor", "Cor"],
    ["placa", "Placa"],
  ];

  return (
    <form onSubmit={enviar} className="space-y-2 rounded-xl bg-fundo p-3">
      {campos.map(([nome, rotulo, tipo]) => (
        <div key={nome}>
          <label className="rotulo" htmlFor={`m-${nome}`}>{rotulo}</label>
          <input id={`m-${nome}`} name={nome} type={tipo ?? "text"} className="campo" required
            minLength={nome === "senha" ? 6 : undefined} />
        </div>
      ))}
      {erro && <p className="text-sm text-red-700">{erro}</p>}
      <button className="botao w-full" disabled={enviando}>{enviando ? "Salvando..." : "Cadastrar motorista"}</button>
    </form>
  );
}
