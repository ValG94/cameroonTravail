import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./trpc";
import { storagePut } from "../storage";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
  
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileData: z.string(), // Base64
        fileName: z.string(),
        mimeType: z.string(),
        fileKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Décoder le base64
      const buffer = Buffer.from(input.fileData, 'base64');
      
      // Uploader vers S3
      const result = await storagePut(input.fileKey, buffer, input.mimeType);
      
      return result;
    }),
});
