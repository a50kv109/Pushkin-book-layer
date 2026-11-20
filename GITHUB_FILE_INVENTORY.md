# GITHUB_FILE_INVENTORY — Инвентаризация файлов репозитория перед публикацией (`v0.1.0-alpha`)

**Дата:** 2026-11-20  
**Статус Git:** В контейнере каталог `.git` отсутствует (репозиторий ещё не инициализирован через `git init`).

---

## 1. Файлы, готовые к публикации на GitHub

### Корневой каркас и конфигурация
- `.gitignore` (исключает `node_modules`, `dist`, `*.local`, `book_layer/.venv/`, `__pycache__/`, `*.py[cod]`, `.pytest_cache/`)
- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `index.tsx`, `metadata.json`
- `constants.tsx`, `types.ts`, `types/visualLibrary.ts`, `App.tsx`

### Фронтенд-компоненты и сервисы
- `components/EngineVisualizer.tsx`, `components/OutputParchment.tsx`
- `components/visual-library/VisualLibraryView.tsx`, `AnchorDetailModal.tsx`, `AddAnchorModal.tsx`, `ModeStudioPanel.tsx`
- `services/geminiService.ts`, `services/visualLibraryService.ts`
- `data/visual-library/narrative-patterns.json`, `data/visual-library/visual-anchors.json`

### Интерфейс для ИИ-агентов и тесты CLI
- `agent-interface/cli.ts`, `SKILL.md`, `skills/pushkin-rhyme-machine/SKILL.md`, `skills/pushkin-rhyme-machine/references/metrics_and_rules.md`, `docs/AGENT_INTEGRATION.md`, `test_cli_agent_call.py`

### Книжный слой и валидация источников (Stage C)
- `book_layer/pyproject.toml`, `book_layer/README.md`
- `book_layer/src/__init__.py`, `book_models.py`, `book_nav_adapter.py`, `build_boris_manifest.py`, `pipeline.py`
- `book_layer/data/boris_godunov_2008_manifest.json`
- `book_layer/docs/ARCHITECTURE.md`, `BORIS_GODUNOV_2008_AUDIT.md`, `BORIS_GODUNOV_POETICS_NOTES.md`, `INTEGRATION_CONTRACT.md`
- `book_layer/tests/test_adapter.py`, `book_layer/tests/test_synthetic_book.py`
- `source_validation/__init__.py`, `models.py`, `validator.py`, `tests/test_source_validation.py`
- `SOURCE_EVIDENCE_PACKAGE_SCHEMA.json`

### Публичная и проектная документация
- `README.md` (EN), `README_RU.md` (RU), `ARCHITECTURE.md`, `ROADMAP.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `docs/PROJECT_STATUS.md`, `PROJECT_STATUS.md`
- Документы аудита и проектирования Stages A–C (`ARCHITECTURAL_CHECKPOINT_2026.md`, `PRE_INTEGRATION_AUDIT.md`, `SOURCE_CODE_AUDIT.md`, `BOOK_LAYER_STAGE_C_DESIGN.md`, `STAGE_C_*.md`, `SOURCE_VALIDATION_IMPLEMENTATION.md`, `PUSHKIN_POETIC_PROFILE_SCHEMA.json`, `PUSHKIN_PROSODY_BENCHMARK_V1.md`, др.)

---

## 2. Каталоги и файлы, которые НЕЛЬЗЯ публиковать

| Путь | Причина исключения | Текущий статус |
| :--- | :--- | :--- |
| `.aistudio/` | Внутренние артефакты и логи Google AI Studio | **Не в `.gitignore`** — добавить в `.gitignore` или удалить до `git init` |
| `migrated_prompt_history/prompt_2025-12-28T11:32:06.373Z.json` | Служебная история промпта миграции AI Studio | **Не в `.gitignore`** — исключить до публикации |
| `public/assets/aistudio/PUSHKINBOOKLAYER_01_ENGINEERING_ADOPTION_REPORT.md_934a3f10.pdf` | Внутренний черновой отчёт с расхождениями с реальным кодом 0.1 | Рекомендуется удалить/исключить из публичного репо |
| `public/assets/aistudio/PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md` | Временная текстовая выгрузка архива (код уже перенесён в `/book_layer`) | По решению владельца: оставить как архив происхождения или исключить |
| `node_modules/`, `dist/`, `book_layer/.venv/`, `__pycache__/` | Зависимости, артефакты сборки и локальный Python venv | **Исключены** в `.gitignore` |
| `.env.local` (если будет создан пользователем) | API-ключ `GEMINI_API_KEY` | Отсутствует на диске, **исключён** маской `*.local` |

---

## 3. Ассеты, требующие решения по правам перед публикацией

- `public/assets/aistudio/*.png` (19 файлов Visual Library V1): публиковать только после подтверждения владельцем условий их распространения и выбора единой лицензии проекта (`LICENSE`).
