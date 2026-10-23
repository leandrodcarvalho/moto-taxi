import { Cabecalho } from "@/components/Cabecalho";
import { exigirPapel } from "@/lib/perfil";
import { SolicitarCorrida } from "./SolicitarCorrida";

export default async function PaginaSolicitar() {
  const perfil = await exigirPapel("cliente");
  return (
    <>
      <Cabecalho nome={perfil.nome_completo} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <SolicitarCorrida clienteId={perfil.id} />
      </main>
    </>
  );
}
