"use client";

import { useState } from "react";

/** Mostra uma média (somente leitura) ou permite escolher de 1 a 5. */
export function Estrelas({
  valor,
  aoEscolher,
  tamanho = "text-2xl",
}: {
  valor: number | null;
  aoEscolher?: (nota: number) => void;
  tamanho?: string;
}) {
  const [sobre, setSobre] = useState<number | null>(null);
  const ativo = sobre ?? valor ?? 0;

  return (
    <span className={`inline-flex ${tamanho}`} aria-label={valor ? `${valor} de 5 estrelas` : "Sem avaliação"}>
      {[1, 2, 3, 4, 5].map((n) => {
        const cheia = n <= Math.round(ativo);
        const estrela = (
          <span className={cheia ? "text-amarelo drop-shadow-[0_0_1px_#000]" : "text-gray-300"}>★</span>
        );
        if (!aoEscolher) return <span key={n}>{estrela}</span>;
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setSobre(n)}
            onMouseLeave={() => setSobre(null)}
            onClick={() => aoEscolher(n)}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            className="px-0.5"
          >
            {estrela}
          </button>
        );
      })}
    </span>
  );
}

export function MediaNota({ media }: { media: number | null }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Estrelas valor={media} tamanho="text-base" />
      <span className="text-sm text-gray-600">{media ? media.toFixed(1) : "Sem avaliações"}</span>
    </span>
  );
}
