# STAGE_C_ACCEPTANCE_CRITERIA — Критерии приёмки Этапа C

**Утверждаемый принцип:** Этап C считается завершённым только при 100% автономной проверяемости без внешнего PDF «Бориса Годунова», без Gemini API, без Node/Express-прокси и без единого пропущенного (`skip`) обязательного теста.

---

## Обязательный чек-лист приёмки (8 критериев)

| # | Критерий | Способ проверки | Порог прохождения |
| :-: | :--- | :--- | :--- |
| **AC-1** | **Развёртывание `PushkinBookLayer` в `/book_layer`** с сохранением исходных контрактов (`SourceDocument`, `PageReference`, `BookNode`, `TextFragment`, `BookNavAdapter`) и разделением свидетелей. | Инспекция структуры файлов и импортов `book_layer.src.*`. | Все 13 исходных файлов/модулей адаптированы с явным сохранением авторства/происхождения. |
| **AC-2** | **Отсутствие жёстких локальных путей** (`/mnt/data/...`) в `boris_godunov_2008_manifest.json` и `build_boris_manifest.py`. | `grep` по `/mnt/data` и тест `build_boris_manifest.py` на синтетическом PDF. | 0 жёстких локальных путей в сериализуемых артефактах. |
| **AC-3** | **Обработка `FAILED`, `SCANNED_PAGE` и `PARTIAL`:** ошибки открытия/чтения/рендера фиксируются как `FAILED`; сканы и сбои не допускаются в передачу текста. | Автономные unit-тесты на повреждённом/несуществующем вводе и скан-странице. | 100% детерминированная обработка без неконтролируемого проброса пустых сканов. |
| **AC-4** | **Контракт `SourceEvidencePackage` в `/source_validation`** включает все обязательные поля (`work_id`, `edition_id`, `witness_id`, `page_ref`, `fragment_id`, `source_hash`, `extraction_status`, `text`, `source_class`, `semantic_analysis_allowed`, `prosodic_analysis_allowed`). | Валидация выходного JSON против `SOURCE_EVIDENCE_PACKAGE_SCHEMA.json` в тестах. | Строгое соответствие схеме; **отсутствуют** фиктивные заглушки модулей `C1` или `M8`. |
| **AC-5** | **Защита двух разрешений (`semantic_analysis_allowed` vs `prosodic_analysis_allowed`):** | Unit-тесты всех комбинаций таблицы маршрутизации (`TEXT_LAYER` + `PDF_TEXT_LINE_UNCLASSIFIED`, `PARTIAL`, `SCANNED_PAGE`, `FAILED`, `EDITORIAL_COMMENTARY`, `VERIFIED_VERSE_LINE`). | `PDF_TEXT_LINE_UNCLASSIFIED` **всегда** получает `prosodic_analysis_allowed == False`; `SCANNED_PAGE`/`FAILED` **всегда** получают `False` по обоим флагам. |
| **AC-6** | **Автономный синтетический PDF и 5+1 сценариев без `skip`:** | Генерация синтетического многостраничного PDF (с текстом, пустой скан-страницей, метаданными) и прогон всех 5 исходных сценариев `test_adapter.py` + тестов защитных гейтов. | `python3 -m unittest discover` в автономном наборе: **0 skipped, 0 failed, 100% passed**. (Внешний `BORIS_PDF`-тест остаётся отдельным опциональным прогоном). |
| **AC-7** | **Установка/проверка `PyMuPDF` (`fitz`) воспроизводима** в среде Python `>=3.10`. | `python3 -c "import fitz"` и `pyproject.toml`. | Зависимость воспроизводима или задокументирован точный статус установки в контейнере. |
| **AC-8** | **Нулевая регрессия существующего приложения:** | `npx tsc --noEmit`, `compile_applet`, `python3 test_cli_agent_call.py` (`4/4`), diff-проверка `services/geminiService.ts`, `App.tsx`, `Visual Library V1`, `SKILL.md`. | 0 изменений в `transformText()`, UI, CLI и Visual Library; все базовые проверки пройдены. |
