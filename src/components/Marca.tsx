import Link from "next/link";

/** Logotipo em texto, no estilo do material da Millênio. */
export function Marca({ tamanho = "md" }: { tamanho?: "md" | "lg" }) {
  const grande = tamanho === "lg";
  return (
    <Link href="/" className="inline-block select-none">
      <span className={`titulo-marca block text-white ${grande ? "text-3xl" : "text-lg"}`}>
        Moto Táxi
      </span>
      <span
        className={`titulo-marca block text-limao drop-shadow-[2px_2px_0_#000] ${grande ? "text-6xl" : "text-3xl"}`}
      >
        Millênio
      </span>
    </Link>
  );
}
