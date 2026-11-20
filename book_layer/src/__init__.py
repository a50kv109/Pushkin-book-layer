"""PushkinBookLayer: source-grounded literary PDF ingestion (origin: PushkinBookLayer 0.1)."""

from .book_models import (
    BookNode,
    ExtractionStatus,
    NodeKind,
    PageReference,
    SourceDocument,
    TextFragment,
)
from .book_nav_adapter import (
    BookNavAdapter,
    build_boris_godunov_manifest,
    extract_source_lines,
    search_nodes,
    sha256_file,
)
from .pipeline import C1Input, SourceHandoffBlockedError, to_c1_input

__all__ = [
    "BookNavAdapter",
    "BookNode",
    "C1Input",
    "ExtractionStatus",
    "NodeKind",
    "PageReference",
    "SourceDocument",
    "SourceHandoffBlockedError",
    "TextFragment",
    "build_boris_godunov_manifest",
    "extract_source_lines",
    "search_nodes",
    "sha256_file",
    "to_c1_input",
]
