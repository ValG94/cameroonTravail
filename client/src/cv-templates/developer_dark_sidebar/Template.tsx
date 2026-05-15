import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_DARK = "#000000";
const TEXT_LIGHT = "#5a5a5a";
const ACCENT_BLUE = "#5C7C8F"; // bleu-pétrole exact du PPT
const SIDEBAR_BG = "#0a0a0a";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Compétences",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Centres d'intérêts",
  experiences: "Expériences professionnelles",
  education: "Formations",
};

interface Props {
  data: CvTemplateData;
  accentColor?: string;
  labels?: CvSectionLabels;
}

/**
 * Template "Developer Dark Sidebar" — d'après le PPTX
 * "Noir et Blanc simple moderne développeur web CV homme.pptx"
 * (Benjamin Leroy - Développeur Web).
 *
 * Structure :
 * - Sidebar gauche NOIRE (78mm) avec photo en haut puis sections
 *   en TEXTE BLANC : Contact, Langues, Compétences, Centres d'intérêts
 * - Photo carrée en haut de la sidebar (occupe les ~95mm du haut)
 * - Colonne droite blanche :
 *   * Nom en GRANDS caractères noirs (Archivo Black, équivalent
 *     d'INTRO du PPT)
 *   * Sous-titre poste en bleu-pétrole (#5C7C8F) majuscules
 *   * Paragraphe d'intro
 *   * EXPÉRIENCES PROFESSIONNELLES :
 *     - titre poste noir bold
 *     - sous-titre entreprise en bleu-pétrole italique
 *     - bullets de description en noir
 *   * FORMATIONS : structure identique
 * - Ligne pointillée verticale au milieu pour séparer les 2 zones
 *
 * Police principale : Inter (Canva Sans du PPT, équivalent moderne).
 * Titre nom : Archivo Black (équivalent INTRO du PPT, ultra-bold condensé).
 */
export default function DeveloperDarkSidebarTemplate({
  data,
  accentColor: _accentColor = ACCENT_BLUE,
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const blue = _accentColor;

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg flex relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', sans-serif",
        color: TEXT_DARK,
      }}
    >
      {/* ─── Sidebar gauche noire ──────────────────────────────────── */}
      <aside
        className="w-[78mm] shrink-0 relative"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        {/* Photo carrée en haut (95mm de hauteur, prend toute la largeur) */}
        <div
          className="overflow-hidden"
          style={{
            width: "78mm",
            height: "95mm",
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
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
              {getInitials(data.fullName)}
            </div>
          )}
        </div>

        {/* Sections sidebar */}
        <div className="px-[10mm] py-[10mm] text-white space-y-7">
          {/* Contact (sans titre car format simple) */}
          <section>
            <ul
              className="space-y-1.5"
              style={{ fontSize: "9.5pt", color: "#ffffff" }}
            >
              {(data.city || data.country) && (
                <li>{[data.city, data.country].filter(Boolean).join(", ")}</li>
              )}
              {data.email && <li className="break-all">{data.email}</li>}
              {data.phoneNumber && <li>{data.phoneNumber}</li>}
              {data.linkedin && <li className="break-all">{data.linkedin}</li>}
            </ul>
          </section>

          {/* Langues */}
          {data.languages.length > 0 && (
            <SidebarSection title={L.languages}>
              <ul
                className="space-y-1"
                style={{ fontSize: "9.5pt", color: "#ffffff" }}
              >
                {data.languages.map((l, i) => (
                  <li key={i}>
                    {l.name}
                    {l.level && ` - ${l.level.replace(/_/g, " ")}`}
                  </li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {/* Compétences */}
          {data.hardSkills.length > 0 && (
            <SidebarSection title={L.hardSkills}>
              <ul
                className="space-y-1"
                style={{ fontSize: "9.5pt", color: "#ffffff" }}
              >
                {data.hardSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {/* Qualités (optionnel) */}
          {data.softSkills.length > 0 && (
            <SidebarSection title={L.softSkills}>
              <ul
                className="space-y-1"
                style={{ fontSize: "9.5pt", color: "#ffffff" }}
              >
                {data.softSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {/* Centres d'intérêts */}
          {data.interests.length > 0 && (
            <SidebarSection title={L.interests}>
              <ul
                className="space-y-1"
                style={{ fontSize: "9.5pt", color: "#ffffff" }}
              >
                {data.interests.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </SidebarSection>
          )}
        </div>
      </aside>

      {/* ─── Ligne verticale pointillée séparatrice ───────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "78mm",
          top: "15mm",
          bottom: "15mm",
          width: "0",
          borderLeft: "1px dashed rgba(0,0,0,0.2)",
        }}
        aria-hidden="true"
      />

      {/* ─── Colonne principale droite blanche ────────────────────── */}
      <main className="flex-1 px-[12mm] py-[14mm]">
        {/* Identité */}
        <header className="mb-7">
          <h1
            className="leading-[0.95] uppercase"
            style={{
              fontSize: "47pt",
              fontFamily: "'Archivo Black', 'Inter', sans-serif",
              color: TEXT_DARK,
              letterSpacing: "-0.01em",
            }}
          >
            {splitNameForDisplay(data.fullName)}
          </h1>
          {data.title && (
            <p
              className="mt-2 uppercase"
              style={{
                fontSize: "13pt",
                fontWeight: 700,
                color: blue,
                letterSpacing: "0.1em",
              }}
            >
              {data.title}
            </p>
          )}
          {data.professionalSummary && (
            <p
              className="mt-3 leading-relaxed"
              style={{ fontSize: "10pt", color: TEXT_DARK }}
            >
              {data.professionalSummary}
            </p>
          )}
        </header>

        {/* EXPÉRIENCES PROFESSIONNELLES */}
        {data.experiences.length > 0 && (
          <section className="mb-7">
            <SectionTitle blue={blue}>{L.experiences}</SectionTitle>
            <div className="space-y-4">
              {data.experiences.map((exp, i) => (
                <RightItem
                  key={i}
                  blue={blue}
                  title={exp.position}
                  meta={[
                    exp.company,
                    exp.location,
                    formatDateRange(exp.startDate, exp.endDate, exp.current),
                  ].filter(Boolean).join(" | ")}
                  description={exp.description}
                />
              ))}
            </div>
          </section>
        )}

        {/* FORMATIONS */}
        {data.education.length > 0 && (
          <section>
            <SectionTitle blue={blue}>{L.education}</SectionTitle>
            <div className="space-y-3">
              {data.education.map((ed, i) => (
                <RightItem
                  key={i}
                  blue={blue}
                  title={ed.degree + (ed.field ? ` ${ed.field}` : "")}
                  meta={[
                    ed.school,
                    formatDateRange(ed.startDate, ed.endDate),
                  ].filter(Boolean).join(" | ")}
                  description={ed.description}
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

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className="uppercase mb-2"
        style={{
          fontSize: "13pt",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.05em",
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
  blue,
}: {
  children: React.ReactNode;
  blue: string;
}) {
  return (
    <h2
      className="uppercase mb-3"
      style={{
        fontSize: "16pt",
        fontWeight: 700,
        color: blue,
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </h2>
  );
}

function RightItem({
  blue,
  title,
  meta,
  description,
}: {
  blue: string;
  title: string;
  meta?: string;
  description?: string;
}) {
  return (
    <article>
      <h3
        className="uppercase"
        style={{
          fontSize: "12pt",
          fontWeight: 700,
          color: TEXT_DARK,
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </h3>
      {meta && (
        <p
          className="mt-0.5 mb-1.5 italic"
          style={{ fontSize: "10pt", color: blue, fontWeight: 500 }}
        >
          {meta}
        </p>
      )}
      {description && (
        <ul className="space-y-0.5" style={{ fontSize: "10pt", color: TEXT_DARK }}>
          {description.split("\n").map((line, j) => (
            <li key={j} className="flex gap-2">
              <span style={{ color: TEXT_DARK }}>•</span>
              <span>{line}</span>
            </li>
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
  const e = current ? "Présent" : formatMonthYear(end);
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
      const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
      return `${months[parseInt(month) - 1] ?? ""} ${year}`;
    }
    return year;
  }
  return d;
}
