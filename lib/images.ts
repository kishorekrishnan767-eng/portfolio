import { existsSync } from "node:fs";
import path from "node:path";

/*
 * Optional artwork. Drop a file named after its slot into public/images/
 * (e.g. public/images/hero-abyss.jpg) and it appears on the next build.
 * Prompts for each slot live in IMAGE-PROMPTS.md. Server-only (runs at build time).
 */

export const ART_SLOTS = [
  "hero-abyss",
  "curiosity-pcb",
  "project-sparksense",
  "project-women-safety-band",
  "project-green-atm",
  "now-board",
  "connect-globe",
] as const;

export type ArtSlot = (typeof ART_SLOTS)[number];
export type ArtMap = Record<ArtSlot, string | null>;

const EXTENSIONS = ["webp", "avif", "jpg", "jpeg", "png"];

function find(slot: ArtSlot): string | null {
  for (const ext of EXTENSIONS) {
    if (existsSync(path.join(process.cwd(), "public", "images", `${slot}.${ext}`))) return `/images/${slot}.${ext}`;
  }
  return null;
}

export function findArt(): ArtMap {
  return Object.fromEntries(ART_SLOTS.map((s) => [s, find(s)])) as ArtMap;
}
