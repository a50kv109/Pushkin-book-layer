# SOURCE_DATA_FLOW — Сквозной поток данных и provenance

**Статус:** `DESIGNED`  
**Цель:** Зафиксировать строгий путь данных от физического PDF-издания и визуальных ориентиров до верифицированного анализа (C6) и генерации текста (C8) без смешения фактов, гипотез и художественной стилизации.

---

## 1. Основной конвейер книжных источников (Source-Grounded Pipeline)

```text
[1] Physical PDF / Verified Digital Witness (external/local)
       |  SHA-256 файла, page_count, edition metadata
       v
[2] PushkinBookLayer (BookNavAdapter)
       |  - Проверка каждой страницы: TEXT_LAYER vs SCANNED_PAGE
       |  - Фиксация PageReference(pdf_page, printed_page, page_role)
       |  - Изоляция свидетелей: BG-MAIN-1831 != BG-APP-I != BG-APP-II != BG-COMMENTARY
       v
[3] Provenance Gate (pipeline.to_c1_input)
       |  - TEXT_LAYER  --> пропуск с TextFragment + source_hash
       |  - SCANNED_PAGE --> БЛОКИРОВКА C1 (только render_page -> OCR/Manual Queue)
       |  - FAILED      --> СТОП и эскалация ошибки
       v
[4] C1 Structural & Genre Segmenter
       |  - Очистка артефактов переносов PDF_TEXT_LINE_UNCLASSIFIED -> VERSE_LINE / PROSE_BLOCK
       |  - Разделение SCENE, SPEAKER_TURN, STAGE_DIRECTION, SONG_OR_RECITATIVE
       |  - Выделение перебоев (разрыв одной строки на 2+ реплики)
       |  - Маркировка утверждений из комментариев как COMMENTARY_ASSERTED
       v
[5] C6a / C6b Poetic Intelligence Analyzer (Deterministic + Lexicon)
       |  - C6a: токенизация, слогоделение (число гласных), акцентный профиль слова,
       |         учёт омографии (AMBIGUOUS_STRESS)
       |  - C6b: детектор метра (ямб4/ямб5/хорей/вольный/проза), цезура, клаузула
       |         (мужская/женская/дактилическая), рифменный индекс и эхо-пары
       |  - Выход: PoeticProfile JSON (COMPUTED_BY_ENGINE + confidence/ambiguity)
       v
[6] C2–C5 Composition & Style Constraints Planner
       |  - Слияние PoeticProfile (форма/ритм) + User Brief (тема)
       |  - Опционально: VisualAnchor[] из Visual Library V1 (СТРОГО как STYLIZATION_ANCHOR)
       v
[7] C8 Rhyme Engine Generator & Verifier
       |  - Генерация черновика (Gemini API)
       |  - Прогонка через C6a/C6b Verifier (реальная проверка слогов/ударений/рифм)
       |  - Итоговый объект: стих + мораль + отчёт верификации + ссылки на источники
```

---

## 2. Параллельный поток Visual Library V1 (строго изолированный)

```text
VisualAnchor (19 стилизаций) + NarrativePattern (8 связей)
       |
       +--> Mode 1: Visual Generation Brief (независимо от книжного слоя)
       +--> Mode 2: Poem Illustration (лексический матчинг готового стиха к якорям)
       +--> Mode 3: Narrative Inspiration --[STYLIZATION_ONLY]--> [6] Composition Planner
```

**Запрещённые потоки данных (Architectural Prohibitions):**
- `VisualAnchor` **НИКОГДА** не поступает на вход `C1` или `C6a/C6b` как источник фактов о Пушкине.
- `BG-COMMENTARY` **НИКОГДА** не объединяется с `BG-APP-I` или `BG-MAIN-1831` в единый текстовый массив для подсчёта частоты слов/рифм.
- `SCANNED_PAGE` **НИКОГДА** не подаётся в `C1` с пустой строкой под видом успешного извлечения.
- `BOOK-NAV Classic V6 StructuralNode` (`FIGURE`/`TABLE`) **НИКОГДА** не засоряется поэтическими строками `VERSE_LINE`/`STANZA`.

---

## 3. Матрица маркировки происхождения данных (Provenance Tags)

| Тег | Значение | Где присваивается |
| :--- | :--- | :--- |
| `TEXT_LAYER_EXTRACTED` | Текст извлечён из цифрового слоя PDF с точным `pdf_page` и `source_hash` | `PushkinBookLayer` |
| `OCR_HUMAN_VERIFIED` | Текст распознан со скана и сверен человеком/редактором | Будущий OCR-пайплайн |
| `COMMENTARY_ASSERTED` | Научный подсчёт или тезис из комментария издания (напр. 43 рифменные пары) | `C1` / справочник издания |
| `COMPUTED_BY_ENGINE` | Метрика, детерминированно вычисленная парсером `C6a/C6b` | `C6a/C6b Analyzer` |
| `LLM_GENERATED` | Поэтический текст, созданный генеративной моделью | `C8 / geminiService` |
| `STYLIZATION_ANCHOR` | Художественный/визуальный мотив из Visual Library V1 | `visualLibraryService` |
