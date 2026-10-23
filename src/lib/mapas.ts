import "server-only";

export type Rota = { distanciaKm: number; duracaoMin: number };

/**
 * Distância real pelas ruas usando a Google Routes API.
 * Os endereços são completados com cidade/UF para evitar ambiguidade.
 */
export async function calcularRota(origem: string, destino: string): Promise<Rota> {
  const chave = process.env.GOOGLE_MAPS_API_KEY;
  if (!chave) throw new Error("GOOGLE_MAPS_API_KEY não configurada");

  const resposta = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": chave,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify({
      origin: { address: origem },
      destination: { address: destino },
      travelMode: "TWO_WHEELER",
      languageCode: "pt-BR",
      regionCode: "BR",
    }),
    cache: "no-store",
  });

  if (!resposta.ok) throw new Error(`Routes API: ${resposta.status}`);
  const dados = await resposta.json();
  const rota = dados.routes?.[0];
  if (!rota) throw new Error("Rota não encontrada para esses endereços");

  return {
    distanciaKm: Math.round((rota.distanceMeters / 1000) * 100) / 100,
    duracaoMin: Math.ceil(parseInt(rota.duration, 10) / 60),
  };
}
