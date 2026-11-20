# STAGE_C_IMPLEMENTATION_REPORT — Отчёт о реализации Этапа C

**Дата завершения Этапа C:** 2026-11-20  
**Статус этапа:** `IMPLEMENTED` + `VERIFIED` (ожидает независимой проверки пользователем перед переходом к Этапу D)  
**Ключевые маркеры:** `VERIFIED` · `IMPLEMENTED` · `TESTED` · `NOT_VERIFIED` · `PLANNED`

---

## 1. Контрольные точки C1–C5 (Хронология и результаты)

| Контрольная точка | Что выполнено | Статус | Проблемы и отклонения от плана |
| :--- | :--- | :--- | :--- |
| **C1. Подготовка и фиксация** | Зафиксированы SHA-256 контрольные суммы `App.tsx`, `geminiService.ts`, `visualLibraryService.ts`, `cli.ts`, `SKILL.md`, `package.json`, `vite.config.ts`. Подтверждено отсутствие `.git` в контейнере и отсутствие системного `pip`/`ensurepip` в `Python 3.11.2`. Создано изолированное окружение `book_layer/.venv` и установлен `PyMuPDF 2.1` (`fitz`). | `VERIFIED` | Системный `pip` отсутствовал -> применён `python3 -m venv --without-pip` + `get-pip.py` внутрь `book_layer/.venv` (исключён в `.gitignore`). |
| **C2. Интеграция книжного слоя (`/book_layer`)** | Развёрнут `PushkinBookLayer 0.1` в `/book_layer` с сохранением исходного бандла `/public/assets/aistudio/PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md` и оригинальных `docs/*`. Устранён жёсткий путь `/mnt/data/...` в `boris_godunov_2008_manifest.json` и `build_boris_manifest.py`. Добавлена обработка `FAILED` (`make_failed_fragment`, `safe_on_error`), защита `extract_source_lines()` от `SCANNED_PAGE`/`FAILED`, блокировка `SCANNED_PAGE`/`FAILED`/`PARTIAL` в `pipeline.to_c1_input()` (`SourceHandoffBlockedError`). | `IMPLEMENTED`, `TESTED` | Использован рекомендуемый импорт `import pymupdf as fitz` с fallback на `fitz`, чтобы убрать `FutureWarning` в `PyMuPDF 2.1`. |
| **C3. Source Validation (`/source_validation`)** | Создан независимый пакет `/source_validation` с frozen dataclass `SourceEvidencePackage` и детерминированным валидатором `validate_source_fragment()`, полностью соответствующим `SOURCE_EVIDENCE_PACKAGE_SCHEMA.json`. Разделены `semantic_analysis_allowed` и `prosodic_analysis_allowed`. | `IMPLEMENTED`, `TESTED` | Без отклонений. Фиктивные заглушки `C1`, `C8`, `M8` и Node/Express-мост **не создавались**. |
| **C4. Автономные защитные тесты** | Реализованы `book_layer/tests/test_synthetic_book.py` (7 тестов на динамически генерируемом 4-страничном синтетическом PDF без пушкинского текста) и `source_validation/tests/test_source_validation.py` (6 тестов контракта и прав). | `TESTED` (`13/13` passed, `0 skipped`) | Опциональный оригинальный `book_layer/tests/test_adapter.py` сохранён и при отсутствии `BORIS_PDF` честно пропускает свои 5 тестов (`NOT_VERIFIED` без реального файла). |
| **C5. Регрессионная проверка старого приложения** | Проверены SHA-256 всех 7 защищённых файлов (100% совпадение с C1), пройдены `npx tsc --noEmit`, `compile_applet` и `python3 test_cli_agent_call.py` (`4/4`). | `VERIFIED` | При первом параллельном запуске `compile_applet` и `tsc` одновременно `tsc` поймал временную очистку `dist/assets/`; при последовательном запуске `npx tsc --noEmit` завершился с кодом `0`. |

---

## 2. Проверка соблюдения жёстких ограничений

- **BOOK-NAV Classic V6 Frozen Core:** `VERIFIED` — не затронут.
- **`services/geminiService.ts -> transformText()`:** `VERIFIED` — SHA-256 `a17b72db...` не изменился.
- **`Visual Library V1` (`services/visualLibraryService.ts`, `data/visual-library/*`, 19 PNG):** `VERIFIED` — не изменялся.
- **`agent-interface/cli.ts` и `SKILL.md`:** `VERIFIED` — SHA-256 не изменились, `4/4` CLI-тестов пройдены.
- **Запрещённые сущности (`C1`, `C8`, `M8`, Node/Express-мост, массовый OCR):** `VERIFIED` — не создавались.

---

## 3. Что остаётся за границами Этапа C (`NOT_VERIFIED` / `PLANNED`)

- `NOT_VERIFIED`: прогон `book_layer/tests/test_adapter.py` на реальном файле `pushkin_vyp2_boris_godunov_2008.pdf` (файл отсутствует в среде); живой вызов Gemini API (отсутствует `GEMINI_API_KEY`).
- `PLANNED`: Этап D (проверенный корпус и драматургический/лирический сегментатор `C1`), Этап E (просодический исследовательский стенд `C6a/C6b`), Этап F (поэтические профили), Этап G (интеграция и генерация `C8` + серверный ключ).
