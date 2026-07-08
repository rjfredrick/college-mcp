import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { listSchoolSummaries, resolveSchoolSlug } from "./data.js";
import { buildSchoolComparison } from "./compare.js";
import type { SchoolData, ToolSection } from "./schema.js";

type ToolResponse = Record<string, unknown> | null;

const schoolInputSchema = {
  school: z
    .string()
    .describe(
      "School slug from list_schools (e.g. baylor, colorado-mesa)",
    ),
};

const readOnlyToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

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

function formatError(message: string): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ error: "invalid_request", message }, null, 2),
      },
    ],
    isError: true,
  };
}

function getSchoolData(
  schools: Map<string, SchoolData>,
  school: string,
): SchoolData | { error: string } {
  try {
    const slug = resolveSchoolSlug(school);
    return schools.get(slug)!;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

export function registerAdmissionsTools(
  server: McpServer,
  schools: Map<string, SchoolData>,
): void {
  server.registerTool(
    "list_schools",
    {
      description:
        "List all schools available in this admissions hub with slug, name, state, and control type. Call this first when comparing schools or when the user has not named a specific institution.",
      inputSchema: {},
      annotations: readOnlyToolAnnotations,
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({ schools: listSchoolSummaries() }, null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    "compare_schools",
    {
      description:
        "Compare 2–5 schools side-by-side. Returns a ready-to-show comparison report (markdown table) plus dashboard_json for structured follow-ups.",
      inputSchema: {
        schools: z
          .array(z.string())
          .min(2)
          .max(5)
          .describe(
            "School slugs to compare (e.g. [\"baylor\", \"colorado-mesa\", \"odu\"])",
          ),
        student_home_state: z
          .string()
          .optional()
          .describe(
            "Student home state abbreviation for residency and cost columns, e.g. CO",
          ),
      },
      annotations: readOnlyToolAnnotations,
    },
    async ({ schools: schoolSlugs, student_home_state }) => {
      const resolved: string[] = [];
      const errors: string[] = [];

      for (const school of schoolSlugs) {
        try {
          resolved.push(resolveSchoolSlug(school));
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          errors.push(message);
        }
      }

      if (resolved.length < 2) {
        return formatError(
          errors.length > 0
            ? errors.join("; ")
            : "At least two valid school slugs are required.",
        );
      }

      const comparison = buildSchoolComparison(schools, resolved, {
        student_home_state,
      });

      const content: Array<{ type: "text"; text: string }> = [];

      if (errors.length > 0) {
        content.push({
          type: "text",
          text: `Warnings: ${errors.join("; ")}`,
        });
      }

      content.push({
        type: "text",
        text: comparison.comparison_report,
      });

      content.push({
        type: "text",
        text: JSON.stringify(comparison.dashboard_json, null, 2),
      });

      return { content };
    },
  );

  server.registerTool(
    "get_school_info",
    {
      description:
        "Get basic identifying information about an institution (name, location, control type, website).",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return {
        content: [{ type: "text", text: JSON.stringify(data.school, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_admission_stats",
    {
      description:
        "Get admission statistics: acceptance rate, applicants, admitted, enrolled, and yield.",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "admission_stats"));
    },
  );

  server.registerTool(
    "get_test_scores",
    {
      description:
        "Get SAT/ACT middle-50 score ranges and test submission rates.",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "test_scores"));
    },
  );

  server.registerTool(
    "get_gpa_profile",
    {
      description:
        "Get GPA profile: average GPA and class rank distribution.",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "gpa_profile"));
    },
  );

  server.registerTool(
    "get_deadlines",
    {
      description:
        "Get application and notification dates by plan (ED, EA, RD, rolling). Use for 'when is the deadline?' and 'when will I hear back?'",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "deadlines"));
    },
  );

  server.registerTool(
    "get_application_policies",
    {
      description:
        "Get application process rules: fees, reply policy, housing deposit, binding ED, rolling behavior, and official apply URL. Use for 'what are the rules?' and 'what happens after I'm admitted?'",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "application_policies"));
    },
  );

  server.registerTool(
    "get_cost_of_attendance",
    {
      description:
        "Get cost of attendance: tuition, fees, room/board (in-state/out-of-state where applicable).",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "cost_of_attendance"));
    },
  );

  server.registerTool(
    "get_financial_aid_profile",
    {
      description:
        "Get financial aid profile: average package, percent need met, average debt at graduation.",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "financial_aid_profile"));
    },
  );

  server.registerTool(
    "get_enrollment_profile",
    {
      description:
        "Get enrollment profile: total enrollment, undergrad/grad split, student:faculty ratio.",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "enrollment_profile"));
    },
  );

  server.registerTool(
    "get_academic_programs",
    {
      description: "Get degrees offered and program-level data.",
      inputSchema: schoolInputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async ({ school }) => {
      const data = getSchoolData(schools, school);
      if ("error" in data) {
        return formatError(data.error);
      }
      return formatResult(sectionOrNull(data, "academic_programs"));
    },
  );
}
