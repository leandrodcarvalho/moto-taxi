/** Ilustração simples de moto-táxi para a tela de chamada. */
export function IlustracaoMoto({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 160" className={className} role="img" aria-label="Moto-táxi">
      {/* linhas de velocidade */}
      <g stroke="#8ee000" strokeWidth="6" strokeLinecap="round">
        <path d="M4 70 H40" />
        <path d="M14 88 H46" />
        <path d="M2 106 H28" />
      </g>
      {/* rodas */}
      <g stroke="#0a0f0a" strokeWidth="8">
        <circle cx="66" cy="122" r="28" fill="#fff" />
        <circle cx="204" cy="122" r="28" fill="#fff" />
      </g>
      <circle cx="66" cy="122" r="8" fill="#0b5d1e" />
      <circle cx="204" cy="122" r="8" fill="#0b5d1e" />
      {/* garfo e guidão */}
      <g stroke="#0a0f0a" strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M204 122 L180 62" />
        <path d="M172 56 H196" />
      </g>
      {/* baú, carenagem e tanque */}
      <rect x="40" y="52" width="38" height="34" rx="5" fill="#0a0f0a" />
      <path d="M58 104 L92 80 H150 L178 70 L188 92 L150 108 H92 Z" fill="#0b5d1e" stroke="#0a0f0a" strokeWidth="5" strokeLinejoin="round" />
      <path d="M126 80 Q142 62 170 66 L176 78 Q150 76 126 80 Z" fill="#8ee000" stroke="#0a0f0a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M80 78 H128" stroke="#0a0f0a" strokeWidth="9" strokeLinecap="round" />
      {/* piloto */}
      <g stroke="#0a0f0a" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M100 76 L112 36 L140 40 L150 64 L176 60" fill="none" />
        <path d="M100 76 L126 78 L134 104" fill="none" />
        <path d="M108 40 L140 42 L132 72 L100 74 Z" fill="#0b5d1e" />
        <circle cx="126" cy="22" r="15" fill="#8ee000" />
        <path d="M128 18 H142" />
      </g>
    </svg>
  );
}
