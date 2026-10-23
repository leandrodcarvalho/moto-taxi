import { Cabecalho } from "@/components/Cabecalho";
import { exigirPapel } from "@/lib/perfil";
import { PainelAdmin } from "./PainelAdmin";

export default async function PaginaAdmin() {
  const perfil = await exigirPapel("admin");
  return (
    <>
      <Cabecalho nome={perfil.nome_completo} titulo="Administração" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <PainelAdmin empresaId={perfil.empresa_id} />
      </main>
    </>
  );
}
