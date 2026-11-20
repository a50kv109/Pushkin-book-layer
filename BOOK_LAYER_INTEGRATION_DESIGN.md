# BOOK_LAYER_INTEGRATION_DESIGN — Целевая архитектура интеграции (Stages C–G)

**Статус документа:** `PROPOSED` (Stage C скорректирован в `BOOK_LAYER_STAGE_C_DESIGN.md`)  
**Ключевое уточнение по этапам:** На **Этапе C** Node/Express-прокси и межпроцессный Python-воркер **не создаются**, а фиктивные `C1`/`M8` **не реализуются**. Этап C ограничен автономным Python-пакетом (`/book_layer` + `/source_validation`) и контрактом `SourceEvidencePackage`. Гибридный HTTP-мост и серверный прокси для `GEMINI_API_KEY` относятся к **Этапу G** (после стабилизации `C1` и `C6a/C6b`).
**Базовые инварианты:**
- Не модифицировать и не ломать существующие рабочие контракты (`transformText()`, Web UI, `agent-interface/cli.ts`, `SKILL.md`, Visual Library V1).
- Не модифицировать замороженное ядро `BOOK-NAV Classic V6` (если оно будет подключено отдельно как внешний сервис для `FIGURE`/`TABLE`).

---

## 1. Общая системная архитектура (Target Hybrid Architecture)

```text
+-----------------------------------------------------------------------------+
| PushkinRhymeEngine Frontend (React 19 + Vite, браузер)                      |
|  - Вкладка 1: Рифменная машина (старый сценарий + опц. профиль корпуса)     |
|  - Вкладка 2: Художественная библиотека (Visual Library V1 — стилизации)    |
|  - Вкладка 3 (Новая, Phase 2+): Книжные источники & Поэтический анализ      |
+--------------------------------------+--------------------------------------+
                                       | HTTP / JSON (/api/*) — full-stack server.ts
                                       v
+-----------------------------------------------------------------------------+
| Node.js Backend / Agent Gateway (Express + Vite middlewares / CLI)          |
|  - Сохраняет старый transformText() (плюс серверный прокси для Gemini API)  |
|  - C2–C5, C7–C8: Композиция, проверка ограничений, оркестрация генерации    |
|  - Загружает статические проверенные профили (PUSHKIN_POETIC_PROFILE)       |
|  - Вызывает Python Book & Prosody Worker по JSON-RPC / CLI subprocess      |
+--------------------------------------+--------------------------------------+
                                       | spawn/HTTP JSON (строгий контракт)
                                       v
+-----------------------------------------------------------------------------+
| Python Subsystems (Isolated Workspace: /book_layer и /poetics_analyzer)     |
|  1. PushkinBookLayer (/book_layer):                                         |
|     - BookNavAdapter, book_models, edition_registry (без хардкода /mnt/data)|
|     - C1 Hand-off Gateway (строгая проверка TEXT_LAYER vs SCANNED_PAGE)     |
|  2. C1 Structural & Witness Segmenter:                                      |
|     - SCENE / SPEAKER_TURN / STAGE_DIRECTION / VERSE_LINE / PROSE_BLOCK     |
|  3. C6a/C6b Poetic Analyzer (RU Prosody & Rhyme):                           |
|     - Детерминированный слогораздел, словарь/модель ударений, профиль метра |
+-----------------------------------------------------------------------------+
```

### Почему выбрана модель Node Backend + Python Worker?
1. В AI Studio шаблон full-stack строится на `server.ts` (Express + `vite.middlewares` на порту 3000), что также решает проблему безопасности `GEMINI_API_KEY` (ключ уходит с клиента на сервер).
2. `PushkinBookLayer` написан на Python (`PyMuPDF`), а качественная русская просодия, морфология и акцентология (`C6a`/`C6b`) в Python опираются на зрелую экосистему и легко тестируются через `unittest`/`pytest` отдельно от UI.
3. Если на конкретном хостинге Python-рантайм или исходный PDF недоступны, система **gracefully degrades**: Node-слой работает на предвычисленных JSON-манифестах, нормализованных JSON-корпусах и `PUSHKIN_POETIC_PROFILE_SCHEMA.json`, честно помечая отсутствие локального PDF (`PDF_UNAVAILABLE`).

---

## 2. Эволюция модели данных PushkinBookLayer (Stage C)

### 2.1. Сохранение обратной совместимости с v0.1
Все существующие классы `SourceDocument`, `PageReference`, `BookNode`, `TextFragment`, `BookNavAdapter` и `C1Input` **сохраняются** с теми же обязательными полями.

### 2.2. Расширение для драматургии, лирики и переносимости
В соответствии с `docs/BORIS_GODUNOV_POETICS_NOTES.md` модель в `book_models.py` расширяется без поломки существующих типов:
- `NodeKind` дополняется типами: `'EDITION_WITNESS' | 'SPEAKER_TURN' | 'VERSE_LINE' | 'PROSE_BLOCK' | 'STAGE_DIRECTION' | 'SONG_OR_RECITATIVE'`.
- `SourceDocument` дополняется полем `source_uri_type: Literal['LOCAL_FILE', 'ENV_CONFIG', 'ARCHIVE_REFERENCE']` и использует относительный/конфигурируемый `document_ref` вместо жёсткого `/mnt/data/...` в сериализуемых манифестах (локальный абсолютный путь передаётся через `BORIS_PDF` или `book_sources.json`, исключённый из git, если PDF не в репо).
- `BookNavAdapter` добавляет безопасную обработку ошибок (`FAILED` в `ExtractionStatus` при исключениях чтения/рендера) и перенос `node_id`, `context_before`, `context_after`, `witness_id` в `C1Input`.
- `to_c1_input(fragment, strict=True)` **обязан отклонять (или возвращать `BlockedHandoff`)** фрагменты со статусом `SCANNED_PAGE` или `FAILED`, реализуя правило из `INTEGRATION_CONTRACT.md` программно, а не только на бумаге.

---

## 3. Точки интеграции и контракты

### Точка интеграции 1: `PushkinBookLayer -> C1` (`to_c1_input` + Router)
- **Вход:** `TextFragment` из `BookNavAdapter`.
- **Гейт маршрутизации:**
  - `TEXT_LAYER` -> передача в `C1` (`C1Input`).
  - `SCANNED_PAGE` -> запрет автопередачи в `C1`; доступен только `render_page()` для визуального превью или ручной/OCR-транскрипции (`OCR_PENDING`).
  - `PARTIAL` -> передача только с пометкой `COVERAGE_INCOMPLETE`.
  - `FAILED` -> немедленная остановка с диагностикой.

### Точка интеграции 2: `C1 -> C6a/C6b` (Просодический и композиционный анализ)
- **Принцип разделения:** `C1` никогда не размечает метр, ударения и рифмы. Он отдаёт в `C6` нормализованные единицы:
  - для лирики: `WORK -> EDITION_WITNESS -> STANZA -> VERSE_LINE`;
  - для драматургии («Борис Годунов»): `WORK -> EDITION_WITNESS -> SCENE -> SPEAKER_TURN -> (VERSE_LINE | PROSE_BLOCK | STAGE_DIRECTION | SONG_OR_RECITATIVE)`, сохраняя флаг `is_split_line` (перебой стиха между двумя репликами).
- Внешние литературоведческие факты из комментариев (напр. подсчёт 43 рифменных пар Т. Шоу или 8% перебоев Л. Тимофеева) хранятся в отдельном блоке `commentary_hypotheses` со статусом **`COMMENTARY_ASSERTED`** и точной ссылкой на PDF-страницы, никогда не смешиваясь с `COMPUTED_BY_ENGINE`.

### Точка интеграции 3: `C6 -> C8` (Генеративный пайплайн `PushkinRhymeEngine`)
- Текущая функция `transformText(text)` остаётся неизменной (обратная совместимость для UI и CLI v2.0).
- Новая функция `transformTextGrounded(request: GroundedGenerationRequest)` (Stage G):
  1. Принимает `userText`, целевой `poeticProfileId` (например, `onegin_tetrameter_v1`, `boris_blank_iamb5_v1`, `lyric_elegy_v1`), опциональные `VisualAnchor[]` (строго с пометкой `STYLIZATION_ANCHOR`, не текстологический источник) и режим `strictProsodyValidation: boolean`.
  2. Генерирует кандидаты через Gemini API (через серверный route `/api/generate`).
  3. Прогоняет результат через программный валидатор **C6a/C6b** (подсчёт слогов, проверка икта, клаузул, рифмы, перебоев) и при необходимости запускает 1–2 итерации локальной правки или возвращает прозрачный **Metric Verification Report** рядом со стихом.

### Точка интеграции 4: `Visual Library V1`
- Остаётся полностью изолированной по семантике.
- При запуске Режима 3 (`Narrative Inspiration`) передаёт только образный/композиционный фон (`atmosphere`, `environment_features`, `narrative_potential`), но **не подменяет** историко-текстовый корпус (`EditionWitness`) и **не переписывает** метрический профиль.
