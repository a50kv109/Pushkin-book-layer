"""Explicit handoff: source fragment -> future C1; no prosodic claims here.

Origin: PushkinBookLayer 0.1 (`src/pipeline.py`), hardened for Stage C:
- Blocks SCANNED_PAGE, FAILED, and empty fragments via SourceHandoffBlockedError
- Preserves node_id, witness_id, work_id, edition_id, context_before, context_after
- Requires allow_partial=True to forward PARTIAL fragments with explicit completeness warning
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .book_models import TextFragment


class SourceHandoffBlockedError(ValueError):
    """Raised when a fragment is unsafe to hand off to downstream analysis."""


@dataclass
class C1Input:
    source_text: str
    source_document: str
    page_references: list[dict]
    source_hash: str
    extraction_status: str
    instruction: str = (
        "Treat source text as SOURCE. Preserve speaker labels, stage directions, "
        "line order and spelling. Distinguish text from editorial commentary. "
        "Do not infer meter, stress, rhyme or style from this ingestion layer, "
        "and do not treat PDF_TEXT_LINE_UNCLASSIFIED lines as verified verse lines."
    )
    node_id: Optional[str] = None
    work_id: Optional[str] = None
    edition_id: Optional[str] = None
    witness_id: Optional[str] = None
    context_before: Optional[str] = None
    context_after: Optional[str] = None
    line_semantics: str = "PDF_TEXT_LINE_UNCLASSIFIED"


def to_c1_input(fragment: TextFragment, *, allow_partial: bool = False) -> C1Input:
    if fragment.extraction_status == "FAILED":
        detail = fragment.error_detail or "PDF extraction failed"
        raise SourceHandoffBlockedError(f"Blocked FAILED fragment {fragment.node_id}: {detail}")
    if fragment.extraction_status == "SCANNED_PAGE":
        raise SourceHandoffBlockedError(
            f"Blocked SCANNED_PAGE fragment {fragment.node_id}: OCR and verification required before analysis."
        )
    if fragment.extraction_status == "PARTIAL" and not allow_partial:
        raise SourceHandoffBlockedError(
            f"Blocked PARTIAL fragment {fragment.node_id}: pass allow_partial=True with explicit completeness handling."
        )
    if not fragment.text.strip():
        raise SourceHandoffBlockedError(
            f"Blocked empty text fragment {fragment.node_id} (status={fragment.extraction_status})."
        )

    instruction = C1Input.instruction
    if fragment.extraction_status == "PARTIAL":
        instruction += " WARNING: source coverage is PARTIAL and incomplete."

    return C1Input(
        source_text=fragment.text,
        source_document=fragment.document_id,
        page_references=[
            {
                "pdf_page": p.pdf_page,
                "printed_page": p.printed_page,
                "page_role": p.page_role,
            }
            for p in fragment.page_refs
        ],
        source_hash=fragment.source_hash,
        extraction_status=fragment.extraction_status,
        instruction=instruction,
        node_id=fragment.node_id,
        work_id=fragment.work_id,
        edition_id=fragment.edition_id,
        witness_id=fragment.witness_id,
        context_before=fragment.context_before,
        context_after=fragment.context_after,
    )
