# STAGE_C_FILE_CHANGELOG — Журнал изменённых и добавленных файлов Этапа C

**Дата:** 2026-11-20

---

## 1. Добавленные файлы (`book_layer/` — адаптация `PushkinBookLayer 0.1`)

| Файл | Назначение и отличие от исходника 0.1 |
| :--- | :--- |
| `/book_layer/pyproject.toml` | Описание Python-пакета (`>=3.10`, `PyMuPDF>=1.24`). |
| `/book_layer/README.md` | Инструкция по `.venv` и запуску автономных синтетических и опциональных PDF-тестов. |
| `/book_layer/src/__init__.py` | Экспорт публичного API `book_layer`. |
| `/book_layer/src/book_models.py` | Сохранены все dataclasses 0.1; расширен `NodeKind` и добавлены опциональные поля `work_id`, `edition_id`, `witness_id`, `error_detail` без ломки совместимости. |
| `/book_layer/src/book_nav_adapter.py` | Переносимый `source_ref` вместо абсолютных путей, безопасный импорт `pymupdf`, обработка `FAILED` (`make_failed_fragment`, `safe_on_error`), защита `extract_source_lines()` от `SCANNED_PAGE`/`FAILED`. |
| `/book_layer/src/build_boris_manifest.py` | Сериализует переносимое имя файла в `pdf_path` без `/mnt/data/...`. |
| `/book_layer/src/pipeline.py` | Добавлено исключение `SourceHandoffBlockedError`; `to_c1_input()` блокирует `SCANNED_PAGE`, `FAILED`, `PARTIAL` (без `allow_partial=True`) и пустой текст, сохраняя `node_id` и контекст. |
| `/book_layer/data/boris_godunov_2008_manifest.json` | Переносимый манифест без `/mnt/data/` (`pdf_path: "pushkin_vyp2_boris_godunov_2008.pdf"`). |
| `/book_layer/docs/ARCHITECTURE.md`, `BORIS_GODUNOV_2008_AUDIT.md`, `BORIS_GODUNOV_POETICS_NOTES.md`, `INTEGRATION_CONTRACT.md` | Оригинальная документация `PushkinBookLayer 0.1` сохранена без искажений. |
| `/book_layer/tests/test_adapter.py` | Оригинальные 5 тестов для внешнего `BORIS_PDF`. |
| `/book_layer/tests/test_synthetic_book.py` | **Новый** автономный набор из 7 тестов на динамическом синтетическом PDF (`0 skipped`). |

## 2. Добавленные файлы (`source_validation/`)

| Файл | Назначение |
| :--- | :--- |
| `/source_validation/__init__.py` | Публичный интерфейс пакета валидации. |
| `/source_validation/models.py` | Frozen dataclass `SourceEvidencePackage` и перечисление `SourceClass` / `LineSemantics`. |
| `/source_validation/validator.py` | Детерминированный валидатор `validate_source_fragment()` с раздельными `semantic_analysis_allowed` и `prosodic_analysis_allowed`. |
| `/source_validation/tests/test_source_validation.py` | 6 автономных тестов контракта `SourceEvidencePackage` и всех правил маршрутизации. |

## 3. Обновлённые служебные файлы и отчёты

| Файл | Изменение |
| :--- | :--- |
| `/.gitignore` | Добавлены `.venv/`, `book_layer/.venv/`, `__pycache__/`, `*.py[cod]`, `.pytest_cache/`. |
| `/STAGE_C_IMPLEMENTATION_REPORT.md` | Итоговый отчёт о прохождении контрольных точек C1–C5. |
| `/SOURCE_VALIDATION_IMPLEMENTATION.md` | Описание контракта `SourceEvidencePackage` и матрицы разрешений. |
| `/STAGE_C_TEST_REPORT.md` | Результаты прогона `13/13` автономных тестов и регрессионных проверок. |
| `/STAGE_C_FILE_CHANGELOG.md` | Настоящий реестр изменений. |
| `/PROJECT_STATUS.md` | Актуализированная матрица статусов проекта. |

## 4. Неизменённые (защищённые) файлы (`VERIFIED` по SHA-256)

- `App.tsx`, `services/geminiService.ts`, `services/visualLibraryService.ts`, `agent-interface/cli.ts`, `SKILL.md`, `package.json`, `vite.config.ts`, `components/*`, `data/visual-library/*`, `public/assets/aistudio/PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md`.
