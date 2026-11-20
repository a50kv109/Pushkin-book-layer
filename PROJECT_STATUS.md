# PROJECT_STATUS — Честная сводка состояния PushkinRhymeEngine 2.0

**Последнее обновление:** 2026-11-20 (Open Alpha Release `v0.1.0-alpha` / Stage C+)  
**Позиционирование:** Открытый образовательный и творческий поэтический движок (поэтика А.С. Пушкина — исследовательская основа; базовый принцип: `POETIC FORM MUST NOT OVERRIDE FACTUAL ACCURACY`).

---

## Матрица статусов компонентов

| Компонент | Статус | Фактическое основание |
| :--- | :--- | :--- |
| Web UI «Рифменная машина» (`App.tsx`, `OutputParchment.tsx`, `EngineVisualizer.tsx`) | `IMPLEMENTED`, `TESTED` | Минимальное обновление футера в `App.tsx` (строка 330: устранение `CC-BY-SA 4.0` и города); `npx tsc --noEmit` и `npm run build` проверяются перед тегированием. |
| Базовый генератор (`services/geminiService.ts -> transformText`) | `IMPLEMENTED` / `NOT_VERIFIED` (live API) | Код не изменён; живой запрос к Gemini не выполнялся из-за отсутствия `GEMINI_API_KEY`. |
| Agent CLI & Skill (`agent-interface/cli.ts`, `SKILL.md`, `test_cli_agent_call.py`) | `IMPLEMENTED`, `TESTED` (офлайн) / `NOT_VERIFIED` (live API) | `4/4` офлайн-тестов `test_cli_agent_call.py`. |
| Visual & Narrative Reference Library V1 (`visualLibraryService.ts`, 19 якорей, 8 паттернов, 3 режима) | `IMPLEMENTED`, `TESTED` (metadata fallback) | Локальные AI-PNG временно исключены из публичного Git-релиза (`public/assets/aistudio/README.md`) до прояснения прав; галерея и 3 режима работают с текстовым fallback и `localStorage`. |
| **Книжный адаптер (`/book_layer`, Этап C)** | `IMPLEMENTED`, `TESTED` | Пакет на `PyMuPDF 2.1`, переносимые пути, обработка `FAILED`, блокировка `SCANNED_PAGE` в `to_c1_input()`. `7/7` синтетических PDF-тестов (`0 skipped`). |
| **Шлюз источников (`/source_validation`, Этап C)** | `IMPLEMENTED`, `TESTED` | `SourceEvidencePackage` (`SOURCE_EVIDENCE_PACKAGE_SCHEMA.json`) с раздельными `semantic_analysis_allowed` и `prosodic_analysis_allowed`. `6/6` тестов (`0 skipped`). |
| Тест на реальном PDF «Бориса Годунова» (`book_layer/tests/test_adapter.py`) | `NOT_VERIFIED` | Внешний PDF `BORIS_PDF` отсутствует в среде (`5 skipped`). |
| Корпус Пушкина и сегментатор `C1` (Этап D) | `PLANNED` | Фиктивные заглушки не создавались; разработка не начиналась. |
| Просодический стенд `C6a/C6b` (Этап E) и профили (Этап F) | `PLANNED` | Не реализованы; спецификация подготовлена. |
| Генерация `C8`, аудитор `M8`, серверный прокси и **Образовательный режим** (Этап G) | `PLANNED` | Не реализованы; вынос `GEMINI_API_KEY` на сервер обязателен перед публичным веб-деплоем. |
