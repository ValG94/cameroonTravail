import type { CvTemplateData } from "../types";

interface Props {
  data: CvTemplateData;
  accentColor?: string;
}

/**
 * Template "Editorial Creative" — inspiré du style magazine
 *  - Bandeau supérieur pastel avec signature manuscrite (font Allura)
 *  - Photo cerclée à gauche + intro à droite
 *  - Bicolonne : sidebar gauche (CONTACT, COMPÉTENCES, QUALITÉS)
 *    et colonne droite principale (EXPÉRIENCE, FORMATIONS)
 *  - Titres de section en font Lora pour le côté éditorial
 */
export default function EditorialCreativeTemplate({ data, accentColor = "#7dd3fc" }: Props) {
  // Couleur pastel dérivée de l'accent : on l'utilise pour le bandeau et les fonds
  // Ici on garde l'accent comme bordures/accents et on construit un pastel pour les fonds.
  const pastel = pastelize(accentColor);

  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg flex flex-col text-gray-900"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "system-ui, sans-serif" }}
    >
      {/* ─── Bandeau supérieur (intro + signature) ─────────────── */}
      <header
        className="px-10 pt-8 pb-6 relative"
        style={{ backgroundColor: pastel }}
      >
        {/* Trait fin décoratif en haut */}
        <div
          className="absolute top-3 left-10 right-10 h-px"
          style={{ backgroundColor: accentColor, opacity: 0.5 }}
        />

        <div className="flex items-start gap-6">
          {/* Photo */}
          <div className="shrink-0">
            {data.photoUrl ? (
              <div
                className="w-32 h-32 rounded-full overflow-hidden border-4"
                style={{ borderColor: accentColor }}
              >
                <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-white"
                style={{ backgroundColor: accentColor }}
              >
                {getInitials(data.fullName)}
              </div>
            )}
          </div>

          {/* Identité + intro */}
          <div className="flex-1 min-w-0">
            {/* Signature manuscrite (prénom seul en italique cursive) */}
            <div
              className="text-3xl text-gray-700 leading-none mb-1"
              style={{ fontFamily: "'Allura', cursive" }}
            >
              {firstName(data.fullName)}
            </div>
            {/* Titre principal façon magazine */}
            <h1
              className="text-2xl font-bold uppercase leading-tight tracking-wide text-gray-900"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {data.title || "Votre titre"}
            </h1>
            {/* Intro courte */}
            {data.professionalSummary && (
              <p className="mt-3 text-xs text-gray-700 leading-relaxed max-w-md">
                {data.professionalSummary}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ─── Bicolonne ─────────────────────────────────────────── */}
      <div className="flex flex-1 px-10 py-8 gap-8">
        {/* Sidebar gauche */}
        <aside className="w-[34%] shrink-0 space-y-6">
          {/* Contact */}
          <section>
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
            <section>
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
            <section>
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
            <section>
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
        </aside>

        {/* Colonne principale */}
        <main className="flex-1 space-y-7">
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
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function firstName(fullName: string): string {
  return (fullName || "").split(/\s+/)[0] || "Votre prénom";
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

/** Convertit un hex accent en sa version pastel (~85% blanc + 15% accent). */
function pastelize(hex: string): string {
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return "#dbeafe"; // fallback bleu pastel
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const mix = (c: number) => Math.round(c * 0.18 + 255 * 0.82);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
