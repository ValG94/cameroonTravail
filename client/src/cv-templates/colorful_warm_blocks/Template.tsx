import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_DARK = "#1a1a1a";
const TEXT_LIGHT = "#5a5a5a";
const CREAM_BG = "#ECE8E1";
const PURPLE_LIGHT = "#D4AFE9";
const PURPLE_DARK = "#BB98CE";
const ORANGE = "#F4AE31";
const YELLOW_ORANGE = "#FAB844";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Compétences techniques",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Centres d'intérêt",
  experiences: "Expériences professionnelles",
  education: "Formation",
};

interface Props {
  data: CvTemplateData;
  accentColor?: string;
  labels?: CvSectionLabels;
}

/**
 * Template "Colorful Warm Blocks" — d'après le PPTX
 * "CV Vie professionnelle en Crème Violet Orange style Vif Coloré.pptx"
 * (Mariam Chapuis - Comptabilité).
 *
 * Style "mosaïque colorée" : fond crème, blocs alternés violet/orange
 * pour chaque section, cartes pour expériences et formations.
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  ░░░░░░ FOND CRÈME ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
 *  │                                                           │
 *  │   MARIAM CHAPUIS    ┌────────┐                            │
 *  │   Lyon, France      │ photo  │                            │
 *  │   email | tel       │        │                            │
 *  │                     └────────┘                            │
 *  │                                                           │
 *  │  ░░░░░░ FORMATION (en blocs colorés) ░░░░░░░░░░░░░░░░░░░ │
 *  │   ▓▓▓▓ violet ▓▓▓▓▓▓                                      │
 *  │   │ 2029       │  BTS COMPTABILITÉ ET GESTION             │
 *  │   │ aujourd'hui│  Lycée Commercial Saint-Bloch            │
 *  │   ▓▓▓▓▓▓▓▓▓▓▓▓                                            │
 *  │   ▓▓▓▓ orange ▓▓▓▓▓▓                                      │
 *  │   │ 2027       │  BACCALAURÉAT STMG                       │
 *  │   ▓▓▓▓▓▓▓▓▓▓▓▓                                            │
 *  │                                                           │
 *  │  ░░░░░░ EXPÉRIENCES PRO (blocs alternés) ░░░░░░░░░░░░░░░ │
 *  │   ...                                                     │
 *  │                                                           │
 *  │  ░░░░░░ COMPÉTENCES, LANGUES, INTÉRÊTS ░░░░░░░░░░░░░░░░░ │
 *  │   ...                                                     │
 *  └──────────────────────────────────────────────────────────┘
 *
 * Police par défaut : Poppins (substitut de Koho du PPT, pas sur Google Fonts).
 * Le color picker pilote la couleur principale (par défaut violet pastel).
 * Les autres couleurs (orange, jaune) sont dérivées.
 */
export default function ColorfulWarmBlocksTemplate({
  data,
  accentColor = PURPLE_LIGHT,
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };

  return (
    <div
      id="cv-render-root"
      className="shadow-lg"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: CREAM_BG,
        color: TEXT_DARK,
      }}
    >
      <div className="px-[12mm] py-[14mm] space-y-7">
        {/* ─── Header : Nom + photo + contact ───────────────────── */}
        <header className="flex gap-6 items-start">
          {/* Identité à gauche */}
          <div className="flex-1 pt-2">
            <h1
              className="leading-[0.95] uppercase"
              style={{
                fontSize: "44pt",
                fontWeight: 700,
                color: TEXT_DARK,
                letterSpacing: "-0.01em",
              }}
            >
              {(data.fullName || "Votre nom").toUpperCase()}
            </h1>
            {data.title && (
              <p
                className="mt-2 uppercase"
                style={{
                  fontSize: "13pt",
                  fontWeight: 600,
                  color: TEXT_LIGHT,
                  letterSpacing: "0.05em",
                }}
              >
                {data.title}
              </p>
            )}
            {/* Contact en ligne */}
            <div
              className="flex flex-wrap gap-x-3 gap-y-1 mt-4"
              style={{ fontSize: "10pt", color: TEXT_DARK }}
            >
              {(data.city || data.country) && (
                <span>{[data.city, data.country].filter(Boolean).join(", ")}</span>
              )}
              {data.email && (
                <>
                  <span style={{ color: ORANGE }}>|</span>
                  <span>{data.email}</span>
                </>
              )}
              {data.phoneNumber && (
                <>
                  <span style={{ color: ORANGE }}>|</span>
                  <span>{data.phoneNumber}</span>
                </>
              )}
            </div>
            {/* Résumé */}
            {data.professionalSummary && (
              <p
                className="mt-3 leading-relaxed italic"
                style={{ fontSize: "10pt", color: TEXT_DARK }}
              >
                {data.professionalSummary}
              </p>
            )}
          </div>

          {/* Photo à droite */}
          {(data.photoUrl || data.fullName) && (
            <div
              className="shrink-0 overflow-hidden"
              style={{
                width: "55mm",
                height: "65mm",
                backgroundColor: TEXT_DARK,
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
          )}
        </header>

        {/* ─── FORMATION ─────────────────────────────────────────── */}
        {data.education.length > 0 && (
          <section>
            <SectionTitle accentColor={accentColor}>{L.education}</SectionTitle>
            <div className="space-y-3">
              {data.education.map((ed, i) => (
                <ColorBlock
                  key={i}
                  bgColor={i % 2 === 0 ? PURPLE_LIGHT : ORANGE}
                  dateBgColor={i % 2 === 0 ? ORANGE : PURPLE_DARK}
                  date={formatDateRange(ed.startDate, ed.endDate)}
                  title={ed.degree + (ed.field ? ` — ${ed.field}` : "")}
                  subtitle={ed.school}
                  description={ed.description}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── EXPÉRIENCES PROFESSIONNELLES ──────────────────────── */}
        {data.experiences.length > 0 && (
          <section>
            <SectionTitle accentColor={accentColor}>{L.experiences}</SectionTitle>
            <div className="space-y-3">
              {data.experiences.map((exp, i) => (
                <ColorBlock
                  key={i}
                  bgColor={i % 2 === 0 ? PURPLE_DARK : YELLOW_ORANGE}
                  dateBgColor={i % 2 === 0 ? ORANGE : PURPLE_LIGHT}
                  date={formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  title={exp.position}
                  subtitle={exp.company}
                  description={exp.description}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── COMPÉTENCES TECHNIQUES + INFORMATIQUE ─────────────── */}
        {(data.hardSkills.length > 0 || data.softSkills.length > 0) && (
          <section>
            <SectionTitle accentColor={accentColor}>{L.hardSkills}</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {data.hardSkills.length > 0 && (
                <SkillsBox bgColor={PURPLE_LIGHT}>
                  {data.hardSkills.map((s, i) => (
                    <li key={i} className="flex gap-2 items-baseline">
                      <span style={{ color: ORANGE, fontWeight: 700 }}>•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </SkillsBox>
              )}
              {data.softSkills.length > 0 && (
                <SkillsBox bgColor={YELLOW_ORANGE}>
                  {data.softSkills.map((s, i) => (
                    <li key={i} className="flex gap-2 items-baseline">
                      <span style={{ color: PURPLE_DARK, fontWeight: 700 }}>•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </SkillsBox>
              )}
            </div>
          </section>
        )}

        {/* ─── LANGUES + CENTRES D'INTÉRÊT ───────────────────────── */}
        {(data.languages.length > 0 || data.interests.length > 0) && (
          <section>
            <div className="grid grid-cols-2 gap-3">
              {data.languages.length > 0 && (
                <div>
                  <SectionTitle accentColor={accentColor}>{L.languages}</SectionTitle>
                  <SkillsBox bgColor={ORANGE}>
                    {data.languages.map((l, i) => (
                      <li key={i} className="flex gap-2 items-baseline">
                        <span style={{ color: PURPLE_DARK, fontWeight: 700 }}>•</span>
                        <span>
                          <strong>{l.name}</strong>
                          {l.level && ` — ${l.level.replace(/_/g, " ")}`}
                        </span>
                      </li>
                    ))}
                  </SkillsBox>
                </div>
              )}
              {data.interests.length > 0 && (
                <div>
                  <SectionTitle accentColor={accentColor}>{L.interests}</SectionTitle>
                  <SkillsBox bgColor={PURPLE_DARK}>
                    {data.interests.map((it, i) => (
                      <li key={i} className="flex gap-2 items-baseline">
                        <span style={{ color: YELLOW_ORANGE, fontWeight: 700 }}>•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </SkillsBox>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({
  children,
  accentColor: _accentColor,
}: {
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <h2
      className="uppercase mb-3 inline-block"
      style={{
        fontSize: "16pt",
        fontWeight: 700,
        color: TEXT_DARK,
        textDecoration: "underline",
        textDecorationThickness: "2px",
        textUnderlineOffset: "4px",
        textDecorationColor: ORANGE,
      }}
    >
      {children}
    </h2>
  );
}

/**
 * Bloc coloré avec : zone date à gauche (autre couleur) + contenu à droite.
 * Reproduit la structure des cartes du PPT (groupe date + groupe principal).
 */
function ColorBlock({
  bgColor,
  dateBgColor,
  date,
  title,
  subtitle,
  description,
}: {
  bgColor: string;
  dateBgColor: string;
  date?: string;
  title: string;
  subtitle?: string;
  description?: string;
}) {
  return (
    <article className="flex" style={{ minHeight: "30mm" }}>
      {/* Bandeau date à gauche */}
      {date && (
        <div
          className="shrink-0 px-3 py-3 flex items-center justify-center text-center"
          style={{
            backgroundColor: dateBgColor,
            width: "30mm",
            color: TEXT_DARK,
            fontSize: "10pt",
            fontWeight: 700,
            lineHeight: "1.2",
          }}
        >
          {date}
        </div>
      )}
      {/* Contenu principal */}
      <div className="flex-1 px-5 py-3" style={{ backgroundColor: bgColor }}>
        <h3
          className="uppercase"
          style={{
            fontSize: "14pt",
            fontWeight: 700,
            color: TEXT_DARK,
            letterSpacing: "0.01em",
            textDecoration: "underline",
            textDecorationThickness: "1px",
            textUnderlineOffset: "3px",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="uppercase mt-1 mb-2"
            style={{
              fontSize: "10pt",
              fontWeight: 600,
              color: TEXT_DARK,
              letterSpacing: "0.05em",
            }}
          >
            {subtitle}
          </p>
        )}
        {description && (
          <ul className="space-y-1" style={{ fontSize: "9.5pt", color: TEXT_DARK }}>
            {description.split("\n").map((line, j) => (
              <li key={j} className="flex gap-2">
                <span style={{ color: TEXT_DARK }}>•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function SkillsBox({
  bgColor,
  children,
}: {
  bgColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4" style={{ backgroundColor: bgColor }}>
      <ul className="space-y-1.5" style={{ fontSize: "10pt", color: TEXT_DARK }}>
        {children}
      </ul>
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

function formatDateRange(start?: string, end?: string, current?: boolean): string {
  const s = formatYearOrMonth(start);
  const e = current ? "Aujourd'hui" : formatYearOrMonth(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s}\n${e}`;
}

function formatYearOrMonth(d?: string): string {
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
