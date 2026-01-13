#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function log(msg) {
  console.log(msg);
}

log("🚀 Initializing Prisma...");

/* ----------------------------------------
 * 1. Validate project
 * -------------------------------------- */
if (!fs.existsSync("package.json")) {
  console.error("❌ package.json not found. Run inside a Node.js project.");
  process.exit(1);
}

const pkgPath = path.resolve("package.json");
let pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

/* ----------------------------------------
 * 2. Install dependencies (idempotent)
 * -------------------------------------- */
log("📦 Ensuring Prisma dependencies...");

if (!pkg.devDependencies?.prisma || !pkg.devDependencies?.["@types/pg"]) {
  run("npm install prisma@latest @types/pg@latest --save-dev");
}

if (
  !pkg.dependencies?.["@prisma/client"] ||
  !pkg.dependencies?.["@prisma/adapter-pg"]
) {
  run(
    "npm install @prisma/client@latest @prisma/adapter-pg@latest dotenv@latest"
  );
}

/* ----------------------------------------
 * 3. Initialize Prisma
 * -------------------------------------- */
if (!fs.existsSync("prisma")) {
  log("🧬 Running prisma init...");
  run("npx prisma init --output ../src/generated/prisma");
} else {
  log("⚠️ Prisma already initialized.");
}

/* ----------------------------------------
 * 4. .env handling
 * -------------------------------------- */
if (!fs.existsSync(".env")) {
  log("🔐 Creating .env file...");
  fs.writeFileSync(".env", "");
}

const env = fs.readFileSync(".env", "utf-8");
if (!env.includes("DATABASE_URL=")) {
  log("🗄️ Adding DATABASE_URL...");
  fs.appendFileSync(
    ".env",
    '\nDATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>"\n'
  );
}

/* ----------------------------------------
 * 5. Prisma schema (example model)
 * -------------------------------------- */
const schemaPath = path.join("prisma", "schema.prisma");
const schema = fs.readFileSync(schemaPath, "utf-8");

if (!schema.includes("model User")) {
  log("📝 Adding example User model...");
  fs.appendFileSync(
    schemaPath,
    `
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
`
  );
}

/* ----------------------------------------
 * 6. Create Prisma client file
 * -------------------------------------- */
const hasSrc = fs.existsSync("src");
const baseDir = hasSrc ? "src" : ".";
const libDir = path.join(baseDir, "lib");
const prismaFile = path.join(libDir, "prisma.ts");

if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

if (!fs.existsSync(prismaFile)) {
  log(`🧩 Creating ${prismaFile}...`);

  fs.writeFileSync(
    prismaFile,
    `import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
`
  );
} else {
  log("⚠️ Prisma client already exists. Skipping.");
}

/* ----------------------------------------
 * 7. Update package.json scripts
 * -------------------------------------- */
log("🧠 Updating package.json scripts...");
pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
pkg.scripts = {
  ...pkg.scripts,
  "db:generate": "npx prisma generate",
  "db:migrate": "npx prisma migrate",
  "db:studio": "npx prisma studio",
  "db:push": "npx prisma db push",
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

/* ----------------------------------------
 * Done
 * -------------------------------------- */
log("✅ Prisma setup complete!");
log("👉 Next steps:");
log("   1. Update DATABASE_URL");
log("   2. Run: npm run db:generate");
log("   3. Run: npm run db:migrate");
