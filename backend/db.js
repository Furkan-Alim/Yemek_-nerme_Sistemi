import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[db] DATABASE_URL tanımlı değil; PostgreSQL bağlantısı kurulamaz."
  );
}

export const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

export async function testConnection() {
  if (!connectionString) {
    console.error("[db] DATABASE_URL eksik.");
    return false;
  }
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("[db] PostgreSQL bağlantısı OK");
    return true;
  } catch (err) {
    console.error("[db] PostgreSQL bağlantı hatası:", err.message);
    return false;
  }
}
