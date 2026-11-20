# UPDATED_PROJECT_ROADMAP — Актуализированная дорожная карта PushkinRhymeEngine

**Дата актуализации:** 2026-11-20  
**Принцип:** Сначала доказательная база источников (`book_layer` + `source_validation`), затем детерминированная аналитика (`C1` + `C6`), затем проверяемая генерация (`C8`). Никакого преждевременного усложнения и никаких фиктивных модулей.

---

| Этап | Название | Статус | Ключевой результат и критерий выхода |
| :---: | :--- | :--- | :--- |
| **A** | Pre-Integration Audit | `VERIFIED` | Зафиксировано реальное состояние `PushkinRhymeEngine` (`ARCHITECTURAL_CHECKPOINT_2026.md`, `PRE_INTEGRATION_AUDIT.md`), отсутствие `C1–C8` и `fitz`, сохранность UI/CLI/Visual Library. |
| **B** | Architecture & Cross-Project Research | `VERIFIED` | Проведён пофайловый аудит 13 файлов `PushkinBookLayer 0.1` (`SOURCE_CODE_AUDIT.md`), зафиксирована недоступность внешней ссылки AI Studio (`NEW_PROJECT_ARCHITECTURAL_REVIEW.md`), согласован дизайн Этапа C и схема `SourceEvidencePackage`. |
| **C** | **Autonomous Book Layer & Source Validation** | `PROPOSED` (готов к старту после утверждения) | Развёртывание `/book_layer` + `/source_validation`, устранение `/mnt/data`, обработка `FAILED`, контракт `SourceEvidencePackage`, флаги `SEMANTIC_ANALYSIS_ALLOWED` / `PROSODIC_ANALYSIS_ALLOWED`, автономные тесты на синтетическом PDF (0 `skip`, 0 Gemini API). **Без Node/Python-моста и без фиктивных C1/M8.** |
| **D** | **C1 Structural & Dramatic Segmenter** | `PLANNED` | Превращение `PDF_TEXT_LINE_UNCLASSIFIED` (где `semantic_analysis_allowed=True`) в проверенные `SCENE`, `SPEAKER_TURN`, `STAGE_DIRECTION`, `VERSE_LINE`, `PROSE_BLOCK` со склейкой перебоев — и только после ревью поднятие `prosodic_analysis_allowed=True`. |
| **E** | **C6a / C6b Poetic & Prosodic Engine** | `PLANNED` | Детерминированный слогораздел, акцентология с `AMBIGUOUS_STRESS`, детектор метра/цезуры/клаузул/рифм в Python. Калибровка на `PUSHKIN_PROSODY_BENCHMARK_V1.md` (>= 90% метр, >= 85% рифма). |
| **F** | **Poetic Profiles & Corpus Store** | `PLANNED` | Извлечение `PUSHKIN_POETIC_PROFILE_SCHEMA.json` для Приложения I «Бориса Годунова» и открытых канонических текстов; раздельное хранение `COMPUTED_BY_ENGINE` и `COMMENTARY_ASSERTED`. |
| **G** | **Controlled Generation (`C8`), M8 & Secure Server Bridge** | `PLANNED` | Только после стабилизации Stages C–F: вынос `GEMINI_API_KEY` на сервер (`server.ts` / прокси), подключение Python-ядра к UI, верификация сгенерированных стихов через `C6a/C6b`, сохранение `transformText()` для обратной совместимости. |
| **H** | **End-to-End Verification & Corpus Expansion** | `PLANNED` | Сквозные тесты, публикация `INTEGRATION_TEST_REPORT.md`, поэтапное расширение манифестов (10-томник, опциональный `OCR_HUMAN_VERIFIED` трек). |
