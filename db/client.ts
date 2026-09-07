import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

export const DATABASE_NAME = "AgroFlow.db";

let _expoSqlite: ReturnType<typeof openDatabaseSync> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

const getExpoSqlite = () => (_expoSqlite ??= openDatabaseSync(DATABASE_NAME));
const getDb = () => (_db ??= drizzle(getExpoSqlite(), { schema }));

// Proxies keep the real SQLite connection from opening at import time (every
// consumer just does `db.select(...)` etc. as before) — it opens lazily on
// first real use instead, so importing a light sibling from the same module
// graph no longer drags a real database connection along with it.
export const expo_sqlite = new Proxy({} as ReturnType<typeof openDatabaseSync>, {
  get: (_target, prop) => Reflect.get(getExpoSqlite(), prop),
});

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get: (_target, prop) => Reflect.get(getDb(), prop),
});
