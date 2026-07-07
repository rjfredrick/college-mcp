import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { SchoolData } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

export const SUPPORTED_SCHOOLS = ["baylor", "colorado-mesa"] as const;
export type SchoolSlug = (typeof SUPPORTED_SCHOOLS)[number];

export function resolveSchoolSlug(value: string | undefined): SchoolSlug {
  const slug = value?.trim().toLowerCase();

  if (!slug) {
    throw new Error(
      `SCHOOL environment variable is required. Supported values: ${SUPPORTED_SCHOOLS.join(", ")}`,
    );
  }

  if (!SUPPORTED_SCHOOLS.includes(slug as SchoolSlug)) {
    throw new Error(
      `Unknown school "${slug}". Supported values: ${SUPPORTED_SCHOOLS.join(", ")}`,
    );
  }

  return slug as SchoolSlug;
}

export function loadSchoolData(slug: SchoolSlug): SchoolData {
  const filePath = join(DATA_DIR, `${slug}.json`);
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as SchoolData;
}
