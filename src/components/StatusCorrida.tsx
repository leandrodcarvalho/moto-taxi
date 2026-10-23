import { ROTULO_STATUS, type StatusCorrida } from "@/lib/tipos";

const COR: Record<StatusCorrida, string> = {
  solicitada: "bg-amarelo text-preto",
  atribuida: "bg-limao text-preto",
  em_andamento: "bg-verde text-white",
  concluida: "bg-gray-200 text-gray-800",
  cancelada: "bg-red-100 text-red-800",
};

export function StatusCorridaSelo({ status }: { status: StatusCorrida }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${COR[status]}`}>
      {ROTULO_STATUS[status]}
    </span>
  );
}
