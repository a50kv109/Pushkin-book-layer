# PushkinBookLayer — literary-book ingestion adapter (prototype 0.1)

## Boundary

`BOOK-NAV Classic V6` remains an upstream document-evidence subsystem. Its frozen files are not modified. In V6, `POST /api/materialize` handles canonical `FIGURE` and `TABLE` StructuralNodes; the canonical type list also mentions SECTION/REFERENCE/EQUATION but the unified materialization route rejects unsupported types. V5 semantic discovery searches metadata from a supplied `ClassicManifest`; it does not index arbitrary PDF paragraphs/verse automatically.

The literary layer therefore uses separate contracts in `src/book_models.py` and `src/book_nav_adapter.py`. It owns WORK/PART/CHAPTER/SONG/SCENE/STANZA/LINE hierarchy, source text, physical PDF pages, printed page labels, and text fingerprints. Do not insert literary LINE/STANZA nodes into frozen `StructuralNode`.

## Data flow

`PDF -> BookNavAdapter -> LiteraryManifest/TextFragment -> C1 Semantic Extraction -> C2-C7 (as requested) -> C8`

The adapter never computes meter, stress, rhyme, phonetics, authorship/style scores or interpretation. `pipeline.to_c1_input()` hands off exact extracted text plus evidence metadata.

## Extraction states

- `TEXT_LAYER`: text came from the PDF text layer.
- `SCANNED_PAGE`: no text layer was found; only page rendering is available.
- `PARTIAL`: boundaries/structure are known but text is incomplete.
- `FAILED`: read/render failure.

A rendered page is not OCR. No automatic OCR is claimed in this prototype.

## Provenance

`SOURCE_DOCUMENT` includes edition metadata, physical page count and SHA-256 of the uploaded PDF. Each `PAGE_REFERENCE` uses 1-indexed physical PDF page, separate optional printed page label and page role. A text fragment has its own SHA-256. Page numbers are never silently treated as printed pagination.

## BOOK-NAV V6 compatibility

The upstream V6 files remain vendored only as a separately pinned external dependency/reference; this prototype does not invoke its HTTP materializer for text. If V6 is running separately, use it for verified page rendering/crops only where its FIGURE contract is genuinely applicable. The adapter's PyMuPDF renderer is a local fallback for page evidence and is not represented as the BOOK-NAV renderer.
