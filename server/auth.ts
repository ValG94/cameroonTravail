import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Hacher un mot de passe avec bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  // 12 rounds = ~150ms / hash (vs ~40ms à 10) — augmente significativement
  // le coût d'une attaque brute-force. Les hashs déjà en BDD restent valides
  // car bcrypt encode le coût dans le hash lui-même : verifyPassword fonctionne
  // pour tout coût ≤ 12, le nouveau coût ne s'applique qu'aux NOUVEAUX hashs.
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Vérifier un mot de passe avec bcrypt
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Créer un utilisateur avec email et mot de passe
 */
export async function createUserWithPassword(
  email: string,
  password: string,
  name: string,
  profileType: "candidat" | "employeur"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Vérifier si l'email existe déjà
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Un compte avec cet email existe déjà");
  }

  // Hacher le mot de passe
  const hashedPassword = await hashPassword(password);

  // Créer l'utilisateur
  const result = await db.insert(users).values({
    email: normalizedEmail,
    password: hashedPassword,
    name,
    profileType,
    loginMethod: "email",
    role: "user",
    lastSignedIn: new Date(),
  });

  return result;
}

/**
 * Authentifier un utilisateur avec email et mot de passe
 */
export async function authenticateUser(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Trouver l'utilisateur par email
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (result.length === 0) {
    return null; // Utilisateur non trouvé
  }

  const user = result[0];

  // Vérifier si l'utilisateur a un mot de passe
  if (!user.password) {
    throw new Error("Ce compte utilise une autre méthode de connexion");
  }

  // Vérifier le mot de passe
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null; // Mot de passe incorrect
  }

  // Mettre à jour la dernière connexion
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return user;
}
