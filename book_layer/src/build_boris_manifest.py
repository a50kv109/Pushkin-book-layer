"""Emit a compact, portable structural manifest for the supplied Boris Godunov PDF.

Origin: PushkinBookLayer 0.1 (`src/build_boris_manifest.py`), updated to store
portable filenames (`Path(pdf).name`) instead of hardcoded host paths (/mnt/data/...).
"""
from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from pathlib import Path

from .book_nav_adapter import BookNavAdapter, build_boris_godunov_manifest


def build_manifest_dict(
    pdf_path: str | Path,
    *,
    document_id: str = "PUSHKIN-BG-2008",
    source_ref: str | None = None,
) -> dict:
    path = Path(pdf_path)
    with BookNavAdapter(
        str(path),
        document_id,
        "Борис Годунов",
        "А.С. Пушкин",
        "Комментированное издание, выпуск 2",
        "Новое издательство",
        2008,
        work_id="PUSHKIN_BORIS_GODUNOV",
        edition_id="PUSHKIN-BG-2008",
        source_ref=source_ref or path.name,
    ) as nav:
        nodes = build_boris_godunov_manifest(nav)
        data = {"source_document": asdict(nav.document), "nodes": []}
        for n in nodes:
            d = asdict(n)
            d["page_refs"] = [asdict(p) for p in n.page_refs]
            # Keep large text out of the compact manifest; source text can be read by page on demand.
            if d.get("text"):
                d["indexed_text_chars"] = len(d["text"])
                d["text"] = None
            data["nodes"].append(d)
        return data


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("--out", default="book_layer/data/boris_godunov_2008_manifest.json")
    ap.add_argument("--source-ref", default=None)
    a = ap.parse_args()

    data = build_manifest_dict(a.pdf, source_ref=a.source_ref)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
