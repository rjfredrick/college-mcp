import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { SchoolData, SchoolIdentity } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

export interface SchoolSummary {
  slug: string;
  name: string;
  state: string;
  control: SchoolIdentity["control"];
}

export function listSchoolSlugs(): string[] {
  return readdirSync(DATA_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort();
}

export function resolveSchoolSlug(value: string | undefined): string {
  const slug = value?.trim().toLowerCase();
  const available = listSchoolSlugs();

  if (!slug) {
    throw new Error(
      `school parameter is required. Available schools: ${available.join(", ")}`,
    );
  }

  if (!available.includes(slug)) {
    throw new Error(
      `Unknown school "${slug}". Available schools: ${available.join(", ")}`,
    );
  }

  return slug;
}

export function loadSchoolData(slug: string): SchoolData {
  const filePath = join(DATA_DIR, `${slug}.json`);
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as SchoolData;
}

export function loadAllSchools(): Map<string, SchoolData> {
  const schools = new Map<string, SchoolData>();

  for (const slug of listSchoolSlugs()) {
    schools.set(slug, loadSchoolData(slug));
  }

  return schools;
}

export function listSchoolSummaries(): SchoolSummary[] {
  return listSchoolSlugs().map((slug) => {
    const { school } = loadSchoolData(slug);
    return {
      slug: school.slug,
      name: school.name,
      state: school.state,
      control: school.control,
    };
  });
}
