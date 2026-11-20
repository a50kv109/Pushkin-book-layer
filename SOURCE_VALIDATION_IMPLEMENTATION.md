# SOURCE_VALIDATION_IMPLEMENTATION — Реализация пакета /source_validation

**Статус:** `IMPLEMENTED`, `TESTED`, `VERIFIED`  
**Схема контракта:** `SOURCE_EVIDENCE_PACKAGE_SCHEMA.json` (`package_version = "1.0.0"`)

---

## 1. Назначение и независимость пакета

Пакет `/source_validation` изолирован от `/book_layer` и от библиотек парсинга PDF (`PyMuPDF`). Он принимает любой объект `TextFragment` (или совместимый словарь) и преобразует его в иммутабельный пакет доказательств `SourceEvidencePackage`, пригодный для будущего приёма модулями `C1` и `M8`.

---

## 2. Гарантии контракта `SourceEvidencePackage`

### Обязательные поля (`VERIFIED` по тестам схемы)
- `package_version`: `"1.0.0"`
- `work_id`, `edition_id`, `witness_id`, `fragment_id` — непустые строки происхождения;
- `page_ref` — непустой список `{ pdf_page, printed_page, page_role }` с `pdf_page >= 1`;
- `source_hash` — 64-символьный hex SHA-256, сверяемый с фактическим `text` при непустом тексте;
- `document_sha256`, `completeness_note` — дополнительные поля трассировки;
- `extraction_status`: `"TEXT_LAYER" | "SCANNED_PAGE" | "PARTIAL" | "FAILED"`;
- `line_semantics`: `"PDF_TEXT_LINE_UNCLASSIFIED" | "VERIFIED_VERSE_LINE" | "VERIFIED_PROSE_BLOCK" | "MIXED_UNVERIFIED" | "NONE"`;
- `source_class`: `"PRIMARY_CANONICAL_TEXT" | "EARLY_REDACTION" | "AUTHORIAL_DRAFT" | "EDITORIAL_COMMENTARY" | "INDEX_OR_METADATA" | "SYNTHETIC_FIXTURE"`;
- `text` — исходный текст (принудительно `""` для `SCANNED_PAGE` и `FAILED`);
- `semantic_analysis_allowed`: `bool`;
- `prosodic_analysis_allowed`: `bool`;
- `blocking_reasons`: `list[str]`.

---

## 3. Матрица программных правил (`TESTED`)

| Входное состояние | `semantic_analysis_allowed` | `prosodic_analysis_allowed` | `blocking_reasons` |
| :--- | :---: | :---: | :--- |
| `FAILED` | `False` | `False` | `["EXTRACTION_FAILED: ..."]` |
| `SCANNED_PAGE` (`ocr_verified=False`) | `False` | `False` | `["SCANNED_PAGE_REQUIRES_VERIFIED_OCR"]` |
| Пустой текст (`""` / пробелы) | `False` | `False` | `["EMPTY_SOURCE_TEXT"]` |
| `TEXT_LAYER` + `PDF_TEXT_LINE_UNCLASSIFIED` | `True` | `False` | `["LINE_SEMANTICS_PDF_TEXT_LINE_UNCLASSIFIED_DISALLOWED_FOR_PROSODY"]` |
| `TEXT_LAYER` + `EDITORIAL_COMMENTARY` | `True` | `False` | `["SOURCE_CLASS_EDITORIAL_COMMENTARY_DISALLOWED_FOR_PROSODY", ...]` |
| `TEXT_LAYER` + `VERIFIED_PROSE_BLOCK` | `True` | `False` | `["LINE_SEMANTICS_VERIFIED_PROSE_BLOCK_DISALLOWED_FOR_PROSODY"]` |
| `PARTIAL` (непустой текст) | `True` | `False` | `["PARTIAL_COVERAGE_DISALLOWED_FOR_PROSODY", ...]` |
| `TEXT_LAYER` + `PRIMARY_CANONICAL_TEXT` / `EARLY_REDACTION` / `AUTHORIAL_DRAFT` / `SYNTHETIC_FIXTURE` + `VERIFIED_VERSE_LINE` | `True` | `True` | `[]` |

При отсутствии любого обязательного поля provenance (`work_id`, `edition_id`, `witness_id`, `fragment_id`, `page_ref`) или несовпадении `source_hash` выбрасывается `ValueError` — потеря или подмена происхождения невозможны.
