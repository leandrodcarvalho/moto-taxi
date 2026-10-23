import Link from "next/link";
import { Marca } from "@/components/Marca";
import { IlustracaoMoto } from "@/components/IlustracaoMoto";

export default function Inicio() {
  return (
    <main className="min-h-dvh bg-preto bg-gradient-to-br from-preto via-verde-escuro to-verde text-white">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-6 py-10">
        <div>
          <Marca tamanho="lg" />
          <p className="titulo-marca mt-4 text-xl text-white">
            Tradição e confiança em todos os destinos!
          </p>
        </div>

        <IlustracaoMoto className="mx-auto my-8 w-64" />

        <div className="space-y-3">
          <Link href="/cadastro" className="botao-destaque w-full text-lg">
            Criar minha conta
          </Link>
          <Link href="/entrar" className="botao-contorno-claro w-full">
            Já tenho conta
          </Link>
          <p className="pt-4 text-center text-sm opacity-80">
            Avaré/SP · Segunda a domingo, das 06h às 23h
          </p>
        </div>
      </div>
    </main>
  );
}
