# PRE_INTEGRATION_AUDIT — PushkinRhymeEngine (Baseline перед интеграцией PushkinBookLayer)

**Дата аудита:** 2026-11-20  
**Режим:** Pre-Integration Audit (без модификации рабочего кода приложения)  
**Статусы в документе:** `VERIFIED` · `IMPLEMENTED` · `PARTIALLY_VERIFIED` · `PLANNED` · `NOT IMPLEMENTED` · `UNSUPPORTED`

---

## 1. Резюме фактического состояния репозитория

На момент аудита репозиторий представляет собой клиентское React/TypeScript SPA-приложение на Vite (`Pushkin Rhyme Engine v2.0`) с CLI-адаптером для внешних ИИ-агентов и встроенной визуально-нарративной библиотекой (`Visual & Narrative Reference Library V1`).

**Ключевой вывод аудита:** в кодовой базе **отсутствуют** реализованные филологические/просодические модули `C1–C8`, парсеры книг, `BOOK-NAV Classic V6`, а также локальные PDF-корпуса произведений Пушкина. Текущий движок генерации работает исключительно через системный промпт Gemini API (`services/geminiService.ts -> transformText()`).

---

## 2. Матрица компонентов существующего приложения

| Компонент / Путь | Статус | Фактическая реализация и ограничения |
| :--- | :--- | :--- |
| **Web UI (`App.tsx`, `EngineVisualizer.tsx`, `OutputParchment.tsx`, `constants.tsx`, `types.ts`)** | `VERIFIED` | React 19 + Vite 6 + TS ~5.8. Две вкладки: «Рифменная машина» и «Художественная библиотека». `EngineStage` (`ANALYZING`, `ARCHAIZING`, `RHYTHM_MAPPING`, `RHYMING`, `STYLIZING`) в `App.tsx` (строки 67–72) представляет собой **визуальную 800ms-анимацию ожидания**, запущенную через `Promise.all` параллельно с одним вызовом API. |
| **Ядро генерации (`services/geminiService.ts`)** | `IMPLEMENTED` | Единственная функция `transformText(text: string): Promise<TransformationResult>`. Использует `@google/genai` (`gemini-3-pro-preview`), запрашивает JSON `{ poem, moral }` с системным промптом на 4-стопный ямб и перекрёстную рифму `ABAB`. Программной валидации метра/рифмы нет. |
| **Безопасность API-ключа (`vite.config.ts`)** | `VERIFIED` (риск зафиксирован) | В `vite.config.ts` (строки 13–16) `env.GEMINI_API_KEY` инлайнится в `process.env.API_KEY` при сборке клиентского бандла (применимо для локального AI Studio/dev, требует серверного прокси `/api/*` при переходе на full-stack/публичный деплой). В текущей среде `GEMINI_API_KEY` не задан. |
| **CLI и Agent Skill (`agent-interface/cli.ts`, `SKILL.md`, `skills/pushkin-rhyme-machine/`, `test_cli_agent_call.py`)** | `PARTIALLY_VERIFIED` | Команды `info`, `help`, валидация пустого текста, отсутствующего ключа и чтения из `stdin` проверены (`4/4` тестов в `test_cli_agent_call.py`). В `info` честно указано `programmatic_meter_validation: false`. Живой вызов `generate` не проверен из-за отсутствия `GEMINI_API_KEY`. |
| **Visual Library V1 (`services/visualLibraryService.ts`, `components/visual-library/*`, `data/visual-library/*`)** | `VERIFIED` | Содержит 19 реальных PNG-изображений в `public/assets/aistudio/*.png`, каталогизированных в `visual-anchors.json`, и 8 паттернов в `narrative-patterns.json`. Реализует Режим 1 (бриф открытки), Режим 2 (лексический подбор `matchPoemToAnchors()`), Режим 3 (контекстная обёртка `transformTextWithVisualContext()`, вызывающая неизменённую `transformText()`). Правки сохраняются в `localStorage`. |
| **Модули C1–C8** | `NOT IMPLEMENTED` | Поиск `grep` по всему дереву (исключая `node_modules` и загруженный bundle) подтвердил: в кодовой базе нет ни одного модуля C1–C8, алгоритма анализа ударений/слогов, рифмы, драматургических реплик или композиционного планировщика. |
| **BOOK-NAV Classic V6 / PushkinBookLayer** | `NOT IMPLEMENTED` | В репозитории нет файлов `BOOK-NAV Classic V6` и нет распакованного Python-пакета `PushkinBookLayer`. Имеется только исходная выгрузка `public/assets/aistudio/PushkinBookLayer_0.1_SOURCE_BUNDLE_16b676c0.md` (13 файлов). |
| **Литературные PDF-источники** | `NOT IMPLEMENTED` | В рабочем каталоге отсутствуют какие-либо `.pdf` файлы (включая `pushkin_vyp2_boris_godunov_2008.pdf`). |

---

## 3. Проверка среды исполнения (Runtime Audit)

Проверено непосредственно в контейнере 2026-11-20:
- **Node / Vite / TypeScript:** `package.json` содержит `react ^19.2.3`, `@google/genai ^1.34.0`, `vite ^6.2.0`, `typescript ~5.8.2`. Скрипт `"lint"` в `package.json` отсутствует (`lint_applet` завершается с `Script not found "lint"`). TypeScript (`npx tsc --noEmit`) и сборка (`vite build` / `compile_applet`) на текущем baseline проходят.
- **Python-окружение:** установлена версия `Python 3.11.2` (совместима с требованием `>=3.10` из `PushkinBookLayer/pyproject.toml`).
- **Зависимость `PyMuPDF` (`fitz`):** выполнена проверка `python3 -c "import fitz"` -> **`ModuleNotFoundError: No module named 'fitz'`** (`NOT VERIFIED` / не установлена в текущей среде).

---

## 4. Границы ответственности (Strict Separation of Concerns)

1. **Visual Library ≠ Литературный корпус:** 19 изображений в `public/assets/aistudio/*.png` — это современные романтизированные стилизации (Крым, Ялта, Бахчисарай). Они могут служить **только источником художественной атмосферы и визуальных мотивов**, но **никогда** не должны выступать текстологическим или биографическим доказательством.
2. **PushkinBookLayer ≠ Просодический движок:** книжный слой отвечает строго за получение, индексацию, разделение редакций/свидетелей, сохранение координат страниц и хешей (`WORK → EDITION → WITNESS → FRAGMENT`), но не вычисляет размер, рифму и ударения.
3. **Обратная совместимость:** `transformText()`, существующий Web UI (`App.tsx`), `agent-interface/cli.ts`, `SKILL.md` и все 3 режима Visual Library V1 должны продолжать работать без регрессий.
