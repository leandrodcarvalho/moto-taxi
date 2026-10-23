"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { celularValido, normalizarCelular, type Canal } from "@/lib/contato";
import { CIDADE_PADRAO, EMPRESA_SLUG, UF_PADRAO } from "@/lib/empresa";

type Etapa = "dados" | "codigo";

export default function Cadastro() {
  const router = useRouter();
  const supabase = criarClienteNavegador();

  const [canal, setCanal] = useState<Canal>("celular");
  const [contato, setContato] = useState("");
  const [etapa, setEtapa] = useState<Etapa>("dados");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviarCadastro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const f = new FormData(e.currentTarget);

    const senha = String(f.get("senha"));
    if (senha !== String(f.get("confirmar"))) return setErro("As senhas não conferem.");
    if (canal === "celular" && !celularValido(contato)) return setErro("Informe um celular com DDD.");

    const dados = {
      empresa: EMPRESA_SLUG,
      nome_completo: String(f.get("nome")).trim(),
      data_nascimento: String(f.get("nascimento")),
      rua: String(f.get("rua")).trim(),
      numero: String(f.get("numero")).trim(),
      bairro: String(f.get("bairro")).trim(),
      cidade: String(f.get("cidade")).trim(),
      uf: String(f.get("uf")).trim().toUpperCase(),
    };

    setEnviando(true);
    const { error } =
      canal === "celular"
        ? await supabase.auth.signUp({
            phone: normalizarCelular(contato),
            password: senha,
            options: { data: dados, channel: "whatsapp" },
          })
        : await supabase.auth.signUp({
            email: contato.trim(),
            password: senha,
            options: { data: dados },
          });
    setEnviando(false);

    if (error) return setErro(error.message);
    setEtapa("codigo");
  }

  async function confirmarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { error } =
      canal === "celular"
        ? await supabase.auth.verifyOtp({ phone: normalizarCelular(contato), token: codigo, type: "sms" })
        : await supabase.auth.verifyOtp({ email: contato.trim(), token: codigo, type: "email" });
    setEnviando(false);

    if (error) return setErro("Código inválido ou expirado.");
    router.replace("/solicitar");
  }

  return (
    <>
      <Cabecalho titulo="Cadastro" />
      <main className="mx-auto max-w-lg px-4 py-6">
        {etapa === "dados" ? (
          <form onSubmit={enviarCadastro} className="cartao space-y-4">
            <h1 className="titulo-marca text-3xl text-verde">Crie sua conta</h1>

            <fieldset>
              <legend className="rotulo">Como quer receber o código?</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["celular", "email"] as Canal[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCanal(c); setContato(""); }}
                    className={canal === c ? "botao" : "botao-contorno"}
                  >
                    {c === "celular" ? "WhatsApp" : "E-mail"}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="rotulo" htmlFor="contato">
                {canal === "celular" ? "Celular com DDD" : "E-mail"}
              </label>
              <input
                id="contato"
                className="campo"
                required
                type={canal === "celular" ? "tel" : "email"}
                inputMode={canal === "celular" ? "tel" : "email"}
                placeholder={canal === "celular" ? "(14) 99999-9999" : "voce@email.com"}
                value={contato}
                onChange={(e) => setContato(e.target.value)}
              />
            </div>

            <div>
              <label className="rotulo" htmlFor="nome">Nome completo</label>
              <input id="nome" name="nome" className="campo" required autoComplete="name" />
            </div>

            <div>
              <label className="rotulo" htmlFor="nascimento">Data de nascimento</label>
              <input id="nascimento" name="nascimento" type="date" className="campo" required />
            </div>

            <div className="grid grid-cols-[1fr_7rem] gap-2">
              <div>
                <label className="rotulo" htmlFor="rua">Rua</label>
                <input id="rua" name="rua" className="campo" required autoComplete="address-line1" />
              </div>
              <div>
                <label className="rotulo" htmlFor="numero">Número</label>
                <input id="numero" name="numero" className="campo" required />
              </div>
            </div>

            <div>
              <label className="rotulo" htmlFor="bairro">Bairro</label>
              <input id="bairro" name="bairro" className="campo" required />
            </div>

            <div className="grid grid-cols-[1fr_5rem] gap-2">
              <div>
                <label className="rotulo" htmlFor="cidade">Cidade</label>
                <input id="cidade" name="cidade" className="campo" required defaultValue={CIDADE_PADRAO} />
              </div>
              <div>
                <label className="rotulo" htmlFor="uf">Estado</label>
                <input id="uf" name="uf" className="campo" required maxLength={2} defaultValue={UF_PADRAO} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="rotulo" htmlFor="senha">Senha</label>
                <input id="senha" name="senha" type="password" className="campo" required minLength={6} autoComplete="new-password" />
              </div>
              <div>
                <label className="rotulo" htmlFor="confirmar">Confirmar senha</label>
                <input id="confirmar" name="confirmar" type="password" className="campo" required minLength={6} autoComplete="new-password" />
              </div>
            </div>

            {erro && <p className="text-sm font-semibold text-red-700">{erro}</p>}

            <button className="botao-destaque w-full" disabled={enviando}>
              {enviando ? "Enviando..." : "Receber código"}
            </button>
            <p className="text-center text-sm">
              Já tem conta? <Link href="/entrar" className="font-bold text-verde underline">Entrar</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={confirmarCodigo} className="cartao space-y-4">
            <h1 className="titulo-marca text-3xl text-verde">Confirme o código</h1>
            <p>
              Enviamos um código {canal === "celular" ? "pelo WhatsApp" : "por e-mail"} para{" "}
              <strong>{contato}</strong>.
            </p>
            <input
              className="campo text-center text-2xl tracking-[0.5em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            />
            {erro && <p className="text-sm font-semibold text-red-700">{erro}</p>}
            <button className="botao-destaque w-full" disabled={enviando || codigo.length < 6}>
              Confirmar
            </button>
            <button type="button" className="w-full text-sm underline" onClick={() => setEtapa("dados")}>
              Voltar e corrigir dados
            </button>
          </form>
        )}
      </main>
    </>
  );
}
