import { Cabecalho } from "@/components/Cabecalho";
import { exigirPapel } from "@/lib/perfil";
import { PainelMotorista } from "./PainelMotorista";

export default async function PaginaMotorista() {
  const perfil = await exigirPapel("motorista");
  return (
    <>
      <Cabecalho nome={perfil.nome_completo} titulo="Motorista" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <PainelMotorista motoristaId={perfil.id} />
      </main>
    </>
  );
}
