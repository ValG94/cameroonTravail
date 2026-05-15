import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const RED = "#C41212"; // rouge exact du PPT
const BG = "#F8F8F8"; // fond off-white du PPT

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Compétences",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Interêts",
  experiences: "Expérience professionnelle",
  education: "Formation",
};

interface Props {
  data: CvTemplateData;
  accentColor?: string;
  labels?: CvSectionLabels;
}

/**
 * Template "Pink Red Blobs" — d'après le PPTX
 * "CV Professionnel Moderne Rose et Rouge.pptx" (Sacha Dubois -
 * Chargée de Projet).
 *
 * Caractéristiques :
 * - Fond off-white #F8F8F8
 * - Blob organique ROUGE en haut-droite avec photo clippée à l'intérieur
 * - Blob organique ROSE PÂLE (lighten du rouge) en bas-gauche
 * - Nom en énorme Archivo Black 56pt (rouge), prénom & nom sur 2 lignes
 * - Sous-titre poste en petit caps espacé
 * - 2 colonnes séparées par une ligne pointillée verticale rouge
 * - Colonne gauche : CONTACT, FORMATION, COMPÉTENCES, INTERÊTS
 * - Colonne droite : EXPÉRIENCE PROFESSIONNELLE
 * - Tous les textes dans la couleur d'accent
 *
 * Polices : Archivo Black (titres + nom) + Inter (substitut Aileron du PPT).
 */
export default function PinkRedBlobsTemplate({
  data,
  accentColor: _accentColor = RED,
  labels,
}: Props) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const accent = _accentColor;
  const pinkLight = lighten(accent, 0.78); // rose pâle ~ #f7cdd0 quand accent = #C41212

  const [firstName, ...rest] = (data.fullName || "Votre nom").trim().split(/\s+/);
  const lastName = rest.join(" ");

  return (
    <div
      id="cv-render-root"
      className="shadow-lg relative overflow-hidden"
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundColor: BG,
        color: accent,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ─── Blob rouge top-right (avec photo clippée) ──────────────── */}
      <div
        className="absolute"
        style={{
          top: "13mm",
          left: "121mm",
          width: "75mm",
          height: "112mm",
        }}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 6531 9798"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <defs>
            <clipPath id="photoBlobClip">
              <path d="M3265,0 C1462,0 0,2193 0,4899 C0,7605 1462,9798 3265,9798 C5069,9798 6531,7605 6531,4899 C6531,2193 5069,0 3265,0 Z" />
            </clipPath>
          </defs>
          <path
            d="M3265,0 C1462,0 0,2193 0,4899 C0,7605 1462,9798 3265,9798 C5069,9798 6531,7605 6531,4899 C6531,2193 5069,0 3265,0 Z"
            fill={accent}
          />
          {data.photoUrl && (
            <image
              href={data.photoUrl}
              x="0"
              y="0"
              width="6531"
              height="9798"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#photoBlobClip)"
            />
          )}
        </svg>
      </div>

      {/* ─── Blob rose pâle bottom-left ─────────────────────────────── */}
      <div
        className="absolute"
        style={{
          bottom: "-10mm",
          left: "-15mm",
          width: "100mm",
          height: "120mm",
          transform: "rotate(-60deg)",
          transformOrigin: "bottom left",
        }}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 754 1134"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <path
            fill={pinkLight}
            fillRule="evenodd"
            d="M 658.4 0.7 C 653.4 0.8, 566.8 1.8, 465.9 3 C 364.9 4.1, 275.9 5.3, 268.1 5.6 C 250.2 6.4, 250.2 6.4, 248.3 18.4 C 243.7 46.7, 228.2 84.8, 210 112.1 C 187.1 146.5, 164.7 169.4, 115.5 208.5 C 66.6 247.4, 44.7 271.5, 27.1 305.9 C 4.8 349.3, 0.1 395.8, 13.9 436.3 C 22.8 462.6, 42.9 491.0, 73.1 520.5 C 89.4 536.4, 97.3 543, 125 564 C 153.9 585.9, 165.3 595.3, 179.4 609 C 218.6 647, 239.1 686.9, 243 733.1 C 246.2 771, 235.3 811.7, 211.4 851.2 C 192.8 881.9, 171.5 905.8, 127.5 945.4 C 102.1 968.3, 83.5 986.4, 73.1 998.5 C 43.1 1033.3, 23.8 1071.1, 19 1104.5 C 18.4 1108.9, 17.1 1115.8, 16.3 1119.8 C 14.5 1128.3, 15 1131.2, 18.5 1132.8 C 20.5 1133.7, 82.1 1134, 270.9 1134 C 484.9 1134, 520.9 1133.8, 522.6 1132.6 C 524.3 1131.3, 524.6 1129.5, 525.1 1114.8 C 525.8 1094.2, 529.8 1071.1, 534.4 1060.1 C 538.6 1050.2, 544.6 1040, 552.3 1029.8 C 561.4 1017.6, 589.5 989.9, 614.5 968.4 C 644.8 942.3, 659.4 928.6, 674 912.6 C 718.4 863.6, 744.5 818.3, 751.6 777.5 C 753.4 766.9, 753.6 744.6, 752 734.5 C 747 703.2, 732.6 674.4, 704.6 639.2 C 686.2 616, 664.2 595, 618.1 556.2 C 582.5 526.2, 570.9 515.4, 559 500.8 C 536.2 472.9, 525.7 447.5, 521 408.5 C 519.4 395.8, 519.6 371.4, 521.4 359 C 525.6 329.7, 538 302.2, 558.6 276.2 C 570.4 261.4, 602.2 230.3, 635 201.4 C 689.5 153.5, 706.9 134.6, 721.2 108 C 735.5 81.2, 742.9 49, 741.7 18.1 C 741.2 6.5, 740.8 3.4, 739.4 1.9 C 737.8 0.1, 735.9 0, 702.6 0.2 C 683.3 0.3, 663.4 0.5, 658.4 0.7 Z"
          />
        </svg>
      </div>

      {/* ─── Contenu principal (au-dessus des blobs) ────────────────── */}
      <div className="relative z-10" style={{ padding: "25mm 14mm 20mm 21mm" }}>
        {/* Header : nom + sous-titre */}
        <header style={{ marginBottom: "20mm", maxWidth: "100mm" }}>
          <h1
            className="uppercase"
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: "56pt",
              lineHeight: "0.92",
              letterSpacing: "-0.025em",
              color: accent,
              margin: 0,
            }}
          >
            {firstName}
            <br />
            {lastName}
          </h1>
          <p
            className="uppercase"
            style={{
              marginTop: "10mm",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "15pt",
              letterSpacing: "0.18em",
              color: accent,
            }}
          >
            {data.title || "Votre poste"}
          </p>
        </header>

        {/* ─── Body : 2 colonnes avec séparateur pointillé ─────────── */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "70mm 1fr",
            columnGap: "10mm",
            position: "relative",
          }}
        >
          {/* Séparateur vertical pointillé */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "73mm",
              top: 0,
              bottom: 0,
              borderLeft: `1px dashed ${accent}`,
            }}
          />

          {/* ─── Colonne gauche ───────────────────────────────────── */}
          <div>
            {/* CONTACT */}
            <SectionTitle accent={accent}>{L.contact.toUpperCase()}</SectionTitle>
            <div style={{ marginBottom: "8mm" }}>
              {data.city && (
                <ContactLine icon="📍" accent={accent}>
                  {data.city}
                  {data.country && <>, {data.country}</>}
                </ContactLine>
              )}
              {data.phoneNumber && (
                <ContactLine icon="☎" accent={accent}>
                  {data.phoneNumber}
                </ContactLine>
              )}
              {data.email && (
                <ContactLine icon="✉" accent={accent}>
                  {data.email}
                </ContactLine>
              )}
              {data.linkedin && (
                <ContactLine icon="in" accent={accent}>
                  {data.linkedin}
                </ContactLine>
              )}
            </div>
            <DottedRow accent={accent} />

            {/* FORMATION */}
            <div style={{ marginTop: "6mm" }}>
              <SectionTitle accent={accent}>{L.education.toUpperCase()}</SectionTitle>
              {data.education.length === 0 ? (
                <PlaceholderText>Ajoutez votre formation</PlaceholderText>
              ) : (
                data.education.map((edu, i) => (
                  <article key={i} style={{ marginBottom: "5mm" }}>
                    <p style={{ fontSize: "11pt", color: accent, lineHeight: 1.3 }}>
                      {[edu.degree, edu.field].filter(Boolean).join(" — ")}
                    </p>
                    <p
                      style={{
                        fontSize: "11pt",
                        color: accent,
                        fontStyle: "italic",
                        marginTop: "1mm",
                      }}
                    >
                      {edu.school}
                    </p>
                    {(edu.startDate || edu.endDate) && (
                      <p
                        className="uppercase"
                        style={{
                          fontSize: "10pt",
                          color: accent,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          marginTop: "1mm",
                        }}
                      >
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
            <DottedRow accent={accent} />

            {/* COMPÉTENCES */}
            <div style={{ marginTop: "6mm" }}>
              <SectionTitle accent={accent}>{L.hardSkills.toUpperCase()}</SectionTitle>
              <BulletList items={data.hardSkills} accent={accent} placeholder="Ajoutez vos compétences" />
            </div>
            <DottedRow accent={accent} />

            {/* INTERÊTS */}
            <div style={{ marginTop: "6mm" }}>
              <SectionTitle accent={accent}>{L.interests.toUpperCase()}</SectionTitle>
              <BulletList items={data.interests} accent={accent} placeholder="Ajoutez vos centres d'intérêt" />
            </div>
          </div>

          {/* ─── Colonne droite : EXPÉRIENCE PROFESSIONNELLE ──────── */}
          <div style={{ paddingLeft: "5mm", marginTop: "60mm" }}>
            <SectionTitle accent={accent}>{L.experiences.toUpperCase()}</SectionTitle>

            {data.experiences.length === 0 ? (
              <PlaceholderText>Ajoutez vos expériences</PlaceholderText>
            ) : (
              data.experiences.map((exp, i) => (
                <article key={i} style={{ marginBottom: "8mm" }}>
                  <h3 style={{ fontSize: "11pt", color: accent, lineHeight: 1.3 }}>
                    {exp.position}
                  </h3>
                  <p
                    style={{
                      fontSize: "11pt",
                      color: accent,
                      fontStyle: "italic",
                      marginTop: "1mm",
                    }}
                  >
                    {[exp.company, exp.location].filter(Boolean).join(" — ")}
                  </p>
                  <p
                    className="uppercase"
                    style={{
                      fontSize: "10pt",
                      color: accent,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      marginTop: "1mm",
                      marginBottom: "2mm",
                    }}
                  >
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                  {exp.description && (
                    <ul style={{ marginTop: "1mm" }}>
                      {exp.description
                        .split("\n")
                        .filter((l) => l.trim())
                        .map((line, j) => (
                          <li
                            key={j}
                            style={{
                              fontSize: "9.5pt",
                              color: accent,
                              lineHeight: 1.45,
                              paddingLeft: "4mm",
                              position: "relative",
                              marginBottom: "1.5mm",
                            }}
                          >
                            <span style={{ position: "absolute", left: 0 }}>•</span>
                            {line.replace(/^[-•]\s*/, "")}
                          </li>
                        ))}
                    </ul>
                  )}
                </article>
              ))
            )}

            {/* Langues (en bonus si présentes) */}
            {data.languages.length > 0 && (
              <div style={{ marginTop: "8mm" }}>
                <SectionTitle accent={accent}>{L.languages.toUpperCase()}</SectionTitle>
                <ul>
                  {data.languages.map((lang, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: "10pt",
                        color: accent,
                        marginBottom: "1mm",
                      }}
                    >
                      {lang.name} — <em>{lang.level}</em>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sous-composants ───────────────────────────────────────────────────────────

function SectionTitle({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <h2
      className="uppercase"
      style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: "14.5pt",
        color: accent,
        marginBottom: "4mm",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </h2>
  );
}

function ContactLine({
  icon,
  children,
  accent,
}: {
  icon: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "3mm",
        marginBottom: "2.5mm",
        fontSize: "10.5pt",
        color: accent,
        lineHeight: 1.35,
      }}
    >
      <span
        style={{
          minWidth: "5mm",
          textAlign: "center",
          fontSize: "10pt",
          color: accent,
        }}
      >
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}

function BulletList({
  items,
  accent,
  placeholder,
}: {
  items: string[];
  accent: string;
  placeholder: string;
}) {
  if (items.length === 0) {
    return <PlaceholderText>{placeholder}</PlaceholderText>;
  }
  return (
    <ul>
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            fontSize: "11pt",
            color: accent,
            marginBottom: "1.5mm",
            paddingLeft: "5mm",
            position: "relative",
            lineHeight: 1.4,
          }}
        >
          <span style={{ position: "absolute", left: 0 }}>•</span>
          {it}
        </li>
      ))}
    </ul>
  );
}

function DottedRow({ accent }: { accent: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        marginTop: "5mm",
        borderTop: `1px dashed ${accent}`,
      }}
    />
  );
}

function PlaceholderText({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "10pt", color: "#999", fontStyle: "italic" }}>
      {children}
    </p>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Éclaircit un hex en mixant avec du blanc (0 = pur, 1 = blanc). */
function lighten(hex: string, weightWhite: number): string {
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const f = (c: number) => Math.round(c * (1 - weightWhite) + 255 * weightWhite);
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

function formatDateRange(start?: string, end?: string, current?: boolean): string {
  const s = formatMonthYear(start);
  const e = current ? "à présent" : formatMonthYear(end);
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
