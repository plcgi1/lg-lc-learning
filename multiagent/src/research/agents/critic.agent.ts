import { Injectable, Inject } from "@nestjs/common";
import { ChatOllama } from "@langchain/ollama";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { StateType } from "../graph/state";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";

@Injectable()
export class CriticAgent {
  constructor(
    @Inject("LLM_MODEL") private readonly model: ChatOllama,
    @InjectPinoLogger(CriticAgent.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(state: StateType): Promise<Partial<StateType>> {
    this.logger.info("📝 Шаг: CriticAgent — критика...");

    const parser = new JsonOutputParser<any>();

    const sysPrompt = `Ты — строгий научный критик. Твоя задача — проверить отчет на точность и полноту.
    ОТВЕТ ОБЯЗАТЕЛЬНО НА русском языке.
    ПРАВИЛА ОЦЕНКИ:
    1. Оценивай по шкале от 1 до 10.
    2. Если score < 8, обязательно укажи, что нужно исправить.
    3. Пиши СУХО и только по делу.

    СТРОГИЙ ФОРМАТ JSON:
    {
      "score": number,
      "critique": "краткое перечисление недостатков или 'OK'"
    }`;

    const userPrompt = `
    ОРИГИНАЛЬНОЕ ЗАДАНИЕ: ${state.task}
    
    СГЕНЕРИРОВАННЫЙ ОТЧЕТ:
    ${JSON.stringify(state.report)}
    
    Проверь соответствие тезисов заданию.`;

    try {
      const response = await this.model.pipe(parser).invoke([
        ["system", sysPrompt],
        ["human", userPrompt],
      ]);

      console.log(`[Critic] Score: ${response.score}`);

      // Возвращаем строго в соответствии с StateType
      return {
        score: Number(response.score),
        feedback: String(response.critique),
        iterations: (state.iterations || 0) + 1,
      };
    } catch (error) {
      this.logger.error({ error }, "Critic parsing error, returning fallback");
      // Возвращаем плоский объект, а не вложенный
      return {
        score: 1,
        feedback:
          "Ошибка парсинга ответа критика. Требуется повторная проверка.",
        iterations: (state.iterations || 0) + 1,
      };
    }
  }
}
