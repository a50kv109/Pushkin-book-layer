# Visual Assets Notice (`public/assets/aistudio`)

The 19 AI-generated reference PNG images used during local UI development of **Visual & Narrative Reference Library V1** are **intentionally excluded** from the public `v0.1.0-alpha` GitHub release pending explicit third-party media redistribution clearance under open-source licensing.

- All structured anchor metadata (`data/visual-library/visual-anchors.json`) and narrative patterns (`data/visual-library/narrative-patterns.json`) remain included in the repository.
- When the PNG files are absent on a clean checkout, the Visual Library UI automatically falls back to card titles and text metadata (`VisualLibraryView.tsx` and `AnchorDetailModal.tsx` handle missing image files cleanly without runtime errors), and users can add custom image anchors in browser `localStorage`.
- Internal session audit PDFs/draft bundles have also been removed from this directory before publication.
