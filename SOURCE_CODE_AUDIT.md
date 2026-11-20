# SOURCE_CODE_AUDIT — Аудит исходного кода PushkinBookLayer 0.1

**Аудируемый источник:** `/public/assets/aistudio/PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md` (текстовая выгрузка архива `PushkinBookLayer-0.1_2 (2).zip`, 13 файлов).  
**Статусы аудита:** `IMPLEMENTED` · `TESTED` · `DOCUMENTED` · `NOT IMPLEMENTED` · `NOT VERIFIED`

---

## 1. Резюме понимания архитектуры (Phase 1 Comprehension)

`PushkinBookLayer 0.1` — изолированный Python-прототип (`requires-python >= 3.10`, зависимость `PyMuPDF>=1.24`) для приема литературных PDF-изданий, фиксации библиографической и постраничной provenance-информации, разделения текстологических свидетелей (witnesses) и передачи верифицированных текстовых фрагментов в будущий слой `C1`.

Принципиальные правила, заложенные в коде и документации:
1. **Изоляция от BOOK-NAV Classic V6:** замороженный контракт `StructuralNode` (`FIGURE`/`TABLE`) и `POST /api/materialize` не модифицируется; литературная иерархия вынесена в собственные dataclass-модели (`book_models.py`).
2. **Разделение физической и печатной пагинации:** `PageReference` хранит 1-индексированную `pdf_page` отдельно от `printed_page` и `page_role`.
3. **Разделение свидетелей (Textual Witnesses):** в издании «Борис Годунов» (2008, под ред. Д. Бетеа, 577 стр.) строго разделены:
   - `BG-MAIN-1831` (pp. 12–155, сканированное факсимиле издания 1831 г., `SCANNED_PAGE`, без текстового слоя);
   - `BG-APP-I` (pp. 158–248, ранняя редакция «Комедия о царе Борисе и о Гришке Отрепьеве», `TEXT_LAYER`, 83 909 символов);
   - `BG-APP-II` (pp. 249–253 в коде / pp. 249–252 непустых в манифесте, наброски предисловия, `TEXT_LAYER`, 6 256 символов);
   - `BG-COMMENTARY` (pp. 256–571, историко-литературный комментарий, `PARTIAL`);
   - `BG-INDEX` (pp. 572–575, указатель, `PARTIAL`).
4. **Отсутствие ложных филологических заявлений:** `extract_source_lines()` маркирует каждую строку как `PDF_TEXT_LINE_UNCLASSIFIED`; `pipeline.py` не вычисляет метр, ударения или рифмы.

---

## 2. Пофайловый аудит всех 13 файлов прототипа (Phase 2 Audit)

| # | Файл | Статус | Детальный разбор, ограничения и расхождения |
| :-: | :--- | :--- | :--- |
| 1 | `PushkinBookLayer/pyproject.toml` | `IMPLEMENTED`, `NOT VERIFIED` | Объявляет `pushkin-book-layer` `0.1.0`, `requires-python >=3.10`, `PyMuPDF>=1.24`. В текущей среде `fitz` не установлен (`ModuleNotFoundError`), установка не тестировалась. |
| 2 | `PushkinBookLayer/README.md` | `DOCUMENTED` | Корректно описывает границы прототипа, команду запуска с `BORIS_PDF` и статус: первая текстовая фикстура — Приложение I, а не основной скан 1831 г. Ограничение: предполагает наличие локального PDF и `pymupdf`. |
| 3 | `PushkinBookLayer/src/__init__.py` | `IMPLEMENTED` | Минимальный docstring пакета. Экспорт публичного API (`__all__`) не определён. |
| 4 | `PushkinBookLayer/src/book_models.py` | `IMPLEMENTED` | Определяет `NodeKind` (`WORK`, `PART`, `CHAPTER`, `SONG`, `SCENE`, `STANZA`, `LINE`, `COMMENTARY`, `APPENDIX`), `ExtractionStatus` (`TEXT_LAYER`, `SCANNED_PAGE`, `PARTIAL`, `FAILED`), frozen dataclasses `SourceDocument`, `PageReference`, `BookNode`, `TextFragment` (с методом `.to_dict()`). **Расхождение:** `BORIS_GODUNOV_POETICS_NOTES.md` рекомендует `EDITION_WITNESS`, `SPEAKER_TURN`, `VERSE_LINE`, `PROSE_BLOCK`, `STAGE_DIRECTION`, но их нет в `NodeKind`. |
| 5 | `PushkinBookLayer/src/book_nav_adapter.py` | `IMPLEMENTED`, `NOT VERIFIED` | Реализует `sha256_file`, `BookNavAdapter` (`page_text`, `page_reference`, `render_page`, `extract_page_fragment`, `extract_range`, `close`), `build_boris_godunov_manifest`, `extract_source_lines`, `search_nodes`. **Ограничения и расхождения:** (a) статус `FAILED` объявлен в `ExtractionStatus`, но нигде не возвращается при ошибках чтения/рендера; (b) `language='ru'` захардкожен в `SourceDocument`; (c) `build_boris_godunov_manifest()` захардкожен под 577-страничный том 2008 г. и не универсален для других книг; (d) `extract_source_lines()` берёт только `fragment.page_refs[0]` и не поддерживает многостраничные фрагменты; (e) `search_nodes()` использует наивный substring-поиск `t in corpus` (возможны ложные срабатывания внутри длинных слов) без лемматизации. |
| 6 | `PushkinBookLayer/src/build_boris_manifest.py` | `IMPLEMENTED`, `NOT VERIFIED` | CLI-скрипт генерации компактного JSON-манифеста. Намеренно обнуляет `text` и записывает `indexed_text_chars`. **Расхождение:** принимает путь к PDF позиционным аргументом и сохраняет его буквально в `source_document.pdf_path`, что приводит к непереносимым путям (например, `/mnt/data/...`). Не тестировался в `test_adapter.py`. |
| 7 | `PushkinBookLayer/src/pipeline.py` | `IMPLEMENTED`, `NOT VERIFIED` | Определяет `C1Input` и `to_c1_input(fragment)`. **Пробелы контракта:** (a) теряет `fragment.node_id`, `context_before`, `context_after`; (b) поле названо `source_document`, но получает `fragment.document_id` (строку ID, а не метаданные издания); (c) **не блокирует передачу `SCANNED_PAGE` или `FAILED`** — функцию `to_c1_input()` можно вызвать с пустым текстом скана, если внешний роутер сам не проверит `extraction_status`. |
| 8 | `PushkinBookLayer/tests/test_adapter.py` | `IMPLEMENTED`, `NOT VERIFIED` (0 выполнено) | Содержит 5 unit-тестов (`TestBorisBookAdapter`), но весь класс закрыт `@unittest.skipUnless(PDF and os.path.exists(PDF))`. Без внешнего PDF **не выполняется ни один тест**. Кроме того, `extract_range()`, `build_boris_manifest.py`, `to_c1_input()` для `SCANNED_PAGE`, `FAILED` и boundary errors (`IndexError`, `ValueError`) не покрыты тестами даже с синтетическими PDF/моками. |
| 9 | `PushkinBookLayer/data/boris_godunov_2008_manifest.json` | `IMPLEMENTED` (артефакт), `NOT VERIFIED` | Содержит метаданные 577-стр. PDF (`sha256: 3c63cd83...`), узлы `BG-2008`, `BG-MAIN-1831`, `BG-APP-I`, `BG-APP-II`, `BG-COMMENTARY`, `BG-INDEX`. **Расхождения:** (a) `pdf_path` захардкожен как `/mnt/data/pushkin_vyp2_boris_godunov_2008.pdf`; (b) в `INTEGRATION_CONTRACT.md` для Приложения II указаны pp. 249–253, а в манифесте `page_refs` содержат pp. 249–252 (стр. 253, вероятно, пуста, но это не отражено явно в `source_note`); (c) полный текст в JSON не хранится (`text: null`), поэтому автономное чтение стихов без исходного PDF из этого манифеста невозможно. |
| 10 | `PushkinBookLayer/docs/ARCHITECTURE.md` | `DOCUMENTED` | Чётко фиксирует границы с `BOOK-NAV Classic V6`, состояния извлечения, provenance и правило «рендер ≠ OCR». |
| 11 | `PushkinBookLayer/docs/BORIS_GODUNOV_2008_AUDIT.md` | `DOCUMENTED` | Честно фиксирует, что основной текст 1831 г. — скан, на стр. 74–75 присутствует водяной знак электронной библиотеки Пушкинского Дома, а рабочая текстовая фикстура — только Приложение I (стр. 158–248). |
| 12 | `PushkinBookLayer/docs/BORIS_GODUNOV_POETICS_NOTES.md` | `DOCUMENTED` | Пересказ комментария Бетеа/Тимофеева/Шоу (PDF pp. 346–353): белый 5-ст. ямб, 5 прозаических сцен, 2 смешанные, 43 рифменные пары, 8% перебоев, полиритмия по сценам. Корректно требует маркировать эти факты как `COMMENTARY_ASSERTED`, а не `COMPUTED_BY_ENGINE`. **Расхождение с кодом:** описанная модель `WORK → EDITION_WITNESS → PART → SCENE → SPEAKER_TURN → (VERSE_LINE | PROSE_BLOCK | STAGE_DIRECTION | SONG)` пока отсутствует в `book_models.py`. |
| 13 | `PushkinBookLayer/docs/INTEGRATION_CONTRACT.md` | `DOCUMENTED` | Формулирует правила маршрутизации `TEXT_LAYER` / `SCANNED_PAGE` / `PARTIAL` / `FAILED`, предупреждает об артефактах переноса строк (`PDF_TEXT_LINE_UNCLASSIFIED`) и запрещает передачу в C2/C3 до ревью сегментации. В коде `pipeline.py` эти правила пока декларативны и программно не энфорсятся. |

---

## 3. Что НЕ реализовано в PushkinBookLayer 0.1 (`NOT IMPLEMENTED`)

1. **OCR-конвейер** для сканированного основного текста 1831 года (PDF pp. 12–155).
2. **Сегментатор драматургического и лирического текста:** извлечение `SCENE`, `SPEAKER_TURN`, `STAGE_DIRECTION`, `VERSE_LINE`, `PROSE_BLOCK`, `SONG` и реконструкция перебоев (разрывов одной стихотворной строки между репликами).
3. **Аналитический слой C6a/C6b (Метр, Ритм, Ударения, Рифма, Фонетика)** и любые профили стихотворной речи.
4. **Межпроцессный мост (Bridge / API)** между Python (`PushkinBookLayer`) и Node.js / React (`PushkinRhymeEngine`).
5. **Универсальный конфигурационный билдер изданий** (пока поддержана только жёстко зашитая карта «Бориса Годунова» 2008 года).
6. **Синтетический тестовый корпус**, позволяющий запускать CI-тесты без проприетарного внешнего 577-страничного PDF.
