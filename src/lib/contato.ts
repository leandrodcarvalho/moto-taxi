export type Canal = "celular" | "email";

/** Converte (14) 99999-9999 para +5514999999999. */
export function normalizarCelular(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  const semPais = digitos.startsWith("55") && digitos.length > 11 ? digitos.slice(2) : digitos;
  return `+55${semPais}`;
}

export function celularValido(valor: string): boolean {
  return /^\+55\d{2}9\d{8}$/.test(normalizarCelular(valor));
}
