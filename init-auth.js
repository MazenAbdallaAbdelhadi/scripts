#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function log(msg) {
  console.log(msg);
}

/* ----------------------------------------
 * 1. Validate Prisma exists
 * -------------------------------------- */
log("🔐 Initializing Better Auth...");

const prismaSchema = path.join("prisma", "schema.prisma");
if (!fs.existsSync(prismaSchema)) {
  console.error("❌ Prisma schema not found. Run init-prisma first.");
  process.exit(1);
}

log("📦 Generating prisma schema...");
run("npm run db:generate");

/* ----------------------------------------
 * 2. Install dependencies
 * -------------------------------------- */
log("📦 Installing Better Auth core...");
run("npm install better-auth");

/* ----------------------------------------
 * 3. Update .env
 * -------------------------------------- */
const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, "");
}

let env = fs.readFileSync(envPath, "utf-8");

if (!env.includes("BETTER_AUTH_SECRET")) {
  log("✨ Adding BETTER_AUTH_SECRET to .env");
  fs.appendFileSync(
    envPath,
    `\nBETTER_AUTH_SECRET=${crypto.randomBytes(64).toString("hex")} \n`
  );
}

if (!env.includes("BETTER_AUTH_URL")) {
  log("✨ Adding BETTER_AUTH_URL to .env (optional)");
  fs.appendFileSync(envPath, "\nBETTER_AUTH_URL=http://localhost:3000\n");
}

/* ----------------------------------------
 * 4. Create auth config file
 * -------------------------------------- */
const hasSrc = fs.existsSync("src");
const baseDir = hasSrc ? "src" : ".";
const libDir = path.join(baseDir, "lib");

if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

const authConfigPath = path.join(libDir, "auth.ts");

if (!fs.existsSync(authConfigPath)) {
  log("🧩 Creating Better Auth config...");
  fs.writeFileSync(
    authConfigPath,
    `import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: { enabled: true },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  
  plugins: [nextCookies(),],
});
`
  );
} else {
  log("⚠️ Better Auth config already exists. Skipping.");
}

/* ----------------------------------------
 * 5. Create auth-client config file
 * -------------------------------------- */

if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

const authClientConfigPath = path.join(libDir, "auth-client.ts");

if (!fs.existsSync(authClientConfigPath)) {
  log("🧩 Creating Better Auth Client config...");
  fs.writeFileSync(
    authClientConfigPath,
    `import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
} from "better-auth/client/plugins";

import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
});

`
  );
} else {
  log("⚠️ Better Auth Client config already exists. Skipping.");
}

/* ----------------------------------------
 * 6. Run Better Auth CLI to add models
 * -------------------------------------- */
log("🛠️ Running Better Auth CLI to add auth models...");
run("npx @better-auth/cli@latest generate");

/* ----------------------------------------
 * 7. Create Next API handler
 * -------------------------------------- */
const apiDir = path.join(baseDir, "app/api/auth/[...all]");
if (!fs.existsSync(apiDir)) {
  log("📁 Creating API route for auth...");
  fs.mkdirSync(apiDir, { recursive: true });
}

const routePath = path.join(apiDir, "route.ts");

if (!fs.existsSync(routePath)) {
  log("📄 Creating auth API handler...");
  fs.writeFileSync(
    routePath,
    `import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
`
  );
}

/* ----------------------------------------
 * Done
 * -------------------------------------- */
log("✅ Better Auth initialization complete!");
log("👉 Next steps:");
log("   1. Edit your .env and fill BETTER_AUTH_SECRET");
log("   2. Run: npx prisma migrate dev --name add-auth-models");
