import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(profileType?: "candidat" | "employeur"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    profileType: profileType || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Profile Selection", () => {
  it("should allow user to select candidat profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.selectProfileType({ profileType: "candidat" });

    expect(result).toEqual({ success: true });
  });

  it("should allow user to select employeur profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.selectProfileType({ profileType: "employeur" });

    expect(result).toEqual({ success: true });
  });

  it("should return user with profileType in auth.me", async () => {
    const ctx = createAuthContext("candidat");
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.profileType).toBe("candidat");
  });
});

describe("Candidat Profile", () => {
  it("should allow candidat to update profile", async () => {
    const ctx = createAuthContext("candidat");
    const caller = appRouter.createCaller(ctx);

    // Créer un profil candidat d'abord
    await db.createCandidat({
      userId: ctx.user!.id,
      prenom: "Jean",
      nom: "Dupont",
    });

    const result = await caller.candidat.updateProfile({
      prenom: "Jean",
      nom: "Dupont",
      telephone: "+237612345678",
      ville: "Yaoundé",
      region: "Centre",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("Employeur Profile", () => {
  it("should allow employeur to update profile", async () => {
    const ctx = createAuthContext("employeur");
    const caller = appRouter.createCaller(ctx);

    // Créer un profil employeur d'abord
    await db.createEmployeur({
      userId: ctx.user!.id,
      nomEntreprise: "Test Company",
    });

    const result = await caller.employeur.updateProfile({
      nomEntreprise: "Test Company",
      secteurActivite: "Informatique",
      ville: "Douala",
      region: "Littoral",
    });

    expect(result).toEqual({ success: true });
  });
});
