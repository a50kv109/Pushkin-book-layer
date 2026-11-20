# GITHUB_PUBLICATION_READINESS — Итоговый отчёт готовности к публикации `v0.1.0-alpha`

**Дата проверки:** 2026-11-20  
**Рекомендуемый тег пре-релиза:** `v0.1.0-alpha` (публикация и GitHub Release **не выполнялись**).

---

## 1. Результаты верификации (фактический прогон 2026-11-20)

| Проверка | Статус | Фактический результат |
| :--- | :--- | :--- |
| TypeScript (`npx tsc --noEmit`) | `TESTED` (PASSED) | Exit code `0`, ошибок нет. |
| Сборка приложения (`npm run build` / `vite build`) | `TESTED` (PASSED) | 49 модулей, `dist/` собран за `3.77s` (предупреждение Vite об отсутствии `/index.css` при сборке некритично — используется CDN Tailwind). |
| Агентный CLI (`python3 test_cli_agent_call.py`) | `TESTED` (PASSED) | `4/4` офлайн-тестов пройдены (`info`, пустой текст, отсутствие ключа, `stdin`). |
| Stage C Python (`book_layer` + `source_validation`) | `TESTED` (PASSED) | `13/13` автономных тестов пройдены (`0.088s`, **`0 skipped`**, синтетический PDF + схема `SourceEvidencePackage`). |
| Оригинальный тест внешнего PDF (`book_layer/tests/test_adapter.py`) | `NOT_VERIFIED` | `5/5` тестов пропущены (`BORIS_PDF` отсутствует в среде). |
| Живой вызов Gemini API (`transformText` / `cli generate`) | `NOT_VERIFIED` | `GEMINI_API_KEY` отсутствует в среде; реальный сетевой ответ модели не проверялся. |
| Проверка секретов и `.env.local` | `TESTED` (CLEAN) | `.env*` на диске нет; API-ключи в исходниках не найдены. |

---

## 2. Что готово к публикации

- Рабочий код UI, `Visual Library V1`, CLI v2.0, `/book_layer` и `/source_validation` без модификаций архитектуры и с подтверждёнными тестами (`13/13` Stage C + `4/4` CLI + `tsc` + `vite build`).
- Полный комплект GitHub-документации (`README.md`, `README_RU.md`, `ARCHITECTURE.md` с честной Mermaid-диаграммой, `ROADMAP.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `docs/PROJECT_STATUS.md`) и черновик релиза `GITHUB_RELEASE_DRAFT.md`.
- Полное устранение жёстких путей `/mnt/data/...` из кода и манифеста `boris_godunov_2008_manifest.json`.

---

## 3. Что требует исправления ДО публичного пуша (Блокеры)

1. **Инициализация Git:** в контейнере `.git` отсутствует — нужно выполнить `git init`, настроить ветку `main`, сделать первичный чистый коммит и только затем тег `v0.1.0-alpha`.
2. **Файл `LICENSE` и конфликт лицензий:**
   - Корневой `LICENSE` отсутствует.
   - `App.tsx` (футер) указывает `Creative Commons Attribution-ShareAlike 4.0`, тогда как для кода рассматривается `MIT`.
   - Требуется решение владельца по правам распространения **19 PNG-изображений** (`public/assets/aistudio/*.png`, ИИ-генерации), прежде чем добавлять `LICENSE`.
3. **Исключение служебных артефактов AI Studio:**
   - Добавить `/.aistudio/` и `/migrated_prompt_history/` в `.gitignore` (или удалить их перед первым коммитом).
   - Удалить внутренние материалы аудита, не предназначенные для публичного релиза (в частности `public/assets/aistudio/PUSHKINBOOKLAYER_01_ENGINEERING_ADOPTION_REPORT.md_934a3f10.pdf` и при необходимости исходный бандл `PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md`, поскольку код уже перенесён в `/book_layer`).
4. **Проверка персональных данных и метаданных автора:** подтвердить публикацию имени/города автора в `App.tsx`, `OutputParchment.tsx`, `services/geminiService.ts` и наличие `bun.lock` рядом с `package.json`.

---

## 4. Какие файлы нельзя публиковать

- `.aistudio/` (артефакты рабочей сессии AI Studio)
- `migrated_prompt_history/` (история промпта миграции)
- `public/assets/aistudio/PUSHKINBOOKLAYER_01_ENGINEERING_ADOPTION_REPORT.md_934a3f10.pdf` (черновой отчёт с расхождениями)
- `node_modules/`, `dist/`, `book_layer/.venv/`, `__pycache__/`, `.env.local` (уже в `.gitignore`)
- Любые сторонние `.pdf` книжных изданий (включая `pushkin_vyp2_boris_godunov_2008.pdf` — в репо отсутствуют)

---

## 5. Остающиеся риски

- **`vite.config.ts` инлайнит `GEMINI_API_KEY` в клиентский бандл при сборке с ключом** — безопасно только пока репозиторий публикует исходники без `dist/` и `.env.local`; публичный веб-хостинг требует серверного прокси (Stage G).
- **Живой Gemini API и реальный PDF «Бориса Годунова» остаются `NOT_VERIFIED`** в текущей среде (отсутствуют ключ и PDF).
- **Ожидание аналитического ядра:** публикация `v0.1.0-alpha` должна честно позиционироваться именно как alpha-фундамент (`Book Layer` + `Source Validation` + генератор), без обещаний готового анализатора стиха (`C1`–`C8` — `PLANNED`).
