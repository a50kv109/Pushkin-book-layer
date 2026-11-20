# Руководство по интеграции ИИ-агентов: Pushkin Rhyme Machine

Руководство для разработчиков агентных систем по подключению «Рифменной машины Пушкина» в качестве внешнего инструмента.

---

## 1. Способы вызова инструмента

Инструмент может вызываться агентом напрямую из командной строки или через скрипты автоматизации.

### 1.1. Базовые команды CLI

```bash
# Проверка параметров движка
node --experimental-strip-types agent-interface/cli.ts info

# Прямая трансформация строки
node --experimental-strip-types agent-interface/cli.ts generate --text "Вчера завершилась сборка ядра операционной системы."

# Трансформация через файл с сохранением в JSON
node --experimental-strip-types agent-interface/cli.ts generate --input /tmp/draft.txt --output /tmp/result.json

# Передача через пайплайн (stdin)
cat /tmp/draft.txt | node --experimental-strip-types agent-interface/cli.ts generate
```

Либо через скрипт `npm`:
```bash
npm run pushkin-rhyme -- generate --text "Текст сообщения"
```

---

## 2. Примеры вызова из языков программирования

### 2.1. Python (subprocess)
```python
import subprocess
import json

def generate_pushkin_rhyme(text: str) -> dict:
    cmd = [
        "node",
        "--experimental-strip-types",
        "agent-interface/cli.ts",
        "generate",
        "--text",
        text
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)

# Пример использования
output = generate_pushkin_rhyme("Сервер баз данных восстановил репликацию.")
print("Стихотворение:\n", output["data"]["poem"])
print("Мораль:\n", output["data"]["moral"])
```

### 2.2. Node.js / TypeScript (Child Process)
```typescript
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function makePoem(text: string) {
  const { stdout } = await execFileAsync('node', [
    '--experimental-strip-types',
    'agent-interface/cli.ts',
    'generate',
    '--text',
    text
  ]);
  return JSON.parse(stdout);
}
```

---

## 3. Подключение Skill к агентным системам

Чтобы агент обнаружил способность:
1. Скопируйте папку `skills/pushkin-rhyme-machine` в директорию навыков вашего агента (например, `.agent/skills/` или `.cursor/skills/`).
2. Убедитесь, что в окружении агента установлена переменная `GEMINI_API_KEY`.
3. При поступлении запросов на стихотворное оформление агент автоматически обратится к инструкции `SKILL.md` и выполнит CLI-команду.
