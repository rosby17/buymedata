import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global { var __buyMeDataPool: Pool | undefined; }

export const pool = globalThis.__buyMeDataPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 10, ssl: false });
if (process.env.NODE_ENV !== "production") globalThis.__buyMeDataPool = pool;

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return pool.query<T>(text, values);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try { await client.query("BEGIN"); const result = await fn(client); await client.query("COMMIT"); return result; }
  catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
