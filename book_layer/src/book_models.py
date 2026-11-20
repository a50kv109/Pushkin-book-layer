"""Literary book navigation contracts. Separate from BOOK-NAV V6 frozen types.

Origin: PushkinBookLayer 0.1 (`src/book_models.py`), hardened for Stage C provenance
while preserving backwards-compatible signatures and field names.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Literal, Optional

NodeKind = Literal[
    "WORK",
    "EDITION_WITNESS",
    "PART",
    "CHAPTER",
    "SONG",
    "SCENE",
    "STANZA",
    "LINE",
    "COMMENTARY",
    "APPENDIX",
]
ExtractionStatus = Literal["TEXT_LAYER", "SCANNED_PAGE", "PARTIAL", "FAILED"]


@dataclass(frozen=True)
class SourceDocument:
    document_id: str
    title: str
    author: str
    edition: str
    publisher: str
    year: int
    pdf_path: str
    pdf_sha256: str
    page_count: int
    language: str = "ru"
    work_id: Optional[str] = None
    edition_id: Optional[str] = None


@dataclass(frozen=True)
class PageReference:
    pdf_page: int  # 1-indexed physical PDF page
    printed_page: Optional[str]  # printed page label, kept separate
    page_role: str


@dataclass(frozen=True)
class BookNode:
    node_id: str
    kind: NodeKind
    title: str
    parent_id: Optional[str]
    order: int
    page_refs: tuple[PageReference, ...]
    text: Optional[str] = None
    extraction_status: ExtractionStatus = "PARTIAL"
    source_hash: Optional[str] = None
    source_note: Optional[str] = None
    witness_id: Optional[str] = None


@dataclass(frozen=True)
class TextFragment:
    document_id: str
    node_id: str
    text: str
    page_refs: tuple[PageReference, ...]
    source_hash: str
    extraction_status: ExtractionStatus
    context_before: Optional[str] = None
    context_after: Optional[str] = None
    work_id: Optional[str] = None
    edition_id: Optional[str] = None
    witness_id: Optional[str] = None
    error_detail: Optional[str] = None

    def to_dict(self):
        d = asdict(self)
        d["page_refs"] = [asdict(x) for x in self.page_refs]
        return d
