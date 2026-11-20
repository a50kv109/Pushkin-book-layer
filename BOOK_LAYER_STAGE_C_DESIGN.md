# BOOK_LAYER_STAGE_C_DESIGN — Архитектурный проект Этапа C

**Статус:** `PROPOSED` (утверждено пользователем с тремя обязательными условиями; код Этапа C не пишется до финального подтверждения)  
**Граница этапа:** исключительно автономная Python-подсистема приёма источников, шлюза валидации и контракта `SourceEvidencePackage`. Без `C1/M8`-заглушек и без Node/Express-моста.

---

## 1. Целевая структура каталогов (Минимальная и изолированная)

```text
PushkinRhymeEngine/
├── book_layer/                         # [NEW Stage C] Изолированный Python-пакет
│   ├── pyproject.toml                  # Зависимости (PyMuPDF>=1.24, опц. pytest)
│   ├── README.md
│   ├── src/
│   │   ├── __init__.py
│   │   ├── book_models.py              # SourceDocument, PageReference, BookNode, TextFragment
│   │   ├── book_nav_adapter.py         # Исправлена обработка FAILED, без хардкода /mnt/data
│   │   ├── build_boris_manifest.py     # Переносимый CLI сборщик манифеста
│   │   └── pipeline.py                 # extract_source_lines(), to_c1_input() с guard'ами
│   ├── data/
│   │   └── boris_godunov_2008_manifest.json  # Очищенный от локального пути /mnt/data
│   ├── docs/
│   │   ├── ARCHITECTURE.md
│   │   ├── BORIS_GODUNOV_2008_AUDIT.md
│   │   ├── BORIS_GODUNOV_POETICS_NOTES.md
│   │   └── INTEGRATION_CONTRACT.md
│   └── tests/
│       ├── test_adapter.py             # Оригинальные 5 тестов для внешнего BORIS_PDF
│       └── test_synthetic_book.py      # [NEW] Обязательные автономные тесты без skip
│
├── source_validation/                  # [NEW Stage C] Независимый шлюз качества и контракт
│   ├── __init__.py
│   ├── models.py                       # SourceEvidencePackage, ValidationDecision, SourceClass
│   ├── validator.py                    # Детерминированные правила допуска semantic/prosodic
│   └── tests/
│       └── test_source_validation.py   # Проверка всех статусов и граничных правил
│
├── services/                           # [UNTOUCHED] geminiService.ts, visualLibraryService.ts
├── components/                         # [UNTOUCHED] UI и Visual Library V1
├── agent-interface/                    # [UNTOUCHED] CLI v2.0
└── ...
```

**Обоснование структуры:**
- `book_layer/` полностью сохраняет внутреннюю структуру и происхождение `PushkinBookLayer 0.1` (`src/`, `data/`, `docs/`, `tests/`, `pyproject.toml`), устраняя лишь дефекты переносимости и обработки ошибок.
- `source_validation/` выделен в отдельный пакет рядом, а не внутрь `book_layer`, чтобы контракт `SourceEvidencePackage` оставался независимым от конкретной библиотеки парсинга PDF и был готов к стыковке с будущими `C1` и `M8`.

---

## 2. Исправление 6 дефектов `PushkinBookLayer 0.1`

1. **Устранение жёсткого пути `/mnt/data/...`:**
   - В `build_boris_manifest.py` и `boris_godunov_2008_manifest.json` поле `pdf_path` в сериализованном манифесте хранит не абсолютный путь с машины сборки, а переносимый идентификатор/имя файла (например, `env:BORIS_PDF` или `pushkin_vyp2_boris_godunov_2008.pdf`), при этом `pdf_sha256` и `page_count` остаются точным криптографическим идентификатором источника.
2. **Обработка статуса `FAILED`:**
   - В `BookNavAdapter` добавляется безопасная обёртка вокруг `fitz.open`, `get_text` и `render_page`: при повреждённой странице, ошибке чтения/декодирования или I/O-исключении `extract_page_fragment()` возвращает `TextFragment` со статусом `FAILED` и пустым текстом (либо структурированную ошибку с `extraction_status='FAILED'`), а не падает непредсказуемо.
3. **Защита от передачи сканов и ошибок в `pipeline.py`:**
   - `to_c1_input()` больше не пропускает `SCANNED_PAGE` или `FAILED` молча. При попытке передать неподходящий фрагмент выбрасывается явное исключение `SourceValidationError` или требуется прохождение через `source_validation.validate_fragment()`.
4. **Воспроизводимость `PyMuPDF` и автономный режим тестов:**
   - Установка `PyMuPDF` фиксируется в `book_layer/pyproject.toml`; в `test_synthetic_book.py` на лету генерируется мини-PDF во временной директории (через `fitz.open()` при наличии `fitz`, а для логики `source_validation` — и без `fitz`), содержащий страницу `TEXT_LAYER`, пустую скан-страницу `SCANNED_PAGE`, частичную структуру `PARTIAL` и симулированный `FAILED`. Ни один из автономных тестов не использует `@unittest.skip`.
5. **Сохранение границ драматургии:**
   - На Этапе C парсер `SCENE / SPEAKER_TURN / VERSE_LINE / PROSE_BLOCK / STAGE_DIRECTION` **не реализуется** (остаётся на Этап D), но `SourceEvidencePackage` уже включает `source_class` и `prosodic_analysis_allowed = False` для неклассифицированных PDF-строк.

---

## 3. Независимый контракт `SourceEvidencePackage` и два разрешения анализа

`source_validation/validator.py` принимает `TextFragment` (+ опционально `BookNode` / `SourceDocument` метаданные и флаг верифицированности сегментации) и порождает `SourceEvidencePackage` (схема: `SOURCE_EVIDENCE_PACKAGE_SCHEMA.json`).

### 3.1. Обязательные поля `SourceEvidencePackage`
- `package_version`: `"1.0.0"`
- `work_id`: идентификатор произведения (напр. `"PUSHKIN_BORIS_GODUNOV"`)
- `edition_id`: идентификатор издания (напр. `"PUSHKIN-BG-2008"`)
- `witness_id`: идентификатор свидетеля (`"BG-MAIN-1831"`, `"BG-APP-I"`, `"BG-APP-II"`, `"BG-COMMENTARY"`)
- `page_ref`: список `{ pdf_page, printed_page, page_role }`
- `fragment_id`: идентификатор фрагмента
- `source_hash`: SHA-256 текста фрагмента (и опционально `document_sha256`)
- `extraction_status`: `"TEXT_LAYER" | "SCANNED_PAGE" | "PARTIAL" | "FAILED"`
- `line_semantics`: `"PDF_TEXT_LINE_UNCLASSIFIED" | "VERIFIED_VERSE_LINE" | "VERIFIED_PROSE_BLOCK" | "MIXED_UNVERIFIED"`
- `source_class`: `"PRIMARY_CANONICAL_TEXT" | "EARLY_REDACTION" | "AUTHORIAL_DRAFT" | "EDITORIAL_COMMENTARY" | "INDEX_OR_METADATA" | "SYNTHETIC_FIXTURE"`
- `text`: извлечённый текст (обязательно `""` для `SCANNED_PAGE` и `FAILED`)
- `semantic_analysis_allowed`: `bool`
- `prosodic_analysis_allowed`: `bool`
- `blocking_reasons`: список строгих причин блокировки (если хотя бы одно разрешение `false`)

### 3.2. Таблица маршрутизации защитных статусов (`PROPOSED`)

| Состояние / Класс источника | `semantic_analysis_allowed` | `prosodic_analysis_allowed` | Обоснование |
| :--- | :---: | :---: | :--- |
| `TEXT_LAYER` + `PDF_TEXT_LINE_UNCLASSIFIED` (худож. текст) | **`True`** | **`False`** | Смысловые темы/персонажи извлечь можно, но PDF-переносы ещё не доказаны как стиховые строки. |
| `TEXT_LAYER` + `VERIFIED_VERSE_LINE` (после будущего C1) | **`True`** | **`True`** | Подтверждённые стиховые строки пригодны и для семантики, и для метра/рифмы. |
| `TEXT_LAYER` + `EDITORIAL_COMMENTARY` | **`True`** (только как контекст/гипотеза) | **`False`** | Комментарий не должен попадать в расчёты стихотворного профиля поэта. |
| `PARTIAL` (известны границы, неполный текст) | **`True`** (с пометкой неполноты) | **`False`** | Нельзя экстраполировать статистику метра/рифм по неполному фрагменту. |
| `SCANNED_PAGE` (без верифицированного OCR) | **`False`** | **`False`** | Пустой текст скана запрещено передавать в анализ как извлечённый. |
| `FAILED` (ошибка чтения/рендера) | **`False`** | **`False`** | Немедленная остановка и эскалация ошибки. |

**Важно:** в Этапе C **не создаются** фиктивные модули `C1` или `M8`. Пакет `source_validation` выдаёт `SourceEvidencePackage`, полностью готовый к приёму будущими модулями `C1` и `M8`.
