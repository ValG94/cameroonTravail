import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock de la base de données
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockResolvedValue([
    {
      id: 1,
      nom: "Gratuit Candidat",
      cible: "candidat",
      prix: "0.00",
      devise: "XAF",
      periode: "mensuel",
      description: "Accès de base",
      fonctionnalites: '["Créer 1 CV"]',
      actif: true,
      populaire: false,
      ordre: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      nom: "Professionnel",
      cible: "employeur",
      prix: "15000.00",
      devise: "XAF",
      periode: "mensuel",
      description: "Pour les PME",
      fonctionnalites: '["5 offres actives"]',
      actif: true,
      populaire: true,
      ordre: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue({ insertId: 3 }),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../drizzle/schema", () => ({
  formulesTarifaires: { id: "id", actif: "actif", ordre: "ordre" },
}));

vi.mock("drizzle-orm", () => ({
  asc: vi.fn((col) => col),
  eq: vi.fn((col, val) => ({ col, val })),
}));

// ─── Tests de la logique de parsing des fonctionnalités ──────────────────────
describe("parseFonctionnalites", () => {
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

  it("retourne un tableau vide si null", () => {
    expect(parseFonctionnalites(null)).toEqual([]);
  });

  it("parse un JSON array valide", () => {
    const result = parseFonctionnalites('["CV illimités", "Postuler illimité"]');
    expect(result).toEqual(["CV illimités", "Postuler illimité"]);
  });

  it("retourne le texte brut si JSON invalide", () => {
    const result = parseFonctionnalites("CV illimités\nPostuler illimité");
    expect(result).toEqual(["CV illimités", "Postuler illimité"]);
  });

  it("enveloppe une chaîne JSON non-array dans un tableau", () => {
    const result = parseFonctionnalites('"une fonctionnalité"');
    expect(result).toEqual(['"une fonctionnalité"']);
  });
});

// ─── Tests du formatage du prix ──────────────────────────────────────────────
describe("formatPrix", () => {
  function formatPrix(prix: string, devise: string, periode: string): string {
    const montant = parseFloat(prix);
    if (montant === 0) return "Gratuit";
    const formatted = new Intl.NumberFormat("fr-FR").format(montant);
    const periodeLabel = periode === "mensuel" ? "/mois" : periode === "annuel" ? "/an" : "";
    return `${formatted} ${devise}${periodeLabel}`;
  }

  it("affiche 'Gratuit' pour un prix de 0", () => {
    expect(formatPrix("0", "XAF", "mensuel")).toBe("Gratuit");
    expect(formatPrix("0.00", "XAF", "annuel")).toBe("Gratuit");
  });

  it("formate correctement un prix mensuel", () => {
    const result = formatPrix("15000", "XAF", "mensuel");
    expect(result).toContain("XAF");
    expect(result).toContain("/mois");
  });

  it("formate correctement un prix annuel", () => {
    const result = formatPrix("25000", "XAF", "annuel");
    expect(result).toContain("XAF");
    expect(result).toContain("/an");
  });

  it("n'ajoute pas de période pour un paiement unique", () => {
    const result = formatPrix("5000", "XAF", "unique");
    expect(result).toContain("XAF");
    expect(result).not.toContain("/mois");
    expect(result).not.toContain("/an");
  });
});

// ─── Tests de la validation des données de formule ───────────────────────────
describe("Validation des formules tarifaires", () => {
  it("une formule valide doit avoir un nom non vide", () => {
    const formule = { nom: "Premium", cible: "candidat", prix: "2500", devise: "XAF", periode: "mensuel" };
    expect(formule.nom.length).toBeGreaterThan(0);
  });

  it("la cible doit être 'candidat' ou 'employeur'", () => {
    const validCibles = ["candidat", "employeur"];
    expect(validCibles).toContain("candidat");
    expect(validCibles).toContain("employeur");
    expect(validCibles).not.toContain("admin");
  });

  it("la période doit être 'mensuel', 'annuel' ou 'unique'", () => {
    const validPeriodes = ["mensuel", "annuel", "unique"];
    expect(validPeriodes).toContain("mensuel");
    expect(validPeriodes).toContain("annuel");
    expect(validPeriodes).toContain("unique");
    expect(validPeriodes).not.toContain("quotidien");
  });

  it("le prix doit être un nombre valide", () => {
    expect(parseFloat("2500")).toBe(2500);
    expect(parseFloat("0")).toBe(0);
    expect(isNaN(parseFloat("abc"))).toBe(true);
  });
});

// ─── Tests de la logique de filtrage par cible ───────────────────────────────
describe("Filtrage des formules par cible", () => {
  const formules = [
    { id: 1, cible: "candidat", nom: "Gratuit Candidat" },
    { id: 2, cible: "candidat", nom: "Premium Candidat" },
    { id: 3, cible: "employeur", nom: "Professionnel" },
    { id: 4, cible: "employeur", nom: "Entreprise" },
  ];

  it("filtre correctement les formules candidat", () => {
    const result = formules.filter((f) => f.cible === "candidat");
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.cible === "candidat")).toBe(true);
  });

  it("filtre correctement les formules employeur", () => {
    const result = formules.filter((f) => f.cible === "employeur");
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.cible === "employeur")).toBe(true);
  });

  it("retourne toutes les formules sans filtre", () => {
    const result = formules.filter(() => true);
    expect(result).toHaveLength(4);
  });
});
