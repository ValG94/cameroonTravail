import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { processCVFile } from "./cvExtractor";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { createUserWithPassword, authenticateUser } from "./auth";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";

// Helper : notifier les candidats ayant une alerte correspondant à une nouvelle offre
async function notifyAlertesForNewOffer(offreData: {
  id: number;
  titre: string;
  secteur: string;
  typeOffre: string;
  typeContrat: string;
  ville: string;
  region: string;
  salaire?: string | null;
  entreprise: string;
}, req?: { headers?: { host?: string; 'x-forwarded-proto'?: string } }) {
  try {
    const dbInstance = await db.getDb();
    if (!dbInstance) return;

    const { alertes, candidats, users } = await import("../drizzle/schema");
    const { eq, and, or, isNull, like, sql } = await import("drizzle-orm");

    // Construire l'URL de l'app
    const proto = req?.headers?.['x-forwarded-proto'] || 'https';
    const host = req?.headers?.host || 'cameroon-travail.manus.space';
    const appUrl = `${proto}://${host}`;

    // Récupérer toutes les alertes actives avec fréquence immédiate
    const alertesActives = await dbInstance
      .select()
      .from(alertes)
      .where(and(eq(alertes.active, true), eq(alertes.frequence, 'immediate')));

    const { sendEmail, templateNouvelleOffre } = await import("./_core/email");

    for (const alerte of alertesActives) {
      // Vérifier les critères
      if (alerte.typeOffre !== 'tous' && alerte.typeOffre !== offreData.typeOffre) continue;
      if (alerte.secteur && alerte.secteur !== offreData.secteur) continue;
      if (alerte.region && alerte.region !== offreData.region) continue;
      if (alerte.typeContrat && alerte.typeContrat !== offreData.typeContrat) continue;
      if (alerte.motsCles) {
        const kw = alerte.motsCles.toLowerCase();
        const titre = offreData.titre.toLowerCase();
        const secteur = offreData.secteur.toLowerCase();
        if (!titre.includes(kw) && !secteur.includes(kw)) continue;
      }

      // Récupérer le candidat et son email
      const [candidat] = await dbInstance
        .select()
        .from(candidats)
        .where(eq(candidats.id, alerte.candidatId))
        .limit(1);
      if (!candidat) continue;

      const [user] = await dbInstance
        .select()
        .from(users)
        .where(eq(users.id, candidat.userId))
        .limit(1);
      if (!user?.email) continue;

      // Envoyer l'email
      await sendEmail({
        to: user.email,
        subject: `🔔 Nouvelle offre : ${offreData.titre}`,
        html: templateNouvelleOffre({
          candidatNom: user.name || 'Candidat',
          alerteNom: alerte.nom,
          offreTitre: offreData.titre,
          entreprise: offreData.entreprise,
          secteur: offreData.secteur,
          ville: offreData.ville,
          region: offreData.region,
          typeContrat: offreData.typeContrat,
          typeOffre: offreData.typeOffre,
          salaire: offreData.salaire || undefined,
          offreId: offreData.id,
          appUrl,
        }),
      });
    }
  } catch (err) {
    console.error('[notifyAlertesForNewOffer] Erreur:', err);
  }
}

// Procédure réservée aux admins
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ─── Router Admin ────────────────────────────────────────────────────────────
  admin: router({
    // Statistiques globales de la plateforme
    stats: adminProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const { users, candidats, employeurs, offresEmploi, candidatures, alertes } = await import('../drizzle/schema');
      const { count, eq, gte, sql } = await import('drizzle-orm');

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [[totalUsers], [totalCandidats], [totalEmployeurs], [totalOffres], [totalCandidatures], [totalAlertes]] = await Promise.all([
        dbInstance.select({ count: count() }).from(users),
        dbInstance.select({ count: count() }).from(candidats),
        dbInstance.select({ count: count() }).from(employeurs),
        dbInstance.select({ count: count() }).from(offresEmploi),
        dbInstance.select({ count: count() }).from(candidatures),
        dbInstance.select({ count: count() }).from(alertes),
      ]);

      const [[offresPubliees], [offresExpirees], [offresPourvues], [offresBrouillons]] = await Promise.all([
        dbInstance.select({ count: count() }).from(offresEmploi).where(eq(offresEmploi.statut, 'publiee')),
        dbInstance.select({ count: count() }).from(offresEmploi).where(eq(offresEmploi.statut, 'expiree')),
        dbInstance.select({ count: count() }).from(offresEmploi).where(eq(offresEmploi.statut, 'pourvue')),
        dbInstance.select({ count: count() }).from(offresEmploi).where(eq(offresEmploi.statut, 'brouillon')),
      ]);

      const [[offresPubliques], [offresPrivees]] = await Promise.all([
        dbInstance.select({ count: count() }).from(offresEmploi).where(eq(offresEmploi.typeOffre, 'public')),
        dbInstance.select({ count: count() }).from(offresEmploi).where(eq(offresEmploi.typeOffre, 'prive')),
      ]);

      const [[newUsers30d], [newOffres30d], [newCandidatures30d]] = await Promise.all([
        dbInstance.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
        dbInstance.select({ count: count() }).from(offresEmploi).where(gte(offresEmploi.createdAt, thirtyDaysAgo)),
        dbInstance.select({ count: count() }).from(candidatures).where(gte(candidatures.createdAt, thirtyDaysAgo)),
      ]);

      const [[newUsers7d], [newOffres7d], [newCandidatures7d]] = await Promise.all([
        dbInstance.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
        dbInstance.select({ count: count() }).from(offresEmploi).where(gte(offresEmploi.createdAt, sevenDaysAgo)),
        dbInstance.select({ count: count() }).from(candidatures).where(gte(candidatures.createdAt, sevenDaysAgo)),
      ]);

      // Candidatures par statut
      const candidaturesParStatut = await dbInstance
        .select({ statut: candidatures.statut, count: count() })
        .from(candidatures)
        .groupBy(candidatures.statut);

      // Top secteurs (offres)
      const topSecteurs = await dbInstance
        .select({ secteur: offresEmploi.secteur, count: count() })
        .from(offresEmploi)
        .groupBy(offresEmploi.secteur)
        .orderBy(sql`count(*) desc`)
        .limit(8);

      // Top régions (offres)
      const topRegions = await dbInstance
        .select({ region: offresEmploi.region, count: count() })
        .from(offresEmploi)
        .groupBy(offresEmploi.region)
        .orderBy(sql`count(*) desc`)
        .limit(8);

      return {
        totaux: {
          utilisateurs: totalUsers.count,
          candidats: totalCandidats.count,
          employeurs: totalEmployeurs.count,
          offres: totalOffres.count,
          candidatures: totalCandidatures.count,
          alertes: totalAlertes.count,
        },
        offresParStatut: {
          publiees: offresPubliees.count,
          expirees: offresExpirees.count,
          pourvues: offresPourvues.count,
          brouillons: offresBrouillons.count,
        },
        offresParType: {
          public: offresPubliques.count,
          prive: offresPrivees.count,
        },
        tendances: {
          newUsers30d: newUsers30d.count,
          newOffres30d: newOffres30d.count,
          newCandidatures30d: newCandidatures30d.count,
          newUsers7d: newUsers7d.count,
          newOffres7d: newOffres7d.count,
          newCandidatures7d: newCandidatures7d.count,
        },
        candidaturesParStatut,
        topSecteurs: topSecteurs.filter(s => s.secteur),
        topRegions: topRegions.filter(r => r.region),
      };
    }),

    // Liste des utilisateurs récents
    recentUsers: adminProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { users } = await import('../drizzle/schema');
        const { desc, count } = await import('drizzle-orm');

        const [[total], list] = await Promise.all([
          dbInstance.select({ count: count() }).from(users),
          dbInstance.select().from(users).orderBy(desc(users.createdAt)).limit(input.limit).offset(input.offset),
        ]);

        return { total: total.count, users: list };
      }),

    // Liste des offres récentes
    recentOffres: adminProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { offresEmploi, employeurs } = await import('../drizzle/schema');
        const { desc, count, eq } = await import('drizzle-orm');

        const [[total], list] = await Promise.all([
          dbInstance.select({ count: count() }).from(offresEmploi),
          dbInstance
            .select({
              id: offresEmploi.id,
              titre: offresEmploi.titre,
              typeOffre: offresEmploi.typeOffre,
              statut: offresEmploi.statut,
              ville: offresEmploi.ville,
              region: offresEmploi.region,
              typeContrat: offresEmploi.typeContrat,
              secteur: offresEmploi.secteur,
              datePublication: offresEmploi.datePublication,
              nombreCandidatures: offresEmploi.nombreCandidatures,
              nombreVues: offresEmploi.nombreVues,
              nomEntreprise: employeurs.nomEntreprise,
            })
            .from(offresEmploi)
            .leftJoin(employeurs, eq(offresEmploi.employeurId, employeurs.id))
            .orderBy(desc(offresEmploi.createdAt))
            .limit(input.limit)
            .offset(input.offset),
        ]);

        return { total: total.count, offres: list };
      }),

    // Changer le rôle d'un utilisateur
    setUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(['user', 'admin']) }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { users } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await dbInstance.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),

    // Supprimer une offre (admin)
    deleteOffre: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { offresEmploi } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await dbInstance.delete(offresEmploi).where(eq(offresEmploi.id, input.id));
        return { success: true };
      }),

    // ─── Gestion des articles de conseils ─────────────────────────────────
    getArticles: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { articlesConseils } = await import('../drizzle/schema');
        const { desc, count } = await import('drizzle-orm');
        const [[{ total }], articles] = await Promise.all([
          dbInstance.select({ total: count() }).from(articlesConseils),
          dbInstance.select().from(articlesConseils).orderBy(desc(articlesConseils.datePublication)).limit(input.limit).offset(input.offset),
        ]);
        return { articles, total: Number(total) };
      }),

    createArticle: adminProcedure
      .input(z.object({
        titre: z.string().min(3),
        description: z.string().min(10),
        contenu: z.string().min(20),
        categorie: z.enum(['Entretien', 'CV', 'March\u00e9', 'N\u00e9gociation', 'Reconversion', 'Freelance']),
        auteur: z.string().min(2),
        tempsLecture: z.string().default('5 min'),
        imageUrl: z.string().url().optional(),
        featured: z.boolean().default(false),
        slug: z.string().min(3),
        datePublication: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { articlesConseils } = await import('../drizzle/schema');
        const datePublication = input.datePublication ? new Date(input.datePublication) : new Date();
        const [article] = await dbInstance.insert(articlesConseils).values({
          titre: input.titre,
          description: input.description,
          contenu: input.contenu,
          categorie: input.categorie,
          auteur: input.auteur,
          tempsLecture: input.tempsLecture,
          imageUrl: input.imageUrl || null,
          featured: input.featured,
          slug: input.slug,
          datePublication,
        }).$returningId();
        return { id: article.id };
      }),

    updateArticle: adminProcedure
      .input(z.object({
        id: z.number(),
        titre: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        contenu: z.string().min(20).optional(),
        categorie: z.enum(['Entretien', 'CV', 'March\u00e9', 'N\u00e9gociation', 'Reconversion', 'Freelance']).optional(),
        auteur: z.string().min(2).optional(),
        tempsLecture: z.string().optional(),
        imageUrl: z.string().url().nullable().optional(),
        featured: z.boolean().optional(),
        slug: z.string().min(3).optional(),
        datePublication: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { articlesConseils } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const updateData: Record<string, unknown> = {};
        if (input.titre !== undefined) updateData.titre = input.titre;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.contenu !== undefined) updateData.contenu = input.contenu;
        if (input.categorie !== undefined) updateData.categorie = input.categorie;
        if (input.auteur !== undefined) updateData.auteur = input.auteur;
        if (input.tempsLecture !== undefined) updateData.tempsLecture = input.tempsLecture;
        if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
        if (input.featured !== undefined) updateData.featured = input.featured;
        if (input.slug !== undefined) updateData.slug = input.slug;
        if (input.datePublication !== undefined) updateData.datePublication = new Date(input.datePublication);
        await dbInstance.update(articlesConseils).set(updateData).where(eq(articlesConseils.id, input.id));
        return { success: true };
      }),

    deleteArticle: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { articlesConseils } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await dbInstance.delete(articlesConseils).where(eq(articlesConseils.id, input.id));
        return { success: true };
      }),

    toggleFeatured: adminProcedure
      .input(z.object({ id: z.number(), featured: z.boolean() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { articlesConseils } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        // Si on met en avant, retirer l'ancien featured
        if (input.featured) {
          await dbInstance.update(articlesConseils).set({ featured: false });
        }
        await dbInstance.update(articlesConseils).set({ featured: input.featured }).where(eq(articlesConseils.id, input.id));
        return { success: true };
      }),

    // ─── Formules Tarifaires ──────────────────────────────────────────────────
    getFormules: adminProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const { formulesTarifaires } = await import('../drizzle/schema');
      const { asc } = await import('drizzle-orm');
      return dbInstance.select().from(formulesTarifaires).orderBy(asc(formulesTarifaires.ordre));
    }),

    createFormule: adminProcedure
      .input(z.object({
        nom: z.string().min(1),
        cible: z.enum(['candidat', 'employeur']),
        prix: z.string(),
        devise: z.string().default('XAF'),
        periode: z.enum(['mensuel', 'annuel', 'unique']),
        description: z.string().optional(),
        fonctionnalites: z.string().optional(),
        actif: z.boolean().default(true),
        populaire: z.boolean().default(false),
        ordre: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { formulesTarifaires } = await import('../drizzle/schema');
        const result = await dbInstance.insert(formulesTarifaires).values({
          nom: input.nom,
          cible: input.cible,
          prix: input.prix,
          devise: input.devise,
          periode: input.periode,
          description: input.description || null,
          fonctionnalites: input.fonctionnalites || null,
          actif: input.actif,
          populaire: input.populaire,
          ordre: input.ordre,
        });
        return { success: true, id: (result as any).insertId };
      }),

    updateFormule: adminProcedure
      .input(z.object({
        id: z.number(),
        nom: z.string().min(1).optional(),
        cible: z.enum(['candidat', 'employeur']).optional(),
        prix: z.string().optional(),
        devise: z.string().optional(),
        periode: z.enum(['mensuel', 'annuel', 'unique']).optional(),
        description: z.string().optional().nullable(),
        fonctionnalites: z.string().optional().nullable(),
        actif: z.boolean().optional(),
        populaire: z.boolean().optional(),
        ordre: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { formulesTarifaires } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const { id, ...updates } = input;
        await dbInstance.update(formulesTarifaires).set(updates as any).where(eq(formulesTarifaires.id, id));
        return { success: true };
      }),

    deleteFormule: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { formulesTarifaires } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await dbInstance.delete(formulesTarifaires).where(eq(formulesTarifaires.id, input.id));
        return { success: true };
      }),

    toggleFormuleActif: adminProcedure
      .input(z.object({ id: z.number(), actif: z.boolean() }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { formulesTarifaires } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await dbInstance.update(formulesTarifaires).set({ actif: input.actif }).where(eq(formulesTarifaires.id, input.id));
        return { success: true };
      }),
  }),

  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      
      // Récupérer la photo de profil selon le type
      let photoUrl: string | null = null;
      if (ctx.user.profileType === "candidat") {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        photoUrl = candidat?.photoUrl || null;
      } else if (ctx.user.profileType === "employeur") {
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        photoUrl = employeur?.logoUrl || null;
      }
      
      return {
        ...ctx.user,
        photoUrl,
      };
    }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Inscription avec email et mot de passe
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string(),
        profileType: z.enum(["candidat", "employeur"]),
        telephone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Créer l'utilisateur
          await createUserWithPassword(
            input.email,
            input.password,
            input.name,
            input.profileType
          );
          
          // Récupérer l'utilisateur créé
          const user = await authenticateUser(input.email, input.password);
          
          if (!user) {
            throw new Error("Erreur lors de la création du compte");
          }
          
          // Créer le profil correspondant
          if (input.profileType === "candidat") {
            await db.createCandidat({
              userId: user.id,
              prenom: input.name.split(' ')[0] || null,
              nom: input.name.split(' ').slice(1).join(' ') || null,
              telephone: input.telephone || null,
            });
          } else {
            await db.createEmployeur({
              userId: user.id,
              nomEntreprise: "",
            });
          }
          
          // Créer un token JWT
          const secret = new TextEncoder().encode(ENV.cookieSecret);
          const token = await new SignJWT({ userId: user.id, openId: user.openId || `email-${user.id}` })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("30d")
            .sign(secret);
          
          // Définir le cookie de session
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
          });
          
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              profileType: user.profileType,
            },
          };
        } catch (error: any) {
          throw new Error(error.message || "Erreur lors de l'inscription");
        }
      }),
    
    // Connexion avec email et mot de passe
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
        rememberMe: z.boolean().optional().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log("[LOGIN] Starting login for email:", input.email);

        let user;
        try {
          user = await authenticateUser(input.email, input.password);
        } catch (err: any) {
          // Si c'est une erreur métier connue (ex: méthode de connexion incorrecte)
          // on la propage telle quelle ; sinon on log l'erreur DB et on renvoie un message générique
          const msg = err?.message ?? "";
          if (msg.includes("autre méthode de connexion")) {
            throw new TRPCError({ code: "BAD_REQUEST", message: msg });
          }
          // Log détaillé : message + cause + code PostgreSQL
          console.error("[LOGIN] Erreur technique lors de l'authentification:");
          console.error("  - message:", err?.message);
          console.error("  - code:", err?.code ?? err?.cause?.code);
          console.error("  - detail:", err?.detail ?? err?.cause?.detail);
          console.error("  - cause:", err?.cause);
          console.error("  - stack:", err?.stack);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Service temporairement indisponible. Réessayez dans quelques instants.",
          });
        }

        if (!user) {
          console.log("[LOGIN] Authentication failed for email:", input.email);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou mot de passe incorrect",
          });
        }
        
        console.log("[LOGIN] User authenticated:", { id: user.id, email: user.email, name: user.name, profileType: user.profileType });

        // Durée de session selon le rôle et "Se souvenir de moi" :
        //  - admin       : 4h max (compte privilégié, on minimise le risque)
        //  - rememberMe  : 7 jours
        //  - défaut      : 24h
        const HOUR_MS = 60 * 60 * 1000;
        let durationMs: number;
        let durationLabel: string;
        if (user.role === "admin") {
          durationMs = 4 * HOUR_MS;
          durationLabel = "4h";
        } else if (input.rememberMe) {
          durationMs = 7 * 24 * HOUR_MS;
          durationLabel = "7d";
        } else {
          durationMs = 24 * HOUR_MS;
          durationLabel = "24h";
        }

        // Créer un token JWT (expiration alignée sur le cookie)
        const secret = new TextEncoder().encode(ENV.cookieSecret);
        const token = await new SignJWT({ userId: user.id, openId: user.openId || `email-${user.id}` })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime(durationLabel)
          .sign(secret);

        console.log(`[LOGIN] JWT créé (durée: ${durationLabel}, role: ${user.role}, rememberMe: ${input.rememberMe})`);

        // Définir le cookie de session (même durée que le JWT)
        const cookieOptions = getSessionCookieOptions(ctx.req);

        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: durationMs,
        });
        
        console.log("[LOGIN] Cookie set with name:", COOKIE_NAME);
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            profileType: user.profileType,
          },
        };
      }),
    
    // Sélectionner le type de profil lors de la première connexion
    selectProfileType: protectedProcedure
      .input(z.object({
        profileType: z.enum(["candidat", "employeur"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfileType(ctx.user.id, input.profileType);
        
        // Créer le profil correspondant
        if (input.profileType === "candidat") {
          const existingCandidat = await db.getCandidatByUserId(ctx.user.id);
          if (!existingCandidat) {
            await db.createCandidat({
              userId: ctx.user.id,
              prenom: ctx.user.name?.split(' ')[0] || null,
              nom: ctx.user.name?.split(' ').slice(1).join(' ') || null,
            });
          }
        } else {
          const existingEmployeur = await db.getEmployeurByUserId(ctx.user.id);
          if (!existingEmployeur) {
            await db.createEmployeur({
              userId: ctx.user.id,
              nomEntreprise: "",
            });
          }
        }
        
        return { success: true };
      }),
    
    // Demander une réinitialisation de mot de passe
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const { eq } = await import("drizzle-orm");
        const { users, passwordResetTokens } = await import("../drizzle/schema");

        const normalizedEmail = input.email.trim().toLowerCase();
        console.log("[requestPasswordReset] Recherche user pour email:", normalizedEmail);

        // Vérifier si l'utilisateur existe
        const userList = await dbInstance
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        console.log("[requestPasswordReset] User trouvé:", userList.length > 0);
        
        // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
        if (userList.length === 0) {
          return { success: true };
        }
        
        const user = userList[0];
        
        // Générer un token aléatoire
        const token = nanoid(32);
        
        // Hacher le token pour le stockage
        const bcrypt = await import("bcrypt");
        const hashedToken = await bcrypt.hash(token, 10);
        
        // Définir l'expiration à 24h
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        // Supprimer les anciens tokens de cet utilisateur
        await dbInstance
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.userId, user.id));
        
        // Créer le nouveau token
        await dbInstance.insert(passwordResetTokens).values({
          userId: user.id,
          token: hashedToken,
          expiresAt,
        });
        
        // Envoyer l'email avec le lien de réinitialisation
        if (!user.email) {
          throw new Error("Adresse email manquante");
        }
        
        try {
          const { sendEmail, templatePasswordReset } = await import("./_core/email");
          // URL publique du frontend (Vercel) — fallback sur le host de la requête en dev local
          const baseUrl = ENV.frontendUrl || `${ctx.req.get("x-forwarded-proto") || ctx.req.protocol || "https"}://${ctx.req.get("host") || ""}`;
          await sendEmail({
            to: user.email,
            subject: "Réinitialisation de votre mot de passe - Cameroon Travail",
            html: templatePasswordReset({
              userName: user.name || "Utilisateur",
              resetLink: `${baseUrl}/reset-password?token=${token}`,
            }),
          });
        } catch (emailError) {
          console.error("[auth.requestPasswordReset] Erreur lors de l'envoi de l'email:", emailError);
          throw new Error("Échec de l'envoi de l'email de réinitialisation");
        }
        
        return { success: true };
      }),
    
    // Réinitialiser le mot de passe avec le token
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const { eq, gt } = await import("drizzle-orm");
        const { users, passwordResetTokens } = await import("../drizzle/schema");
        const bcrypt = await import("bcrypt");
        
        // Récupérer tous les tokens non expirés
        const now = new Date();
        console.log("[resetPassword] Recherche de tokens non expirés...");
        const tokens = await dbInstance
          .select()
          .from(passwordResetTokens)
          .where(gt(passwordResetTokens.expiresAt, now));
        
        console.log(`[resetPassword] ${tokens.length} token(s) trouvé(s)`);
        console.log(`[resetPassword] Token reçu: ${input.token.substring(0, 20)}...`);
        
        // Trouver le token correspondant en vérifiant le hash
        let validToken = null;
        for (const tokenRecord of tokens) {
          console.log(`[resetPassword] Vérification du token pour userId: ${tokenRecord.userId}`);
          const isValid = await bcrypt.compare(input.token, tokenRecord.token);
          console.log(`[resetPassword] Résultat comparaison: ${isValid}`);
          if (isValid) {
            validToken = tokenRecord;
            break;
          }
        }
        
        if (!validToken) {
          console.error("[resetPassword] Aucun token valide trouvé");
          throw new Error("Token invalide ou expiré");
        }
        
        console.log(`[resetPassword] Token valide trouvé pour userId: ${validToken.userId}`);
        
        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);
        
        // Mettre à jour le mot de passe
        await dbInstance
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, validToken.userId));
        
        // Supprimer le token utilisé
        await dbInstance
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.userId, validToken.userId));
        
        return { success: true };
      }),
  }),
  
  // Profil candidat
  candidat: router({
    // Récupérer le profil candidat
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const candidat = await db.getCandidatByUserId(ctx.user.id);
      return candidat;
    }),
    
    // Mettre à jour le profil candidat
    updateProfile: protectedProcedure
      .input(z.object({
        prenom: z.string().optional(),
        nom: z.string().optional(),
        telephone: z.string().optional(),
        adresse: z.string().optional(),
        ville: z.string().optional(),
        region: z.string().optional(),
        codePostal: z.string().optional(),
        dateNaissance: z.date().optional(),
        nationalite: z.string().optional(),
        situationMatrimoniale: z.string().optional(),
        secteurRecherche: z.string().optional(),
        typeContratRecherche: z.string().optional(),
        localisationRecherche: z.string().optional(),
        salaireMinimum: z.string().optional(),
        disponibilite: z.string().optional(),
        mobilite: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        
        if (!candidat) {
          throw new Error("Profil candidat non trouvé");
        }
        
        await db.updateCandidat(candidat.id, input);
        
        return { success: true };
      }),
    
    // Upload photo de profil
    uploadPhoto: protectedProcedure
      .input(z.object({
        fileData: z.string(), // Base64
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new Error("Profil candidat non trouvé");
        
        // Décoder le fichier base64
        const buffer = Buffer.from(input.fileData, "base64");
        
        // Vérifier la taille (max 5MB pour une photo)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error("Le fichier est trop volumineux (max 5MB)");
        }
        
        // Vérifier le type MIME (images seulement)
        if (!input.mimeType.startsWith("image/")) {
          throw new Error("Seules les images sont acceptées");
        }
        
        // Uploader la photo vers S3
        const fileKey = `photos/${ctx.user.id}/${nanoid()}-${input.fileName}`;
        const { url: photoUrl } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Mettre à jour le profil avec l'URL de la photo
        await db.updateCandidat(candidat.id, { photoUrl, photoFileKey: fileKey });
        
        return {
          success: true,
          photoUrl,
        };
      }),
    
    // Expériences
    getExperiences: protectedProcedure.query(async ({ ctx }) => {
      const candidat = await db.getCandidatByUserId(ctx.user.id);
      if (!candidat) return [];
      return await db.getExperiencesByCandidatId(candidat.id);
    }),
    
    createExperience: protectedProcedure
      .input(z.object({
        poste: z.string(),
        entreprise: z.string(),
        ville: z.string().optional(),
        pays: z.string().optional(),
        dateDebut: z.date(),
        dateFin: z.date().optional(),
        enCours: z.boolean().optional(),
        description: z.string().optional(),
        competencesAcquises: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new Error("Profil candidat non trouvé");
        
        const id = await db.createExperience({
          candidatId: candidat.id,
          ...input,
        });
        
        return { success: true, id };
      }),
    
    updateExperience: protectedProcedure
      .input(z.object({
        id: z.number(),
        poste: z.string().optional(),
        entreprise: z.string().optional(),
        ville: z.string().optional(),
        pays: z.string().optional(),
        dateDebut: z.date().optional(),
        dateFin: z.date().optional(),
        enCours: z.boolean().optional(),
        description: z.string().optional(),
        competencesAcquises: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateExperience(id, data);
        return { success: true };
      }),
    
    deleteExperience: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteExperience(input.id);
        return { success: true };
      }),
    
    // Formations
    getFormations: protectedProcedure.query(async ({ ctx }) => {
      const candidat = await db.getCandidatByUserId(ctx.user.id);
      if (!candidat) return [];
      return await db.getFormationsByCandidatId(candidat.id);
    }),
    
    createFormation: protectedProcedure
      .input(z.object({
        diplome: z.string(),
        etablissement: z.string(),
        ville: z.string().optional(),
        pays: z.string().optional(),
        dateDebut: z.date(),
        dateFin: z.date().optional(),
        enCours: z.boolean().optional(),
        domaine: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new Error("Profil candidat non trouvé");
        
        const id = await db.createFormation({
          candidatId: candidat.id,
          ...input,
        });
        
        return { success: true, id };
      }),
    
    updateFormation: protectedProcedure
      .input(z.object({
        id: z.number(),
        diplome: z.string().optional(),
        etablissement: z.string().optional(),
        ville: z.string().optional(),
        pays: z.string().optional(),
        dateDebut: z.date().optional(),
        dateFin: z.date().optional(),
        enCours: z.boolean().optional(),
        domaine: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFormation(id, data);
        return { success: true };
      }),
    
    deleteFormation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFormation(input.id);
        return { success: true };
      }),
    
    // Compétences
    getCompetences: protectedProcedure.query(async ({ ctx }) => {
      const candidat = await db.getCandidatByUserId(ctx.user.id);
      if (!candidat) return [];
      return await db.getCompetencesByCandidatId(candidat.id);
    }),
    
    createCompetence: protectedProcedure
      .input(z.object({
        nom: z.string(),
        niveau: z.enum(["debutant", "intermediaire", "avance", "expert"]),
        categorie: z.string().optional(),
        anneesExperience: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new Error("Profil candidat non trouvé");
        
        const id = await db.createCompetence({
          candidatId: candidat.id,
          ...input,
        });
        
        return { success: true, id };
      }),
    
    updateCompetence: protectedProcedure
      .input(z.object({
        id: z.number(),
        nom: z.string().optional(),
        niveau: z.enum(["debutant", "intermediaire", "avance", "expert"]).optional(),
        categorie: z.string().optional(),
        anneesExperience: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCompetence(id, data);
        return { success: true };
      }),
    
    deleteCompetence: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCompetence(input.id);
        return { success: true };
      }),
    
    // Langues
    getLangues: protectedProcedure.query(async ({ ctx }) => {
      const candidat = await db.getCandidatByUserId(ctx.user.id);
      if (!candidat) return [];
      return await db.getLanguesByCandidatId(candidat.id);
    }),
    
    createLangue: protectedProcedure
      .input(z.object({
        nom: z.string(),
        niveauOral: z.enum(["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"]),
        niveauEcrit: z.enum(["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new Error("Profil candidat non trouvé");
        
        const id = await db.createLangue({
          candidatId: candidat.id,
          ...input,
        });
        
        return { success: true, id };
      }),
    
    updateLangue: protectedProcedure
      .input(z.object({
        id: z.number(),
        nom: z.string().optional(),
        niveauOral: z.enum(["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"]).optional(),
        niveauEcrit: z.enum(["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLangue(id, data);
        return { success: true };
      }),
    
    deleteLangue: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLangue(input.id);
        return { success: true };
      }),
    
    // Upload et extraction CV
    uploadCV: protectedProcedure
      .input(z.object({
        fileData: z.string(), // Base64
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new Error("Profil candidat non trouvé");
        
        // Décoder le fichier base64
        const buffer = Buffer.from(input.fileData, "base64");
        
        // Vérifier la taille (max 10MB)
        if (buffer.length > 10 * 1024 * 1024) {
          throw new Error("Le fichier est trop volumineux (max 10MB)");
        }
        
        // Extraire les données du CV avec l'IA
        const { text, data } = await processCVFile(buffer, input.mimeType);
        
        // Uploader le CV vers S3
        const fileKey = `cv/${ctx.user.id}/${nanoid()}-${input.fileName}`;
        const { url: cvUrl } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Mettre à jour le profil avec l'URL du CV
        await db.updateCandidat(candidat.id, { cvUrl });
        
        return {
          success: true,
          cvUrl,
          extractedData: data,
        };
      }),
  }),
  
  // Offres d'emploi
  jobs: router({
    getLatest: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        
        const limit = input.limit || 10;
        const { eq } = await import("drizzle-orm");
        const { offresEmploi } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");
        const jobs = await dbInstance
          .select()
          .from(offresEmploi)
          .where(eq(offresEmploi.statut, "publiee"))
          .orderBy(desc(offresEmploi.datePublication))
          .limit(limit);
        
        return jobs;
      }),
    
    search: publicProcedure
      .input(z.object({
        keywords: z.string().optional(),
        typeOffre: z.enum(["public", "prive"]).optional(),
        secteur: z.string().optional(),
        region: z.string().optional(),
        ville: z.string().optional(),
        typeContrat: z.string().optional(),
        salaireMin: z.number().optional(),
        salaireMax: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { jobs: [], total: 0 };
        
        const { and, or, like, gte, lte, eq, sql } = await import("drizzle-orm");
        const { offresEmploi } = await import("../drizzle/schema");
        
        // Construire les conditions de filtre
        const conditions = [];
        
        // Statut publiée uniquement
        conditions.push(eq(offresEmploi.statut, "publiee"));
        
        // Recherche par mots-clés (titre, description, secteur, metier)
        if (input.keywords) {
          const keywordCondition = or(
            like(offresEmploi.titre, `%${input.keywords}%`),
            like(offresEmploi.description, `%${input.keywords}%`),
            like(offresEmploi.secteur, `%${input.keywords}%`),
            like(offresEmploi.metier, `%${input.keywords}%`)
          );
          if (keywordCondition) conditions.push(keywordCondition);
        }
        
        // Filtres exacts
        if (input.typeOffre) conditions.push(eq(offresEmploi.typeOffre, input.typeOffre));
        if (input.secteur) conditions.push(eq(offresEmploi.secteur, input.secteur));
        if (input.region) conditions.push(eq(offresEmploi.region, input.region));
        if (input.ville) conditions.push(eq(offresEmploi.ville, input.ville));
        if (input.typeContrat) conditions.push(eq(offresEmploi.typeContrat, input.typeContrat));
        
        // Compter le total
        const countResult = await dbInstance
          .select({ count: sql<number>`count(*)` })
          .from(offresEmploi)
          .where(and(...conditions));
        
        const total = Number(countResult[0]?.count || 0);
        
        // Récupérer les offres avec pagination
        const offset = (input.page - 1) * input.limit;
        const { desc } = await import("drizzle-orm");
        const jobs = await dbInstance
          .select()
          .from(offresEmploi)
          .where(and(...conditions))
          .orderBy(desc(offresEmploi.datePublication))
          .limit(input.limit)
          .offset(offset);
        
        return { jobs, total, page: input.page, limit: input.limit };
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return null;
        
        const { eq } = await import("drizzle-orm");
        const { offresEmploi, employeurs } = await import("../drizzle/schema");
        
        const jobs = await dbInstance
          .select({
            id: offresEmploi.id,
            employeurId: offresEmploi.employeurId,
            titre: offresEmploi.titre,
            typeOffre: offresEmploi.typeOffre,
            description: offresEmploi.description,
            missions: offresEmploi.missions,
            competencesRequises: offresEmploi.competencesRequises,
            experienceRequise: offresEmploi.experienceRequise,
            niveauEtude: offresEmploi.niveauEtude,
            typeContrat: offresEmploi.typeContrat,
            dureeContrat: offresEmploi.dureeContrat,
            salaire: offresEmploi.salaire,
            avantages: offresEmploi.avantages,
            ville: offresEmploi.ville,
            region: offresEmploi.region,
            pays: offresEmploi.pays,
            secteur: offresEmploi.secteur,
            metier: offresEmploi.metier,
            datePublication: offresEmploi.datePublication,
            dateLimite: offresEmploi.dateLimite,
            dateDebut: offresEmploi.dateDebut,
            statut: offresEmploi.statut,
            nombrePostes: offresEmploi.nombrePostes,
            nombreVues: offresEmploi.nombreVues,
            nombreCandidatures: offresEmploi.nombreCandidatures,
            // Informations employeur
            entreprise: employeurs.nomEntreprise,
            secteurEntreprise: employeurs.secteurActivite,
            tailleEntreprise: employeurs.taille,
            siteWeb: employeurs.siteWeb,
            logoUrl: employeurs.logoUrl,
            descriptionEntreprise: employeurs.description,
          })
          .from(offresEmploi)
          .leftJoin(employeurs, eq(offresEmploi.employeurId, employeurs.id))
          .where(eq(offresEmploi.id, input.id))
          .limit(1);
        
        return jobs[0] || null;
      }),
    
    // Créer une offre d'emploi (employeur)
    create: protectedProcedure
      .input(z.object({
        titre: z.string().min(5),
        description: z.string().min(50),
        missions: z.string().optional(),
        competencesRequises: z.string().optional(),
        experienceRequise: z.string().optional(),
        niveauEtude: z.string().optional(),
        typeOffre: z.enum(["public", "prive"]),
        typeContrat: z.string(),
        dureeContrat: z.string().optional(),
        salaire: z.string().optional(),
        avantages: z.string().optional(),
        ville: z.string(),
        region: z.string(),
        secteur: z.string(),
        metier: z.string().optional(),
        dateLimite: z.string().optional(),
        dateDebut: z.string().optional(),
        nombrePostes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        if (ctx.user.profileType !== "employeur") {
          throw new Error("Seuls les employeurs peuvent publier des offres");
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) {
          throw new Error("Profil employeur non trouvé");
        }
        
        // Construire manuellement la requ\u00eate SQL pour \u00e9viter les probl\u00e8mes avec Drizzle
        const fields: string[] = [];
        const values: any[] = [];
        
        // Champs obligatoires
        fields.push('employeurId', 'titre', 'description', 'typeOffre', 'typeContrat', 'ville', 'region', 'secteur', 'nombrePostes');
        values.push(employeur.id, input.titre, input.description, input.typeOffre, input.typeContrat, input.ville, input.region, input.secteur, input.nombrePostes || 1);
        
        // Champs optionnels
        if (input.missions) {
          fields.push('missions');
          values.push(input.missions);
        }
        if (input.competencesRequises) {
          fields.push('competencesRequises');
          values.push(input.competencesRequises);
        }
        if (input.experienceRequise) {
          fields.push('experienceRequise');
          values.push(input.experienceRequise);
        }
        if (input.niveauEtude) {
          fields.push('niveauEtude');
          values.push(input.niveauEtude);
        }
        if (input.dureeContrat) {
          fields.push('dureeContrat');
          values.push(input.dureeContrat);
        }
        if (input.salaire) {
          fields.push('salaire');
          values.push(input.salaire);
        }
        if (input.avantages) {
          fields.push('avantages');
          values.push(input.avantages);
        }
        if (input.metier) {
          fields.push('metier');
          values.push(input.metier);
        }
        if (input.dateLimite) {
          fields.push('dateLimite');
          values.push(new Date(input.dateLimite));
        }
        if (input.dateDebut) {
          fields.push('dateDebut');
          values.push(new Date(input.dateDebut));
        }
        
        const placeholders = fields.map(() => '?').join(', ');
        const query = `INSERT INTO offresEmploi (${fields.join(', ')}) VALUES (${placeholders})`;
        
        let newOffreId: number | null = null;
        try {
          const mysql = await import('mysql2/promise');
          const connection = await mysql.createConnection(process.env.DATABASE_URL!);
          const [result] = await connection.execute(query, values) as any;
          newOffreId = result.insertId || null;
          await connection.end();
        } catch (error: any) {
          console.error('[jobs.create] Erreur lors de l\'insertion:', error.message);
          throw new Error(`Erreur lors de la cr\u00e9ation de l'offre: ${error.message}`);
        }

        // Notifier les candidats ayant une alerte correspondante (fire-and-forget)
        if (newOffreId) {
          notifyAlertesForNewOffer({
            id: newOffreId,
            titre: input.titre,
            secteur: input.secteur,
            typeOffre: input.typeOffre,
            typeContrat: input.typeContrat,
            ville: input.ville,
            region: input.region,
            salaire: input.salaire || null,
            entreprise: employeur.nomEntreprise || 'Entreprise',
          }, ctx.req as any).catch(console.error);
        }
        
        return { success: true };
      }),
    
    // Récupérer toutes les offres d'un employeur
    getByEmployeur: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        
        if (ctx.user.profileType !== "employeur" && ctx.user.role !== "admin") {
          return [];
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) return [];
        
        const { eq } = await import("drizzle-orm");
        const { offresEmploi } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");
        
        const offres = await dbInstance
          .select()
          .from(offresEmploi)
          .where(eq(offresEmploi.employeurId, employeur.id))
          .orderBy(desc(offresEmploi.datePublication));
        
        return offres;
      }),
    
    // Mettre à jour une offre
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        titre: z.string().min(5),
        description: z.string().min(50),
        missions: z.string().optional(),
        competencesRequises: z.string().optional(),
        experienceRequise: z.string().optional(),
        niveauEtude: z.string().optional(),
        typeOffre: z.enum(["public", "prive"]),
        typeContrat: z.string(),
        dureeContrat: z.string().optional(),
        salaire: z.string().optional(),
        avantages: z.string().optional(),
        ville: z.string(),
        region: z.string(),
        secteur: z.string(),
        metier: z.string().optional(),
        dateLimite: z.string().optional(),
        dateDebut: z.string().optional(),
        nombrePostes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        if (ctx.user.profileType !== "employeur" && ctx.user.role !== "admin") {
          throw new Error("Seuls les employeurs peuvent modifier des offres");
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) {
          throw new Error("Profil employeur non trouvé");
        }
        
        const { eq } = await import("drizzle-orm");
        const { offresEmploi } = await import("../drizzle/schema");
        
        // Vérifier que l'offre appartient bien à cet employeur
        const offre = await dbInstance
          .select()
          .from(offresEmploi)
          .where(eq(offresEmploi.id, input.id))
          .limit(1);
        
        if (offre.length === 0 || offre[0].employeurId !== employeur.id) {
          throw new Error("Offre non trouvée ou accès refusé");
        }
        
        await dbInstance
          .update(offresEmploi)
          .set({
            titre: input.titre,
            description: input.description,
            missions: input.missions || null,
            competencesRequises: input.competencesRequises || null,
            experienceRequise: input.experienceRequise || null,
            niveauEtude: input.niveauEtude || null,
            typeOffre: input.typeOffre,
            typeContrat: input.typeContrat,
            dureeContrat: input.dureeContrat || null,
            salaire: input.salaire || null,
            avantages: input.avantages || null,
            ville: input.ville,
            region: input.region,
            secteur: input.secteur,
            metier: input.metier || null,
            dateLimite: input.dateLimite ? new Date(input.dateLimite) : null,
            dateDebut: input.dateDebut ? new Date(input.dateDebut) : null,
            nombrePostes: input.nombrePostes || 1,
          })
          .where(eq(offresEmploi.id, input.id));
        
        return { success: true };
      }),
    
    // Supprimer une offre (suppression définitive, admin seulement)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        if (ctx.user.profileType !== "employeur" && ctx.user.role !== "admin") {
          throw new Error("Seuls les employeurs peuvent supprimer des offres");
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) {
          throw new Error("Profil employeur non trouvé");
        }
        
        const { eq } = await import("drizzle-orm");
        const { offresEmploi } = await import("../drizzle/schema");
        
        // Vérifier que l'offre appartient bien à cet employeur
        const offre = await dbInstance
          .select()
          .from(offresEmploi)
          .where(eq(offresEmploi.id, input.id))
          .limit(1);
        
        if (offre.length === 0 || offre[0].employeurId !== employeur.id) {
          throw new Error("Offre non trouvée ou accès refusé");
        }
        
        await dbInstance
          .delete(offresEmploi)
          .where(eq(offresEmploi.id, input.id));
        
        return { success: true };
      }),
    
    // Archiver une offre (marquer comme pourvu)
    archive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        if (ctx.user.profileType !== "employeur" && ctx.user.role !== "admin") {
          throw new Error("Seuls les employeurs peuvent archiver des offres");
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) {
          throw new Error("Profil employeur non trouvé");
        }
        
        const { eq } = await import("drizzle-orm");
        const { offresEmploi } = await import("../drizzle/schema");
        
        // Vérifier que l'offre appartient bien à cet employeur
        const offre = await dbInstance
          .select()
          .from(offresEmploi)
          .where(eq(offresEmploi.id, input.id))
          .limit(1);
        
        if (offre.length === 0 || offre[0].employeurId !== employeur.id) {
          throw new Error("Offre non trouvée ou accès refusé");
        }
        
        // Mettre le statut à "pourvue" au lieu de supprimer
        await dbInstance
          .update(offresEmploi)
          .set({ statut: "pourvue" })
          .where(eq(offresEmploi.id, input.id));
        
        return { success: true };
      }),
    
    // Republier une offre archivée (pourvue → publiee)
    republier: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        if (ctx.user.profileType !== "employeur" && ctx.user.role !== "admin") {
          throw new Error("Seuls les employeurs peuvent republier des offres");
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) {
          throw new Error("Profil employeur non trouvé");
        }
        
        const { eq } = await import("drizzle-orm");
        const { offresEmploi } = await import("../drizzle/schema");
        
        // Vérifier que l'offre appartient bien à cet employeur
        const offre = await dbInstance
          .select()
          .from(offresEmploi)
          .where(eq(offresEmploi.id, input.id))
          .limit(1);
        
        if (offre.length === 0 || offre[0].employeurId !== employeur.id) {
          throw new Error("Offre non trouvée ou accès refusé");
        }
        
        if (offre[0].statut !== "pourvue") {
          throw new Error("Seules les offres archivées peuvent être republiées");
        }
        
        // Remettre le statut à "publiee"
        await dbInstance
          .update(offresEmploi)
          .set({ statut: "publiee", updatedAt: new Date() })
          .where(eq(offresEmploi.id, input.id));

        // Notifier les candidats ayant une alerte correspondante (fire-and-forget)
        const o = offre[0];
        notifyAlertesForNewOffer({
          id: o.id,
          titre: o.titre,
          secteur: o.secteur ?? '',
          typeOffre: o.typeOffre,
          typeContrat: o.typeContrat,
          ville: o.ville ?? '',
          region: o.region ?? '',
          salaire: o.salaire || null,
          entreprise: employeur.nomEntreprise || 'Entreprise',
        }, ctx.req as any).catch(console.error);
        
        return { success: true };
      }),
    
    // Dupliquer une offre
    duplicate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        if (ctx.user.profileType !== "employeur") {
          throw new Error("Seuls les employeurs peuvent dupliquer des offres");
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) {
          throw new Error("Profil employeur non trouvé");
        }
        
        const { eq } = await import("drizzle-orm");
        const { offresEmploi } = await import("../drizzle/schema");
        
        // Récupérer l'offre à dupliquer
        const offre = await dbInstance
          .select()
          .from(offresEmploi)
          .where(eq(offresEmploi.id, input.id))
          .limit(1);
        
        if (offre.length === 0 || offre[0].employeurId !== employeur.id) {
          throw new Error("Offre non trouvée ou accès refusé");
        }
        
        // Retourner les données de l'offre sans les dates et le statut
        const offreData = offre[0];
        return {
          titre: offreData.titre,
          typeOffre: offreData.typeOffre,
          description: offreData.description,
          missions: offreData.missions,
          competencesRequises: offreData.competencesRequises,
          experienceRequise: offreData.experienceRequise,
          niveauEtude: offreData.niveauEtude,
          typeContrat: offreData.typeContrat,
          dureeContrat: offreData.dureeContrat,
          salaire: offreData.salaire,
          avantages: offreData.avantages,
          ville: offreData.ville,
          region: offreData.region,
          secteur: offreData.secteur,
          metier: offreData.metier,
          nombrePostes: offreData.nombrePostes,
        };
      }),
    
    // Statistiques employeur
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { offresActives: 0, candidatures: 0, vuesTotales: 0 };
        
        if (ctx.user.profileType !== "employeur") {
          return { offresActives: 0, candidatures: 0, vuesTotales: 0 };
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) return { offresActives: 0, candidatures: 0, vuesTotales: 0 };
        
        const { eq, sql } = await import("drizzle-orm");
        const { offresEmploi, candidatures } = await import("../drizzle/schema");
        
        // Compter les offres actives (publiées)
        const offresActivesResult = await dbInstance
          .select({ count: sql<number>`count(*)` })
          .from(offresEmploi)
          .where(eq(offresEmploi.employeurId, employeur.id));
        
        const offresActives = Number(offresActivesResult[0]?.count || 0);
        
        // Compter les candidatures reçues
        const candidaturesResult = await dbInstance
          .select({ count: sql<number>`count(*)` })
          .from(candidatures)
          .leftJoin(offresEmploi, eq(candidatures.offreId, offresEmploi.id))
          .where(eq(offresEmploi.employeurId, employeur.id));
        
        const totalCandidatures = Number(candidaturesResult[0]?.count || 0);
        
        // Calculer les vues totales
        const vuesResult = await dbInstance
          .select({ total: sql<number>`sum(nombreVues)` })
          .from(offresEmploi)
          .where(eq(offresEmploi.employeurId, employeur.id));
        
        const vuesTotales = Number(vuesResult[0]?.total || 0);
        
        return {
          offresActives,
          candidatures: totalCandidatures,
          vuesTotales,
        };
      }),
  }),
  
  // Profil employeur
  employeur: router({
    // Récupérer le profil employeur
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const employeur = await db.getEmployeurByUserId(ctx.user.id);
      return employeur;
    }),
    
    // Mettre à jour le profil employeur
    updateProfile: protectedProcedure
      .input(z.object({
        nomEntreprise: z.string().optional(),
        secteurActivite: z.string().optional(),
        taille: z.string().optional(),
        siteWeb: z.string().optional(),
        telephone: z.string().optional(),
        adresse: z.string().optional(),
        ville: z.string().optional(),
        region: z.string().optional(),
        codePostal: z.string().optional(),
        description: z.string().optional(),
        nomContact: z.string().optional(),
        prenomContact: z.string().optional(),
        posteContact: z.string().optional(),
        emailContact: z.string().optional(),
        telephoneContact: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        
        if (!employeur) {
          throw new Error("Profil employeur non trouvé");
        }
        
        await db.updateEmployeur(employeur.id, input);
        
        return { success: true };
      }),
    
    // Uploader le logo de l'entreprise
    uploadLogo: protectedProcedure
      .input(z.object({
        fileData: z.string(), // Base64
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) throw new Error("Profil employeur non trouvé");
        
        // Décoder le fichier base64
        const buffer = Buffer.from(input.fileData, "base64");
        
        // Vérifier la taille (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error("Le fichier est trop volumineux (max 5MB)");
        }
        
        // Vérifier le type MIME (images seulement)
        if (!input.mimeType.startsWith("image/")) {
          throw new Error("Seules les images sont acceptées pour le logo");
        }
        
        // Uploader le logo vers S3
        const fileKey = `logos/${ctx.user.id}/${nanoid()}-${input.fileName}`;
        const { url: logoUrl } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Mettre à jour le profil avec l'URL du logo
        await db.updateEmployeur(employeur.id, { logoUrl, logoFileKey: fileKey });
        
        return {
          success: true,
          logoUrl,
        };
      }),
  }),
  
  // Candidatures
  candidatures: router({
    // Créer une candidature
    create: protectedProcedure
      .input(z.object({
        offreId: z.number(),
        lettreMotivation: z.string().min(50),
        cvUrl: z.string().optional(),
        cvFileKey: z.string().optional(),
        documentsSupplementaires: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        // Vérifier que l'utilisateur est un candidat
        if (ctx.user.profileType !== "candidat") {
          throw new Error("Seuls les candidats peuvent postuler");
        }
        
        // Récupérer le candidat
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) {
          throw new Error("Profil candidat non trouvé");
        }
        
        const { eq, and } = await import("drizzle-orm");
        const { candidatures, offresEmploi } = await import("../drizzle/schema");
        
        // Vérifier que l'offre existe
        const offres = await dbInstance
          .select()
          .from(offresEmploi)
          .where(eq(offresEmploi.id, input.offreId))
          .limit(1);
        
        if (offres.length === 0) {
          throw new Error("Offre non trouvée");
        }
        
        // Vérifier que le candidat n'a pas déjà postulé
        const existingCandidatures = await dbInstance
          .select()
          .from(candidatures)
          .where(
            and(
              eq(candidatures.candidatId, candidat.id),
              eq(candidatures.offreId, input.offreId)
            )
          )
          .limit(1);
        
        if (existingCandidatures.length > 0) {
          throw new Error("Vous avez déjà postulé à cette offre");
        }
        
        // Créer la candidature
        const result = await dbInstance.insert(candidatures).values({
          candidatId: candidat.id,
          offreId: input.offreId,
          lettreMotivation: input.lettreMotivation,
          cvUrl: input.cvUrl || candidat.cvUrl || null,
          cvFileKey: input.cvFileKey || candidat.cvFileKey || null,
          documentsSupplementaires: input.documentsSupplementaires || null,
          statut: "en_attente",
        });
        
        // Incrémenter le nombre de candidatures de l'offre
        const offre = offres[0];
        await dbInstance
          .update(offresEmploi)
          .set({ nombreCandidatures: (offre.nombreCandidatures || 0) + 1 })
          .where(eq(offresEmploi.id, input.offreId));
        
        // Envoyer une notification email à l'employeur
        try {
          const { employeurs } = await import("../drizzle/schema");
          const employeurData = await dbInstance
            .select()
            .from(employeurs)
            .where(eq(employeurs.id, offre.employeurId))
            .limit(1);
          
          if (employeurData.length > 0) {
            const employeur = employeurData[0];
            const { users } = await import("../drizzle/schema");
            const employeurUser = await dbInstance
              .select()
              .from(users)
              .where(eq(users.id, employeur.userId))
              .limit(1);
            
            if (employeurUser.length > 0 && employeurUser[0].email) {
              const { sendEmail, templateNouvelleCandidature } = await import("./_core/email");
              await sendEmail({
                to: employeurUser[0].email,
                subject: `Nouvelle candidature pour ${offre.titre}`,
                html: templateNouvelleCandidature({
                  employeurNom: employeur.nomEntreprise || employeurUser[0].name || "Employeur",
                  candidatNom: ctx.user.name || "Un candidat",
                  offreTitre: offre.titre,
                  offreId: offre.id,
                  candidatureId: 0, // ID non disponible immédiatement
                }),
              });
            }
          }
        } catch (emailError) {
          console.error("[candidatures.create] Erreur lors de l'envoi de l'email:", emailError);
          // Ne pas bloquer la création de la candidature si l'email échoue
        }
        
        return { success: true };
      }),
    
    // Récupérer toutes les candidatures d'un candidat
    getByCandidat: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        
        if (ctx.user.profileType !== "candidat") {
          return [];
        }
        
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) return [];
        
        const { eq } = await import("drizzle-orm");
        const { candidatures, offresEmploi, employeurs } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");
        
        const results = await dbInstance
          .select({
            id: candidatures.id,
            statut: candidatures.statut,
            lettreMotivation: candidatures.lettreMotivation,
            dateCandidature: candidatures.dateCandidature,
            dateReponse: candidatures.dateReponse,
            commentaireEmployeur: candidatures.commentaireEmployeur,
            // Informations de l'offre
            offreId: offresEmploi.id,
            offreTitre: offresEmploi.titre,
            offreTypeOffre: offresEmploi.typeOffre,
            offreVille: offresEmploi.ville,
            offreRegion: offresEmploi.region,
            offreTypeContrat: offresEmploi.typeContrat,
            offreSalaire: offresEmploi.salaire,
            // Informations de l'entreprise
            entreprise: employeurs.nomEntreprise,
          })
          .from(candidatures)
          .leftJoin(offresEmploi, eq(candidatures.offreId, offresEmploi.id))
          .leftJoin(employeurs, eq(offresEmploi.employeurId, employeurs.id))
          .where(eq(candidatures.candidatId, candidat.id))
          .orderBy(desc(candidatures.dateCandidature));
        
        return results;
      }),
    
    // Récupérer une candidature par ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return null;
        
        const { eq } = await import("drizzle-orm");
        const { candidatures } = await import("../drizzle/schema");
        
        const results = await dbInstance
          .select()
          .from(candidatures)
          .where(eq(candidatures.id, input.id))
          .limit(1);
        
        return results[0] || null;
      }),
    
    // Vérifier si le candidat a déjà postulé à une offre
    hasApplied: protectedProcedure
      .input(z.object({ offreId: z.number() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return false;
        
        if (ctx.user.profileType !== "candidat") {
          return false;
        }
        
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) return false;
        
        const { eq, and } = await import("drizzle-orm");
        const { candidatures } = await import("../drizzle/schema");
        
        const results = await dbInstance
          .select()
          .from(candidatures)
          .where(
            and(
              eq(candidatures.candidatId, candidat.id),
              eq(candidatures.offreId, input.offreId)
            )
          )
          .limit(1);
        
        return results.length > 0;
      }),
    
    // Récupérer toutes les candidatures pour un employeur
    getByEmployeur: protectedProcedure
      .input(z.object({
        statut: z.enum(["en_attente", "vue", "retenue", "rejetee", "entretien"]).optional(),
        offreId: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        
        if (ctx.user.profileType !== "employeur" && ctx.user.role !== "admin") {
          return [];
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) return [];
        
        const { eq, and } = await import("drizzle-orm");
        const { candidatures, offresEmploi, candidats, users } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");
        
        // Construire les conditions de filtrage
        const conditions = [eq(offresEmploi.employeurId, employeur.id)];
        
        if (input?.statut) {
          conditions.push(eq(candidatures.statut, input.statut));
        }
        
        if (input?.offreId) {
          conditions.push(eq(candidatures.offreId, input.offreId));
        }
        
        const results = await dbInstance
          .select({
            id: candidatures.id,
            statut: candidatures.statut,
            lettreMotivation: candidatures.lettreMotivation,
            cvUrl: candidatures.cvUrl,
            cvFileKey: candidatures.cvFileKey,
            documentsSupplementaires: candidatures.documentsSupplementaires,
            dateCandidature: candidatures.dateCandidature,
            dateReponse: candidatures.dateReponse,
            commentaireEmployeur: candidatures.commentaireEmployeur,
            // Informations de l'offre
            offreId: offresEmploi.id,
            offreTitre: offresEmploi.titre,
            offreTypeOffre: offresEmploi.typeOffre,
            // Informations du candidat
            candidatId: candidats.id,
            candidatNom: candidats.nom,
            candidatPrenom: candidats.prenom,
            candidatEmail: users.email,
            candidatTelephone: candidats.telephone,
            candidatVille: candidats.ville,
            candidatPhotoUrl: candidats.photoUrl,
          })
          .from(candidatures)
          .innerJoin(offresEmploi, eq(candidatures.offreId, offresEmploi.id))
          .innerJoin(candidats, eq(candidatures.candidatId, candidats.id))
          .innerJoin(users, eq(candidats.userId, users.id))
          .where(and(...conditions))
          .orderBy(desc(candidatures.dateCandidature));
        
        return results;
      }),
    
    // Mettre à jour le statut d'une candidature
    updateStatut: protectedProcedure
      .input(z.object({
        candidatureId: z.number(),
        statut: z.enum(["en_attente", "vue", "retenue", "rejetee", "entretien"]),
        commentaire: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        if (ctx.user.profileType !== "employeur" && ctx.user.role !== "admin") {
          throw new Error("Seuls les employeurs peuvent modifier les candidatures");
        }
        
        const employeur = await db.getEmployeurByUserId(ctx.user.id);
        if (!employeur) {
          throw new Error("Profil employeur non trouvé");
        }
        
        const { eq, and } = await import("drizzle-orm");
        const { candidatures, offresEmploi } = await import("../drizzle/schema");
        
        // Vérifier que la candidature appartient bien à une offre de cet employeur
        const candidatureData = await dbInstance
          .select({
            candidatureId: candidatures.id,
            offreId: candidatures.offreId,
            employeurId: offresEmploi.employeurId,
          })
          .from(candidatures)
          .innerJoin(offresEmploi, eq(candidatures.offreId, offresEmploi.id))
          .where(eq(candidatures.id, input.candidatureId))
          .limit(1);
        
        if (candidatureData.length === 0) {
          throw new Error("Candidature non trouvée");
        }
        
        if (candidatureData[0].employeurId !== employeur.id) {
          throw new Error("Vous n'avez pas accès à cette candidature");
        }
        
        // Mettre à jour la candidature
        const updateData: any = {
          statut: input.statut,
          dateReponse: new Date(),
        };
        
        if (input.commentaire) {
          updateData.commentaireEmployeur = input.commentaire;
        }
        
        await dbInstance
          .update(candidatures)
          .set(updateData)
          .where(eq(candidatures.id, input.candidatureId));
        
        // Envoyer une notification email au candidat
        try {
          const candidatureComplete = await dbInstance
            .select({
              candidatId: candidatures.candidatId,
              offreId: candidatures.offreId,
              offreTitre: offresEmploi.titre,
            })
            .from(candidatures)
            .innerJoin(offresEmploi, eq(candidatures.offreId, offresEmploi.id))
            .where(eq(candidatures.id, input.candidatureId))
            .limit(1);
          
          if (candidatureComplete.length > 0) {
            const { candidats, users } = await import("../drizzle/schema");
            const candidatData = await dbInstance
              .select()
              .from(candidats)
              .where(eq(candidats.id, candidatureComplete[0].candidatId))
              .limit(1);
            
            if (candidatData.length > 0) {
              const candidatUser = await dbInstance
                .select()
                .from(users)
                .where(eq(users.id, candidatData[0].userId))
                .limit(1);
              
              if (candidatUser.length > 0 && candidatUser[0].email) {
                const { sendEmail, templateChangementStatut } = await import("./_core/email");
                await sendEmail({
                  to: candidatUser[0].email,
                  subject: `Mise à jour de votre candidature - ${candidatureComplete[0].offreTitre}`,
                  html: templateChangementStatut({
                    candidatNom: candidatUser[0].name || "Candidat",
                    offreTitre: candidatureComplete[0].offreTitre,
                    entreprise: employeur.nomEntreprise || "l'entreprise",
                    nouveauStatut: input.statut,
                    commentaire: input.commentaire,
                    offreId: candidatureComplete[0].offreId,
                  }),
                });
              }
            }
          }
        } catch (emailError) {
          console.error("[candidatures.updateStatut] Erreur lors de l'envoi de l'email:", emailError);
          // Ne pas bloquer la mise à jour si l'email échoue
        }
        
        return { success: true };
      }),
  }),

  // ─── Router Alertes Emploi ───────────────────────────────────────────────
  alertes: router({
    // Créer une alerte
    create: protectedProcedure
      .input(z.object({
        nom: z.string().min(1).max(200),
        motsCles: z.string().optional(),
        secteur: z.string().optional(),
        typeContrat: z.string().optional(),
        typeOffre: z.enum(["public", "prive", "tous"]).default("tous"),
        ville: z.string().optional(),
        region: z.string().optional(),
        salaireMinimum: z.number().optional(),
        frequence: z.enum(["immediate", "quotidien", "hebdomadaire"]).default("quotidien"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.profileType !== "candidat") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Réservé aux candidats" });
        }
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new TRPCError({ code: "NOT_FOUND", message: "Profil candidat introuvable" });
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { alertes } = await import("../drizzle/schema");
        await dbInstance.insert(alertes).values({
          candidatId: candidat.id,
          nom: input.nom,
          motsCles: input.motsCles || null,
          secteur: input.secteur || null,
          typeContrat: input.typeContrat || null,
          typeOffre: input.typeOffre,
          ville: input.ville || null,
          region: input.region || null,
          salaireMinimum: input.salaireMinimum ? String(input.salaireMinimum) : null,
          frequence: input.frequence,
          active: true,
        });
        return { success: true };
      }),

    // Lister les alertes du candidat
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.profileType !== "candidat") return [];
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) return [];
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        const { alertes } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        return dbInstance
          .select()
          .from(alertes)
          .where(eq(alertes.candidatId, candidat.id))
          .orderBy(desc(alertes.createdAt));
      }),

    // Supprimer une alerte
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new TRPCError({ code: "NOT_FOUND" });
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { alertes } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        await dbInstance
          .delete(alertes)
          .where(and(eq(alertes.id, input.id), eq(alertes.candidatId, candidat.id)));
        return { success: true };
      }),

    // Activer / désactiver une alerte
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), active: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const candidat = await db.getCandidatByUserId(ctx.user.id);
        if (!candidat) throw new TRPCError({ code: "NOT_FOUND" });
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { alertes } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        await dbInstance
          .update(alertes)
          .set({ active: input.active })
          .where(and(eq(alertes.id, input.id), eq(alertes.candidatId, candidat.id)));
        return { success: true };
      }),
  }),

  // ─── Router Conseils ──────────────────────────────────────────────────────
  conseils: router({
    // Récupérer tous les articles avec filtrage optionnel par catégorie
    getAll: publicProcedure
      .input(z.object({
        categorie: z.enum(["Entretien", "CV", "Marché", "Négociation", "Reconversion", "Freelance"]).optional(),
        limit: z.number().min(1).max(50).default(12),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { articlesConseils } = await import("../drizzle/schema");
        const { desc, and, eq, count } = await import("drizzle-orm");
        const conditions = input.categorie ? [eq(articlesConseils.categorie, input.categorie)] : [];
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const [articles, [{ total }]] = await Promise.all([
          dbInstance
            .select()
            .from(articlesConseils)
            .where(whereClause)
            .orderBy(desc(articlesConseils.datePublication))
            .limit(input.limit)
            .offset(input.offset),
          dbInstance.select({ total: count() }).from(articlesConseils).where(whereClause),
        ]);
        return { articles, total: Number(total) };
      }),

    // Récupérer un article par son slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { articlesConseils } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const [article] = await dbInstance
          .select()
          .from(articlesConseils)
          .where(eq(articlesConseils.slug, input.slug))
          .limit(1);
        if (!article) throw new TRPCError({ code: "NOT_FOUND", message: "Article introuvable" });
        return article;
      }),

    // Récupérer des articles similaires (même catégorie, excluant l'article courant)
    getSimilaires: publicProcedure
      .input(z.object({ categorie: z.string(), excludeSlug: z.string(), limit: z.number().default(3) }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { articlesConseils } = await import("../drizzle/schema");
        const { eq, ne, and, desc } = await import("drizzle-orm");
        const articles = await dbInstance
          .select()
          .from(articlesConseils)
          .where(and(
            eq(articlesConseils.categorie, input.categorie as any),
            ne(articlesConseils.slug, input.excludeSlug)
          ))
          .orderBy(desc(articlesConseils.datePublication))
          .limit(input.limit);
        return articles;
      }),
  }),

  // ─── Router CV ──────────────────────────────────────────────────────────────
  cv: router({
    // Lister les CV de l'utilisateur connecté
    list: protectedProcedure.query(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { cvDocuments } = await import("../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      const docs = await dbInstance
        .select()
        .from(cvDocuments)
        .where(eq(cvDocuments.userId, ctx.user.id))
        .orderBy(desc(cvDocuments.createdAt));
      return docs;
    }),

    // Créer un nouveau CV (upload ou builder)
    create: protectedProcedure
      .input(z.object({
        nom: z.string().min(1),
        type: z.enum(["upload", "classique", "moderne", "creatif"]),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
        langue: z.enum(["fr", "en"]).default("fr"),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { cvDocuments } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await dbInstance.update(cvDocuments).set({ actif: false }).where(eq(cvDocuments.userId, ctx.user.id));
        const [result] = await dbInstance.insert(cvDocuments).values({
          userId: ctx.user.id,
          nom: input.nom,
          type: input.type,
          fileUrl: input.fileUrl || null,
          fileKey: input.fileKey || null,
          langue: input.langue,
          actif: true,
          visibleCVtheque: true,
        });
        return { id: (result as any).insertId };
      }),

    // Mettre à jour les données d'un CV builder
    saveData: protectedProcedure
      .input(z.object({
        cvId: z.number(),
        prenom: z.string().optional(),
        nom: z.string().optional(),
        titre: z.string().optional(),
        email: z.string().optional(),
        telephone: z.string().optional(),
        adresse: z.string().optional(),
        siteWeb: z.string().optional(),
        photoUrl: z.string().optional(),
        photoKey: z.string().optional(),
        couleurColonne: z.string().optional(),
        experiences: z.string().optional(),
        formations: z.string().optional(),
        competences: z.string().optional(),
        languesCv: z.string().optional(),
        certifications: z.string().optional(),
        loisirs: z.string().optional(),
        resume: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { cvData, cvDocuments } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const [cvDoc] = await dbInstance.select().from(cvDocuments)
          .where(and(eq(cvDocuments.id, input.cvId), eq(cvDocuments.userId, ctx.user.id))).limit(1);
        if (!cvDoc) throw new TRPCError({ code: "FORBIDDEN" });
        const { cvId, ...data } = input;
        const [existing] = await dbInstance.select().from(cvData).where(eq(cvData.cvId, cvId)).limit(1);
        if (existing) {
          await dbInstance.update(cvData).set(data).where(eq(cvData.cvId, cvId));
        } else {
          await dbInstance.insert(cvData).values({ cvId, ...data });
        }
        return { success: true };
      }),

    // Récupérer les données d'un CV builder
    getData: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { cvData, cvDocuments } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const [cvDoc] = await dbInstance.select().from(cvDocuments)
          .where(and(eq(cvDocuments.id, input.cvId), eq(cvDocuments.userId, ctx.user.id))).limit(1);
        if (!cvDoc) throw new TRPCError({ code: "FORBIDDEN" });
        const [data] = await dbInstance.select().from(cvData).where(eq(cvData.cvId, input.cvId)).limit(1);
        return data || null;
      }),

    // Définir un CV comme actif
    setActif: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { cvDocuments } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await dbInstance.update(cvDocuments).set({ actif: false }).where(eq(cvDocuments.userId, ctx.user.id));
        await dbInstance.update(cvDocuments).set({ actif: true }).where(eq(cvDocuments.id, input.cvId));
        return { success: true };
      }),

    // Supprimer un CV
    delete: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { cvDocuments, cvData } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const [cvDoc] = await dbInstance.select().from(cvDocuments)
          .where(and(eq(cvDocuments.id, input.cvId), eq(cvDocuments.userId, ctx.user.id))).limit(1);
        if (!cvDoc) throw new TRPCError({ code: "FORBIDDEN" });
        await dbInstance.delete(cvData).where(eq(cvData.cvId, input.cvId));
        await dbInstance.delete(cvDocuments).where(eq(cvDocuments.id, input.cvId));
        return { success: true };
      }),

    // Basculer la visibilité d'un CV dans la CVthèque
    toggleVisibiliteCVtheque: protectedProcedure
      .input(z.object({ cvId: z.number(), visible: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { cvDocuments } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        // Vérifier que le CV appartient bien à l'utilisateur
        const [cvDoc] = await dbInstance.select().from(cvDocuments)
          .where(and(eq(cvDocuments.id, input.cvId), eq(cvDocuments.userId, ctx.user.id))).limit(1);
        if (!cvDoc) throw new TRPCError({ code: "FORBIDDEN", message: "CV introuvable ou accès refusé" });
        await dbInstance.update(cvDocuments)
          .set({ visibleCVtheque: input.visible })
          .where(eq(cvDocuments.id, input.cvId));
        return { success: true, visible: input.visible };
      }),

    // CVthèque publique (pour les recruteurs)
    getCVtheque: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(12),
        competence: z.string().optional(),
        ville: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { cvDocuments, cvData, users, candidats, employeurs } = await import("../drizzle/schema");
        const { eq, and, desc, count, like, or, sql } = await import("drizzle-orm");

        // Contrôle d'accès par formule : la CVthèque est réservée aux employeurs
        // ayant souscrit une formule payante (professionnel ou entreprise)
        if (ctx.user.role !== "admin") {
          const [employeurProfile] = await dbInstance
            .select({ formule: employeurs.formuleAbonnement })
            .from(employeurs)
            .where(eq(employeurs.userId, ctx.user.id))
            .limit(1);

          if (!employeurProfile) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Profil employeur introuvable. Complétez votre profil entreprise.",
            });
          }
          if (employeurProfile.formule === "gratuit") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "FORMULE_REQUISE",
            });
          }
        }

        const offset = (input.page - 1) * input.limit;

        // Conditions de base : CV actif et visible dans la CVthèque
        const baseConditions: any[] = [
          eq(cvDocuments.actif, true),
          eq(cvDocuments.visibleCVtheque, true),
        ];

        // Filtres optionnels : chercher dans cv_data ET dans candidats (fallback pour CV uploadés)
        if (input.competence && input.competence.trim()) {
          const term = `%${input.competence.trim()}%`;
          baseConditions.push(
            or(
              like(cvData.competences, term),
              like(candidats.secteurRecherche, term),
            )
          );
        }
        if (input.ville && input.ville.trim()) {
          const term = `%${input.ville.trim()}%`;
          baseConditions.push(
            or(
              like(cvData.adresse, term),
              like(candidats.ville, term),
              like(candidats.adresse, term),
            )
          );
        }
        const whereClause = and(...baseConditions);

        const [docs, [{ total }]] = await Promise.all([
          dbInstance.select({
            cv: cvDocuments,
            user: { id: users.id, name: users.name, email: users.email },
            // cv_data pour les CV builder (classique/moderne)
            data: {
              titre: cvData.titre,
              competences: cvData.competences,
              adresse: cvData.adresse,
              prenom: cvData.prenom,
              nom: cvData.nom,
              photoUrl: cvData.photoUrl,
            },
            // candidats pour le fallback (CV uploadés)
            candidat: {
              prenom: candidats.prenom,
              nom: candidats.nom,
              ville: candidats.ville,
              adresse: candidats.adresse,
              secteurRecherche: candidats.secteurRecherche,
              photoUrl: candidats.photoUrl,
            },
          })
            .from(cvDocuments)
            .innerJoin(users, eq(cvDocuments.userId, users.id))
            .leftJoin(cvData, eq(cvData.cvId, cvDocuments.id))
            .leftJoin(candidats, eq(candidats.userId, cvDocuments.userId))
            .where(whereClause)
            .orderBy(desc(cvDocuments.createdAt))
            .limit(input.limit)
            .offset(offset),
          dbInstance.select({ total: count() })
            .from(cvDocuments)
            .innerJoin(users, eq(cvDocuments.userId, users.id))
            .leftJoin(cvData, eq(cvData.cvId, cvDocuments.id))
            .leftJoin(candidats, eq(candidats.userId, cvDocuments.userId))
            .where(whereClause),
        ]);

        // Normaliser les données : utiliser cv_data en priorité, candidats en fallback
        const normalizedDocs = docs.map(doc => ({
          cv: doc.cv,
          user: doc.user,
          displayData: {
            prenom: doc.data?.prenom || doc.candidat?.prenom || null,
            nom: doc.data?.nom || doc.candidat?.nom || null,
            titre: doc.data?.titre || doc.candidat?.secteurRecherche || null,
            competences: doc.data?.competences || doc.candidat?.secteurRecherche || null,
            adresse: doc.data?.adresse || doc.candidat?.ville || doc.candidat?.adresse || null,
            photoUrl: doc.data?.photoUrl || doc.candidat?.photoUrl || null,
          },
        }));

        return { docs: normalizedDocs, total: Number(total) };
      }),

    // Profil public d'un candidat
    getPublicProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { cvDocuments, cvData, users, candidats } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const [user] = await dbInstance.select({ id: users.id, name: users.name })
          .from(users).where(eq(users.id, input.userId)).limit(1);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const [candidat] = await dbInstance.select().from(candidats)
          .where(eq(candidats.userId, input.userId)).limit(1);
        const [activeCv] = await dbInstance.select().from(cvDocuments)
          .where(and(eq(cvDocuments.userId, input.userId), eq(cvDocuments.actif, true))).limit(1);
        let cvDataRecord = null;
        if (activeCv && (activeCv.type === "classique" || activeCv.type === "moderne")) {
          const [data] = await dbInstance.select().from(cvData)
            .where(eq(cvData.cvId, activeCv.id)).limit(1);
          cvDataRecord = data || null;
        }
        return { user, candidat, activeCv, cvData: cvDataRecord };
      }),
  }),

  // ─── Messages internes ────────────────────────────────────────────────────────
  messages: router({
    // Envoyer un message (recruteur → candidat)
    send: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        sujet: z.string().max(300).optional(),
        contenu: z.string().min(1).max(5000),
        cvId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { messages } = await import("../drizzle/schema");
        await dbInstance.insert(messages).values({
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          sujet: input.sujet,
          contenu: input.contenu,
          cvId: input.cvId,
          lu: false,
        });
        return { success: true };
      }),

    // Lister les messages reçus
    listReceived: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { messages, users } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        const msgs = await dbInstance
          .select({
            id: messages.id,
            sujet: messages.sujet,
            contenu: messages.contenu,
            cvId: messages.cvId,
            lu: messages.lu,
            dateLecture: messages.dateLecture,
            createdAt: messages.createdAt,
            senderName: users.name,
            senderId: messages.senderId,
          })
          .from(messages)
          .leftJoin(users, eq(messages.senderId, users.id))
          .where(eq(messages.receiverId, ctx.user.id))
          .orderBy(desc(messages.createdAt));
        return msgs;
      }),

    // Marquer un message comme lu
    markRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { messages } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        await dbInstance.update(messages)
          .set({ lu: true, dateLecture: new Date() })
          .where(and(eq(messages.id, input.messageId), eq(messages.receiverId, ctx.user.id)));
        return { success: true };
      }),

    // Nombre de messages non lus
    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { messages } = await import("../drizzle/schema");
        const { eq, and, count } = await import("drizzle-orm");
        const [result] = await dbInstance
          .select({ count: count() })
          .from(messages)
          .where(and(eq(messages.receiverId, ctx.user.id), eq(messages.lu, false)));
        return { count: Number(result?.count ?? 0) };
      }),
  }),

  // ─── Formules tarifaires publiques ────────────────────────────────────────────
  formules: router({
    // Récupérer les formules actives pour une cible donnée (public)
    getActives: publicProcedure
      .input(z.object({
        cible: z.enum(["candidat", "employeur"]).optional(),
      }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { formulesTarifaires } = await import('../drizzle/schema');
        const { eq, and, asc } = await import('drizzle-orm');
        const conditions = [eq(formulesTarifaires.actif, true)];
        if (input.cible) conditions.push(eq(formulesTarifaires.cible, input.cible));
        return dbInstance
          .select()
          .from(formulesTarifaires)
          .where(and(...conditions))
          .orderBy(asc(formulesTarifaires.ordre));
      }),
  }),

  // ─── Vues de profil CVthèque ──────────────────────────────────────────────────
  profileViews: router({
    // Enregistrer une vue de profil
    record: publicProcedure
      .input(z.object({
        candidatUserId: z.number(),
        cvId: z.number().optional(),
        viewerUserId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { profileViews } = await import("../drizzle/schema");
        await dbInstance.insert(profileViews).values({
          candidatUserId: input.candidatUserId,
          viewerUserId: input.viewerUserId,
          cvId: input.cvId,
        });
        return { success: true };
      }),

    // Statistiques de vues pour le candidat connecté
    myStats: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { profileViews } = await import("../drizzle/schema");
        const { eq, count, gte, and } = await import("drizzle-orm");
        const [total] = await dbInstance
          .select({ count: count() })
          .from(profileViews)
          .where(eq(profileViews.candidatUserId, ctx.user.id));
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [recent] = await dbInstance
          .select({ count: count() })
          .from(profileViews)
          .where(and(eq(profileViews.candidatUserId, ctx.user.id), gte(profileViews.createdAt, sevenDaysAgo)));
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [monthly] = await dbInstance
          .select({ count: count() })
          .from(profileViews)
          .where(and(eq(profileViews.candidatUserId, ctx.user.id), gte(profileViews.createdAt, thirtyDaysAgo)));
        return {
          total: Number(total?.count ?? 0),
          last7Days: Number(recent?.count ?? 0),
          last30Days: Number(monthly?.count ?? 0),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
