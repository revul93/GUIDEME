import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const schema =
  env("NODE_ENV") === "development"
    ? "prisma/dev_schema.prisma"
    : "prisma/prod_schema.prisma";

const migrations =
  env("NODE_ENV") === "development"
    ? { path: "prisma/dev_migrations", seed: "node prisma/seed_dev.js" }
    : { path: "prisma/prod_migrations", seed: "node prisma/seed_prod.js" };

const datasource = {
  url:
    env("NODE_ENV") === "development" ? env("DEV_DB_URL") : env("PROD_DB_URL"),
};
export default defineConfig({
  schema,
  migrations,
  datasource,
});
