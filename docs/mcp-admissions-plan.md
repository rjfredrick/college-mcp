# MCP Admissions Data — Business Plan

## The Idea

Host standardized MCP servers for colleges and universities that expose admissions, cost, and financial aid data in a queryable, structured format. Schools subscribe to maintain their own verified data layer, which surfaces accurately inside any AI assistant that supports MCP — Claude, ChatGPT, Cowork, and whatever comes next. Bring your own assistant — no proprietary chatbot, no app, no version lock-in.

---

## The Problem

Admissions data is public but fragmented. Every school publishes their own Common Data Set (CDS) PDF on their own IR website, in their own format, with inconsistent structure and variable PDF quality. AI assistants querying this data either hallucinate, surface stale third-party aggregations (Niche, College Board), or return nothing useful. Schools have no verified, authoritative presence in AI-driven college research — yet.

---

## The Opportunity

- ~2,700 four-year degree-granting institutions in the US
- AI visibility is becoming what SEO was for search — enrollment offices already feel this pain
- MCP is an open protocol with growing support across all major AI platforms
- No one owns this space yet

---

## Data Sources

### Common Data Set (CDS)
- Published annually by most schools on their own `.edu` IR pages
- Voluntary but widely adopted — covers admissions, costs, aid, enrollment, faculty, outcomes
- Rich, structured, admissions-marketing-oriented
- Inconsistent PDF formatting and hosting location per school
- Notable non-publishers: USC, WashU, Boston College, Tulane, Penn

### IPEDS (Integrated Postsecondary Education Data System)
- Mandatory for all Title IV institutions (federal financial aid eligibility)
- Universal coverage — no school can opt out
- Less rich than CDS but reliable fallback
- Available via federal API/data portal
- Use as: fallback for schools that skip CDS, and cross-validation layer against CDS numbers

### Data Strategy
CDS-first → IPEDS fallback → school-direct for verified/updated data once contracted

---

## Extraction Pipeline

Leverage existing day-job expertise in document-to-JSON extraction via AI agent:

1. **Ingest** — fetch CDS PDF from school's IR page (or IPEDS API for fallback)
2. **Extract** — AI agent parses PDF (handling merged cells, OCR artifacts, layout variance)
3. **Normalize** — map to canonical JSON schema (public/private tuition split, null handling, etc.)
4. **Validate** — confidence scoring, human-in-the-loop review for low-confidence fields
5. **Version** — store with `last_updated`, `source_url`, `academic_year` fields
6. **Serve** — expose via standardized MCP server tools

This pipeline is the core defensible asset alongside school relationships.

---

## MCP Server Schema (Draft)

Each school's MCP server exposes a standard set of tools:

```
get_admission_stats        → acceptance rate, applicants, enrolled, yield
get_test_scores            → SAT/ACT middle-50 ranges
get_gpa_profile            → avg GPA, class rank distribution
get_deadlines              → EA/ED/RD deadlines and notification dates
get_cost_of_attendance     → tuition, fees, room/board (in-state/out-of-state where applicable)
get_financial_aid_profile  → avg package, % need met, avg debt at graduation
get_enrollment_profile     → total enrollment, undergrad/grad split, student:faculty ratio
get_academic_programs      → degrees offered, program-level data
```

Schema normalizes key variance points:
- `tuition: { type: "flat" | "residency_based", in_state?, out_of_state?, flat? }`
- `last_updated`, `source`, `academic_year` on every response
- Null/omitted fields rather than fabricated values

---

## The Pitch to Schools

**Not:** "Buy our MCP server"

**Yes:** "When a student asks Claude or ChatGPT about your school's acceptance rate, aid packages, or deadlines — does your school show up with accurate, current, verified data, or does the AI guess from a 2019 Niche listing? We fix that."

Target buyer: **VP of Enrollment Management** or **Director of Admissions Marketing** — not IT, not IR (though IR is a validation ally). This is an enrollment-marketing budget, not a tech budget.

---

## Go-To-Market

### Phase 1 — Build Before You Pitch (Month 1–2)
- Extract and build live MCP servers for 2–3 schools using public CDS data (Baylor, ODU already extracted)
- Validate schema and extraction pipeline against real data
- Test live demo with wife (high school college counselor) — does it hold up under a real counselor's workflow with a real student?
- Refine schema based on feedback

### Phase 2 — Pilot School Acquisition (Month 2–6)
- Target profile: mid-size, tuition-dependent, enrollment-anxious, regional private or competitive public universities
- Avoid: Ivy-adjacent schools (don't feel the pain), community colleges (open admission, less relevant), CDS non-publishers as first targets
- Warm path in: wife's relationships with admissions reps, NACAC and regional counselor conferences, LinkedIn intros
- Pitch: "Here's your school, already live — take a look"
- Goal: 3–5 pilot schools, likely discounted or free, in exchange for feedback and a case study

### Phase 3 — Convert and Expand (Month 6–18)
- Pilots convert to paid subscriptions
- Use case studies to expand via referrals within conference/association networks
- Introduce annual data refresh as part of subscription value
- Target 25–50 paying schools by end of Year 1 / start of Year 2

---

## Competitive Advantage

| Factor | Traditional Chatbot/Widget Vendors | This Product |
|---|---|---|
| Buyer pitch | "Buy our AI chatbot" | "Be visible in every AI assistant" |
| Platform lock-in | Yes — one vendor, one UX | None — works with any MCP-compatible assistant |
| Version maintenance | Ongoing releases, platform API chasing | Update once, all clients benefit instantly |
| Data ownership | Vendor controls it | School is the authoritative source |
| Moat | Feature set | School relationships + extraction pipeline + schema standard |

---

## Revenue Model

Annual SaaS subscription per school. Target pricing: **$8k–$15k/year** depending on school size and tier.

| Year | Schools | ARR |
|---|---|---|
| Year 1 | 3–8 pilots (discounted/free) + early paying | $20k–$75k |
| Year 2 | 25–50 paying schools | $250k–$600k |
| Year 3 | 100–200 schools | $1M–$2.5M |

**Bottleneck:** University procurement is slow — annual budget cycles, committee decisions, 6–12 month sales cycles. Plan cash/runway accordingly. Year 1 is pipeline, not revenue.

---

## Expansion Path (Year 3+)

- **Beyond admissions** — course catalogs, career outcomes, campus life data; more tools per school = higher ACV, multi-office buyer
- **International markets** — UK, Canada, Australia; less standardized data = more moat for whoever solves extraction first
- **Platform licensing** — as agent platforms (OpenAI, Google, Anthropic) mature their tool ecosystems, charge for verified higher-ed data access at the platform level, not just per school
- **K-12 counselor tools** — downstream products built on the verified data layer (your wife's world)

---

## Key Risks

- **Sales cycle length** — university procurement is genuinely slow; manage cash accordingly
- **Data freshness liability** — stale deadline = real student harmed; versioning + school-verified refresh flow is non-negotiable
- **Schema fragmentation** — resist the urge to customize per school; hold the standard
- **IP check** — confirm day-job employer has no claim over doc-to-schema extraction techniques before going further

---

## Immediate Next Steps

- [ ] Build live MCP demo server for Baylor using extracted CDS data
- [ ] Build live MCP demo server for ODU
- [ ] Get wife to pressure-test demo with a real student scenario
- [ ] Draft one-pager pitch for enrollment VPs
- [ ] Identify 10 target pilot schools by selectivity/size/enrollment-anxiety profile
- [ ] Check IPEDS API access and data structure
- [ ] IP gut-check with a lawyer if needed
