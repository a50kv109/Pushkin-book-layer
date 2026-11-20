# Source audit: Pushkin, Boris Godunov, commented edition (2008)

## Bibliographic identity visible in the PDF

- A.S. Pushkin, *Сочинения: Комментированное издание*, под общей редакцией Дэвида М. Бетеа, выпуск 2: *Борис Годунов*.
- Москва: Новое издательство, 2008.
- ISBN 978-5-98379-107-7.
- Catalog description states that the book reproduces the lifetime 1831 edition of the tragedy, accompanied by historical-literary commentary.
- Physical PDF size in this test: 577 pages.

## Crucial distinction

The principal facsimile begins around PDF page 12 (the printed text pagination begins at 1) and continues through the main tragedy. It is image/scanned content: the local PDF text extractor returned no text for representative main-play pages. PDF pages 74–75 contain a Pushkin House electronic-library watermark/footer, not play text. Thus a text-layer-only import cannot produce a complete main-play corpus.

Appendix I begins at PDF page 158 and is digitally text-extractable. It is headed «Комедия о царе Борисе и о Гришке Отрепьеве» and is a distinct, earlier redaction/witness. It is not interchangeable with the 1831 main text. It can serve as an initial integration fixture for text extraction, speaker/scene segmentation and provenance.

## Visible dramatic/structural content

The scanned main text opens with scene headings including «Кремлевские палаты» and dialogue between князья Шуйский и Воротынский (visible in the early pages of the facsimile). Later the work contains scenes such as «Ночь. Келья в Чудовом монастыре», «Корчма на Литовской границе», etc. These are scene headings, not numbered lyric stanzas. The dramatic text is in verse but includes dialogue and stage directions; line/verse boundaries must be retained separately from speaker turns and stage directions.

Appendix I searchable text provides a concrete test passage on PDF pages 158–159, beginning:

> Наряжены мы вместе город ведать,
> Но, кажется, нам не за кем смотреть:
> Москва пуста; вослед за патриархом
> К монастырю пошел и весь народ.

Physical source for this text: PDF page 158, Appendix I, opening scene «Кремлевские палаты». This is an initial extraction fixture, not evidence of completed full-text extraction for the main edition.

## Verified limitations

1. Whole main-play scan has no usable embedded text layer in tested representative pages.
2. Automatic OCR, line detection, speaker attribution and stage-direction parsing are not implemented here.
3. Commentary is not yet indexed separately from the main text; edition-level structure must distinguish text, commentary, notes, introduction and appendices.
4. No meter/rhyme/stress/style analysis was performed by this ingestion adapter.
5. A full production corpus requires page-by-page OCR with human verification or a verified accessible digital text edition, with page-aligned provenance back to this PDF.
