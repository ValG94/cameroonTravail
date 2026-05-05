import { describe, it, expect } from "vitest";

// ─── Tests de la logique de la page EspaceRecruteur ──────────────────────────

describe("EspaceRecruteur - Helpers", () => {
  // Reproduire les helpers de la page
  function parseFonctionnalites(raw: string | null): string[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [raw];
    } catch {
      return raw.split("\n").filter(Boolean);
    }
  }

  function formatPrix(prix: string, devise: string, periode: string): { montant: string; suffix: string } {
    const montant = parseFloat(prix);
    if (montant === 0) return { montant: "Gratuit", suffix: "" };
    const formatted = new Intl.NumberFormat("fr-FR").format(montant);
    const suffix = periode === "mensuel" ? "/mois" : periode === "annuel" ? "/an" : "";
    return { montant: `${formatted} ${devise}`, suffix };
  }

  describe("parseFonctionnalites", () => {
    it("retourne un tableau vide pour null", () => {
      expect(parseFonctionnalites(null)).toEqual([]);
    });

    it("parse correctement un JSON array", () => {
      const result = parseFonctionnalites('["5 offres actives", "CVthèque illimitée"]');
      expect(result).toHaveLength(2);
      expect(result[0]).toBe("5 offres actives");
      expect(result[1]).toBe("CVthèque illimitée");
    });

    it("split par newline si JSON invalide", () => {
      const result = parseFonctionnalites("5 offres actives\nCVthèque illimitée\nSupport prioritaire");
      expect(result).toHaveLength(3);
    });

    it("filtre les lignes vides", () => {
      const result = parseFonctionnalites("5 offres actives\n\nCVthèque illimitée\n");
      expect(result).toHaveLength(2);
    });
  });

  describe("formatPrix", () => {
    it("retourne 'Gratuit' pour un prix de 0", () => {
      const result = formatPrix("0", "XAF", "mensuel");
      expect(result.montant).toBe("Gratuit");
      expect(result.suffix).toBe("");
    });

    it("retourne 'Gratuit' pour un prix de 0.00", () => {
      const result = formatPrix("0.00", "XAF", "mensuel");
      expect(result.montant).toBe("Gratuit");
    });

    it("formate un prix mensuel avec devise XAF", () => {
      const result = formatPrix("15000", "XAF", "mensuel");
      expect(result.montant).toContain("XAF");
      expect(result.suffix).toBe("/mois");
    });

    it("formate un prix annuel", () => {
      const result = formatPrix("50000", "XAF", "annuel");
      expect(result.suffix).toBe("/an");
    });

    it("pas de suffix pour paiement unique", () => {
      const result = formatPrix("5000", "XAF", "unique");
      expect(result.suffix).toBe("");
    });

    it("formate correctement les grands nombres", () => {
      const result = formatPrix("150000", "XAF", "mensuel");
      expect(result.montant).toContain("XAF");
      // Le nombre doit être formaté avec séparateurs
      expect(result.montant).not.toBe("150000 XAF");
    });
  });
});

// ─── Tests de la procédure tRPC publique ─────────────────────────────────────
describe("formules.getActives - Logique de filtrage", () => {
  const toutesLesFormules = [
    { id: 1, cible: "candidat", actif: true, nom: "Gratuit Candidat", ordre: 1 },
    { id: 2, cible: "candidat", actif: false, nom: "Premium Candidat", ordre: 2 },
    { id: 3, cible: "employeur", actif: true, nom: "Gratuit Employeur", ordre: 3 },
    { id: 4, cible: "employeur", actif: true, nom: "Professionnel", ordre: 4 },
    { id: 5, cible: "employeur", actif: true, nom: "Entreprise", ordre: 5 },
  ];

  function simulateGetActives(cible?: "candidat" | "employeur") {
    return toutesLesFormules
      .filter((f) => f.actif)
      .filter((f) => !cible || f.cible === cible)
      .sort((a, b) => a.ordre - b.ordre);
  }

  it("retourne uniquement les formules actives sans filtre de cible", () => {
    const result = simulateGetActives();
    expect(result).toHaveLength(4); // 1 candidat actif + 3 employeur actifs
    expect(result.every((f) => f.actif)).toBe(true);
  });

  it("filtre correctement par cible 'employeur'", () => {
    const result = simulateGetActives("employeur");
    expect(result).toHaveLength(3);
    expect(result.every((f) => f.cible === "employeur")).toBe(true);
  });

  it("filtre correctement par cible 'candidat'", () => {
    const result = simulateGetActives("candidat");
    expect(result).toHaveLength(1); // Seulement 1 candidat actif
    expect(result[0].nom).toBe("Gratuit Candidat");
  });

  it("trie les formules par ordre croissant", () => {
    const result = simulateGetActives();
    for (let i = 1; i < result.length; i++) {
      expect(result[i].ordre).toBeGreaterThanOrEqual(result[i - 1].ordre);
    }
  });
});

// ─── Tests de la logique du formulaire d'inscription rapide ──────────────────
describe("Formulaire d'inscription rapide", () => {
  function validateForm(data: { entreprise: string; email: string }) {
    const errors: string[] = [];
    if (!data.entreprise.trim()) errors.push("Nom de l'entreprise requis");
    if (!data.email.trim()) errors.push("Email requis");
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Email invalide");
    }
    return errors;
  }

  it("valide un formulaire complet", () => {
    const errors = validateForm({ entreprise: "Groupe Fokou", email: "rh@fokou.cm" });
    expect(errors).toHaveLength(0);
  });

  it("détecte un nom d'entreprise manquant", () => {
    const errors = validateForm({ entreprise: "", email: "rh@fokou.cm" });
    expect(errors).toContain("Nom de l'entreprise requis");
  });

  it("détecte un email manquant", () => {
    const errors = validateForm({ entreprise: "Groupe Fokou", email: "" });
    expect(errors).toContain("Email requis");
  });

  it("détecte un email invalide", () => {
    const errors = validateForm({ entreprise: "Groupe Fokou", email: "pas-un-email" });
    expect(errors).toContain("Email invalide");
  });
});
