# Demo Prompts — Student Choosing Between Schools

Copy and paste these into Claude or Cursor with the **college-admissions** connector enabled. Read them as Jordan, a high school senior from Denver with a 3.6 GPA and an 1180 SAT, trying to choose between Baylor, Colorado Mesa, and Old Dominion University (ODU).

## Setup

**Cursor:** Open this repo — `.cursor/mcp.json` configures the hub automatically via `pnpm dev`. Enable **college-admissions** in Customize.

**Claude Desktop:** Run `pnpm build`, then add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "college-admissions": {
      "command": "node",
      "args": ["/absolute/path/to/college-mcp-server/dist/index.js"]
    }
  }
}
```

Replace the path with your local clone.

## MCP prompts (one-click)

The server exposes built-in prompts — use these instead of copy-paste when your client supports MCP prompts:

| Prompt | Use for |
|---|---|
| **compare-colleges** | Student comparison (defaults to baylor, colorado-mesa, odu) |
| **verify-school-data** | Enrollment VP demo for a single school |

Optional args for `compare-colleges`: `home_state`, `gpa`, `sat`, `interests`, `schools` (comma-separated slugs).

## Fast demo (one tool call)

Enable the connector and ask:

> Use compare_schools for baylor, colorado-mesa, and odu with student_home_state CO. I'm a Colorado senior with a 3.6 GPA and 1180 SAT. Render the stats as a markdown table, then a second table for fit and tradeoffs — no prose paragraphs.

Or run the **compare-colleges** MCP prompt with `home_state: CO`.

---

## Enrollment VP demo

Use this when pitching enrollment or admissions marketing staff — not the student scenario.

> I'm the Director of Admissions Marketing at a mid-size private university. A prospective student just asked Claude about our acceptance rate, average debt at graduation, and Early Decision deadlines — but they didn't use our verified data connector. Walk me through what could go wrong with generic AI answers versus what verified CDS data provides. Then pull the real numbers for Baylor University as an example of what "verified presence" looks like, citing academic_year and last_updated.

---

## Sources demo

Use this to highlight verified data vs. aggregators — every number should show `last_updated` and `academic_year`.

> Compare Baylor University and Colorado Mesa University on acceptance rate and average debt at graduation. For each statistic, cite the academic_year and last_updated from the verified data. Do not use Niche, College Board, or other third-party sites.

---

## Who you are (optional context to paste first)

> I'm a high school senior from Denver, Colorado. I have about a 3.6 GPA and an 1180 SAT. I'm interested in nursing or business. I applied to Baylor University and Colorado Mesa University and I'm trying to decide between them. My parents are pretty cost-conscious. Please use official school data when you answer — don't guess from random websites.

---

## Prompt 1 — Am I competitive?

> Am I in the ballpark academically for both Baylor and Colorado Mesa with my 3.6 GPA and 1180 SAT?

---

## Prompt 2 — How hard is it to get in?

> How hard is it actually to get into each school? Compare acceptance rates and how big the freshman classes are.

---

## Prompt 3 — What will it cost?

> I'm a Colorado resident. What would tuition, fees, and living on campus cost at each school? Which one is way more expensive for my family?

---

## Prompt 4 — What about debt?

> I'm worried about student loans. What's the average debt at graduation at each school, and what kind of financial aid packages do students typically get? We don't know our exact EFC yet.

---

## Prompt 5 — Application deadlines and rules

> What do I need to know about applying — deadlines, application fees, Early Decision vs Early Action, and what happens after I get in? Walk me through both schools.

---

## Prompt 6 — Campus vibe

> Which school has more students from out of state? And what's the student-to-faculty ratio — will I mostly be in huge classes or not?

---

## Prompt 7 — Help me decide

> Baylor feels like my dream school but Colorado Mesa is close to home and probably a lot cheaper. Based on the real data for both schools, help me think through the decision. What else would you need to know about me before you'd lean one way or the other?

---

## Prompt 8 — Everything at once (short demo)

> I'm a Colorado senior with a 3.6 GPA and 1180 SAT choosing between Baylor and Colorado Mesa. Compare my academic fit, how selective each school is, what it costs to live on campus (I'm in-state for CMU), average debt at graduation, application deadlines and rules, and student-faculty ratio. Then help me think through the tradeoffs — don't just tell me to pick the cheaper one.
