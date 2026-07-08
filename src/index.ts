#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { listSchoolSlugs, loadAllSchools } from "./data.js";
import { COMPARE_OUTPUT_FORMAT } from "./compare.js";
import { registerAdmissionsPrompts } from "./prompts.js";
import { registerAdmissionsTools } from "./tools.js";

async function main(): Promise<void> {
  const schools = loadAllSchools();
  const slugs = listSchoolSlugs();

  if (schools.size === 0) {
    throw new Error("No school data found in data/*.json");
  }

  const server = new McpServer(
    {
      name: "college-admissions",
      version: "0.4.0",
    },
    {
      instructions: [
        "This hub provides verified admissions data for multiple colleges and universities.",
        `Available schools: ${slugs.join(", ")}.`,
        "When comparing 2+ schools, prefer compare_schools (include student_home_state when known).",
        COMPARE_OUTPUT_FORMAT,
        "Call list_schools when the user has not named specific institutions.",
        "Every per-school data tool requires a school slug parameter.",
        "MCP prompts compare-colleges and verify-school-data provide ready-made workflows.",
        "Data is verified Common Data Set (CDS) extraction with last_updated and academic_year on every section.",
        "If a tool returns not_available, that section has not been extracted yet — do not guess or fabricate values.",
        "For admissions timing questions, call get_deadlines and get_application_policies together for each school.",
        "Explain ED vs EA vs rolling in plain language. Warn explicitly when Early Decision is binding.",
        "Always state academic_year and last_updated. If a date or field is null, say it is not in the published CDS data and direct the student to admissions_url — never invent dates.",
        "Deadline guidance is informational; students must confirm on the school's official site before submitting.",
      ].join(" "),
    },
  );

  registerAdmissionsTools(server, schools);
  registerAdmissionsPrompts(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to start MCP server: ${message}`);
  process.exit(1);
});
