import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { listSchoolSlugs } from "./data.js";
import { COMPARE_OUTPUT_FORMAT } from "./compare.js";

const DEFAULT_COMPARE_SCHOOLS = "baylor,colorado-mesa,odu";

export function registerAdmissionsPrompts(server: McpServer): void {
  const available = listSchoolSlugs().join(", ");

  server.registerPrompt(
    "compare-colleges",
    {
      title: "Compare Colleges (Student)",
      description:
        "Compare multiple colleges using verified CDS data — fit, cost, debt, deadlines, and tradeoffs.",
      argsSchema: {
        home_state: z
          .string()
          .optional()
          .describe("Student home state abbreviation, e.g. CO"),
        gpa: z.string().optional().describe("Student GPA, e.g. 3.6"),
        sat: z.string().optional().describe("Student SAT composite, e.g. 1180"),
        interests: z
          .string()
          .optional()
          .describe("Intended majors or interests, e.g. nursing, business"),
        schools: z
          .string()
          .optional()
          .describe(
            `Comma-separated school slugs. Available: ${available}. Default: ${DEFAULT_COMPARE_SCHOOLS}`,
          ),
      },
    },
    ({ home_state, gpa, sat, interests, schools }) => {
      const schoolList = schools?.trim() || DEFAULT_COMPARE_SCHOOLS;
      const profile = [
        home_state && `I'm from ${home_state}.`,
        gpa && `I have about a ${gpa} GPA.`,
        sat && `I have a ${sat} SAT.`,
        interests && `I'm interested in ${interests}.`,
      ]
        .filter(Boolean)
        .join(" ");

      const compareCall = home_state
        ? `Call compare_schools with schools=[${schoolList.split(",").map((s) => `"${s.trim()}"`).join(", ")}] and student_home_state "${home_state}".`
        : `Call compare_schools with schools=[${schoolList.split(",").map((s) => `"${s.trim()}"`).join(", ")}].`;

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                profile ||
                  "I'm a high school senior comparing colleges.",
                `I'm trying to decide between: ${schoolList.replace(/,/g, ", ")}.`,
                compareCall,
                "Render compare_schools results as markdown tables — stats first, then interpretation if I shared my profile.",
                COMPARE_OUTPUT_FORMAT,
              ].join("\n\n"),
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "verify-school-data",
    {
      title: "Verify School Data (Enrollment VP)",
      description:
        "Show what verified CDS data provides vs generic AI answers for a single school.",
      argsSchema: {
        school: z
          .string()
          .describe(`School slug. Available: ${available}`),
      },
    },
    ({ school }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              "I'm an enrollment marketing leader.",
              `A prospective student just asked an AI assistant about ${school} — acceptance rate, average debt at graduation, and application deadlines — without using verified data.`,
              "Explain what could go wrong with generic AI answers vs verified CDS data.",
              `Then pull the real numbers for ${school} using college-admissions tools.`,
              "Cite academic_year and last_updated from verification on every statistic.",
            ].join("\n\n"),
          },
        },
      ],
    }),
  );
}
