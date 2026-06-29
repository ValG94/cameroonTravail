/**
 * Override d'images d'articles de conseils.
 *
 * Certains articles n'ont pas d'image en BDD, ou ont une image qui ne
 * reflète pas bien le sujet. On force ici l'image locale appropriée
 * pour les articles dont le slug ou le titre matche les patterns
 * définis ci-dessous (case-insensitive, recherche partielle).
 *
 * Utilisé à la fois dans :
 *  - la card sur Home.tsx (section Conseils)
 *  - la page de détail ConseilDetail.tsx (hero image)
 * → garantit la cohérence visuelle card ↔ détail.
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
  const haystack = `${article.slug || ""} ${article.titre || ""}`;
  for (const { match, src } of ARTICLE_IMAGE_OVERRIDES) {
    if (match.test(haystack)) return src;
  }
  return article.imageUrl || null;
}
