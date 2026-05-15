import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_DARK = "#1a1a1a";
const TEXT_LIGHT = "#5a5a5a";
const ORANGE = "#FDBE26"; // safran/jaune-orange exact du PPT
const SIDEBAR_BG = "#0a0a0a";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contactez-moi",
  hardSkills: "Compétences connexes",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Centres d'intérêt",
  experiences: "Expérience professionnelle",
  education: "Formation",
};

interface Props {
  data: CvTemplateData;
  accentColor?: string;
  labels?: CvSectionLabels;
}

/**
 * Template "Sport Orange & Noir" — d'après le PPTX
 * "Orange et Noir Sports Sportif Entraîneur CV.pptx" (Alain Amari -
 * Entraîneur Sportif).
 *
 * Caractéristiques :
 * - Sidebar gauche NOIRE avec image sportive grisée en background
 *   (/cv-templates/sport-bg.png en opacity ~25%)
 * - Photo en haut de la sidebar dans cadre orange (border)
 * - Nom "ALAIN AMARI" en énorme blanc + sous-titre poste
 * - Sections sidebar : Quelques infos, Compétences connexes, Contactez-moi
 * - Colonne droite blanche avec :
 *   * EXPÉRIENCE PROFESSIONNELLE (titre orange souligné)
 *   * FORMATION
 *   * RÉFÉRENCES
 *
 * Police : League Spartan (équivalent Cooper Hewitt Heavy du PPT,
 * sur Google Fonts) pour les titres + Open Sans pour le corps.
 */
export default function SportOrangeDarkTemplate({
  data,
  accentColor: _accentColor = ORANGE,
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const orange = _accentColor;

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg flex relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Open Sans', sans-serif",
        color: TEXT_DARK,
      }}
    >
      {/* ─── Sidebar gauche : bloc orange (haut) + bloc noir (bas) ── */}
      <aside className="w-[88mm] shrink-0 relative overflow-hidden">
        {/* Bloc ORANGE en haut (cadre photo + nom) */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            backgroundColor: orange,
            height: "115mm",
          }}
          aria-hidden="true"
        />

        {/* Bloc NOIR en bas avec image background grisée */}
        <div
          className="absolute left-0 right-0 bottom-0 overflow-hidden"
          style={{
            backgroundColor: SIDEBAR_BG,
            top: "115mm",
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(/cv-templates/sport-bg.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.18,
              filter: "grayscale(100%)",
            }}
          />
        </div>

        {/* Contenu sidebar par-dessus les blocs */}
        <div className="relative z-10 px-[8mm] pt-[10mm] pb-[10mm]">
          {/* Photo (sur le bloc orange — laisse une marge orange autour) */}
          <div
            className="overflow-hidden mx-auto"
            style={{
              width: "62mm",
              height: "78mm",
              backgroundColor: "#1a1a1a",
            }}
          >
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt={data.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                {getInitials(data.fullName)}
              </div>
            )}
          </div>

          {/* Nom — sous la photo, chevauche la transition orange/noir */}
          <div className="mt-3 text-white">
            <h1
              className="leading-[0.92] uppercase"
              style={{
                fontSize: "32pt",
                fontFamily: "'League Spartan', sans-serif",
                fontWeight: 900,
                letterSpacing: "0.02em",
                color: "#ffffff",
              }}
            >
              {splitNameForDisplay(data.fullName)}
            </h1>
            {data.title && (
              <p
                className="mt-2 uppercase text-center"
                style={{
                  fontSize: "11pt",
                  fontWeight: 600,
                  color: "#ffffff",
                  letterSpacing: "0.18em",
                }}
              >
                {data.title}
              </p>
            )}
          </div>

          {/* Quelques informations à mon sujet */}
          {data.professionalSummary && (
            <SidebarSection title="Quelques informations à mon sujet" orange={orange}>
              <p
                className="leading-relaxed"
                style={{ fontSize: "9pt", color: "#ffffff" }}
              >
                {data.professionalSummary}
              </p>
            </SidebarSection>
          )}

          {/* Compétences connexes */}
          {data.hardSkills.length > 0 && (
            <SidebarSection title={L.hardSkills} orange={orange}>
              <ul className="space-y-1" style={{ fontSize: "9pt", color: "#ffffff" }}>
                {data.hardSkills.map((s, i) => (
                  <li key={i}>- {s}</li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {/* Qualités (optionnel) */}
          {data.softSkills.length > 0 && (
            <SidebarSection title={L.softSkills} orange={orange}>
              <ul className="space-y-1" style={{ fontSize: "9pt", color: "#ffffff" }}>
                {data.softSkills.map((s, i) => (
                  <li key={i}>- {s}</li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {/* Langues (optionnel) */}
          {data.languages.length > 0 && (
            <SidebarSection title={L.languages} orange={orange}>
              <ul className="space-y-1" style={{ fontSize: "9pt", color: "#ffffff" }}>
                {data.languages.map((l, i) => (
                  <li key={i}>
                    - {l.name}
                    {l.level && ` (${l.level.replace(/_/g, " ")})`}
                  </li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {/* Contactez-moi */}
          <SidebarSection title={L.contact} orange={orange}>
            <ul className="space-y-0.5" style={{ fontSize: "9pt", color: "#ffffff" }}>
              {data.phoneNumber && <li>{data.phoneNumber}</li>}
              {data.email && <li className="break-all">{data.email}</li>}
              {(data.city || data.country) && (
                <li>{[data.city, data.country].filter(Boolean).join(", ")}</li>
              )}
              {data.linkedin && <li className="break-all">{data.linkedin}</li>}
            </ul>
          </SidebarSection>
        </div>
      </aside>

      {/* ─── Colonne principale droite ─────────────────────────────── */}
      <main className="flex-1 px-[12mm] py-[14mm]">
        {/* EXPÉRIENCE PROFESSIONNELLE */}
        {data.experiences.length > 0 && (
          <section className="mb-7">
            <SectionTitle orange={orange}>{L.experiences}</SectionTitle>
            <div className="space-y-4">
              {data.experiences.map((exp, i) => (
                <RightItem
                  key={i}
                  title={exp.position}
                  meta={[
                    exp.company,
                    formatDateRange(exp.startDate, exp.endDate, exp.current),
                  ].filter(Boolean).join(" | ")}
                  description={exp.description}
                />
              ))}
            </div>
          </section>
        )}

        {/* FORMATION */}
        {data.education.length > 0 && (
          <section className="mb-7">
            <SectionTitle orange={orange}>{L.education}</SectionTitle>
            <div className="space-y-3">
              {data.education.map((ed, i) => (
                <RightItem
                  key={i}
                  title={ed.school || ""}
                  meta={[
                    ed.degree + (ed.field ? ` ${ed.field}` : ""),
                    formatDateRange(ed.startDate, ed.endDate),
                  ].filter(Boolean).join(" | ")}
                  description={ed.description}
                />
              ))}
            </div>
          </section>
        )}

        {/* CENTRES D'INTÉRÊT (optionnel) */}
        {data.interests.length > 0 && (
          <section>
            <SectionTitle orange={orange}>{L.interests}</SectionTitle>
            <ul style={{ fontSize: "10pt", color: TEXT_DARK }} className="space-y-1">
              {data.interests.map((it, i) => (
                <li key={i}>- {it}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SidebarSection({
  title,
  orange,
  children,
}: {
  title: string;
  orange: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2
        className="uppercase mb-2 pb-1 border-b"
        style={{
          fontSize: "10pt",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.18em",
          borderColor: orange,
          fontFamily: "'League Spartan', sans-serif",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SectionTitle({
  children,
  orange,
}: {
  children: React.ReactNode;
  orange: string;
}) {
  return (
    <div className="mb-3">
      <h2
        className="uppercase pb-1.5 border-b-2"
        style={{
          fontSize: "14pt",
          fontWeight: 700,
          color: TEXT_DARK,
          letterSpacing: "0.1em",
          borderColor: orange,
          fontFamily: "'League Spartan', sans-serif",
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function RightItem({
  title,
  meta,
  description,
}: {
  title: string;
  meta?: string;
  description?: string;
}) {
  return (
    <article>
      <h3
        className="uppercase"
        style={{
          fontSize: "11pt",
          fontWeight: 700,
          color: TEXT_DARK,
          letterSpacing: "0.05em",
          fontFamily: "'League Spartan', sans-serif",
        }}
      >
        {title}
      </h3>
      {meta && (
        <p
          className="mt-0.5 mb-1"
          style={{ fontSize: "9pt", color: TEXT_LIGHT, fontWeight: 600 }}
        >
          {meta}
        </p>
      )}
      {description && (
        <ul className="space-y-0.5" style={{ fontSize: "9pt", color: TEXT_DARK }}>
          {description.split("\n").map((line, j) => (
            <li key={j}>- {line}</li>
          ))}
        </ul>
      )}
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

function formatDateRange(start?: string, end?: string, current?: boolean): string {
  const s = formatMonthYear(start);
  const e = current ? "présent" : formatMonthYear(end);
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
      const months = ["janv", "févr", "mars", "avril", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
      return `${months[parseInt(month) - 1] ?? ""} ${year}`;
    }
    return year;
  }
  return d;
}
