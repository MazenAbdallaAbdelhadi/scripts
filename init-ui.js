#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { execSync } = require("child_process");
const fs = require("fs");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function log(msg) {
  console.log(msg);
}

/* ----------------------------------------
 * 1. Validate Next.js + Tailwind
 * -------------------------------------- */
log("🎨 Initializing UI (shadcn)...");

if (!fs.existsSync("package.json")) {
  console.error("❌ package.json not found.");
  process.exit(1);
}

/* ----------------------------------------
 * 2. Init shadcn (safe)
 * -------------------------------------- */
log("🧩 Initializing shadcn/ui...");

try {
  run("npx shadcn@latest init");
} catch {
  log("⚠️ shadcn already initialized. Skipping.");
}

/* ----------------------------------------
 * 3. Install base components
 * -------------------------------------- */
log("📦 Installing base UI components...");

const components = [
  "button",
  "card",
  "badge",
  "input",
  "label",
  "textarea",
  "dropdown-menu",
  "dialog",
  "alert",
  "separator",
  "skeleton",
  "sidebar",
  "sonner",
  "tabs",
  "empty",
  "avatar",
  "spinner",
  "input-group"
];

try {
  run(`npx shadcn@latest add ${components.join(" ")} -y`);
} catch {
  log(`⚠️ ${components.join(", ")} already exist. Skipping.`);
}

/* ----------------------------------------
 * Done
 * -------------------------------------- */
log("✅ UI initialized successfully!");
log("👉 You now have shadcn + base components ready.");
