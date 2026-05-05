export const ENV = {
  appId: process.env.VITE_APP_ID ?? "cameroon-travail",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
