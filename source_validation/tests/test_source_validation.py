"""Autonomous unit tests for source_validation and SourceEvidencePackage schema compliance."""
from __future__ import annotations

import hashlib
import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from source_validation import SourceEvidencePackage, validate_source_fragment  # noqa: E402


def _make_fragment(
    text: str,
    status: str = "TEXT_LAYER",
    *,
    work_id: str = "WORK_TEST",
    edition_id: str = "ED_TEST_2026",
    witness_id: str = "WITNESS_MAIN",
    node_id: str = "FRAG-001",
    error_detail: str | None = None,
) -> dict:
    return {
        "document_id": edition_id,
        "node_id": node_id,
        "text": text,
        "page_refs": [{"pdf_page": 10, "printed_page": "4", "page_role": "WORK_TEXT"}],
        "source_hash": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "extraction_status": status,
        "work_id": work_id,
        "edition_id": edition_id,
        "witness_id": witness_id,
        "error_detail": error_detail,
    }


class TestSourceValidationStageC(unittest.TestCase):
    def test_schema_required_fields_present_and_serializable(self) -> None:
        schema = json.loads(
            (REPO_ROOT / "SOURCE_EVIDENCE_PACKAGE_SCHEMA.json").read_text(encoding="utf-8")
        )
        frag = _make_fragment("Synthetic verified verse line")
        pkg = validate_source_fragment(
            frag,
            source_class="PRIMARY_CANONICAL_TEXT",
            line_semantics="VERIFIED_VERSE_LINE",
            document_sha256="a" * 64,
        )
        self.assertIsInstance(pkg, SourceEvidencePackage)
        d = pkg.to_dict()
        for req_key in schema["required"]:
            self.assertIn(req_key, d)
        self.assertEqual(d["package_version"], "1.0.0")
        self.assertTrue(pkg.semantic_analysis_allowed)
        self.assertTrue(pkg.prosodic_analysis_allowed)
        self.assertEqual(pkg.blocking_reasons, [])
        # Round-trip JSON
        parsed = json.loads(pkg.to_json())
        self.assertEqual(parsed["witness_id"], "WITNESS_MAIN")

    def test_pdf_text_line_unclassified_blocks_prosody_only(self) -> None:
        frag = _make_fragment("Raw wrapped line one\nRaw wrapped line two", "TEXT_LAYER")
        pkg = validate_source_fragment(
            frag,
            source_class="PRIMARY_CANONICAL_TEXT",
            line_semantics="PDF_TEXT_LINE_UNCLASSIFIED",
        )
        self.assertTrue(pkg.semantic_analysis_allowed)
        self.assertFalse(pkg.prosodic_analysis_allowed)
        self.assertIn(
            "LINE_SEMANTICS_PDF_TEXT_LINE_UNCLASSIFIED_DISALLOWED_FOR_PROSODY",
            pkg.blocking_reasons,
        )

    def test_commentary_and_prose_block_prosody(self) -> None:
        comm = _make_fragment("Editorial commentary note about edition", "TEXT_LAYER")
        pkg_comm = validate_source_fragment(
            comm,
            source_class="EDITORIAL_COMMENTARY",
            line_semantics="VERIFIED_VERSE_LINE",
        )
        self.assertTrue(pkg_comm.semantic_analysis_allowed)
        self.assertFalse(pkg_comm.prosodic_analysis_allowed)

        prose = _make_fragment("Verified prose dialogue sentence", "TEXT_LAYER")
        pkg_prose = validate_source_fragment(
            prose,
            source_class="PRIMARY_CANONICAL_TEXT",
            line_semantics="VERIFIED_PROSE_BLOCK",
        )
        self.assertTrue(pkg_prose.semantic_analysis_allowed)
        self.assertFalse(pkg_prose.prosodic_analysis_allowed)

    def test_scanned_page_and_failed_block_both_permissions(self) -> None:
        scanned = _make_fragment("", "SCANNED_PAGE")
        pkg_scan = validate_source_fragment(scanned, source_class="PRIMARY_CANONICAL_TEXT")
        self.assertFalse(pkg_scan.semantic_analysis_allowed)
        self.assertFalse(pkg_scan.prosodic_analysis_allowed)
        self.assertEqual(pkg_scan.text, "")
        self.assertEqual(pkg_scan.line_semantics, "NONE")

        failed = _make_fragment("", "FAILED", error_detail="Corrupt XRef table")
        pkg_fail = validate_source_fragment(failed, source_class="PRIMARY_CANONICAL_TEXT")
        self.assertFalse(pkg_fail.semantic_analysis_allowed)
        self.assertFalse(pkg_fail.prosodic_analysis_allowed)
        self.assertEqual(pkg_fail.text, "")
        self.assertEqual(pkg_fail.line_semantics, "NONE")
        self.assertIn("EXTRACTION_FAILED: Corrupt XRef table", pkg_fail.blocking_reasons)

    def test_partial_allows_semantic_only_with_note(self) -> None:
        partial = _make_fragment("Partial fragment content", "PARTIAL")
        pkg = validate_source_fragment(
            partial,
            source_class="EARLY_REDACTION",
            line_semantics="VERIFIED_VERSE_LINE",
        )
        self.assertTrue(pkg.semantic_analysis_allowed)
        self.assertFalse(pkg.prosodic_analysis_allowed)
        self.assertIsNotNone(pkg.completeness_note)

    def test_provenance_and_hash_integrity_enforced(self) -> None:
        bad_work = _make_fragment("abc", work_id="")
        with self.assertRaises(ValueError):
            validate_source_fragment(bad_work)

        tampered = _make_fragment("original text")
        tampered["text"] = "modified text"
        with self.assertRaises(ValueError):
            validate_source_fragment(tampered)


if __name__ == "__main__":
    unittest.main(verbosity=2)
