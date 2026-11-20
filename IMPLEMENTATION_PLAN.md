# IMPLEMENTATION_PLAN — Актуализированный план реализации (Stages A–H)

**Статус плана:** `STAGE A–B VERIFIED` · `STAGE C CONDITIONALLY APPROVED (AWAITING FINAL SIGN-OFF TO WRITE CODE)`  
**Обновлён:** 2026-11-20 (синхронизирован с замечаниями пользователя и `BOOK_LAYER_STAGE_C_DESIGN.md`)

---

## Принятые корректировки до начала Этапа C

1. **Никаких фиктивных `C1` и `M8`:** вместо заглушек создаётся независимый пакет `/source_validation` и контракт `SourceEvidencePackage` (`SOURCE_EVIDENCE_PACKAGE_SCHEMA.json`), готовый к приёму будущими `C1` и `M8`.
2. **Два независимых разрешения анализа:** `semantic_analysis_allowed` и `prosodic_analysis_allowed`. Строки `PDF_TEXT_LINE_UNCLASSIFIED` **не допускаются** в просодию (`prosodic_analysis_allowed == False`), а `SCANNED_PAGE` и `FAILED` блокируются по обоим направлениям.
3. **Без преждевременного межпроцессного моста:** в Этапе C **не создаётся** Node/Express-прокси и Python-воркер. Сначала создаётся и доказывается автономный Python-пакет с тестами на синтетическом PDF. Перенос `GEMINI_API_KEY` с клиента на сервер зафиксирован как обязательное требование Stage G (или любого последующего изменения браузерного клиента).

---

## Этап C: Autonomous Book Layer & Source Validation (Детализация)

### Целевые файлы (только новые каталоги `book_layer/` и `source_validation/`):
1. `/book_layer/pyproject.toml` — конфигурация пакета (`requires-python >= 3.10`, `PyMuPDF>=1.24`).
2. `/book_layer/src/__init__.py`, `/book_layer/src/book_models.py` — сохранение `SourceDocument`, `PageReference`, `BookNode`, `TextFragment`, `NodeKind`, `ExtractionStatus` (плюс поддержка `source_class` без ломки конструкторов v0.1).
3. `/book_layer/src/book_nav_adapter.py` — перенос из `PushkinBookLayer 0.1` + явная обработка исключений со статусом `FAILED`, устранение утечки локальных путей.
4. `/book_layer/src/build_boris_manifest.py` & `/book_layer/data/boris_godunov_2008_manifest.json` — переносимая сериализация `pdf_path` без `/mnt/data/...`.
5. `/book_layer/src/pipeline.py` — `extract_source_lines()` + усиленный `to_c1_input()`, блокирующий передачу `SCANNED_PAGE` и `FAILED`.
6. `/book_layer/docs/*` — перенос оригинальной документации `PushkinBookLayer 0.1`.
7. `/book_layer/tests/test_adapter.py` + `/book_layer/tests/test_synthetic_book.py` — оригинальные `BORIS_PDF`-тесты + обязательный автономный набор на синтетическом PDF (5 исходных сценариев + граничные ошибки `FAILED`/`SCANNED_PAGE`/`PARTIAL`, **0 `skip`**).
8. `/source_validation/__init__.py`, `/source_validation/models.py`, `/source_validation/validator.py`, `/source_validation/tests/test_source_validation.py` — независимый `SourceEvidencePackage`, валидатор маршрутизации и полное тестовое покрытие таблицы допуска.

### Неприкосновенные файлы на Этапе C:
- `App.tsx`, `components/*`, `services/geminiService.ts` (`transformText()`), `services/visualLibraryService.ts`, `data/visual-library/*`, `agent-interface/cli.ts`, `SKILL.md`, `package.json`, `vite.config.ts`.

### Проверка Этапа C:
- Python-тесты: `python3 -m unittest discover` в `book_layer/tests` (автономный модуль) и `source_validation/tests` — **0 skipped, 0 failed**, без `BORIS_PDF` и без `GEMINI_API_KEY`.
- Регрессионные проверки старого проекта: `npx tsc --noEmit`, `compile_applet`, `python3 test_cli_agent_call.py` (`4/4`).

---

## Последующие этапы (D–H — после приёмки Этапа C)

- **Stage D (`poetics_engine/segmenter.py`):** реализация `C1` для сегментации лирики и драматургии (`SCENE`, `SPEAKER_TURN`, `STAGE_DIRECTION`, `VERSE_LINE`, `PROSE_BLOCK`, склейка перебоев).
- **Stage E (`poetics_engine/prosody_ru.py`, `meter_rhyme.py`):** реализация `C6a/C6b`, проверка на `PUSHKIN_PROSODY_BENCHMARK_V1.md`.
- **Stage F:** генерация версионированных профилей по `PUSHKIN_POETIC_PROFILE_SCHEMA.json`.
- **Stage G:** реализация `C8` (верификация сгенерированных стихов через `C6`), вынос `GEMINI_API_KEY` на серверную сторону (`server.ts`), безопасное подключение Python-контура к UI с сохранением `transformText()`.
- **Stage H:** финальный отчёт `INTEGRATION_TEST_REPORT.md` и обновление `PROJECT_STATUS.md`.
