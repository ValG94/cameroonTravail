import { describe, it, expect } from "vitest";
import { sendEmail } from "./_core/email";

describe("Email Service", () => {
  it("devrait envoyer un email de test avec Resend", async () => {
    const success = await sendEmail({
      to: "delivered@resend.dev", // Email de test Resend
      subject: "Test - Validation clé API Resend",
      html: "<p>Ceci est un email de test pour valider la configuration Resend.</p>",
    });

    expect(success).toBe(true);
  }, 30000); // Timeout de 30 secondes pour l'envoi d'email
});
