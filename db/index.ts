import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

declare global {
  var _pgClient: ReturnType<typeof postgres> | undefined
  var _db: ReturnType<typeof drizzle<typeof schema>> | undefined
}

function createDb() {
  if (!global._pgClient) {
    global._pgClient = postgres(process.env.DATABASE_URL!, {
      prepare: false,      // required for Supabase pgbouncer
      max: 10,             // connection pool size
      idle_timeout: 20,    // close idle connections after 20s
      connect_timeout: 10, // fail fast if can't connect
    })
  }

  if (!global._db) {
    global._db = drizzle(global._pgClient, { schema })
  }

  return global._db
}

export const db = createDb()