import type { CvTemplateData } from "../types";

/**
 * Labels personnalisables des sections.
 * Si non fournis, les valeurs par défaut sont utilisées.
 * Permettent au candidat de renommer "Compétences" en "Skills",
 * "Expérience professionnelle" en "Parcours pro", etc.
 */
export interface CvSectionLabels {
  contact?: string;
  hardSkills?: string;
  softSkills?: string;
  languages?: string;
  interests?: string;
  experiences?: string;
  education?: string;
}

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Compétences",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Centres d'intérêt",
  experiences: "Expérience professionnelle",
  education: "Formations",
};

interface Props {
  data: CvTemplateData;
  accentColor?: string;
  labels?: CvSectionLabels;
}

// Couleurs figées du template (charte maquette PPT)
const SIDEBAR_BG = "#e5f4f6"; // bleu pastel très clair
const TITLE_COLOR = "#36626b"; // bleu canard foncé pour titres
const TEXT_COLOR = "#374151"; // gris foncé pour corps texte

/**
 * Template "Editorial Creative" — mise en page fidèle au PPTX original.
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │   BRUSH HORIZONTAL (image PNG) — toute la largeur        │ ~60mm
 *  │   ┌──────┐                                               │
 *  │   │photo │  Signature manuscrite                         │
 *  │   │hex.  │  TITRE EN MAJUSCULES                          │
 *  │   └──────┘  Texte d'intro court                          │
 *  ├──────────┬───────────────────────────────────────────────┤
 *  │ SIDEBAR  │                                               │
 *  │ (bleue)  │   EXPÉRIENCE PROFESSIONNELLE                  │
 *  │          │   - Poste                                     │
 *  │ CONTACT  │     Entreprise · dates                        │
 *  │ ...      │     Description...                            │
 *  │          │                                               │
 *  │ COMPÉT.  │   FORMATIONS                                  │
 *  │ ...      │   - Diplôme                                   │
 *  │          │     École · dates                             │
 *  │ QUALITÉS │                                               │
 *  │ ...      │                                               │
 *  └──────────┴───────────────────────────────────────────────┘
 *
 * Pas de LANGUES ni CENTRES D'INTÉRÊT dans cette mise en page
 * (cohérent avec le PPTX original — on garde le template pur).
 */
export default function EditorialCreativeTemplate({ data, accentColor = "#7dd3fc", labels }: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg relative overflow-hidden"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "system-ui, sans-serif", color: TEXT_COLOR }}
    >
      {/* ─── Sidebar gauche bleue (sous le brush, pleine hauteur restante) ─── */}
      <aside
        className="absolute left-0 w-[71mm] z-0"
        style={{
          top: "55mm",
          bottom: "0",
          backgroundColor: SIDEBAR_BG,
        }}
      />

      {/* ─── Header brush (toute la largeur, en haut) ──────────────────────── */}
      <header className="relative h-[60mm]">
        {/* Image brush en fond */}
        <img
          src="/cv-templates/editorial-brush.png"
          alt=""
          className="absolute top-0 left-0 w-full h-full object-fill pointer-events-none"
          aria-hidden="true"
        />

        {/* Contenu du header par-dessus le brush */}
        <div className="relative z-10 h-full flex items-center px-[10mm] gap-[8mm]">
          {/* Photo en hexagone */}
          <div className="shrink-0">
            <PhotoHexagone photoUrl={data.photoUrl} fullName={data.fullName} />
          </div>

          {/* Identité + intro à droite */}
          <div className="flex-1 min-w-0">
            <div
              className="text-3xl leading-none mb-1"
              style={{ fontFamily: "'Allura', cursive", color: TITLE_COLOR }}
            >
              {data.fullName || "Votre nom"}
            </div>
            <h1
              className="text-2xl font-bold uppercase leading-tight tracking-wide mb-2"
              style={{ fontFamily: "'Lora', serif", color: TITLE_COLOR }}
            >
              {data.title || "Votre titre"}
            </h1>
            {data.professionalSummary && (
              <p className="text-[10px] leading-snug text-gray-700 max-w-[110mm]">
                {data.professionalSummary}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ─── Corps : sidebar (gauche) + main (droite) ──────────────────────── */}
      <div className="relative flex z-10">
        {/* Sidebar gauche : padding interne, contenu seulement */}
        <aside className="w-[71mm] shrink-0 px-[8mm] py-[8mm] space-y-6">
          {/* Contact */}
          <section>
            <SidebarTitle>{L.contact}</SidebarTitle>
            <ul className="space-y-1.5 text-xs break-words">
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
            <section>
              <SidebarTitle>{L.hardSkills}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.hardSkills.map((s, i) => (
                  <li key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: TITLE_COLOR }}>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Qualités */}
          {data.softSkills.length > 0 && (
            <section>
              <SidebarTitle>{L.softSkills}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.softSkills.map((s, i) => (
                  <li key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: TITLE_COLOR }}>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Langues (optionnel) */}
          {data.languages.length > 0 && (
            <section>
              <SidebarTitle>{L.languages}</SidebarTitle>
              <ul className="space-y-1.5 text-xs">
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

          {/* Centres d'intérêt (optionnel) */}
          {data.interests.length > 0 && (
            <section>
              <SidebarTitle>{L.interests}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.interests.map((it, i) => (
                  <li key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: TITLE_COLOR }}>•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Main : Expérience + Formations */}
        <main className="flex-1 px-[10mm] py-[8mm] space-y-6">
          {data.experiences.length > 0 && (
            <section>
              <MainTitle>{L.experiences}</MainTitle>
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
                      <p className="text-xs leading-relaxed">{exp.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {data.education.length > 0 && (
            <section>
              <MainTitle>{L.education}</MainTitle>
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
                      <p className="text-xs mt-1">{ed.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Photo en hexagone (SVG polygon) avec bordure blanche.
 */
function PhotoHexagone({ photoUrl, fullName }: { photoUrl?: string; fullName: string }) {
  const id = `hex-clip-${Math.random().toString(36).slice(2, 9)}`;
  const points = "50,2 96,28 96,87 50,113 4,87 4,28";
  return (
    <svg
      viewBox="0 0 100 115"
      width="150"
      height="172"
      className="block"
      style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}
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
        <>
          <polygon points={points} fill={TITLE_COLOR} />
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
        </>
      )}
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
