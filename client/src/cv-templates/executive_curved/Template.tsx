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

/**
 * Mixe un hex avec du blanc (0 = couleur pure, 1 = blanc).
 * Sert à dériver les variantes claires depuis l'accentColor.
 */
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
 *  │ ╱╲ blob organique haut-gauche      ╱╲ blob organique haut  │
 *  │ ╲ photo ovale ╱       CÉDRIC      ╲ droite (déborde)       │
 *  │              ╲       MULLER       ╱                        │
 *  │               ╲ DIR. MARKETING  ╱                          │
 *  ├──────────┬──────────────────────────────────────────────────┤
 *  │ CONTACT  │  COMPÉTENCES                                    │
 *  │ ...      │  ...                                             │
 *  │          │                                                  │
 *  │ COMPÉT.  │  FORMATION                                      │
 *  │ ...      │  ...                                             │
 *  │          │                                                  │
 *  │ LANGUES  │  EXPÉRIENCES                                    │
 *  │ ...      │  ...                                             │
 *  │          │                                                  │
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
  const blobColor = mix(accentColor, 0.05); // presque pure pour contraste
  const lightBg = mix(accentColor, 0.95); // très clair pour éventuels accents

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg relative overflow-hidden"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Lora', serif", color: TEXT_COLOR }}
    >
      {/* ─── Header avec blobs organiques ──────────────────────────────── */}
      <header className="relative h-[105mm] overflow-hidden">
        {/* Blob organique en haut à droite (déborde) */}
        <svg
          className="absolute top-0 right-0 pointer-events-none"
          width="60%"
          height="100%"
          viewBox="0 0 400 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 400,0 L 400,500 L 280,500 C 220,490 160,460 130,400 C 100,340 110,260 100,180 C 95,120 110,60 160,20 C 200,-10 280,-15 400,0 Z"
            fill={blobColor}
          />
        </svg>

        {/* Blob organique en haut à gauche (déborde, plus petit) */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width="40%"
          height="60%"
          viewBox="0 0 300 280"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -50,-50 L 250,-30 C 280,30 270,90 240,140 C 210,190 150,230 80,240 C 30,245 -20,220 -50,180 L -50,-50 Z"
            fill={blobColor}
          />
        </svg>

        {/* Contenu du header par-dessus les blobs */}
        <div className="relative z-10 h-full flex items-center px-[15mm] gap-[10mm]">
          {/* Photo ovale au centre */}
          <div className="shrink-0">
            <PhotoOvale photoUrl={data.photoUrl} fullName={data.fullName} accentColor={mainColor} />
          </div>

          {/* Nom + titre à droite */}
          <div className="flex-1 min-w-0 text-white">
            <h1
              className="font-bold uppercase leading-[0.95] tracking-tight"
              style={{ fontSize: "44px", letterSpacing: "0.02em" }}
            >
              {splitNameForDisplay(data.fullName)}
            </h1>
            <div
              className="mt-3 px-3 py-1 inline-block bg-white/20 backdrop-blur-sm"
              style={{ borderTop: "2px solid white", borderBottom: "2px solid white" }}
            >
              <p className="font-semibold uppercase tracking-[0.15em] text-sm">
                {data.title || "Votre titre"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Corps : sidebar (gauche) + main (droite) ──────────────────────── */}
      <div className="relative flex z-10 px-[12mm] py-[10mm] gap-[10mm]">
        {/* Sidebar gauche */}
        <aside className="w-[60mm] shrink-0 space-y-6">
          {/* Contact */}
          <section>
            <SidebarTitle color={mainColor}>{L.contact}</SidebarTitle>
            <ul className="space-y-1.5 text-xs break-words" style={{ color: TEXT_COLOR }}>
              {data.phoneNumber && <li>📞 {data.phoneNumber}</li>}
              {data.email && <li>✉ {data.email}</li>}
              {data.linkedin && <li>🌐 {data.linkedin}</li>}
              {(data.city || data.country) && (
                <li>📍 {[data.city, data.country].filter(Boolean).join(", ")}</li>
              )}
            </ul>
          </section>

          {/* Compétences (sidebar) */}
          {data.hardSkills.length > 0 && (
            <section>
              <SidebarTitle color={mainColor}>{L.hardSkills}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.hardSkills.map((s, i) => (
                  <li key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: mainColor }}>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Langues */}
          {data.languages.length > 0 && (
            <section>
              <SidebarTitle color={mainColor}>{L.languages}</SidebarTitle>
              <ul className="space-y-1.5 text-xs">
                {data.languages.map((l, i) => (
                  <li key={i}>
                    <div className="font-semibold" style={{ color: mainColor }}>
                      {l.name}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: TEXT_LIGHT }}
                    >
                      {l.level.replace(/_/g, " ")}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Loisirs */}
          {data.interests.length > 0 && (
            <section>
              <SidebarTitle color={mainColor}>{L.interests}</SidebarTitle>
              <ul className="space-y-1 text-xs">
                {data.interests.map((it, i) => (
                  <li key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: mainColor }}>•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 space-y-6">
          {/* Qualités (équivalent COMPÉTENCES dans le PPT, séparé des hard skills) */}
          {data.softSkills.length > 0 && (
            <section>
              <MainTitle color={mainColor}>{L.softSkills}</MainTitle>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {data.softSkills.map((s, i) => (
                  <div key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: mainColor }}>•</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Formations */}
          {data.education.length > 0 && (
            <section>
              <MainTitle color={mainColor}>{L.education}</MainTitle>
              <div className="space-y-2.5">
                {data.education.map((ed, i) => (
                  <article key={i} className="flex gap-3">
                    <div
                      className="w-[45px] shrink-0 text-[10px] text-right pt-0.5"
                      style={{ color: TEXT_LIGHT }}
                    >
                      <div>{formatDateShort(ed.startDate)}</div>
                      <div>{formatDateShort(ed.endDate)}</div>
                    </div>
                    <div
                      className="w-[2px] shrink-0 mt-1"
                      style={{ backgroundColor: mainColor, minHeight: "30px" }}
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold" style={{ color: mainColor }}>
                        {ed.degree}
                        {ed.field && ` — ${ed.field}`}
                      </h3>
                      <div className="text-xs italic" style={{ color: TEXT_LIGHT }}>
                        {ed.school}
                      </div>
                      {ed.description && (
                        <p className="text-xs mt-1" style={{ color: TEXT_COLOR }}>
                          {ed.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Expériences */}
          {data.experiences.length > 0 && (
            <section>
              <MainTitle color={mainColor}>{L.experiences}</MainTitle>
              <div className="space-y-3">
                {data.experiences.map((exp, i) => (
                  <article key={i} className="flex gap-3">
                    <div
                      className="w-[45px] shrink-0 text-[10px] text-right pt-0.5"
                      style={{ color: TEXT_LIGHT }}
                    >
                      <div>{formatDateShort(exp.startDate)}</div>
                      <div>{exp.current ? "Auj." : formatDateShort(exp.endDate)}</div>
                    </div>
                    <div
                      className="w-[2px] shrink-0 mt-1"
                      style={{ backgroundColor: mainColor, minHeight: "30px" }}
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold" style={{ color: mainColor }}>
                        {exp.position}
                      </h3>
                      <div className="text-xs italic" style={{ color: TEXT_LIGHT }}>
                        {exp.company}
                        {exp.location && ` · ${exp.location}`}
                      </div>
                      {exp.description && (
                        <p className="text-xs mt-1 leading-snug" style={{ color: TEXT_COLOR }}>
                          {exp.description}
                        </p>
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

function PhotoOvale({
  photoUrl,
  fullName,
  accentColor,
}: {
  photoUrl?: string;
  fullName: string;
  accentColor: string;
}) {
  // Ovale vertical (ellipse 60×80 ratio ~3:4)
  const id = `oval-clip-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <svg viewBox="0 0 100 130" width="120" height="156" className="block">
      <defs>
        <clipPath id={id}>
          <ellipse cx="50" cy="65" rx="48" ry="63" />
        </clipPath>
      </defs>
      {photoUrl ? (
        <image
          href={photoUrl}
          width="100"
          height="130"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${id})`}
        />
      ) : (
        <>
          <ellipse cx="50" cy="65" rx="48" ry="63" fill={accentColor} opacity="0.3" />
          <text
            x="50"
            y="73"
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill="white"
            fontFamily="system-ui"
          >
            {getInitials(fullName)}
          </text>
        </>
      )}
      <ellipse cx="50" cy="65" rx="48" ry="63" fill="none" stroke="white" strokeWidth="3" />
    </svg>
  );
}

function SidebarTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2
      className="text-sm uppercase font-bold tracking-[0.18em] mb-2 pb-1 border-b"
      style={{ color, borderColor: color }}
    >
      {children}
    </h2>
  );
}

function MainTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="mb-3 pb-1 border-b-2" style={{ borderColor: color }}>
      <h2
        className="text-base uppercase font-bold tracking-[0.18em]"
        style={{ color }}
      >
        {children}
      </h2>
    </div>
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

/**
 * Affiche le nom sur 2 lignes (prénom / nom) avec une coupure pour
 * imiter la maquette CÉDRIC / MULLER.
 * Si nom vide, juste le prénom sur 2 lignes selon la longueur.
 */
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

function formatDateShort(d?: string): string {
  if (!d) return "";
  const m = d.match(/^(\d{4})-?(\d{2})?/);
  if (m) {
    const year = m[1];
    const month = m[2];
    if (month) {
      const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
      return `${months[parseInt(month) - 1] ?? ""}/${year}`;
    }
    return year;
  }
  return d;
}
