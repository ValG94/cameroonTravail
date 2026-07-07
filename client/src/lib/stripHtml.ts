/**
 * Nettoie une chaîne HTML pour l'afficher en texte brut :
 *  - supprime toutes les balises (<p>, <strong>, <br>, etc.)
 *  - decode les entités courantes (&nbsp;, &amp;, &lt;, &gt;, &quot;, &#39;)
 *  - compresse les espaces multiples
 *  - tronque à `maxLength` avec '…' final
 *
 * SSR-safe : utilise regex, ne dépend pas de DOMParser.
 * Ne fait aucun rendu HTML donc pas de risque XSS.
 */
export function stripHtml(input?: string | null, maxLength = 220): string {
  if (!input) return "";

  const text = String(input)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Decode les entités HTML courantes dans une chaîne texte.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * Convertit un HTML riche en blocs de texte brut structurés :
 *  - un paragraphe = un item du tableau retourné
 *  - les <li>, <br> et sauts de ligne deviennent des paragraphes séparés
 *  - toutes les balises inline (<strong>, <em>, <span>) sont supprimées
 *  - entités décodées
 *  - blocs vides éliminés
 *
 * Utile pour rendre la description / missions / avantages d'une offre
 * SANS `dangerouslySetInnerHTML` (donc pas de risque XSS) mais en
 * conservant la structure visuelle en paragraphes.
 */
export function htmlToBlocks(input?: string | null): string[] {
  if (!input) return [];

  return String(input)
    // Marqueur de bloc pour <p>, <li>, <br>, <div> fermants ou ouvrants
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|li|div|h[1-6])\s*>/gi, "\n")
    .replace(/<\s*(p|li|div|h[1-6])[^>]*>/gi, "\n")
    // Puis on strip tout le reste (balises inline)
    .replace(/<[^>]*>/g, "")
    // Decode entités
    .split("\n")
    .map((line) => decodeEntities(line).replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0);
}
