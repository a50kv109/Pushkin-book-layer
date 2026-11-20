# Руководство по участию в разработке (Contributing)

Мы приветствуем вклад в развитие **PushkinRhymeEngine 2.0** — открытого образовательного и творческого поэтического движка. Проект сочетает React/TypeScript-фронтенд, агентный CLI и изолированную Python-инфраструктуру источниковедения, поэтому при внесении изменений важно соблюдать границы между подсистемами и правила точности.

---

## Как внести вклад

1. **Форкните репозиторий** и создайте тематическую ветку (`git checkout -b feat/my-change`).
2. **Проверьте зависимости и окружение:**
   - Node.js `>= 22.6` (`npm install`)
   - Python `>= 3.10` (`python3 -m venv book_layer/.venv && book_layer/.venv/bin/pip install "PyMuPDF>=1.24"`)
3. **Не коммитьте секреты, персональные данные и сторонние закрытые файлы:**
   - Никогда не добавляйте `.env`, `.env.local`, API-ключи, `book_layer/.venv/`, `node_modules/`, `dist/`, `.local_backup/`, локальные или защищённые авторским правом PDF-книги и сторонние изображения без подтверждённых прав на распространение.
4. **Обязательно запустите проверки перед Pull Request:**
   ```bash
   npx tsc --noEmit
   npm run build
   python3 test_cli_agent_call.py
   book_layer/.venv/bin/python -m unittest -v book_layer/tests/test_synthetic_book.py source_validation/tests/test_source_validation.py
   ```
5. **Оформите Pull Request** с честным указанием статуса проверок (`TESTED` vs `NOT_VERIFIED`).

---

## Инварианты архитектуры и достоверности

- **Точность фактов важнее формы:** `POETIC FORM MUST NOT OVERRIDE FACTUAL ACCURACY` — в образовательных и научных сценариях не искажайте формулы, определения и причинно-следственные связи ради рифмы.
- **Совместимость базовых точек входа:** сохраняйте контракт `services/geminiService.ts -> transformText()`, `Visual Library V1` и CLI v2.0 (`agent-interface/cli.ts`).
- **Разделение стилизации и текстологии:** не смешивайте художественные ориентиры (`Visual Library`) со свидетелями корпуса (`book_layer`).
- **Контроль допуска в `Source Validation`:** не допускайте `SCANNED_PAGE`, `FAILED`, `PARTIAL` и `PDF_TEXT_LINE_UNCLASSIFIED` к просодическому анализу (`prosodic_analysis_allowed == False`).
- **Честность статуса:** не заявляйте алгоритмическую проверку метра, ударений, рифмы или фактической точности, если она выполняется только промптом модели без детерминированного анализатора.

---

## Лицензирование вкладов

- Вклады в программный код принимаются под лицензией **MIT License** (`LICENSE`).
- Вклады в оригинальную документацию принимаются под лицензией **CC BY 4.0** (`LICENSE-DOCS`).
