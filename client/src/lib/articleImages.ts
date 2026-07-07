/**
 * Résolution de l'image d'un article de conseils.
 *
 * Priorité :
 *  1. L'image uploadée en BDD (imageUrl) — source de vérité éditée
 *     par l'admin depuis /admin/articles. Toujours prioritaire pour
 *     que les modifications admin soient visibles côté public.
 *  2. Fallback : override statique local par regex sur slug/titre —
 *     utilisé UNIQUEMENT si l'article n'a pas encore d'image uploadée
 *     (typiquement les seeds initiaux importés en base sans image).
 *  3. null si ni imageUrl ni override.
 *
 * Utilisé à la fois dans :
 *  - la card sur Home.tsx (section Conseils)
 *  - la page de détail ConseilDetail.tsx (hero image)
 * → garantit la cohérence visuelle card ↔ détail tout en laissant
 * l'admin reprendre la main via un upload dans le back-office.
 */

interface ArticleLike {
  slug?: string | null;
  titre?: string | null;
  imageUrl?: string | null;
}

const ARTICLE_IMAGE_OVERRIDES: { match: RegExp; src: string }[] = [
  { match: /entretien|interview/i, src: "/images/home/interview-scene.webp" },
  { match: /freelance|activit[ée]/i, src: "/images/home/meeting-room.webp" },
];

export function getArticleImage(article: ArticleLike): string | null {
  // 1) Image uploadée = priorité absolue (admin a la main)
  if (article.imageUrl && article.imageUrl.trim().length > 0) {
    return article.imageUrl;
  }
  // 2) Fallback statique par regex pour les seeds sans image
  const haystack = `${article.slug || ""} ${article.titre || ""}`;
  for (const { match, src } of ARTICLE_IMAGE_OVERRIDES) {
    if (match.test(haystack)) return src;
  }
  return null;
}
