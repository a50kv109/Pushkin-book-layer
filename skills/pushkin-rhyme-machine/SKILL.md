---
name: pushkin-rhyme-machine
description: Transforms modern prose, news, stories, or technical descriptions into classical 19th-century Russian poetry in the style of Alexander Pushkin using the local Pushkin Rhyme Machine engine.
---

# Pushkin Rhyme Machine Skill

## 1. Overview and Purpose

This skill allows an AI agent to leverage the local **Pushkin Rhyme Machine** engine to transform arbitrary text (prose, news, technical notes, everyday anecdotes) into 19th-century classical Russian poetry.

The engine guides the output towards:
- **Metric:** Iambic tetrameter (4-стопный ямб, 01 01 01 01).
- **Rhyme Scheme:** Alternating cross-rhyme (перекрестная рифма ABAB).
- **Stanza:** 4-line stanzas with classical lyrical flow.
- **Lexicon:** Archaic 19th-century Russian poetic vocabulary.
- **Moral:** An obligatory philosophical or witty ironic moral conclusion.

> **Verification note for agents:**  
> These poetic constraints are implemented via generative system instructions in Google Gemini (`services/geminiService.ts`). There is **no deterministic algorithmic parser** or mathematical syllable validator in the codebase. Adherence is probabilistic and prompt-guided.

---

## 2. When to Use This Skill

Use this skill when:
- The user requests to turn an event, story, bug report, news article, or note into a poem in Pushkin's style.
- The user asks for a poetic stylization using classical Russian poetic conventions.
- The user explicitly mentions the "Pushkin Rhyme Machine", "рифменная машина", or "стихи в стиле Пушкина".

---

## 3. When NOT to Use This Skill

Do NOT use this skill when:
- The user requests an independent algorithmic rhyme or meter verification tool (`analyze_rhyme`). No such programmatic analyzer exists in the repository.
- The user asks for factual, analytical, or dry technical assistance without poetic form.
- The user requests free verse, blank verse, rap, haiku, or 20th-century avant-garde poetry.
- The user requests standard literal multi-language translation without poetic transformation.
- The input is purely code or binary data with no narrative or semantic content.

---

## 4. How the Agent Invokes the Engine

The agent executes the engine via the local CLI interface:

### 4.1. Inspecting Engine Status
```bash
node --experimental-strip-types agent-interface/cli.ts info
```
Returns metadata regarding the engine, supported meter, and stanza constraints.

### 4.2. Generating Poetry from Inline Text
```bash
node --experimental-strip-types agent-interface/cli.ts generate --text "Пользовательский текст"
```

### 4.3. Generating Poetry from a File
```bash
node --experimental-strip-types agent-interface/cli.ts generate --input /path/to/source.txt --output /path/to/result.json
```

### 4.4. Via npm Script
```bash
npm run pushkin-rhyme -- generate --text "Пользовательский текст"
```

---

## 5. Input Requirements & Constraints

- **Input format:** UTF-8 plain text in Russian or other languages (the engine translates and transforms into Russian verse).
- **Length constraints:** Minimum 3 characters, maximum 4,000 characters.
- **Environment:** Requires `GEMINI_API_KEY` (or `API_KEY`) to be set in the process environment.
  *(Security note: passing API keys via command-line arguments is deprecated because process arguments are visible in OS process tables such as `ps aux`).*

---

## 6. Output Contract

On success, the CLI outputs a JSON structure:
```json
{
  "success": true,
  "data": {
    "poem": "Текст стихотворения, разделенный на строфы...",
    "moral": "Финальная мораль...",
    "originalText": "Исходный текст...",
    "engine": "PushkinRhymeEngine_v2.0"
  }
}
```

On failure, the CLI exits with non-zero code and returns:
```json
{
  "success": false,
  "error": "Описание ошибки"
}
```

---

## 7. Presentation Guidelines for the Agent

When presenting the result to the user:
1. Present the poem clearly, preserving line breaks and stanza divisions.
2. Highlight the concluding moral as an epilogue.
3. If requested, provide a brief comparison with the original input text.
4. If the CLI fails (e.g. missing API key), explain the issue clearly to the user without exposing internal stack traces.
