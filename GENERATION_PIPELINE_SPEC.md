# GENERATION_PIPELINE_SPEC — Спецификация source-grounded генерации (C8)

**Статус:** `DESIGNED` / `NOT IMPLEMENTED` (Stage G)

---

## 1. Два параллельных режима генерации

### Режим A — Legacy Compatibility Mode (`transformText`)
- Существующая функция `services/geminiService.ts -> transformText(text)` сохраняется без изменения сигнатуры и поведения для:
  - обычного запуска в Web UI;
  - `agent-interface/cli.ts generate`;
  - Режима 3 Visual Library (`transformTextWithVisualContext`).

### Режим B — Source-Grounded & Prosody-Verified Mode (`transformTextGrounded`, Stage G)
Принимает:
- `sourceText`: пользовательский ввод (тема, заметка, сцена);
- `targetProfileId`: профиль из `PUSHKIN_POETIC_PROFILE_SCHEMA.json` (`onegin_tetrameter_v1`, `boris_blank_iamb5_v1`, `lyric_elegy_v1`);
- `visualAnchors`: опциональные якоря из Visual Library V1 (передаются с явным разделением как `STYLIZATION_ANCHOR`);
- `verifyWithC6`: флаг программной проверки сгенерированного текста через Python-анализатор `C6a/C6b`;
- `maxRepairAttempts`: `0..2` (локальная коррекция строк, не прошедших проверку метра/рифмы).

## 2. Контракт результата (`GroundedTransformationResult`)

Расширяет `TransformationResult` (`poem`, `moral`, `originalText`) полями:
- `profile_used`: ID и ссылка на `witness` (напр. `PUSHKIN-BG-2008 / BG-APP-I`);
- `prosody_report`: честный отчёт `C6a/C6b` по сгенерированному стиху:
  - фактический определённый метр каждой строки;
  - число слогов и клаузулы;
  - оценка соответствия рифменной схеме (`ABAB` или `BLANK`);
  - список неоднозначных ударений (`AMBIGUOUS_STRESS`).
- `visual_anchors_used`: массив `anchor_id` с тегом `STYLIZATION_ANCHOR`.

## 3. Жёсткое правило честности

Если `C6a/C6b` не запущен (например, Python worker отключён или вызван legacy `transformText`), отчёт обязан указывать `verification_status: "UNVERIFIED_PROMPT_ONLY"`, как это уже реализовано в `agent-interface/cli.ts -> info`.
