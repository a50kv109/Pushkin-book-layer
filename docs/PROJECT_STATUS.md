# Статус проекта — PushkinRhymeEngine 2.0 (`v0.1.0-alpha`, Stage C+)

**Дата актуализации:** 2026-11-20  
**Правило зрелости:** `IMPLEMENTED` · `TESTED` · `NOT_VERIFIED` · `PLANNED`  
**Позиционирование:** Открытый образовательный и творческий поэтический движок (`POETIC FORM MUST NOT OVERRIDE FACTUAL ACCURACY`).

---

## Матрица готовности компонентов

| Компонент / Модуль | Статус | Фактическое основание и ограничения |
| :--- | :--- | :--- |
| **React / Vite Web UI** (`App.tsx`, `EngineVisualizer.tsx`, `OutputParchment.tsx`) | `IMPLEMENTED`, `TESTED` | Сборка `npm run build` и `npx tsc --noEmit` проходят без ошибок. В `App.tsx:330` атрибуция согласована с `MIT (Code) · CC BY 4.0 (Docs)`. Этапы `EngineStage` — анимация ожидания (`800ms`), а не парсеры стиха. |
| **Visual & Narrative Reference Library V1** (`components/visual-library/*`, `services/visualLibraryService.ts`) | `IMPLEMENTED`, `TESTED` (metadata fallback) | 19 метаданных якорей, 8 паттернов, 11 категорий, 3 режима. Локальные 19 AI-PNG исключены из публичного Git-релиза (`public/assets/aistudio/README.md`); UI корректно работает в режиме текстового fallback без изображений. |
| **CLI и Agent Skill** (`agent-interface/cli.ts`, `SKILL.md`, `skills/pushkin-rhyme-machine/`) | `IMPLEMENTED`, `TESTED` (офлайн) | `4/4` тестов `test_cli_agent_call.py` (`info`, пустой ввод, отсутствие ключа, `stdin`). |
| **Генерация через Gemini** (`services/geminiService.ts -> transformText`) | `IMPLEMENTED`, `NOT_VERIFIED` | Промпт-ориентированная генерация JSON `{ poem, moral }` через `gemini-3-pro-preview`. Живой сетевой вызов к Gemini API **не проверялся** (`GEMINI_API_KEY` отсутствует в среде). |
| **Книжный слой** (`/book_layer`, адаптация `PushkinBookLayer 0.1`) | `IMPLEMENTED`, `TESTED` (синтетика) / `NOT_VERIFIED` (реальный PDF) | `7/7` автономных тестов на синтетическом PDF (`0 skipped`, `PyMuPDF 2.1`). Тест `test_adapter.py` на реальном PDF «Бориса Годунова» пропускается (`5 skipped`) без `BORIS_PDF`. |
| **Source Validation** (`/source_validation`, `SourceEvidencePackage`) | `IMPLEMENTED`, `TESTED` | `6/6` тестов (`0 skipped`). Раздельные флаги `semantic_analysis_allowed` и `prosodic_analysis_allowed`. |
| **Лицензирование и безопасность** (`LICENSE`, `LICENSE-DOCS`, `SECURITY.md`, `.env.example`, `.gitignore`) | `IMPLEMENTED`, `VERIFIED` | MIT для кода, CC BY 4.0 для оригинальной документации, исключение `.env*`, `.aistudio/`, `migrated_prompt_history/`, `.local_backup/`, `*.pdf`. |
| **Анализ метра, ударений, ритма и фактологической точности (`C1`, `C6a/C6b`, `M8`, `C8`)** | `PLANNED` | В кодовой базе отсутствуют; разработка начнётся со Stage D. |
| **Образовательный режим и серверный прокси для `GEMINI_API_KEY` (Этап G)** | `PLANNED` | В `vite.config.ts` ключ пока инлайнится при локальной сборке; вынос на сервер и режим разбора учебного материала запланированы на Этап G. |
| **Автоматический OCR скана 1831 года** | `PLANNED` | Не реализован; сканированные страницы блокируются в `Source Validation`. |
