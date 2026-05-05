import React from 'react';

const CameroonMap: React.FC = () => (
  <svg
    viewBox="0 0 400 520"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 w-full h-full object-cover opacity-20"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {/* Contour principal du Cameroun */}
    <path
      d="M 32,388
         Q 48,432 72,446
         L 114,458 L 172,461 L 232,456 L 288,436
         L 328,406 L 347,352 L 350,282 L 340,218
         L 312,158 L 287,76 L 262,26 L 241,8
         L 212,22 L 192,56 L 172,86 L 150,118
         L 126,156 L 92,176 L 58,196
         L 30,252 L 18,326 Z"
      fill="rgba(255,255,255,0.08)"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.5"
    />

    {/* Limite EXTRÊME-NORD / NORD */}
    <line x1="212" y1="22" x2="287" y2="76" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    {/* Limite NORD / ADAMAOUA */}
    <line x1="92" y1="176" x2="340" y2="218" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    {/* Limite ADAMAOUA / centre */}
    <line x1="126" y1="156" x2="150" y2="118" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    {/* Limite verticale EST */}
    <line x1="272" y1="218" x2="328" y2="406" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    {/* Limite CENTRE / SUD */}
    <line x1="172" y1="370" x2="288" y2="380" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    {/* Limite LITTORAL / CENTRE */}
    <line x1="72" y1="320" x2="200" y2="340" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    {/* Limite NORD-OUEST / OUEST */}
    <line x1="92" y1="176" x2="170" y2="260" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

    {/* Étiquettes des régions */}
    <text x="228" y="50"  fontSize="13" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">EXTRÊME-NORD</text>
    <text x="262" y="150" fontSize="13" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">NORD</text>
    <text x="230" y="240" fontSize="13" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">ADAMAOUA</text>
    <text x="318" y="310" fontSize="12" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">EST</text>
    <text x="220" y="345" fontSize="12" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">CENTRE</text>
    <text x="210" y="430" fontSize="12" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">SUD</text>
    <text x="80"  y="310" fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">LITTORAL</text>
    <text x="90"  y="215" fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">NORD-OUEST</text>
    <text x="155" y="290" fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">OUEST</text>
    <text x="72"  y="395" fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="600" letterSpacing="1">SUD-OUEST</text>
  </svg>
);

export default CameroonMap;
