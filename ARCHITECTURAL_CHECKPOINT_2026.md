# ARCHITECTURAL_CHECKPOINT_2026 — Зафиксированная контрольная точка PushkinRhymeEngine

**Дата фиксации:** 2026-11-20  
**Объект:** Репозиторий `PushkinRhymeEngine` (Google AI Studio workspace)  
**Правило статусов:** `VERIFIED` · `IMPLEMENTED` · `REPORTED` · `PROPOSED` · `NOT_VERIFIED` · `EXPERIMENTAL`

---

## 1. Подтверждённое текущее состояние (`VERIFIED`)

На текущий момент рабочий код старого проекта **не модифицировался** в ходе этапов аудита (Stage A–B) и предпроектной проверки. Последние прогоны проверены непосредственно в контейнере (2026-11-20):
- `npx tsc --noEmit` — успешно (exit code 0);
- `compile_applet` (`vite build`) — успешно;
- `python3 test_cli_agent_call.py` — `4/4` теста внешнего агентного вызова CLI пройдены (`info`, валидация пустого текста, отсутствие `GEMINI_API_KEY`, чтение `stdin`);
- Python в контейнере: `Python 3.11.2`; проверка `python3 -c "import fitz"` завершилась `ModuleNotFoundError: No module named 'fitz'`;
- локальных `.pdf`-файлов и исходников `BOOK-NAV Classic V6` / `PushkinBookLayer` в виде исполняемых модулей в каталоге репозитория нет (имеется только текстовая выгрузка `/public/assets/aistudio/PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md`).

---

## 2. Реализованные компоненты (`IMPLEMENTED` / `VERIFIED`)

| Компонент | Файлы | Статус | Фактическая характеристика |
| :--- | :--- | :--- | :--- |
| Web UI «Рифменная машина» | `App.tsx`, `components/EngineVisualizer.tsx`, `components/OutputParchment.tsx`, `constants.tsx`, `types.ts` | `VERIFIED` | React 19 + Vite 6 + TS ~5.8. `EngineStage` (`ANALYZING`, `ARCHAIZING`, `RHYTHM_MAPPING`, `RHYMING`, `STYLIZING`) — визуальная 800ms-анимация ожидания параллельно одному сетевому вызову. |
| Генератор поэзии | `services/geminiService.ts` | `IMPLEMENTED` | Единственная функция `transformText(text)` на `@google/genai` (`gemini-3-pro-preview`), запрашивающая JSON `{ poem, moral }` по системному промпту (4-стопный ямб, ABAB). Живой вызов не проверялся из-за отсутствия `GEMINI_API_KEY` (`NOT_VERIFIED`). |
| CLI и Agent Skill | `agent-interface/cli.ts`, `SKILL.md`, `skills/pushkin-rhyme-machine/`, `test_cli_agent_call.py` | `VERIFIED` (офлайн-контракт) / `NOT_VERIFIED` (live API) | `info`, валидация, `stdin`, `help` работают. В `info` зафиксировано `programmatic_meter_validation: false`. |
| Visual & Narrative Reference Library V1 | `services/visualLibraryService.ts`, `components/visual-library/*`, `data/visual-library/*`, `public/assets/aistudio/*.png` | `VERIFIED` | 19 визуально проверенных PNG-стилизаций, 8 нарративных паттернов, Режим 1 (бриф открытки), Режим 2 (лексический подбор), Режим 3 (обёртка вокруг `transformText()`), сохранение правок в `localStorage`. |
| Предпроектная документация Stages A–B | `PRE_INTEGRATION_AUDIT.md`, `SOURCE_CODE_AUDIT.md`, `SOURCE_DATA_FLOW.md`, `PUSHKIN_POETIC_PROFILE_SCHEMA.json`, `PUSHKIN_PROSODY_BENCHMARK_V1.md`, др. | `VERIFIED` | Созданы на предыдущем шаге; подлежат синхронизации с условиями утверждения Этапа C (устранение преждевременного Node/Python-моста и переход на `SourceEvidencePackage`). |

---

## 3. Отсутствующие компоненты (`NOT IMPLEMENTED` / `NOT_VERIFIED`)

1. **Книжный адаптер в рабочем дереве:** `/book_layer` и `/source_validation` ещё не развёрнуты в код.
2. **Сегментатор `C1`** (выделение `SCENE`, `SPEAKER_TURN`, `STAGE_DIRECTION`, `VERSE_LINE`, `PROSE_BLOCK`, склейка перебоев).
3. **Просодический и акцентологический контур (`L0` / `C6a` / `C6b` / `M7`):** нет анализатора слогов, ударений, омографов, метра, цезуры и фонетических рифм.
4. **Аудитор происхождения `M8` и независимый верификатор `C8`:** отсутствуют в коде.
5. **Литературные корпуса и OCR:** отсутствует PDF «Бориса Годунова» (2008), отсутствует OCR для сканированной редакции 1831 года.
6. **Серверное хранение `GEMINI_API_KEY` для браузера:** текущая конфигурация `vite.config.ts` (`define: { 'process.env.API_KEY': ... }`) встраивает ключ в клиентскую сборку при наличии переменной в `.env`.

---

## 4. Известные ограничения и расхождения с ранними отчётами

Сравнение приложенного PDF-отчёта `PUSHKINBOOKLAYER_01_ENGINEERING_ADOPTION_REPORT.md_934a3f10.pdf` (16 ноября 2026) с реальным 13-файловым кодом `PushkinBookLayer 0.1` выявило критические расхождения:
- В раннем PDF-отчёте (`REPORTED`) описывался пример монолога Пимена из `WITNESS_MAIN_1831_REPRINT` (pdf:38 / book:34) и объект `to_c1_input()` с полями `work_id`, `edition_id`, `witness_id`, `VALIDATED_FOR_C1` и проверкой `sourceValidation` (`25/25` тестов в некоем внешнем `MVP V0.1`).
- Фактический код `PushkinBookLayer 0.1` (`VERIFIED` по bundle):
  - `BG-MAIN-1831` (pp. 12–155) — **скан без текстового слоя (`SCANNED_PAGE`)**; единственная текстовая фикстура — `BG-APP-I` (ранняя редакция, pp. 158–248);
  - `pipeline.to_c1_input()` возвращает только `(source_text, source_document, page_references, source_hash, extraction_status, instruction)` и **не блокирует** сканы;
  - модуль `sourceValidation` в данном репозитории отсутствует;
  - `tests/test_adapter.py` использует `unittest.skipUnless(PDF and os.path.exists(PDF))`, поэтому без внешнего PDF реально **0 тестов** выполняются.

---

## 5. Незавершённые задачи и точка возобновления

**Точка возобновления разработки:** **Этап C (подготовка автономного Python-пакета `/book_layer` + `/source_validation`)**, условно одобренный пользователем с запретом на изменение рабочего кода до утверждения обновлённых спецификаций.

Ближайшие задачи после подтверждения пользователем:
1. Развернуть `PushkinBookLayer 0.1` в `/book_layer` с сохранением происхождения кода.
2. Устранить жёсткий путь `/mnt/data/...`, реализовать обработку `FAILED`, защитные гейты `SCANNED_PAGE`/`PARTIAL` и разделение `SEMANTIC_ANALYSIS_ALLOWED` vs `PROSODIC_ANALYSIS_ALLOWED`.
3. Реализовать независимый контракт `SourceEvidencePackage` в `/source_validation` (без фиктивных реализаций C1/M8).
4. Обеспечить автономные тесты на синтетическом PDF (0 `skip`, 0 зависимости от Gemini API и внешнего PDF).
