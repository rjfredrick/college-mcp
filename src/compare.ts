import type { SchoolData, ToolSection } from "./schema.js";

const COMPARISON_SECTIONS: ToolSection[] = [
  "admission_stats",
  "test_scores",
  "gpa_profile",
  "deadlines",
  "application_policies",
  "cost_of_attendance",
  "financial_aid_profile",
  "enrollment_profile",
  "academic_programs",
];

export interface SchoolComparisonEntry {
  slug: string;
  name: string;
  state: string;
  control: string;
  sections: {
    admission_stats?: NonNullable<SchoolData["admission_stats"]>;
    test_scores?: NonNullable<SchoolData["test_scores"]>;
    gpa_profile?: NonNullable<SchoolData["gpa_profile"]>;
    deadlines?: NonNullable<SchoolData["deadlines"]>;
    application_policies?: NonNullable<SchoolData["application_policies"]>;
    cost_of_attendance?: NonNullable<SchoolData["cost_of_attendance"]>;
    financial_aid_profile?: NonNullable<SchoolData["financial_aid_profile"]>;
    enrollment_profile?: NonNullable<SchoolData["enrollment_profile"]>;
    academic_programs?: NonNullable<SchoolData["academic_programs"]>;
  };
  unavailable_sections: ToolSection[];
}

export interface CompareOptions {
  student_home_state?: string;
}

export interface CompareDashboardMetrics {
  acceptance_rate: number | null;
  sat_composite_min: number | null;
  sat_composite_max: number | null;
  average_gpa: number | null;
  percent_in_top_tenth: number | null;
  student_faculty_ratio: string | null;
  residency_for_student: string;
  cost_for_student: number | null;
  cost_label: string;
  debt_at_graduation: number | null;
  application_fee: number | null;
  fee_waiver_available: boolean | null;
  deadlines_summary: string;
}

export interface CompareVerification {
  last_updated: string;
  academic_year: string;
  provider: "college-admissions";
}

export interface CompareDashboardSchool {
  slug: string;
  name: string;
  label: string;
  state: string;
  control: string;
  metrics: CompareDashboardMetrics;
  programs: string[];
  verification: CompareVerification | null;
}

export interface CompareDashboard {
  schema_version: "1";
  compared_at: string;
  student: {
    home_state?: string;
  };
  schools: CompareDashboardSchool[];
}

/** Guidance for assistants after compare_schools — data is structured, presentation is model-side. */
export const COMPARE_OUTPUT_FORMAT = [
  "compare_schools returns structured tabular comparison data: schools[] with metrics objects and verification (last_updated, academic_year).",
  "Render the stats as a markdown table (schools = columns, metrics = rows) before interpreting.",
  "Cite verification dates and academic_year per school; do not link to or cite underlying CDS PDF URLs.",
  "If the user shared GPA, SAT, or interests, add a second markdown table for fit, cost, deadline risk, and tradeoffs — not prose paragraphs.",
  "Do not restate every number from the stats table in prose.",
].join(" ");

export function buildSchoolComparison(
  schools: Map<string, SchoolData>,
  slugs: string[],
  options: CompareOptions = {},
): CompareDashboard {
  const entries: SchoolComparisonEntry[] = [];

  for (const slug of slugs) {
    const data = schools.get(slug);
    if (!data) {
      continue;
    }

    const sections: SchoolComparisonEntry["sections"] = {};
    const unavailable: ToolSection[] = [];

    for (const section of COMPARISON_SECTIONS) {
      const value = data[section];
      if (value === null) {
        unavailable.push(section);
      } else {
        sections[section] = value as never;
      }
    }

    entries.push({
      slug: data.school.slug,
      name: data.school.name,
      state: data.school.state,
      control: data.school.control,
      sections,
      unavailable_sections: unavailable,
    });
  }

  return buildDashboardJson(entries, options, new Date().toISOString());
}

function buildDashboardJson(
  entries: SchoolComparisonEntry[],
  options: CompareOptions,
  compared_at: string,
): CompareDashboard {
  const homeState = options.student_home_state?.trim().toUpperCase();

  return {
    schema_version: "1",
    compared_at,
    student: homeState ? { home_state: homeState } : {},
    schools: entries.map((entry) => {
      const stats = entry.sections.admission_stats;
      const scores = entry.sections.test_scores;
      const gpa = entry.sections.gpa_profile;
      const cost = computeCostForStudent(entry, homeState);
      const programs =
        entry.sections.academic_programs?.programs?.map((p) => p.name) ?? [];

      return {
        slug: entry.slug,
        name: entry.name,
        label: columnLabel(entry),
        state: entry.state,
        control: entry.control,
        metrics: {
          acceptance_rate: stats?.acceptance_rate ?? null,
          sat_composite_min: scores?.sat_composite?.min ?? null,
          sat_composite_max: scores?.sat_composite?.max ?? null,
          average_gpa: gpa?.average_gpa ?? null,
          percent_in_top_tenth: gpa?.percent_in_top_tenth ?? null,
          student_faculty_ratio:
            entry.sections.enrollment_profile?.student_faculty_ratio ?? null,
          residency_for_student: formatResidency(entry, homeState),
          cost_for_student: cost.amount,
          cost_label: cost.label,
          debt_at_graduation:
            entry.sections.financial_aid_profile?.average_debt_at_graduation ??
            null,
          application_fee:
            entry.sections.application_policies?.application_fee ?? null,
          fee_waiver_available:
            entry.sections.application_policies?.fee_waiver_available ?? null,
          deadlines_summary: formatDeadlinesSummary(entry),
        },
        programs,
        verification: stats
          ? {
              last_updated: stats.last_updated,
              academic_year: stats.academic_year,
              provider: "college-admissions" as const,
            }
          : null,
      };
    }),
  };
}

function computeCostForStudent(
  entry: SchoolComparisonEntry,
  homeState?: string,
): { amount: number | null; label: string } {
  const cost = entry.sections.cost_of_attendance;
  if (!cost) {
    return { amount: null, label: "n/a" };
  }

  const inState =
    homeState != null && homeState === entry.state.toUpperCase();

  if (cost.tuition.type === "flat" && cost.total_cost_of_attendance != null) {
    return {
      amount: cost.total_cost_of_attendance,
      label: "flat rate",
    };
  }

  if (cost.tuition.type === "residency_based") {
    if (inState && cost.total_cost_of_attendance != null) {
      return {
        amount: cost.total_cost_of_attendance,
        label: "in-state",
      };
    }

    const tuition = cost.tuition.out_of_state ?? 0;
    const fees = cost.required_fees ?? 0;
    const room = cost.room_and_board ?? 0;
    const books = cost.books_and_supplies ?? 0;
    const total = tuition + fees + room + books;

    if (total > 0) {
      return { amount: total, label: "out-of-state" };
    }
  }

  if (cost.total_cost_of_attendance != null) {
    return {
      amount: cost.total_cost_of_attendance,
      label: inState ? "in-state" : "total",
    };
  }

  return { amount: null, label: "n/a" };
}

function columnLabel(entry: SchoolComparisonEntry): string {
  const control =
    entry.control === "private_nonprofit" ? "private" : "public";
  return `${shortSchoolName(entry.name)} (${entry.state}, ${control})`;
}

function shortSchoolName(name: string): string {
  return name
    .replace(/ University$/, "")
    .replace(/ College$/, "")
    .trim();
}

function formatResidency(
  entry: SchoolComparisonEntry,
  homeState?: string,
): string {
  if (entry.control === "private_nonprofit") {
    return "Out-of-state (private, flat rate)";
  }
  if (homeState && homeState === entry.state.toUpperCase()) {
    return "In-state";
  }
  if (homeState) {
    return "Out-of-state";
  }
  const cost = entry.sections.cost_of_attendance;
  if (cost?.tuition.type === "residency_based") {
    return "In-state or out-of-state (public)";
  }
  return "n/a";
}

function formatDeadlinesSummary(entry: SchoolComparisonEntry): string {
  const deadlines = entry.sections.deadlines;
  const policies = entry.sections.application_policies;
  if (!deadlines?.plans.length) {
    return "n/a";
  }

  const parts: string[] = [];

  for (const plan of deadlines.plans) {
    if (plan.type === "early_decision") {
      const binding = plan.binding ? " (binding)" : "";
      const deadline = plan.application_deadline ?? "n/a";
      const notify = plan.notification_date
        ? `, notify ${plan.notification_date}`
        : "";
      parts.push(`ED ${deadline}${binding}${notify}`);
    } else if (plan.type === "early_action") {
      const deadline = plan.application_deadline ?? "no fixed date";
      const notify = plan.notification_date
        ? `, notify ${plan.notification_date}`
        : "";
      parts.push(`EA ${deadline}${notify}`);
    } else if (plan.rolling) {
      parts.push("RD rolling");
    } else if (plan.application_deadline) {
      parts.push(`RD ${plan.application_deadline}`);
    }
  }

  if (policies?.policy_notes?.length) {
    const note = policies.policy_notes.find(
      (n) =>
        n.toLowerCase().includes("priority") ||
        n.toLowerCase().includes("merit"),
    );
    if (note) {
      parts.push(note.replace(/\.$/, ""));
    }
  }

  return parts.length > 0 ? parts.join("; ") : "n/a";
}
