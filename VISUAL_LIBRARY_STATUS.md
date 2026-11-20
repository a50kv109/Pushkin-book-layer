# Статус готовности: Pushkin Visual & Narrative Reference Library V1

**Дата проверки:** Ноябрь 2026

---

## 1. Матрица статусов компонентов

| Компонент / Возможность | Статус | Фактическое основание |
| :--- | :--- | :--- |
| Инвентаризация 19 загруженных изображений (`/public/assets/aistudio/*.png`) | `VERIFIED` | Все 19 файлов визуально просмотрены, проверены размеры и форматы (`file`, `sha256sum`). |
| Формальная JSON-схема якоря (`VISUAL_ANCHOR_SCHEMA.json`) | `VERIFIED` | Схема создана и включает все 18 обязательных полей и расширения. |
| База визуальных якорей (`data/visual-library/visual-anchors.json`) | `VERIFIED` | Заполнена для всех 19 реальных файлов без фиктивных записей. |
| База повествовательных паттернов (`data/visual-library/narrative-patterns.json`) | `VERIFIED` | Определены 8 переиспользуемых сюжетных отношений. |
| Раздел UI «Художественная библиотека» (галерея, 11 категорий, поиск, детали, связанные якоря, ручное редактирование, мультивыбор) | `VERIFIED` | Реализовано в `VisualLibraryView.tsx`, `AnchorDetailModal.tsx`, `AddAnchorModal.tsx`; сохранение правок в `localStorage`. |
| Режим 1 — Visual Generation (синтез брифа для открытки) | `VERIFIED` | Реализован в `ModeStudioPanel.tsx` и `buildVisualGenerationBrief()`. |
| Режим 2 — Poem Illustration (подбор иллюстраций к стиху) | `VERIFIED` | Реализован через прозрачный лексический алгоритм `matchPoemToAnchors()`. |
| Режим 3 — Narrative Inspiration (передача якорей в `transformText()`) | `IMPLEMENTED` | Контекстная сборка и вызов `transformText()` подключены; живой сетевой вызов к Gemini зависит от наличия `GEMINI_API_KEY`. |
| Сохранение старого UI, `transformText()`, CLI и Agent Skill | `VERIFIED` | `services/geminiService.ts`, `agent-interface/cli.ts` и `SKILL.md` не изменены; сборка и CLI проверены. |
| Автоматическая ИИ-классификация новых произвольно загружаемых изображений с диска | `PLANNED` | В V1 новые пользовательские якоря заполняются вручную через `AddAnchorModal` без автоматического vision-вызова. |
| Встроенная генерация растровых картинок по брифу Режима 1 | `UNSUPPORTED` | Режим 1 формирует готовый композиционный промпт-бриф для копирования, не выполняя прямую растровую генерацию. |

---

## 2. Итоги проверок

- **TypeScript typecheck (`npx tsc --noEmit`):** `VERIFIED` — завершён с кодом `0`, ошибок типизации нет.
- **Production build (`compile_applet` / Vite build):** `VERIFIED` — сборка React-приложения завершена успешно.
- **Сервисные проверки библиотеки (Bun runtime check):** `VERIFIED` — подтверждено наличие всех 19 файлов на диске в `public/assets/aistudio/`, фильтрация по всем 11 категориям, синтез брифа (Режим 1), лексический подбор иллюстраций (Режим 2) и сборка контекста (Режим 3).
- **CLI-тесты (`python3 test_cli_agent_call.py`):** `VERIFIED` — пройдены 4 из 4 тестов внешнего агентного вызова; CLI и Agent Skill не нарушены.
- **Живой сетевой вызов Gemini API с визуальным контекстом (Режим 3):** `IMPLEMENTED` — программная передача контекста в неизменённую функцию `transformText()` реализована, но живой запрос к API не выполнялся в данной среде из-за отсутствия `GEMINI_API_KEY`.
