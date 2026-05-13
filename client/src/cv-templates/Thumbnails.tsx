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

// ─── Map slug → composant ─────────────────────────────────────────────────────
const THUMBS: Record<string, (props: ThumbProps) => React.ReactElement> = {
  modern_sidebar_dark: ModernSidebarDarkThumb,
  hospitality_timeline: HospitalityTimelineThumb,
  minimal_centered: MinimalCenteredThumb,
  editorial_creative: EditorialCreativeThumb,
  executive_curved: ExecutiveCurvedThumb,
};

export function TemplateThumbnail({ slug, className }: { slug: string; className?: string }) {
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
