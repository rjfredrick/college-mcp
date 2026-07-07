import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { SchoolData, ToolSection } from "./schema.js";

type ToolResponse = Record<string, unknown> | null;

function sectionOrNull<T extends ToolResponse>(
  data: SchoolData,
  section: ToolSection,
): T {
  return data[section] as T;
}

function formatResult(payload: ToolResponse): {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
} {
  if (payload === null) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: "not_available",
              message:
                "This data section has not been extracted yet for this school.",
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
  };
}

export function registerAdmissionsTools(
  server: McpServer,
  data: SchoolData,
): void {
  server.registerTool(
    "get_school_info",
    {
      description:
        "Get basic identifying information about this institution (name, location, control type, website).",
      inputSchema: {},
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(data.school, null, 2) }],
    }),
  );

  server.registerTool(
    "get_admission_stats",
    {
      description:
        "Get admission statistics: acceptance rate, applicants, admitted, enrolled, and yield.",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "admission_stats")),
  );

  server.registerTool(
    "get_test_scores",
    {
      description:
        "Get SAT/ACT middle-50 score ranges and test submission rates.",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "test_scores")),
  );

  server.registerTool(
    "get_gpa_profile",
    {
      description:
        "Get GPA profile: average GPA and class rank distribution.",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "gpa_profile")),
  );

  server.registerTool(
    "get_deadlines",
    {
      description:
        "Get application and notification dates by plan (ED, EA, RD, rolling). Use for 'when is the deadline?' and 'when will I hear back?'",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "deadlines")),
  );

  server.registerTool(
    "get_application_policies",
    {
      description:
        "Get application process rules: fees, reply policy, housing deposit, binding ED, rolling behavior, and official apply URL. Use for 'what are the rules?' and 'what happens after I'm admitted?'",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "application_policies")),
  );

  server.registerTool(
    "get_cost_of_attendance",
    {
      description:
        "Get cost of attendance: tuition, fees, room/board (in-state/out-of-state where applicable).",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "cost_of_attendance")),
  );

  server.registerTool(
    "get_financial_aid_profile",
    {
      description:
        "Get financial aid profile: average package, percent need met, average debt at graduation.",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "financial_aid_profile")),
  );

  server.registerTool(
    "get_enrollment_profile",
    {
      description:
        "Get enrollment profile: total enrollment, undergrad/grad split, student:faculty ratio.",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "enrollment_profile")),
  );

  server.registerTool(
    "get_academic_programs",
    {
      description: "Get degrees offered and program-level data.",
      inputSchema: {},
    },
    async () => formatResult(sectionOrNull(data, "academic_programs")),
  );
}
