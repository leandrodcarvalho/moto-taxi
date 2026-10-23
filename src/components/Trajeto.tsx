import { formatarReais } from "@/lib/preco";
import type { Corrida } from "@/lib/tipos";

export function Trajeto({ corrida }: { corrida: Corrida }) {
  return (
    <dl className="space-y-1 text-sm">
      <div><dt className="inline font-bold">Origem: </dt><dd className="inline">{corrida.origem_endereco}</dd></div>
      <div><dt className="inline font-bold">Destino: </dt><dd className="inline">{corrida.destino_endereco}</dd></div>
      <div>
        <dt className="inline font-bold">Valor previsto: </dt>
        <dd className="inline">{formatarReais(Number(corrida.valor_estimado))} ({Number(corrida.distancia_km).toFixed(1)} km)</dd>
      </div>
    </dl>
  );
}
