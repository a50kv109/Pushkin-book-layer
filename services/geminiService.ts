
import { GoogleGenAI, Type } from "@google/genai";
import { TransformationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function transformText(text: string): Promise<TransformationResult> {
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    Вы — модуль 'PushkinRhymeEngine_v2.0', созданный Арцыбашевым Андреем Алексеевичем.
    Ваша задача: трансформировать любой входной текст в классическую поэзию XIX века в стиле А.С. Пушкина.
    
    СТРОГИЕ ПРАВИЛА:
    1. Лексика: Используйте архаизмы (очи, персты, ланиты, внемли, глас, чело и т.д.).
    2. Метрика: Строгий 4-стопный ямб (01 01 01 01).
    3. Рифмовка: Перекрестная рифма (ABAB).
    4. Структура: Строфы по 4 строки.
    5. Стиль: Онегинская легкость, возвышенный слог, обращения к читателю или музам.
    6. Мораль: Обязательный философский или ироничный вывод в конце.
    
    Вы должны вернуть результат строго в формате JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Преобразуй следующий текст: "${text}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poem: { 
              type: Type.STRING, 
              description: "Само стихотворение, разделенное на строфы переносами строк." 
            },
            moral: { 
              type: Type.STRING, 
              description: "Финальная мораль." 
            }
          },
          required: ["poem", "moral"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      poem: result.poem,
      moral: result.moral,
      originalText: text
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Не удалось вдохновить музу. Попробуйте снова.");
  }
}
