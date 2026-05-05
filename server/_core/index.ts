import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Upload CV endpoint (multipart/form-data)
  app.post("/api/upload-cv", async (req, res) => {
    try {
      const busboy = await import("busboy");
      const bb = busboy.default({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });
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
        if (!fileBuffer) {
          return res.status(400).json({ error: "No file provided" });
        }
        const { storagePut } = await import("../storage");
        const { nanoid } = await import("nanoid");
        const ext = fileName.split(".").pop() || "pdf";
        const key = `cv-uploads/${nanoid()}.${ext}`;
        const result = await storagePut(key, fileBuffer, mimeType);
        res.json({ url: result.url, key: result.key });
      });

      bb.on("error", (err: any) => {
        console.error("Busboy error:", err);
        res.status(500).json({ error: err.message });
      });

      req.pipe(bb);
    } catch (error: any) {
      console.error("Upload CV error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  // Upload endpoint
  app.post("/api/upload", async (req, res) => {
    try {
      const { fileData, fileName, mimeType, fileKey } = req.body;
      
      if (!fileData || !fileName || !mimeType || !fileKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Décoder le base64
      const buffer = Buffer.from(fileData, 'base64');
      
      // Importer storagePut
      const { storagePut } = await import("../storage");
      
      // Uploader vers S3
      const result = await storagePut(fileKey, buffer, mimeType);
      
      res.json(result);
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
