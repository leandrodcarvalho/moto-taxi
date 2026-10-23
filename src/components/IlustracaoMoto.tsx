import Image from "next/image";
import ilustracao from "../../public/moto-millenio.webp";

/** Logotipo do piloto Millênio usado no início e na tela de chamada. */
export function IlustracaoMoto({ className = "" }: { className?: string }) {
  return (
    <Image
      src={ilustracao}
      alt="Piloto de moto-táxi Millênio"
      className={`aspect-square rounded-full shadow-[0_0_40px_rgba(142,224,0,0.25)] ${className}`}
      priority
    />
  );
}
