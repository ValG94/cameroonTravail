export const ENV = {
  appId: process.env.VITE_APP_ID ?? "cameroon-travail",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  // Adresse expéditrice utilisée par Resend. DOIT correspondre à un domaine
  // vérifié dans Resend en production. En dev, "onboarding@resend.dev" ne
  // livre QUE vers l'email du propriétaire du compte Resend.
  emailFrom: process.env.EMAIL_FROM ?? "Cameroon Travail <onboarding@resend.dev>",
  // URL publique du frontend (Vercel) — utilisée dans les emails
  frontendUrl: process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN?.split(",")[0]?.trim() ?? "",
  // Google OAuth (cf. routes /api/auth/google* et migration 0015)
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // URI de redirection enregistrée dans Google Cloud Console
  // (Credentials → OAuth Client ID → Authorized redirect URIs).
  // Doit pointer exactement vers .../api/auth/google/callback.
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
