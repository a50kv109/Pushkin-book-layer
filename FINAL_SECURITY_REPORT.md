# FINAL_SECURITY_REPORT — Финальный отчёт по безопасности и гигиене данных

**Дата:** 2026-11-20  
**Версия:** `v0.1.0-alpha` (`Stage C+`)

---

## 1. Аудит секретов и Gemini API

| Проверка | Результат | Подробности |
| :--- | :--- | :--- |
| Жёстко закодированные ключи API в исходниках | **НЕ ОБНАРУЖЕНО (`0`)** | Проверено поиском шаблонов (`AIzaSy` и др.) по всему дереву. |
| Файлы `.env` / `.env.local` в репозитории | **ОТСУТСТВУЮТ и ИГНОРИРУЮТСЯ** | Добавлен чистый шаблон `.env.example` с пустым `GEMINI_API_KEY=`. |
| Личный email и город/адрес в публичных файлах | **УСТРАНЕНЫ (`0`)** | Удалено упоминание города из `App.tsx:330` и `GITHUB_SECURITY_AUDIT.md:37`; личный email не включён ни в файлы, ни в Git-конфиг коммита (`noreply@pushkin-rhyme-engine.local`). |
| Клиентская сборка `vite.config.ts` | **ЗАДОКУМЕНТИРОВАННЫЙ РИСК (Stage G)** | `vite.config.ts` использует `define` для `process.env.API_KEY` и `process.env.GEMINI_API_KEY` ради локальной браузерной разработки. В `SECURITY.md`, `README.md` и `README_RU.md` зафиксирован запрет публичного хостинга `dist/` со встроенным ключом до переноса вызовов на серверный прокси (Этап G). |

---

## 2. Исключённые директории и артефакты (`.gitignore`)

Проверено, что следующие пути гарантированно не попадают в Git-индекс:
- `.env`, `.env.*` (кроме `.env.example`), `*.local`
- `node_modules/`, `dist/`, `dist-ssr/`
- `.venv/`, `book_layer/.venv/`, `__pycache__/`, `*.py[cod]`, `.pytest_cache/`
- `.aistudio/`, `migrated_prompt_history/`, `.local_backup/`
- `*.pdf` (в т.ч. черновой отчёт `PUSHKINBOOKLAYER_01_ENGINEERING_ADOPTION_REPORT.md_934a3f10.pdf`)
- 19 локальных AI-PNG и временный `PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md` перенесены из `public/assets/aistudio/` в `.local_backup/assets_aistudio/`.

---

## 3. Границы достоверности и безопасности данных

- **Образовательная безопасность:** зафиксирован принцип `POETIC FORM MUST NOT OVERRIDE FACTUAL ACCURACY` в `README.md`, `README_RU.md`, `SECURITY.md`, `CONTRIBUTING.md` и `ROADMAP.md`.
- **Текстологический контур:** `book_layer` и `source_validation` блокируют `SCANNED_PAGE`, `FAILED`, `PARTIAL`, комментарии, прозу и `PDF_TEXT_LINE_UNCLASSIFIED` от просодического анализа.
