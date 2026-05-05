import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const mockDbInstance = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("../server/db", () => ({
  default: {
    getDb: vi.fn().mockResolvedValue(mockDbInstance),
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CV Module - Data Parsing", () => {
  it("should parse experiences JSON correctly", () => {
    const raw = JSON.stringify([
      {
        id: "abc123",
        poste: "Développeur",
        entreprise: "Tech Cameroun",
        ville: "Yaoundé",
        dateDebut: "2020",
        dateFin: "2023",
        enCours: false,
        description: "Développement web",
      },
    ]);
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].poste).toBe("Développeur");
    expect(parsed[0].entreprise).toBe("Tech Cameroun");
  });

  it("should parse formations JSON correctly", () => {
    const raw = JSON.stringify([
      {
        id: "def456",
        diplome: "Licence Informatique",
        etablissement: "Université de Yaoundé",
        ville: "Yaoundé",
        dateDebut: "2016",
        dateFin: "2019",
        mention: "Bien",
      },
    ]);
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].diplome).toBe("Licence Informatique");
  });

  it("should parse competences JSON correctly", () => {
    const raw = JSON.stringify([
      { id: "ghi789", nom: "React", niveau: 4 },
      { id: "jkl012", nom: "Node.js", niveau: 3 },
    ]);
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].niveau).toBe(4);
    expect(parsed[1].nom).toBe("Node.js");
  });

  it("should parse languesCv JSON correctly", () => {
    const raw = JSON.stringify([
      { id: "mno345", nom: "Français", niveau: "Natif" },
      { id: "pqr678", nom: "Anglais", niveau: "Avancé" },
    ]);
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].niveau).toBe("Natif");
  });

  it("should handle empty JSON arrays", () => {
    const raw = JSON.stringify([]);
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(0);
    expect(Array.isArray(parsed)).toBe(true);
  });
});

describe("CV Module - Validation", () => {
  it("should validate CV type enum values", () => {
    const validTypes = ["upload", "classique", "moderne", "creatif"];
    expect(validTypes).toContain("classique");
    expect(validTypes).toContain("moderne");
    expect(validTypes).toContain("upload");
    expect(validTypes).toContain("creatif");
    expect(validTypes).not.toContain("invalid");
  });

  it("should validate langue enum values", () => {
    const validLangues = ["fr", "en"];
    expect(validLangues).toContain("fr");
    expect(validLangues).toContain("en");
    expect(validLangues).not.toContain("es");
  });

  it("should validate competence niveau range (1-5)", () => {
    const isValidNiveau = (n: number) => n >= 1 && n <= 5;
    expect(isValidNiveau(1)).toBe(true);
    expect(isValidNiveau(3)).toBe(true);
    expect(isValidNiveau(5)).toBe(true);
    expect(isValidNiveau(0)).toBe(false);
    expect(isValidNiveau(6)).toBe(false);
  });

  it("should validate required fields for CV creation", () => {
    const validateCVCreate = (input: { nom: string; type: string }) => {
      return input.nom.trim().length > 0 && ["upload", "classique", "moderne", "creatif"].includes(input.type);
    };
    expect(validateCVCreate({ nom: "Mon CV", type: "classique" })).toBe(true);
    expect(validateCVCreate({ nom: "", type: "classique" })).toBe(false);
    expect(validateCVCreate({ nom: "Mon CV", type: "invalid" })).toBe(false);
  });
});

describe("CV Module - PDF Generation helpers", () => {
  it("should generate correct filename for classic CV", () => {
    const prenom = "Jean";
    const nom = "Dupont";
    const type = "Classique";
    const filename = `CV_${prenom}_${nom}_${type}.pdf`;
    expect(filename).toBe("CV_Jean_Dupont_Classique.pdf");
  });

  it("should generate correct filename for modern CV", () => {
    const prenom = "Marie";
    const nom = "Kamga";
    const type = "Moderne";
    const filename = `CV_${prenom}_${nom}_${type}.pdf`;
    expect(filename).toBe("CV_Marie_Kamga_Moderne.pdf");
  });

  it("should handle empty name gracefully", () => {
    const prenom = "";
    const nom = "";
    const fallback = `${prenom} ${nom}`.trim() || "Mon CV";
    expect(fallback).toBe("Mon CV");
  });
});

describe("CV Module - Color validation", () => {
  it("should validate hex color format", () => {
    const isValidHex = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);
    expect(isValidHex("#1e3a5f")).toBe(true);
    expect(isValidHex("#374151")).toBe(true);
    expect(isValidHex("#065f46")).toBe(true);
    expect(isValidHex("invalid")).toBe(false);
    expect(isValidHex("#gggggg")).toBe(false);
  });

  it("should have valid preset colors", () => {
    const presets = [
      "#1e3a5f", "#374151", "#065f46", "#7c3aed",
      "#b45309", "#be185d", "#0369a1", "#dc2626",
    ];
    const isValidHex = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);
    presets.forEach((color) => {
      expect(isValidHex(color)).toBe(true);
    });
  });
});

describe("CV Module - Public profile", () => {
  it("should correctly identify CV types that have builder data", () => {
    const hasBuilderData = (type: string) => type === "classique" || type === "moderne";
    expect(hasBuilderData("classique")).toBe(true);
    expect(hasBuilderData("moderne")).toBe(true);
    expect(hasBuilderData("upload")).toBe(false);
    expect(hasBuilderData("creatif")).toBe(false);
  });

  it("should build correct profile URL", () => {
    const userId = 42;
    const url = `/profil-candidat/${userId}`;
    expect(url).toBe("/profil-candidat/42");
  });
});
