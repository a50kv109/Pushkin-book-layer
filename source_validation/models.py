"""Independent data contract models matching SOURCE_EVIDENCE_PACKAGE_SCHEMA.json."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from typing import Literal, Optional

ExtractionStatus = Literal["TEXT_LAYER", "SCANNED_PAGE", "PARTIAL", "FAILED"]
LineSemantics = Literal[
    "PDF_TEXT_LINE_UNCLASSIFIED",
    "VERIFIED_VERSE_LINE",
    "VERIFIED_PROSE_BLOCK",
    "MIXED_UNVERIFIED",
    "NONE",
]
SourceClass = Literal[
    "PRIMARY_CANONICAL_TEXT",
    "EARLY_REDACTION",
    "AUTHORIAL_DRAFT",
    "EDITORIAL_COMMENTARY",
    "INDEX_OR_METADATA",
    "SYNTHETIC_FIXTURE",
]

VALID_EXTRACTION_STATUSES = {"TEXT_LAYER", "SCANNED_PAGE", "PARTIAL", "FAILED"}
VALID_LINE_SEMANTICS = {
    "PDF_TEXT_LINE_UNCLASSIFIED",
    "VERIFIED_VERSE_LINE",
    "VERIFIED_PROSE_BLOCK",
    "MIXED_UNVERIFIED",
    "NONE",
}
VALID_SOURCE_CLASSES = {
    "PRIMARY_CANONICAL_TEXT",
    "EARLY_REDACTION",
    "AUTHORIAL_DRAFT",
    "EDITORIAL_COMMENTARY",
    "INDEX_OR_METADATA",
    "SYNTHETIC_FIXTURE",
}


@dataclass(frozen=True)
class PageRefRecord:
    pdf_page: int
    printed_page: Optional[str]
    page_role: str


@dataclass(frozen=True)
class SourceEvidencePackage:
    package_version: str
    work_id: str
    edition_id: str
    witness_id: str
    page_ref: list[dict]
    fragment_id: str
    source_hash: str
    extraction_status: ExtractionStatus
    line_semantics: LineSemantics
    source_class: SourceClass
    text: str
    semantic_analysis_allowed: bool
    prosodic_analysis_allowed: bool
    blocking_reasons: list[str] = field(default_factory=list)
    document_sha256: Optional[str] = None
    completeness_note: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=indent)
