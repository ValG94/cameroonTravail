import type { CvTemplateData } from "../types";

interface Props {
  data: CvTemplateData;
  accentColor?: string;
}

/**
 * Template "Editorial Creative" — inspiré du style magazine
 *  - Sidebar gauche bleu pastel pleine hauteur (avec photo en losange,
 *    signature manuscrite prénom+nom, contact, compétences, qualités)
 *  - Zone droite blanche : intro + expérience professionnelle + formations
 *  - Effet brush organique sur la frontière entre les 2 zones
 *  - Titres de section en font Lora pour le côté éditorial
 */
export default function EditorialCreativeTemplate({ data, accentColor = "#7dd3fc" }: Props) {
  const pastel = pastelize(accentColor);

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg flex text-gray-900 relative"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "system-ui, sans-serif" }}
    >
      {/* ─── Sidebar gauche bleue pastel ─────────────────────────── */}
      <aside
        className="w-[36%] shrink-0 px-7 py-8 relative"
        style={{ backgroundColor: pastel }}
      >
        {/* Photo en losange + signature + titre */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Photo en losange */}
          <div className="relative mb-5">
            <PhotoLosange photoUrl={data.photoUrl} accentColor={accentColor} fullName={data.fullName} />
          </div>

          {/* Signature manuscrite (prénom + nom complet) */}
          <div
            className="text-3xl text-gray-700 leading-none mb-2"
            style={{ fontFamily: "'Allura', cursive" }}
          >
            {data.fullName || "Votre nom"}
          </div>

          {/* Titre principal façon magazine */}
          <h1
            className="text-xl font-bold uppercase leading-tight tracking-wide text-gray-900"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {data.title || "Votre titre"}
          </h1>
        </div>

        {/* Contact */}
        <section className="mb-6">
          <SidebarTitle accent={accentColor}>Contact</SidebarTitle>
          <ul className="space-y-1.5 text-xs text-gray-700 break-words">
            {data.phoneNumber && <ContactRow accent={accentColor} symbol="☎">{data.phoneNumber}</ContactRow>}
            {data.email && <ContactRow accent={accentColor} symbol="✉">{data.email}</ContactRow>}
            {data.linkedin && <ContactRow accent={accentColor} symbol="🌐">{data.linkedin}</ContactRow>}
            {(data.city || data.country) && (
              <ContactRow accent={accentColor} symbol="◉">
                {[data.city, data.country].filter(Boolean).join(", ")}
              </ContactRow>
            )}
          </ul>
        </section>

        {/* Compétences */}
        {data.hardSkills.length > 0 && (
          <section className="mb-6">
            <SidebarTitle accent={accentColor}>Compétences</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-700">
              {data.hardSkills.map((s, i) => (
                <li key={i} className="flex gap-2 items-baseline">
                  <span style={{ color: accentColor }}>•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Qualités */}
        {data.softSkills.length > 0 && (
          <section className="mb-6">
            <SidebarTitle accent={accentColor}>Qualités</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-700">
              {data.softSkills.map((s, i) => (
                <li key={i} className="flex gap-2 items-baseline">
                  <span style={{ color: accentColor }}>•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Langues */}
        {data.languages.length > 0 && (
          <section className="mb-6">
            <SidebarTitle accent={accentColor}>Langues</SidebarTitle>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {data.languages.map((l, i) => (
                <li key={i}>
                  <div className="font-semibold text-gray-800">{l.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">
                    {l.level.replace(/_/g, " ")}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Centres d'intérêt */}
        {data.interests.length > 0 && (
          <section>
            <SidebarTitle accent={accentColor}>Centres d'intérêt</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-700">
              {data.interests.map((it, i) => (
                <li key={i} className="flex gap-2 items-baseline">
                  <span style={{ color: accentColor }}>•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Effet brush sur la frontière droite (déborde sur le contenu) */}
        <BrushEdge color={pastel} />
      </aside>

      {/* ─── Colonne principale blanche ────────────────────────── */}
      <main className="flex-1 px-10 py-8 space-y-7 relative">
        {/* Intro / résumé */}
        {data.professionalSummary && (
          <section className="pb-3 border-b border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {data.professionalSummary}
            </p>
          </section>
        )}

        {/* Expériences */}
        {data.experiences.length > 0 && (
          <section>
            <MainTitle accent={accentColor}>Expérience professionnelle</MainTitle>
            <div className="space-y-5">
              {data.experiences.map((exp, i) => (
                <article key={i}>
                  <h3
                    className="text-sm font-bold text-gray-900"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {exp.position}
                  </h3>
                  <div className="text-xs text-gray-600 italic mb-1">
                    {exp.company}
                    {exp.location && ` · ${exp.location}`}
                    {(exp.startDate || exp.endDate) && (
                      <>
                        {" / "}
                        {formatDate(exp.startDate)}
                        {" – "}
                        {exp.current ? "Aujourd'hui" : formatDate(exp.endDate)}
                      </>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-700 leading-relaxed">{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-xs text-gray-700">
                      {exp.achievements.map((a, j) => (
                        <li key={j} className="flex gap-2">
                          <span style={{ color: accentColor }}>›</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Formations */}
        {data.education.length > 0 && (
          <section>
            <MainTitle accent={accentColor}>Formations</MainTitle>
            <div className="space-y-3">
              {data.education.map((ed, i) => (
                <article key={i}>
                  <h3
                    className="text-sm font-bold text-gray-900"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {ed.degree}
                    {ed.field && ` — ${ed.field}`}
                  </h3>
                  <div className="text-xs text-gray-600 italic">
                    {ed.school}
                    {(ed.startDate || ed.endDate) && (
                      <>
                        {" · "}
                        {formatDate(ed.startDate)}
                        {ed.endDate && ` – ${formatDate(ed.endDate)}`}
                      </>
                    )}
                  </div>
                  {ed.description && (
                    <p className="text-xs text-gray-700 mt-1">{ed.description}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhotoLosange({
  photoUrl,
  accentColor,
  fullName,
}: {
  photoUrl?: string;
  accentColor: string;
  fullName: string;
}) {
  // Carré tourné de 45° pour faire un losange.
  // L'image est tournée -45° à l'intérieur pour rester droite visuellement.
  return (
    <div
      className="w-32 h-32 overflow-hidden shadow-md"
      style={{
        transform: "rotate(45deg)",
        border: `4px solid white`,
        outline: `1px solid ${accentColor}`,
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ transform: "rotate(-45deg) scale(1.4)" }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {getInitials(fullName)}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Effet "brush stroke" sur la frontière droite de la sidebar.
 * SVG path qui simule un coup de pinceau organique.
 */
function BrushEdge({ color }: { color: string }) {
  return (
    <svg
      className="absolute top-0 -right-3 h-full pointer-events-none"
      width="20"
      viewBox="0 0 20 800"
      preserveAspectRatio="none"
    >
      <path
        d="M0,0 L8,0 Q14,40 6,90 T12,180 T4,270 T14,360 T6,460 T12,560 T4,660 T10,760 L10,800 L0,800 Z"
        fill={color}
      />
      {/* Petites éclaboussures décoratives pour renforcer l'effet brush */}
      <circle cx="16" cy="120" r="2" fill={color} opacity="0.6" />
      <circle cx="14" cy="320" r="1.5" fill={color} opacity="0.5" />
      <circle cx="17" cy="540" r="2.5" fill={color} opacity="0.7" />
      <circle cx="13" cy="700" r="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

function SidebarTitle({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h2
      className="text-xs uppercase font-bold tracking-[0.18em] mb-2 pb-1 border-b"
      style={{ color: "#1f2937", borderColor: accent, fontFamily: "'Lora', serif" }}
    >
      {children}
    </h2>
  );
}

function MainTitle({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="mb-3 pb-1 border-b-2" style={{ borderColor: accent }}>
      <h2
        className="text-base uppercase font-bold tracking-[0.15em] text-gray-900"
        style={{ fontFamily: "'Lora', serif" }}
      >
        {children}
      </h2>
    </div>
  );
}

function ContactRow({
  symbol,
  accent,
  children,
}: {
  symbol: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2 items-baseline">
      <span className="text-[10px] shrink-0" style={{ color: accent }}>
        {symbol}
      </span>
      <span className="break-all">{children}</span>
    </li>
  );
}

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

function formatDate(d?: string): string {
  if (!d) return "";
  const m = d.match(/^(\d{4})-?(\d{2})?/);
  if (m) {
    const year = m[1];
    const month = m[2];
    if (month) {
      const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
      return `${months[parseInt(month) - 1] ?? ""} ${year}`;
    }
    return year;
  }
  return d;
}

/** Convertit un hex accent en sa version pastel (~82% blanc + 18% accent). */
function pastelize(hex: string): string {
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return "#dbeafe"; // fallback bleu pastel
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const mix = (c: number) => Math.round(c * 0.18 + 255 * 0.82);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
