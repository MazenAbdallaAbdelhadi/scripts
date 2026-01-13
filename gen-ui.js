#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

function log(msg) {
  console.log(msg);
}

/* ----------------------------------------
 * Detect App Router
 * -------------------------------------- */
const hasSrc = fs.existsSync("src");
const baseDir = hasSrc ? "src" : ".";
const appDir = path.join(baseDir, "app");

if (!fs.existsSync(appDir)) {
  console.error("❌ App Router not found. This script targets App Router only.");
  process.exit(1);
}

/* ----------------------------------------
 * Ensure components directory
 * -------------------------------------- */
const componentsDir = path.join(baseDir, "components");
fs.mkdirSync(componentsDir, { recursive: true });

/* ----------------------------------------
 * App Router pages
 * -------------------------------------- */
const pages = {
  "not-found.tsx": `
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you’re looking for doesn’t exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
`,
  "loading.tsx": `
import { PageLoader } from "@/components/page-loader"

export default function Loading() {
  return <PageLoader />
}
`,
};

for (const [file, content] of Object.entries(pages)) {
  const filePath = path.join(appDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content.trim());
    log(`📄 Created app/${file}`);
  }
}

/* ----------------------------------------
 * Reusable composed components
 * -------------------------------------- */
const components = {
  "coming-soon.tsx": `
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export function ComingSoon({ title = "Coming soon" }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>
            This feature is under construction.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
`,
  "page-loader.tsx": `
import { Loader2 } from "lucide-react"

export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}
`,
  "error-state.tsx": `
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again later.",
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
`,
};

for (const [file, content] of Object.entries(components)) {
  const filePath = path.join(componentsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content.trim());
    log(`🧩 Created components/${file}`);
  }
}

/* ----------------------------------------
 * Done
 * -------------------------------------- */
log("✅ UI generators created using shadcn Empty component");
