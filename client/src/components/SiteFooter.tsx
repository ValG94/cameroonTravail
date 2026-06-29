import { useState } from "react";
import { useLocation } from "wouter";
import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { toast } from "sonner";

/**
 * Footer global du site — utilisé sur 13 pages.
 *
 * Identité : vert profond #063F24 (institutionnel camerounais), accent
 * or #F6C343 pour les hovers. Cohérence totale avec le header et la
 * homepage refondue. Liens préservés intégralement (toutes les routes
 * existantes restent fonctionnelles).
 */

const COLORS = {
  /** Vert encore plus sombre que la palette globale, pour donner du
   *  poids au footer et le distinguer du CTA final (qui utilise déjà
   *  le deepGreen #063F24). */
  deepGreen: "#021307",
  emerald: "#0F8A4C",
  gold: "#F6C343",
};

interface LinkItem {
  label: string;
  href: string;
  external?: boolean;
}

const CANDIDATS_LINKS: LinkItem[] = [
  { label: "Toutes les offres", href: "/offres" },
  { label: "Emploi public", href: "/emploi-public" },
  { label: "Emploi privé", href: "/emploi-prive" },
  { label: "Créer mon CV", href: "/candidat/cv" },
  { label: "Conseils carrière", href: "/conseils" },
];

const RECRUTEURS_LINKS: LinkItem[] = [
  { label: "Espace recruteur", href: "/espace-recruteur" },
  { label: "Publier une offre", href: "/employeur/publier" },
  { label: "Créer un compte", href: "/inscription/employeur" },
  { label: "Tarifs", href: "/espace-recruteur#tarifs" },
];

const PLATFORM_LINKS: LinkItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Conseils & magazine", href: "/conseils" },
  { label: "Connexion", href: "/connexion" },
  { label: "Inscription", href: "/inscription" },
];

const LEGAL_LINKS: LinkItem[] = [
  { label: "Mentions légales", href: "#" },
  { label: "Conditions d'utilisation", href: "#" },
  { label: "Politique de confidentialité", href: "#" },
];

export default function SiteFooter() {
  const [, setLocation] = useLocation();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  // Newsletter : stub côté UI. À brancher quand le backend exposera
  // une route trpc.newsletter.subscribe ou équivalent.
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }
    setSubscribing(true);
    setTimeout(() => {
      toast.success("Merci ! Vous recevrez bientôt nos meilleures offres.");
      setNewsletterEmail("");
      setSubscribing(false);
    }, 500);
  };

  const handleNav = (href: string) => {
    if (href.startsWith("#")) return;
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    setLocation(href);
  };

  return (
    <footer
      className="text-white pt-16 pb-8 relative overflow-hidden"
      style={{ backgroundColor: COLORS.deepGreen }}
    >
      {/* Topographie SVG décorative très subtile */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="footer-topo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="36" stroke="#F6C343" strokeWidth="0.5" fill="none" />
            <circle cx="40" cy="40" r="24" stroke="#F6C343" strokeWidth="0.5" fill="none" />
            <circle cx="40" cy="40" r="12" stroke="#F6C343" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-topo)" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Grille principale (12 cols : 3+2+2+2+3 → tient en une ligne) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Bloc identité */}
          <div className="lg:col-span-3">
            <button
              onClick={() => setLocation("/")}
              className="inline-flex items-center gap-3 mb-5 group"
              aria-label="Retour à l'accueil"
            >
              <img
                src="/logo-cameroon-travail.webp"
                alt="Cameroon Travail"
                className="h-14 w-auto object-contain"
              />
              <span
                className="text-lg font-bold tracking-tight hidden sm:block group-hover:text-[color:var(--accent)] transition-colors"
                style={{ ["--accent" as string]: COLORS.gold }}
              >
                Cameroon Travail
              </span>
            </button>
            <p className="text-sm text-white/75 leading-relaxed max-w-sm">
              La plateforme nationale qui connecte les talents aux meilleures opportunités d'emploi au Cameroun et dans la diaspora.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-2 mt-6">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Twitter, label: "Twitter / X" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-white/15 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/10 flex items-center justify-center transition-all"
                  style={{ ["--accent" as string]: COLORS.gold }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Candidats */}
          <FooterColumn title="Candidats" links={CANDIDATS_LINKS} onNav={handleNav} />

          {/* Recruteurs */}
          <FooterColumn title="Recruteurs" links={RECRUTEURS_LINKS} onNav={handleNav} />

          {/* À propos */}
          <FooterColumn title="À propos" links={PLATFORM_LINKS} onNav={handleNav} />

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h3
              className="font-bold mb-3 text-sm uppercase tracking-wider"
              style={{ color: COLORS.gold }}
            >
              Newsletter
            </h3>
            <p className="text-sm text-white/75 mb-4 leading-relaxed">
              Recevez nos conseils et nos meilleures offres d'emploi chaque semaine.
            </p>
            {/* Newsletter input + bouton TOUJOURS sur la même ligne
                (la colonne fait lg:col-span-3 → environ 25% de la grille
                ce qui suffit pour faire tenir input + bouton inline). */}
            <form onSubmit={handleNewsletterSubmit} className="flex flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: COLORS.gold }} />
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Votre email"
                  className="w-full h-10 pl-10 pr-3 text-sm rounded-lg border bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="h-10 px-4 sm:px-5 text-sm font-semibold rounded-lg transition-all disabled:opacity-60 shrink-0 whitespace-nowrap"
                style={{ backgroundColor: COLORS.emerald, color: "white" }}
              >
                {subscribing ? "..." : "S'abonner"}
              </button>
            </form>

            {/* Contact rapide en-dessous */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5 text-xs text-white/70">
              <a href="tel:+237600000000" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
                +237 6XX XX XX XX
              </a>
              <a href="mailto:contact@cameroon-travail.cm" className="flex items-center gap-2 hover:text-white transition-colors break-all">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: COLORS.gold }} />
                contact@cameroon-travail.cm
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
                Douala / Yaoundé, Cameroun
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bas du footer : copyright + légal ─────────────────── */}
        <div className="border-t border-white/10 pt-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Cameroon Travail. Tous droits réservés.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[color:var(--accent)] transition-colors"
                style={{ ["--accent" as string]: COLORS.gold }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Sous-composant : colonne de liens ────────────────────────────────────────

function FooterColumn({
  title,
  links,
  onNav,
}: {
  title: string;
  links: LinkItem[];
  onNav: (href: string) => void;
}) {
  return (
    <div className="lg:col-span-2">
      <h3
        className="font-bold mb-4 text-sm uppercase tracking-wider"
        style={{ color: COLORS.gold }}
      >
        {title}
      </h3>
      <ul className="space-y-2.5 text-sm text-white/80">
        {links.map((link) => (
          <li key={link.label}>
            <button
              onClick={() => onNav(link.href)}
              className="text-left hover:text-[color:var(--accent)] transition-colors"
              style={{ ["--accent" as string]: COLORS.gold }}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
