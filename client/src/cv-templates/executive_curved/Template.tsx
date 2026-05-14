import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_COLOR = "#1f2937";
const TEXT_LIGHT = "#6b7280";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Compétences",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Loisirs",
  experiences: "Expériences",
  education: "Formation",
};

interface Props {
  data: CvTemplateData;
  accentColor?: string;
  labels?: CvSectionLabels;
}

function mix(hex: string, weightWhite: number): string {
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const f = (c: number) => Math.round(c * (1 - weightWhite) + 255 * weightWhite);
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

/**
 * Template "Executive Curved" — d'après le PPTX
 * "CV Document A4 Marketing Moderne Gris Noir Beige".
 *
 *  ┌────────────────────────────────────────────────────────────┐
 *  │ ░░░░░░░░░░ BLOB GRISE (hauteur ~100mm) ░░░░░░░░░░░         │
 *  │ ┌────────┐                                                  │
 *  │ │squircle│   CÉDRIC                                        │
 *  │ │ photo  │   MULLER                                        │
 *  │ │        │   DIRECTEUR MARKETING                           │
 *  │ └────────┘   Texte intro court...                          │
 *  │             ╲___ courbe descendante ___╱                   │
 *  ├──────────┬──────────────────────────────────────────────────┤
 *  │ CONTACT  │   FORMATION                                     │
 *  │ ...      │   ...                                            │
 *  │ COMPÉT.  │                                                  │
 *  │ ...      │   EXPÉRIENCES                                   │
 *  │ LANGUES  │   ...                                            │
 *  │ ...      │                                                  │
 *  │ LOISIRS  │                                                  │
 *  └──────────┴──────────────────────────────────────────────────┘
 */
export default function ExecutiveCurvedTemplate({
  data,
  accentColor = "#4a5568",
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const mainColor = accentColor;
  const blobDark = accentColor; // blob principale (foncée)
  const blobLight = mix(accentColor, 0.35); // blob secondaire (plus claire) pour effet de profondeur

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg relative overflow-hidden"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Lora', serif", color: TEXT_COLOR }}
    >
      {/* ─── Header avec 2 blobs organiques ──────────────────────────────── */}
      <header className="relative h-[105mm]">
        {/* Blob 1 — grande, foncée, couvre droite + bas du header */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 0,0
               L 800,0
               L 800,360
               C 720,405 600,395 480,355
               C 360,315 280,365 220,385
               C 160,400 100,375 0,365
               Z"
            fill={blobDark}
          />
        </svg>

        {/* Blob 2 — plus claire, plus petite, donne de la profondeur (haut-droite) */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 800,0
               L 800,280
               C 700,305 600,280 540,230
               C 480,180 470,90 530,30
               C 580,-20 700,-15 800,0
               Z"
            fill={blobLight}
            opacity="0.7"
          />
        </svg>

        {/* Photo squircle — position absolue selon coordonnées PPT (x=35mm, y=19mm) */}
        <div className="absolute z-10" style={{ left: "35mm", top: "19mm" }}>
          <PhotoSquircle photoUrl={data.photoUrl} fullName={data.fullName} accentColor={mainColor} />
        </div>

        {/* Nom + titre + intro — position absolue à droite de la photo */}
        <div
          className="absolute z-10 text-white"
          style={{ left: "115mm", top: "22mm", right: "15mm" }}
        >
          <h1
            className="font-bold uppercase leading-[0.95] tracking-tight"
            style={{ fontSize: "48px", letterSpacing: "0.02em" }}
          >
            {splitNameForDisplay(data.fullName)}
          </h1>
          <p
            className="mt-3 font-semibold uppercase tracking-[0.2em]"
            style={{ fontSize: "13px" }}
          >
            {data.title || "Votre titre"}
          </p>
          {data.professionalSummary && (
            <p className="mt-3 text-[11px] leading-snug max-w-[80mm] text-white/95">
              {data.professionalSummary}
            </p>
          )}
        </div>
      </header>

      {/* ─── Corps : sidebar (gauche) + main (droite) ──────────────────────── */}
      <div className="relative flex z-10 px-[12mm] py-[10mm] gap-[10mm]">
        {/* Sidebar gauche */}
        <aside className="w-[60mm] shrink-0 space-y-6">
          {/* Contact */}
          <section className="text-center">
            <SidebarTitle color={mainColor}>{L.contact}</SidebarTitle>
            <ul className="space-y-1 text-xs" style={{ color: TEXT_COLOR }}>
              {(data.city || data.country) && (
                <li>{[data.city, data.country].filter(Boolean).join(", ")}</li>
              )}
              {data.email && <li>{data.email}</li>}
              {data.phoneNumber && <li>{data.phoneNumber}</li>}
              {data.linkedin && <li className="break-all">{data.linkedin}</li>}
            </ul>
          </section>

          {/* Compétences */}
          {data.hardSkills.length > 0 && (
            <section className="text-center">
              <SidebarTitle color={mainColor}>{L.hardSkills}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.hardSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Langues */}
          {data.languages.length > 0 && (
            <section className="text-center">
              <SidebarTitle color={mainColor}>{L.languages}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.languages.map((l, i) => (
                  <li key={i}>
                    {l.name}
                    {l.level && (
                      <span style={{ color: TEXT_LIGHT }}>
                        {" ("}
                        {l.level.replace(/_/g, " ")}
                        {")"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Loisirs */}
          {data.interests.length > 0 && (
            <section className="text-center">
              <SidebarTitle color={mainColor}>{L.interests}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.interests.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Qualités (optionnel) */}
          {data.softSkills.length > 0 && (
            <section className="text-center">
              <SidebarTitle color={mainColor}>{L.softSkills}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.softSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 space-y-7">
          {/* Formations */}
          {data.education.length > 0 && (
            <section>
              <MainTitle color={mainColor}>{L.education}</MainTitle>
              <div className="space-y-1.5">
                {data.education.map((ed, i) => (
                  <article key={i} className="text-sm">
                    <span className="font-bold" style={{ color: mainColor }}>
                      {formatYear(ed.startDate) || formatYear(ed.endDate)}
                    </span>
                    {" – "}
                    <span className="font-semibold">
                      {ed.degree}
                      {ed.field && ` — ${ed.field}`}
                    </span>
                    {ed.school && (
                      <span style={{ color: TEXT_LIGHT }}> · {ed.school}</span>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Expériences */}
          {data.experiences.length > 0 && (
            <section>
              <MainTitle color={mainColor}>{L.experiences}</MainTitle>
              <div className="space-y-4">
                {data.experiences.map((exp, i) => (
                  <article key={i} className="flex gap-4">
                    <div className="w-[60px] shrink-0 text-xs pt-0.5 font-semibold" style={{ color: TEXT_COLOR }}>
                      <div>{formatDateShort(exp.startDate)}</div>
                      {exp.company && (
                        <div className="font-normal italic mt-1" style={{ color: TEXT_LIGHT }}>
                          {exp.company}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-sm font-bold uppercase tracking-wider mb-1"
                        style={{ color: mainColor }}
                      >
                        {exp.position}
                      </h3>
                      {exp.description && (
                        <ul className="space-y-0.5 text-xs leading-snug" style={{ color: TEXT_COLOR }}>
                          {exp.description.split("\n").map((line, j) => (
                            <li key={j} className="flex gap-2">
                              <span style={{ color: mainColor }}>·</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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
 * Photo en squircle (rectangle vertical à coins très arrondis).
 * Ratio ~3:4 pour matcher la maquette.
 */
function PhotoSquircle({
  photoUrl,
  fullName,
  accentColor,
}: {
  photoUrl?: string;
  fullName: string;
  accentColor: string;
}) {
  // Dimensions exactes selon le PPTX : 66mm × 64mm (presque carré)
  return (
    <div
      className="overflow-hidden bg-gray-200"
      style={{
        width: "66mm",
        height: "64mm",
        borderRadius: "18%",
        border: "3px solid white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
      }}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={fullName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {getInitials(fullName)}
        </div>
      )}
    </div>
  );
}

function SidebarTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2
      className="text-sm uppercase font-bold tracking-[0.25em] mb-2"
      style={{ color }}
    >
      {children}
    </h2>
  );
}

function MainTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2
      className="text-base uppercase font-bold tracking-[0.25em] mb-3 text-center"
      style={{ color }}
    >
      {children}
    </h2>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function splitNameForDisplay(fullName: string): React.ReactNode {
  const parts = (fullName || "Votre nom").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (
      <>
        {parts[0]}
        <br />
        {parts.slice(1).join(" ")}
      </>
    );
  }
  return parts[0];
}

function formatYear(d?: string): string {
  if (!d) return "";
  const m = d.match(/^(\d{4})/);
  return m ? m[1] : d;
}

function formatDateShort(d?: string): string {
  if (!d) return "";
  const m = d.match(/^(\d{4})-?(\d{2})?/);
  if (m) {
    const year = m[1];
    const month = m[2];
    if (month) return `${month}/${year}`;
    return year;
  }
  return d;
}
