import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const TEXT_DARK = "#1a1a1a";
const TEXT_LIGHT = "#5a5a5a";
const CREAM_BG = "#ECE8E1";
const PURPLE_LIGHT = "#D4AFE9";
const PURPLE_DARK = "#BB98CE";
const ORANGE = "#F4AE31";
const YELLOW_ORANGE = "#FAB844";
const RED = "#E53935";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Compétences techniques",
  softSkills: "Informatique",
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
 * Caractéristiques :
 * - Fond crème, icône fleur stylisée en haut à gauche
 * - Photo en forme organique avec signature manuscrite + ligne rouge
 * - Labels de section (FORMATION, EXPÉRIENCES PROF...) en bandeaux
 *   ORANGE VERTICAUX à gauche (texte tourné -90°)
 * - 2 cartes par section dans des couleurs alternées (violet/orange)
 * - Police Outfit (substitut de Koho du PPT)
 */
export default function ColorfulWarmBlocksTemplate({
  data,
  accentColor: _accentColor = PURPLE_LIGHT,
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };

  // Pour le rendu en cartes côte-à-côte par paires
  const eduPairs = chunkPairs(data.education);
  const expPairs = chunkPairs(data.experiences);

  return (
    <div
      id="cv-render-root"
      className="shadow-lg relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: CREAM_BG,
        color: TEXT_DARK,
      }}
    >
      <div className="px-[14mm] py-[14mm]">
        {/* ─── Header : nom + photo + signature + fleur ───────────── */}
        <header className="relative mb-7">
          {/* Icône fleur/étoile en haut à gauche */}
          <FlowerIcon />

          <div className="flex items-start justify-between gap-6 mt-4">
            {/* Nom + contact à gauche */}
            <div className="flex-1 pt-3">
              <h1
                className="leading-[0.92] uppercase"
                style={{
                  fontSize: "48pt",
                  fontWeight: 800,
                  color: TEXT_DARK,
                  letterSpacing: "-0.02em",
                }}
              >
                {splitNameForDisplay(data.fullName)}
              </h1>
              {data.title && (
                <p
                  className="mt-2 uppercase"
                  style={{
                    fontSize: "12pt",
                    fontWeight: 600,
                    color: TEXT_LIGHT,
                    letterSpacing: "0.05em",
                  }}
                >
                  {data.title}
                </p>
              )}
              {/* Contact en lignes séparées */}
              <div
                className="mt-4 space-y-0.5"
                style={{ fontSize: "10pt", color: TEXT_DARK }}
              >
                {(data.city || data.country) && (
                  <div
                    className="underline"
                    style={{ textUnderlineOffset: "2px", textDecorationColor: ORANGE }}
                  >
                    {[data.city, data.country].filter(Boolean).join(", ")}
                  </div>
                )}
                {data.email && (
                  <div
                    className="underline"
                    style={{ textUnderlineOffset: "2px", textDecorationColor: ORANGE }}
                  >
                    {data.email}
                  </div>
                )}
                {data.phoneNumber && (
                  <div
                    className="underline"
                    style={{ textUnderlineOffset: "2px", textDecorationColor: ORANGE }}
                  >
                    {data.phoneNumber}
                  </div>
                )}
              </div>
              {/* Résumé */}
              {data.professionalSummary && (
                <p
                  className="mt-3 leading-relaxed italic max-w-[100mm]"
                  style={{ fontSize: "10pt", color: TEXT_DARK }}
                >
                  {data.professionalSummary}
                </p>
              )}
            </div>

            {/* Photo + éléments décoratifs à droite */}
            <PhotoWithDecorations photoUrl={data.photoUrl} fullName={data.fullName} />
          </div>
        </header>

        {/* ─── FORMATION (avec bandeau orange vertical à gauche) ───── */}
        {data.education.length > 0 && (
          <SectionWithVerticalLabel
            label={L.education}
            labelBg={ORANGE}
            className="mb-4"
          >
            {eduPairs.map((pair, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-2 gap-2 mb-2">
                {pair.map((ed, colIdx) => (
                  <ColorBlock
                    key={colIdx}
                    bgColor={(rowIdx + colIdx) % 2 === 0 ? PURPLE_LIGHT : YELLOW_ORANGE}
                    title={ed.degree + (ed.field ? ` ${ed.field}` : "")}
                    date={formatDateRange(ed.startDate, ed.endDate)}
                    subtitle={ed.school}
                    bullets={ed.description ? ed.description.split("\n") : []}
                  />
                ))}
                {pair.length === 1 && <div />}
              </div>
            ))}
          </SectionWithVerticalLabel>
        )}

        {/* ─── EXPÉRIENCES PROFESSIONNELLES ──────────────────────── */}
        {data.experiences.length > 0 && (
          <SectionWithVerticalLabel
            label={L.experiences}
            labelBg={PURPLE_LIGHT}
            className="mb-4"
          >
            {expPairs.map((pair, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-2 gap-2 mb-2">
                {pair.map((exp, colIdx) => (
                  <ColorBlock
                    key={colIdx}
                    bgColor={(rowIdx + colIdx) % 2 === 0 ? ORANGE : PURPLE_DARK}
                    title={exp.position}
                    subtitle={exp.company}
                    date={formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    bullets={exp.description ? exp.description.split("\n") : []}
                  />
                ))}
                {pair.length === 1 && <div />}
              </div>
            ))}
          </SectionWithVerticalLabel>
        )}

        {/* ─── COMPÉTENCES (Informatique + Techniques + Langues) ──── */}
        {(data.hardSkills.length > 0 ||
          data.softSkills.length > 0 ||
          data.languages.length > 0) && (
          <SectionWithVerticalLabel
            label="Compétences"
            labelBg={ORANGE}
            className="mb-4"
          >
            {/* Informatique + Compétences techniques en bicolonne */}
            {(data.softSkills.length > 0 || data.hardSkills.length > 0) && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {data.softSkills.length > 0 && (
                  <SkillsBox
                    title={L.softSkills}
                    bgColor={YELLOW_ORANGE}
                    items={data.softSkills}
                    bulletColor={PURPLE_DARK}
                  />
                )}
                {data.hardSkills.length > 0 && (
                  <SkillsBox
                    title={L.hardSkills}
                    bgColor={YELLOW_ORANGE}
                    items={data.hardSkills}
                    bulletColor={PURPLE_DARK}
                  />
                )}
              </div>
            )}
            {/* LANGUES sur toute la largeur */}
            {data.languages.length > 0 && (
              <SkillsBox
                title={L.languages}
                bgColor={YELLOW_ORANGE}
                items={data.languages.map(
                  (l) => `${l.name}${l.level ? ` — ${l.level.replace(/_/g, " ")}` : ""}`
                )}
                bulletColor={PURPLE_DARK}
              />
            )}
          </SectionWithVerticalLabel>
        )}

        {/* ─── CENTRES D'INTÉRÊT ──────────────────────────────────── */}
        {data.interests.length > 0 && (
          <SectionWithVerticalLabel
            label={L.interests}
            labelBg={ORANGE}
            className="mb-4"
          >
            <SkillsBox
              title=""
              bgColor={YELLOW_ORANGE}
              items={data.interests}
              bulletColor={PURPLE_DARK}
            />
          </SectionWithVerticalLabel>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Petite icône "fleur/soleil" stylisée (étoile à 8 branches).
 */
function FlowerIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 40 40"
      className="absolute -top-1 -left-1"
      aria-hidden="true"
    >
      <g fill={TEXT_DARK}>
        {/* 8 pétales en forme d'amande autour du centre */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const cx = 20 + Math.cos(angle) * 11;
          const cy = 20 + Math.sin(angle) * 11;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx="3"
              ry="6"
              transform={`rotate(${(i * 45) + 90} ${cx} ${cy})`}
            />
          );
        })}
        <circle cx="20" cy="20" r="3" />
      </g>
    </svg>
  );
}

/**
 * Photo + signature manuscrite + ligne rouge décorative.
 */
function PhotoWithDecorations({
  photoUrl,
  fullName,
}: {
  photoUrl?: string;
  fullName: string;
}) {
  return (
    <div className="relative shrink-0" style={{ width: "78mm", height: "70mm" }}>
      {/* Petite ligne rouge en haut à droite */}
      <div
        className="absolute"
        style={{
          top: "6mm",
          right: "-3mm",
          width: "20mm",
          height: "2px",
          backgroundColor: RED,
          transform: "rotate(-12deg)",
        }}
        aria-hidden="true"
      />

      {/* Photo en forme "blob" organique via clip-path */}
      <div
        className="overflow-hidden bg-gray-200"
        style={{
          width: "65mm",
          height: "65mm",
          marginLeft: "auto",
          clipPath:
            "polygon(50% 0%, 80% 5%, 95% 25%, 100% 50%, 92% 78%, 70% 95%, 40% 100%, 12% 88%, 0% 60%, 5% 28%, 22% 8%)",
        }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: TEXT_DARK }}
          >
            {getInitials(fullName)}
          </div>
        )}
      </div>

      {/* Signature manuscrite (font Caveat) en bas-droite */}
      <div
        className="absolute"
        style={{
          bottom: "-2mm",
          right: "-5mm",
          fontFamily: "'Caveat', cursive",
          fontSize: "20pt",
          color: TEXT_DARK,
          transform: "rotate(-8deg)",
        }}
      >
        {firstName(fullName)}
      </div>
    </div>
  );
}

/**
 * Section avec un bandeau vertical à gauche contenant le label écrit
 * verticalement.
 *
 * Layout dynamique :
 *  - Utilise `writing-mode: vertical-rl` (au lieu de `transform:
 *    rotate(-90deg)`) : le navigateur intègre la hauteur du texte
 *    tourné dans le flow, ce qui fait que le bandeau grandit assez
 *    pour contenir le label — plus de débordement dans la section
 *    du dessus (typiquement 'EXPÉRIENCE PROFESSIONNELLE' qui est
 *    long).
 *  - Pas de `minHeight` fixe : la section fait exactement la
 *    hauteur nécessaire (label OU contenu, le plus grand des deux).
 *  - `items-stretch` sur le flex parent : les deux colonnes ont
 *    même hauteur. La colonne contenu utilise `flex flex-col
 *    justify-center` pour centrer verticalement les blocs quand la
 *    section est plus haute que le contenu (typiquement une section
 *    avec 2 formations courtes vs. un label long).
 *  - Padding vertical `py-3` sur le bandeau pour laisser respirer
 *    le texte aux extrémités.
 *  - `rotate(180deg)` sur le texte : par défaut vertical-rl écrit
 *    de haut en bas ; on inverse pour lire de bas en haut comme sur
 *    la maquette originale.
 */
function SectionWithVerticalLabel({
  label,
  labelBg,
  className,
  children,
}: {
  label: string;
  labelBg: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex items-stretch gap-2 ${className ?? ""}`}>
      {/* Bandeau vertical : hauteur = max(label rotated, contenu) */}
      <div
        className="shrink-0 flex items-center justify-center py-3"
        style={{
          width: "16mm",
          backgroundColor: labelBg,
        }}
      >
        <div
          className="uppercase"
          style={{
            fontSize: "13pt",
            fontWeight: 700,
            color: TEXT_DARK,
            letterSpacing: "0.15em",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
      {/* Contenu — centré verticalement dans l'espace disponible */}
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
}

/**
 * Bloc coloré avec titre souligné, sous-titre, date, et bullets de description.
 */
function ColorBlock({
  bgColor,
  title,
  subtitle,
  date,
  bullets,
}: {
  bgColor: string;
  title: string;
  subtitle?: string;
  date?: string;
  bullets?: string[];
}) {
  return (
    <article
      className="px-4 py-3 h-full"
      style={{ backgroundColor: bgColor }}
    >
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
      {date && (
        <p
          className="mt-0.5"
          style={{ fontSize: "9pt", fontWeight: 600, color: TEXT_DARK }}
        >
          {date.replace(/\n/g, " — ")}
        </p>
      )}
      {subtitle && (
        <p
          className="mt-1.5 italic"
          style={{ fontSize: "9.5pt", color: TEXT_DARK }}
        >
          {subtitle}
        </p>
      )}
      {bullets && bullets.length > 0 && bullets.some(Boolean) && (
        <ul className="mt-1.5 space-y-0.5" style={{ fontSize: "9pt", color: TEXT_DARK }}>
          {bullets.filter(Boolean).map((line, i) => (
            <li key={i} className="flex gap-1.5">
              <span style={{ color: TEXT_DARK, fontWeight: 700 }}>•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function SkillsBox({
  title,
  bgColor,
  items,
  bulletColor,
}: {
  title?: string;
  bgColor: string;
  items: string[];
  bulletColor: string;
}) {
  return (
    <div className="px-4 py-3" style={{ backgroundColor: bgColor }}>
      {title && (
        <h3
          className="uppercase mb-2"
          style={{
            fontSize: "12pt",
            fontWeight: 700,
            color: TEXT_DARK,
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </h3>
      )}
      <ul className="space-y-1" style={{ fontSize: "10pt", color: TEXT_DARK }}>
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 items-baseline">
            <span style={{ color: bulletColor, fontWeight: 700 }}>•</span>
            <span>{s}</span>
          </li>
        ))}
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

function firstName(fullName: string): string {
  return (fullName || "Votre nom").split(/\s+/)[0] || "Votre prénom";
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
  const s = formatYearOrMonth(start);
  const e = current ? "Aujourd'hui" : formatYearOrMonth(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} - ${e}`;
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

function chunkPairs<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push(arr.slice(i, i + 2));
  }
  return result;
}
