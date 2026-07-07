#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadSchoolData, resolveSchoolSlug } from "./data.js";
import { registerAdmissionsTools } from "./tools.js";

async function main(): Promise<void> {
  const slug = resolveSchoolSlug(process.env.SCHOOL);
  const data = loadSchoolData(slug);

  const server = new McpServer(
    {
      name: `${slug}-admissions`,
      version: "0.1.0",
    },
    {
      instructions: [
        `This server provides verified admissions data for ${data.school.name}.`,
        "Data is sourced from the Common Data Set (CDS) and includes last_updated, source, and academic_year on every section.",
        "If a tool returns not_available, that section has not been extracted yet — do not guess or fabricate values.",
        "Use get_school_info first to confirm you are querying the correct institution.",
      ].join(" "),
    },
  );

  registerAdmissionsTools(server, data);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to start MCP server: ${message}`);
  process.exit(1);
});
