"""Autonomous Stage C tests using a generated synthetic PDF (no external PDF, no Gemini API, 0 skips)."""
from __future__ import annotations

import hashlib
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

try:
    import pymupdf as fitz
except ImportError:  # pragma: no cover
    import fitz

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))
sys.path.insert(0, str(REPO_ROOT / "book_layer"))

from src.book_models import BookNode, PageReference, TextFragment  # noqa: E402
from src.book_nav_adapter import (  # noqa: E402
    BookNavAdapter,
    extract_source_lines,
    search_nodes,
    sha256_file,
)
from src.pipeline import SourceHandoffBlockedError, to_c1_input  # noqa: E402
from source_validation import SourceEvidencePackage, validate_source_fragment  # noqa: E402


def _create_synthetic_pdf(pdf_path: Path) -> None:
    """Create a 4-page synthetic PDF with zero real Pushkin text:
    - Page 1: synthetic title/cover text
    - Page 2: raster-only page (embedded 4x4 PNG pixmap, no text layer -> SCANNED_PAGE)
    - Page 3: synthetic Cyrillic+Latin lines (TEXT_LAYER)
    - Page 4: second synthetic text page (TEXT_LAYER)
    """
    doc = fitz.open()

    # Page 1: Cover metadata
    p1 = doc.new_page()
    p1.insert_text((72, 72), "SYNTHETIC TEST VOLUME V1\nCATALOGUE METADATA", fontsize=12)

    # Page 2: Raster image only -> genuinely empty text layer (SCANNED_PAGE)
    p2 = doc.new_page()
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 16, 16), 0)
    pix.set_rect(pix.irect, (220, 210, 190))
    p2.insert_image(fitz.Rect(50, 50, 150, 150), pixmap=pix)

    # Page 3: Extractable text lines (not classified as verse lines)
    p3 = doc.new_page()
    p3.insert_text(
        (72, 72),
        "Synthetic line alpha one\nSynthetic line beta two\nKeywordMarker: ArchiveFixture",
        fontsize=12,
    )

    # Page 4: Secondary extractable page
    p4 = doc.new_page()
    p4.insert_text((72, 72), "Synthetic appendix page four", fontsize=12)

    doc.save(str(pdf_path))
    doc.close()


class TestSyntheticBookLayerStageC(unittest.TestCase):
    def setUp(self) -> None:
        self.tmpdir = tempfile.TemporaryDirectory()
        self.pdf_path = Path(self.tmpdir.name) / "synthetic_fixture.pdf"
        _create_synthetic_pdf(self.pdf_path)
        self.adapter = BookNavAdapter(
            str(self.pdf_path),
            "SYNTH-DOC-01",
            "Synthetic Test Volume",
            "Test Author",
            "Synthetic Edition 1",
            "Test Press",
            2026,
            work_id="WORK_SYNTH_01",
            edition_id="ED_SYNTH_01",
        )

    def tearDown(self) -> None:
        self.adapter.close()
        self.tmpdir.cleanup()

    def test_open_fingerprint_and_portable_path(self) -> None:
        doc = self.adapter.document
        self.assertEqual(doc.page_count, 4)
        self.assertEqual(len(doc.pdf_sha256), 64)
        self.assertEqual(doc.pdf_sha256, sha256_file(self.pdf_path))
        # Must store portable filename, never an absolute host/temp path
        self.assertEqual(doc.pdf_path, "synthetic_fixture.pdf")
        self.assertNotIn(self.tmpdir.name, doc.pdf_path)
        self.assertNotIn("/mnt/data", doc.pdf_path)

    def test_physical_vs_printed_pagination_and_text_fragment(self) -> None:
        frag = self.adapter.extract_page_fragment(
            3, printed_page="14", role="SYNTHETIC_TEXT", witness_id="WITNESS_SYNTH_A"
        )
        self.assertEqual(frag.extraction_status, "TEXT_LAYER")
        self.assertIn("Synthetic line alpha one", frag.text)
        self.assertEqual(frag.page_refs[0].pdf_page, 3)
        self.assertEqual(frag.page_refs[0].printed_page, "14")
        self.assertEqual(frag.page_refs[0].page_role, "SYNTHETIC_TEXT")
        expected_hash = hashlib.sha256(frag.text.encode("utf-8")).hexdigest()
        self.assertEqual(frag.source_hash, expected_hash)

        lines = extract_source_lines(frag)
        self.assertEqual(len(lines), 3)
        self.assertEqual(lines[0]["line_semantics"], "PDF_TEXT_LINE_UNCLASSIFIED")
        self.assertEqual(lines[0]["pdf_page"], 3)
        self.assertEqual(lines[0]["printed_page"], "14")

        c1 = to_c1_input(frag)
        self.assertEqual(c1.extraction_status, "TEXT_LAYER")
        self.assertEqual(c1.node_id, "SYNTH-DOC-01:PDF:3")
        self.assertEqual(c1.work_id, "WORK_SYNTH_01")
        self.assertEqual(c1.edition_id, "ED_SYNTH_01")
        self.assertEqual(c1.witness_id, "WITNESS_SYNTH_A")

    def test_scanned_page_rendering_and_blocking(self) -> None:
        scanned = self.adapter.extract_page_fragment(
            2, printed_page="2", role="SCANNED_PLATE", witness_id="WITNESS_SCAN"
        )
        self.assertEqual(scanned.extraction_status, "SCANNED_PAGE")
        self.assertEqual(scanned.text.strip(), "")
        self.assertEqual(extract_source_lines(scanned), [])

        with self.assertRaises(SourceHandoffBlockedError):
            to_c1_input(scanned)

        png_bytes = self.adapter.render_page(2, dpi=72)
        self.assertTrue(png_bytes.startswith(b"\x89PNG"))

        with self.assertRaises(ValueError):
            self.adapter.render_page(2, dpi=10)

        pkg = validate_source_fragment(scanned, source_class="SYNTHETIC_FIXTURE")
        self.assertIsInstance(pkg, SourceEvidencePackage)
        self.assertFalse(pkg.semantic_analysis_allowed)
        self.assertFalse(pkg.prosodic_analysis_allowed)
        self.assertIn("SCANNED_PAGE_REQUIRES_VERIFIED_OCR", pkg.blocking_reasons)

    def test_extract_range_and_search_nodes(self) -> None:
        frags = self.adapter.extract_range(2, 4, witness_id="WITNESS_SYNTH_RANGE")
        self.assertEqual(
            [f.extraction_status for f in frags],
            ["SCANNED_PAGE", "TEXT_LAYER", "TEXT_LAYER"],
        )
        nodes = [
            BookNode(
                "NODE-3",
                "CHAPTER",
                "Synthetic Chapter",
                None,
                1,
                frags[1].page_refs,
                frags[1].text,
                "TEXT_LAYER",
                frags[1].source_hash,
                witness_id="WITNESS_SYNTH_RANGE",
            ),
            BookNode(
                "NODE-2",
                "PART",
                "Scanned Plate",
                None,
                2,
                frags[0].page_refs,
                None,
                "SCANNED_PAGE",
                witness_id="WITNESS_SCAN",
            ),
        ]
        hits = search_nodes(nodes, "ArchiveFixture")
        self.assertEqual(len(hits), 1)
        self.assertEqual(hits[0][0].node_id, "NODE-3")

    def test_failed_extraction_handling_and_blocking(self) -> None:
        # Simulate closed PDF / unreadable stream failure via BookNavAdapter
        self.adapter.close()
        failed_frag = self.adapter.extract_page_fragment(
            3, witness_id="WITNESS_SYNTH_A", safe_on_error=True
        )
        self.assertEqual(failed_frag.extraction_status, "FAILED")
        self.assertEqual(failed_frag.text, "")
        self.assertIsNotNone(failed_frag.error_detail)
        self.assertEqual(extract_source_lines(failed_frag), [])

        with self.assertRaises(SourceHandoffBlockedError):
            to_c1_input(failed_frag)

        pkg = validate_source_fragment(failed_frag, source_class="SYNTHETIC_FIXTURE")
        self.assertFalse(pkg.semantic_analysis_allowed)
        self.assertFalse(pkg.prosodic_analysis_allowed)
        self.assertTrue(any(r.startswith("EXTRACTION_FAILED") for r in pkg.blocking_reasons))

    def test_partial_handling_and_unclassified_prosody_block(self) -> None:
        frag = self.adapter.extract_page_fragment(3, witness_id="WITNESS_SYNTH_A")
        # Default unclassified PDF lines: semantic allowed, prosodic STRICTLY disallowed
        pkg = validate_source_fragment(
            frag,
            source_class="SYNTHETIC_FIXTURE",
            line_semantics="PDF_TEXT_LINE_UNCLASSIFIED",
            document_sha256=self.adapter.document.pdf_sha256,
        )
        self.assertTrue(pkg.semantic_analysis_allowed)
        self.assertFalse(pkg.prosodic_analysis_allowed)
        self.assertIn(
            "LINE_SEMANTICS_PDF_TEXT_LINE_UNCLASSIFIED_DISALLOWED_FOR_PROSODY",
            pkg.blocking_reasons,
        )

        # PARTIAL fragment blocked in strict to_c1_input, allowed only when opt-in
        partial_frag = TextFragment(
            document_id=frag.document_id,
            node_id="SYNTH-DOC-01:PARTIAL:3",
            text=frag.text,
            page_refs=frag.page_refs,
            source_hash=frag.source_hash,
            extraction_status="PARTIAL",
            work_id="WORK_SYNTH_01",
            edition_id="ED_SYNTH_01",
            witness_id="WITNESS_SYNTH_A",
        )
        with self.assertRaises(SourceHandoffBlockedError):
            to_c1_input(partial_frag)

        c1_partial = to_c1_input(partial_frag, allow_partial=True)
        self.assertIn("PARTIAL", c1_partial.instruction)

        pkg_partial = validate_source_fragment(
            partial_frag,
            source_class="SYNTHETIC_FIXTURE",
            line_semantics="VERIFIED_VERSE_LINE",
        )
        self.assertTrue(pkg_partial.semantic_analysis_allowed)
        self.assertFalse(pkg_partial.prosodic_analysis_allowed)
        self.assertIn("PARTIAL_COVERAGE_DISALLOWED_FOR_PROSODY", pkg_partial.blocking_reasons)

    def test_manifest_json_has_no_hardcoded_mnt_data_paths(self) -> None:
        manifest_path = REPO_ROOT / "book_layer" / "data" / "boris_godunov_2008_manifest.json"
        raw = manifest_path.read_text(encoding="utf-8")
        self.assertNotIn("/mnt/data", raw)
        manifest = json.loads(raw)
        self.assertEqual(manifest["source_document"]["page_count"], 577)
        self.assertEqual(
            manifest["source_document"]["pdf_path"],
            "pushkin_vyp2_boris_godunov_2008.pdf",
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
