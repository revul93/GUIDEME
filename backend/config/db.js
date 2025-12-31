import "dotenv/config";
import { env } from "prisma/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL =
  env("NODE_ENV") === "development" ? env("DEV_DB_URL") : env("PROD_DB_URL");

const adapter =
  env("NODE_ENV") === "development"
    ? new PrismaBetterSqlite3({ url: DATABASE_URL })
    : new PrismaPg({ connectionString: DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export default prisma;
