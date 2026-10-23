export type Tarifa = {
  tarifa_base: number;
  tarifa_km: number;
  tarifa_minima: number;
};

/** Valor previsto = bandeirada + km × tarifa, nunca abaixo do mínimo. */
export function calcularValor(distanciaKm: number, t: Tarifa): number {
  const bruto = Number(t.tarifa_base) + distanciaKm * Number(t.tarifa_km);
  const valor = Math.max(bruto, Number(t.tarifa_minima));
  return Math.round(valor * 100) / 100;
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
