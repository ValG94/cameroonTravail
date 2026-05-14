import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

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

/**
 * Template "Communication Minimaliste" — d'après le PPTX
 * "CV professionnel chargé de communication minimaliste bleu.pptx"
 * (Antoine Auclair).
 *
 *  Fond entier en bleu marine. Sidebar texte BLANC à gauche.
 *  Items expériences/formations en cartes BLANCHES sur le fond bleu.
 *  Ligne verticale pointillée séparant sidebar et main.
 *
 *  ┌───────────────────────────────────────────────────────────┐
 *  │ ▓▓▓ FOND BLEU MARINE COMPLET ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
 *  │  ┌──────┐                                                  │
 *  │  │photo │┊  ANTOINE AUCLAIR (blanc)                        │
 *  │  └──────┘┊  CHARGÉ DE COMMUNICATION                        │
 *  │          ┊  Intro...                                       │
 *  │ INFOS    ┊  ─────────                                      │
 *  │ ────     ┊  EXPÉRIENCES PROF.                              │
 *  │ tel      ┊  ┌──────────────────────────────────────────┐   │
 *  │ email    ┊  │ ● Chargé de Comm - Agence Tempo (foncé) │   │
 *  │ adresse  ┊  │   JANVIER 2018 - ACTUEL                  │   │
 *  │          ┊  │   Description...                         │   │
 *  │ COMPÉT.  ┊  └──────────────────────────────────────────┘   │
 *  │ ...      ┊  ...                                            │
 *  │ LANGUES  ┊  FORMATIONS                                     │
 *  │ ...      ┊  ...                                            │
 *  │ INTÉRÊTS ┊                                                 │
 *  │ ...      ┊                                                 │
 *  └───────────────────────────────────────────────────────────┘
 */
export default function HospitalityTimelineTemplate({
  data,
  accentColor = "#14215D",
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const bgColor = accentColor;

  return (
    <div
      id="cv-render-root"
      className="shadow-lg flex relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', sans-serif",
        backgroundColor: bgColor,
        color: "#ffffff",
      }}
    >
      {/* ─── Sidebar gauche (texte blanc sur fond bleu marine) ────── */}
      <aside className="w-[80mm] shrink-0 px-[10mm] py-[12mm] relative">
        {/* Photo carrée en haut */}
        <PhotoSquare photoUrl={data.photoUrl} fullName={data.fullName} />

        {/* INFORMATIONS */}
        <SidebarSection title={L.contact}>
          <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
            {data.phoneNumber && <li>{data.phoneNumber}</li>}
            {data.email && <li className="break-all">{data.email}</li>}
            {(data.city || data.country) && (
              <li>{[data.city, data.country].filter(Boolean).join(", ")}</li>
            )}
            {data.linkedin && <li className="break-all">{data.linkedin}</li>}
          </ul>
        </SidebarSection>

        {/* COMPÉTENCES */}
        {data.hardSkills.length > 0 && (
          <SidebarSection title={L.hardSkills}>
            <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
              {data.hardSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </SidebarSection>
        )}

        {/* QUALITÉS (optionnel) */}
        {data.softSkills.length > 0 && (
          <SidebarSection title={L.softSkills}>
            <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
              {data.softSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </SidebarSection>
        )}

        {/* LANGUES */}
        {data.languages.length > 0 && (
          <SidebarSection title={L.languages}>
            <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
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
          <SidebarSection title={L.interests}>
            <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
              {data.interests.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </SidebarSection>
        )}
      </aside>

      {/* ─── Ligne verticale pointillée séparatrice ────────────────── */}
      <div
        className="absolute top-[15mm] bottom-[15mm] pointer-events-none"
        style={{
          left: "80mm",
          width: "0",
          borderLeft: "1px dashed rgba(255,255,255,0.3)",
        }}
        aria-hidden="true"
      />

      {/* ─── Colonne principale droite ─────────────────────────────── */}
      <main className="flex-1 px-[12mm] py-[12mm] space-y-6">
        {/* Identité + intro (texte BLANC sur fond bleu) */}
        <header>
          <h1
            className="leading-tight"
            style={{
              fontSize: "32pt",
              fontWeight: 700,
              color: "#ffffff",
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
                color: "#ffffff",
              }}
            >
              {data.title}
            </p>
          )}
          {data.professionalSummary && (
            <p
              className="mt-3 leading-relaxed"
              style={{ fontSize: "9.5pt", color: "rgba(255,255,255,0.95)" }}
            >
              {data.professionalSummary}
            </p>
          )}
        </header>

        {/* EXPÉRIENCES PROFESSIONNELLES */}
        {data.experiences.length > 0 && (
          <section>
            <MainTitle>{L.experiences}</MainTitle>
            <div className="space-y-3">
              {data.experiences.map((exp, i) => (
                <WhiteCard
                  key={i}
                  bgColor={bgColor}
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
            <MainTitle>{L.education}</MainTitle>
            <div className="space-y-3">
              {data.education.map((ed, i) => (
                <WhiteCard
                  key={i}
                  bgColor={bgColor}
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

function PhotoSquare({ photoUrl, fullName }: { photoUrl?: string; fullName: string }) {
  return (
    <div
      className="overflow-hidden mb-7"
      style={{
        width: "60mm",
        height: "60mm",
        border: "2px solid rgba(255,255,255,0.4)",
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
    <section className="mb-6">
      <h2
        className="uppercase mb-2 pb-2 border-b text-white"
        style={{
          fontSize: "12pt",
          fontWeight: 700,
          letterSpacing: "0.1em",
          borderColor: "rgba(255,255,255,0.4)",
        }}
      >
        {title}
      </h2>
      <div className="text-white">{children}</div>
    </section>
  );
}

function MainTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="uppercase mb-3 pb-2 border-b text-white"
      style={{
        fontSize: "13pt",
        fontWeight: 700,
        letterSpacing: "0.1em",
        borderColor: "rgba(255,255,255,0.4)",
      }}
    >
      {children}
    </h2>
  );
}

/**
 * Carte blanche (sur le fond bleu) qui contient une expérience ou formation.
 * Petite puce ronde colorée à gauche, titre + date + description à droite.
 */
function WhiteCard({
  bgColor,
  title,
  date,
  description,
}: {
  bgColor: string;
  title: string;
  date?: string;
  description?: string;
}) {
  return (
    <article
      className="flex gap-3 px-4 py-3"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div
        className="shrink-0 mt-1.5"
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: bgColor,
        }}
      />
      <div className="flex-1">
        <h3
          style={{
            fontSize: "11pt",
            fontWeight: 700,
            color: bgColor,
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
              color: "#6b7280",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            {date}
          </p>
        )}
        {description && (
          <p
            className="leading-relaxed"
            style={{ fontSize: "9pt", color: "#374151" }}
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
