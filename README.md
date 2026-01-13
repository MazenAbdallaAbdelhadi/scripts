# Next.js Scaffolding Scripts

A collection of Node.js scripts designed to automate the setup of a modern Next.js application stack. These scripts handle the boilerplate configuration for UI, Database, and Authentication layers.

## Scripts Overview

| Script | Purpose | Key Actions |
|--------|---------|-------------|
| `init-ui.js` | UI Framework Setup | Initializes `shadcn/ui`, installs base components (Button, Card, Sidebar, etc.). |
| `init-prisma.js` | Database Setup | Sets up Prisma ORM with PostgreSQL, creates client instance, adds scripts to `package.json`. |
| `init-auth.js` | Authentication Setup | Configures `better-auth`, creates API routes, client hooks, and updates `.env`. |
| `gen-ui.js` | Page & Component Gen | Generates common architectural components (`Loading`, `NotFound`) and utility components (`PageLoader`, `ErrorState`). |

## Prerequisites

- **Node.js** installed.
- Scripts should typically be run inside the root of a **Next.js (App Router)** project.
- Some scripts depend on others (e.g., Auth requires Prisma).

## Recommended Workflow

For a new project, run the scripts in the following order to ensure dependencies are met:

### 1. Initialize UI (`init-ui.js`)
Sets up the visual foundation.
```bash
node scripts/init-ui.js
```
*   **What it does**: Runs `shadcn init`, installs a curated list of components (button, input, toast, etc.).

### 2. Initialize Database (`init-prisma.js`)
Sets up the data layer.
```bash
node scripts/init-prisma.js
```
*   **What it does**: Installs Prisma packages, initializes `schema.prisma` with an example User model, creates a singleton `lib/prisma.ts` client, and adds helper scripts (`db:generate`, `db:migrate`) to your package.json.

### 3. Initialize Authentication (`init-auth.js`)
Configures authentication (requires Prisma).
```bash
node scripts/init-auth.js
```
*   **What it does**: Installs `better-auth`, generates the secret key in `.env`, creates `lib/auth.ts` config, and sets up the Next.js API route `app/api/auth/[...all]/route.ts`.

### 4. Generate Standard UI (`gen-ui.js`)
Creates standard app pages and utilities.
```bash
node scripts/gen-ui.js
```
*   **What it does**: Scaffolds `not-found.tsx`, `loading.tsx`, and standard UI states (Coming Soon, Page Loader) using the installed UI components.

## Technical Details

### `init-ui.js`
- **Target**: Shadcn UI.
- **Includes**: button, card, badge, input, label, textarea, dropdown-menu, dialog, alert, separator, skeleton, sidebar, sonner, tabs, empty, avatar, spinner, input-group.

### `init-prisma.js`
- **Database**: PostgreSQL (default).
- **Output**: `src/generated/prisma` (configured in init).
- **Safe**: Checks for existing files to avoid overwriting.

### `init-auth.js`
- **Library**: Better Auth.
- **Adapter**: Prisma (PostgreSQL).
- **Features**: Email/Password enabled by default, Session caching (5m).

### `gen-ui.js`
- **Requirements**: Expects the `src/app` directory structure.
- **Components Used**: Relies on an `Empty` component (likely custom or part of your specific UI kit) for consistent error/404 states.
