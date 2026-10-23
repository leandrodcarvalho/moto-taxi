import { Marca } from "@/components/Marca";

export function Cabecalho({ nome, titulo }: { nome?: string; titulo?: string }) {
  return (
    <header className="bg-preto bg-gradient-to-r from-preto via-verde-escuro to-verde">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Marca />
        <div className="text-right text-sm text-white">
          {titulo && <p className="font-bold text-limao uppercase">{titulo}</p>}
          {nome && <p className="opacity-90">{nome}</p>}
          {nome && (
            <form action="/auth/sair" method="post">
              <button className="text-xs underline opacity-80 hover:opacity-100">Sair</button>
            </form>
          )}
        </div>
      </div>
      <div className="h-1 bg-limao" />
    </header>
  );
}
