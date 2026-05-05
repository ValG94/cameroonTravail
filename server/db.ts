import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  candidats,
  employeurs,
  experiences,
  formations,
  competences,
  langues,
  InsertCandidat,
  InsertEmployeur,
  InsertExperience,
  InsertFormation,
  InsertCompetence,
  InsertLangue,
  Candidat,
  Employeur,
  Experience,
  Formation,
  Competence,
  Langue,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { ssl: "require" });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (user.profileType !== undefined) {
      values.profileType = user.profileType;
      updateSet.profileType = user.profileType;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfileType(userId: number, profileType: "candidat" | "employeur") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set({ profileType }).where(eq(users.id, userId));
}

// Candidat helpers
export async function getCandidatByUserId(userId: number): Promise<Candidat | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(candidats).where(eq(candidats.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCandidat(data: InsertCandidat): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(candidats).values(data).returning({ id: candidats.id });
  return result[0].id;
}

export async function updateCandidat(id: number, data: Partial<InsertCandidat>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(candidats).set(data).where(eq(candidats.id, id));
}

// Employeur helpers
export async function getEmployeurByUserId(userId: number): Promise<Employeur | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(employeurs).where(eq(employeurs.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEmployeur(data: InsertEmployeur): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(employeurs).values(data).returning({ id: employeurs.id });
  return result[0].id;
}

export async function updateEmployeur(id: number, data: Partial<InsertEmployeur>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(employeurs).set(data).where(eq(employeurs.id, id));
}

// Experience helpers
export async function getExperiencesByCandidatId(candidatId: number): Promise<Experience[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(experiences).where(eq(experiences.candidatId, candidatId)).orderBy(desc(experiences.dateDebut));
}

export async function createExperience(data: InsertExperience): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(experiences).values(data).returning({ id: experiences.id });
  return result[0].id;
}

export async function updateExperience(id: number, data: Partial<InsertExperience>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(experiences).set(data).where(eq(experiences.id, id));
}

export async function deleteExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(experiences).where(eq(experiences.id, id));
}

// Formation helpers
export async function getFormationsByCandidatId(candidatId: number): Promise<Formation[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(formations).where(eq(formations.candidatId, candidatId)).orderBy(desc(formations.dateDebut));
}

export async function createFormation(data: InsertFormation): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(formations).values(data).returning({ id: formations.id });
  return result[0].id;
}

export async function updateFormation(id: number, data: Partial<InsertFormation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(formations).set(data).where(eq(formations.id, id));
}

export async function deleteFormation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(formations).where(eq(formations.id, id));
}

// Competence helpers
export async function getCompetencesByCandidatId(candidatId: number): Promise<Competence[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(competences).where(eq(competences.candidatId, candidatId));
}

export async function createCompetence(data: InsertCompetence): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(competences).values(data).returning({ id: competences.id });
  return result[0].id;
}

export async function updateCompetence(id: number, data: Partial<InsertCompetence>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(competences).set(data).where(eq(competences.id, id));
}

export async function deleteCompetence(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(competences).where(eq(competences.id, id));
}

// Langue helpers
export async function getLanguesByCandidatId(candidatId: number): Promise<Langue[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(langues).where(eq(langues.candidatId, candidatId));
}

export async function createLangue(data: InsertLangue): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(langues).values(data).returning({ id: langues.id });
  return result[0].id;
}

export async function updateLangue(id: number, data: Partial<InsertLangue>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(langues).set(data).where(eq(langues.id, id));
}

export async function deleteLangue(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(langues).where(eq(langues.id, id));
}
