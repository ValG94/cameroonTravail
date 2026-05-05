/**
 * Test de validation de la clé API Resend
 * Vérifie que la clé est définie et que le client Resend peut être initialisé
 */

import { describe, it, expect } from "vitest";

describe("Resend API Key", () => {
  it("RESEND_API_KEY doit être définie dans les variables d'environnement", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(typeof apiKey).toBe("string");
    // Les clés Resend commencent par "re_"
    expect(apiKey).toMatch(/^re_/);
  });

  it("Le client Resend doit pouvoir être initialisé avec la clé", async () => {
    const { Resend } = await import("resend");
    const apiKey = process.env.RESEND_API_KEY;
    expect(() => new Resend(apiKey)).not.toThrow();
  });
});
