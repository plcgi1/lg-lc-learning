import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOllama } from "@langchain/ollama";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { TavilyService } from "../../tools/tavily.service";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { AppConfig } from "../../config/interfaces/config.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { createHash } from "crypto";
import { StateType } from "../graph/state";

@Injectable()
export class ResearcherAgent {
  constructor(
    private readonly tavilyService: TavilyService,
    @Inject("LLM_MODEL") private readonly model: ChatOllama,
    @InjectPinoLogger(ResearcherAgent.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(state: StateType) {
    console.info("📝 Шаг: ResearcherAgent — получение данных...", state);

    const sysPrompt = new SystemMessage(`Ты — поисковый ассистент. 
Твоя единственная цель: генерировать короткие поисковые запросы для Google.
ЗАПРЕЩЕНО: давать ответы на вопросы, писать пояснения, использовать полные предложения.
ФОРМАТ ОТВЕТА: СТРОГО JSON {"results": ["запрос1", "запрос2", "запрос3"]}
ПРИМЕР: {"results": ["физиология дыхания китов", "емкость легких человека", "газообмен млекопитающих"]}
`);

    const userPrompt =
      new HumanMessage(`Сгенерируй 3 коротких (до 5 слов) поисковых запроса для изучения темы: "${state.task}"
${state.feedback ? `Учти критику: ${state.feedback}` : ""}
Пиши только поисковые фразы.`);
    const parser = new JsonOutputParser<string[]>();

    const queries = await this.model
      .pipe(parser)
      .invoke([sysPrompt, userPrompt], { signal: AbortSignal.timeout(300000) });

    this.logger.info({ queries }, "🔍 Сгенерированные запросы:");

    // TODO 2. Параллельный поиск
    // TODO const results = await Promise.all(queriesChunks);
    const research = [];
    let index = 0;
    const normalizedQueries = queries["results"]
      .flat(2) // Разворачиваем вложенность, если она появилась
      .map((q) => String(q).trim()) // Превращаем всё в строки
      .filter((q) => q.length > 5); // Убираем пустой мусор

    for (const q of normalizedQueries) {
      const r = await this.tavilyService.search(q);
      research.push(r);
      index++;
    }

    return {
      research, // массив контента
      sources: research.map((r) => r.url), // для счетчика sourcesFound
      queries: queries["results"],
    };
  }
}
