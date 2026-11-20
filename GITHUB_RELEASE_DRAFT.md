# Черновик предварительного релиза: `v0.1.0-alpha` (`GITHUB_RELEASE_DRAFT.md`)

> **Статус:** Черновик описания релиза для будущей публикации на GitHub. Тег и GitHub Release **не создавались**.

---

## Release Title
`PushkinRhymeEngine 2.0 — v0.1.0-alpha (Stage C+: Book Layer & Source Validation Foundation)`

## Tag
`v0.1.0-alpha` *(предлагаемый пре-релизный тег после инициализации Git и добавления `LICENSE`)*

---

## Release Notes (Draft)

### Overview
**PushkinRhymeEngine `v0.1.0-alpha`** is the first pre-release alpha milestone on the path from a prompt-guided poetic generator to a verifiable, source-grounded Russian poetics engineering workspace.

### What Is Included in `v0.1.0-alpha`

#### 1. Interactive Web Application & CLI (`IMPLEMENTED`, `TESTED` offline)
- **React 19 + Vite 6 Web UI** (`App.tsx`, `EngineVisualizer.tsx`, `OutputParchment.tsx`) with classical parchment output.
- **Prompt-guided Gemini Service** (`services/geminiService.ts :: transformText`) using `@google/genai` (`gemini-3-pro-preview`, Structured JSON Outputs). *Note: live Gemini API calls remain `NOT_VERIFIED` in CI without a `GEMINI_API_KEY`.*
- **Visual & Narrative Reference Library V1** (`components/visual-library/*`, `visualLibraryService.ts`): 19 stylized visual anchors, 8 narrative patterns, 11 categories, and 3 modes (Visual Generation Brief, Lexical Poem Illustration, Narrative Inspiration). Strictly separated from historical textual sources.
- **Agent Interface & Skill** (`agent-interface/cli.ts`, `SKILL.md`): CLI commands `info`, `help`, `generate` (`4/4` offline CLI validation tests pass).

#### 2. Isolated Book Layer (`/book_layer`, `IMPLEMENTED`, `TESTED` on synthetic PDF)
- Adopted and hardened from `PushkinBookLayer 0.1` without modifying external frozen `BOOK-NAV Classic V6` contracts.
- Typed models (`SourceDocument`, `PageReference`, `BookNode`, `TextFragment`) tracking 1-indexed physical PDF pages separately from printed pagination and SHA-256 checksums.
- Portable manifest (`book_layer/data/boris_godunov_2008_manifest.json`) separating witnesses (`BG-MAIN-1831` scanned facsimile vs `BG-APP-I` early redaction vs `BG-APP-II` drafts vs commentary/index) with zero hardcoded host paths.
- Explicit `FAILED` extraction handling and strict blocking of `SCANNED_PAGE`, `FAILED`, and unapproved `PARTIAL` fragments in `pipeline.to_c1_input()`.

#### 3. Independent Source Validation (`/source_validation`, `IMPLEMENTED`, `TESTED`)
- Emits provenance-complete `SourceEvidencePackage` objects conforming to `SOURCE_EVIDENCE_PACKAGE_SCHEMA.json`.
- Separates **`semantic_analysis_allowed`** from **`prosodic_analysis_allowed`**, strictly blocking `SCANNED_PAGE`, `FAILED`, `PARTIAL`, `EDITORIAL_COMMENTARY`, `VERIFIED_PROSE_BLOCK`, and unclassified `PDF_TEXT_LINE_UNCLASSIFIED` lines from prosodic analysis.

### Verification Summary (`2026-11-20`)
- `npx tsc --noEmit`: **PASSED**
- `npm run build`: **PASSED**
- `python3 test_cli_agent_call.py`: **4/4 PASSED**
- Autonomous Stage C Python tests (`book_layer/tests/test_synthetic_book.py`, `source_validation/tests/test_source_validation.py`): **13/13 PASSED (`0 skipped`)**
- External Boris Godunov PDF test (`book_layer/tests/test_adapter.py`): **5 SKIPPED (`NOT_VERIFIED` — external PDF not bundled)**
- Live Gemini API generation: **`NOT_VERIFIED` (requires user `GEMINI_API_KEY`)**

### Known Limitations & Missing Capabilities (`PLANNED`)
- No deterministic Russian meter, stress, caesura, or rhyme analyzer yet (`C1`, `C6a/C6b`, `M8`, `C8` are `PLANNED` for Stages D–G).
- No automatic OCR for scanned historical facsimiles.
- Root `LICENSE` must be finalized by the repository owner prior to public release.
