import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_DARK = "#1a1a1a";
const TEXT_LIGHT = "#6b6b6b";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Skills",
  softSkills: "Qualities",
  languages: "Languages",
  interests: "Interests",
  experiences: "Experience",
  education: "Education",
};

interface Props {
  data: CvTemplateData;
  accentColor?: string;
  labels?: CvSectionLabels;
}

/**
 * Template "Professional Modern White" — d'après le PPTX
 * "White professional modern CV resume.pptx" (Connor Hamilton).
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  ┌──────────┐ │                                          │
 *  │  │  photo   │ │  ─── Education ────────────              │
 *  │  │ (forme   │ │  ● Bachelor of Business Mgmt   2016-2020 │
 *  │  │ courbée) │ │    Borcelle University                   │
 *  │  └──────────┘ │    Lorem ipsum...                        │
 *  │     ▓▓ orange │                                          │
 *  │               │  ● Bachelor of Business Mgmt   2020-2023 │
 *  │  Connor       │    ...                                   │
 *  │  Hamilton     │                                          │
 *  │  Marketing Mgr│  ─── Experience ───────────              │
 *  │               │  ● Product Design Manager      2016-2020 │
 *  │  ─ About Me ─ │    Arowwai Industries                    │
 *  │  Lorem ipsum  │    Description...                        │
 *  │               │                                          │
 *  │  ─ Skills ──  │  ● Marketing Manager           2019-2020 │
 *  │  · Mgmt       │    ...                                   │
 *  │  · Creativity │                                          │
 *  │  · ...        │                                          │
 *  │               │                                          │
 *  │  ─ References │                                          │
 *  │  Harumi K.   Bailey D.                                   │
 *  │  Wardiere /  Wardiere /                                  │
 *  │  CEO         CEO                                         │
 *  └──────────────────────────────────────────────────────────┘
 *
 * - Colonne gauche : photo (cadre courbé + accent orange) + identité
 *   + About + Skills + References (en bicolonne)
 * - Colonne droite : Education + Experience avec puces rondes
 * - Ligne verticale séparatrice entre les 2 colonnes
 * - Police Montserrat. Accent par défaut orange (#f97316).
 */
export default function ProfessionalModernWhiteTemplate({
  data,
  accentColor = "#f97316",
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Montserrat', sans-serif",
        color: TEXT_DARK,
      }}
    >
      {/* Ligne verticale séparatrice (entre les 2 colonnes) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "92mm",
          top: "30mm",
          bottom: "20mm",
          width: "0",
          borderLeft: "1px solid #d4d4d4",
        }}
        aria-hidden="true"
      />

      <div className="flex h-full">
        {/* ─── Colonne gauche ──────────────────────────────────── */}
        <aside className="w-[92mm] shrink-0 px-[12mm] pt-[12mm] pb-[12mm]">
          {/* Photo dans cadre courbé + accent orange */}
          <PhotoFramedWithAccent photoUrl={data.photoUrl} fullName={data.fullName} accentColor={accentColor} />

          {/* Identité */}
          <div className="mt-7">
            <h1
              style={{
                fontSize: "33pt",
                fontWeight: 700,
                lineHeight: "1.05",
                letterSpacing: "-0.01em",
                color: TEXT_DARK,
              }}
            >
              {splitNameForDisplay(data.fullName)}
            </h1>
            {data.title && (
              <p
                className="mt-1"
                style={{
                  fontSize: "13.5pt",
                  fontWeight: 400,
                  color: TEXT_LIGHT,
                }}
              >
                {data.title}
              </p>
            )}
          </div>

          {/* About Me */}
          {data.professionalSummary && (
            <SectionLeft title="About Me" mt="mt-7">
              <p
                className="leading-relaxed"
                style={{ fontSize: "9.5pt", color: TEXT_DARK }}
              >
                {data.professionalSummary}
              </p>
            </SectionLeft>
          )}

          {/* Skills */}
          {data.hardSkills.length > 0 && (
            <SectionLeft title={L.hardSkills} mt="mt-6">
              <ul className="space-y-1" style={{ fontSize: "9.5pt" }}>
                {data.hardSkills.map((s, i) => (
                  <li key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: TEXT_DARK }}>·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </SectionLeft>
          )}

          {/* Qualities (optionnel) */}
          {data.softSkills.length > 0 && (
            <SectionLeft title={L.softSkills} mt="mt-6">
              <ul className="space-y-1" style={{ fontSize: "9.5pt" }}>
                {data.softSkills.map((s, i) => (
                  <li key={i} className="flex gap-2 items-baseline">
                    <span style={{ color: TEXT_DARK }}>·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </SectionLeft>
          )}

          {/* Languages (optionnel) */}
          {data.languages.length > 0 && (
            <SectionLeft title={L.languages} mt="mt-6">
              <ul className="space-y-1" style={{ fontSize: "9.5pt" }}>
                {data.languages.map((l, i) => (
                  <li key={i}>
                    {l.name}
                    {l.level && (
                      <span style={{ color: TEXT_LIGHT }}>
                        {" "}
                        — {l.level.replace(/_/g, " ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </SectionLeft>
          )}

          {/* References (Contact infos en bicolonne — pas de vraies refs dans nos data) */}
          <SectionLeft title="References" mt="mt-6">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2" style={{ fontSize: "9pt" }}>
              {data.email && (
                <div>
                  <div className="font-semibold" style={{ color: TEXT_DARK }}>
                    Email
                  </div>
                  <div className="break-all" style={{ color: TEXT_LIGHT }}>
                    {data.email}
                  </div>
                </div>
              )}
              {data.phoneNumber && (
                <div>
                  <div className="font-semibold" style={{ color: TEXT_DARK }}>
                    Phone
                  </div>
                  <div style={{ color: TEXT_LIGHT }}>{data.phoneNumber}</div>
                </div>
              )}
              {(data.city || data.country) && (
                <div>
                  <div className="font-semibold" style={{ color: TEXT_DARK }}>
                    Location
                  </div>
                  <div style={{ color: TEXT_LIGHT }}>
                    {[data.city, data.country].filter(Boolean).join(", ")}
                  </div>
                </div>
              )}
              {data.linkedin && (
                <div>
                  <div className="font-semibold" style={{ color: TEXT_DARK }}>
                    Web
                  </div>
                  <div className="break-all" style={{ color: TEXT_LIGHT }}>
                    {data.linkedin}
                  </div>
                </div>
              )}
              {data.interests.slice(0, 4).map((it, i) => (
                <div key={i}>
                  <div className="font-semibold" style={{ color: TEXT_DARK }}>
                    {L.interests}
                  </div>
                  <div style={{ color: TEXT_LIGHT }}>{it}</div>
                </div>
              ))}
            </div>
          </SectionLeft>
        </aside>

        {/* ─── Colonne droite ──────────────────────────────────── */}
        <main className="flex-1 px-[10mm] pt-[12mm] pb-[12mm]">
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <SectionRightTitle accentColor={accentColor}>{L.education}</SectionRightTitle>
              <div className="space-y-4">
                {data.education.map((ed, i) => (
                  <Item
                    key={i}
                    accentColor={accentColor}
                    title={ed.degree + (ed.field ? ` ${ed.field}` : "")}
                    subtitle={ed.school}
                    date={formatDateRange(ed.startDate, ed.endDate)}
                    description={ed.description}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {data.experiences.length > 0 && (
            <section className="mt-7">
              <SectionRightTitle accentColor={accentColor}>{L.experiences}</SectionRightTitle>
              <div className="space-y-4">
                {data.experiences.map((exp, i) => (
                  <Item
                    key={i}
                    accentColor={accentColor}
                    title={exp.position}
                    subtitle={exp.company}
                    date={formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    description={exp.description}
                  />
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
 * Photo dans cadre courbé (border-radius asymétrique top-left/bottom-right)
 * + petit rectangle accent en bas-droite.
 */
function PhotoFramedWithAccent({
  photoUrl,
  fullName,
  accentColor,
}: {
  photoUrl?: string;
  fullName: string;
  accentColor: string;
}) {
  return (
    <div className="relative" style={{ width: "65mm", height: "65mm" }}>
      {/* Rectangle orange accent en arrière-plan (bas-droite) */}
      <div
        className="absolute"
        style={{
          right: "-3mm",
          bottom: "-3mm",
          width: "20mm",
          height: "20mm",
          backgroundColor: accentColor,
          borderRadius: "2mm",
        }}
      />
      {/* Photo en cadre courbé (top-left + bottom-right arrondis) */}
      <div
        className="relative overflow-hidden bg-gray-100"
        style={{
          width: "65mm",
          height: "65mm",
          borderTopLeftRadius: "30mm",
          borderTopRightRadius: "5mm",
          borderBottomLeftRadius: "5mm",
          borderBottomRightRadius: "30mm",
        }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: TEXT_LIGHT }}
          >
            {getInitials(fullName)}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLeft({
  title,
  children,
  mt,
}: {
  title: string;
  children: React.ReactNode;
  mt?: string;
}) {
  return (
    <section className={mt}>
      <h2
        className="pb-1 mb-2 border-b"
        style={{
          fontSize: "13pt",
          fontWeight: 600,
          color: TEXT_DARK,
          borderColor: TEXT_DARK,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SectionRightTitle({
  children,
  accentColor,
}: {
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div className="mb-4">
      {/* Titre + ligne horizontale en bas */}
      <h2
        className="pb-2 border-b"
        style={{
          fontSize: "15pt",
          fontWeight: 700,
          color: TEXT_DARK,
          borderColor: TEXT_DARK,
        }}
      >
        {children}
      </h2>
      {/* Petit point coloré décoratif en haut à gauche du contenu (style PPT) */}
      <div className="hidden">
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  );
}

function Item({
  accentColor,
  title,
  subtitle,
  date,
  description,
}: {
  accentColor: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}) {
  return (
    <article className="flex gap-3">
      {/* Puce ronde colorée */}
      <div
        className="shrink-0 mt-1.5"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: accentColor,
        }}
      />
      <div className="flex-1">
        <div className="flex justify-between items-baseline gap-3 mb-0.5">
          <h3
            style={{
              fontSize: "11pt",
              fontWeight: 700,
              color: TEXT_DARK,
            }}
          >
            {title}
          </h3>
          {date && (
            <span
              className="shrink-0"
              style={{
                fontSize: "8pt",
                color: TEXT_LIGHT,
                fontWeight: 500,
              }}
            >
              {date}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            className="italic mb-1"
            style={{ fontSize: "9pt", fontWeight: 600, color: TEXT_DARK }}
          >
            {subtitle}
          </p>
        )}
        {description && (
          <p
            className="leading-relaxed"
            style={{ fontSize: "9pt", color: TEXT_LIGHT }}
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

/** Affiche prénom et nom sur 2 lignes si nom composé. */
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
  const s = formatYear(start);
  const e = current ? "Now" : formatYear(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} - ${e}`;
}

function formatYear(d?: string): string {
  if (!d) return "";
  const m = d.match(/^(\d{4})/);
  return m ? m[1] : d;
}
