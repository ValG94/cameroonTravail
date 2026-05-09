import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initStorageBuckets } from "../storage";
import { ENV } from "./env";
import { sdk } from "./sdk";

// ─── CORS origins ──────────────────────────────────────────────────────────────
const normalizeOrigin = (s: string) => s.trim().toLowerCase().replace(/\/+$/, "");

const allowedOrigins = (ENV.corsOrigin
  ? ENV.corsOrigin.split(",").map(normalizeOrigin).filter(Boolean)
  : ["http://localhost:5173", "http://localhost:3000"]);

console.log("[CORS] CORS_ORIGIN env =", JSON.stringify(ENV.corsOrigin));
console.log("[CORS] allowedOrigins =", allowedOrigins);

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
    const normalized = origin ? normalizeOrigin(origin) : undefined;
    const isAllowed = !!normalized && allowedOrigins.includes(normalized);

    if (origin) {
      console.log(`[CORS] origin="${origin}" normalized="${normalized}" allowed=${isAllowed}`);
    }

    if (origin && isAllowed) {
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
    const normalized = origin ? normalizeOrigin(origin) : undefined;
    if (origin && normalized && allowedOrigins.includes(normalized)) {
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

  // ─── Rate limiting strict sur auth ─────────────────────────────────────────
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

        // Validation magic bytes PDF
        const { fileTypeFromBuffer } = await import("file-type");
        const detected = await fileTypeFromBuffer(fileBuffer).catch(() => null);
        if (!detected || detected.mime !== "application/pdf") {
          return res.status(400).json({ error: "Seuls les PDF sont acceptés" });
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

      // Validation magic bytes image
      const { fileTypeFromBuffer } = await import("file-type");
      const detected = await fileTypeFromBuffer(buffer).catch(() => null);
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!detected || !allowed.includes(detected.mime)) {
        return res.status(400).json({ error: "Seules les images JPEG, PNG, WEBP sont acceptées" });
      }

      const { storagePut } = await import("../storage");
      const result = await storagePut(fileKey, buffer, mimeType);
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
      if (origin && allowedOrigins.includes(origin)) {
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
