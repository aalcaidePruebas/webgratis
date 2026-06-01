import { neon } from "@neondatabase/serverless";

const getDbUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Retornamos un string vacío o un placeholder durante la fase de build si no está definido
    return "";
  }
  return url;
};

// Creamos un cliente SQL seguro para entornos de servidor (Server Components / API Routes)
const databaseUrl = getDbUrl();
export const sql = databaseUrl ? neon(databaseUrl) : async (...args: any[]) => {
  console.warn("DATABASE_URL no configurada. Llamada SQL abortada.");
  return [] as any;
};
