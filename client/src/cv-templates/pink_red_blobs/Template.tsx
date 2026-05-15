import type { CvTemplateData } from "../types";
import type { CvSectionLabels } from "../registry";

const RED = "#C41212"; // rouge exact du PPT
const BG = "#F8F8F8"; // fond off-white du PPT

// Paths extraits du PPT (image2.svg pour le rouge top-right, image11.svg pour
// le rose bottom-left). On les ré-utilise tels quels pour une fidélité parfaite.
const RED_BLOB_PATH =
  "M 1231.759 366.438 C 1227.502 367.192, 1218.952 369.408, 1212.759 371.363 C 1164.858 386.484, 1134.938 422.445, 1108.380 496.819 C 1100.639 518.497, 1096.604 530.955, 1083.869 572.500 C 1051.773 677.202, 1032.666 725.829, 1008.284 764.859 C 987.827 797.606, 968.053 816.632, 947.204 823.631 C 940.495 825.883, 938.241 826.162, 929.376 825.834 C 919.611 825.472, 918.873 825.280, 909.864 820.760 C 890.757 811.173, 874.866 793.651, 858.551 764.181 C 851.414 751.289, 845.818 739.322, 831.810 707 C 806.708 649.079, 789.080 618.679, 767.512 596.120 C 747.053 574.720, 725.105 562.243, 699.500 557.455 C 687.602 555.230, 666.862 555.885, 655.813 558.834 C 615.056 569.713, 582.965 600.791, 557.030 654.500 C 544.370 680.718, 539.729 693.654, 511.466 781.500 C 501.254 813.238, 493.346 834.357, 486.766 847.457 C 475.378 870.131, 462.019 885.765, 448.620 892.102 C 431.723 900.093, 421.116 895.900, 388.905 868.500 C 360.267 844.140, 347.327 834.865, 331.594 827.424 C 295.412 810.313, 258.801 812.794, 228.087 834.439 C 217.418 841.957, 201.748 858.557, 193.076 871.526 C 166.875 910.707, 145.709 974.077, 143.435 1020.147 C 142.968 1029.606, 143.121 1031.121, 144.702 1032.702 C 146.391 1034.391, 148.993 1034.470, 187.701 1034 C 216.697 1033.648, 229.241 1033.161, 230.046 1032.356 C 230.686 1031.715, 231.396 1026.652, 231.659 1020.856 C 233.662 976.755, 251.648 938.191, 275.500 926.853 C 285.553 922.075, 297.784 923.108, 309.642 929.735 C 317.153 933.933, 324.496 941.532, 340.722 961.898 C 373.282 1002.768, 394.689 1019.030, 428.620 1028.675 C 437.831 1031.293, 439.719 1031.480, 456.500 1031.443 C 473.259 1031.405, 475.118 1031.212, 483.473 1028.641 C 494.830 1025.146, 501.656 1021.500, 511.672 1013.581 C 526.690 1001.705, 536.486 988.151, 550.037 960.500 C 565.545 928.855, 572.035 909.916, 609.659 786.500 C 622.735 743.609, 633.622 724.951, 650.506 716.500 C 656.077 713.712, 657.276 713.500, 667.500 713.500 C 678.367 713.500, 678.588 713.547, 685.782 717.391 C 695.122 722.381, 703.263 730.267, 710.437 741.272 C 719.696 755.478, 723.692 765.017, 740.479 813 C 753.475 850.148, 755.602 855.961, 763.633 876.288 C 782.356 923.680, 799.205 954.048, 820.524 978.832 C 852.413 1015.905, 889.230 1034.011, 932.692 1033.996 C 1002.101 1033.972, 1076.134 979.436, 1116.822 898.354 C 1128.475 875.133, 1146.208 827.825, 1154.814 797 C 1155.351 795.075, 1157.829 786.525, 1160.321 778 C 1168.004 751.708, 1172.465 734.903, 1181.956 696.500 C 1205.029 603.135, 1210.157 584.154, 1216.941 567 C 1227.499 540.302, 1240.159 527.267, 1256.554 526.215 C 1269.258 525.400, 1279.320 530.823, 1285.222 541.667 C 1290.676 551.688, 1294.803 571.272, 1296.564 595.500 C 1297.900 613.879, 1297.532 613.427, 1310.500 612.612 C 1315.450 612.301, 1338.175 611.306, 1361 610.401 C 1408.224 608.529, 1407.655 608.638, 1406.593 601.653 C 1406.246 599.369, 1401.744 580.400, 1396.589 559.500 C 1391.434 538.600, 1385.774 515.425, 1384.011 508 C 1372.652 460.161, 1353.881 421.002, 1331.500 398.453 C 1316.262 383.101, 1300.236 374.048, 1278.221 368.357 C 1266.066 365.215, 1243.850 364.297, 1231.759 366.438";

const PINK_BLOB_PATH =
  "M 986.500 182.659 C 981.550 182.793, 894.925 183.836, 794 184.977 C 693.075 186.117, 604.079 187.312, 596.231 187.630 C 578.310 188.358, 578.306 188.361, 576.375 200.417 C 571.840 228.741, 556.288 266.820, 538.134 294.051 C 515.159 328.514, 492.754 351.361, 443.500 390.551 C 394.640 429.428, 372.755 453.529, 355.098 487.905 C 332.814 531.286, 328.105 577.846, 341.908 618.309 C 350.861 644.555, 370.883 673.032, 401.131 702.542 C 417.413 718.427, 425.300 725.035, 453 745.999 C 481.901 767.872, 493.283 777.281, 507.391 790.966 C 546.598 828.996, 567.051 868.920, 570.969 915.071 C 574.185 952.960, 563.303 993.686, 539.419 1033.152 C 520.838 1063.853, 499.519 1087.803, 455.500 1127.424 C 430.096 1150.290, 411.503 1168.425, 401.082 1180.500 C 371.083 1215.263, 351.790 1253.064, 346.983 1286.500 C 346.350 1290.900, 345.149 1297.770, 344.312 1301.767 C 342.524 1310.313, 343.018 1313.232, 346.523 1314.829 C 348.466 1315.714, 410.110 1316, 598.856 1316 C 812.902 1316, 848.895 1315.797, 850.559 1314.582 C 852.297 1313.311, 852.561 1311.459, 853.081 1296.832 C 853.814 1276.232, 857.752 1253.114, 862.404 1242.097 C 866.583 1232.198, 872.582 1222.015, 880.271 1211.763 C 889.416 1199.571, 917.476 1171.886, 942.474 1150.393 C 972.769 1124.345, 987.384 1110.635, 1001.989 1094.561 C 1046.442 1045.640, 1072.497 1000.292, 1079.590 959.500 C 1081.427 948.935, 1081.646 926.635, 1080.011 916.500 C 1074.961 885.176, 1060.628 856.348, 1032.627 821.197 C 1014.166 798.020, 992.209 776.962, 946.048 738.160 C 910.448 708.236, 898.907 697.426, 886.932 682.789 C 864.177 654.975, 853.694 629.507, 848.948 590.500 C 847.400 577.785, 847.630 553.372, 849.414 541 C 853.631 511.756, 866.025 484.199, 886.634 458.240 C 898.390 443.433, 930.179 412.301, 963 383.453 C 1017.510 335.542, 1034.950 316.641, 1049.232 290 C 1063.567 263.260, 1070.904 231.030, 1069.688 200.146 C 1069.230 188.535, 1068.794 185.430, 1067.406 183.896 C 1065.776 182.095, 1063.925 182.010, 1030.595 182.208 C 1011.293 182.322, 991.450 182.525, 986.500 182.659";

const PHOTO_BLOB_PATH =
  "M3265,0 C1462,0 0,2193 0,4899 C0,7605 1462,9798 3265,9798 C5069,9798 6531,7605 6531,4899 C6531,2193 5069,0 3265,0 Z";

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
      {/* ─── Blob rouge ondulé top-right (image2.svg du PPT, rot -104°) */}
      <div
        className="absolute"
        style={{
          left: "49mm",
          top: "-0.5mm",
          width: "213mm",
          height: "113mm",
          transform: "rotate(-103.7deg)",
          transformOrigin: "center center",
        }}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="143 364.3 1265.3 670.2"
          preserveAspectRatio="none"
          style={{ display: "block", overflow: "visible" }}
        >
          <path fill={accent} fillRule="evenodd" d={RED_BLOB_PATH} />
        </svg>
      </div>

      {/* ─── Photo en ellipse verticale (Group 6 du PPT) ────────────── */}
      <div
        className="absolute"
        style={{
          top: "13mm",
          left: "121mm",
          width: "70mm",
          height: "105mm",
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
            <clipPath id="photoBlobClip" clipPathUnits="userSpaceOnUse">
              <path d={PHOTO_BLOB_PATH} />
            </clipPath>
          </defs>
          <path d={PHOTO_BLOB_PATH} fill={accent} />
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

      {/* ─── Blob rose pâle ondulé bottom-left (image11.svg, rot -60°) ─ */}
      {/* On agrandit fortement la boîte englobante par rapport au PPT
         (93.6×140.7mm → 250×375mm) et on la décale pour que :
         - les 4 coins du bounding box rotaté tombent hors de la feuille
           (sharp angles cachés)
         - seule la courbe arrondie soit visible côté bas-gauche,
           avec la pointe atteignant ~x=175mm comme dans le PPT. */}
      <div
        className="absolute"
        style={{
          left: "-70mm",
          top: "190mm",
          width: "250mm",
          height: "375mm",
          transform: "rotate(-60deg)",
          transformOrigin: "center center",
        }}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="328.1 182 753.5 1134"
          preserveAspectRatio="none"
          style={{ display: "block", overflow: "visible" }}
        >
          <path fill={pinkLight} fillRule="evenodd" d={PINK_BLOB_PATH} />
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
