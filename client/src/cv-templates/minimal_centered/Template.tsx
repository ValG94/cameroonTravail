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
 * Style purement typographique, sans photo, sans bandeau coloré.
 *
 *  ┌──────────────────────────────────────────────────┐
 *  │                                                  │
 *  │                    THÉO                          │  (titre prénom)
 *  │                  F A U R E                       │  (énorme nom)
 *  │                                                  │
 *  │                  CONTACT                         │
 *  │     adresse · email · téléphone                  │
 *  │                                                  │
 *  │  ────────────       ────────────                 │
 *  │  FORMATION          COMPÉTENCES                  │
 *  │  ...                ...                          │
 *  │                                                  │
 *  │                  LANGUES                         │
 *  │      Français · Anglais                          │
 *  │                                                  │
 *  │  ────────────       ────────────                 │
 *  │  EXPÉRIENCES                                     │
 *  │  TEMPO              NOMADE                       │
 *  │  ...                ...                          │
 *  └──────────────────────────────────────────────────┘
 */
export default function MinimalCenteredTemplate({
  data,
  accentColor = "#1f2937",
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const mainColor = accentColor;

  // Sépare prénom/nom pour le grand titre stylisé
  const nameParts = (data.fullName || "Votre nom").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Découpe les expériences en 2 colonnes pour la mise en page symétrique
  const expCol1 = data.experiences.filter((_, i) => i % 2 === 0);
  const expCol2 = data.experiences.filter((_, i) => i % 2 === 1);

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Lora', serif",
        color: TEXT_COLOR,
        padding: "20mm 18mm",
      }}
    >
      {/* ─── En-tête : grand titre prénom/nom centré ─────────────────── */}
      <header className="text-center mb-10">
        {firstName && (
          <div
            className="font-light tracking-[0.4em] uppercase"
            style={{ fontSize: "32px", color: mainColor }}
          >
            {firstName}
          </div>
        )}
        {lastName && (
          <div
            className="font-extrabold leading-none uppercase mt-1"
            style={{
              fontSize: "84px",
              letterSpacing: "0.05em",
              color: mainColor,
            }}
          >
            {lastName}
          </div>
        )}
        {data.title && (
          <p
            className="mt-3 text-sm uppercase tracking-[0.3em]"
            style={{ color: TEXT_LIGHT }}
          >
            {data.title}
          </p>
        )}
      </header>

      {/* ─── Contact centré ──────────────────────────────────────────── */}
      <CenteredSection title={L.contact} color={mainColor}>
        <div className="text-xs flex flex-wrap justify-center gap-x-3 gap-y-1" style={{ color: TEXT_COLOR }}>
          {(data.city || data.country) && (
            <span>{[data.city, data.country].filter(Boolean).join(", ")}</span>
          )}
          {data.email && (
            <>
              <Separator />
              <span>{data.email}</span>
            </>
          )}
          {data.phoneNumber && (
            <>
              <Separator />
              <span>{data.phoneNumber}</span>
            </>
          )}
          {data.linkedin && (
            <>
              <Separator />
              <span>{data.linkedin}</span>
            </>
          )}
        </div>
      </CenteredSection>

      {/* ─── Résumé / accroche (optionnel, centré italique) ─────────── */}
      {data.professionalSummary && (
        <div
          className="text-center text-sm italic mt-6 mb-2 max-w-[140mm] mx-auto leading-relaxed"
          style={{ color: TEXT_LIGHT }}
        >
          {data.professionalSummary}
        </div>
      )}

      {/* ─── Formation + Compétences (bicolonne) ─────────────────────── */}
      <div className="grid grid-cols-2 gap-x-12 mt-10">
        {data.education.length > 0 && (
          <div>
            <SectionTitle color={mainColor}>{L.education}</SectionTitle>
            <ul className="space-y-1.5 text-xs">
              {data.education.map((ed, i) => (
                <li key={i}>
                  {(ed.startDate || ed.endDate) && (
                    <span className="font-bold" style={{ color: mainColor }}>
                      {formatYear(ed.startDate) || formatYear(ed.endDate)} —{" "}
                    </span>
                  )}
                  <span className="font-semibold">
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
            <ul className="space-y-1.5 text-xs">
              {data.hardSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ─── Qualités + Centres d'intérêt (bicolonne, optionnels) ───── */}
      {(data.softSkills.length > 0 || data.interests.length > 0) && (
        <div className="grid grid-cols-2 gap-x-12 mt-8">
          {data.softSkills.length > 0 ? (
            <div>
              <SectionTitle color={mainColor}>{L.softSkills}</SectionTitle>
              <ul className="space-y-1.5 text-xs">
                {data.softSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div />
          )}

          {data.interests.length > 0 && (
            <div>
              <SectionTitle color={mainColor}>{L.interests}</SectionTitle>
              <ul className="space-y-1.5 text-xs">
                {data.interests.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ─── Langues centrées ──────────────────────────────────────── */}
      {data.languages.length > 0 && (
        <CenteredSection title={L.languages} color={mainColor} className="mt-8">
          <ul className="text-xs flex flex-wrap justify-center gap-x-3 gap-y-1" style={{ color: TEXT_COLOR }}>
            {data.languages.map((l, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span>
                  {l.name}
                  {l.level && (
                    <span style={{ color: TEXT_LIGHT }}>
                      {" ("}
                      {l.level.replace(/_/g, " ")}
                      {")"}
                    </span>
                  )}
                </span>
                {i < data.languages.length - 1 && <Separator />}
              </li>
            ))}
          </ul>
        </CenteredSection>
      )}

      {/* ─── Expériences (bicolonne) ────────────────────────────────── */}
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
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CenteredSection({
  title,
  color,
  className,
  children,
}: {
  title: string;
  color: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`text-center ${className ?? ""}`}>
      <SectionTitle color={color} centered>
        {title}
      </SectionTitle>
      {children}
    </section>
  );
}

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
      className={`text-sm uppercase font-bold tracking-[0.3em] mb-3 ${
        centered ? "text-center" : ""
      }`}
      style={{ color }}
    >
      {children}
    </h2>
  );
}

function Separator() {
  return <span style={{ color: TEXT_LIGHT }}>·</span>;
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
      <div className="flex items-baseline justify-between gap-2 mb-0.5">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color }}>
          {exp.company}
        </h3>
        <div className="text-[10px] shrink-0" style={{ color: TEXT_LIGHT }}>
          {formatDateShort(exp.startDate)}
          {(exp.endDate || exp.current) && (
            <>
              {" "}
              <br />
              {exp.current ? "Auj." : formatDateShort(exp.endDate)}
            </>
          )}
        </div>
      </div>
      {exp.position && (
        <p className="text-xs italic mb-1" style={{ color: TEXT_COLOR }}>
          {exp.position}
        </p>
      )}
      {exp.description && (
        <ul className="space-y-0.5 text-[11px] leading-snug" style={{ color: TEXT_COLOR }}>
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
