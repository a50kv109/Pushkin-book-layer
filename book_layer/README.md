# PushkinBookLayer 0.1 (Stage C Integration) — Literary PDF Adapter

Адаптированная и защищённая версия исходного прототипа `PushkinBookLayer 0.1` (`PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md`), развёрнутая в `/book_layer` на Этапе C проекта `PushkinRhymeEngine`.

## Происхождение и границы

- **Исходная база:** `PushkinBookLayer 0.1` (13 файлов исходного пакета).
- **Frozen Core:** не изменяет `BOOK-NAV Classic V6 Frozen Core` и не имитирует ещё не реализованные модули `C1`, `C6a/C6b`, `M8`, `C8`.
- **Ключевые доработки Этапа C:**
  1. Устранены жёсткие локальные пути `/mnt/data/...` в манифесте и скрипте сборки.
  2. Реализована явная обработка статуса `FAILED` при ошибках открытия/чтения/рендера PDF.
  3. Усилена программная защита `pipeline.to_c1_input()` против передачи `SCANNED_PAGE` и `FAILED`.
  4. Добавлены автономные синтетические PDF-тесты (`tests/test_synthetic_book.py`), выполняющиеся без внешнего PDF «Бориса Годунова», без Gemini API и без `skip`.

## Установка в изолированном окружении

```bash
python3 -m venv book_layer/.venv
book_layer/.venv/bin/pip install "PyMuPDF>=1.24"
```

## Запуск тестов

```bash
# Автономные синтетические тесты (без внешнего PDF, 0 skip):
book_layer/.venv/bin/python -m unittest discover -s book_layer/tests -p "test_synthetic*.py" -v

# Опциональный тест на оригинальном PDF «Бориса Годунова» (если файл доступен локально):
BORIS_PDF=/path/to/pushkin_vyp2_boris_godunov_2008.pdf book_layer/.venv/bin/python -m unittest book_layer/tests/test_adapter.py -v
```
