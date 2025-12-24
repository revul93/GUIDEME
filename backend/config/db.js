import "dotenv/config";
import { env } from "prisma/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({ url: env("DATABASE_URL") });
const prisma = new PrismaClient({ adapter });

export default prisma;
