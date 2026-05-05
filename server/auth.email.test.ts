import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, candidats, employeurs } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Authentification Email/Password", () => {
  let testUserId: number;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "testpassword123";
  const testName = "Test User";

  // Nettoyer après les tests
  afterAll(async () => {
    const db = await getDb();
    if (db && testUserId) {
      // Supprimer l'utilisateur de test
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  describe("Inscription (register)", () => {
    it("devrait créer un nouveau candidat avec email et mot de passe", async () => {
      const caller = appRouter.createCaller(createContext());

      const result = await caller.auth.register({
        email: testEmail,
        password: testPassword,
        name: testName,
        profileType: "candidat",
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe(testName);
      expect(result.user.profileType).toBe("candidat");

      testUserId = result.user.id;

      // Vérifier que le profil candidat a été créé
      const db = await getDb();
      if (db) {
        const candidat = await db
          .select()
          .from(candidats)
          .where(eq(candidats.userId, testUserId))
          .limit(1);
        
        expect(candidat.length).toBe(1);
      }
    });

    it("devrait rejeter l'inscription avec un email déjà existant", async () => {
      const caller = appRouter.createCaller(createContext());

      await expect(
        caller.auth.register({
          email: testEmail, // Même email que le test précédent
          password: "anotherpassword",
          name: "Another User",
          profileType: "candidat",
        })
      ).rejects.toThrow("Un compte avec cet email existe déjà");
    });

    it("devrait créer un nouveau employeur avec email et mot de passe", async () => {
      const employeurEmail = `employeur-${Date.now()}@example.com`;
      const caller = appRouter.createCaller(createContext());

      const result = await caller.auth.register({
        email: employeurEmail,
        password: testPassword,
        name: "Test Employeur",
        profileType: "employeur",
      });

      expect(result.success).toBe(true);
      expect(result.user.profileType).toBe("employeur");

      // Vérifier que le profil employeur a été créé
      const db = await getDb();
      if (db) {
        const employeur = await db
          .select()
          .from(employeurs)
          .where(eq(employeurs.userId, result.user.id))
          .limit(1);
        
        expect(employeur.length).toBe(1);

        // Nettoyer
        await db.delete(users).where(eq(users.id, result.user.id));
      }
    });
  });

  describe("Connexion (login)", () => {
    it("devrait connecter un utilisateur avec email et mot de passe corrects", async () => {
      const caller = appRouter.createCaller(createContext());

      const result = await caller.auth.login({
        email: testEmail,
        password: testPassword,
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe(testEmail);
      expect(result.user.profileType).toBe("candidat");
    });

    it("devrait rejeter la connexion avec un email incorrect", async () => {
      const caller = appRouter.createCaller(createContext());

      await expect(
        caller.auth.login({
          email: "nonexistent@example.com",
          password: testPassword,
        })
      ).rejects.toThrow("Email ou mot de passe incorrect");
    });

    it("devrait rejeter la connexion avec un mot de passe incorrect", async () => {
      const caller = appRouter.createCaller(createContext());

      await expect(
        caller.auth.login({
          email: testEmail,
          password: "wrongpassword",
        })
      ).rejects.toThrow("Email ou mot de passe incorrect");
    });
  });

  describe("Sécurité des mots de passe", () => {
    it("ne devrait jamais stocker les mots de passe en clair", async () => {
      const db = await getDb();
      if (db) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId))
          .limit(1);

        expect(user[0].password).toBeDefined();
        expect(user[0].password).not.toBe(testPassword);
        // Le mot de passe haché avec bcrypt commence par $2a$ ou $2b$
        expect(user[0].password?.startsWith("$2")).toBe(true);
      }
    });
  });
});
