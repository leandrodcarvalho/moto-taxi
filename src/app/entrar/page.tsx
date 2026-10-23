"use client";

import Link from "next/link";
import { useState } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { normalizarCelular } from "@/lib/contato";

export default function Entrar() {
  const supabase = criarClienteNavegador();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const f = new FormData(e.currentTarget);
    const login = String(f.get("login")).trim();
    const password = String(f.get("senha"));

    setEnviando(true);
    const { error } = login.includes("@")
      ? await supabase.auth.signInWithPassword({ email: login, password })
      : await supabase.auth.signInWithPassword({ phone: normalizarCelular(login), password });
    setEnviando(false);

    if (error) return setErro("Celular/e-mail ou senha incorretos.");
    window.location.href = "/auth/redirecionar";
  }

  return (
    <>
      <Cabecalho titulo="Entrar" />
      <main className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={entrar} className="cartao space-y-4">
          <h1 className="titulo-marca text-3xl text-verde">Bem-vindo de volta</h1>
          <div>
            <label className="rotulo" htmlFor="login">Celular ou e-mail</label>
            <input id="login" name="login" className="campo" required autoComplete="username" />
          </div>
          <div>
            <label className="rotulo" htmlFor="senha">Senha</label>
            <input id="senha" name="senha" type="password" className="campo" required autoComplete="current-password" />
          </div>
          {erro && <p className="text-sm font-semibold text-red-700">{erro}</p>}
          <button className="botao-destaque w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
          <p className="text-center text-sm">
            Ainda não tem conta? <Link href="/cadastro" className="font-bold text-verde underline">Cadastre-se</Link>
          </p>
        </form>
      </main>
    </>
  );
}
