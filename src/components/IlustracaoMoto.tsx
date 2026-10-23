/** Ilustração de moto-táxi (piloto com colete e baú) usada no início e na tela de chamada. */
export function IlustracaoMoto({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Moto-táxi">
      {/* sombra */}
      <ellipse cx="162" cy="188" rx="130" ry="7" fill="#000" opacity="0.35" />
      {/* linhas de velocidade */}
      <g stroke="#8ee000" strokeWidth="5" strokeLinecap="round">
        <path d="M4 108 H36"/><path d="M14 124 H44"/><path d="M0 140 H24" />
      </g>
      {/* rodas */}
      <g>
        <circle cx="80" cy="152" r="34" fill="#141814" />
        <circle cx="80" cy="152" r="22" fill="#2b332b" />
        <circle cx="80" cy="152" r="19" fill="none" stroke="#c9d3c5" strokeWidth="3" />
        <g stroke="#c9d3c5" strokeWidth="2.5"><path d="M80 133 V171"/><path d="M61 152 H99"/><path d="M67 139 L93 165"/><path d="M93 139 L67 165"/></g>
        <circle cx="80" cy="152" r="6" fill="#8ee000" />
        <circle cx="248" cy="152" r="34" fill="#141814" />
        <circle cx="248" cy="152" r="22" fill="#2b332b" />
        <circle cx="248" cy="152" r="19" fill="none" stroke="#c9d3c5" strokeWidth="3" />
        <g stroke="#c9d3c5" strokeWidth="2.5"><path d="M248 133 V171"/><path d="M229 152 H267"/><path d="M235 139 L261 165"/><path d="M261 139 L235 165"/></g>
        <circle cx="248" cy="152" r="6" fill="#8ee000" />
      </g>
      {/* balança traseira */}
      <path d="M80 152 L156 132" stroke="#3a443a" strokeWidth="8" strokeLinecap="round" />
      {/* escapamento */}
      <path d="M168 136 Q150 146 120 140 L78 130" stroke="#9aa59a" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M54 124 L84 131" stroke="#6d786d" strokeWidth="11" strokeLinecap="round" />
      {/* motor */}
      <rect x="146" y="106" width="44" height="34" rx="6" fill="#3a443a" />
      <g stroke="#566156" strokeWidth="3"><path d="M152 114 H184"/><path d="M152 121 H184"/><path d="M152 128 H184"/></g>
      {/* garfo dianteiro */}
      <path d="M248 152 L222 74" stroke="#c9d3c5" strokeWidth="8" strokeLinecap="round" />
      <path d="M248 152 L222 74" stroke="#8a968a" strokeWidth="3" strokeLinecap="round" />
      {/* para-lama dianteiro */}
      <path d="M216 128 Q246 100 278 124" stroke="#8ee000" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* quadro, rabeta e para-lama traseiro */}
      <path d="M60 104 Q72 96 102 96 L150 100 L196 96 L200 108 L150 114 L104 116 Q80 116 62 112 Z" fill="#14963a" stroke="#0a0f0a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M52 106 L60 104 L62 112 L54 113 Z" fill="#ff3b30" />
      <path d="M60 118 Q80 120 100 128" stroke="#141814" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* tanque */}
      <path d="M150 100 Q156 78 186 76 L210 80 Q214 92 200 104 L156 106 Z" fill="#8ee000" stroke="#0a0f0a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M160 96 Q168 84 190 84 L204 86" stroke="#0b5d1e" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* banco */}
      <path d="M86 96 Q94 86 118 88 L156 92 Q160 98 152 100 L94 100 Q86 100 86 96 Z" fill="#141814" />
      {/* baú */}
      <rect x="44" y="64" width="40" height="34" rx="6" fill="#141814" stroke="#2b332b" strokeWidth="2" />
      <rect x="49" y="70" width="30" height="6" rx="2" fill="#8ee000" />
      {/* farol e painel */}
      <path d="M228 78 Q244 76 246 88 Q238 96 230 92 Z" fill="#f5d90a" />
      <path d="M244 82 L262 78 L262 92 Z" fill="#f5d90a" opacity="0.35" />
      {/* guidão */}
      <path d="M206 66 L224 70" stroke="#141814" strokeWidth="7" strokeLinecap="round" />
      {/* piloto: perna */}
      <path d="M130 92 L176 98 L168 132" stroke="#1f2a44" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M160 134 H180" stroke="#141814" strokeWidth="9" strokeLinecap="round" />
      {/* piloto: tronco (colete) */}
      <path d="M120 94 Q118 70 138 44 L160 46 Q168 72 150 96 Z" fill="#14963a" stroke="#0a0f0a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M124 80 Q136 76 156 80" stroke="#8ee000" strokeWidth="5" fill="none" />
      <path d="M130 62 Q142 58 160 62" stroke="#8ee000" strokeWidth="5" fill="none" />
      {/* piloto: braço */}
      <path d="M150 52 L184 64 L210 66" stroke="#0a0f0a" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M150 52 L184 64 L210 66" stroke="#14963a" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="212" cy="66" r="6" fill="#141814" />
      {/* capacete */}
      <circle cx="152" cy="30" r="18" fill="#8ee000" stroke="#0a0f0a" strokeWidth="3" />
      <path d="M152 12 A18 18 0 0 1 170 30 L170 34 L156 34 Q154 24 160 16 Z" fill="#141814" opacity="0.15" />
      <path d="M154 24 L170 24 Q172 32 168 36 L154 36 Z" fill="#141814" />
      <path d="M157 27 L166 27" stroke="#5a6b5a" strokeWidth="2" strokeLinecap="round" />
      <path d="M134 34 Q144 44 160 40" stroke="#0b5d1e" strokeWidth="3" fill="none" />
    </svg>
  );
}
