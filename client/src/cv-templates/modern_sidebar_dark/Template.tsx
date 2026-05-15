import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_DARK = "#1f2937";
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
 * Template "Modern Sidebar Dark" — d'après le PPTX
 * "CV jeune diplômé ingénieur professionnel simple avec photo.pptx"
 * (Théo Faure - Ingénieur).
 *
 *  ┌──────────┬─────────────────────────────────────────────────┐
 *  │ ▓▓▓▓▓▓▓▓ │                                                 │
 *  │ ▓photo▓▓ │           THÉO FAURE                            │
 *  │ ▓▓▓▓▓▓▓▓ │           INGENIEUR                             │
 *  │          │           Intro courte...                       │
 *  │ CONTACT  │                                                 │
 *  │ ─────    │           ─────── FORMATION ───────             │
 *  │ tel      │                                                 │
 *  │ email    │     2020 - Master spécialisé...                 │
 *  │ adresse  │     2019 - Licence...                           │
 *  │          │                                                 │
 *  │ COMPÉT.  │           ────── EXPÉRIENCES ──────             │
 *  │ ...      │                                                 │
 *  │          │     12/12/2024  Tempo                           │
 *  │ LANGUES  │                 CHARGÉ DE COMMUNICATION...      │
 *  │ ...      │                 · description                   │
 *  │          │                                                 │
 *  │ LOISIRS  │           ────── COMPÉTENCES ──────             │
 *  │ ...      │                                                 │
 *  │          │   PERSONNELLES        LOGICIELS                 │
 *  │          │   Esprit d'équipe     Logiciel 1                │
 *  │          │   Autonome            Logiciel 2                │
 *  └──────────┴─────────────────────────────────────────────────┘
 *
 * Sidebar quasi-noire (#111827 par défaut) sur toute la hauteur,
 * texte blanc. Côté droit blanc, texte foncé. Titres centrés en
 * majuscules avec letter-spacing très large.
 */
export default function ModernSidebarDarkTemplate({
  data,
  accentColor = "#111827",
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const sidebarBg = accentColor;

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg flex"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Poppins', sans-serif",
        color: TEXT_DARK,
      }}
    >
      {/* ─── Sidebar gauche sombre ──────────────────────────────────── */}
      <aside
        className="w-[83mm] shrink-0 px-[10mm] py-[12mm] text-white"
        style={{ backgroundColor: sidebarBg }}
      >
        {/* Photo carrée en haut */}
        <PhotoSquare photoUrl={data.photoUrl} fullName={data.fullName} />

        {/* CONTACT */}
        <SidebarSection title={L.contact}>
          <ul className="space-y-1.5 text-center" style={{ fontSize: "9pt" }}>
            {(data.city || data.country) && (
              <li>{[data.city, data.country].filter(Boolean).join(", ")}</li>
            )}
            {data.email && <li className="break-all">{data.email}</li>}
            {data.phoneNumber && <li>{data.phoneNumber}</li>}
            {data.linkedin && <li className="break-all">{data.linkedin}</li>}
          </ul>
        </SidebarSection>

        {/* COMPÉTENCES (sidebar) */}
        {data.hardSkills.length > 0 && (
          <SidebarSection title={L.hardSkills}>
            <ul className="space-y-1.5 text-center" style={{ fontSize: "9pt" }}>
              {data.hardSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </SidebarSection>
        )}

        {/* LANGUES */}
        {data.languages.length > 0 && (
          <SidebarSection title={L.languages}>
            <ul className="space-y-1.5 text-center" style={{ fontSize: "9pt" }}>
              {data.languages.map((l, i) => (
                <li key={i}>
                  {l.name}
                  {l.level && ` (${l.level.replace(/_/g, " ")})`}
                </li>
              ))}
            </ul>
          </SidebarSection>
        )}

        {/* LOISIRS */}
        {data.interests.length > 0 && (
          <SidebarSection title={L.interests}>
            <ul className="space-y-1.5 text-center" style={{ fontSize: "9pt" }}>
              {data.interests.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </SidebarSection>
        )}
      </aside>

      {/* ─── Colonne principale droite ─────────────────────────────── */}
      <main className="flex-1 px-[10mm] py-[14mm]">
        {/* Identité centrée */}
        <header className="text-center mb-7">
          <h1
            style={{
              fontSize: "32pt",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              lineHeight: "1.05",
              color: TEXT_DARK,
            }}
          >
            {(data.fullName || "Votre nom").toUpperCase()}
          </h1>
          {data.title && (
            <p
              className="uppercase mt-2"
              style={{
                fontSize: "21pt",
                letterSpacing: "0.4em",
                color: TEXT_LIGHT,
                fontWeight: 400,
              }}
            >
              {data.title}
            </p>
          )}
          {data.professionalSummary && (
            <p
              className="mt-4 mx-auto leading-relaxed italic"
              style={{
                fontSize: "9.5pt",
                color: TEXT_DARK,
                maxWidth: "100mm",
              }}
            >
              {data.professionalSummary}
            </p>
          )}
        </header>

        {/* FORMATION */}
        {data.education.length > 0 && (
          <section className="mb-6">
            <CenteredTitle>{L.education}</CenteredTitle>
            <div
              className="mx-auto space-y-1"
              style={{ fontSize: "10pt", maxWidth: "130mm" }}
            >
              {data.education.map((ed, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className="font-medium"
                    style={{ color: TEXT_DARK, width: "40px", flexShrink: 0 }}
                  >
                    {formatYear(ed.startDate) || formatYear(ed.endDate)}
                  </span>
                  <span style={{ color: TEXT_DARK }}>
                    -{" "}
                    <span className="font-medium">
                      {ed.degree}
                      {ed.field && ` ${ed.field}`}
                    </span>
                    {ed.school && (
                      <span style={{ color: TEXT_LIGHT }}> — {ed.school}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPÉRIENCES */}
        {data.experiences.length > 0 && (
          <section className="mb-6">
            <CenteredTitle>{L.experiences}</CenteredTitle>
            <div className="space-y-4">
              {data.experiences.map((exp, i) => (
                <ExperienceItem key={i} exp={exp} />
              ))}
            </div>
          </section>
        )}

        {/* COMPÉTENCES — bicolonne PERSONNELLES + LOGICIELS */}
        {(data.softSkills.length > 0 || data.hardSkills.length > 0) && (
          <section>
            <CenteredTitle>{L.hardSkills}</CenteredTitle>
            <div className="grid grid-cols-2 gap-x-12 mt-2">
              {/* PERSONNELLES = softSkills */}
              {data.softSkills.length > 0 && (
                <div>
                  <h3
                    className="mb-2 uppercase"
                    style={{
                      fontSize: "10pt",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      color: TEXT_DARK,
                    }}
                  >
                    Personnelles
                  </h3>
                  <ul className="space-y-1" style={{ fontSize: "9.5pt" }}>
                    {data.softSkills.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* LOGICIELS = hardSkills (re-affichées en colonne main pour matcher la maquette) */}
              {data.hardSkills.length > 0 && (
                <div>
                  <h3
                    className="mb-2 uppercase"
                    style={{
                      fontSize: "10pt",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      color: TEXT_DARK,
                    }}
                  >
                    Logiciels
                  </h3>
                  <ul className="space-y-1" style={{ fontSize: "9.5pt" }}>
                    {data.hardSkills.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhotoSquare({ photoUrl, fullName }: { photoUrl?: string; fullName: string }) {
  return (
    <div
      className="overflow-hidden mb-7 mx-auto"
      style={{
        width: "55mm",
        height: "55mm",
        border: "2px solid rgba(255,255,255,0.3)",
      }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          {getInitials(fullName)}
        </div>
      )}
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7 text-center">
      <h2
        className="uppercase mb-3"
        style={{
          fontSize: "13pt",
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: "#ffffff",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CenteredTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="uppercase text-center mb-4"
      style={{
        fontSize: "14.5pt",
        fontWeight: 700,
        letterSpacing: "0.5em",
        color: TEXT_DARK,
      }}
    >
      {children}
    </h2>
  );
}

function ExperienceItem({
  exp,
}: {
  exp: {
    company: string;
    position: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  };
}) {
  return (
    <article className="flex gap-3">
      {/* Date + entreprise à gauche */}
      <div className="w-[60px] shrink-0" style={{ fontSize: "8.5pt" }}>
        <div className="font-medium" style={{ color: TEXT_DARK }}>
          {formatDateShort(exp.startDate)}
        </div>
        {exp.company && (
          <div className="mt-0.5" style={{ color: TEXT_LIGHT, fontStyle: "italic" }}>
            {exp.company}
          </div>
        )}
      </div>
      {/* Poste + description à droite */}
      <div className="flex-1">
        <h3
          className="uppercase mb-1"
          style={{
            fontSize: "10pt",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: TEXT_DARK,
          }}
        >
          {exp.position}
        </h3>
        {exp.description && (
          <ul className="space-y-0.5" style={{ fontSize: "9pt", color: TEXT_DARK }}>
            {exp.description.split("\n").map((line, j) => (
              <li key={j} className="flex gap-1.5">
                <span style={{ color: TEXT_LIGHT }}>·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
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
