# CDS access tracker

Schools where the Common Data Set exists but we could not archive or fully extract it. Revisit when IR grants a public PDF/Excel link or shares a file.

| Slug | School | Academic year | Status | Blocker | Published at | Fallback in `data/{slug}.json` | Next step |
|---|---|---|---|---|---|---|---|
| `colorado-mountain` | Colorado Mountain College | 2024-2025 | blocked | SharePoint Excel requires Microsoft auth; no public PDF mirror found | [IR CDS page](https://coloradomtn.edu/contact-departments/institutional-research/common-data-set/) | NCES College Navigator (IPEDS `126711`) + CMC admissions/tuition pages | Ask CMC IR for a downloadable CDS archive, or save the Excel locally as `colorado-mountain-cds-2024-2025.xlsx` |

## Status values

- **available** — local CDS file in this folder; school JSON extracted from it
- **blocked** — CDS published but not downloadable without special access
- **partial** — some CDS sections extracted; gaps remain

## When access opens

1. Save the file here as `{slug}-cds-{year}.pdf` (or `.xlsx`)
2. Update `manifest.json` (`local_pdf`, `cds_access`, clear blocker notes)
3. Re-extract into `data/{slug}.json`
4. Move the row out of this table (or mark **available**)
