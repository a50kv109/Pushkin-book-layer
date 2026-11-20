import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.book_nav_adapter import (  # noqa: E402
    BookNavAdapter,
    build_boris_godunov_manifest,
    extract_source_lines,
    search_nodes,
)
from src.pipeline import to_c1_input  # noqa: E402

PDF = os.environ.get("BORIS_PDF", "")


@unittest.skipUnless(PDF and os.path.exists(PDF), "set BORIS_PDF to the supplied PDF")
class TestBorisBookAdapter(unittest.TestCase):
    def setUp(self):
        self.a = BookNavAdapter(
            PDF,
            "PUSHKIN-BG-2008",
            "Борис Годунов",
            "А.С. Пушкин",
            "Комментированное издание, выпуск 2",
            "Новое издательство",
            2008,
        )

    def tearDown(self):
        self.a.close()

    def test_document_fingerprint_and_page_count(self):
        self.assertEqual(self.a.document.page_count, 577)
        self.assertEqual(len(self.a.document.pdf_sha256), 64)

    def test_scan_detection(self):
        self.assertEqual(self.a.extract_page_fragment(20).extraction_status, "SCANNED_PAGE")

    def test_appendix_text_and_source_handoff(self):
        nodes = build_boris_godunov_manifest(self.a)
        app = next(n for n in nodes if n.node_id == "BG-APP-I")
        self.assertIn("Наряжены мы вместе город ведать", app.text)
        self.assertEqual(app.page_refs[-1].pdf_page, 248)
        f = self.a.extract_page_fragment(158, role="APPENDIX_I_TEXT")
        c1 = to_c1_input(f)
        self.assertEqual(c1.extraction_status, "TEXT_LAYER")
        self.assertIn("Комедия о царе Борисе", c1.source_text)
        lines = extract_source_lines(f)
        self.assertTrue(lines)
        self.assertEqual(lines[0]["line_semantics"], "PDF_TEXT_LINE_UNCLASSIFIED")

    def test_search(self):
        nodes = build_boris_godunov_manifest(self.a)
        self.assertEqual(search_nodes(nodes, "Отрепьев")[0][0].node_id, "BG-APP-I")
        self.assertTrue(any(n.node_id == "BG-COMMENTARY" for n in nodes))
        self.assertTrue(any(n.node_id == "BG-APP-II" for n in nodes))

    def test_render_page(self):
        self.assertTrue(self.a.render_page(20, 72).startswith(b"\x89PNG"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
