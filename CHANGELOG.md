# История изменений (Changelog)

Все заметные изменения в проекте **PushkinRhymeEngine 2.0** документируются в этом файле. Формат вдохновлён Keep a Changelog.

## [0.1.0-alpha] - 2026-11-20 (Stage C+ Open Alpha Release)
### Добавлено
- **Позиционирование открытого образовательного и творческого поэтического движка:**
  - Зафиксирован базовый принцип **`POETIC FORM MUST NOT OVERRIDE FACTUAL ACCURACY`** для образовательных и научных текстов.
  - Обновлены `README.md`, `README_RU.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `PROJECT_STATUS.md`, `docs/PROJECT_STATUS.md`.
- **Раздельное лицензирование и политика безопасности:**
  - `LICENSE` — **MIT License** для программного кода (`Copyright (c) 2026 Андрей Арцыбашев`).
  - `LICENSE-DOCS` — **Creative Commons Attribution 4.0 International (CC BY 4.0)** для оригинальной документации.
  - `SECURITY.md` — правила обращения с `GEMINI_API_KEY`, предупреждение об инлайне ключа в клиентской сборке `vite.config.ts`, гигиена данных.
  - `.env.example` и усиленный `.gitignore` (исключены `.env*`, `.aistudio/`, `migrated_prompt_history/`, `.local_backup/`, `*.pdf`, `.venv/`, `dist/`, `node_modules/`).
- **Пакет `/book_layer` (адаптация `PushkinBookLayer 0.1`):**
  - Модели `SourceDocument`, `PageReference`, `BookNode`, `TextFragment` (`book_models.py`).
  - Адаптер `BookNavAdapter` (`book_nav_adapter.py`) с `PyMuPDF`, SHA-256 контролем, обработкой `FAILED` и переносимыми путями.
  - Защитный гейт `pipeline.to_c1_input()` (`SourceHandoffBlockedError`) и манифест `book_layer/data/boris_godunov_2008_manifest.json`.
  - 7 автономных тестов на синтетическом PDF (`book_layer/tests/test_synthetic_book.py`, `0 skipped`).
- **Пакет `/source_validation`:**
  - Независимый контракт `SourceEvidencePackage` (`SOURCE_EVIDENCE_PACKAGE_SCHEMA.json`, `models.py`).
  - Детерминированный валидатор `validate_source_fragment()` (`validator.py`) с раздельными правами `semantic_analysis_allowed` и `prosodic_analysis_allowed`.
  - 6 автономных тестов (`source_validation/tests/test_source_validation.py`).

### Изменено и исправлено перед публикацией
- **Атрибуция в UI (`App.tsx:330`):** удалено противоречие с прежней пометкой `CC-BY-SA 4.0` и убраны персональные данные местоположения; футер выровнен с `MIT (Code) · CC BY 4.0 (Docs) • Андрей Арцыбашев`.
- **Публичные визуальные ассеты (`public/assets/aistudio/`):** 19 локальных AI-PNG и внутренние черновые материалы перенесены в локальную резервную копию (`.local_backup/`, в `.gitignore`) и временно исключены из публичного альфа-релиза; интерфейс Visual Library работает в режиме текстового fallback (`public/assets/aistudio/README.md`).

### Известные ограничения
- Живой вызов Gemini API (`transformText`) не проверялся в текущей среде (`NOT_VERIFIED`, отсутствует `GEMINI_API_KEY`).
- Тест реального PDF `book_layer/tests/test_adapter.py` пропускается без внешнего файла `BORIS_PDF` (`NOT_VERIFIED`).
- Модули `C1`–`C8`, `M8`, OCR и Образовательный режим в этом релизе отсутствуют (`PLANNED`).

---

## [2.0.0-baseline] - 2026-11-19
### Добавлено
- **Visual & Narrative Reference Library V1:** каталог из 19 визуальных якорей и 8 нарративных паттернов, галерея, 11 категорий, редактирование в `localStorage` и 3 режима работы (`ModeStudioPanel`).
- **Agent Skill и CLI v2.0:** `agent-interface/cli.ts`, `SKILL.md`, `skills/pushkin-rhyme-machine/`, `test_cli_agent_call.py` (`4/4` офлайн-тестов).
- **Web UI v2.0:** `App.tsx`, `EngineVisualizer.tsx`, `OutputParchment.tsx`, `services/geminiService.ts` (`gemini-3-pro-preview`, Structured JSON Outputs).
