/**
 * Mini-aperçus CSS pour la grille de la bibliothèque.
 * Permet de "voir" la mise en page de chaque template sans charger une image.
 * Chaque thumbnail respecte le ratio d'un A4 (~1:1.414).
 */

interface ThumbProps {
  className?: string;
}

const PLACEHOLDER_LINES = "bg-gray-300";
const PLACEHOLDER_LINE_LIGHT = "bg-gray-200";

// ─── modern_sidebar_dark ──────────────────────────────────────────────────────
function ModernSidebarDarkThumb({ className = "" }: ThumbProps) {
  return (
    <div className={`flex w-full h-full ${className}`}>
      <aside className="bg-gray-900 w-[35%] p-3 flex flex-col gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500 mx-auto" />
        <div className="space-y-1">
          <div className="h-1 bg-emerald-500 rounded w-2/3" />
          <div className="h-1 bg-gray-700 rounded w-full" />
          <div className="h-1 bg-gray-700 rounded w-3/4" />
        </div>
        <div className="space-y-1">
          <div className="h-1 bg-emerald-500 rounded w-1/2" />
          <div className="h-1 bg-gray-700 rounded w-full" />
          <div className="h-1 bg-gray-700 rounded w-4/5" />
          <div className="h-1 bg-gray-700 rounded w-3/5" />
        </div>
      </aside>
      <main className="flex-1 bg-white p-3 space-y-2">
        <div className="h-2.5 bg-gray-900 rounded w-3/4" />
        <div className="h-1 bg-emerald-500 rounded w-1/2" />
        <div className="border-b-2 border-emerald-500 -mx-1" />
        <div className="space-y-1 pt-1">
          <div className="h-1 bg-gray-400 rounded w-full" />
          <div className="h-1 bg-gray-300 rounded w-5/6" />
        </div>
        <div className="space-y-1 pt-2">
          <div className="h-1.5 bg-emerald-500 rounded w-1/3" />
          <div className="h-1 bg-gray-300 rounded w-full" />
          <div className="h-1 bg-gray-300 rounded w-4/5" />
        </div>
      </main>
    </div>
  );
}

// ─── hospitality_timeline ─────────────────────────────────────────────────────
function HospitalityTimelineThumb({ className = "" }: ThumbProps) {
  return (
    <div className={`bg-white w-full h-full p-3 flex flex-col gap-2 ${className}`}>
      <div className="bg-amber-700 -mx-3 -mt-3 px-3 py-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-amber-200" />
        <div className="space-y-1 flex-1">
          <div className="h-1.5 bg-amber-100 rounded w-2/3" />
          <div className="h-1 bg-amber-200 rounded w-1/3" />
        </div>
      </div>
      <div className="flex gap-1.5 mt-1">
        <div className="flex-1 h-3 bg-amber-100 border-l-4 border-amber-600 rounded-r" />
        <div className="flex-1 h-3 bg-amber-100 border-l-4 border-amber-600 rounded-r" />
        <div className="flex-1 h-3 bg-amber-100 border-l-4 border-amber-600 rounded-r" />
      </div>
      <div className="space-y-1 mt-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-600" />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded flex-1`} />
        </div>
        <div className="flex items-center gap-1 ml-1">
          <div className="w-px h-3 bg-amber-300" />
          <div className={`h-1 ${PLACEHOLDER_LINE_LIGHT} rounded flex-1`} />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-600" />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded flex-1`} />
        </div>
        <div className="flex items-center gap-1 ml-1">
          <div className="w-px h-3 bg-amber-300" />
          <div className={`h-1 ${PLACEHOLDER_LINE_LIGHT} rounded flex-1`} />
        </div>
      </div>
    </div>
  );
}

// ─── minimal_centered ─────────────────────────────────────────────────────────
function MinimalCenteredThumb({ className = "" }: ThumbProps) {
  return (
    <div className={`bg-white w-full h-full p-4 flex flex-col items-center gap-2 ${className}`}>
      <div className="h-2.5 bg-gray-800 rounded w-2/3 mt-1" />
      <div className="h-1 bg-gray-400 rounded w-1/3" />
      <div className="border-t border-gray-300 w-full my-1" />
      <div className="grid grid-cols-2 gap-x-3 w-full">
        <div className="space-y-1">
          <div className="h-1.5 bg-gray-700 rounded w-2/3 mx-auto" />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded`} />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded`} />
          <div className={`h-1 ${PLACEHOLDER_LINE_LIGHT} rounded w-4/5`} />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-gray-700 rounded w-2/3 mx-auto" />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded`} />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded`} />
          <div className={`h-1 ${PLACEHOLDER_LINE_LIGHT} rounded w-3/4`} />
        </div>
      </div>
      <div className="w-full space-y-1 mt-1">
        <div className="h-1.5 bg-gray-700 rounded w-1/3 mx-auto" />
        <div className={`h-1 ${PLACEHOLDER_LINES} rounded w-full`} />
        <div className={`h-1 ${PLACEHOLDER_LINES} rounded w-5/6`} />
      </div>
    </div>
  );
}

// ─── editorial_creative ───────────────────────────────────────────────────────
function EditorialCreativeThumb({ className = "" }: ThumbProps) {
  return (
    <div className={`bg-sky-50 w-full h-full p-3 flex gap-2 ${className}`}>
      <div className="w-[40%] space-y-2">
        <div className="aspect-square bg-sky-200 rounded" />
        <div className="space-y-1">
          <div className="h-1.5 bg-sky-700 rounded w-2/3" />
          <div className="h-1 bg-sky-400 rounded w-full" />
          <div className="h-1 bg-sky-400 rounded w-5/6" />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-sky-700 rounded w-1/2" />
          <div className="h-1 bg-sky-400 rounded w-full" />
        </div>
      </div>
      <div className="flex-1 bg-white p-2 rounded space-y-2">
        <div className="h-2 bg-gray-800 rounded w-3/4" />
        <div className="h-1 bg-sky-500 rounded w-1/3" />
        <div className="space-y-1 pt-1">
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded`} />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded w-5/6`} />
          <div className={`h-1 ${PLACEHOLDER_LINE_LIGHT} rounded w-2/3`} />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-sky-700 rounded w-1/3" />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded w-full`} />
          <div className={`h-1 ${PLACEHOLDER_LINES} rounded w-4/5`} />
        </div>
      </div>
    </div>
  );
}

// ─── executive_curved ─────────────────────────────────────────────────────────
function ExecutiveCurvedThumb({ className = "" }: ThumbProps) {
  return (
    <div className={`bg-white w-full h-full relative overflow-hidden ${className}`}>
      {/* Forme courbe haute */}
      <div
        className="absolute top-0 left-0 right-0 h-[35%] bg-indigo-900"
        style={{ borderBottomLeftRadius: "50% 35%", borderBottomRightRadius: "50% 35%" }}
      />
      <div className="relative p-3 pt-4">
        <div className="space-y-1 mb-2">
          <div className="h-2.5 bg-white rounded w-2/3" />
          <div className="h-1 bg-indigo-300 rounded w-1/2" />
        </div>
      </div>
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-indigo-200 border-2 border-white" />
      <div className="absolute bottom-2 left-3 right-3 space-y-1.5">
        <div className="h-1.5 bg-indigo-900 rounded w-1/3" />
        <div className={`h-1 ${PLACEHOLDER_LINES} rounded`} />
        <div className={`h-1 ${PLACEHOLDER_LINES} rounded w-5/6`} />
        <div className={`h-1 ${PLACEHOLDER_LINE_LIGHT} rounded w-2/3`} />
        <div className="h-1.5 bg-indigo-900 rounded w-1/3 mt-2" />
        <div className={`h-1 ${PLACEHOLDER_LINES} rounded`} />
        <div className={`h-1 ${PLACEHOLDER_LINE_LIGHT} rounded w-4/5`} />
      </div>
    </div>
  );
}

// ─── professional_modern_white ────────────────────────────────────────────────
function ProfessionalModernWhiteThumb({ className = "" }: ThumbProps) {
  return (
    <div className={`bg-white w-full h-full p-2 flex gap-1.5 ${className}`}>
      {/* Colonne gauche : photo + identité + sections */}
      <div className="w-[40%] space-y-1.5">
        {/* Photo en cadre courbé */}
        <div className="relative">
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-400 rounded-sm" />
          <div
            className="relative bg-gray-300 w-full aspect-square"
            style={{
              borderTopLeftRadius: "50%",
              borderBottomRightRadius: "50%",
            }}
          />
        </div>
        <div className="space-y-0.5">
          <div className="h-2 bg-gray-900 rounded w-3/4" />
          <div className="h-1 bg-gray-500 rounded w-1/2" />
        </div>
        <div className="border-t border-gray-700 pt-0.5 mt-1.5">
          <div className="h-1 bg-gray-700 rounded w-1/3 mb-0.5" />
          <div className={`h-0.5 ${PLACEHOLDER_LINES} rounded`} />
          <div className={`h-0.5 ${PLACEHOLDER_LINES} rounded w-5/6`} />
        </div>
      </div>
      {/* Séparateur vertical */}
      <div className="w-px bg-gray-300 my-2" />
      {/* Colonne droite : Education + Experience */}
      <div className="flex-1 space-y-2">
        <div>
          <div className="h-1.5 bg-gray-900 rounded w-1/2 mb-0.5" />
          <div className="border-b border-gray-700 mb-1" />
          <div className="flex gap-1 items-start">
            <div className="w-1 h-1 bg-orange-400 rounded-full mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <div className="h-1 bg-gray-700 rounded w-3/4" />
              <div className={`h-0.5 ${PLACEHOLDER_LINE_LIGHT} rounded w-1/2`} />
            </div>
          </div>
        </div>
        <div>
          <div className="h-1.5 bg-gray-900 rounded w-1/2 mb-0.5" />
          <div className="border-b border-gray-700 mb-1" />
          <div className="flex gap-1 items-start">
            <div className="w-1 h-1 bg-orange-400 rounded-full mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <div className="h-1 bg-gray-700 rounded w-3/4" />
              <div className={`h-0.5 ${PLACEHOLDER_LINE_LIGHT} rounded w-1/2`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── colorful_warm_blocks ─────────────────────────────────────────────────────
function ColorfulWarmBlocksThumb({ className = "" }: ThumbProps) {
  return (
    <div
      className={`w-full h-full p-2 ${className}`}
      style={{ backgroundColor: "#ECE8E1" }}
    >
      {/* Header : nom + petite photo */}
      <div className="flex gap-1.5 mb-2">
        <div className="flex-1 space-y-1">
          <div className="h-2 bg-gray-900 rounded w-full" />
          <div className="h-1 bg-gray-700 rounded w-2/3" />
          <div className="h-0.5 bg-gray-500 rounded w-3/4 mt-1" />
        </div>
        <div
          className="w-8 h-10 bg-gray-900 shrink-0"
          style={{ borderRadius: "1px" }}
        />
      </div>
      {/* Bloc formation 1 : violet pastel + orange date */}
      <div className="flex mb-1.5" style={{ height: "12px" }}>
        <div className="w-1/4 bg-orange-400" />
        <div
          className="flex-1 px-1 py-0.5"
          style={{ backgroundColor: "#D4AFE9" }}
        >
          <div className="h-1 bg-gray-900 rounded w-2/3" />
        </div>
      </div>
      {/* Bloc formation 2 : orange + violet date */}
      <div className="flex mb-1.5" style={{ height: "12px" }}>
        <div className="w-1/4" style={{ backgroundColor: "#BB98CE" }} />
        <div
          className="flex-1 px-1 py-0.5"
          style={{ backgroundColor: "#F4AE31" }}
        >
          <div className="h-1 bg-gray-900 rounded w-2/3" />
        </div>
      </div>
      {/* Bloc expérience : violet foncé + orange date */}
      <div className="flex mb-1.5" style={{ height: "12px" }}>
        <div className="w-1/4 bg-orange-400" />
        <div
          className="flex-1 px-1 py-0.5"
          style={{ backgroundColor: "#BB98CE" }}
        >
          <div className="h-1 bg-white rounded w-2/3" />
        </div>
      </div>
      {/* Compétences en grille */}
      <div className="grid grid-cols-2 gap-1 mt-2">
        <div
          className="h-3"
          style={{ backgroundColor: "#D4AFE9" }}
        />
        <div
          className="h-3"
          style={{ backgroundColor: "#FAB844" }}
        />
        <div
          className="h-3"
          style={{ backgroundColor: "#F4AE31" }}
        />
        <div
          className="h-3"
          style={{ backgroundColor: "#BB98CE" }}
        />
      </div>
    </div>
  );
}

// ─── developer_dark_sidebar ──────────────────────────────────────────────────
function DeveloperDarkSidebarThumb({ className = "" }: ThumbProps) {
  return (
    <div className={`bg-white w-full h-full flex ${className}`}>
      {/* Sidebar noire avec photo en haut */}
      <div className="w-[35%] bg-black flex flex-col">
        <div className="bg-gray-700 w-full" style={{ height: "40%" }} />
        <div className="px-1.5 py-1.5 space-y-1.5 text-[6px]">
          <div className="space-y-0.5">
            <div className="h-0.5 bg-white/70 rounded w-full" />
            <div className="h-0.5 bg-white/70 rounded w-3/4" />
          </div>
          <div className="space-y-0.5">
            <div className="h-0.5 bg-white rounded w-1/2" />
            <div className="h-0.5 bg-white/70 rounded" />
            <div className="h-0.5 bg-white/70 rounded w-2/3" />
          </div>
          <div className="space-y-0.5">
            <div className="h-0.5 bg-white rounded w-1/2" />
            <div className="h-0.5 bg-white/70 rounded" />
            <div className="h-0.5 bg-white/70 rounded w-2/3" />
          </div>
        </div>
      </div>
      {/* Main blanc */}
      <div className="flex-1 px-2 py-1.5">
        <div className="space-y-0.5">
          <div className="h-2 bg-gray-900 rounded w-3/4" />
          <div className="h-2 bg-gray-900 rounded w-1/2" />
          <div className="h-1 rounded w-1/2 mt-0.5" style={{ backgroundColor: "#5C7C8F" }} />
        </div>
        <div className="border-b border-dashed border-gray-300 my-2" />
        <div className="space-y-1.5">
          <div>
            <div className="h-1.5 rounded w-2/5" style={{ backgroundColor: "#5C7C8F" }} />
          </div>
          <div className="space-y-0.5">
            <div className="h-0.5 bg-gray-700 rounded w-3/4" />
            <div className="h-0.5 rounded w-1/2" style={{ backgroundColor: "#5C7C8F" }} />
            <div className={`h-0.5 ${PLACEHOLDER_LINE_LIGHT} rounded`} />
            <div className={`h-0.5 ${PLACEHOLDER_LINE_LIGHT} rounded w-5/6`} />
          </div>
          <div className="space-y-0.5">
            <div className="h-0.5 bg-gray-700 rounded w-3/4" />
            <div className="h-0.5 rounded w-1/2" style={{ backgroundColor: "#5C7C8F" }} />
            <div className={`h-0.5 ${PLACEHOLDER_LINE_LIGHT} rounded`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── sport_orange_dark ───────────────────────────────────────────────────────
function SportOrangeDarkThumb({ className = "" }: ThumbProps) {
  return (
    <div className={`bg-white w-full h-full flex ${className}`}>
      {/* Sidebar noire avec photo encadrée orange */}
      <div
        className="w-[40%] flex flex-col"
        style={{
          backgroundColor: "#0a0a0a",
          backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url(/cv-templates/sport-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="p-1.5 space-y-1.5">
          {/* Photo encadrée orange */}
          <div
            className="w-full bg-gray-700"
            style={{
              height: "32px",
              border: "2px solid #FE8010",
            }}
          />
          {/* Nom */}
          <div className="space-y-0.5">
            <div className="h-1.5 bg-white rounded w-full" />
            <div className="h-1.5 bg-white rounded w-3/4" />
          </div>
          {/* Sections sidebar avec lignes orange */}
          <div className="space-y-0.5 pt-1">
            <div className="h-0.5 rounded w-1/2" style={{ backgroundColor: "#FE8010" }} />
            <div className="h-px bg-white/40 rounded w-full" />
            <div className="h-px bg-white/40 rounded w-3/4" />
          </div>
          <div className="space-y-0.5 pt-1">
            <div className="h-0.5 rounded w-1/2" style={{ backgroundColor: "#FE8010" }} />
            <div className="h-px bg-white/40 rounded w-full" />
            <div className="h-px bg-white/40 rounded w-2/3" />
          </div>
        </div>
      </div>
      {/* Main blanc */}
      <div className="flex-1 px-2 py-1.5">
        <div className="space-y-2">
          <div>
            <div
              className="h-1.5 rounded w-2/3 pb-0.5"
              style={{ backgroundColor: "#1a1a1a" }}
            />
            <div className="h-px mt-0.5" style={{ backgroundColor: "#FE8010" }} />
          </div>
          <div className="space-y-0.5">
            <div className="h-1 bg-gray-900 rounded w-3/4" />
            <div className={`h-0.5 ${PLACEHOLDER_LINE_LIGHT} rounded`} />
            <div className={`h-0.5 ${PLACEHOLDER_LINE_LIGHT} rounded w-5/6`} />
          </div>
          <div>
            <div
              className="h-1.5 rounded w-1/2 pb-0.5"
              style={{ backgroundColor: "#1a1a1a" }}
            />
            <div className="h-px mt-0.5" style={{ backgroundColor: "#FE8010" }} />
          </div>
          <div className="space-y-0.5">
            <div className="h-1 bg-gray-900 rounded w-3/4" />
            <div className={`h-0.5 ${PLACEHOLDER_LINE_LIGHT} rounded`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── pink_red_blobs ───────────────────────────────────────────────────────────
function PinkRedBlobsThumb({ className = "" }: ThumbProps) {
  const RED = "#C41212";
  const PINK = "#f7cdd0";
  const BG = "#F8F8F8";
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ backgroundColor: BG }}
    >
      {/* Blob rouge top-right */}
      <div
        className="absolute"
        style={{
          top: "8%",
          right: "5%",
          width: "38%",
          height: "42%",
          backgroundColor: RED,
          borderRadius: "50% 50% 50% 50% / 45% 45% 55% 55%",
        }}
      />
      {/* Blob rose pâle bottom-left */}
      <div
        className="absolute"
        style={{
          bottom: "-8%",
          left: "-10%",
          width: "45%",
          height: "38%",
          backgroundColor: PINK,
          borderRadius: "50% 50% 60% 40% / 55% 45% 50% 50%",
          transform: "rotate(-30deg)",
        }}
      />
      {/* Contenu par-dessus */}
      <div className="relative p-2.5 flex flex-col h-full">
        {/* Nom */}
        <div className="space-y-0.5 mb-1">
          <div className="h-2 rounded w-1/2" style={{ backgroundColor: RED }} />
          <div className="h-2 rounded w-2/3" style={{ backgroundColor: RED }} />
        </div>
        <div className="h-1 rounded w-1/3 mb-2" style={{ backgroundColor: RED, opacity: 0.85 }} />

        {/* 2 colonnes avec séparateur pointillé */}
        <div className="flex-1 flex gap-1.5 mt-auto relative">
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0"
            style={{
              left: "44%",
              borderLeft: `1px dashed ${RED}`,
            }}
          />
          {/* Col gauche */}
          <div className="w-[42%] space-y-1">
            <div className="h-1 rounded w-3/4" style={{ backgroundColor: RED }} />
            <div className="h-px rounded w-full" style={{ backgroundColor: RED, opacity: 0.6 }} />
            <div className="h-px rounded w-5/6" style={{ backgroundColor: RED, opacity: 0.6 }} />
            <div className="h-px rounded w-2/3" style={{ backgroundColor: RED, opacity: 0.6 }} />
            <div className="border-t border-dashed mt-1" style={{ borderColor: RED }} />
            <div className="h-1 rounded w-3/4 mt-1" style={{ backgroundColor: RED }} />
            <div className="h-px rounded w-full" style={{ backgroundColor: RED, opacity: 0.6 }} />
            <div className="h-px rounded w-4/5" style={{ backgroundColor: RED, opacity: 0.6 }} />
          </div>
          {/* Col droite */}
          <div className="flex-1 space-y-1 pl-1.5">
            <div className="h-1 rounded w-full" style={{ backgroundColor: RED }} />
            <div className="h-px rounded w-3/4" style={{ backgroundColor: RED, opacity: 0.6 }} />
            <div className="h-px rounded w-full" style={{ backgroundColor: RED, opacity: 0.6 }} />
            <div className="h-px rounded w-5/6" style={{ backgroundColor: RED, opacity: 0.6 }} />
            <div className="h-1 rounded w-2/3 mt-1" style={{ backgroundColor: RED }} />
            <div className="h-px rounded w-full" style={{ backgroundColor: RED, opacity: 0.6 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Map slug → composant ─────────────────────────────────────────────────────
const THUMBS: Record<string, (props: ThumbProps) => React.ReactElement> = {
  modern_sidebar_dark: ModernSidebarDarkThumb,
  hospitality_timeline: HospitalityTimelineThumb,
  minimal_centered: MinimalCenteredThumb,
  editorial_creative: EditorialCreativeThumb,
  executive_curved: ExecutiveCurvedThumb,
  professional_modern_white: ProfessionalModernWhiteThumb,
  colorful_warm_blocks: ColorfulWarmBlocksThumb,
  developer_dark_sidebar: DeveloperDarkSidebarThumb,
  sport_orange_dark: SportOrangeDarkThumb,
  pink_red_blobs: PinkRedBlobsThumb,
};

/**
 * Slugs pour lesquels un vrai preview PNG/WebP a été fourni dans
 * /images/cv-preview/{slug}.webp. Tant qu'un slug n'est pas listé
 * ici, on garde le fallback CSS pour ne pas casser l'existant.
 * Au fur et à mesure que les CV fictifs sont produits, ajouter le
 * slug ici.
 */
const REAL_PREVIEW_SLUGS = new Set<string>([
  "pink_red_blobs",
  "sport_orange_dark",
  "developer_dark_sidebar",
  "minimal_centered",
  "colorful_warm_blocks",
  "editorial_creative",
]);

export function TemplateThumbnail({
  slug,
  className,
  fit = "cover",
}: {
  slug: string;
  className?: string;
  /**
   * `cover` (défaut) pour les mini-cards : remplit et crope au besoin.
   * `contain` pour la modal preview : montre tout le CV avec fond.
   */
  fit?: "cover" | "contain";
}) {
  // 1) Image WebP réaliste si dispo → prioritaire
  if (REAL_PREVIEW_SLUGS.has(slug)) {
    return (
      <img
        src={`/images/cv-preview/${slug}.webp`}
        alt=""
        aria-hidden="true"
        className={`w-full h-full ${fit === "contain" ? "object-contain" : "object-cover object-top"} ${className || ""}`}
        loading="lazy"
      />
    );
  }

  // 2) Fallback CSS SVG (mise en page schématique)
  const Thumb = THUMBS[slug];
  if (!Thumb) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-xs">Aperçu</span>
      </div>
    );
  }
  return <Thumb className={className} />;
}
