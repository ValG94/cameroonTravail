import "dotenv/config";
// Polyfill globalThis.crypto pour Node 18 (jose en a besoin pour signer le JWT)
// À retirer quand Railway sera passé sur Node 20+ (où c'est natif)
import { webcrypto } from "node:crypto";
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { setupVite, serveStatic } from "./vite";
import { initStorageBuckets } from "../storage";
import { ENV } from "./env";
import { sdk } from "./sdk";

// ─── CORS origins ──────────────────────────────────────────────────────────────
const normalizeOrigin = (s: string) => s.trim().toLowerCase().replace(/\/+$/, "");
const isDev = process.env.NODE_ENV !== "production";

// FAIL-FAST en production : refuse de démarrer si CORS_ORIGIN n'est pas défini.
// Sans cette garde, l'API tomberait sur le fallback localhost et accepterait
// silencieusement les requêtes depuis 'http://localhost:3000' depuis n'importe
// quel attaquant (ou rejetterait toutes les vraies origines, selon l'angle).
if (!isDev && !ENV.corsOrigin) {
  console.error(
    "[CORS] ⛔ CORS_ORIGIN non défini en production. Refus de démarrer.\n" +
      "Définissez la variable CORS_ORIGIN avec l'URL de votre frontend " +
      "(ex: https://cameroon-travail.vercel.app)."
  );
  process.exit(1);
}

const allowedOrigins = ENV.corsOrigin
  ? ENV.corsOrigin.split(",").map(normalizeOrigin).filter(Boolean)
  : ["http://localhost:5173", "http://localhost:3000"];

// Pattern pour autoriser les preview deployments Vercel de notre projet
// (ex: cameroon-travail-git-feat-xxx-valg94s-projects.vercel.app).
// On ne whitelist QUE les sous-domaines qui commencent par "cameroon-travail-"
// pour ne pas ouvrir CORS à n'importe quel projet Vercel.
const VERCEL_PREVIEW_PATTERN = /^https:\/\/cameroon-travail-[a-z0-9-]+\.vercel\.app$/;
// En dev, on autorise tout localhost / 127.0.0.1 quel que soit le port
const LOCAL_DEV_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const isOriginAllowed = (origin: string): boolean => {
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalized)) return true;
  if (VERCEL_PREVIEW_PATTERN.test(normalized)) return true;
  if (isDev && LOCAL_DEV_PATTERN.test(normalized)) return true;
  return false;
};

console.log("[CORS] CORS_ORIGIN env =", JSON.stringify(ENV.corsOrigin));
console.log("[CORS] allowedOrigins =", allowedOrigins);
console.log("[CORS] Vercel preview pattern enabled:", VERCEL_PREVIEW_PATTERN.toString());
if (isDev) console.log("[CORS] DEV mode — localhost/127.0.0.1 auto-allowed");

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Railway/Vercel placent l'IP réelle dans X-Forwarded-For — fait confiance au 1er proxy
  app.set("trust proxy", 1);

  // Disable automatic ETag — prevents browsers caching API responses as HTML
  app.disable("etag");

  // ─── CORS manuel (prioritaire — garantit les headers même sur erreur 5xx) ───
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    const allowed = !!origin && isOriginAllowed(origin);

    if (origin) {
      console.log(`[CORS] origin="${origin}" allowed=${allowed}`);
    }

    if (origin && allowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // ─── Sécurité HTTP headers ──────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    })
  );

  // ─── Rate limiting global ───────────────────────────────────────────────────
  const corsHandler = (req: any, res: any) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && isOriginAllowed(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  };

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        corsHandler(req, res);
        res.status(429).json({ error: "Trop de requêtes, réessayez dans quelques minutes." });
      },
    })
  );

  // ─── Rate limiting strict sur auth (login, register) ──────────────────────
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    handler: (req, res) => {
      corsHandler(req, res);
      res.status(429).json({ error: "Trop de tentatives, réessayez dans 15 minutes." });
    },
  });
  app.use("/api/trpc/auth.login", authLimiter);
  app.use("/api/trpc/auth.register", authLimiter);

  // Reset password : limite très stricte (anti-spam d'emails)
  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1h
    max: 5,
    handler: (req, res) => {
      corsHandler(req, res);
      res.status(429).json({
        error: "Trop de demandes de réinitialisation. Réessayez dans 1 heure.",
      });
    },
  });
  app.use("/api/trpc/auth.requestPasswordReset", passwordResetLimiter);

  // Uploads : limite stricte (coût CPU + storage)
  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1h
    max: 30,
    handler: (req, res) => {
      corsHandler(req, res);
      res.status(429).json({
        error: "Trop d'uploads. Réessayez dans 1 heure.",
      });
    },
  });
  app.use("/api/upload-cv", uploadLimiter);
  app.use("/api/upload", uploadLimiter);

  // Paiements premium : limite stricte (anti-fraude + protection MoMo/Orange)
  const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    handler: (req, res) => {
      corsHandler(req, res);
      res.status(429).json({
        error: "Trop de tentatives de paiement. Réessayez dans 15 minutes.",
      });
    },
  });
  app.use("/api/trpc/cvTemplates.initiatePurchase", paymentLimiter);

  // ─── Body parsing ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // ─── Pas de cache sur les API ───────────────────────────────────────────────
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  // ─── Health check ───────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  });

  // ─── Upload CV (multipart) — authentification requise ──────────────────────
  app.post("/api/upload-cv", async (req, res) => {
    try {
      // Vérifier l'authentification
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user) return res.status(401).json({ error: "Non authentifié" });

      const busboy = await import("busboy");
      const bb = busboy.default({
        headers: req.headers,
        limits: { fileSize: 10 * 1024 * 1024 },
      });

      let fileBuffer: Buffer | null = null;
      let fileName = "cv-upload";
      let mimeType = "application/pdf";
      const chunks: Buffer[] = [];

      bb.on("file", (_fieldname: string, file: any, info: any) => {
        fileName = info.filename || "cv-upload";
        mimeType = info.mimeType || "application/pdf";
        file.on("data", (data: Buffer) => chunks.push(data));
        file.on("end", () => { fileBuffer = Buffer.concat(chunks); });
      });

      bb.on("finish", async () => {
        if (!fileBuffer) return res.status(400).json({ error: "Aucun fichier" });

        // Validation magic bytes + extension + scripts embarqués
        const { fileTypeFromBuffer } = await import("file-type");
        const { validatePdfUpload } = await import("./uploadGuards");
        const detected = await fileTypeFromBuffer(fileBuffer).catch(() => null);
        const validation = validatePdfUpload(fileBuffer, fileName, detected?.mime);
        if (!validation.ok) {
          console.warn(
            `[upload-cv] Rejeté pour user ${user.id} (${validation.code}): ${fileName}`
          );
          return res.status(400).json({ error: validation.message });
        }

        const { storagePut } = await import("../storage");
        const { nanoid } = await import("nanoid");
        const key = `cv-uploads/${nanoid()}.pdf`;
        const result = await storagePut(key, fileBuffer, "application/pdf");
        res.json({ url: result.url, key: result.key });
      });

      bb.on("error", (err: any) => res.status(500).json({ error: err.message }));
      req.pipe(bb);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  // ─── Upload photo (base64) — authentification requise ──────────────────────
  app.post("/api/upload", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user) return res.status(401).json({ error: "Non authentifié" });

      const { fileData, fileName, mimeType, fileKey } = req.body;
      if (!fileData || !fileName || !mimeType || !fileKey) {
        return res.status(400).json({ error: "Champs manquants" });
      }

      const buffer = Buffer.from(fileData, "base64");

      // Validation magic bytes + extension du nom de fichier
      const { fileTypeFromBuffer } = await import("file-type");
      const { validateImageUpload, sanitizeStorageKey } = await import("./uploadGuards");
      const detected = await fileTypeFromBuffer(buffer).catch(() => null);
      const validation = validateImageUpload(buffer, fileName, detected?.mime);
      if (!validation.ok) {
        console.warn(
          `[upload] Rejeté pour user ${user.id} (${validation.code}): ${fileName}`
        );
        return res.status(400).json({ error: validation.message });
      }

      // fileKey provient du client → on sanitise pour éviter le path traversal
      const safeKey = sanitizeStorageKey(fileKey);
      if (!safeKey) return res.status(400).json({ error: "Clé de stockage invalide" });
      const { storagePut } = await import("../storage");
      const result = await storagePut(safeKey, buffer, mimeType);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  // ─── tRPC ───────────────────────────────────────────────────────────────────
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  // ─── Frontend (dev: Vite HMR | prod: fichiers statiques) ───────────────────
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ─── Gestionnaire d'erreurs global (retourne JSON, pas HTML) ──────────────
  app.use((err: any, req: any, res: any, _next: any) => {
    console.error("[Express Error]", err?.message ?? err);
    if (!res.headersSent) {
      const origin = req.headers?.origin as string | undefined;
      if (origin && isOriginAllowed(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
    }
    res.status(err?.status || err?.statusCode || 500).json({
      error: err?.message || "Internal Server Error",
    });
  });

  // ─── Démarrage ──────────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT || "3000");

  await initStorageBuckets().catch((e) =>
    console.warn("⚠️  Supabase Storage init:", e.message)
  );

  server.listen(port, () => {
    console.log(`✅ Serveur CameroonTravail → http://localhost:${port}`);
  });
}

startServer().catch(console.error);
