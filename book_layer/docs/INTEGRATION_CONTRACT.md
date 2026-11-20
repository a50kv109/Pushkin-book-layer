# Integration contract for PushkinRhymeEngine

## Registration

Call `BookNavAdapter(pdf_path, document_id, title, author, edition, publisher, year)`. The resulting `SourceDocument` stores the PDF SHA-256 and physical page count.

## Navigation

The first manifest layer is conservative. It registers text witnesses as distinct nodes and records 1-indexed physical PDF pages separately from printed pagination. For this edition:

- Main 1831 facsimile: PDF pp.12–155, scanned.
- Appendix I (earlier redaction): PDF pp.158–248, text-bearing.
- Appendix II (draft preface): PDF pp.249–253, text-bearing.
- Commentary: starts PDF p.256; index follows in PDF pp.572–575.

These boundaries are grounded in the book's contents page (PDF p.574) and checked against the start/end pages of the appendix text. Do not merge the witnesses.

## Fragment handoff

`extract_page_fragment(page)` returns `TextFragment`; `to_c1_input(fragment)` carries exact text, `SOURCE_DOCUMENT`, physical `PAGE_REFERENCE`, fragment `SOURCE_HASH`, and extraction status into C1. It is intentionally read-only.

`extract_source_lines(fragment)` returns source-layout lines labelled `PDF_TEXT_LINE_UNCLASSIFIED`. It does not claim that each extracted line is a poetic verse line: PDF text extraction can contain wraps, hyphenation and layout artifacts. A later layout-aware segmentation module must reconcile these against page images before promoting them to `VERSE_LINE`.

## State and routing rules

- `TEXT_LAYER`: C1 may process extracted text with its provenance.
- `SCANNED_PAGE`: render the page, but C1 must not receive empty text as if extraction succeeded. OCR/manual transcription is a separate, traceable operation.
- `PARTIAL`: metadata boundary exists, text coverage is incomplete.
- `FAILED`: halt and surface the failure.

Only after line/speaker/scene segmentation is reviewed should content be promoted into C2 Narrative Composition or C3 Dialogue Composition. C6a/C6b are not invoked by this adapter.
