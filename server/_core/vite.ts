import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";

export async function setupVite(app: Express, server: Server) {
  // Pure dynamic imports — nothing from vite loads at module init
  const { createServer: createViteServer } = await import("vite");
  const { nanoid } = await import("nanoid");

  const vite = await createViteServer({
    // Let Vite find vite.config.ts automatically — no static import needed
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true as const },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  const hasBuild = fs.existsSync(distPath);

  // Le frontend tourne sur Vercel en prod — pas de log bruyant si pas de build local
  if (hasBuild) {
    app.use(express.static(distPath));
  }

  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (!hasBuild || !fs.existsSync(indexPath)) {
      return res.status(404).json({ error: "API backend only — frontend served separately." });
    }
    res.sendFile(indexPath);
  });
}
