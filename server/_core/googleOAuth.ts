/**
 * Routes Google OAuth pour Cameroon Travail.
 *
 * Flow :
 *  1. Frontend → GET /api/auth/google → redirige vers Google consent
 *  2. Utilisateur valide sur Google → Google redirige vers
 *     GET /api/auth/google/callback?code=... avec un code temporaire
 *  3. Backend échange le code contre des tokens, récupère les infos
 *     user (email, name, sub), crée ou lie le user en DB, génère un
 *     JWT de session (même cookie que login email), redirige vers
 *     le frontend avec ?google=success
 *  4. Frontend détecte le query param, invalide auth.me, redirige
 *     vers le dashboard
 *
 * Sécurité :
 *  - State param signé (cookie httpOnly) pour prévenir CSRF
 *  - Tokens Google échangés en backend uniquement (jamais exposés)
 *  - Redirect frontend whitelisté via ENV.frontendUrl
 *
 * Si les variables d'env Google ne sont pas définies, les routes
 * répondent 503 (Service Unavailable) pour permettre au déploiement
 * de fonctionner même sans OAuth configuré.
 */

import type { Express, Request, Response } from "express";
import { SignJWT } from "jose";
import { randomBytes } from "node:crypto";
import { ENV } from "./env";
import * as db from "../db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

const OAUTH_STATE_COOKIE = "ct_oauth_state";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;      // identifiant unique stable Google
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

function isOAuthConfigured(): boolean {
  return !!(ENV.googleClientId && ENV.googleClientSecret && ENV.googleRedirectUri);
}

/**
 * Parse le header Cookie d'une requête pour récupérer la valeur d'un
 * cookie nommé. Évite d'introduire cookie-parser comme dépendance
 * (le format est trivial : "name1=value1; name2=value2").
 */
function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** Redirection frontend avec query params propre (preserve hash). */
function frontendRedirect(res: Response, path: string, params: Record<string, string>) {
  const base = ENV.frontendUrl || "/";
  const url = new URL(path, base);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return res.redirect(url.toString());
}

export function registerGoogleOAuthRoutes(app: Express) {
  // ─── Étape 1 : initier le flow ────────────────────────────────────
  // Accepte ?profileType=candidat|employeur pour mémoriser le type
  // souhaité (utilisé à l'inscription depuis les pages dédiées).
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!isOAuthConfigured()) {
      console.error("[oauth] GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI non définis");
      return res.status(503).json({ error: "Google OAuth non configuré sur ce serveur" });
    }

    // State anti-CSRF stocké en cookie httpOnly + comparé au retour.
    // On y embarque aussi le profileType souhaité (sous forme JSON
    // sérialisé) pour ne pas le perdre durant le round-trip Google.
    const profileType = req.query.profileType === "candidat" || req.query.profileType === "employeur"
      ? String(req.query.profileType)
      : "";
    const nonce = randomBytes(16).toString("hex");
    const state = Buffer.from(JSON.stringify({ nonce, profileType })).toString("base64url");

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(OAUTH_STATE_COOKIE, nonce, {
      ...cookieOptions,
      maxAge: 10 * 60 * 1000, // 10 min suffisent largement pour le flow
    });

    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: ENV.googleRedirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
      access_type: "online",
    });
    return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  });

  // ─── Étape 2 : callback Google ────────────────────────────────────
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    if (!isOAuthConfigured()) {
      return res.status(503).send("Google OAuth non configuré");
    }

    const { code, state, error } = req.query as Record<string, string | undefined>;

    if (error) {
      console.warn("[oauth] Google a retourné une erreur:", error);
      return frontendRedirect(res, "/connexion", { google: "error", reason: error });
    }
    if (!code || !state) {
      return frontendRedirect(res, "/connexion", { google: "error", reason: "missing_code" });
    }

    // Vérification state (anti-CSRF)
    const stateCookie = readCookie(req, OAUTH_STATE_COOKIE);
    let parsedState: { nonce: string; profileType: string };
    try {
      parsedState = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    } catch {
      return frontendRedirect(res, "/connexion", { google: "error", reason: "invalid_state" });
    }
    if (!stateCookie || stateCookie !== parsedState.nonce) {
      return frontendRedirect(res, "/connexion", { google: "error", reason: "state_mismatch" });
    }
    // Nettoyer le cookie state
    res.clearCookie(OAUTH_STATE_COOKIE, getSessionCookieOptions(req));

    try {
      // ─── Échange code → tokens ──────────────────────────────────
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: ENV.googleRedirectUri,
          grant_type: "authorization_code",
        }),
      });
      if (!tokenRes.ok) {
        const txt = await tokenRes.text();
        console.error("[oauth] Token exchange failed:", tokenRes.status, txt);
        return frontendRedirect(res, "/connexion", { google: "error", reason: "token_exchange" });
      }
      const tokens = (await tokenRes.json()) as GoogleTokenResponse;

      // ─── Fetch user info ────────────────────────────────────────
      const userRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!userRes.ok) {
        console.error("[oauth] userinfo fetch failed:", userRes.status);
        return frontendRedirect(res, "/connexion", { google: "error", reason: "userinfo" });
      }
      const profile = (await userRes.json()) as GoogleUserInfo;
      if (!profile.email || !profile.email_verified) {
        return frontendRedirect(res, "/connexion", { google: "error", reason: "email_unverified" });
      }

      // ─── Find or create user ────────────────────────────────────
      // 1. Cherche par googleId. 2. Sinon par email (link account
      //    existant inscrit avec password). 3. Sinon créer nouveau.
      const dbInstance = await db.getDb();
      if (!dbInstance) {
        return frontendRedirect(res, "/connexion", { google: "error", reason: "db_unavailable" });
      }
      const { users, candidats, employeurs } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      let user = (await dbInstance.select().from(users).where(eq(users.googleId, profile.sub)).limit(1))[0];

      if (!user) {
        // Pas trouvé par googleId : essayer par email
        const byEmail = (await dbInstance.select().from(users).where(eq(users.email, profile.email)).limit(1))[0];
        if (byEmail) {
          // Lier l'account existant à Google (set googleId)
          await dbInstance.update(users).set({ googleId: profile.sub, lastSignedIn: new Date() }).where(eq(users.id, byEmail.id));
          user = { ...byEmail, googleId: profile.sub };
        } else {
          // Nouvel utilisateur : créer + profil correspondant.
          // Le profileType vient du state (page d'inscription d'origine),
          // sinon "candidat" par défaut.
          const wantedProfileType = parsedState.profileType === "employeur" ? "employeur" : "candidat";
          const inserted = await dbInstance
            .insert(users)
            .values({
              openId: `google-${profile.sub}`,
              email: profile.email,
              name: profile.name || `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim() || profile.email,
              googleId: profile.sub,
              loginMethod: "google",
              profileType: wantedProfileType,
            })
            .returning();
          user = inserted[0];

          // Créer la ligne profil candidat/employeur correspondante
          if (wantedProfileType === "candidat") {
            await dbInstance.insert(candidats).values({
              userId: user.id,
              prenom: profile.given_name || null,
              nom: profile.family_name || null,
            });
          } else {
            await dbInstance.insert(employeurs).values({
              userId: user.id,
              nomEntreprise: "",
              prenomContact: profile.given_name || null,
              nomContact: profile.family_name || null,
              emailContact: profile.email,
            });
          }
        }
      } else {
        // User connu : maj lastSignedIn
        await dbInstance.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
      }

      // ─── Génère JWT + pose le cookie de session ─────────────────
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const token = await new SignJWT({ userId: user.id, openId: user.openId || `google-${profile.sub}` })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret);

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30j
      });

      // ─── Redirige vers le frontend avec un flag de succès ───────
      // Le frontend détecte ?google=success, invalide auth.me et
      // navigue vers le dashboard approprié.
      return frontendRedirect(res, "/connexion", { google: "success" });
    } catch (err) {
      console.error("[oauth] Exception:", err);
      return frontendRedirect(res, "/connexion", { google: "error", reason: "internal" });
    }
  });
}
