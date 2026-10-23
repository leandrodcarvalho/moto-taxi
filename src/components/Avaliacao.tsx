"use client";

import { useState } from "react";
import { Estrelas } from "@/components/Estrelas";
import { criarClienteNavegador } from "@/lib/supabase/client";

export function Avaliacao({ corridaId, titulo, aoAvaliar }: { corridaId: string; titulo: string; aoAvaliar: () => void }) {
  const supabase = criarClienteNavegador();
  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    if (!nota) return;
    const { error } = await supabase.rpc("avaliar_corrida", {
      p_corrida: corridaId,
      p_nota: nota,
      p_comentario: comentario.trim() || null,
    });
    if (error) return setErro(error.message);
    aoAvaliar();
  }

  return (
    <div className="cartao space-y-3 text-center">
      <p className="font-bold">{titulo}</p>
      <Estrelas valor={nota} aoEscolher={setNota} tamanho="text-4xl" />
      <textarea className="campo" rows={2} placeholder="Comentário (opcional)" value={comentario}
        onChange={(e) => setComentario(e.target.value)} />
      {erro && <p className="text-sm text-red-700">{erro}</p>}
      <button className="botao w-full" disabled={!nota} onClick={enviar}>Enviar avaliação</button>
    </div>
  );
}
