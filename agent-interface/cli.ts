#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

// 1. Ensure API_KEY is mapped from GEMINI_API_KEY if not already set
if (!process.env.API_KEY && process.env.GEMINI_API_KEY) {
  process.env.API_KEY = process.env.GEMINI_API_KEY;
}

// Check for local .env or .env.local if API_KEY is still not set
if (!process.env.API_KEY) {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...vals] = trimmed.split('=');
            const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
            if ((key === 'GEMINI_API_KEY' || key === 'API_KEY') && val) {
              process.env.API_KEY = val;
              break;
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }
    if (process.env.API_KEY) break;
  }
}

// 2. Parse arguments
const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
Pushkin Rhyme Machine CLI — Agent Interface v2.0

ИСПОЛЬЗОВАНИЕ:
  pushkin-rhyme <команда> [параметры]

КОМАНДЫ:
  generate       Преобразовать текст в стихотворение в стиле Пушкина
  info           Получить информацию о возможностях и параметрах движка
  help, --help   Показать эту справку

ПАРАМЕТРЫ ДЛЯ 'generate':
  --input, -i <путь>   Путь к файлу с исходным текстом (или передайте через stdin)
  --text, -t <текст>   Исходный текст непосредственно в аргументе
  --output, -o <путь>  Путь для сохранения результата в формате JSON (по умолчанию: stdout)
  --key, -k <ключ>     [УСТАРЕЛО/НЕ РЕКОМЕНДУЕТСЯ] Рекомендуется задавать GEMINI_API_KEY в окружении

ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ:
  GEMINI_API_KEY       Основной ключ доступа к Gemini API (рекомендуемый способ)
  API_KEY              Резервное имя переменной для совместимости

ПРИМЕРЫ:
  node agent-interface/cli.ts info
  export GEMINI_API_KEY="your-key"
  node agent-interface/cli.ts generate --text "Вчера упал сервер баз данных"
  node agent-interface/cli.ts generate --input draft.txt --output poem.json
  cat draft.txt | node agent-interface/cli.ts generate
`);
}

function printInfo() {
  const info = {
    name: "Pushkin Rhyme Machine",
    version: "2.0.0",
    engine: "PushkinRhymeEngine_v2.0",
    meter: "4-стопный ямб (задаётся системным промптом модели, без программного валидатора)",
    rhyme_scheme: "ABAB (перекрёстная, задаётся системным промптом)",
    stanza_size: 4,
    features: [
      "Классическая лексика и архаизмы XIX века",
      "Обязательный философский или ироничный вывод (мораль)",
      "Строгая 4-строчная строфика (катрены)",
      "Онегинская легкость слога"
    ],
    supported_models: ["gemini-3-pro-preview"],
    input_constraints: {
      min_length: 3,
      max_length: 4000
    },
    verification_notes: {
      programmatic_meter_validation: false,
      validation_mode: "prompt_guided_llm_generation"
    }
  };
  console.log(JSON.stringify(info, null, 2));
}

async function handleGenerate() {
  let inputText = '';
  let outputFile: string | null = null;
  let customApiKey: string | null = null;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--input' || arg === '-i') {
      const filePath = args[++i];
      if (!filePath || !fs.existsSync(filePath)) {
        console.error(JSON.stringify({
          success: false,
          error: `Файл ввода не найден: ${filePath}`
        }));
        process.exit(1);
      }
      inputText = fs.readFileSync(filePath, 'utf8');
    } else if (arg === '--text' || arg === '-t') {
      inputText = args[++i] || '';
    } else if (arg === '--output' || arg === '-o') {
      outputFile = args[++i] || null;
    } else if (arg === '--key' || arg === '-k') {
      console.warn("[ВНИМАНИЕ БЕЗОПАСНОСТИ]: Передача API-ключа через аргументы командной строки не рекомендуется, так как аргументы видны в списке процессов (ps aux). Используйте переменную окружения GEMINI_API_KEY.");
      customApiKey = args[++i] || null;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  // If no text provided via flags, try reading from stdin (if piped)
  if (!inputText && !process.stdin.isTTY) {
    try {
      inputText = fs.readFileSync(0, 'utf8');
    } catch {
      // stdin not available
    }
  }

  const trimmedText = inputText.trim();
  if (!trimmedText) {
    console.error(JSON.stringify({
      success: false,
      error: "Текст для трансформации не указан. Используйте --text, --input или передайте текст через stdin."
    }, null, 2));
    process.exit(1);
  }

  if (trimmedText.length > 4000) {
    console.error(JSON.stringify({
      success: false,
      error: `Превышен лимит длины текста: ${trimmedText.length} символов (максимум 4000).`
    }, null, 2));
    process.exit(1);
  }

  if (customApiKey) {
    process.env.API_KEY = customApiKey;
  }

  if (!process.env.API_KEY) {
    console.error(JSON.stringify({
      success: false,
      error: "Не задан API-ключ Gemini. Установите переменную окружения GEMINI_API_KEY (или API_KEY), либо передайте --key <ключ>."
    }, null, 2));
    process.exit(1);
  }

  try {
    // Dynamic import of the existing rhyme service
    const { transformText } = await import('../services/geminiService.ts');
    const result = await transformText(trimmedText);

    const outputPayload = {
      success: true,
      data: {
        poem: result.poem,
        moral: result.moral,
        originalText: result.originalText,
        engine: "PushkinRhymeEngine_v2.0"
      }
    };

    const outputJson = JSON.stringify(outputPayload, null, 2);

    if (outputFile) {
      fs.writeFileSync(outputFile, outputJson, 'utf8');
      console.log(JSON.stringify({
        success: true,
        message: `Результат успешно сохранен в файл: ${outputFile}`
      }));
    } else {
      console.log(outputJson);
    }
  } catch (err: any) {
    console.error(JSON.stringify({
      success: false,
      error: err.message || "Ошибка при выполнении трансформации текста."
    }, null, 2));
    process.exit(1);
  }
}

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  if (command === 'info') {
    printInfo();
    process.exit(0);
  }

  if (command === 'generate') {
    await handleGenerate();
    return;
  }

  console.error(`Неизвестная команда: ${command}`);
  printHelp();
  process.exit(1);
}

main();
