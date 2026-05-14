import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_COLOR = "#1f2937";
const TEXT_LIGHT = "#6b7280";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Informations",
  hardSkills: "Compétences",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Intérêts",
  experiences: "Expériences professionnelles",
  education: "Formations",
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
 * Template "Communication Minimaliste" (anciennement hospitality_timeline)
 * d'après le PPTX "CV professionnel chargé de communication minimaliste bleu.pptx".
 *
 * Structure :
 *  ┌─────────────────┬───────────────────────────────────────┐
 *  │   ▒▒▒▒▒▒▒▒▒▒    │                                       │
 *  │   ▒▒ photo ▒▒   │   Antoine Auclair (gros bleu)         │
 *  │   ▒▒▒▒▒▒▒▒▒▒    │   CHARGÉ DE COMMUNICATION             │
 *  │                 │   Paragraphe d'intro                   │
 *  │   INFORMATIONS  │                                       │
 *  │   ─────────     │                                       │
 *  │   téléphone     │   ━━━━━━ EXPÉRIENCES PROF. ━━━━━━     │
 *  │   email         │                                       │
 *  │   adresse       │   ●   Chargé de Communication         │
 *  │                 │       JANVIER 2018 - ACTUEL           │
 *  │   COMPÉTENCES   │       Description...                  │
 *  │   ─────────     │                                       │
 *  │   ...           │   ●   Assistant Chargé...             │
 *  │                 │       JUIN 2015 - DÉCEMBRE 2017       │
 *  │   LANGUES       │       Description...                  │
 *  │   ─────────     │                                       │
 *  │   ...           │   ━━━━━━━━ FORMATIONS ━━━━━━━━        │
 *  │                 │                                       │
 *  │   INTÉRÊTS      │   ●   Master en Communication...      │
 *  │   ─────────     │       2013 - 2015                     │
 *  │   ...           │       École...                        │
 *  └─────────────────┴───────────────────────────────────────┘
 *
 * Sidebar bleu marine (foncé) sur la gauche, contenu à droite sur fond blanc.
 * Puces rondes bleues à gauche de chaque expérience/formation.
 */
export default function HospitalityTimelineTemplate({
  data,
  accentColor = "#1e3a5f",
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const mainColor = accentColor;
  const sidebarBg = mix(accentColor, 0.92); // très clair (presque blanc bleuté)

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg flex"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', sans-serif",
        color: TEXT_COLOR,
      }}
    >
      {/* ─── Sidebar gauche ─────────────────────────────────────────── */}
      <aside
        className="w-[88mm] shrink-0 px-[10mm] py-[10mm]"
        style={{ backgroundColor: sidebarBg }}
      >
        {/* Photo carrée en haut */}
        <PhotoSquare photoUrl={data.photoUrl} fullName={data.fullName} accentColor={mainColor} />

        {/* INFORMATIONS */}
        <SidebarSection title={L.contact} color={mainColor}>
          <div className="space-y-1" style={{ fontSize: "9pt", color: TEXT_COLOR }}>
            {data.phoneNumber && <div>{data.phoneNumber}</div>}
            {data.email && <div className="break-all">{data.email}</div>}
            {(data.city || data.country) && (
              <div>{[data.city, data.country].filter(Boolean).join(", ")}</div>
            )}
            {data.linkedin && <div className="break-all">{data.linkedin}</div>}
          </div>
        </SidebarSection>

        {/* COMPÉTENCES */}
        {data.hardSkills.length > 0 && (
          <SidebarSection title={L.hardSkills} color={mainColor}>
            <ul className="space-y-1" style={{ fontSize: "9pt", color: TEXT_COLOR }}>
              {data.hardSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </SidebarSection>
        )}

        {/* QUALITÉS (optionnel) */}
        {data.softSkills.length > 0 && (
          <SidebarSection title={L.softSkills} color={mainColor}>
            <ul className="space-y-1" style={{ fontSize: "9pt", color: TEXT_COLOR }}>
              {data.softSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </SidebarSection>
        )}

        {/* LANGUES */}
        {data.languages.length > 0 && (
          <SidebarSection title={L.languages} color={mainColor}>
            <ul className="space-y-1" style={{ fontSize: "9pt", color: TEXT_COLOR }}>
              {data.languages.map((l, i) => (
                <li key={i}>
                  {l.name}
                  {l.level && ` (${l.level.replace(/_/g, " ")})`}
                </li>
              ))}
            </ul>
          </SidebarSection>
        )}

        {/* INTÉRÊTS */}
        {data.interests.length > 0 && (
          <SidebarSection title={L.interests} color={mainColor}>
            <ul className="space-y-1" style={{ fontSize: "9pt", color: TEXT_COLOR }}>
              {data.interests.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </SidebarSection>
        )}
      </aside>

      {/* ─── Colonne principale droite ─────────────────────────────── */}
      <main className="flex-1 px-[12mm] py-[15mm]">
        {/* Identité + intro */}
        <header className="mb-8">
          <h1
            className="leading-tight"
            style={{
              fontSize: "35pt",
              fontWeight: 700,
              color: mainColor,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {data.fullName || "Votre nom"}
          </h1>
          {data.title && (
            <p
              className="mt-1 uppercase"
              style={{
                fontSize: "13pt",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: mainColor,
              }}
            >
              {data.title}
            </p>
          )}
          {data.professionalSummary && (
            <p
              className="mt-3 leading-relaxed"
              style={{ fontSize: "9.5pt", color: TEXT_COLOR }}
            >
              {data.professionalSummary}
            </p>
          )}
        </header>

        {/* EXPÉRIENCES PROFESSIONNELLES */}
        {data.experiences.length > 0 && (
          <section className="mb-8">
            <MainTitle color={mainColor}>{L.experiences}</MainTitle>
            <div className="space-y-5">
              {data.experiences.map((exp, i) => (
                <TimelineItem
                  key={i}
                  color={mainColor}
                  title={exp.position + (exp.company ? ` - ${exp.company}` : "")}
                  date={formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  description={exp.description}
                />
              ))}
            </div>
          </section>
        )}

        {/* FORMATIONS */}
        {data.education.length > 0 && (
          <section>
            <MainTitle color={mainColor}>{L.education}</MainTitle>
            <div className="space-y-5">
              {data.education.map((ed, i) => (
                <TimelineItem
                  key={i}
                  color={mainColor}
                  title={ed.degree + (ed.field ? ` ${ed.field}` : "")}
                  date={formatDateRange(ed.startDate, ed.endDate)}
                  description={ed.school || ed.description}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhotoSquare({
  photoUrl,
  fullName,
  accentColor,
}: {
  photoUrl?: string;
  fullName: string;
  accentColor: string;
}) {
  return (
    <div
      className="overflow-hidden mb-6"
      style={{
        width: "60mm",
        height: "60mm",
        borderRadius: "2mm",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
          className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {getInitials(fullName)}
        </div>
      )}
    </div>
  );
}

function SidebarSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2
        className="uppercase mb-2 pb-2 border-b"
        style={{
          fontSize: "13pt",
          fontWeight: 700,
          color,
          borderColor: color,
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function MainTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2
      className="uppercase mb-4 pb-2 border-b-2"
      style={{
        fontSize: "14pt",
        fontWeight: 700,
        color,
        borderColor: color,
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </h2>
  );
}

/**
 * Item de timeline avec puce ronde à gauche, titre + date + description à droite.
 */
function TimelineItem({
  color,
  title,
  date,
  description,
}: {
  color: string;
  title: string;
  date?: string;
  description?: string;
}) {
  return (
    <article className="flex gap-4">
      {/* Puce ronde */}
      <div
        className="shrink-0 mt-1.5"
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      <div className="flex-1">
        <h3
          style={{
            fontSize: "11pt",
            fontWeight: 700,
            color,
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h3>
        {date && (
          <p
            className="uppercase mt-0.5 mb-1.5"
            style={{
              fontSize: "8.5pt",
              color: TEXT_LIGHT,
              letterSpacing: "0.1em",
            }}
          >
            {date}
          </p>
        )}
        {description && (
          <p
            className="leading-relaxed"
            style={{ fontSize: "9.5pt", color: TEXT_COLOR }}
          >
            {description}
          </p>
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

function formatDateRange(start?: string, end?: string, current?: boolean): string {
  const s = formatMonthYear(start);
  const e = current ? "ACTUEL" : formatMonthYear(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} - ${e}`;
}

function formatMonthYear(d?: string): string {
  if (!d) return "";
  const m = d.match(/^(\d{4})-?(\d{2})?/);
  if (m) {
    const year = m[1];
    const month = m[2];
    if (month) {
      const months = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
      return `${months[parseInt(month) - 1] ?? ""} ${year}`;
    }
    return year;
  }
  return d;
}
