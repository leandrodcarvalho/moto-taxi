"use client";

import { useEffect, useRef } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

/**
 * Chama `aoMudar` sempre que uma corrida visível ao usuário muda.
 * O RLS garante que cada perfil só recebe as corridas que pode ver.
 */
export function useTempoRealCorridas(canal: string, filtro: string | undefined, aoMudar: () => void) {
  const callback = useRef(aoMudar);
  callback.current = aoMudar;

  useEffect(() => {
    const supabase = criarClienteNavegador();
    const assinatura = supabase
      .channel(canal)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "corridas", ...(filtro ? { filter: filtro } : {}) },
        () => callback.current(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(assinatura);
    };
  }, [canal, filtro]);
}
