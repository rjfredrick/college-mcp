# College Admissions MCP Server

Verified college admissions data exposed via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). One hub serves multiple schools — students and counselors query official Common Data Set (CDS) stats through Claude, Cursor, or any MCP-compatible assistant.

## Quick start

```bash
pnpm install
pnpm build   # required for Claude Desktop; optional for Cursor (uses pnpm dev)
```

### Cursor

Open this repo in Cursor. `.cursor/mcp.json` is preconfigured — enable **college-admissions** in **Customize**.

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Restart Claude Desktop after connecting.

## Demo

See [docs/demo-prompts.md](docs/demo-prompts.md) for copy-paste prompts — a student comparing Baylor vs. Colorado Mesa, plus enrollment VP and source-citation scenarios.

**Fast demo:** Enable the connector, paste **Prompt 8** from the demo doc.

## Tools

| Tool | Description |
|---|---|
| `list_schools` | All available schools (slug, name, state, control) |
| `get_school_info` | Institution identity |
| `get_admission_stats` | Acceptance rate, applicants, yield |
| `get_test_scores` | SAT/ACT middle 50 |
| `get_gpa_profile` | GPA and class rank distribution |
| `get_deadlines` | ED/EA/RD deadlines and notification dates |
| `get_application_policies` | Fees, reply policy, apply URL |
| `get_cost_of_attendance` | Tuition, fees, room/board |
| `get_financial_aid_profile` | Aid packages, debt at graduation |
| `get_enrollment_profile` | Enrollment, student:faculty ratio |
| `get_academic_programs` | Degrees and programs offered |

Every data tool requires a `school` slug (e.g. `baylor`, `colorado-mesa`).

## Adding a school

1. Extract CDS data into `data/{slug}.json` following the schema in `src/schema.ts`
2. Restart the MCP server
3. The school appears in `list_schools` — no client config changes

## Development

```bash
pnpm dev      # run hub via tsx (Cursor uses this)
pnpm build    # compile to dist/
pnpm start    # run compiled server
```

## Data

School JSON files live in `data/`. Source CDS PDFs are in `data/sources/`. Each section includes `last_updated`, `source`, and `academic_year`.

## Business plan

See [docs/mcp-admissions-plan.md](docs/mcp-admissions-plan.md).
