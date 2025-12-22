import { Inject, Injectable } from "@nestjs/common";
import { ChatOllama } from "@langchain/ollama";
import { StateType } from "../graph/state";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";

@Injectable()
export class ReporterAgent {
  constructor(
    @Inject("LLM_MODEL") private readonly model: ChatOllama,
    @InjectPinoLogger(ReporterAgent.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(state: StateType): Promise<Partial<StateType>> {
    this.logger.info("📝 Шаг: Reporter — формирование отчета...");

    if (!state.research || state.research.length === 0) {
      this.logger.info("📝 Шаг: Reporter — research пустой");
      return {
        report: JSON.stringify({
          summary: "Ошибка: данные не найдены.",
          sections: [],
          conclusion: "Поиск не дал результатов. Проверьте поисковые запросы.",
        }),
      };
    }

    const context = state.research
      .flatMap((r: any) => {
        // Если r.results существует — берем его, иначе пробуем сам r как массив или объект
        const items = r.results || (Array.isArray(r) ? r : [r]);

        return items.map((item: any) => {
          // Извлекаем контент, обращая внимание на структуру Tavily
          const text =
            item.content ||
            (typeof item === "string" ? item : JSON.stringify(item));
          const result = `Источник: ${item.title || "Без названия"}\nТекст: ${text}`;
          return result;
        });
      })
      .join("\n---\n")
      .slice(0, 15000);

    const prompt = `
      Ты — технический аналитик. Твоя задача: превратить массив данных в структурированные тезисы.
      ОТВЕТ ОБЯЗАТЕЛЬНО НА русском языке.
КОНТЕКСТ ДЛЯ АНАЛИЗА:
${context}

ПРАВИЛА ОТВЕТА (JSON):
1. Весь ответ должен быть СТРОГИМ JSON-объектом.
2. Внутри строковых значений используй только экранированные кавычки (\\") и символы переноса строки (\\\\n).
3. Пиши максимально СУХИМИ ФАКТАМИ. Избегай вступлений и вежливых фраз.

СТРУКТУРА:
{
  "summary": "Суть исследования одним предложением.",
  "sections": [
    {
      "title": "Заголовок (макс. 3 слова)",
      "points": [
        "Тезис 1 (коротко)",
        "Тезис 2 (коротко)",
        "Тезис 3 (коротко)"
      ]
    }
  ],
  "conclusion": "Главный вывод."
}

ОГРАНИЧЕНИЯ:
- Максимум 3 раздела (sections).
- Ровно 3 тезиса (points) в каждом разделе.
      `;

    const response = await this.model.invoke(prompt);

    const reportText = response.content.toString();
    this.logger.info(`✅ Отчет готов (${reportText.length} симв.)`);
    return {
      report: reportText,
    };
  }
}
