"""Literary PDF adapter. Does not alter/import BOOK-NAV V6 Frozen Core.

Origin: PushkinBookLayer 0.1 (`src/book_nav_adapter.py`), updated for Stage C:
- Portable `source_ref` in SourceDocument (no hardcoded host paths like /mnt/data)
- Explicit `FAILED` handling on corrupted/unreadable PDF pages
- Safe guarding of `extract_source_lines()` for SCANNED_PAGE / FAILED fragments
"""
from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Iterable, Optional

try:
    import pymupdf as fitz  # PyMuPDF >= 1.24 recommended entry point
except ImportError:  # pragma: no cover
    import fitz

from .book_models import (
    BookNode,
    ExtractionStatus,
    PageReference,
    SourceDocument,
    TextFragment,
)

EMPTY_SHA256 = hashlib.sha256(b"").hexdigest()


def sha256_file(path: str | Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def make_failed_fragment(
    document_id: str,
    page_number: int,
    error_detail: str,
    *,
    printed_page: Optional[str] = None,
    role: str = "WORK_TEXT",
    work_id: Optional[str] = None,
    edition_id: Optional[str] = None,
    witness_id: Optional[str] = None,
) -> TextFragment:
    """Create a deterministic FAILED fragment when PDF open/read/extract fails."""
    return TextFragment(
        document_id=document_id,
        node_id=f"{document_id}:PDF:{page_number}",
        text="",
        page_refs=(PageReference(page_number, printed_page, role),),
        source_hash=EMPTY_SHA256,
        extraction_status="FAILED",
        work_id=work_id,
        edition_id=edition_id,
        witness_id=witness_id,
        error_detail=error_detail,
    )


class BookNavAdapter:
    def __init__(
        self,
        pdf_path: str,
        document_id: str,
        title: str,
        author: str,
        edition: str,
        publisher: str,
        year: int,
        *,
        language: str = "ru",
        work_id: Optional[str] = None,
        edition_id: Optional[str] = None,
        source_ref: Optional[str] = None,
    ):
        self.path = Path(pdf_path)
        if not self.path.is_file():
            raise FileNotFoundError(self.path)
        self.pdf = fitz.open(self.path)
        if getattr(self.pdf, "page_count", len(self.pdf)) <= 0:
            self.pdf.close()
            raise ValueError(f"PDF contains no pages: {self.path.name}")
        portable_ref = source_ref if source_ref is not None else self.path.name
        self.document = SourceDocument(
            document_id=document_id,
            title=title,
            author=author,
            edition=edition,
            publisher=publisher,
            year=year,
            pdf_path=portable_ref,
            pdf_sha256=sha256_file(self.path),
            page_count=len(self.pdf),
            language=language,
            work_id=work_id or document_id,
            edition_id=edition_id or document_id,
        )
        self._closed = False

    def __enter__(self) -> "BookNavAdapter":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()

    def _ensure_open(self) -> None:
        if self._closed or getattr(self.pdf, "is_closed", False):
            raise RuntimeError(f"PDF document is closed: {self.document.document_id}")

    def page_text(self, page_number: int) -> str:
        self._ensure_open()
        if not 1 <= page_number <= len(self.pdf):
            raise IndexError(page_number)
        return self.pdf[page_number - 1].get_text("text")

    def page_reference(
        self, page_number: int, printed_page: str | None = None, role: str = "UNKNOWN"
    ) -> PageReference:
        return PageReference(page_number, printed_page, role)

    def render_page(
        self, page_number: int, dpi: int = 150, output: str | Path | None = None
    ) -> bytes:
        """Render a physical PDF page; rendering is an adapter-level fallback, not OCR."""
        self._ensure_open()
        if not 1 <= page_number <= len(self.pdf):
            raise IndexError(page_number)
        if not 36 <= dpi <= 600:
            raise ValueError("dpi must be between 36 and 600")
        pix = self.pdf[page_number - 1].get_pixmap(
            matrix=fitz.Matrix(dpi / 72, dpi / 72), alpha=False
        )
        data = pix.tobytes("png")
        if output:
            Path(output).parent.mkdir(parents=True, exist_ok=True)
            Path(output).write_bytes(data)
        return data

    def extract_page_fragment(
        self,
        page_number: int,
        printed_page: str | None = None,
        role: str = "WORK_TEXT",
        *,
        witness_id: Optional[str] = None,
        safe_on_error: bool = True,
    ) -> TextFragment:
        if not self._closed and not getattr(self.pdf, "is_closed", False):
            if not 1 <= page_number <= len(self.pdf):
                raise IndexError(page_number)

        try:
            raw = self.page_text(page_number)
            status: ExtractionStatus = "TEXT_LAYER" if raw.strip() else "SCANNED_PAGE"
            norm = raw.replace("\r\n", "\n").replace("\r", "\n")
            return TextFragment(
                document_id=self.document.document_id,
                node_id=f"{self.document.document_id}:PDF:{page_number}",
                text=norm,
                page_refs=(self.page_reference(page_number, printed_page, role),),
                source_hash=hashlib.sha256(norm.encode("utf-8")).hexdigest(),
                extraction_status=status,
                work_id=self.document.work_id,
                edition_id=self.document.edition_id,
                witness_id=witness_id,
            )
        except IndexError:
            raise
        except Exception as exc:
            if not safe_on_error:
                raise
            return make_failed_fragment(
                self.document.document_id,
                page_number,
                str(exc),
                printed_page=printed_page,
                role=role,
                work_id=self.document.work_id,
                edition_id=self.document.edition_id,
                witness_id=witness_id,
            )

    def extract_range(
        self,
        start_page: int,
        end_page: int,
        role: str = "WORK_TEXT",
        *,
        witness_id: Optional[str] = None,
        safe_on_error: bool = True,
    ) -> list[TextFragment]:
        self._ensure_open()
        if start_page < 1 or end_page > len(self.pdf) or start_page > end_page:
            raise ValueError("invalid page range")
        return [
            self.extract_page_fragment(
                p, role=role, witness_id=witness_id, safe_on_error=safe_on_error
            )
            for p in range(start_page, end_page + 1)
        ]

    def close(self) -> None:
        if not self._closed:
            try:
                self.pdf.close()
            finally:
                self._closed = True


def build_boris_godunov_manifest(adapter: BookNavAdapter) -> list[BookNode]:
    """Conservative edition map grounded in the printed contents (PDF p.574)."""
    doc = adapter.document
    nodes = [
        BookNode(
            "BG-2008",
            "WORK",
            "Борис Годунов — комментированное издание, выпуск 2",
            None,
            1,
            (
                PageReference(1, None, "COVER"),
                PageReference(5, None, "BIBLIOGRAPHIC_DATA"),
                PageReference(574, None, "CONTENTS"),
            ),
            None,
            "PARTIAL",
            doc.pdf_sha256,
            "A 2008 commented edition with 1831 lifetime-edition facsimile, appendices, commentary and index.",
            witness_id="BG-2008",
        )
    ]
    nodes.append(
        BookNode(
            "BG-MAIN-1831",
            "PART",
            "Основной репринт трагедии (прижизненное издание 1831 года)",
            "BG-2008",
            1,
            (
                PageReference(12, "1", "MAIN_FACSIMILE_START"),
                PageReference(155, None, "MAIN_FACSIMILE_END"),
            ),
            None,
            "SCANNED_PAGE",
            None,
            "Scanned facsimile; representative pages have no embedded text layer. Full OCR/line indexing is pending.",
            witness_id="BG-MAIN-1831",
        )
    )
    # Appendix I is a distinct earlier redaction, not the 1831 main witness.
    app_parts = []
    for p in range(158, 249):
        t = adapter.page_text(p)
        if t.strip():
            app_parts.append((p, t))
    app_text = "\n".join(t for _, t in app_parts)
    if app_parts:
        nodes.append(
            BookNode(
                "BG-APP-I",
                "APPENDIX",
                "Приложение I: «Комедия о царе Борисе и о Гришке Отрепьеве»",
                "BG-2008",
                1,
                tuple(PageReference(p, None, "APPENDIX_I_TEXT") for p, _ in app_parts),
                app_text,
                "TEXT_LAYER",
                hashlib.sha256(app_text.encode("utf-8")).hexdigest(),
                "Distinct earlier redaction; PDF pp.158–248. Do not merge with the 1831 main text.",
                witness_id="BG-APP-I",
            )
        )
    # Appendix II is another distinct textual witness (draft preface).
    app2_pages = []
    app2_texts = []
    for p in range(249, 254):
        txt = adapter.page_text(p)
        if txt.strip():
            app2_pages.append(PageReference(p, None, "APPENDIX_II_TEXT"))
            app2_texts.append(txt)
    app2 = "\n".join(app2_texts)
    nodes.append(
        BookNode(
            "BG-APP-II",
            "APPENDIX",
            "Приложение II: наброски предисловия к «Борису Годунову»",
            "BG-2008",
            2,
            tuple(app2_pages),
            app2 or None,
            "TEXT_LAYER" if app2 else "PARTIAL",
            hashlib.sha256(app2.encode("utf-8")).hexdigest() if app2 else None,
            "Authorial drafts; separate from dramatic text.",
            witness_id="BG-APP-II",
        )
    )
    nodes.append(
        BookNode(
            "BG-COMMENTARY",
            "PART",
            "Историко-литературные комментарии",
            "BG-2008",
            3,
            (
                PageReference(256, None, "COMMENTARY_START"),
                PageReference(571, None, "COMMENTARY_END"),
            ),
            None,
            "PARTIAL",
            None,
            "Commentary begins at PDF p.256; includes history/text, sources, verse, stageability, reception and line notes.",
            witness_id="BG-COMMENTARY",
        )
    )
    nodes.append(
        BookNode(
            "BG-INDEX",
            "PART",
            "Указатель",
            "BG-2008",
            4,
            (
                PageReference(572, None, "INDEX_START"),
                PageReference(575, None, "INDEX_END"),
            ),
            None,
            "PARTIAL",
            None,
            "Index pages, separate from authorial text and commentary narrative.",
            witness_id="BG-INDEX",
        )
    )
    return nodes


def extract_source_lines(fragment: TextFragment) -> list[dict]:
    """Return physical text-layer lines without claiming they are verified verse lines.

    Never converts SCANNED_PAGE or FAILED fragments into source lines.
    """
    if fragment.extraction_status in ("SCANNED_PAGE", "FAILED") or not fragment.text.strip():
        return []
    records = []
    ref = fragment.page_refs[0]
    for idx, line in enumerate(fragment.text.splitlines(), start=1):
        if line.strip():
            records.append(
                {
                    "source_line_no": idx,
                    "text": line,
                    "document_id": fragment.document_id,
                    "pdf_page": ref.pdf_page,
                    "printed_page": ref.printed_page,
                    "page_role": ref.page_role,
                    "source_hash": fragment.source_hash,
                    "line_semantics": "PDF_TEXT_LINE_UNCLASSIFIED",
                }
            )
    return records


def search_nodes(
    nodes: Iterable[BookNode], query: str, top_k: int = 5
) -> list[tuple[BookNode, float]]:
    """Transparent token overlap search over indexed literary nodes; no LLM claim."""
    terms = {x for x in re.findall(r"[\w-]+", query.casefold()) if len(x) > 2}
    if not terms:
        return []
    scored = []
    for n in nodes:
        corpus = (n.title + " " + (n.text or "")).casefold()
        corpus_tokens = set(re.findall(r"[\w-]+", corpus))
        hits = sum(1 for t in terms if (t in corpus_tokens or t in corpus))
        if hits:
            scored.append((n, hits / len(terms)))
    return sorted(scored, key=lambda x: x[1], reverse=True)[:top_k]
