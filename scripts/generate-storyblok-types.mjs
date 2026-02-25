#!/usr/bin/env node

/**
 * generate-storyblok-types.mjs
 *
 * Pulls components from Storyblok, generates TypeScript types,
 * moves the space types to src/types/storyblok/<filename>.d.ts
 * and copies storyblok.d.ts to src/types/storyblok.d.ts
 *
 * Usage:
 *   node scripts/generate-storyblok-types.mjs --space <spaceId> [--filename <name>]
 *
 * Examples:
 *   node scripts/generate-storyblok-types.mjs --space 290622292656594
 *   node scripts/generate-storyblok-types.mjs --space 290622292656594 --filename mi-proyecto
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, copyFileSync, unlinkSync } from "fs";
import { join, resolve } from "path";

// ─── Parse flags ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

const spaceIndex = args.indexOf("--space");
if (spaceIndex === -1 || !args[spaceIndex + 1]) {
  console.error("❌ Error: --space <spaceId> is required");
  console.error(
    "   Usage: node scripts/generate-storyblok-types.mjs --space <spaceId> [--filename <name>]",
  );
  process.exit(1);
}

const SPACE_ID = args[spaceIndex + 1];

const filenameIndex = args.indexOf("--filename");
const FILENAME =
  filenameIndex !== -1 && args[filenameIndex + 1]
    ? args[filenameIndex + 1]
    : SPACE_ID;

console.log(`🔑 Using space: ${SPACE_ID}`);
console.log(`📄 Output filename: ${FILENAME}.d.ts`);

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT = resolve(process.cwd());

// Archivo de tipos del space generado por el CLI
const GENERATED_SPACE_FILE = join(
  ROOT,
  ".storyblok",
  "types",
  SPACE_ID,
  "storyblok.type.d.ts",
);

// Archivo storyblok.d.ts global generado por el CLI
const GENERATED_GLOBAL_FILE = join(
  ROOT,
  ".storyblok",
  "types",
  "storyblok.d.ts",
);

// Destinos en src/types
const OUTPUT_DIR = join(ROOT, "src", "types");
const OUTPUT_STORYBLOK_DIR = join(OUTPUT_DIR, "storyblok");
const OUTPUT_SPACE_FILE = join(OUTPUT_STORYBLOK_DIR, `${FILENAME}.ts`);
const OUTPUT_GLOBAL_FILE = join(OUTPUT_DIR, "storyblok.ts");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function run(command) {
  console.log(`\n▶ ${command}\n`);
  execSync(command, { stdio: "inherit", cwd: ROOT });
}

function moveFile(src, dest, label) {
  if (!existsSync(src)) {
    console.warn(`⚠️  ${label} not found at: ${src}, skipping.`);
    return;
  }
  if (existsSync(dest)) {
    console.log(`   ♻️  Replacing existing: ${label}`);
  } else {
    console.log(`   ✨ Creating new: ${label}`);
  }
  copyFileSync(src, dest);
  unlinkSync(src);
}

// ─── Steps ────────────────────────────────────────────────────────────────────

// 1. Pull components from Storyblok
console.log("📥 Step 1/3 — Pulling components from Storyblok...");
run(`pnpx storyblok components pull --space ${SPACE_ID}`);

// 2. Generate TypeScript types
console.log("⚙️  Step 2/3 — Generating TypeScript types...");
run(
  `pnpx storyblok types generate --space ${SPACE_ID} --type-suffix Blok --filename storyblok.type`,
);

// 3. Move files to src/types
console.log("📁 Step 3/3 — Moving types to src/types...");

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!existsSync(OUTPUT_STORYBLOK_DIR)) {
  mkdirSync(OUTPUT_STORYBLOK_DIR, { recursive: true });
  console.log(`   Created directory: src/types/storyblok`);
}

moveFile(GENERATED_SPACE_FILE, OUTPUT_SPACE_FILE, `${FILENAME}.d.ts`);
moveFile(GENERATED_GLOBAL_FILE, OUTPUT_GLOBAL_FILE, "storyblok.d.ts");

console.log(`\n✅ Done! Types available at:`);
console.log(`   src/types/storyblok/${FILENAME}.d.ts`);
console.log(`   src/types/storyblok.d.ts`);
