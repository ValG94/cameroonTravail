import type { CvTemplateData } from "../types";

interface Props {
  data: CvTemplateData;
  accentColor?: string;
}

// Couleurs figées du template (commande maquette)
const SIDEBAR_BG = "#e5f4f6"; // bleu pastel très clair
const TITLE_COLOR = "#36626b"; // bleu canard foncé pour les titres
const BRUSH_COLOR = "#9ec9d2"; // brush décoratif un peu plus prononcé

/**
 * Template "Editorial Creative" — style magazine éditorial
 *  - Sidebar gauche bleu pastel pleine hauteur
 *  - Brush décoratif (SVG filter) au-dessus de la photo dans le bandeau
 *  - Photo en hexagone (SVG polygon)
 *  - Signature manuscrite (Allura) prénom + nom
 *  - Titres en font Lora couleur canard foncé, soulignés d'une ligne fine
 *
 * L'accentColor du picker influence les puces et l'épaisseur du brush.
 * Les couleurs principales (sidebar, titres) sont figées par charte.
 */
export default function EditorialCreativeTemplate({ data, accentColor = "#7dd3fc" }: Props) {
  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg flex text-gray-900 relative overflow-hidden"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "system-ui, sans-serif" }}
    >
      {/* ─── Sidebar gauche bleue pastel ─────────────────────────── */}
      <aside
        className="w-[36%] shrink-0 px-7 pt-12 pb-8 relative"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        {/* Brush décoratif en haut de la sidebar */}
        <BrushStroke />

        {/* Photo en hexagone + signature + titre */}
        <div className="flex flex-col items-center text-center mb-7 relative z-10">
          <PhotoHexagone photoUrl={data.photoUrl} fullName={data.fullName} />

          {/* Signature manuscrite prénom + nom */}
          <div
            className="mt-4 text-3xl leading-none mb-2"
            style={{ fontFamily: "'Allura', cursive", color: TITLE_COLOR }}
          >
            {data.fullName || "Votre nom"}
          </div>

          {/* Titre principal façon magazine */}
          <h1
            className="text-xl font-bold uppercase leading-tight tracking-wide"
            style={{ fontFamily: "'Lora', serif", color: TITLE_COLOR }}
          >
            {data.title || "Votre titre"}
          </h1>
        </div>

        {/* Contact */}
        <section className="mb-6">
          <SidebarTitle>Contact</SidebarTitle>
          <ul className="space-y-1.5 text-xs text-gray-700 break-words">
            {data.phoneNumber && <ContactRow accent={accentColor} symbol="☎">{data.phoneNumber}</ContactRow>}
            {data.email && <ContactRow accent={accentColor} symbol="✉">{data.email}</ContactRow>}
            {data.linkedin && <ContactRow accent={accentColor} symbol="🌐">{data.linkedin}</ContactRow>}
            {(data.city || data.country) && (
              <ContactRow accent={accentColor} symbol="◉">
                {[data.city, data.country].filter(Boolean).join(", ")}
              </ContactRow>
            )}
          </ul>
        </section>

        {/* Compétences */}
        {data.hardSkills.length > 0 && (
          <section className="mb-6">
            <SidebarTitle>Compétences</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-700">
              {data.hardSkills.map((s, i) => (
                <li key={i} className="flex gap-2 items-baseline">
                  <span style={{ color: accentColor }}>•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Qualités */}
        {data.softSkills.length > 0 && (
          <section className="mb-6">
            <SidebarTitle>Qualités</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-700">
              {data.softSkills.map((s, i) => (
                <li key={i} className="flex gap-2 items-baseline">
                  <span style={{ color: accentColor }}>•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Langues */}
        {data.languages.length > 0 && (
          <section className="mb-6">
            <SidebarTitle>Langues</SidebarTitle>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {data.languages.map((l, i) => (
                <li key={i}>
                  <div className="font-semibold" style={{ color: TITLE_COLOR }}>
                    {l.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">
                    {l.level.replace(/_/g, " ")}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Centres d'intérêt */}
        {data.interests.length > 0 && (
          <section>
            <SidebarTitle>Centres d'intérêt</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-700">
              {data.interests.map((it, i) => (
                <li key={i} className="flex gap-2 items-baseline">
                  <span style={{ color: accentColor }}>•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* ─── Colonne principale blanche ────────────────────────── */}
      <main className="flex-1 px-10 py-10 space-y-7 relative">
        {/* Intro / résumé */}
        {data.professionalSummary && (
          <section className="pb-3">
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {data.professionalSummary}
            </p>
          </section>
        )}

        {/* Expériences */}
        {data.experiences.length > 0 && (
          <section>
            <MainTitle>Expérience professionnelle</MainTitle>
            <div className="space-y-5">
              {data.experiences.map((exp, i) => (
                <article key={i}>
                  <h3
                    className="text-sm font-bold"
                    style={{ fontFamily: "'Lora', serif", color: TITLE_COLOR }}
                  >
                    {exp.position}
                  </h3>
                  <div className="text-xs text-gray-600 italic mb-1">
                    {exp.company}
                    {exp.location && ` · ${exp.location}`}
                    {(exp.startDate || exp.endDate) && (
                      <>
                        {" / "}
                        {formatDate(exp.startDate)}
                        {" – "}
                        {exp.current ? "Aujourd'hui" : formatDate(exp.endDate)}
                      </>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-700 leading-relaxed">{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-xs text-gray-700">
                      {exp.achievements.map((a, j) => (
                        <li key={j} className="flex gap-2">
                          <span style={{ color: accentColor }}>›</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Formations */}
        {data.education.length > 0 && (
          <section>
            <MainTitle>Formations</MainTitle>
            <div className="space-y-3">
              {data.education.map((ed, i) => (
                <article key={i}>
                  <h3
                    className="text-sm font-bold"
                    style={{ fontFamily: "'Lora', serif", color: TITLE_COLOR }}
                  >
                    {ed.degree}
                    {ed.field && ` — ${ed.field}`}
                  </h3>
                  <div className="text-xs text-gray-600 italic">
                    {ed.school}
                    {(ed.startDate || ed.endDate) && (
                      <>
                        {" · "}
                        {formatDate(ed.startDate)}
                        {ed.endDate && ` – ${formatDate(ed.endDate)}`}
                      </>
                    )}
                  </div>
                  {ed.description && (
                    <p className="text-xs text-gray-700 mt-1">{ed.description}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Effet brush décoratif (SVG inline) en haut de la sidebar.
 * Filter feTurbulence + feDisplacementMap simulent un coup de pinceau organique.
 */
function BrushStroke() {
  return (
    <svg
      className="absolute top-3 left-2 right-2 h-16 pointer-events-none z-0"
      viewBox="0 0 200 50"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="brush-grunge" x="-5%" y="-15%" width="110%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="8" />
        </filter>
      </defs>
      <rect
        x="5"
        y="8"
        width="190"
        height="34"
        rx="2"
        fill={BRUSH_COLOR}
        filter="url(#brush-grunge)"
        opacity="0.85"
      />
    </svg>
  );
}

/**
 * Photo en hexagone (SVG polygon) avec bordure blanche fine.
 * Si pas de photo : fond avec initiales.
 */
function PhotoHexagone({ photoUrl, fullName }: { photoUrl?: string; fullName: string }) {
  const id = `hex-clip-${Math.random().toString(36).slice(2, 9)}`;
  // Hexagone vertical (pointes haut/bas), proportions ~1:1.155 (cos 30°)
  const points = "50,2 96,28 96,87 50,113 4,87 4,28";
  return (
    <svg
      viewBox="0 0 100 115"
      width="160"
      height="184"
      className="block relative z-10"
      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
    >
      <defs>
        <clipPath id={id}>
          <polygon points={points} />
        </clipPath>
      </defs>
      {photoUrl ? (
        <image
          href={photoUrl}
          width="100"
          height="115"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${id})`}
        />
      ) : (
        <polygon points={points} fill={TITLE_COLOR} />
      )}
      {/* Initiales si pas de photo */}
      {!photoUrl && (
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill="white"
          fontFamily="system-ui"
        >
          {getInitials(fullName)}
        </text>
      )}
      {/* Bordure blanche par-dessus pour effet "passe-partout" */}
      <polygon points={points} fill="none" stroke="white" strokeWidth="3" />
    </svg>
  );
}

function SidebarTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs uppercase font-bold tracking-[0.18em] mb-2 pb-1 border-b"
      style={{ color: TITLE_COLOR, borderColor: TITLE_COLOR, fontFamily: "'Lora', serif" }}
    >
      {children}
    </h2>
  );
}

function MainTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 pb-1 border-b" style={{ borderColor: TITLE_COLOR }}>
      <h2
        className="text-base uppercase font-bold tracking-[0.15em]"
        style={{ fontFamily: "'Lora', serif", color: TITLE_COLOR }}
      >
        {children}
      </h2>
    </div>
  );
}

function ContactRow({
  symbol,
  accent,
  children,
}: {
  symbol: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2 items-baseline">
      <span className="text-[10px] shrink-0" style={{ color: accent }}>
        {symbol}
      </span>
      <span className="break-all">{children}</span>
    </li>
  );
}

function getInitials(fullName: string): string {
  if (!fullName) return "?";
  return fullName
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(d?: string): string {
  if (!d) return "";
  const m = d.match(/^(\d{4})-?(\d{2})?/);
  if (m) {
    const year = m[1];
    const month = m[2];
    if (month) {
      const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
      return `${months[parseInt(month) - 1] ?? ""} ${year}`;
    }
    return year;
  }
  return d;
}
