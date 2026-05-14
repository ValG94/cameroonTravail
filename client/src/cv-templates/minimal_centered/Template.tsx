import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_COLOR = "#1f2937";
const TEXT_LIGHT = "#6b7280";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Compétences",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Centres d'intérêt",
  experiences: "Expériences",
  education: "Formation",
};

interface Props {
  data: CvTemplateData;
  accentColor?: string;
  labels?: CvSectionLabels;
}

/**
 * Template "Minimal Centered" — d'après le PPTX
 * "CV Français Minimaliste Gris.pptx" (Théo Faure).
 *
 * Style purement typographique avec 2 bandeaux gris en haut/bas.
 * Fonts du PPT : Glacial Indifference + Poppins. Comme Glacial Indifference
 * n'est pas sur Google Fonts, on utilise Poppins pour les 2 (style
 * géométrique sans-serif équivalent).
 *
 *  ┌────────── ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ──────────┐  (bandeau gris haut)
 *  │                                       │
 *  │              T H É O                  │  (prénom espacé)
 *  │             FAURE                     │  (nom énorme bold)
 *  │              CONTACT                  │
 *  │           adresse...                  │
 *  │           email...                    │
 *  │           téléphone                   │
 *  │                                       │
 *  │   FORMATION         COMPÉTENCES       │
 *  │   ...               ...               │
 *  │              LANGUES                  │
 *  │           Français · Anglais          │
 *  │           EXPÉRIENCES                 │
 *  │   TEMPO             NOMADE            │
 *  │   ...               ...               │
 *  │                                       │
 *  └────────── ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ──────────┘  (bandeau gris bas)
 */
export default function MinimalCenteredTemplate({
  data,
  accentColor = "#3f3f46",
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const mainColor = accentColor;

  // Sépare prénom/nom pour le grand titre stylisé
  const nameParts = (data.fullName || "Votre nom").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Découpe les expériences en alternance pour la grille 2 colonnes
  const expCol1 = data.experiences.filter((_, i) => i % 2 === 0);
  const expCol2 = data.experiences.filter((_, i) => i % 2 === 1);

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Poppins', sans-serif",
        color: TEXT_COLOR,
      }}
    >
      {/* ─── Bandeau gris du haut (17.33cm large à x=1.84cm) ────────── */}
      <div
        className="absolute"
        style={{
          left: "18.4mm",
          top: "0",
          width: "173.3mm",
          height: "5.3mm",
          backgroundColor: mainColor,
        }}
      />

      {/* ─── Bandeau gris du bas ─────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: "18.4mm",
          bottom: "0",
          width: "173.3mm",
          height: "5.3mm",
          backgroundColor: mainColor,
        }}
      />

      {/* ─── Contenu principal ──────────────────────────────────────── */}
      <div style={{ padding: "20mm 18mm" }}>
        {/* En-tête centré : prénom espacé + nom énorme */}
        <header className="text-center mb-8 mt-4">
          {firstName && (
            <div
              style={{
                fontSize: "55pt",
                letterSpacing: "0.4em",
                color: mainColor,
                fontWeight: 300,
                lineHeight: "1",
                marginRight: "-0.4em" /* compense le tracking pour rester centré */,
              }}
            >
              {firstName.toUpperCase()}
            </div>
          )}
          {lastName && (
            <div
              style={{
                fontSize: "80pt",
                fontWeight: 700,
                color: mainColor,
                lineHeight: "0.95",
                letterSpacing: "0.02em",
                marginTop: "-8pt",
              }}
            >
              {lastName.toUpperCase()}
            </div>
          )}
          {data.title && (
            <p
              className="mt-3 text-sm uppercase"
              style={{
                color: TEXT_LIGHT,
                letterSpacing: "0.3em",
                fontSize: "10pt",
              }}
            >
              {data.title}
            </p>
          )}
        </header>

        {/* ─── CONTACT centré, items en colonne ──────────────────────── */}
        <section className="text-center mb-8">
          <SectionTitle color={mainColor} centered>
            {L.contact}
          </SectionTitle>
          <div
            className="space-y-0.5"
            style={{ fontSize: "9pt", color: TEXT_COLOR }}
          >
            {(data.city || data.country) && (
              <div>{[data.city, data.country].filter(Boolean).join(", ")}</div>
            )}
            {data.email && <div>{data.email}</div>}
            {data.phoneNumber && <div>{data.phoneNumber}</div>}
            {data.linkedin && <div>{data.linkedin}</div>}
          </div>
        </section>

        {/* Résumé optionnel */}
        {data.professionalSummary && (
          <div
            className="text-center italic mt-2 mb-8 max-w-[140mm] mx-auto leading-relaxed"
            style={{ color: TEXT_LIGHT, fontSize: "10pt" }}
          >
            {data.professionalSummary}
          </div>
        )}

        {/* ─── Formation + Compétences (bicolonne) ──────────────────── */}
        <div className="grid grid-cols-2 gap-x-12 mt-2">
          {data.education.length > 0 && (
            <div>
              <SectionTitle color={mainColor}>{L.education}</SectionTitle>
              <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
                {data.education.map((ed, i) => (
                  <li key={i}>
                    {(ed.startDate || ed.endDate) && (
                      <span style={{ color: mainColor }}>
                        {formatYear(ed.startDate) || formatYear(ed.endDate)}
                        {" - "}
                      </span>
                    )}
                    <span>
                      {ed.degree}
                      {ed.field && ` ${ed.field}`}
                    </span>
                    {ed.school && (
                      <span style={{ color: TEXT_LIGHT }}> · {ed.school}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.hardSkills.length > 0 && (
            <div>
              <SectionTitle color={mainColor}>{L.hardSkills}</SectionTitle>
              <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
                {data.hardSkills.map((s, i) => (
                  <li key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: mainColor }}>·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ─── Qualités + Centres d'intérêt (bicolonne, optionnels) ── */}
        {(data.softSkills.length > 0 || data.interests.length > 0) && (
          <div className="grid grid-cols-2 gap-x-12 mt-6">
            {data.softSkills.length > 0 ? (
              <div>
                <SectionTitle color={mainColor}>{L.softSkills}</SectionTitle>
                <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
                  {data.softSkills.map((s, i) => (
                    <li key={i} className="flex gap-2 items-baseline">
                      <span style={{ color: mainColor }}>·</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div />
            )}

            {data.interests.length > 0 && (
              <div>
                <SectionTitle color={mainColor}>{L.interests}</SectionTitle>
                <ul className="space-y-1.5" style={{ fontSize: "9pt" }}>
                  {data.interests.map((it, i) => (
                    <li key={i} className="flex gap-2 items-baseline">
                      <span style={{ color: mainColor }}>·</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ─── LANGUES centrées en colonne ──────────────────────────── */}
        {data.languages.length > 0 && (
          <section className="text-center mt-8">
            <SectionTitle color={mainColor} centered>
              {L.languages}
            </SectionTitle>
            <ul className="space-y-1" style={{ fontSize: "9pt", color: TEXT_COLOR }}>
              {data.languages.map((l, i) => (
                <li key={i}>
                  <span style={{ color: mainColor }}>· </span>
                  {l.name}
                  {l.level && ` (${l.level.replace(/_/g, " ")})`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ─── EXPÉRIENCES (bicolonne) ───────────────────────────────── */}
        {data.experiences.length > 0 && (
          <div className="mt-10">
            <SectionTitle color={mainColor} centered>
              {L.experiences}
            </SectionTitle>
            <div className="grid grid-cols-2 gap-x-12 gap-y-5">
              {[...expCol1, ...expCol2].map((exp, i) => (
                <ExperienceItem key={i} exp={exp} color={mainColor} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({
  children,
  color,
  centered,
}: {
  children: React.ReactNode;
  color: string;
  centered?: boolean;
}) {
  return (
    <h2
      className={`uppercase font-bold mb-3 ${centered ? "text-center" : ""}`}
      style={{
        color,
        fontSize: "24pt",
        letterSpacing: "0.15em",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 700,
      }}
    >
      {children}
    </h2>
  );
}

function ExperienceItem({
  exp,
  color,
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
  color: string;
}) {
  return (
    <article>
      <div className="flex items-baseline gap-2 mb-0.5">
        <h3
          className="uppercase"
          style={{
            color,
            fontSize: "14pt",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          {exp.company}
        </h3>
        {(exp.startDate || exp.endDate) && (
          <span style={{ color: TEXT_LIGHT, fontSize: "9pt" }}>
            {formatDateShort(exp.startDate)}
            {exp.endDate || exp.current ? (exp.current ? " - Auj." : ` - ${formatDateShort(exp.endDate)}`) : ""}
          </span>
        )}
      </div>
      {exp.position && (
        <p
          className="mb-1.5"
          style={{ fontSize: "10pt", color: TEXT_COLOR, fontWeight: 500 }}
        >
          {exp.position}
        </p>
      )}
      {exp.description && (
        <ul className="space-y-0.5" style={{ fontSize: "9pt", color: TEXT_COLOR }}>
          {exp.description.split("\n").map((line, j) => (
            <li key={j} className="flex gap-1.5">
              <span style={{ color }}>·</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
