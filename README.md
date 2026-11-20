# PushkinRhymeEngine 2.0 (`v0.1.0-alpha`)

> **Open Pre-Release Alpha (`Stage C+`):** PushkinRhymeEngine 2.0 is an **open educational and creative poetic engine** designed to help humans and AI agents express meaningful ideas, scientific concepts, and literary thoughts in rhythmically organized Russian verse.  
> **Honesty Boundary:** Currently (`v0.1.0-alpha`), verse generation relies on prompt-guided Gemini calls (`transformText()`, live API `NOT_VERIFIED` in this offline audit environment), alongside an Agent CLI, a metadata-backed Visual & Narrative Library, and an isolated Python textual source-validation layer (`/book_layer` + `/source_validation`). Deterministic Russian prosody, stress, meter, and semantic-factual verification engines (`C1`–`C8`, `M8`) are **`PLANNED`** and not yet implemented.

---

## 1. Mission & Educational Positioning

PushkinRhymeEngine 2.0 is **not** limited to pastiche imitation of a single poet. It is being built as an **open educational and creative tool** for turning structured knowledge and human ideas into memorable, rhythmic, figurative speech.

Within this mission, **Alexander Pushkin's poetics serves as an essential research foundation** — helping study how meaning is compressed into meter, rhyme, cadence, and imagery — while opening practical workflows across:
- **Education:** explaining concepts in mathematics, physics, chemistry, biology, and history in memorable poetic form.
- **Creative Writing & Songwriting:** lyrics, festive greeting cards, philosophical miniatures, and literary experiments.
- **AI-Agent Tooling:** structured CLI and `SKILL.md` interfaces allowing external AI agents to invoke poetic transformation cleanly.
- **Source-Grounded Poetics Research:** strict separation between creative AI generation (`Visual Library` + LLM) and provenance-verified textual witnesses (`/book_layer` + `/source_validation`).

---

## 2. Core Principle: Accuracy First

> **`POETIC FORM MUST NOT OVERRIDE FACTUAL ACCURACY`**

When poetic transformation is applied to **educational, scientific, or technical texts** (mathematics, physics, chemistry, engineering):
1. **Preserve core facts:** definitions, formulas, physical laws, chemical equations, units, and cause-and-effect links must remain accurate.
2. **Mark simplifications explicitly:** if rhythm or rhyme requires metaphor or omission of edge conditions, that simplification must be disclosed rather than disguised as exact definition.
3. **Human review mandatory:** until deterministic semantic and factual validators exist (`PLANNED`), generated educational verse must be reviewed by an educator or subject-matter reader before classroom/study use.

---

## 3. Demonstrative Usage Examples

> **Verification Notice:** The 6 examples below are **illustrative demonstrations** (`Demonstrative / NOT live-verified by Gemini API` in this offline environment because `GEMINI_API_KEY` is not set). They show intended educational and creative input/output framing rather than recorded live API outputs.

### Example 1 — Mathematics Concept (Pythagorean Theorem)
- **Input:** *"In a right triangle, the square of the hypotenuse equals the sum of the squares of the two legs: $c^2 = a^2 + b^2$."*
- **Illustrative Output Concept:** Rhythmic quatrain preserving right-angle precondition (`90°`) and the exact identity $c^2 = a^2 + b^2$, paired with a moral/note clarifying Euclidean flat-plane scope.

### Example 2 — Physics Phenomenon (Conservation of Energy)
- **Input:** *"In an isolated system, total energy remains constant: kinetic energy and potential energy transform into one another without vanishing."*
- **Illustrative Output Concept:** Structured stanzas highlighting an isolated system (`замкнутая система`), mutual conversion of kinetic and potential forms, and total energy invariance.

### Example 3 — Chemistry Process (Oxidation–Reduction)
- **Input:** *"During a redox reaction, the reducing agent donates electrons and is oxidized, while the oxidizing agent accepts electrons and is reduced."*
- **Illustrative Output Concept:** Mnemonic couplets contrasting electron donation (oxidation) vs. electron acceptance (reduction) without reversing agent roles.

### Example 4 — Song Lyrics
- **Input:** *"An evening train leaving a quiet coastal station, carrying memories of summer rain and a promise to return."*
- **Illustrative Output Concept:** Singable stanzas with steady cadence and cross-rhyme (`ABAB`) emphasizing imagery of rails, sea wind, and return.

### Example 5 — Greeting Card
- **Input:** *"Warm birthday wishes for a colleague who loves astronomy and quiet mountain hikes."*
- **Illustrative Output Concept:** Concise celebratory quatrain weaving starlight and mountain trails into a printable card verse.

### Example 6 — Philosophical / Scientific Thought
- **Input:** *"Every scientific model is a map, not the territory itself; knowing its boundary makes knowledge stronger."*
- **Illustrative Output Concept:** Epigrammatic classical stanza contrasting map/model boundaries against reality, ending with an analytical moral.

---

## 4. Architecture & Implemented Subsystems (`v0.1.0-alpha`)

### 4.1. React / Vite Web UI & Gemini Service (`IMPLEMENTED`, live call `NOT_VERIFIED`)
- `App.tsx`, `EngineVisualizer.tsx`, `OutputParchment.tsx`, `services/geminiService.ts`.
- `transformText(text)` calls `@google/genai` (`gemini-3-pro-preview`) using Structured JSON Outputs (`{ poem, moral }`).
- Poetic rules (4-foot iamb, `ABAB`, archaic/classical framing) are **prompt-guided**; no deterministic meter/rhyme parser runs in TypeScript.
- `EngineStage` displays a 6-step visual animation (`800ms` per step) concurrently with the API call.

### 4.2. Agent CLI & Skill (`IMPLEMENTED`, `TESTED` offline)
- `agent-interface/cli.ts`, `SKILL.md`, `skills/pushkin-rhyme-machine/SKILL.md`.
- Supports `info`, `help`, `generate --text / --input / stdin / --output`.
- `info` transparently reports `programmatic_meter_validation: false` and `validation_mode: "prompt_guided_llm_generation"`.
- `4/4` offline CLI contract tests pass (`test_cli_agent_call.py`).

### 4.3. Visual & Narrative Reference Library V1 (`IMPLEMENTED`, `TESTED` metadata mode)
- `services/visualLibraryService.ts`, `components/visual-library/*`, `data/visual-library/*`.
- Catalog of 19 reference anchor records across 11 categories and 8 narrative patterns, plus 3 interactive modes (Composition Brief, Lexical Poem Match, Inspiration Context) and `localStorage` editing.
- **Public Alpha Asset Note:** The 19 AI-stylized PNG files previously used in local prototyping are **excluded from this public Git release** pending third-party image distribution clearance (see `public/assets/aistudio/README.md`). On clean checkouts, the gallery renders cleanly using metadata/text fallback cards without runtime crashes, and users may add custom image anchors locally.

### 4.4. Book Layer (`/book_layer`, `IMPLEMENTED`, `TESTED`)
- Adopted from `PushkinBookLayer 0.1` without modifying frozen external contracts (`BOOK-NAV Classic V6`).
- Tracks `SourceDocument`, 1-indexed physical `PageReference`, `BookNode`, and `TextFragment` with SHA-256 digests (`PyMuPDF`).
- Uses portable manifest paths (`book_layer/data/boris_godunov_2008_manifest.json`), handles `FAILED` reads cleanly, and blocks `SCANNED_PAGE`, `FAILED`, and unapproved `PARTIAL` fragments in `pipeline.to_c1_input()`.

### 4.5. Source Validation (`/source_validation`, `IMPLEMENTED`, `TESTED`)
- Implements `SourceEvidencePackage` (`SOURCE_EVIDENCE_PACKAGE_SCHEMA.json`) with full edition/witness/page/hash provenance.
- Enforces dual permissions:
  - `semantic_analysis_allowed` (bounded semantic inspection on valid non-empty text)
  - `prosodic_analysis_allowed` (**strictly `False`** for `SCANNED_PAGE`, `FAILED`, `PARTIAL`, `EDITORIAL_COMMENTARY`, `VERIFIED_PROSE_BLOCK`, and `PDF_TEXT_LINE_UNCLASSIFIED`).

---

## 5. Installation and Running

### Prerequisites
- **Node.js** `>= 22.6` (native `--experimental-strip-types` CLI execution; or Node 18+ with Vite UI)
- **Python** `>= 3.10` with `venv` (`PyMuPDF >= 1.24` for `/book_layer`)
- **Gemini API Key** (`GEMINI_API_KEY`) for live poetry generation

### Web Application
```bash
npm install
cp .env.example .env.local
# Edit .env.local and set your own GEMINI_API_KEY (never commit .env.local)
npm run dev
# Open http://localhost:3000
```
> **Security Note (see `SECURITY.md`):** Current `vite.config.ts` inlines `process.env.API_KEY` into the frontend build for local single-user development. Do **not** publish static `dist/` builds with a real key embedded; a server-side API proxy is planned for Stage G.

### Agent CLI
```bash
export GEMINI_API_KEY="your_api_key_here"
npm run pushkin-rhyme -- info
npm run pushkin-rhyme -- generate --text "Energy in an isolated system is conserved."
```

### Python Book Layer & Source Validation
```bash
python3 -m venv book_layer/.venv
book_layer/.venv/bin/pip install "PyMuPDF>=1.24"
```

---

## 6. Verification & Tests

```bash
# 1. TypeScript check & production Vite build
npx tsc --noEmit
npm run build

# 2. Agent CLI offline validation tests (4/4 pass)
python3 test_cli_agent_call.py

# 3. Autonomous Stage C Python tests (13/13 pass, 0 skipped, no external PDF or API key needed)
book_layer/.venv/bin/python -m unittest -v book_layer/tests/test_synthetic_book.py source_validation/tests/test_source_validation.py

# 4. Optional real Boris Godunov PDF fixture test (skipped unless BORIS_PDF is supplied)
BORIS_PDF=/path/to/pushkin_vyp2_boris_godunov_2008.pdf book_layer/.venv/bin/python -m unittest -v book_layer/tests/test_adapter.py
```

---

## 7. Planned Roadmap (`PLANNED`)

- **Stage D:** Open corpus ingestion & structural drama/lyric segmentation (`C1`)
- **Stage E:** Deterministic Russian syllabification, stress/homography, meter & rhyme analysis (`C6a` / `C6b`)
- **Stage F:** Poetic profile extraction datasets
- **Stage G:** Verification-gated generation (`C8`), provenance auditor (`M8`), server-side API proxy, and **Educational Mode** (side-by-side source statement, verse, poetic devices, preserved facts, and simplification notes)
- **Stage H:** Controlled human-verified OCR track

See `ROADMAP.md` and `ARCHITECTURE.md` for full details.

---

## 8. Author & Separate Licensing

- **Author:** Андрей Арцыбашев
- **Source Code:** **MIT License** — see [`LICENSE`](LICENSE)
- **Original Documentation:** **Creative Commons Attribution 4.0 International (CC BY 4.0)** — see [`LICENSE-DOCS`](LICENSE-DOCS)
- **Excluded Visual/Third-Party Media:** Reference PNGs in `public/assets/aistudio/` are excluded from the public alpha release (`public/assets/aistudio/README.md`).
