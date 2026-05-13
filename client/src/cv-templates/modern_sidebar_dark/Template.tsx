import type { CvTemplateData } from "../types";

interface Props {
  data: CvTemplateData;
  accentColor?: string;
}

/**
 * Template "Modern Sidebar Dark"
 * - Colonne latérale sombre (~35%) avec photo, contact, compétences, langues, centres d'intérêt
 * - Colonne principale (~65%) blanche avec titre, résumé, expériences, formations
 * - Largeur fixe A4 (210mm × 297mm) pour rendu PDF stable
 */
export default function ModernSidebarDarkTemplate({ data, accentColor = "#10b981" }: Props) {
  return (
    <div
      id="cv-render-root"
      className="bg-white shadow-lg flex font-sans text-gray-900"
      style={{ width: "210mm", minHeight: "297mm" }}
    >
      {/* ─── Colonne latérale sombre ─────────────────────────────── */}
      <aside className="bg-gray-900 text-gray-100 w-[35%] px-6 py-10 flex flex-col gap-8">
        {/* Photo */}
        <div className="flex flex-col items-center">
          {data.photoUrl ? (
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-4"
              style={{ borderColor: accentColor }}
            >
              <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {getInitials(data.fullName)}
            </div>
          )}
        </div>

        {/* Contact */}
        <section>
          <SidebarTitle accent={accentColor}>Contact</SidebarTitle>
          <ul className="space-y-2 text-xs leading-relaxed text-gray-300 break-words">
            {data.email && <li>{data.email}</li>}
            {data.phoneNumber && <li>{data.phoneNumber}</li>}
            {(data.city || data.country) && (
              <li>{[data.city, data.country].filter(Boolean).join(", ")}</li>
            )}
            {data.linkedin && <li className="break-all">{data.linkedin}</li>}
            {data.website && <li className="break-all">{data.website}</li>}
          </ul>
        </section>

        {/* Hard skills */}
        {data.hardSkills.length > 0 && (
          <section>
            <SidebarTitle accent={accentColor}>Compétences</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-300">
              {data.hardSkills.map((s, i) => (
                <li key={i} className="flex gap-2 items-baseline">
                  <span style={{ color: accentColor }}>▸</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Soft skills */}
        {data.softSkills.length > 0 && (
          <section>
            <SidebarTitle accent={accentColor}>Qualités</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-300">
              {data.softSkills.map((s, i) => (
                <li key={i} className="flex gap-2 items-baseline">
                  <span style={{ color: accentColor }}>▸</span>
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
            <ul className="space-y-1.5 text-xs text-gray-300">
              {data.languages.map((l, i) => (
                <li key={i}>
                  <div className="font-medium text-white">{l.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400">
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
            <SidebarTitle accent={accentColor}>Loisirs</SidebarTitle>
            <ul className="space-y-1 text-xs text-gray-300">
              {data.interests.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* ─── Colonne principale ──────────────────────────────────── */}
      <main className="flex-1 px-10 py-10 flex flex-col gap-6">
        {/* En-tête : nom + titre */}
        <header className="border-b-2 pb-4" style={{ borderColor: accentColor }}>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase leading-tight">
            {data.fullName || "Votre nom"}
          </h1>
          {data.title && (
            <p
              className="mt-1 text-lg font-semibold uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              {data.title}
            </p>
          )}
        </header>

        {/* Résumé */}
        {data.professionalSummary && (
          <section>
            <p className="text-sm leading-relaxed text-gray-700">{data.professionalSummary}</p>
          </section>
        )}

        {/* Expériences */}
        {data.experiences.length > 0 && (
          <section>
            <MainTitle accent={accentColor}>Expériences</MainTitle>
            <div className="space-y-4">
              {data.experiences.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-28 shrink-0 text-xs text-gray-500 pt-1">
                    <div>{formatDate(exp.startDate)}</div>
                    <div>{exp.current ? "Aujourd'hui" : formatDate(exp.endDate)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{exp.position}</div>
                    <div className="text-sm text-gray-600 font-medium">
                      {exp.company}
                      {exp.location && ` — ${exp.location}`}
                    </div>
                    {exp.description && (
                      <p className="mt-1 text-xs text-gray-700 leading-relaxed">{exp.description}</p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-xs text-gray-700">
                        {exp.achievements.map((a, j) => (
                          <li key={j} className="flex gap-2">
                            <span style={{ color: accentColor }}>•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
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
                <div key={i} className="flex gap-4">
                  <div className="w-28 shrink-0 text-xs text-gray-500 pt-1">
                    <div>{formatDate(ed.startDate)}</div>
                    <div>{formatDate(ed.endDate)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">
                      {ed.degree}
                      {ed.field && ` — ${ed.field}`}
                    </div>
                    <div className="text-sm text-gray-600">{ed.school}</div>
                    {ed.description && (
                      <p className="mt-1 text-xs text-gray-700">{ed.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Références (optionnel) */}
        {data.references.length > 0 && (
          <section>
            <MainTitle accent={accentColor}>Références</MainTitle>
            <div className="grid grid-cols-2 gap-3">
              {data.references.map((r, i) => (
                <div key={i} className="text-xs">
                  <div className="font-bold text-gray-900">{r.name}</div>
                  {r.position && <div className="text-gray-600">{r.position}</div>}
                  {r.company && <div className="text-gray-500">{r.company}</div>}
                  {r.contact && <div className="text-gray-500 mt-0.5">{r.contact}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SidebarTitle({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h2
      className="text-xs uppercase font-bold tracking-[0.2em] mb-2 pb-1 border-b"
      style={{ color: accent, borderColor: accent }}
    >
      {children}
    </h2>
  );
}

function MainTitle({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h2
      className="text-sm uppercase font-bold tracking-[0.2em] mb-3"
      style={{ color: accent }}
    >
      {children}
    </h2>
  );
}

function getInitials(fullName: string): string {
  if (!fullName) return "?";
  return fullName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(d?: string): string {
  if (!d) return "";
  // Accepte "2023-01-01" ou "2023" ou "Janv. 2023"
  const match = d.match(/^(\d{4})-?(\d{2})?/);
  if (match) {
    const year = match[1];
    const month = match[2];
    if (month) {
      const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
      const idx = parseInt(month) - 1;
      return `${months[idx] ?? ""} ${year}`;
    }
    return year;
  }
  return d;
}
