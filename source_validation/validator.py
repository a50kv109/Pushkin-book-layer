"""Deterministic routing validator producing SourceEvidencePackage (Stage C).

Separates SEMANTIC_ANALYSIS_ALLOWED from PROSODIC_ANALYSIS_ALLOWED and blocks
unverified scans, failed extractions, and unclassified PDF line wraps from prosody.
"""
from __future__ import annotations

import hashlib
import re
from typing import Any, Optional

from .models import (
    ExtractionStatus,
    LineSemantics,
    SourceClass,
    SourceEvidencePackage,
    VALID_EXTRACTION_STATUSES,
    VALID_LINE_SEMANTICS,
    VALID_SOURCE_CLASSES,
)

SHA256_RE = re.compile(r"^[a-f0-9]{64}$")
EMPTY_SHA256 = hashlib.sha256(b"").hexdigest()

LITERARY_VERSE_ELIGIBLE_CLASSES = {
    "PRIMARY_CANONICAL_TEXT",
    "EARLY_REDACTION",
    "AUTHORIAL_DRAFT",
    "SYNTHETIC_FIXTURE",
}


def _extract_attr(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _normalize_page_refs(raw_refs: Any) -> list[dict]:
    if not raw_refs:
        return []
    normalized: list[dict] = []
    for ref in raw_refs:
        pdf_page = _extract_attr(ref, "pdf_page")
        printed_page = _extract_attr(ref, "printed_page", None)
        page_role = _extract_attr(ref, "page_role", "")
        if not isinstance(pdf_page, int) or pdf_page < 1:
            raise ValueError(f"Invalid pdf_page in page_ref: {pdf_page!r}")
        if not isinstance(page_role, str) or not page_role.strip():
            raise ValueError(f"Missing page_role in page_ref for pdf_page={pdf_page}")
        normalized.append(
            {
                "pdf_page": pdf_page,
                "printed_page": printed_page,
                "page_role": page_role,
            }
        )
    return normalized


def validate_source_fragment(
    fragment: Any,
    *,
    work_id: Optional[str] = None,
    edition_id: Optional[str] = None,
    witness_id: Optional[str] = None,
    source_class: SourceClass = "PRIMARY_CANONICAL_TEXT",
    line_semantics: LineSemantics = "PDF_TEXT_LINE_UNCLASSIFIED",
    document_sha256: Optional[str] = None,
    ocr_verified: bool = False,
) -> SourceEvidencePackage:
    """Validate a TextFragment (or dict) into an independent SourceEvidencePackage."""
    resolved_work_id = (work_id or _extract_attr(fragment, "work_id") or "").strip()
    resolved_edition_id = (
        edition_id
        or _extract_attr(fragment, "edition_id")
        or _extract_attr(fragment, "document_id")
        or ""
    ).strip()
    resolved_witness_id = (
        witness_id or _extract_attr(fragment, "witness_id") or ""
    ).strip()
    resolved_fragment_id = (_extract_attr(fragment, "node_id") or "").strip()
    resolved_status: ExtractionStatus = _extract_attr(fragment, "extraction_status")
    resolved_hash = (_extract_attr(fragment, "source_hash") or "").strip()
    raw_text = _extract_attr(fragment, "text")
    error_detail = _extract_attr(fragment, "error_detail")
    page_ref = _normalize_page_refs(_extract_attr(fragment, "page_refs"))

    if not resolved_work_id:
        raise ValueError("Provenance error: work_id is required")
    if not resolved_edition_id:
        raise ValueError("Provenance error: edition_id is required")
    if not resolved_witness_id:
        raise ValueError("Provenance error: witness_id is required")
    if not resolved_fragment_id:
        raise ValueError("Provenance error: fragment_id (node_id) is required")
    if not page_ref:
        raise ValueError("Provenance error: at least one page_ref is required")
    if resolved_status not in VALID_EXTRACTION_STATUSES:
        raise ValueError(f"Unsupported extraction_status: {resolved_status!r}")
    if source_class not in VALID_SOURCE_CLASSES:
        raise ValueError(f"Unsupported source_class: {source_class!r}")
    if line_semantics not in VALID_LINE_SEMANTICS:
        raise ValueError(f"Unsupported line_semantics: {line_semantics!r}")
    if not SHA256_RE.match(resolved_hash):
        raise ValueError(f"Invalid SHA-256 source_hash: {resolved_hash!r}")
    if document_sha256 is not None and not SHA256_RE.match(document_sha256):
        raise ValueError(f"Invalid SHA-256 document_sha256: {document_sha256!r}")

    text_str = raw_text if isinstance(raw_text, str) else ""
    blocking_reasons: list[str] = []
    completeness_note: Optional[str] = None

    # Rule 1: FAILED extraction is unconditionally blocked.
    if resolved_status == "FAILED":
        reason = "EXTRACTION_FAILED"
        if error_detail:
            reason = f"EXTRACTION_FAILED: {error_detail}"
        return SourceEvidencePackage(
            package_version="1.0.0",
            work_id=resolved_work_id,
            edition_id=resolved_edition_id,
            witness_id=resolved_witness_id,
            page_ref=page_ref,
            fragment_id=resolved_fragment_id,
            source_hash=resolved_hash or EMPTY_SHA256,
            document_sha256=document_sha256,
            extraction_status="FAILED",
            line_semantics="NONE",
            source_class=source_class,
            text="",
            semantic_analysis_allowed=False,
            prosodic_analysis_allowed=False,
            blocking_reasons=[reason],
            completeness_note="Extraction failed; halted before downstream analysis.",
        )

    # Rule 2: SCANNED_PAGE without verified OCR is unconditionally blocked.
    if resolved_status == "SCANNED_PAGE" and not ocr_verified:
        return SourceEvidencePackage(
            package_version="1.0.0",
            work_id=resolved_work_id,
            edition_id=resolved_edition_id,
            witness_id=resolved_witness_id,
            page_ref=page_ref,
            fragment_id=resolved_fragment_id,
            source_hash=resolved_hash,
            document_sha256=document_sha256,
            extraction_status="SCANNED_PAGE",
            line_semantics="NONE",
            source_class=source_class,
            text="",
            semantic_analysis_allowed=False,
            prosodic_analysis_allowed=False,
            blocking_reasons=["SCANNED_PAGE_REQUIRES_VERIFIED_OCR"],
            completeness_note="Scanned facsimile page has no verified text layer.",
        )

    # Rule 3: Empty text cannot support either semantic or prosodic analysis.
    if not text_str.strip():
        return SourceEvidencePackage(
            package_version="1.0.0",
            work_id=resolved_work_id,
            edition_id=resolved_edition_id,
            witness_id=resolved_witness_id,
            page_ref=page_ref,
            fragment_id=resolved_fragment_id,
            source_hash=resolved_hash,
            document_sha256=document_sha256,
            extraction_status=resolved_status,
            line_semantics="NONE",
            source_class=source_class,
            text="",
            semantic_analysis_allowed=False,
            prosodic_analysis_allowed=False,
            blocking_reasons=["EMPTY_SOURCE_TEXT"],
            completeness_note="No non-whitespace text extracted.",
        )

    # Verify source_hash matches actual text integrity when text is present.
    actual_hash = hashlib.sha256(text_str.encode("utf-8")).hexdigest()
    if actual_hash != resolved_hash:
        raise ValueError(
            f"Integrity error: source_hash mismatch for fragment {resolved_fragment_id}"
        )

    # Rule 4: Non-empty TEXT_LAYER or PARTIAL may allow semantic analysis,
    # while prosodic analysis requires strict conditions.
    semantic_allowed = True
    prosodic_allowed = True

    if resolved_status == "PARTIAL":
        prosodic_allowed = False
        blocking_reasons.append("PARTIAL_COVERAGE_DISALLOWED_FOR_PROSODY")
        completeness_note = "PARTIAL source coverage: suitable for bounded semantic inspection only."

    if source_class not in LITERARY_VERSE_ELIGIBLE_CLASSES:
        prosodic_allowed = False
        blocking_reasons.append(f"SOURCE_CLASS_{source_class}_DISALLOWED_FOR_PROSODY")

    if line_semantics != "VERIFIED_VERSE_LINE":
        prosodic_allowed = False
        blocking_reasons.append(f"LINE_SEMANTICS_{line_semantics}_DISALLOWED_FOR_PROSODY")

    if resolved_status == "SCANNED_PAGE" and ocr_verified:
        completeness_note = "OCR_HUMAN_VERIFIED text supplied for scanned page."

    return SourceEvidencePackage(
        package_version="1.0.0",
        work_id=resolved_work_id,
        edition_id=resolved_edition_id,
        witness_id=resolved_witness_id,
        page_ref=page_ref,
        fragment_id=resolved_fragment_id,
        source_hash=resolved_hash,
        document_sha256=document_sha256,
        extraction_status=resolved_status,
        line_semantics=line_semantics,
        source_class=source_class,
        text=text_str,
        semantic_analysis_allowed=semantic_allowed,
        prosodic_analysis_allowed=prosodic_allowed,
        blocking_reasons=blocking_reasons,
        completeness_note=completeness_note,
    )
