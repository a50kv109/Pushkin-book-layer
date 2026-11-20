"""Independent Source Validation & SourceEvidencePackage contract (Stage C).

Produces provenance-complete SourceEvidencePackage objects compatible with
future C1 and M8 modules without creating stub implementations of C1 or M8.
"""

from .models import (
    ExtractionStatus,
    LineSemantics,
    PageRefRecord,
    SourceClass,
    SourceEvidencePackage,
)
from .validator import validate_source_fragment

__all__ = [
    "ExtractionStatus",
    "LineSemantics",
    "PageRefRecord",
    "SourceClass",
    "SourceEvidencePackage",
    "validate_source_fragment",
]
