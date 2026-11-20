# STAGE_C_TEST_REPORT — Отчёт о тестировании Этапа C

**Дата прогона:** 2026-11-20  
**Исполнительная среда:** Python `3.11.2` (`book_layer/.venv` с `PyMuPDF 2.1`), Node `22.23.2`, TypeScript `~5.8.2`, Vite `6.2.0`

---

## 1. Автономные тесты Python Stage C (`VERIFIED` + `TESTED`, `0 skipped`)

**Команда:**
```bash
book_layer/.venv/bin/python -m unittest -v book_layer/tests/test_synthetic_book.py source_validation/tests/test_source_validation.py
```
**Результат:** `Ran 13 tests in 0.117s — OK` (`13/13 passed`, `0 failed`, `0 skipped`).

### Покрытие по сценариям:
1. **Синтетический PDF (`book_layer/tests/test_synthetic_book.py` — `7/7 passed`):**
   - `test_open_fingerprint_and_portable_path`: открытие 4-страничного синтетического PDF, SHA-256 (64 символа), проверка отсутствия хостовых путей и `/mnt/data` в `SourceDocument.pdf_path`.
   - `test_physical_vs_printed_pagination_and_text_fragment`: разделение `pdf_page=3` и `printed_page="14"`, `TextFragment`, `extract_source_lines()` (`PDF_TEXT_LINE_UNCLASSIFIED`), передача в `to_c1_input()` с полным provenance.
   - `test_scanned_page_rendering_and_blocking`: растровый скан стр. 2 -> статус `SCANNED_PAGE`, PNG-рендер (`\x89PNG`), `ValueError` на недопустимом DPI, `extract_source_lines() == []`, блокировка в `to_c1_input()` (`SourceHandoffBlockedError`), блокировка обоих флагов в `SourceEvidencePackage`.
   - `test_extract_range_and_search_nodes`: `extract_range(2, 4)` (`["SCANNED_PAGE", "TEXT_LAYER", "TEXT_LAYER"]`) и `search_nodes()`.
   - `test_failed_extraction_handling_and_blocking`: обработка сбоя чтения (`FAILED`), `error_detail`, пустые строки, `SourceHandoffBlockedError` и блокировка обоих флагов в `SourceEvidencePackage`.
   - `test_partial_handling_and_unclassified_prosody_block`: запрет `prosodic_analysis_allowed` для `PDF_TEXT_LINE_UNCLASSIFIED` и `PARTIAL`; явный режим `allow_partial=True` в `to_c1_input()`.
   - `test_manifest_json_has_no_hardcoded_mnt_data_paths`: проверка переносимости `book_layer/data/boris_godunov_2008_manifest.json` (`page_count=577`, `pdf_path="pushkin_vyp2_boris_godunov_2008.pdf"`, 0 вхождений `/mnt/data`).

2. **Шлюз валидации (`source_validation/tests/test_source_validation.py` — `6/6 passed`):**
   - `test_schema_required_fields_present_and_serializable`: сверка всех required-полей из `SOURCE_EVIDENCE_PACKAGE_SCHEMA.json` и JSON round-trip.
   - `test_pdf_text_line_unclassified_blocks_prosody_only`: `semantic_analysis_allowed=True`, `prosodic_analysis_allowed=False`.
   - `test_commentary_and_prose_block_prosody`: запрет просодии для `EDITORIAL_COMMENTARY` и `VERIFIED_PROSE_BLOCK`.
   - `test_scanned_page_and_failed_block_both_permissions`: блокировка обоих разрешений для `SCANNED_PAGE` и `FAILED`.
   - `test_partial_allows_semantic_only_with_note`: `PARTIAL` допускает только семантику с `completeness_note`.
   - `test_provenance_and_hash_integrity_enforced`: `ValueError` при потере provenance или несовпадении `source_hash`.

---

## 2. Опциональный внешний тест (`NOT_VERIFIED` без файла `BORIS_PDF`)

**Команда:** `book_layer/.venv/bin/python -m unittest -v book_layer/tests/test_adapter.py`  
**Результат:** `Ran 5 tests — OK (skipped=5)` с причиной `'set BORIS_PDF to the supplied PDF'`.  
**Статус:** `NOT_VERIFIED` (оригинальный тест сохранён как опциональный для запуска пользователем при наличии внешнего PDF «Бориса Годунова»).

---

## 3. Регрессионные проверки старого приложения (`VERIFIED`)

| Проверка | Команда | Результат | Сравнение с контрольной точкой C1 |
| :--- | :--- | :--- | :--- |
| Контроль целостности защищённых файлов | `sha256sum App.tsx services/* agent-interface/cli.ts SKILL.md package.json vite.config.ts` | `7/7` совпадений байт-в-байт | Без изменений |
| TypeScript | `npx tsc --noEmit` | Exit code `0` | Идентично |
| Сборка Vite | `compile_applet` | `Build succeeded` | Идентично |
| Внешний агентный CLI | `python3 test_cli_agent_call.py` | `4/4` PASSED | Идентично |
| Живой сетевой вызов Gemini API | — | Не запускался (`GEMINI_API_KEY` не задан) | `NOT_VERIFIED` (как и на C1) |
